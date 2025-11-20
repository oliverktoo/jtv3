import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { createServer } from 'http';
import { EnterpriseWebSocketServer } from './EnterpriseWebSocketServer.js';
import { AdvancedFixtureGenerator, FixtureOptimizer, AdvancedStandingsEngine } from './fixture-engine.mjs';
import { 
  checkFixtureLock, 
  checkMatchModifiable,
  executeWithRollback,
  createBulkInsertOperation 
} from './fixture-locking.mjs';
import {
  asyncHandler,
  errorHandler,
  requestLogger,
  rateLimit,
  sendSuccess,
  sendError,
  ValidationError,
  NotFoundError,
  ForbiddenError
} from './api-middleware.mjs';

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// Request logging
app.use(requestLogger);

// Rate limiting - 100 requests per minute per IP
app.use(rateLimit({
  windowMs: 60000,
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later'
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176', 
    'http://localhost:5177',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    'http://127.0.0.1:5177'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Supabase Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    console.log('🏥 Health check requested');
    
    // Test Supabase connection
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Supabase connection successful');
    
    res.json({
      status: 'healthy',
      database: 'supabase-connected',
      timestamp: new Date().toISOString(),
      message: 'Server is running and connected to Supabase',
      organizationCount: data ? data.length : 0
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'error',
      database: 'supabase-error',
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error'
    });
  }
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, organizationName, role } = req.body;
    
    console.log('📝 Signup request for:', email);
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !organizationName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    // Create organization first
    // Generate unique slug from organization name + timestamp
    const baseSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Date.now()}`;
    
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: organizationName,
        slug: slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (orgError) {
      console.error('❌ Organization creation error:', orgError);
      throw orgError;
    }
    
    // Create user (password should be hashed in production)
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        email,
        first_name: firstName,
        last_name: lastName,
        profile_image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (userError) {
      console.error('❌ User creation error:', userError);
      throw userError;
    }
    
    // Create user role
    const { error: roleError } = await supabase
      .from('user_organization_roles')
      .insert([{
        user_id: user.id,
        org_id: org.id,
        role: role || 'ORG_ADMIN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    if (roleError) {
      console.error('❌ Role creation error:', roleError);
      throw roleError;
    }
    
    console.log('✅ User created successfully:', user.id);
    
    res.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Signup failed'
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login request for:', email);
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // TODO: In production, verify password hash
    // For now, we'll just accept any password for development
    
    // Get user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_organization_roles')
      .select('*')
      .eq('user_id', user.id);
    
    if (rolesError) {
      console.error('❌ Roles fetch error:', rolesError);
      throw rolesError;
    }
    
    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    console.log('✅ Login successful for:', email);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: roles || [],
        currentOrgId: roles && roles.length > 0 ? roles[0].org_id : null
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  try {
    // In a real implementation, invalidate the token
    console.log('👋 Logout request');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Logout failed'
    });
  }
});

// Check if email exists (MUST be before /:userId route)
app.get('/api/users/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    console.log(`📧 Checking email: ${email}`);

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      throw userError;
    }

    // Fetch user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_organization_roles')
      .select(`
        id,
        role,
        org_id,
        organizations (
          id,
          name
        )
      `)
      .eq('user_id', user.id);

    if (rolesError) throw rolesError;

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isSuperAdmin: user.is_super_admin || false,
      createdAt: user.created_at,
      roles: userRoles.map(ur => ({
        id: ur.id,
        role: ur.role,
        orgId: ur.org_id,
        organization: ur.organizations
      }))
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('❌ Email check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Make user super admin (MUST be before /:userId route)
app.post('/api/users/make-super-admin', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`👑 Making super admin: ${email}`);

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update({ is_super_admin: true })
      .eq('email', email)
      .select();

    if (error) {
      console.error('Update error:', error);
      throw error;
    }

    if (!updated || updated.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`✅ User ${email} is now SUPER ADMIN`);
    res.json({
      success: true,
      data: updated[0],
      message: 'User successfully promoted to super admin'
    });
  } catch (error) {
    console.error('❌ Super admin promotion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== ADMIN MANAGEMENT ENDPOINTS =====

// Create new admin
app.post('/api/admin/create', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, organizationName, isSuperAdmin } = req.body;
    console.log('👨‍💼 Creating new admin:', { email, role, organizationName });

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role || !organizationName) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email);

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create organization slug
    const baseSlug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug: uniqueSlug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (orgError) {
      console.error('Organization creation error:', orgError);
      throw new Error('Failed to create organization');
    }

    if (!organization || organization.length === 0) {
      throw new Error('Organization creation failed - no data returned');
    }

    const org = organization[0];

    // Create user (password should be hashed in production)
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        profile_image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (userError) {
      console.error('User creation error:', userError);
      throw new Error(`Failed to create user: ${userError.message || JSON.stringify(userError)}`);
    }

    if (!user || user.length === 0) {
      throw new Error('User creation failed - no data returned');
    }

    const newUser = user[0];

    // Create user role
    const { error: roleError } = await supabase
      .from('user_organization_roles')
      .insert({
        user_id: newUser.id,
        org_id: org.id,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      throw new Error('Failed to assign role');
    }

    console.log('✅ Admin created successfully:', newUser.email);

    res.json({
      success: true,
      data: {
        user: newUser,
        organization: org,
        role
      },
      message: 'Admin created successfully'
    });
  } catch (error) {
    console.error('❌ Admin creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List all admins
app.get('/api/admin/list', async (req, res) => {
  try {
    console.log('📋 Fetching admin list');

    // Fetch all user-organization roles with joins
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_organization_roles')
      .select(`
        role,
        created_at,
        user_id,
        org_id
      `);

    if (rolesError) {
      console.error('Roles fetch error:', rolesError);
      throw rolesError;
    }

    if (!userRoles || userRoles.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Fetch users and organizations separately
    const userIds = [...new Set(userRoles.map(ur => ur.user_id))];
    const orgIds = [...new Set(userRoles.map(ur => ur.org_id).filter(id => id !== null))];

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, is_super_admin, created_at')
      .in('id', userIds);

    if (usersError) {
      console.error('Users fetch error:', usersError);
      throw usersError;
    }

    // Only fetch orgs if there are non-null org IDs
    let orgs = [];
    if (orgIds.length > 0) {
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .in('id', orgIds);

      if (orgsError) {
        console.error('Orgs fetch error:', orgsError);
        throw orgsError;
      }
      orgs = orgsData || [];
    }

    // Create lookup maps
    const userMap = new Map(users.map(u => [u.id, u]));
    const orgMap = new Map(orgs.map(o => [o.id, o]));

    // Transform data
    const admins = userRoles
      .map(ur => {
        const user = userMap.get(ur.user_id);
        const org = ur.org_id ? orgMap.get(ur.org_id) : null;
        
        if (!user) return null;
        
        return {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: ur.role,
          organizationName: org ? org.name : 'Platform-wide',
          isSuperAdmin: user.is_super_admin,
          createdAt: user.created_at
        };
      })
      .filter(admin => admin !== null);

    console.log(`✅ Found ${admins.length} admins`);

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('❌ Admin list error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update admin role
app.put('/api/admin/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, orgId } = req.body;
    console.log('🔄 Updating admin role:', { id, role, orgId });

    const { data, error } = await supabase
      .from('user_organization_roles')
      .update({
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', id)
      .eq('org_id', orgId)
      .select();

    if (error) throw error;

    console.log('✅ Role updated successfully');

    res.json({
      success: true,
      data,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('❌ Role update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Deactivate admin
app.delete('/api/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deactivating admin:', id);

    // Delete user roles (soft delete would be better in production)
    const { error } = await supabase
      .from('user_organization_roles')
      .delete()
      .eq('user_id', id);

    if (error) throw error;

    console.log('✅ Admin deactivated successfully');

    res.json({
      success: true,
      message: 'Admin deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Admin deactivation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// TOURNAMENT ADMIN REQUEST ENDPOINTS
// ============================================

// Create tournament admin request (user requests to become admin of a tournament)
app.post('/api/admin-requests/create', async (req, res) => {
  try {
    const { userId, tournamentId, requestMessage } = req.body;
    console.log('📝 Creating tournament admin request:', { userId, tournamentId });

    // Validate required fields
    if (!userId || !tournamentId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Tournament ID are required'
      });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if tournament exists
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name, org_id')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return res.status(404).json({
        success: false,
        error: 'Tournament not found'
      });
    }

    // Check if user already has a pending or approved request for this tournament
    const { data: existingRequest, error: existingError } = await supabase
      .from('tournament_admin_requests')
      .select('id, status')
      .eq('user_id', userId)
      .eq('tournament_id', tournamentId)
      .in('status', ['PENDING', 'APPROVED']);

    if (existingError) throw existingError;

    if (existingRequest && existingRequest.length > 0) {
      const status = existingRequest[0].status;
      return res.status(400).json({
        success: false,
        error: `You already have a ${status.toLowerCase()} request for this tournament`
      });
    }

    // Check if user is already an admin of this tournament
    const { data: existingRole, error: roleError } = await supabase
      .from('user_organization_roles')
      .select('id, role')
      .eq('user_id', userId)
      .eq('org_id', tournament.org_id)
      .eq('role', 'ORG_ADMIN');

    if (roleError) throw roleError;

    if (existingRole && existingRole.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You are already an admin of this tournament'
      });
    }

    // Create the request
    const { data: request, error: insertError } = await supabase
      .from('tournament_admin_requests')
      .insert({
        user_id: userId,
        tournament_id: tournamentId,
        status: 'PENDING',
        request_message: requestMessage || null
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('✅ Tournament admin request created:', request.id);

    res.json({
      success: true,
      data: request,
      message: 'Request submitted successfully. You will receive an email once reviewed.'
    });
  } catch (error) {
    console.error('❌ Admin request creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all tournament admin requests (for super admin)
app.get('/api/admin-requests/list', async (req, res) => {
  try {
    const { status } = req.query; // Optional filter by status
    console.log('📋 Fetching tournament admin requests:', { status });

    let query = supabase
      .from('tournament_admin_requests')
      .select(`
        id,
        user_id,
        tournament_id,
        status,
        request_message,
        rejection_reason,
        reviewed_by,
        reviewed_at,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error: requestsError } = await query;

    if (requestsError) throw requestsError;

    // Fetch user and tournament details for each request
    const enrichedRequests = await Promise.all(requests.map(async (request) => {
      // Get user details
      const { data: user } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('id', request.user_id)
        .single();

      // Get tournament details
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('id, name, season')
        .eq('id', request.tournament_id)
        .single();

      // Get reviewer details if reviewed
      let reviewer = null;
      if (request.reviewed_by) {
        const { data: reviewerData } = await supabase
          .from('users')
          .select('id, email, first_name, last_name')
          .eq('id', request.reviewed_by)
          .single();
        reviewer = reviewerData;
      }

      return {
        ...request,
        user,
        tournament,
        reviewer
      };
    }));

    console.log(`✅ Found ${enrichedRequests.length} tournament admin requests`);

    res.json({
      success: true,
      data: enrichedRequests
    });
  } catch (error) {
    console.error('❌ Admin requests list error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's own tournament admin requests
app.get('/api/admin-requests/my-requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📋 Fetching requests for user:', userId);

    const { data: requests, error: requestsError } = await supabase
      .from('tournament_admin_requests')
      .select(`
        id,
        tournament_id,
        status,
        request_message,
        rejection_reason,
        reviewed_at,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    // Enrich with tournament details
    const enrichedRequests = await Promise.all(requests.map(async (request) => {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('id, name, season, start_date, end_date')
        .eq('id', request.tournament_id)
        .single();

      return {
        ...request,
        tournament
      };
    }));

    console.log(`✅ Found ${enrichedRequests.length} requests for user`);

    res.json({
      success: true,
      data: enrichedRequests
    });
  } catch (error) {
    console.error('❌ My requests error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Approve tournament admin request
app.post('/api/admin-requests/approve/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reviewedBy } = req.body; // Super admin's user ID
    console.log('✅ Approving request:', { requestId, reviewedBy });

    // Get the request details
    const { data: request, error: requestError } = await supabase
      .from('tournament_admin_requests')
      .select('id, user_id, tournament_id, status')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot approve request with status: ${request.status}`
      });
    }

    // Get tournament's org_id
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name, org_id')
      .eq('id', request.tournament_id)
      .single();

    if (tournamentError) throw tournamentError;

    // Create the ORG_ADMIN role for the user
    const { data: role, error: roleError } = await supabase
      .from('user_organization_roles')
      .insert({
        user_id: request.user_id,
        org_id: tournament.org_id,
        role: 'ORG_ADMIN'
      })
      .select()
      .single();

    if (roleError) throw roleError;

    // Update the request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('tournament_admin_requests')
      .update({
        status: 'APPROVED',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Request approved and role assigned');

    res.json({
      success: true,
      data: {
        request: updatedRequest,
        role
      },
      message: `User is now the admin of ${tournament.name}`
    });
  } catch (error) {
    console.error('❌ Approve request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reject tournament admin request
app.post('/api/admin-requests/reject/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reviewedBy, rejectionReason } = req.body;
    console.log('❌ Rejecting request:', { requestId, reviewedBy });

    // Get the request details
    const { data: request, error: requestError } = await supabase
      .from('tournament_admin_requests')
      .select('id, status')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot reject request with status: ${request.status}`
      });
    }

    // Update the request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('tournament_admin_requests')
      .update({
        status: 'REJECTED',
        reviewed_by: reviewedBy,
        rejection_reason: rejectionReason || 'No reason provided',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Request rejected');

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Request rejected'
    });
  } catch (error) {
    console.error('❌ Reject request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel tournament admin request (by user)
app.post('/api/admin-requests/cancel/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body; // User who owns the request
    console.log('🚫 Cancelling request:', { requestId, userId });

    // Get the request details
    const { data: request, error: requestError } = await supabase
      .from('tournament_admin_requests')
      .select('id, user_id, status')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Verify ownership
    if (request.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only cancel your own requests'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel request with status: ${request.status}`
      });
    }

    // Update the request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('tournament_admin_requests')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Request cancelled');

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Request cancelled'
    });
  } catch (error) {
    console.error('❌ Cancel request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user data (for token verification)
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`👤 User data requested for: ${userId}`);

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Fetch user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_organization_roles')
      .select(`
        id,
        role,
        org_id,
        organizations (
          id,
          name
        )
      `)
      .eq('user_id', userId);

    if (rolesError) throw rolesError;

    // Construct response with roles
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isSuperAdmin: user.is_super_admin || false,
      roles: userRoles.map(ur => ({
        id: ur.id,
        role: ur.role,
        orgId: ur.org_id,
        organization: ur.organizations
      })),
      currentOrgId: userRoles[0]?.org_id || null
    };

    console.log(`✅ User data retrieved for ${user.email}`);
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('❌ User fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ORGANIZATIONS ====================

// Organizations endpoint
app.get('/api/organizations', async (req, res) => {
  try {
    console.log('📋 Organizations requested');
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(10);
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} organizations`);
    res.json({ data: data || [], success: true });
  } catch (error) {
    console.error('❌ Organizations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Organization stats endpoint
app.get('/api/organizations/:orgId/stats', async (req, res) => {
  try {
    const { orgId } = req.params;
    console.log(`📊 Organization stats requested for: ${orgId}`);
    
    // Get counts for the organization (including nulls for teams since many are independent)
    const [teamsResult, tournamentsResult, playersResult, allTeamsResult] = await Promise.all([
      // Teams belonging to this org
      supabase
        .from('teams')
        .select('id', { count: 'exact' })
        .eq('org_id', orgId),
      // Tournaments belonging to this org  
      supabase
        .from('tournaments')
        .select('id', { count: 'exact' })
        .eq('org_id', orgId),
      // Players registered to this org
      supabase
        .from('player_registry')
        .select('id', { count: 'exact' })
        .eq('org_id', orgId),
      // All teams (including independent ones for reference)
      supabase
        .from('teams')
        .select('id', { count: 'exact' })
    ]);
    
    const stats = {
      totalTeams: teamsResult.count || 0,
      totalTournaments: tournamentsResult.count || 0,
      totalPlayers: playersResult.count || 0,
      completedMatches: 0, // TODO: Add matches count when matches table exists
      totalDocuments: 0, // TODO: Add documents count when documents table exists
      // Additional context
      allTeamsInSystem: allTeamsResult.count || 0,
      independentTeams: (allTeamsResult.count || 0) - (teamsResult.count || 0)
    };
    
    console.log(`✅ Organization stats:`, stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Organization stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Tournaments endpoint
app.get('/api/tournaments', async (req, res) => {
  try {
    console.log('🏆 Tournaments requested');
    const { status, limit } = req.query;
    
    let query = supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter by status if provided (supports comma-separated values)
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      query = query.in('status', statuses);
    }
    
    // Apply limit if specified, otherwise return all
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} tournaments`);
    res.json({ data: data || [], success: true });
  } catch (error) {
    console.error('❌ Tournaments error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Teams endpoint (for frontend compatibility)
app.get('/api/teams', async (req, res) => {
  try {
    console.log('👥 Teams requested (frontend compatibility)');
    
    const { data, error } = await supabase
      .from('teams')
      .select('*, organizations(id, name, slug)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} teams for frontend`);
    
    // Return in the format the frontend expects (direct array, not wrapped in data object)
    res.json(data || []);
  } catch (error) {
    console.error('❌ Teams error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// All tournaments with organization info
app.get('/api/tournaments/all', async (req, res) => {
  try {
    console.log('🏆 All tournaments requested');
    
    const { data, error } = await supabase
      .from('tournaments')
      .select('*, organizations(id, name, slug), sports(id, name, slug)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} tournaments across all organizations`);
    res.json({ data: data || [], success: true });
  } catch (error) {
    console.error('❌ All tournaments error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Team registrations endpoint
app.get('/api/tournaments/:tournamentId/team-registrations', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log(`👥 Team registrations requested for tournament: ${tournamentId}`);
    
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .select('*, teams(id, name, code, logo_url)')
      .eq('tournament_id', tournamentId);
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} team registrations`);
    res.json({ data: data || [], success: true });
  } catch (error) {
    console.error('❌ Team registrations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Tournament matches endpoint
app.get('/api/tournaments/:tournamentId/matches', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log(`⚽ Matches requested for tournament: ${tournamentId}`);
    
    // Query matches through the correct relationship: matches → rounds → stages → tournaments
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(id, name, code),
        away_team:teams!away_team_id(id, name, code),
        rounds!inner(
          id,
          number,
          name,
          stages!inner(
            id,
            name,
            tournament_id
          )
        )
      `)
      .eq('rounds.stages.tournament_id', tournamentId)
      .order('kickoff', { ascending: true });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} matches for tournament ${tournamentId}`);
    res.json({ data: data || [], success: true });
  } catch (error) {
    console.error('❌ Tournament matches error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Tournament players endpoint
app.get('/api/tournaments/:tournamentId/players', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log(`👤 Players requested for tournament: ${tournamentId}`);
    
    // Get all teams in tournament first
    const { data: tournamentTeams, error: teamsError } = await supabase
      .from('tournament_teams')
      .select('team_id, teams(id, name, code)')
      .eq('tournament_id', tournamentId);
    
    if (teamsError) throw teamsError;
    
    // Get all players for these teams using simple queries
    const players = [];
    if (tournamentTeams && tournamentTeams.length > 0) {
      const teamIds = tournamentTeams.map(tt => tt.team_id);
      
      // Simple query for team players
      const { data: teamPlayers, error: playersError } = await supabase
        .from('team_players')
        .select('team_id, upid, player_registry(id, first_name, last_name, photo_path)')
        .in('team_id', teamIds);
      
      if (!playersError && teamPlayers) {
        teamPlayers.forEach(tp => {
          if (tp.player_registry) {
            const team = tournamentTeams.find(tt => tt.team_id === tp.team_id)?.teams;
            players.push({
              ...tp.player_registry,
              team: team || { id: tp.team_id, name: 'Unknown Team', code: 'UNK' }
            });
          }
        });
      }
    }
    
    console.log(`✅ Found ${players.length} players`);
    res.json({ data: players, success: true });
  } catch (error) {
    console.error('❌ Tournament players error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Tournament groups endpoint
app.get('/api/tournaments/:tournamentId/groups', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log(`🏟️ Groups requested for tournament: ${tournamentId}`);
    
    // Step 1: Get stages for this tournament
    const { data: stagesData, error: stagesError } = await supabase
      .from('stages')
      .select('id, name, stage_type, seq')
      .eq('tournament_id', tournamentId);
    
    if (stagesError) {
      console.error('❌ Error fetching stages:', stagesError);
      return res.json({ data: [], success: true, message: 'No stages found' });
    }
    
    if (!stagesData || stagesData.length === 0) {
      console.log('ℹ️ No stages found for tournament, returning empty groups');
      return res.json({ data: [], success: true });
    }
    
    const stageIds = stagesData.map(stage => stage.id);
    console.log(`✅ Found ${stageIds.length} stages for tournament`);
    
    // Step 2: Get groups for these stages with team assignments
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select(`
        id,
        stage_id,
        division_id,
        name,
        seq,
        venue,
        created_at,
        team_groups(
          id,
          team_id,
          teams(id, name, club_name, logo_url)
        )
      `)
      .in('stage_id', stageIds)
      .order('seq', { ascending: true });
    
    if (groupsError) {
      console.error('❌ Error fetching groups:', groupsError);
      return res.json({ data: [], success: true, message: 'Groups query failed' });
    }
    
    console.log(`✅ Found ${groupsData?.length || 0} groups with team assignments`);
    res.json({ data: groupsData || [], success: true });
    
  } catch (error) {
    console.error('❌ Tournament groups error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Get all rounds for a tournament
app.get('/api/tournaments/:tournamentId/rounds', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log(`📋 Fetching rounds for tournament: ${tournamentId}`);

    // Get all stages for this tournament
    const { data: stages, error: stagesError } = await supabase
      .from('stages')
      .select('id')
      .eq('tournament_id', tournamentId);

    if (stagesError) throw stagesError;

    if (!stages || stages.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const stageIds = stages.map(s => s.id);

    // Get all rounds for these stages
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select(`
        *,
        stage:stages(id, name, stage_type),
        group:groups(id, name)
      `)
      .in('stage_id', stageIds)
      .order('number', { ascending: true });

    if (roundsError) throw roundsError;

    console.log(`✅ Found ${rounds?.length || 0} rounds`);
    res.json({ success: true, data: rounds || [] });

  } catch (error) {
    console.error('❌ Error fetching rounds:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create tournament group
app.post('/api/tournaments/:tournamentId/groups', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { name, seq, venue } = req.body;
    
    console.log(`📝 Creating group "${name}" for tournament ${tournamentId}`, venue ? `at venue: ${venue}` : '');
    
    // Step 1: Get or create default stage for this tournament
    const { data: existingStages, error: stagesError } = await supabase
      .from('stages')
      .select('id, name')
      .eq('tournament_id', tournamentId)
      .limit(1);
    
    let stageId;
    
    if (!existingStages || existingStages.length === 0) {
      // Create default stage
      console.log('📋 Creating default stage for tournament');
      const { data: newStage, error: createStageError } = await supabase
        .from('stages')
        .insert({
          tournament_id: tournamentId,
          name: 'Main Stage',
          stage_type: 'GROUP',
          seq: 1
        })
        .select()
        .single();
      
      if (createStageError) {
        console.error('❌ Error creating stage:', createStageError);
        throw createStageError;
      }
      
      stageId = newStage.id;
      console.log(`✅ Created default stage: ${stageId}`);
    } else {
      stageId = existingStages[0].id;
      console.log(`✅ Using existing stage: ${stageId}`);
    }
    
    // Step 2: Create the group with venue
    const groupData = {
      stage_id: stageId,
      name: name,
      seq: seq
    };
    
    if (venue) {
      groupData.venue = venue;
    }
    
    const { data: newGroup, error: groupError } = await supabase
      .from('groups')
      .insert(groupData)
      .select()
      .single();
    
    if (groupError) {
      console.error('❌ Error creating group:', groupError);
      throw groupError;
    }
    
    console.log(`✅ Created group: ${newGroup.name} (ID: ${newGroup.id})${newGroup.venue ? ` at ${newGroup.venue}` : ''}`);
    res.status(201).json({ data: newGroup, success: true });
    
  } catch (error) {
    console.error('❌ Create group error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create group'
    });
  }
});

// Update group
app.put('/api/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, venue } = req.body;
    
    console.log(`✏️ Updating group ${groupId}`, name ? `to name: ${name}` : '', venue !== undefined ? `venue: ${venue || 'none'}` : '');
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (venue !== undefined) updateData.venue = venue;
    
    const { data: updatedGroup, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', groupId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating group:', error);
      throw error;
    }
    
    if (!updatedGroup) {
      return res.status(404).json({ 
        success: false, 
        error: 'Group not found' 
      });
    }
    
    console.log(`✅ Updated group: ${updatedGroup.name}${updatedGroup.venue ? ` at ${updatedGroup.venue}` : ''}`);
    res.json({ data: updatedGroup, success: true });
    
  } catch (error) {
    console.error('❌ Update group error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update group'
    });
  }
});

// Delete group
app.delete('/api/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    console.log(`🗑️ Deleting group ${groupId}`);
    
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
    
    if (error) {
      console.error('❌ Error deleting group:', error);
      throw error;
    }
    
    console.log(`✅ Deleted group ${groupId}`);
    res.status(204).send();
    
  } catch (error) {
    console.error('❌ Delete group error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete group'
    });
  }
});

// Assign team to group
app.post('/api/team-groups', async (req, res) => {
  try {
    const { teamId, groupId } = req.body;
    
    console.log(`👥 Assigning team ${teamId} to group ${groupId}`);
    
    // Check if team is already in this group
    const { data: existing } = await supabase
      .from('team_groups')
      .select('id')
      .eq('team_id', teamId)
      .eq('group_id', groupId)
      .single();
    
    if (existing) {
      console.log('ℹ️ Team already assigned to this group');
      return res.json({ data: existing, success: true, message: 'Already assigned' });
    }
    
    // Create the assignment
    const { data: teamGroup, error } = await supabase
      .from('team_groups')
      .insert({
        team_id: teamId,
        group_id: groupId
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error assigning team to group:', error);
      throw error;
    }
    
    console.log(`✅ Assigned team to group: ${teamGroup.id}`);
    res.status(201).json({ data: teamGroup, success: true });
    
  } catch (error) {
    console.error('❌ Assign team error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to assign team to group'
    });
  }
});

// Remove team from group
app.delete('/api/team-groups/:teamGroupId', async (req, res) => {
  try {
    const { teamGroupId } = req.params;
    
    console.log(`🗑️ Removing team-group assignment ${teamGroupId}`);
    
    const { error } = await supabase
      .from('team_groups')
      .delete()
      .eq('id', teamGroupId);
    
    if (error) {
      console.error('❌ Error removing team from group:', error);
      throw error;
    }
    
    console.log(`✅ Removed team-group assignment ${teamGroupId}`);
    res.status(204).send();
    
  } catch (error) {
    console.error('❌ Remove team error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove team from group'
    });
  }
});

// ============================================================================
// STAGES ENDPOINTS - Tournament Stage Management
// ============================================================================

// Get all stages for a tournament
app.get('/api/tournaments/:tournamentId/stages', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    console.log(`📋 Fetching stages for tournament ${tournamentId}`);
    
    const { data: stages, error } = await supabase
      .from('stages')
      .select(`
        *,
        groups:groups(count)
      `)
      .eq('tournament_id', tournamentId)
      .order('seq', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching stages:', error);
      throw error;
    }
    
    console.log(`✅ Found ${stages?.length || 0} stages`);
    res.json({ 
      data: stages || [], 
      success: true 
    });
    
  } catch (error) {
    console.error('❌ Fetch stages error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stages'
    });
  }
});

// Get single stage by ID
app.get('/api/stages/:stageId', async (req, res) => {
  try {
    const { stageId } = req.params;
    
    console.log(`📋 Fetching stage ${stageId}`);
    
    const { data: stage, error } = await supabase
      .from('stages')
      .select(`
        *,
        tournament:tournaments(id, name, status),
        groups:groups(
          id,
          name,
          seq,
          venue,
          team_count:team_groups(count)
        )
      `)
      .eq('id', stageId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching stage:', error);
      throw error;
    }
    
    if (!stage) {
      return res.status(404).json({
        success: false,
        error: 'Stage not found'
      });
    }
    
    console.log(`✅ Found stage: ${stage.name}`);
    res.json({ 
      data: stage, 
      success: true 
    });
    
  } catch (error) {
    console.error('❌ Fetch stage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stage'
    });
  }
});

// Create a new stage
app.post('/api/tournaments/:tournamentId/stages', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { name, stageType, seq } = req.body;
    
    if (!name || !stageType) {
      return res.status(400).json({
        success: false,
        error: 'Name and stage type are required'
      });
    }
    
    // Validate stage type
    const validStageTypes = ['LEAGUE', 'GROUP', 'KNOCKOUT'];
    if (!validStageTypes.includes(stageType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid stage type. Must be one of: ${validStageTypes.join(', ')}`
      });
    }
    
    console.log(`📝 Creating ${stageType} stage "${name}" for tournament ${tournamentId}`);
    
    // If no sequence provided, get next available
    let stageSeq = seq;
    if (stageSeq === undefined || stageSeq === null) {
      const { data: existingStages } = await supabase
        .from('stages')
        .select('seq')
        .eq('tournament_id', tournamentId)
        .order('seq', { ascending: false })
        .limit(1);
      
      stageSeq = existingStages && existingStages.length > 0 
        ? existingStages[0].seq + 1 
        : 1;
    }
    
    const { data: newStage, error } = await supabase
      .from('stages')
      .insert({
        tournament_id: tournamentId,
        name,
        stage_type: stageType,
        seq: stageSeq
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating stage:', error);
      throw error;
    }
    
    console.log(`✅ Created stage: ${newStage.name} (${newStage.stage_type})`);
    res.status(201).json({ 
      data: newStage, 
      success: true 
    });
    
  } catch (error) {
    console.error('❌ Create stage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create stage'
    });
  }
});

// Update a stage
app.put('/api/stages/:stageId', async (req, res) => {
  try {
    const { stageId } = req.params;
    const { name, stageType, seq } = req.body;
    
    console.log(`✏️ Updating stage ${stageId}`);
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (stageType !== undefined) {
      // Validate stage type
      const validStageTypes = ['LEAGUE', 'GROUP', 'KNOCKOUT'];
      if (!validStageTypes.includes(stageType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid stage type. Must be one of: ${validStageTypes.join(', ')}`
        });
      }
      updateData.stage_type = stageType;
    }
    if (seq !== undefined) updateData.seq = seq;
    
    const { data: updatedStage, error } = await supabase
      .from('stages')
      .update(updateData)
      .eq('id', stageId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating stage:', error);
      throw error;
    }
    
    if (!updatedStage) {
      return res.status(404).json({ 
        success: false, 
        error: 'Stage not found' 
      });
    }
    
    console.log(`✅ Updated stage: ${updatedStage.name}`);
    res.json({ 
      data: updatedStage, 
      success: true 
    });
    
  } catch (error) {
    console.error('❌ Update stage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update stage'
    });
  }
});

// Delete a stage
app.delete('/api/stages/:stageId', async (req, res) => {
  try {
    const { stageId } = req.params;
    
    console.log(`🗑️ Deleting stage ${stageId}`);
    
    // Check if stage has groups
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id')
      .eq('stage_id', stageId)
      .limit(1);
    
    if (groupsError) {
      console.error('❌ Error checking stage groups:', groupsError);
      throw groupsError;
    }
    
    if (groups && groups.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete stage with existing groups. Delete groups first.'
      });
    }
    
    const { error } = await supabase
      .from('stages')
      .delete()
      .eq('id', stageId);
    
    if (error) {
      console.error('❌ Error deleting stage:', error);
      throw error;
    }
    
    console.log(`✅ Deleted stage ${stageId}`);
    res.status(204).send();
    
  } catch (error) {
    console.error('❌ Delete stage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete stage'
    });
  }
});


// All teams endpoint
app.get('/api/teams/all', async (req, res) => {
  try {
    console.log('👥 All teams requested');
    
    const { data, error } = await supabase
      .from('teams')
      .select('*, organizations(id, name, slug)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} teams (including independent teams)`);
    res.json({ data: data || [], success: true });
  } catch (error) {
    console.error('❌ All teams error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Team CRUD operations
// Create team (independent)
app.post('/api/teams', async (req, res) => {
  try {
    console.log('🆕 Creating new team:', req.body);
    
    const { data, error } = await supabase
      .from('teams')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Team created: ${data.name} (${data.id})`);
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ Create team error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Update team
app.patch('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Updating team ${id}:`, req.body);
    
    // First check if team exists
    const { data: existingTeam, error: checkError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (checkError || !existingTeam) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    // Update the team
    const { data, error } = await supabase
      .from('teams')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Team updated: ${data.name} (${id})`);
    res.json(data);
  } catch (error) {
    console.error('❌ Update team error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Delete team
app.delete('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting team: ${id}`);
    
    // First check if team exists
    const { data: existingTeam, error: checkError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (checkError || !existingTeam) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    // Delete the team
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    console.log(`✅ Team deleted: ${existingTeam.name} (${id})`);
    res.json({ 
      success: true, 
      message: `Team "${existingTeam.name}" deleted successfully` 
    });
  } catch (error) {
    console.error('❌ Delete team error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Global platform stats
app.get('/api/platform/stats', async (req, res) => {
  try {
    console.log('📈 Platform stats requested');
    
    const [orgsResult, tournamentsResult, teamsResult, playersResult] = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact' }),
      supabase.from('tournaments').select('id', { count: 'exact' }),
      supabase.from('teams').select('id', { count: 'exact' }),
      supabase.from('player_registry').select('id', { count: 'exact' })
    ]);
    
    const stats = {
      totalOrganizations: orgsResult.count || 0,
      totalTournaments: tournamentsResult.count || 0,
      totalTeams: teamsResult.count || 0,
      totalPlayers: playersResult.count || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Platform stats:`, stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Platform stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Validation function for administrative area requirements
function validateAdministrativeArea(tournamentData) {
  const { tournament_model, county_id, sub_county_id, ward_id } = tournamentData;
  
  // Administrative area requirements based on tournament model
  if (tournament_model === 'ADMINISTRATIVE_WARD') {
    if (!ward_id) return { valid: false, error: 'Ward selection is required for ward-level tournaments' };
    if (!sub_county_id) return { valid: false, error: 'Sub-county selection is required for ward-level tournaments' };
    if (!county_id) return { valid: false, error: 'County selection is required for ward-level tournaments' };
  }
  
  if (tournament_model === 'ADMINISTRATIVE_SUB_COUNTY') {
    if (!sub_county_id) return { valid: false, error: 'Sub-county selection is required for sub-county tournaments' };
    if (!county_id) return { valid: false, error: 'County selection is required for sub-county tournaments' };
  }
  
  if (tournament_model === 'ADMINISTRATIVE_COUNTY') {
    if (!county_id) return { valid: false, error: 'County selection is required for county-level tournaments' };
  }
  
  if (tournament_model === 'INTER_COUNTY') {
    if (!county_id) return { valid: false, error: 'County selection is required for inter-county tournaments' };
  }
  
  return { valid: true };
}

// CREATE Tournament
app.post('/api/tournaments', async (req, res) => {
  try {
    console.log('🆕 Create tournament requested:', req.body);
    
    // Validate administrative area requirements
    const validation = validateAdministrativeArea(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    const { data, error } = await supabase
      .from('tournaments')
      .insert([req.body])
      .select('*, organizations(id, name, slug), sports(id, name, slug)')
      .single();
    
    if (error) throw error;
    
    console.log('✅ Tournament created:', data.id);
    res.status(201).json({ data, success: true });
  } catch (error) {
    console.error('❌ Create tournament error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// UPDATE Tournament
app.put('/api/tournaments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Update tournament ${id} requested:`, req.body);
    
    // Validate administrative area requirements if tournament_model is being changed
    if (req.body.tournament_model) {
      const validation = validateAdministrativeArea(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }
    }
    
    const { data, error } = await supabase
      .from('tournaments')
      .update(req.body)
      .eq('id', id)
      .select('*, organizations(id, name, slug), sports(id, name, slug)')
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Tournament not found'
      });
    }
    
    console.log('✅ Tournament updated:', data.id);
    res.json({ data, success: true });
  } catch (error) {
    console.error('❌ Update tournament error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// DELETE Tournament
app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Delete tournament ${id} requested`);
    
    // First check if tournament exists
    const { data: existingTournament, error: checkError } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (checkError || !existingTournament) {
      return res.status(404).json({
        success: false,
        error: 'Tournament not found'
      });
    }
    
    // Delete the tournament (cascade deletes will handle related records)
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    console.log(`✅ Tournament deleted: ${existingTournament.name} (${id})`);
    res.json({ 
      success: true, 
      message: `Tournament "${existingTournament.name}" deleted successfully` 
    });
  } catch (error) {
    console.error('❌ Delete tournament error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Players endpoint - Get players by organization
app.get('/api/players', async (req, res) => {
  try {
    const { orgId } = req.query;
    console.log(`🏃 Players requested for org: ${orgId}`);
    
    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: 'orgId is required'
      });
    }
    
    const { data, error } = await supabase
      .from('player_registry')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} players for org ${orgId}`);
    res.json({ data: data || [], success: true });
  } catch (error) {
    console.error('❌ Players error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// All players endpoint
app.get('/api/players/all', async (req, res) => {
  try {
    console.log('🏃 All players requested');
    
    const { data, error } = await supabase
      .from('player_registry')
      .select('*, organizations(id, name, slug)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} players across all organizations`);
    res.json({ data: data || [], success: true });
  } catch (error) {
    console.error('❌ All players error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Get single player by ID or UPID
app.get('/api/players/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🏃 Single player requested: ${id}`);
    
    // Try to find by ID first, then by UPID
    let { data, error } = await supabase
      .from('player_registry')
      .select('*, organizations(id, name, slug)')
      .eq('id', id)
      .single();
    
    // If not found by ID, try UPID
    if (error && error.code === 'PGRST116') {
      const { data: upidData, error: upidError } = await supabase
        .from('player_registry')
        .select('*, organizations(id, name, slug)')
        .eq('upid', id)
        .single();
      
      data = upidData;
      error = upidError;
    }
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Player not found'
        });
      }
      throw error;
    }
    
    console.log(`✅ Player found: ${data.first_name} ${data.last_name} (${data.upid})`);
    res.json({ data, success: true });
  } catch (error) {
    console.error('❌ Single player error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Create new player
app.post('/api/players', async (req, res) => {
  try {
    console.log('🆕 Creating new player:', req.body);
    
    const { data, error } = await supabase
      .from('player_registry')
      .insert([req.body])
      .select('*, organizations(id, name, slug)')
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Player created: ${data.first_name} ${data.last_name} (${data.upid})`);
    res.status(201).json({ data, success: true });
  } catch (error) {
    console.error('❌ Create player error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Update player
app.patch('/api/players/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Updating player ${id}:`, req.body);
    
    // Try to find and update by ID first, then by UPID
    let { data, error } = await supabase
      .from('player_registry')
      .update(req.body)
      .eq('id', id)
      .select('*, organizations(id, name, slug)')
      .single();
    
    // If not found by ID, try UPID
    if (error && error.code === 'PGRST116') {
      const { data: upidData, error: upidError } = await supabase
        .from('player_registry')
        .update(req.body)
        .eq('upid', id)
        .select('*, organizations(id, name, slug)')
        .single();
      
      data = upidData;
      error = upidError;
    }
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Player not found'
        });
      }
      throw error;
    }
    
    console.log(`✅ Player updated: ${data.first_name} ${data.last_name} (${data.upid})`);
    res.json({ data, success: true });
  } catch (error) {
    console.error('❌ Update player error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Player search endpoint
app.get('/api/players/search', async (req, res) => {
  try {
    const { orgId, q } = req.query;
    console.log(`🔍 Player search requested - org: ${orgId}, query: ${q}`);
    
    if (!orgId || !q) {
      return res.status(400).json({
        success: false,
        error: 'orgId and q (search query) are required'
      });
    }
    
    const { data, error } = await supabase
      .from('player_registry')
      .select('*, organizations(id, name, slug)')
      .eq('org_id', orgId)
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,upid.ilike.%${q}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} players matching "${q}" in org ${orgId}`);
    res.json({ data: data || [], success: true });
  } catch (error) {
    console.error('❌ Player search error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// ===== PLAYER REGISTRATION WORKFLOW =====

// Test endpoint to verify our changes are loaded
app.get('/api/player-registration/test', async (req, res) => {
  res.json({ message: 'Player registration endpoints are loaded!', timestamp: new Date().toISOString() });
});

// Start player registration (creates draft entry)
app.post('/api/player-registration/start', async (req, res) => {
  try {
    console.log('🆕 Starting player registration:', req.body);
    
    const { firstName, lastName, dob, sex, email, phone, nationality, wardId, orgId } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !dob || !sex || !email || !phone || !nationality || !orgId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: firstName, lastName, dob, sex, email, phone, nationality, orgId'
      });
    }

    // Generate proper identity hash (similar to existing players)
    const crypto = await import('crypto');
    const identityString = `${orgId}:${email.toLowerCase()}:${phone}:${firstName}:${lastName}`;
    const hashedIdentityKeys = crypto.createHash('sha256').update(identityString).digest('hex');

    // Create draft registration - using actual database field names
    const playerData = {
      hashed_identity_keys: hashedIdentityKeys,
      first_name: firstName,
      last_name: lastName,
      dob: dob,
      sex: sex.toUpperCase(),
      email: email.toLowerCase(),
      phone,
      nationality,
      ward_id: wardId || null,
      org_id: orgId,
      registration_status: 'DRAFT',
      status: 'ACTIVE'
    };

    const { data, error } = await supabase
      .from('player_registry')
      .insert([playerData])
      .select('id, first_name, last_name, email, registration_status, status, created_at')
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Player registration started: ${firstName} ${lastName} (ID: ${data.id})`);
    res.status(201).json({ 
      data: { 
        playerId: data.id, 
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        status: data.status,
        registrationStatus: data.registration_status,
        createdAt: data.created_at
      }, 
      success: true 
    });
  } catch (error) {
    console.error('❌ Start registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

// Submit player registration (mark as submitted)
app.patch('/api/player-registration/:playerId/submit', async (req, res) => {
  try {
    const { playerId } = req.params;
    console.log(`📋 Submitting registration for player: ${playerId}`);
    
    // Update status to submitted
    const { data, error } = await supabase
      .from('player_registry')
      .update({ 
        registration_status: 'SUBMITTED'
      })
      .eq('id', playerId)
      .select('id, first_name, last_name, registration_status')
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Registration submitted for player: ${playerId}`);
    res.json({ 
      data: { 
        playerId: data.id, 
        name: `${data.first_name} ${data.last_name}`,
        registrationStatus: data.registration_status 
      }, 
      success: true 
    });
  } catch (error) {
    console.error('❌ Submit registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Submission failed'
    });
  }
});

// Upload player document (simplified for now - just mock the upload)
app.post('/api/players/:playerId/documents', async (req, res) => {
  try {
    const { playerId } = req.params;
    console.log(`📄 Document upload for player: ${playerId}`);
    
    // For now, just create a mock document entry
    // In production, this would handle actual file upload
    const timestamp = Date.now();
    const documentData = {
      player_upid: playerId,
      document_type: 'identification', // Default for now
      file_url: `mock://documents/${playerId}/${timestamp}.pdf`,
      file_name: `document_${timestamp}.pdf`,
      uploaded_at: new Date().toISOString()
    };

    // Mock successful response without database insertion for now
    console.log(`✅ Document upload mocked for player: ${playerId}`);
    res.status(201).json({ 
      data: documentData, 
      success: true,
      message: 'Document upload simulated successfully'
    });
  } catch (error) {
    console.error('❌ Document upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

// Get player documents
app.get('/api/players/:playerId/documents', async (req, res) => {
  try {
    const { playerId } = req.params;
    console.log(`📄 Getting documents for player: ${playerId}`);
    
    const { data, error } = await supabase
      .from('player_documents')
      .select('*')
      .eq('player_upid', playerId);
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} documents for player: ${playerId}`);
    res.json({ 
      data: data || [], 
      success: true 
    });
  } catch (error) {
    console.error('❌ Get documents error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get documents'
    });
  }
});

// Record consent - Fixed to match actual database schema
app.post('/api/player-registration/:playerId/consent', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { consentType, granted, grantedAt, ipAddress, userAgent } = req.body;
    console.log(`📜 Recording consent for player: ${playerId}, type: ${consentType}`);
    
    // Map frontend consent types to database enum values
    const consentTypeMapping = {
      'playerTermsConsent': 'PLAYER_TERMS',
      'dataProcessingConsent': 'DATA_PROCESSING', 
      'mediaConsent': 'DATA_PROCESSING', // Use DATA_PROCESSING since MEDIA_RELEASE isn't valid
      'guardianConsent': 'GUARDIAN_CONSENT', // Added guardian consent mapping
      'player_terms': 'PLAYER_TERMS',
      'data_processing': 'DATA_PROCESSING',
      'guardian_consent': 'GUARDIAN_CONSENT'
    };
    
    const dbConsentType = consentTypeMapping[consentType] || consentType.toUpperCase();
    console.log(`📜 Mapped consent type: ${consentType} -> ${dbConsentType}`);
    
    if (granted) {
      // Record new consent with actual database structure
      const consentData = {
        upid: playerId,
        consent_type: dbConsentType,
        granted: true,
        granted_at: grantedAt || new Date().toISOString(),
        granted_by: null, // Set to null instead of 'self' since it expects UUID
        ip_address: ipAddress || '127.0.0.1',
        user_agent: userAgent || 'unknown',
        version: 1 // Version of consent
      };

      const { data, error } = await supabase
        .from('player_consents')
        .insert([consentData])
        .select()
        .single();
        
      if (error) throw error;
      
      console.log(`✅ Consent granted for player: ${playerId}, type: ${consentType}`);
      res.status(201).json({ 
        data, 
        success: true,
        message: 'Consent recorded successfully'
      });
    } else {
      // For revocation, we need to update existing consent or insert a new one with granted=false
      const consentData = {
        upid: playerId,
        consent_type: dbConsentType,
        granted: false,
        granted_at: grantedAt || new Date().toISOString(),
        granted_by: null, // Set to null instead of 'self' since it expects UUID
        ip_address: ipAddress || '127.0.0.1',
        user_agent: userAgent || 'unknown',
        version: 1
      };

      const { data, error } = await supabase
        .from('player_consents')
        .insert([consentData])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Consent revoked for player: ${playerId}, type: ${consentType}`);
      res.status(200).json({ 
        data, 
        success: true,
        message: 'Consent revoked successfully'
      });
    }
  } catch (error) {
    console.error('❌ Record consent error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record consent'
    });
  }
});

// Get registration status
app.get('/api/player-registration/:upid/status', async (req, res) => {
  try {
    const { upid } = req.params;
    console.log(`📊 Getting registration status for player: ${upid}`);
    
    const { data, error } = await supabase
      .from('player_registry')
      .select('upid, status, created_at, updated_at')
      .eq('upid', upid)
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Status retrieved for player: ${upid} - ${data.status}`);
    res.json({ 
      data, 
      success: true 
    });
  } catch (error) {
    console.error('❌ Get status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get status'
    });
  }
});

// ===== END PLAYER REGISTRATION WORKFLOW =====

// Get teams registered for a specific tournament
app.get('/api/tournaments/:tournamentId/teams', async (req, res) => {
  try {
    console.log('🏆 Fetching teams for tournament:', req.params.tournamentId);
    
    const { tournamentId } = req.params;
    
    // Query teams registered for this specific tournament
    // This uses team_tournament_registrations table to get only registered teams
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .select(`
        team_id,
        registration_status,
        teams (
          id,
          name,
          code,
          county_id,
          sub_county_id,
          ward_id,
          org_id,
          contact_email,
          contact_phone,
          home_venue,
          club_name,
          organizations (
            id,
            name
          )
        )
      `)
      .eq('tournament_id', tournamentId)
      .eq('registration_status', 'APPROVED'); // Only get approved registrations

    if (error) {
      console.error('❌ Error fetching tournament teams:', error);
      throw error;
    }

    // Transform the data to match expected format
    const tournamentTeams = (data || []).map(registration => ({
      id: registration.teams.id,
      name: registration.teams.name,
      code: registration.teams.code,
      county_id: registration.teams.county_id,
      sub_county_id: registration.teams.sub_county_id,
      ward_id: registration.teams.ward_id,
      org_id: registration.teams.org_id,
      contact_email: registration.teams.contact_email,
      contact_phone: registration.teams.contact_phone,
      home_venue: registration.teams.home_venue,
      club_name: registration.teams.club_name,
      organization: registration.teams.organizations,
      registration_status: registration.registration_status,
      team_id: registration.team_id
    }));

    console.log(`✅ Found ${tournamentTeams.length} registered teams for tournament ${tournamentId}`);
    
    res.json({
      success: true,
      data: tournamentTeams,
      count: tournamentTeams.length,
      tournamentId: tournamentId
    });

  } catch (error) {
    console.error('❌ Tournament teams fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      details: 'Failed to fetch tournament teams'
    });
  }
});

// ========================================
// TOURNAMENT REGISTRATION MANAGEMENT API
// ========================================

// Get all team registrations for a specific tournament (admin view)
app.get('/api/tournaments/:tournamentId/registrations', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { status, search, limit = 50, offset = 0 } = req.query;

    console.log(`🏆 Fetching registrations for tournament: ${tournamentId}`);

    let query = supabase
      .from('team_tournament_registrations')
      .select(`
        *,
        teams (
          id,
          name,
          code,
          county_id,
          sub_county_id,
          ward_id,
          org_id,
          contact_email,
          contact_phone,
          home_venue,
          club_name,
          organizations (
            id,
            name
          )
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status && status !== 'ALL') {
      query = query.eq('registration_status', status);
    }

    // Search by team name if provided
    if (search) {
      query = query.ilike('teams.name', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching tournament registrations:', error);
      throw error;
    }

    // Transform data for admin interface
    const registrations = (data || []).map(reg => ({
      id: reg.id,
      team_id: reg.team_id,
      tournament_id: reg.tournament_id,
      registration_status: reg.registration_status,
      registration_date: reg.registration_date,
      approval_date: reg.approval_date,
      rejection_date: reg.rejection_date,
      rejection_reason: reg.rejection_reason,
      squad_size: reg.squad_size,
      jersey_colors: reg.jersey_colors,
      notes: reg.notes,
      team: {
        id: reg.teams.id,
        name: reg.teams.name,
        code: reg.teams.code,
        county_id: reg.teams.county_id,
        contact_email: reg.teams.contact_email,
        contact_phone: reg.teams.contact_phone,
        organization: reg.teams.organizations
      },
      created_at: reg.created_at,
      updated_at: reg.updated_at
    }));

    console.log(`✅ Found ${registrations.length} registrations for tournament ${tournamentId}`);

    res.json({
      success: true,
      data: registrations,
      count: registrations.length,
      total: count,
      tournamentId: tournamentId,
      filters: { status, search, limit, offset }
    });

  } catch (error) {
    console.error('❌ Tournament registrations fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      details: 'Failed to fetch tournament registrations'
    });
  }
});

// Approve team registration(s)
app.post('/api/tournaments/:tournamentId/registrations/approve', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { registration_ids, notes, approved_by } = req.body;

    if (!registration_ids || !Array.isArray(registration_ids) || registration_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'registration_ids array is required'
      });
    }

    console.log(`✅ Approving ${registration_ids.length} registrations for tournament: ${tournamentId}`);

    const approvalDate = new Date().toISOString();
    const approvalInfo = approved_by ? `Approved by: ${approved_by}${notes ? ' - ' + notes : ''}` : notes;
    
    // Update registrations to APPROVED status
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .update({
        registration_status: 'APPROVED',
        approval_date: approvalDate,
        notes: approvalInfo || null,
        updated_at: approvalDate
      })
      .in('id', registration_ids)
      .eq('tournament_id', tournamentId)
      .select(`
        id,
        team_id,
        registration_status,
        teams (name)
      `);

    if (error) {
      console.error('❌ Error approving registrations:', error);
      throw error;
    }

    console.log(`✅ Successfully approved ${data.length} registrations`);

    // Log the approval for audit trail
    const approvedTeams = data.map(reg => reg.teams.name).join(', ');
    console.log(`📝 Approved teams: ${approvedTeams}`);

    res.json({
      success: true,
      message: `Successfully approved ${data.length} team registrations`,
      approved_count: data.length,
      approved_teams: data.map(reg => ({
        registration_id: reg.id,
        team_id: reg.team_id,
        team_name: reg.teams.name,
        status: reg.registration_status
      })),
      tournament_id: tournamentId
    });

  } catch (error) {
    console.error('❌ Registration approval error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      details: 'Failed to approve registrations'
    });
  }
});

// Reject team registration(s)
app.post('/api/tournaments/:tournamentId/registrations/reject', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { registration_ids, reason, rejected_by } = req.body;

    if (!registration_ids || !Array.isArray(registration_ids) || registration_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'registration_ids array is required'
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'rejection reason is required'
      });
    }

    console.log(`❌ Rejecting ${registration_ids.length} registrations for tournament: ${tournamentId}`);

    const rejectionDate = new Date().toISOString();
    
    // Update registrations to REJECTED status  
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .update({
        registration_status: 'REJECTED',
        rejection_date: rejectionDate,
        rejection_reason: reason.trim(),
        notes: `Rejected by: ${rejected_by || 'admin'} | Reason: ${reason.trim()}`,
        updated_at: rejectionDate
      })
      .in('id', registration_ids)
      .eq('tournament_id', tournamentId)
      .select(`
        id,
        team_id,
        registration_status,
        teams (name)
      `);

    if (error) {
      console.error('❌ Error rejecting registrations:', error);
      throw error;
    }

    console.log(`✅ Successfully rejected ${data.length} registrations`);

    // Log the rejection for audit trail
    const rejectedTeams = data.map(reg => reg.teams.name).join(', ');
    console.log(`📝 Rejected teams: ${rejectedTeams} | Reason: ${reason}`);

    res.json({
      success: true,
      message: `Successfully rejected ${data.length} team registrations`,
      rejected_count: data.length,
      rejected_teams: data.map(reg => ({
        registration_id: reg.id,
        team_id: reg.team_id,
        team_name: reg.teams.name,
        status: reg.registration_status,
        rejection_reason: reason
      })),
      tournament_id: tournamentId
    });

  } catch (error) {
    console.error('❌ Registration rejection error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      details: 'Failed to reject registrations'
    });
  }
});

// Get registration statistics for tournament admin dashboard
app.get('/api/tournaments/:tournamentId/registrations/stats', async (req, res) => {
  try {
    const { tournamentId } = req.params;

    console.log(`📊 Fetching registration stats for tournament: ${tournamentId}`);

    // Get registration counts by status
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .select('registration_status')
      .eq('tournament_id', tournamentId);

    if (error) {
      console.error('❌ Error fetching registration stats:', error);
      throw error;
    }

    // Calculate statistics
    const stats = {
      total: data.length,
      by_status: {
        SUBMITTED: data.filter(r => r.registration_status === 'SUBMITTED').length,
        APPROVED: data.filter(r => r.registration_status === 'APPROVED').length,
        REJECTED: data.filter(r => r.registration_status === 'REJECTED').length,
        WITHDRAWN: data.filter(r => r.registration_status === 'WITHDRAWN').length
      },
      approval_rate: data.length > 0 ? 
        Math.round((data.filter(r => r.registration_status === 'APPROVED').length / data.length) * 100) : 0,
      pending_review: data.filter(r => r.registration_status === 'SUBMITTED').length
    };

    console.log(`✅ Registration stats for ${tournamentId}:`, stats);

    res.json({
      success: true,
      data: stats,
      tournament_id: tournamentId
    });

  } catch (error) {
    console.error('❌ Registration stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      details: 'Failed to fetch registration statistics'
    });
  }
});

// ========================================
// JAMII FIXTURES - Enhanced Fixture Generation System
// ========================================

// Get available venues for fixture generation
app.get('/api/fixtures/venues', async (req, res) => {
  try {
    const { tournamentId, search } = req.query;
    console.log('🏟️ Fetching venues from database', tournamentId ? `for tournament: ${tournamentId}` : '', search ? `search: ${search}` : '');
    
    let query = supabase
      .from('venues')
      .select(`
        *,
        counties(id, name),
        sub_counties(id, name),
        wards(id, name)
      `);
    
    // Filter by tournament (or get global venues if tournamentId is provided)
    if (tournamentId) {
      query = query.or(`tournament_id.eq.${tournamentId},tournament_id.is.null`);
    }
    
    // Search by name or location
    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
    }
    
    query = query.order('name');
    
    const { data: venues, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Returning ${venues?.length || 0} venues`);
    res.json({
      success: true,
      venues: venues || [],
      count: venues?.length || 0
    });

  } catch (error) {
    console.error('❌ Venues fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: "Failed to fetch venue data"
    });
  }
});

// Create a new venue
app.post('/api/fixtures/venues', async (req, res) => {
  try {
    console.log('🏟️ Creating venue:', req.body);
    
    const { name, location, countyId, subCountyId, wardId, pitchCount, facilities, coordinates, tournamentId } = req.body;

    const { data: venue, error } = await supabase
      .from('venues')
      .insert({
        name,
        location,
        county_id: countyId,
        sub_county_id: subCountyId,
        ward_id: wardId,
        pitch_count: pitchCount || 1,
        facilities: facilities || [],
        coordinates: coordinates || null,
        tournament_id: tournamentId || null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Venue created:', venue);
    res.json({
      success: true,
      venue
    });

  } catch (error) {
    console.error('❌ Venue creation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Update a venue
app.put('/api/fixtures/venues', async (req, res) => {
  try {
    const { id } = req.query;
    console.log('🏟️ Updating venue:', id, req.body);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Venue ID required'
      });
    }

    const { name, location, countyId, subCountyId, wardId, pitchCount, facilities, coordinates } = req.body;

    const { data: venue, error } = await supabase
      .from('venues')
      .update({
        name,
        location,
        county_id: countyId,
        sub_county_id: subCountyId,
        ward_id: wardId,
        pitch_count: pitchCount || 1,
        facilities: facilities || [],
        coordinates: coordinates || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Venue updated:', venue);
    res.json({
      success: true,
      venue
    });

  } catch (error) {
    console.error('❌ Venue update error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Delete a venue
app.delete('/api/fixtures/venues', async (req, res) => {
  try {
    const { id } = req.query;
    console.log('🏟️ Deleting venue:', id);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Venue ID required'
      });
    }

    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Venue deleted');
    res.json({
      success: true
    });

  } catch (error) {
    console.error('❌ Venue deletion error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Generate fixtures using the enhanced Jamii Fixtures engine
app.post('/api/fixtures/generate', async (req, res) => {
  try {
    console.log('⚡ Generating Jamii Fixtures with Enterprise Circle Method...');
    const { teams, config, tournamentId, stageId } = req.body;

    // Validate inputs
    if (!teams || teams.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 teams are required'
      });
    }

    if (!config || !config.format) {
      return res.status(400).json({
        success: false,
        error: 'Tournament configuration is required'
      });
    }

    if (!tournamentId) {
      return res.status(400).json({
        success: false,
        error: 'Tournament ID is required'
      });
    }

    console.log(`🏆 Processing ${teams.length} teams in ${config.format} format for tournament ${tournamentId}`);
    console.log(`⚙️ Config: ${JSON.stringify(config, null, 2)}`);
    
    // Initialize enterprise engines
    const fixtureGenerator = new AdvancedFixtureGenerator({
      legs: config.legs || 2,
      minimumRestDays: 2,
      derbySpacing: 3
    });
    
    const optimizer = new FixtureOptimizer({
      minimumRestDays: 2,
      derbySpacing: 3
    });

    let fixtures = [];
    let groups = [];
    let persistedFixtures = [];

    // Generate fixtures based on format
    if (config.format === 'group_knockout') {
      // Check if using existing groups
      if (config.useExistingGroups && config.existingGroups && config.existingGroups.length > 0) {
        console.log(`📊 Using ${config.existingGroups.length} existing tournament groups`);
        groups = config.existingGroups;
        
        // Generate fixtures for each existing group
        let fixtureId = 1;
        groups.forEach((group) => {
          if (group.teams && group.teams.length >= 2) {
            const groupFixtures = fixtureGenerator.generateRoundRobin(group.teams, config.legs || 2);
            
            groupFixtures.forEach(fixture => {
              fixtures.push({
                ...fixture,
                id: `fixture_${fixtureId++}`,
                groupId: group.id,
                groupName: group.name
              });
            });
          }
        });
        
        console.log(`✅ Generated ${fixtures.length} fixtures across ${groups.length} existing groups`);
      } else {
        console.log(`📊 Creating new groups: ${config.groupCount} groups with ${config.teamsPerGroup} teams each`);
        const result = fixtureGenerator.generateGroupStage(teams, config);
        fixtures = result.fixtures;
        groups = result.groups;
      }
    } else if (config.format === 'round_robin' || config.format === 'league') {
      console.log('🔄 Full Round-Robin with Circle Method');
      fixtures = fixtureGenerator.generateRoundRobin(teams, config.legs || 2);
      groups = [{
        id: 'main',
        name: 'Main Group',
        teams: teams
      }];
    } else if (config.format === 'knockout') {
      console.log('🏆 Knockout Tournament');
      // Simple knockout generation (could be enhanced)
      fixtures = this._generateKnockout(teams);
      groups = [];
    } else {
      // Default to round-robin
      fixtures = fixtureGenerator.generateRoundRobin(teams, 2);
      groups = [{
        id: 'main',
        name: 'Main Group',
        teams: teams
      }];
    }

    console.log(`✨ Generated ${fixtures.length} fixtures, now optimizing...`);

    // Apply enterprise optimization
    const { fixtures: optimizedFixtures, conflicts } = optimizer.optimizeSchedule(fixtures, config);

    console.log(`✅ Generated ${optimizedFixtures.length} fixtures with ${conflicts.length} conflicts`);
    console.log(`📋 Conflicts: ${conflicts.map(c => c.type).join(', ')}`);
    
    // ============================================================================
    // PERSIST FIXTURES TO DATABASE
    // ============================================================================
    console.log('💾 Persisting fixtures to database...');

    try {
      // 1. Create or get a stage for this tournament
      let stage;
      
      // If stageId provided, use it directly
      if (stageId) {
        const { data: existingStage, error: stageError } = await supabase
          .from('stages')
          .select('*')
          .eq('id', stageId)
          .single();
        
        if (stageError || !existingStage) {
          throw new Error(`Stage with ID ${stageId} not found`);
        }
        
        stage = existingStage;
        console.log(`📌 Using provided stage: ${stage.name} (${stage.id})`);
      } else {
        // Auto-create or find stage (legacy behavior)
        const { data: existingStages } = await supabase
          .from('stages')
          .select('*')
          .eq('tournament_id', tournamentId)
          .eq('stage_type', config.format === 'group_knockout' ? 'GROUP' : 'LEAGUE')
          .order('seq', { ascending: false })
          .limit(1);

        if (existingStages && existingStages.length > 0) {
          stage = existingStages[0];
          console.log(`📌 Using existing stage: ${stage.name}`);
        } else {
          const { data: newStage, error: stageError } = await supabase
            .from('stages')
            .insert({
              tournament_id: tournamentId,
              name: config.format === 'group_knockout' ? 'Group Stage' : 'League Stage',
              stage_type: config.format === 'group_knockout' ? 'GROUP' : 'LEAGUE',
              seq: 1
            })
            .select()
            .single();

          if (stageError) throw stageError;
          stage = newStage;
          console.log(`✨ Created new stage: ${stage.name}`);
        }
      }

      // 2. Handle groups (if not using existing groups)
      const groupMap = new Map();
      if (!config.useExistingGroups && groups.length > 0) {
        for (const group of groups) {
          // Skip if it's the default 'main' group for league format
          if (group.id === 'main' && config.format === 'league') {
            groupMap.set(group.id, null);
            continue;
          }

          const { data: newGroup, error: groupError } = await supabase
            .from('groups')
            .insert({
              stage_id: stage.id,
              name: group.name,
              seq: groups.indexOf(group) + 1
            })
            .select()
            .single();

          if (groupError) {
            console.error('Error creating group:', groupError);
            continue;
          }

          groupMap.set(group.id, newGroup.id);
          console.log(`📊 Created group: ${newGroup.name}`);

          // Assign teams to this group
          if (group.teams && group.teams.length > 0) {
            const teamGroupInserts = group.teams.map(team => ({
              team_id: team.id,
              group_id: newGroup.id
            }));

            const { error: teamGroupError } = await supabase
              .from('team_groups')
              .insert(teamGroupInserts);

            if (teamGroupError) {
              console.error('Error assigning teams to group:', teamGroupError);
            } else {
              console.log(`✅ Assigned ${group.teams.length} teams to ${newGroup.name}`);
            }
          }
        }
      } else if (config.useExistingGroups) {
        // Map existing group IDs
        groups.forEach(group => {
          groupMap.set(group.id, group.id);
        });
      }

      // 3. Create rounds and matches
      const roundMap = new Map();
      const maxRound = Math.max(...optimizedFixtures.map(f => f.round));

      for (let roundNum = 1; roundNum <= maxRound; roundNum++) {
        const roundFixtures = optimizedFixtures.filter(f => f.round === roundNum);
        
        // Group fixtures by group
        const fixturesByGroup = {};
        roundFixtures.forEach(fixture => {
          const groupId = fixture.groupId || 'main';
          if (!fixturesByGroup[groupId]) {
            fixturesByGroup[groupId] = [];
          }
          fixturesByGroup[groupId].push(fixture);
        });

        // Create rounds for each group
        for (const [groupId, groupFixtures] of Object.entries(fixturesByGroup)) {
          const dbGroupId = groupMap.get(groupId);
          
          const { data: newRound, error: roundError } = await supabase
            .from('rounds')
            .insert({
              stage_id: stage.id,
              group_id: dbGroupId,
              number: roundNum,
              leg: 1,
              name: `Round ${roundNum}`
            })
            .select()
            .single();

          if (roundError) {
            console.error('Error creating round:', roundError);
            continue;
          }

          const roundKey = `${groupId}_${roundNum}`;
          roundMap.set(roundKey, newRound.id);
          console.log(`🔄 Created round ${roundNum} for group ${groupId}`);

          // Create matches for this round
          for (const fixture of groupFixtures) {
            const { data: newMatch, error: matchError } = await supabase
              .from('matches')
              .insert({
                round_id: newRound.id,
                home_team_id: fixture.homeTeam.id,
                away_team_id: fixture.awayTeam.id,
                kickoff: fixture.kickoff,
                venue: fixture.venue?.name || fixture.venue || null,
                status: 'SCHEDULED'
              })
              .select(`
                *,
                home_team:teams!home_team_id(id, name),
                away_team:teams!away_team_id(id, name),
                round:rounds(id, name, number)
              `)
              .single();

            if (matchError) {
              console.error('Error creating match:', matchError);
              continue;
            }

            persistedFixtures.push(newMatch);
          }
        }
      }

      console.log(`✅ Successfully persisted ${persistedFixtures.length} fixtures to database`);

    } catch (dbError) {
      console.error('❌ Database persistence error:', dbError);
      // Return generated fixtures even if persistence fails
      console.log('⚠️ Returning generated fixtures without persistence');
    }
    
    res.json({
      success: true,
      fixtures: persistedFixtures.length > 0 ? persistedFixtures : optimizedFixtures,
      conflicts,
      groups,
      persisted: persistedFixtures.length > 0,
      stats: {
        totalFixtures: optimizedFixtures.length,
        persistedFixtures: persistedFixtures.length,
        totalRounds: Math.max(...optimizedFixtures.map(f => f.round)),
        totalGroups: groups.length,
        conflictsDetected: conflicts.length,
        derbies: optimizedFixtures.filter(f => f.isDerby).length,
        highProfileMatches: optimizedFixtures.filter(f => f.isHighProfile).length
      },
      message: `Generated ${optimizedFixtures.length} fixtures using FIFA/UEFA Circle Method${persistedFixtures.length > 0 ? ' and saved to database' : ''}`,
      algorithm: "Enterprise Circle Method with Geographic Optimization & Constraint Solving"
    });

  } catch (error) {
    console.error('❌ Jamii Fixtures Generation Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: "Enterprise fixture generation failed",
      stack: error.stack
    });
  }
});

// Publish fixtures to multiple channels
app.post('/api/fixtures/publish', async (req, res) => {
  try {
    console.log('📢 Publishing fixtures...');
    const { fixtures, config, channels } = req.body;

    // Mock publication results
    const publicationResults = {
      website: { success: true, url: "https://jamiitourney.com/fixtures" },
      pdf: { success: true, downloadUrl: "/api/fixtures/download/pdf" },
      sms: { success: true, messagesSent: fixtures.length * 2 }, // 2 teams per fixture
      teams: { success: true, teamsNotified: new Set(fixtures.flatMap(f => [f.homeTeam.id, f.awayTeam.id])).size }
    };

    // In a real implementation, this would:
    // 1. Save fixtures to database
    // 2. Generate PDF documents  
    // 3. Send SMS notifications
    // 4. Update team portals
    // 5. Publish to website

    console.log(`✅ Published ${fixtures.length} fixtures across ${channels.length} channels`);

    res.json({
      success: true,
      publicationResults,
      message: "Fixtures published successfully across all channels",
      publishedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fixture Publication Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: "Fixture publication failed"
    });
  }
});

// Download fixtures as PDF
app.get('/api/fixtures/download/pdf', async (req, res) => {
  try {
    console.log('📄 Generating PDF fixtures...');
    
    // Mock PDF generation - in production, use libraries like PDFKit or Puppeteer
    const pdfContent = `
JAMII TOURNEY - FIXTURE LIST
===========================
Generated: ${new Date().toLocaleDateString()}

This would be a properly formatted PDF with:
- Tournament header and branding
- Fixtures organized by date/round
- Venue and time information  
- Contact details for inquiries

[PDF content would be binary data in production]
    `;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="jamii-fixtures.pdf"');
    res.send(pdfContent);

    console.log('✅ PDF fixtures generated');

  } catch (error) {
    console.error('❌ PDF Download Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: "PDF generation failed"
    });
  }
});

// ============================================================================
// FIXTURES CRUD ENDPOINTS
// ============================================================================

// Get all fixtures for a tournament
app.get('/api/tournaments/:tournamentId/fixtures', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log(`📋 Fetching fixtures for tournament: ${tournamentId}`);

    // Get all rounds for this tournament
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('id')
      .eq('tournament_id', tournamentId);

    if (roundsError) throw roundsError;

    if (!rounds || rounds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const roundIds = rounds.map(r => r.id);

    // Get all matches for these rounds
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name),
        round:rounds(id, name, seq, stage_id)
      `)
      .in('round_id', roundIds)
      .order('kickoff', { ascending: true });

    if (matchesError) throw matchesError;

    console.log(`✅ Found ${matches?.length || 0} fixtures`);
    res.json({ success: true, data: matches || [] });

  } catch (error) {
    console.error('❌ Error fetching fixtures:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single fixture by ID
app.get('/api/fixtures/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    console.log(`📋 Fetching fixture: ${fixtureId}`);

    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name),
        round:rounds(id, name, seq, stage_id, tournament_id)
      `)
      .eq('id', fixtureId)
      .single();

    if (error) throw error;

    res.json({ success: true, data: match });

  } catch (error) {
    console.error('❌ Error fetching fixture:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new fixture
app.post('/api/fixtures', async (req, res) => {
  try {
    const { roundId, homeTeamId, awayTeamId, kickoff, venue, status } = req.body;
    console.log(`➕ Creating new fixture`);

    if (!roundId || !homeTeamId || !awayTeamId || !kickoff) {
      return res.status(400).json({ 
        success: false, 
        error: 'roundId, homeTeamId, awayTeamId, and kickoff are required' 
      });
    }

    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        round_id: roundId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        kickoff: kickoff,
        venue: venue || null,
        status: status || 'SCHEDULED',
        home_score: null,
        away_score: null
      })
      .select(`
        *,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name),
        round:rounds(id, name, seq, stage_id)
      `)
      .single();

    if (error) throw error;

    console.log(`✅ Fixture created: ${match.id}`);
    res.json({ success: true, data: match });

  } catch (error) {
    console.error('❌ Error creating fixture:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a fixture
app.put('/api/fixtures/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { homeTeamId, awayTeamId, kickoff, venue, homeScore, awayScore, status } = req.body;
    console.log(`✏️ Updating fixture: ${fixtureId}`);

    const updateData = {};
    if (homeTeamId !== undefined) updateData.home_team_id = homeTeamId;
    if (awayTeamId !== undefined) updateData.away_team_id = awayTeamId;
    if (kickoff !== undefined) updateData.kickoff = kickoff;
    if (venue !== undefined) updateData.venue = venue;
    if (homeScore !== undefined) updateData.home_score = homeScore;
    if (awayScore !== undefined) updateData.away_score = awayScore;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data: match, error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', fixtureId)
      .select(`
        *,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name),
        round:rounds(id, name, seq, stage_id)
      `)
      .single();

    if (error) throw error;

    console.log(`✅ Fixture updated: ${fixtureId}`);
    res.json({ success: true, data: match });

  } catch (error) {
    console.error('❌ Error updating fixture:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a single fixture
app.delete('/api/fixtures/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    console.log(`🗑️ Deleting fixture: ${fixtureId}`);

    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', fixtureId);

    if (error) throw error;

    console.log(`✅ Fixture deleted: ${fixtureId}`);
    res.json({ success: true, message: 'Fixture deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting fixture:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete ALL fixtures for a tournament
app.delete('/api/tournaments/:tournamentId/fixtures', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log(`🗑️ Deleting ALL fixtures for tournament: ${tournamentId}`);

    // Get all rounds for this tournament
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('id')
      .eq('tournament_id', tournamentId);

    if (roundsError) throw roundsError;

    if (!rounds || rounds.length === 0) {
      return res.json({ success: true, message: 'No fixtures to delete', deletedCount: 0 });
    }

    const roundIds = rounds.map(r => r.id);

    // Delete all matches for these rounds
    const { data: deletedMatches, error: matchesError } = await supabase
      .from('matches')
      .delete()
      .in('round_id', roundIds)
      .select('id');

    if (matchesError) throw matchesError;

    const deletedCount = deletedMatches?.length || 0;
    console.log(`✅ Deleted ${deletedCount} fixtures for tournament ${tournamentId}`);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${deletedCount} fixtures`,
      deletedCount 
    });

  } catch (error) {
    console.error('❌ Error deleting fixtures:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// MATCH SCORE UPDATES & MANAGEMENT API
// ============================================================================

// Get single match by ID with full details
app.get('/api/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`⚽ Fetching match details: ${id}`);

    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(id, name, code, logo_url),
        away_team:teams!away_team_id(id, name, code, logo_url),
        round:rounds(
          id,
          name,
          number,
          leg,
          stage:stages(
            id,
            name,
            stage_type,
            tournament:tournaments(id, name)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Match not found'
        });
      }
      throw error;
    }

    console.log(`✅ Match found: ${match.home_team?.name || 'TBD'} vs ${match.away_team?.name || 'TBD'}`);
    res.json({ success: true, data: match });

  } catch (error) {
    console.error('❌ Error fetching match:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update match scores and status (PATCH /api/matches/:id)
app.patch('/api/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { home_score, away_score, status, venue, kickoff } = req.body;
    
    console.log(`📝 Updating match ${id}:`, { home_score, away_score, status });

    // Fetch current match to validate status transition
    const { data: currentMatch, error: fetchError } = await supabase
      .from('matches')
      .select('status, home_score, away_score')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Match not found'
        });
      }
      throw fetchError;
    }

    // Validate status transitions
    if (status) {
      const validTransitions = {
        'SCHEDULED': ['LIVE', 'POSTPONED', 'CANCELLED'],
        'LIVE': ['COMPLETED', 'HALFTIME', 'POSTPONED'],
        'HALFTIME': ['LIVE', 'COMPLETED'],
        'COMPLETED': [], // Cannot transition from completed
        'POSTPONED': ['SCHEDULED'],
        'CANCELLED': []
      };

      const currentStatus = currentMatch.status?.toUpperCase() || 'SCHEDULED';
      const newStatus = status.toUpperCase();
      
      if (currentStatus === 'COMPLETED' && newStatus !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          error: 'Cannot modify a completed match. Status is locked.'
        });
      }

      if (!validTransitions[currentStatus]?.includes(newStatus) && currentStatus !== newStatus) {
        return res.status(400).json({
          success: false,
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`
        });
      }
    }

    // Validate scores (must be non-negative)
    if (home_score !== undefined && home_score < 0) {
      return res.status(400).json({
        success: false,
        error: 'Home score must be non-negative'
      });
    }
    if (away_score !== undefined && away_score < 0) {
      return res.status(400).json({
        success: false,
        error: 'Away score must be non-negative'
      });
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (home_score !== undefined) updateData.home_score = home_score;
    if (away_score !== undefined) updateData.away_score = away_score;
    if (status !== undefined) updateData.status = status.toUpperCase();
    if (venue !== undefined) updateData.venue = venue;
    if (kickoff !== undefined) updateData.kickoff = kickoff;

    // Update the match
    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        home_team:teams!home_team_id(id, name, code, logo_url),
        away_team:teams!away_team_id(id, name, code, logo_url),
        round:rounds(
          id,
          name,
          number,
          stage:stages(
            id,
            name,
            tournament_id,
            tournament:tournaments(id, name)
          )
        )
      `)
      .single();

    if (updateError) throw updateError;

    console.log(`✅ Match updated: ${updatedMatch.home_team.name} ${updatedMatch.home_score ?? 0} - ${updatedMatch.away_score ?? 0} ${updatedMatch.away_team.name}`);

    // If match is completed, trigger standings recalculation message
    if (updateData.status === 'COMPLETED') {
      console.log(`📊 Match completed - standings should be recalculated for tournament ${updatedMatch.round.stage.tournament_id}`);
      
      // Broadcast match completion via WebSocket if available
      if (wsServer && updatedMatch.round?.stage?.tournament_id) {
        try {
          wsServer.broadcastMatchUpdate(updatedMatch.round.stage.tournament_id, {
            type: 'match:completed',
            matchId: id,
            homeTeam: updatedMatch.home_team.name,
            awayTeam: updatedMatch.away_team.name,
            homeScore: updatedMatch.home_score,
            awayScore: updatedMatch.away_score,
            timestamp: new Date().toISOString()
          });
          console.log(`📡 WebSocket broadcast sent for match completion`);
        } catch (wsError) {
          console.error('⚠️ WebSocket broadcast failed:', wsError.message);
        }
      }
    }

    res.json({ 
      success: true, 
      data: updatedMatch,
      message: updateData.status === 'COMPLETED' ? 'Match completed - standings will be updated' : 'Match updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating match:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quick start match (SCHEDULED → LIVE)
app.patch('/api/matches/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`▶️ Starting match: ${id}`);

    const { data: match, error } = await supabase
      .from('matches')
      .update({
        status: 'LIVE',
        actual_kickoff: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'SCHEDULED')
      .select(`
        *,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name),
        round:rounds(stage:stages(tournament_id))
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(400).json({
          success: false,
          error: 'Match not found or not in SCHEDULED status'
        });
      }
      throw error;
    }

    console.log(`✅ Match started: ${match.home_team.name} vs ${match.away_team.name}`);

    // Broadcast via WebSocket
    if (wsServer && match.round?.stage?.tournament_id) {
      try {
        wsServer.broadcastMatchUpdate(match.round.stage.tournament_id, {
          type: 'match:started',
          matchId: id,
          homeTeam: match.home_team.name,
          awayTeam: match.away_team.name,
          timestamp: new Date().toISOString()
        });
      } catch (wsError) {
        console.error('⚠️ WebSocket broadcast failed:', wsError.message);
      }
    }

    res.json({ success: true, data: match, message: 'Match started successfully' });

  } catch (error) {
    console.error('❌ Error starting match:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete match (set to COMPLETED)
app.patch('/api/matches/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { home_score, away_score } = req.body;

    console.log(`🏁 Completing match: ${id}`);

    // Validate scores are provided
    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Both home_score and away_score are required to complete a match'
      });
    }

    if (home_score < 0 || away_score < 0) {
      return res.status(400).json({
        success: false,
        error: 'Scores must be non-negative'
      });
    }

    const { data: match, error } = await supabase
      .from('matches')
      .update({
        status: 'COMPLETED',
        home_score,
        away_score,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .neq('status', 'COMPLETED')
      .select(`
        *,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name),
        round:rounds(
          id,
          name,
          stage:stages(id, tournament_id, tournament:tournaments(id, name))
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(400).json({
          success: false,
          error: 'Match not found or already completed'
        });
      }
      throw error;
    }

    console.log(`✅ Match completed: ${match.home_team.name} ${home_score} - ${away_score} ${match.away_team.name}`);
    console.log(`📊 Standings recalculation needed for tournament ${match.round.stage.tournament_id}`);

    // Broadcast via WebSocket
    if (wsServer && match.round?.stage?.tournament_id) {
      try {
        wsServer.broadcastMatchUpdate(match.round.stage.tournament_id, {
          type: 'match:completed',
          matchId: id,
          homeTeam: match.home_team.name,
          awayTeam: match.away_team.name,
          homeScore: home_score,
          awayScore: away_score,
          timestamp: new Date().toISOString()
        });
      } catch (wsError) {
        console.error('⚠️ WebSocket broadcast failed:', wsError.message);
      }
    }

    res.json({ 
      success: true, 
      data: match,
      message: 'Match completed - standings will be updated'
    });

  } catch (error) {
    console.error('❌ Error completing match:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add match event (goals, cards, substitutions)
app.post('/api/matches/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    const { event_type, minute, added_time = 0, player_id, team_id, description, metadata } = req.body;

    console.log(`📝 Adding event to match ${id}: ${event_type} at ${minute}'`);

    // Validate required fields
    if (!event_type || minute === undefined || !team_id) {
      return res.status(400).json({
        success: false,
        error: 'event_type, minute, and team_id are required'
      });
    }

    // Insert event into match_events table
    const { data: eventData, error: insertError } = await supabase
      .from('match_events')
      .insert({
        match_id: id,
        event_type,
        minute,
        added_time,
        player_id,
        team_id,
        description,
        metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return res.status(500).json({
        success: false,
        error: insertError.message
      });
    }

    // Update match statistics based on event type
    if (['GOAL', 'YELLOW_CARD', 'RED_CARD', 'PENALTY'].includes(event_type)) {
      console.log(`🔄 Updating statistics for ${event_type}...`);
      await updateMatchStatisticsFromEvent(id, event_type, team_id);
      console.log(`✅ Statistics update complete`);
    }

    console.log(`✅ Event saved to database:`, eventData);

    // Broadcast via WebSocket
    if (wsServer) {
      try {
        // Get tournament ID from match
        const { data: match } = await supabase
          .from('matches')
          .select('round:rounds(stage:stages(tournament_id))')
          .eq('id', id)
          .single();

        if (match?.round?.stage?.tournament_id) {
          wsServer.broadcastMatchUpdate(match.round.stage.tournament_id, {
            type: 'match:event',
            matchId: id,
            event: eventData,
            timestamp: new Date().toISOString()
          });
        }
      } catch (wsError) {
        console.error('⚠️ WebSocket broadcast failed:', wsError.message);
      }
    }

    res.json({ 
      success: true, 
      data: eventData,
      message: 'Match event logged successfully'
    });

  } catch (error) {
    console.error('❌ Error adding match event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to update match statistics from events
async function updateMatchStatisticsFromEvent(matchId, eventType, teamId) {
  try {
    console.log(`📊 updateMatchStatisticsFromEvent called:`, { matchId, eventType, teamId });
    
    // Get match to determine home/away
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('home_team_id, away_team_id')
      .eq('id', matchId)
      .single();

    if (matchError) {
      console.error('Error getting match:', matchError);
      return;
    }

    if (!match) {
      console.error('Match not found:', matchId);
      return;
    }

    console.log(`🏠 Match teams:`, { home: match.home_team_id, away: match.away_team_id, event_team: teamId });
    
    const isHomeTeam = match.home_team_id === teamId;
    console.log(`👉 Is home team:`, isHomeTeam);

    // Upsert statistics
    const { data: existingStats, error: selectError } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('match_id', matchId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error selecting stats:', selectError);
    }

    console.log(`📈 Existing stats:`, existingStats);

    if (existingStats) {
      // Update existing
      const updates = {};
      if (eventType === 'YELLOW_CARD') {
        const oldValue = existingStats[isHomeTeam ? 'home_yellow_cards' : 'away_yellow_cards'] || 0;
        const newValue = oldValue + 1;
        updates[isHomeTeam ? 'home_yellow_cards' : 'away_yellow_cards'] = newValue;
        console.log(`💛 Yellow card: ${oldValue} → ${newValue} (${isHomeTeam ? 'home' : 'away'})`);
      } else if (eventType === 'RED_CARD') {
        const oldValue = existingStats[isHomeTeam ? 'home_red_cards' : 'away_red_cards'] || 0;
        const newValue = oldValue + 1;
        updates[isHomeTeam ? 'home_red_cards' : 'away_red_cards'] = newValue;
        console.log(`🟥 Red card: ${oldValue} → ${newValue} (${isHomeTeam ? 'home' : 'away'})`);
      }
      
      console.log(`🔄 Updating with:`, updates);
      
      const { error: updateError } = await supabase
        .from('match_statistics')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('match_id', matchId);
      
      if (updateError) {
        console.error('❌ Error updating stats:', updateError);
      } else {
        console.log('✅ Statistics updated successfully');
      }
    } else {
      // Insert new
      console.log(`➕ Creating new statistics record`);
      const newStats = {
        match_id: matchId,
        home_possession: 50,
        away_possession: 50,
      };
      if (eventType === 'YELLOW_CARD') {
        newStats[isHomeTeam ? 'home_yellow_cards' : 'away_yellow_cards'] = 1;
        console.log(`💛 Setting initial yellow card to 1 for ${isHomeTeam ? 'home' : 'away'}`);
      } else if (eventType === 'RED_CARD') {
        newStats[isHomeTeam ? 'home_red_cards' : 'away_red_cards'] = 1;
        console.log(`🟥 Setting initial red card to 1 for ${isHomeTeam ? 'home' : 'away'}`);
      }
      
      const { error: insertError } = await supabase
        .from('match_statistics')
        .insert(newStats);
      
      if (insertError) {
        console.error('❌ Error inserting stats:', insertError);
      } else {
        console.log('✅ New statistics record created');
      }
    }

  } catch (error) {
    console.error('❌ Error in updateMatchStatisticsFromEvent:', error);
  }
}

// Get match events for a specific match
app.get('/api/matches/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: events, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', id)
      .order('minute', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: events || []
    });

  } catch (error) {
    console.error('❌ Error fetching match events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get or create match statistics
app.get('/api/matches/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;

    let { data: stats, error } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('match_id', id)
      .single();

    // If no stats exist, create default stats
    if (!stats) {
      const { data: newStats, error: insertError } = await supabase
        .from('match_statistics')
        .insert({
          match_id: id,
          home_possession: 50,
          away_possession: 50,
          home_shots: 0,
          away_shots: 0,
          home_shots_on_target: 0,
          away_shots_on_target: 0,
          home_corners: 0,
          away_corners: 0,
          home_fouls: 0,
          away_fouls: 0,
          home_yellow_cards: 0,
          away_yellow_cards: 0,
          home_red_cards: 0,
          away_red_cards: 0,
          current_minute: 0,
          period: 'FIRST_HALF'
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      stats = newStats;
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching match statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update match statistics (possession, shots, corners, etc.)
app.patch('/api/matches/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`📊 Updating statistics for match ${id}:`, updates);

    // Ensure statistics record exists
    let { data: existingStats } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('match_id', id)
      .single();

    if (!existingStats) {
      // Create default stats first
      const { data: newStats, error: insertError } = await supabase
        .from('match_statistics')
        .insert({
          match_id: id,
          home_possession: 50,
          away_possession: 50,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      existingStats = newStats;
    }

    // Update statistics
    const { data: updatedStats, error: updateError } = await supabase
      .from('match_statistics')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('match_id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Broadcast via WebSocket
    if (wsServer) {
      try {
        const { data: match } = await supabase
          .from('matches')
          .select('round:rounds(stage:stages(tournament_id))')
          .eq('id', id)
          .single();

        if (match?.round?.stage?.tournament_id) {
          wsServer.broadcastMatchUpdate(match.round.stage.tournament_id, {
            type: 'match:statistics',
            matchId: id,
            statistics: updatedStats,
            timestamp: new Date().toISOString()
          });
        }
      } catch (wsError) {
        console.error('⚠️ WebSocket broadcast failed:', wsError.message);
      }
    }

    res.json({
      success: true,
      data: updatedStats,
      message: 'Match statistics updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating match statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add live commentary to match
app.post('/api/matches/:id/commentary', async (req, res) => {
  try {
    const { id } = req.params;
    const { commentary } = req.body;

    if (!commentary) {
      return res.status(400).json({
        success: false,
        error: 'commentary text is required'
      });
    }

    // Update or create match statistics with commentary
    let { data: stats } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('match_id', id)
      .single();

    if (!stats) {
      // Create with commentary
      const { data: newStats, error: insertError } = await supabase
        .from('match_statistics')
        .insert({
          match_id: id,
          commentary,
          home_possession: 50,
          away_possession: 50,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      stats = newStats;
    } else {
      // Update commentary
      const { data: updatedStats, error: updateError } = await supabase
        .from('match_statistics')
        .update({
          commentary,
          updated_at: new Date().toISOString()
        })
        .eq('match_id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      stats = updatedStats;
    }

    // Broadcast via WebSocket
    if (wsServer) {
      try {
        const { data: match } = await supabase
          .from('matches')
          .select('round:rounds(stage:stages(tournament_id))')
          .eq('id', id)
          .single();

        if (match?.round?.stage?.tournament_id) {
          wsServer.broadcastMatchUpdate(match.round.stage.tournament_id, {
            type: 'match:commentary',
            matchId: id,
            commentary,
            timestamp: new Date().toISOString()
          });
        }
      } catch (wsError) {
        console.error('⚠️ WebSocket broadcast failed:', wsError.message);
      }
    }

    res.json({
      success: true,
      data: { commentary },
      message: 'Commentary added successfully'
    });

  } catch (error) {
    console.error('❌ Error adding commentary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// STANDINGS CALCULATION API
// ============================================================================

// Get tournament standings with advanced calculation
app.get('/api/tournaments/:tournamentId/standings', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { stageId, groupId } = req.query;

    console.log(`📊 Calculating standings for tournament: ${tournamentId}`, stageId ? `stage: ${stageId}` : '', groupId ? `group: ${groupId}` : '');

    // Build query to get matches
    let matchesQuery = supabase
      .from('matches')
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        status,
        kickoff,
        round:rounds(
          id,
          number,
          name,
          group_id,
          stage:stages(
            id,
            name,
            tournament_id
          )
        )
      `)
      .eq('rounds.stages.tournament_id', tournamentId)
      .in('status', ['COMPLETED', 'FINISHED']);

    // Filter by stage if provided
    if (stageId) {
      matchesQuery = matchesQuery.eq('rounds.stage_id', stageId);
    }

    // Filter by group if provided  
    if (groupId) {
      matchesQuery = matchesQuery.eq('rounds.group_id', groupId);
    }

    const { data: matches, error: matchesError } = await matchesQuery;

    if (matchesError) throw matchesError;

    console.log(`✅ Found ${matches?.length || 0} completed matches`);

    if (!matches || matches.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No completed matches found',
        stats: { totalMatches: 0, totalTeams: 0 }
      });
    }

    // Get all teams in the tournament
    let teamsQuery = supabase
      .from('tournament_teams')
      .select(`
        team_id,
        teams(id, name, code, logo_url, county_id, sub_county_id)
      `)
      .eq('tournament_id', tournamentId);

    const { data: tournamentTeams, error: teamsError } = await teamsQuery;

    if (teamsError) throw teamsError;

    if (!tournamentTeams || tournamentTeams.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No teams found in tournament',
        stats: { totalMatches: matches.length, totalTeams: 0 }
      });
    }

    // Transform teams data
    const teams = tournamentTeams.map(tt => ({
      id: tt.teams.id,
      name: tt.teams.name,
      code: tt.teams.code,
      logo_url: tt.teams.logo_url,
      county_id: tt.teams.county_id,
      sub_county_id: tt.teams.sub_county_id
    }));

    console.log(`✅ Found ${teams.length} teams in tournament`);

    // Transform matches for standings engine
    const standingsMatches = matches.map(m => ({
      id: m.id,
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
      homeScore: m.home_score ?? 0,
      awayScore: m.away_score ?? 0,
      status: m.status,
      kickoff: m.kickoff,
      round: m.round
    }));

    // Calculate standings using the Advanced Standings Engine
    const standingsEngine = new AdvancedStandingsEngine({
      pointsSystem: { win: 3, draw: 1, loss: 0 },
      sortingRules: ['points', 'goal_difference', 'goals_for', 'head_to_head']
    });

    const standings = standingsEngine.calculateStandings(standingsMatches, teams);

    console.log(`✅ Standings calculated for ${standings.length} teams`);

    // Group standings by group if applicable
    let groupedStandings = null;
    if (matches.some(m => m.round?.group_id)) {
      groupedStandings = {};
      
      // Get unique group IDs
      const groupIds = [...new Set(matches.map(m => m.round?.group_id).filter(Boolean))];
      
      for (const gid of groupIds) {
        const groupMatches = standingsMatches.filter(m => m.round?.group_id === gid);
        const groupStandings = standingsEngine.calculateStandings(groupMatches, teams);
        
        // Get group name
        const { data: groupData } = await supabase
          .from('groups')
          .select('id, name')
          .eq('id', gid)
          .single();
        
        groupedStandings[gid] = {
          groupId: gid,
          groupName: groupData?.name || `Group ${gid}`,
          standings: groupStandings.filter(s => s.played > 0) // Only teams with matches
        };
      }
    }

    res.json({
      success: true,
      data: standings,
      groupedStandings,
      stats: {
        totalMatches: matches.length,
        totalTeams: teams.length,
        completedMatches: matches.length,
        lastUpdated: new Date().toISOString()
      },
      message: `Standings calculated from ${matches.length} completed matches`
    });

  } catch (error) {
    console.error('❌ Error calculating standings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get standings for a specific group
app.get('/api/groups/:groupId/standings', async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log(`📊 Calculating standings for group: ${groupId}`);

    // Get group info
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        stage:stages(
          id,
          name,
          tournament_id,
          tournament:tournaments(id, name)
        )
      `)
      .eq('id', groupId)
      .single();

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Group not found'
        });
      }
      throw groupError;
    }

    // Get all matches for this group
    const { data: rounds } = await supabase
      .from('rounds')
      .select('id')
      .eq('group_id', groupId);

    if (!rounds || rounds.length === 0) {
      return res.json({
        success: true,
        data: [],
        group: { id: group.id, name: group.name },
        message: 'No rounds found for this group'
      });
    }

    const roundIds = rounds.map(r => r.id);

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        status,
        kickoff
      `)
      .in('round_id', roundIds)
      .in('status', ['COMPLETED', 'FINISHED']);

    if (matchesError) throw matchesError;

    if (!matches || matches.length === 0) {
      return res.json({
        success: true,
        data: [],
        group: { id: group.id, name: group.name },
        message: 'No completed matches in this group'
      });
    }

    // Get teams in this group
    const { data: teamGroups, error: teamGroupsError } = await supabase
      .from('team_groups')
      .select(`
        team_id,
        teams(id, name, code, logo_url)
      `)
      .eq('group_id', groupId);

    if (teamGroupsError) throw teamGroupsError;

    const teams = teamGroups?.map(tg => tg.teams) || [];

    // Calculate standings
    const standingsEngine = new AdvancedStandingsEngine();
    const standingsMatches = matches.map(m => ({
      id: m.id,
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
      homeScore: m.home_score ?? 0,
      awayScore: m.away_score ?? 0,
      status: m.status
    }));

    const standings = standingsEngine.calculateStandings(standingsMatches, teams);

    res.json({
      success: true,
      data: standings,
      group: {
        id: group.id,
        name: group.name,
        stage: group.stage?.name,
        tournament: group.stage?.tournament?.name
      },
      stats: {
        totalMatches: matches.length,
        totalTeams: teams.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error calculating group standings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// KNOCKOUT PROGRESSION API
// ============================================================================

// Advance tournament from group stage to knockout
app.post('/api/tournaments/:tournamentId/advance-to-knockout', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teamsPerGroup = 2, knockoutLegs = 1, includeThirdPlace = true } = req.body;

    console.log(`🏆 Advancing tournament ${tournamentId} to knockout stage`);
    console.log(`⚙️ Config: Top ${teamsPerGroup} per group, ${knockoutLegs}-leg matches, third place: ${includeThirdPlace}`);

    // 1. Get tournament info
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_model')
      .eq('id', tournamentId)
      .single();

    if (tournamentError) throw tournamentError;

    // 2. Get group stage
    const { data: groupStages, error: stageError } = await supabase
      .from('stages')
      .select('id, name')
      .eq('tournament_id', tournamentId)
      .eq('stage_type', 'GROUP')
      .order('seq', { ascending: false })
      .limit(1);

    if (stageError) throw stageError;
    
    if (!groupStages || groupStages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No group stage found for this tournament'
      });
    }

    const groupStage = groupStages[0];

    // 3. Get all groups in group stage
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('stage_id', groupStage.id)
      .order('seq');

    if (groupsError) throw groupsError;

    if (!groups || groups.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No groups found in group stage'
      });
    }

    console.log(`✅ Found ${groups.length} groups to process`);

    // 4. Calculate standings for each group and extract qualified teams
    const qualifiedTeams = [];
    
    for (const group of groups) {
      // Get rounds for this group
      const { data: rounds } = await supabase
        .from('rounds')
        .select('id')
        .eq('group_id', group.id);

      if (!rounds || rounds.length === 0) continue;

      const roundIds = rounds.map(r => r.id);

      // Get completed matches
      const { data: matches } = await supabase
        .from('matches')
        .select('id, home_team_id, away_team_id, home_score, away_score, status')
        .in('round_id', roundIds)
        .in('status', ['COMPLETED', 'FINISHED']);

      if (!matches || matches.length === 0) {
        console.log(`⚠️ Group ${group.name} has no completed matches`);
        continue;
      }

      // Get teams in group
      const { data: teamGroups } = await supabase
        .from('team_groups')
        .select('team_id, teams(id, name, code)')
        .eq('group_id', group.id);

      const teams = teamGroups?.map(tg => tg.teams) || [];

      // Calculate standings
      const standingsEngine = new AdvancedStandingsEngine();
      const standingsMatches = matches.map(m => ({
        id: m.id,
        homeTeamId: m.home_team_id,
        awayTeamId: m.away_team_id,
        homeScore: m.home_score ?? 0,
        awayScore: m.away_score ?? 0,
        status: m.status
      }));

      const standings = standingsEngine.calculateStandings(standingsMatches, teams);

      // Extract top N teams
      const topTeams = standings.slice(0, teamsPerGroup);
      topTeams.forEach(team => {
        qualifiedTeams.push({
          ...team,
          groupName: group.name,
          groupPosition: team.position
        });
      });

      console.log(`✅ ${group.name}: ${topTeams.map(t => t.teamName).join(', ')} qualify`);
    }

    if (qualifiedTeams.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Not enough teams qualified for knockout stage'
      });
    }

    console.log(`✅ Total qualified teams: ${qualifiedTeams.length}`);

    // 5. Create knockout stage
    const { data: knockoutStage, error: knockoutStageError } = await supabase
      .from('stages')
      .insert({
        tournament_id: tournamentId,
        name: 'Knockout Stage',
        stage_type: 'KNOCKOUT',
        seq: 2
      })
      .select()
      .single();

    if (knockoutStageError) throw knockoutStageError;

    console.log(`✅ Created knockout stage: ${knockoutStage.id}`);

    // 6. Generate knockout fixtures using the engine
    const fixtureGenerator = new AdvancedFixtureGenerator({ legs: knockoutLegs });
    
    // Prepare teams for knockout (convert standings to team objects)
    const knockoutTeams = qualifiedTeams.map(qt => ({
      id: qt.teamId,
      name: qt.teamName,
      groupName: qt.groupName,
      groupPosition: qt.groupPosition,
      seed: qualifiedTeams.indexOf(qt) + 1
    }));

    const knockoutFixtures = fixtureGenerator._generateKnockout(knockoutTeams, {
      legs: knockoutLegs,
      includeThirdPlace
    });

    console.log(`✅ Generated ${knockoutFixtures.length} knockout fixtures`);

    // 7. Persist knockout fixtures to database
    const persistedFixtures = [];

    // Group fixtures by round
    const fixturesByRound = {};
    knockoutFixtures.forEach(f => {
      const key = f.roundName;
      if (!fixturesByRound[key]) fixturesByRound[key] = [];
      fixturesByRound[key].push(f);
    });

    let roundSeq = 1;
    for (const [roundName, roundFixtures] of Object.entries(fixturesByRound)) {
      // Create round
      const { data: newRound, error: roundError } = await supabase
        .from('rounds')
        .insert({
          stage_id: knockoutStage.id,
          number: roundSeq,
          leg: 1,
          name: roundName
        })
        .select()
        .single();

      if (roundError) {
        console.error(`Error creating round ${roundName}:`, roundError);
        continue;
      }

      // Create matches for this round
      for (const fixture of roundFixtures) {
        // Skip placeholder teams
        if (fixture.homeTeam.isPlaceholder || fixture.awayTeam.isPlaceholder) {
          console.log(`⏭️ Skipping match with placeholder teams: ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`);
          continue;
        }

        const { data: newMatch, error: matchError } = await supabase
          .from('matches')
          .insert({
            round_id: newRound.id,
            home_team_id: fixture.homeTeam.id,
            away_team_id: fixture.awayTeam.id,
            status: 'SCHEDULED',
            kickoff: null // Will be scheduled later
          })
          .select(`
            *,
            home_team:teams!home_team_id(id, name),
            away_team:teams!away_team_id(id, name)
          `)
          .single();

        if (matchError) {
          console.error('Error creating match:', matchError);
          continue;
        }

        persistedFixtures.push(newMatch);
      }

      roundSeq++;
    }

    console.log(`✅ Persisted ${persistedFixtures.length} knockout matches`);

    res.json({
      success: true,
      message: `Successfully advanced ${qualifiedTeams.length} teams to knockout stage`,
      data: {
        knockoutStageId: knockoutStage.id,
        qualifiedTeams: qualifiedTeams.map(t => ({
          teamId: t.teamId,
          teamName: t.teamName,
          groupName: t.groupName,
          groupPosition: t.groupPosition
        })),
        knockoutFixtures: persistedFixtures,
        stats: {
          totalQualified: qualifiedTeams.length,
          knockoutMatches: persistedFixtures.length,
          rounds: Object.keys(fixturesByRound).length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error advancing to knockout:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Progress knockout round (advance winners)
app.post('/api/tournaments/:tournamentId/progress-knockout', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { roundId } = req.body;

    console.log(`⏭️ Progressing knockout round ${roundId} for tournament ${tournamentId}`);

    if (!roundId) {
      return res.status(400).json({
        success: false,
        error: 'roundId is required'
      });
    }

    // Get current round
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select(`
        id,
        name,
        number,
        stage:stages(id, name, tournament_id)
      `)
      .eq('id', roundId)
      .single();

    if (roundError) throw roundError;

    // Get all matches in this round
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        status,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name)
      `)
      .eq('round_id', roundId);

    if (matchesError) throw matchesError;

    // Check all matches are completed
    const incomplete = matches.filter(m => m.status !== 'COMPLETED' && m.status !== 'FINISHED');
    if (incomplete.length > 0) {
      return res.status(400).json({
        success: false,
        error: `${incomplete.length} matches in this round are not completed yet`,
        incompleteMatches: incomplete.map(m => ({
          id: m.id,
          homeTeam: m.home_team.name,
          awayTeam: m.away_team.name,
          status: m.status
        }))
      });
    }

    // Determine winners
    const winners = matches.map(m => {
      const homeScore = m.home_score ?? 0;
      const awayScore = m.away_score ?? 0;
      
      if (homeScore > awayScore) {
        return { teamId: m.home_team_id, teamName: m.home_team.name };
      } else if (awayScore > homeScore) {
        return { teamId: m.away_team_id, teamName: m.away_team.name };
      } else {
        // Draw - in knockout, this needs penalty shootout or extra time
        // For now, we'll advance home team
        console.log(`⚠️ Match ${m.id} ended in draw - advancing home team by default`);
        return { teamId: m.home_team_id, teamName: m.home_team.name };
      }
    });

    console.log(`✅ Winners: ${winners.map(w => w.teamName).join(', ')}`);

    // Create next round if not final
    if (matches.length > 1) {
      const nextRoundName = `Round ${round.number + 1}`;
      
      const { data: nextRound, error: nextRoundError } = await supabase
        .from('rounds')
        .insert({
          stage_id: round.stage.id,
          number: round.number + 1,
          leg: 1,
          name: nextRoundName
        })
        .select()
        .single();

      if (nextRoundError) throw nextRoundError;

      // Create matches for next round
      const nextRoundMatches = [];
      for (let i = 0; i < winners.length; i += 2) {
        const { data: newMatch, error: matchError } = await supabase
          .from('matches')
          .insert({
            round_id: nextRound.id,
            home_team_id: winners[i].teamId,
            away_team_id: winners[i + 1].teamId,
            status: 'SCHEDULED'
          })
          .select(`
            *,
            home_team:teams!home_team_id(id, name),
            away_team:teams!away_team_id(id, name)
          `)
          .single();

        if (!matchError) {
          nextRoundMatches.push(newMatch);
        }
      }

      res.json({
        success: true,
        message: `Progressed to ${nextRoundName}`,
        data: {
          completedRound: round.name,
          winners,
          nextRound: nextRound.name,
          nextMatches: nextRoundMatches
        }
      });
    } else {
      // This was the final
      res.json({
        success: true,
        message: 'Tournament completed!',
        data: {
          champion: winners[0],
          completedRound: round.name
        }
      });
    }

  } catch (error) {
    console.error('❌ Error progressing knockout:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Global error handler - MUST be last middleware
app.use(errorHandler);

// Start server with WebSocket support
const server = createServer(app);
let wsServer;

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Jamii Tourney server running on http://127.0.0.1:${PORT}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🗄️ Database: Supabase`);
  console.log(`📡 Health check: http://127.0.0.1:${PORT}/api/health`);
  console.log(`📊 Platform stats: http://127.0.0.1:${PORT}/api/platform/stats`);
  console.log(`🏆 All tournaments: http://127.0.0.1:${PORT}/api/tournaments/all`);
  console.log(`👥 All teams: http://127.0.0.1:${PORT}/api/teams/all`);
  console.log(`🏃 All players: http://127.0.0.1:${PORT}/api/players/all`);
  console.log(`🔍 Player search: http://127.0.0.1:${PORT}/api/players/search?orgId=X&q=Y`);

  // Initialize WebSocket server for enterprise live updates
  try {
    wsServer = new EnterpriseWebSocketServer(server, supabase);
    console.log(`🔌 Enterprise WebSocket server ready on ws://127.0.0.1:${PORT}`);
    console.log(`📡 Live updates: Subscribe to tournament channels for real-time data`);
  } catch (wsError) {
    console.error('❌ WebSocket server initialization failed:', wsError);
    console.log('⚠️  Server will continue without live updates');
  }
});

// WebSocket stats endpoint
app.get('/api/websocket/stats', (req, res) => {
  try {
    if (wsServer) {
      const stats = wsServer.getStats();
      res.json({ success: true, data: stats });
    } else {
      res.json({ success: false, message: 'WebSocket server not available' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Broadcast match update endpoint for admin use
app.post('/api/matches/:matchId/broadcast', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { tournamentId, matchData } = req.body;
    
    if (wsServer && tournamentId) {
      wsServer.broadcastMatchUpdate(tournamentId, { id: matchId, ...matchData });
      res.json({ success: true, message: 'Match update broadcasted' });
    } else {
      res.status(400).json({ success: false, message: 'WebSocket server or tournament ID not available' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (wsServer) {
    console.log('🔌 Closing WebSocket connections...');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (wsServer) {
    console.log('🔌 Closing WebSocket connections...');
  }
  process.exit(0);
});