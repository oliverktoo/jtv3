# Admin Management System - Complete Guide

## Overview

The Admin Management System provides a structured, role-based approach to creating and managing system administrators with different permission levels.

## Admin Roles

### 1. Super Admin (SUPER_ADMIN)
- **Access Level**: Full system access
- **Capabilities**:
  - Create and manage all admin types
  - Access all organizations
  - Configure system settings
  - Override all permissions
  - View all data across the platform
- **Use Case**: System owner, technical lead
- **Creation**: Manual promotion via API or by existing super admin

### 2. Organization Admin (ORG_ADMIN)
- **Access Level**: Organization-wide management
- **Capabilities**:
  - Manage organization settings
  - Create registrars and competition managers within their org
  - Approve team registrations
  - View org-level analytics
  - Manage org users and teams
- **Use Case**: League directors, federation admins
- **Creation**: By super admin or through org creation process

### 3. Registrar (REGISTRAR)
- **Access Level**: Player and team registration management
- **Capabilities**:
  - Review player documents
  - Approve/reject registrations
  - Verify player eligibility
  - Manage team rosters
  - Issue player cards
- **Use Case**: Registration desk staff, compliance officers
- **Creation**: By super admin or org admin

### 4. Competition Manager (COMPETITION_MANAGER)
- **Access Level**: Tournament and match management
- **Capabilities**:
  - Create and configure tournaments
  - Generate fixtures
  - Schedule matches
  - Assign venues
  - Manage competition rules
- **Use Case**: Tournament directors, league coordinators
- **Creation**: By super admin or org admin

### 5. Match Official (MATCH_OFFICIAL)
- **Access Level**: Match-level operations
- **Capabilities**:
  - Record match scores
  - Track match events (goals, cards, substitutions)
  - Update live match data
  - Generate match reports
- **Use Case**: Referees, match commissioners
- **Creation**: By super admin, org admin, or competition manager

## Admin Creation Workflow

### Method 1: Through AdminSuperHub UI

1. **Access Admin Management**
   - Navigate to AdminSuperHub
   - Click "Admin Management" tab
   - Click "Create Admin" button

2. **Fill Admin Details**
   ```typescript
   {
     firstName: string;      // Admin's first name
     lastName: string;       // Admin's last name
     email: string;          // Unique email (login credential)
     password: string;       // Minimum 8 characters
     organizationName: string; // Org they'll manage
     role: UserRole;         // Select from ADMIN_ROLES
   }
   ```

3. **Select Admin Role**
   - Choose appropriate role from dropdown
   - Review role description and permissions
   - Role determines access scope

4. **Submit Creation**
   - Form validates all fields
   - Checks for duplicate email
   - Creates organization if new
   - Creates user account
   - Assigns role to organization
   - Returns success confirmation

### Method 2: API Endpoint

**Endpoint**: `POST /api/admin/create`

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ORG_ADMIN",
  "organizationName": "County Football League",
  "isSuperAdmin": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_super_admin": false
    },
    "organization": {
      "id": "uuid",
      "name": "County Football League",
      "slug": "county-football-league-1234567890"
    },
    "role": "ORG_ADMIN"
  },
  "message": "Admin created successfully"
}
```

## Admin Management Operations

### List All Admins

**Endpoint**: `GET /api/admin/list`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ORG_ADMIN",
      "organizationName": "County Football League",
      "isSuperAdmin": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Update Admin Role

**Endpoint**: `PUT /api/admin/:id/role`

**Request Body**:
```json
{
  "role": "COMPETITION_MANAGER",
  "organizationId": "org-uuid"
}
```

### Promote to Super Admin

**Endpoint**: `POST /api/users/make-super-admin`

**Request Body**:
```json
{
  "email": "admin@example.com"
}
```

### Deactivate Admin

**Endpoint**: `DELETE /api/admin/:id`

**Note**: Removes user-organization-role assignment. Consider soft delete in production.

## Permission Hierarchy

```
SUPER_ADMIN
  └── Can create/manage all roles
      
ORG_ADMIN
  ├── Can create: REGISTRAR, COMPETITION_MANAGER, MATCH_OFFICIAL
  └── Scope: Within their organization only
  
COMPETITION_MANAGER
  ├── Can create: MATCH_OFFICIAL
  └── Scope: Within their tournaments only

REGISTRAR
  └── Cannot create other admins
  
MATCH_OFFICIAL
  └── Cannot create other admins
```

## Security Considerations

### Current Implementation (Development)

⚠️ **WARNING**: Current implementation has security limitations:

1. **Password Storage**: Plain text (NOT SECURE)
2. **Token Format**: Base64 encoding (NOT SECURE)
3. **No Email Verification**: Accounts active immediately
4. **No Password Reset**: Users can't recover passwords
5. **No Session Expiry**: Tokens valid indefinitely

### Production Requirements

**MUST implement before production**:

1. **Password Hashing**:
   ```javascript
   import bcrypt from 'bcryptjs';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **JWT Tokens**:
   ```javascript
   import jwt from 'jsonwebtoken';
   const token = jwt.sign({ userId, role }, SECRET_KEY, { expiresIn: '24h' });
   ```

