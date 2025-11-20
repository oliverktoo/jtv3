import { useState, useEffect } from "react";
import type { User, UserOrganizationRole } from "@shared/schema";
import { UserRole } from "@/lib/rbac/permissions";

export interface UserWithRoles extends User {
  roles: Array<{
    id: string;
    userId: string;
    orgId: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  isSuperAdmin: boolean;
  currentOrgId: string | null;
}

// Set to true to enable mock authentication (for development)
// Set to false to test public landing page experience
const USE_MOCK_AUTH = false;

/**
 * Authentication Hook
 * Manages user authentication state and role information
 * 
 * TODO: Replace mock authentication with real Supabase Auth
 */
export function useAuth() {
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK_AUTH) {
      // Mock user for development
      const mockUser: UserWithRoles = {
        id: "mock-user-1",
        email: "admin@jamiitourney.com",
        firstName: "Admin",
        lastName: "User",
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [
          {
            id: "mock-role-1",
            userId: "mock-user-1",
            orgId: "550e8400-e29b-41d4-a716-446655440001",
            role: UserRole.SUPER_ADMIN,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
        isSuperAdmin: true,
        currentOrgId: "550e8400-e29b-41d4-a716-446655440001",
      };

      setUser(mockUser);
      setCurrentOrgId(mockUser.currentOrgId);
      setIsLoading(false);
    } else {
      // Check for existing auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Verify token and fetch user data
        verifyToken(token);
      } else {
        setUser(null);
        setCurrentOrgId(null);
        setIsLoading(false);
      }
    }
  }, []);

  async function verifyToken(token: string) {
    try {
      // Decode the simple token using browser-compatible atob
      const decoded = atob(token);
      const [userId] = decoded.split(':');
      
      console.log('🔐 Verifying token for user:', userId);
      
      // Fetch user data from backend
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Token verification failed');
      }
      
      const result = await response.json();
      
      console.log('✅ User data received:', result);
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response format');
      }
      
      const userData = result.data;
      
      const userWithRoles: UserWithRoles = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl || null,
        createdAt: new Date(userData.createdAt || new Date()),
        updatedAt: new Date(userData.updatedAt || new Date()),
        roles: userData.roles || [],
        isSuperAdmin: userData.isSuperAdmin || false,
        currentOrgId: userData.currentOrgId,
      };
      
      console.log('👤 User object created:', {
        id: userWithRoles.id,
        email: userWithRoles.email,
        isSuperAdmin: userWithRoles.isSuperAdmin,
        rolesCount: userWithRoles.roles.length
      });
      
      setUser(userWithRoles);
      setCurrentOrgId(userWithRoles.currentOrgId);
      setIsLoading(false);
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setCurrentOrgId(null);
      setIsLoading(false);
    }
  }

  async function initializeAuth() {
    try {
      // TODO: Check Supabase session
      // const { data: { session } } = await supabase.auth.getSession();
      
      // if (session) {
      //   // Fetch user roles from database
      //   const { data: userRoles } = await supabase
      //     .from('user_organization_roles')
      //     .select('*')
      //     .eq('user_id', session.user.id);
      //
      //   const userWithRoles = {
      //     ...session.user,
      //     roles: userRoles || [],
      //     isSuperAdmin: userRoles?.some(r => r.role === 'SUPER_ADMIN' && !r.org_id),
      //     currentOrgId: userRoles?.[0]?.org_id || null,
      //   };
      //
      //   setUser(userWithRoles);
      //   setCurrentOrgId(userWithRoles.currentOrgId);
      // }

      setIsLoading(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsLoading(false);
    }
  }

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('auth_token');
      setUser(null);
      setCurrentOrgId(null);
      window.location.href = '/';
    }
  };

  const switchOrganization = (orgId: string) => {
    setCurrentOrgId(orgId);
    if (user) {
      setUser({ ...user, currentOrgId: orgId });
    }
  };

  const getUserRoles = (): string[] => {
    if (!user) return [];
    // If user is super admin, always include SUPER_ADMIN role
    if (user.isSuperAdmin) {
      const roles = user.roles.map(r => r.role);
      if (!roles.includes(UserRole.SUPER_ADMIN)) {
        const result = [UserRole.SUPER_ADMIN, ...roles];
        console.log('🔑 getUserRoles (super admin):', result);
        return result;
      }
      console.log('🔑 getUserRoles (super admin with existing role):', roles);
      return roles;
    }
    const roles = user.roles.map(r => r.role);
    console.log('🔑 getUserRoles (regular user):', roles);
    return roles;
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) {
      console.log('❌ hasRole check failed: no user');
      return false;
    }
    // Super admins have all roles
    if (user.isSuperAdmin) {
      console.log('✅ hasRole check passed: super admin has all roles');
      return true;
    }
    const userRoles = getUserRoles();
    const rolesToCheck = Array.isArray(role) ? role : [role];
    const result = rolesToCheck.some(r => userRoles.includes(r));
    console.log('🔍 hasRole check:', { rolesToCheck, userRoles, result });
    return result;
  };

  const isSuperAdmin = (): boolean => {
    return user?.isSuperAdmin || false;
  };

  const isOrgAdmin = (orgId?: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    
    return user.roles.some(r => 
      r.role === UserRole.ORG_ADMIN && 
      (!orgId || r.orgId === orgId)
    );
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    currentOrgId,
    logout,
    switchOrganization,
    getUserRoles,
    hasRole,
    isSuperAdmin,
    isOrgAdmin,
  };
}