3. **Email Verification**:
   - Send verification email on signup
   - Require email confirmation before login
   - Store verification token in database

4. **Password Reset Flow**:
   - Generate secure reset tokens
   - Email reset links with expiry
   - Validate tokens before allowing reset

5. **Audit Logging**:
   - Log all admin creation events
   - Track role changes
   - Monitor permission escalation
   - Alert on suspicious activity

## Best Practices

### Admin Creation

1. **Use Principle of Least Privilege**
   - Grant minimum permissions needed
   - Start with lower roles, promote as needed
   - Review permissions regularly

2. **Organization Scoping**
   - Assign admins to specific organizations
   - Don't create super admins unnecessarily
   - Use org admins for organization-specific tasks

3. **Naming Conventions**
   - Use official names (not nicknames)
   - Verify email addresses before creation
   - Use organizational email domains when possible

4. **Documentation**
   - Document why each admin was created
   - Track admin assignments
   - Maintain admin contact information

### Role Assignment

1. **Super Admin**:
   - Reserve for platform owners only
   - Maximum 2-3 super admins
   - Require approval from existing super admin

2. **Org Admin**:
   - One primary admin per organization
   - Additional admins for redundancy
   - Should represent organization leadership

3. **Registrar**:
   - Multiple per organization (registration desk coverage)
   - Assign based on location/region
   - Rotate for busy seasons

4. **Competition Manager**:
   - One per tournament type/season
   - Technical knowledge required
   - Can delegate to match officials

5. **Match Official**:
   - Create on-demand for specific matches
   - Temporary access for tournament duration
   - Deactivate after season ends

## Testing Scenarios

### Test 1: Create Organization Admin

```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@county-league.ke",
    "password": "SecurePass123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ORG_ADMIN",
    "organizationName": "Nairobi County League"
  }'
```

### Test 2: Create Registrar

```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "registrar@county-league.ke",
    "password": "SecurePass456",
    "firstName": "Peter",
    "lastName": "Kimani",
    "role": "REGISTRAR",
    "organizationName": "Nairobi County League"
  }'
```

### Test 3: List All Admins

```bash
curl http://localhost:5000/api/admin/list
```

### Test 4: Promote to Super Admin

```bash
curl -X POST http://localhost:5000/api/users/make-super-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@county-league.ke"}'
```

## Troubleshooting

### Issue: "User with this email already exists"

**Solution**: Email must be unique. Use a different email or delete existing user.

### Issue: "Failed to create organization"

**Solution**: Check Supabase connection. Verify organizations table exists.

### Issue: "Failed to assign role"

**Solution**: Verify user_organization_roles table exists. Check foreign key constraints.

### Issue: Admin can't access pages

**Solution**: 
1. Check user's `is_super_admin` flag
2. Verify role assignment in `user_organization_roles`
3. Clear browser cache and re-login
4. Check PermissionGuard console logs

### Issue: Admin list returns empty array

**Solution**: Click "Load Admins" button to fetch data. Check backend server is running.

## Database Schema

### users table
```sql
id: uuid (PK)
email: varchar (unique)
first_name: varchar
last_name: varchar
is_super_admin: boolean
created_at: timestamp
updated_at: timestamp
```

### organizations table
```sql
id: uuid (PK)
name: varchar
slug: varchar (unique)
created_at: timestamp
updated_at: timestamp
```

### user_organization_roles table
```sql
id: uuid (PK)
user_id: uuid (FK -> users.id)
organization_id: uuid (FK -> organizations.id)
role: varchar (enum)
created_at: timestamp
updated_at: timestamp
```

## Future Enhancements

### Phase 1 (Security)
- [ ] Implement bcrypt password hashing
- [ ] Replace base64 with JWT tokens
- [ ] Add token expiration (24 hours)
- [ ] Implement token refresh mechanism
- [ ] Add email verification

### Phase 2 (Features)
- [ ] Password reset flow
- [ ] Two-factor authentication (2FA)
- [ ] Role-based dashboard customization
- [ ] Admin activity audit log
- [ ] Permission templates

### Phase 3 (Advanced)
- [ ] Multi-organization assignments (one admin, multiple orgs)
- [ ] Temporary admin access (time-limited roles)
- [ ] Role inheritance (hierarchical permissions)
- [ ] Custom permission sets
- [ ] Admin delegation (proxy permissions)

## Support

For questions or issues with admin management:

1. Check console logs for detailed error messages
2. Verify backend server is running (port 5000)
3. Test API endpoints directly with curl/Postman
4. Review Supabase database for data integrity
5. Check RLS policies are disabled or properly configured

---

**Created**: 2024-01-15
**Last Updated**: 2024-01-15
**Version**: 1.0.0
**Status**: Development (NOT production-ready)
