/**
 * RBAC Permissions System
 * Defines all permissions and role-based access control logic
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  REGISTRAR = 'REGISTRAR',
  COMPETITION_MANAGER = 'COMPETITION_MANAGER',
  MATCH_OFFICIAL = 'MATCH_OFFICIAL',
  TEAM_MANAGER = 'TEAM_MANAGER',
  TEAM_STAFF = 'TEAM_STAFF',
  PLAYER = 'PLAYER',
  VIEWER = 'VIEWER',
  FAN = 'FAN',
  MEDIA = 'MEDIA',
  SPONSOR = 'SPONSOR',
}

export enum Resource {
  // Core Resources
  TOURNAMENTS = 'tournaments',
  TEAMS = 'teams',
  PLAYERS = 'players',
  MATCHES = 'matches',
  FIXTURES = 'fixtures',
  
  // Management Resources
  ORGANIZATIONS = 'organizations',
  USERS = 'users',
  VENUES = 'venues',
  STAGES = 'stages',
  GROUPS = 'groups',
  
  // Operational Resources
  REGISTRATIONS = 'registrations',
  DOCUMENTS = 'documents',
  ELIGIBILITY = 'eligibility',
  TRANSFERS = 'transfers',
  DISCIPLINARY = 'disciplinary',
  
  // Match Operations
  MATCH_EVENTS = 'match_events',
  MATCH_LINEUP = 'match_lineup',
  MATCH_OFFICIALS = 'match_officials',
  LIVE_SCORING = 'live_scoring',
  
  // Analytics & Reporting
  REPORTS = 'reports',
  ANALYTICS = 'analytics',
  STATISTICS = 'statistics',
  
  // System Resources
  SETTINGS = 'settings',
  MEDIA = 'media',
  MARKETPLACE = 'marketplace',
  TICKETING = 'ticketing',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',        // Full CRUD
  APPROVE = 'approve',      // Approve/reject workflows
  EXPORT = 'export',        // Export data
  PUBLISH = 'publish',      // Publish/unpublish
  VERIFY = 'verify',        // Verify documents/eligibility
  ASSIGN = 'assign',        // Assign resources
}

export interface Permission {
  resource: Resource;
  action: Action;
  scope?: 'system' | 'organization' | 'tournament' | 'team' | 'own' | 'public';
  conditions?: Record<string, any>;
}

/**
 * Role Permission Matrix
 * Defines what each role can do
 */
export const RolePermissions: Record<UserRole, Permission[]> = {
  // SUPER ADMIN - Full system access
  [UserRole.SUPER_ADMIN]: [
    { resource: Resource.TOURNAMENTS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.TEAMS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.PLAYERS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.MATCHES, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.FIXTURES, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.ORGANIZATIONS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.USERS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.VENUES, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.STAGES, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.GROUPS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.REGISTRATIONS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.DOCUMENTS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.ELIGIBILITY, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.TRANSFERS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.DISCIPLINARY, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.MATCH_EVENTS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.REPORTS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.ANALYTICS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.SETTINGS, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.MEDIA, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.MARKETPLACE, action: Action.MANAGE, scope: 'system' },
    { resource: Resource.TICKETING, action: Action.MANAGE, scope: 'system' },
  ],

  // ORG ADMIN - Full organization access
  [UserRole.ORG_ADMIN]: [
    { resource: Resource.TOURNAMENTS, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.TEAMS, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.PLAYERS, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.MATCHES, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.FIXTURES, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.USERS, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.VENUES, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.STAGES, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.GROUPS, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.REGISTRATIONS, action: Action.APPROVE, scope: 'organization' },
    { resource: Resource.DOCUMENTS, action: Action.VERIFY, scope: 'organization' },
    { resource: Resource.ELIGIBILITY, action: Action.VERIFY, scope: 'organization' },
    { resource: Resource.TRANSFERS, action: Action.APPROVE, scope: 'organization' },
    { resource: Resource.DISCIPLINARY, action: Action.MANAGE, scope: 'organization' },
    { resource: Resource.REPORTS, action: Action.EXPORT, scope: 'organization' },
    { resource: Resource.ANALYTICS, action: Action.READ, scope: 'organization' },
    { resource: Resource.SETTINGS, action: Action.MANAGE, scope: 'organization' },
  ],

  // REGISTRAR - Team and player registration
  [UserRole.REGISTRAR]: [
    { resource: Resource.TEAMS, action: Action.CREATE, scope: 'organization' },
    { resource: Resource.TEAMS, action: Action.READ, scope: 'organization' },
    { resource: Resource.TEAMS, action: Action.UPDATE, scope: 'organization' },
    { resource: Resource.PLAYERS, action: Action.CREATE, scope: 'organization' },
    { resource: Resource.PLAYERS, action: Action.READ, scope: 'organization' },
    { resource: Resource.PLAYERS, action: Action.UPDATE, scope: 'organization' },
    { resource: Resource.REGISTRATIONS, action: Action.CREATE, scope: 'organization' },
    { resource: Resource.REGISTRATIONS, action: Action.READ, scope: 'organization' },
    { resource: Resource.REGISTRATIONS, action: Action.UPDATE, scope: 'organization' },
    { resource: Resource.DOCUMENTS, action: Action.CREATE, scope: 'organization' },
    { resource: Resource.DOCUMENTS, action: Action.READ, scope: 'organization' },
    { resource: Resource.ELIGIBILITY, action: Action.READ, scope: 'organization' },
    { resource: Resource.TOURNAMENTS, action: Action.READ, scope: 'organization' },
    { resource: Resource.VENUES, action: Action.READ, scope: 'organization' },
  ],

  // COMPETITION MANAGER - Tournament and match management
  [UserRole.COMPETITION_MANAGER]: [
    { resource: Resource.TOURNAMENTS, action: Action.MANAGE, scope: 'tournament' },
    { resource: Resource.FIXTURES, action: Action.MANAGE, scope: 'tournament' },
    { resource: Resource.MATCHES, action: Action.MANAGE, scope: 'tournament' },
    { resource: Resource.STAGES, action: Action.MANAGE, scope: 'tournament' },
    { resource: Resource.GROUPS, action: Action.MANAGE, scope: 'tournament' },
    { resource: Resource.VENUES, action: Action.ASSIGN, scope: 'tournament' },
    { resource: Resource.MATCH_OFFICIALS, action: Action.ASSIGN, scope: 'tournament' },
    { resource: Resource.TEAMS, action: Action.READ, scope: 'tournament' },
    { resource: Resource.PLAYERS, action: Action.READ, scope: 'tournament' },
    { resource: Resource.REPORTS, action: Action.EXPORT, scope: 'tournament' },
    { resource: Resource.ANALYTICS, action: Action.READ, scope: 'tournament' },
  ],

  // MATCH OFFICIAL - Match operations and scoring
  [UserRole.MATCH_OFFICIAL]: [
    { resource: Resource.MATCHES, action: Action.READ, scope: 'tournament' },
    { resource: Resource.MATCHES, action: Action.UPDATE, scope: 'tournament' },
    { resource: Resource.MATCH_EVENTS, action: Action.CREATE, scope: 'tournament' },
    { resource: Resource.MATCH_EVENTS, action: Action.UPDATE, scope: 'tournament' },
    { resource: Resource.MATCH_LINEUP, action: Action.READ, scope: 'tournament' },
    { resource: Resource.MATCH_LINEUP, action: Action.UPDATE, scope: 'tournament' },
    { resource: Resource.LIVE_SCORING, action: Action.MANAGE, scope: 'tournament' },
    { resource: Resource.DISCIPLINARY, action: Action.CREATE, scope: 'tournament' },
    { resource: Resource.PLAYERS, action: Action.READ, scope: 'tournament' },
    { resource: Resource.TEAMS, action: Action.READ, scope: 'tournament' },
  ],

  // TEAM MANAGER - Team management
  [UserRole.TEAM_MANAGER]: [
    { resource: Resource.TEAMS, action: Action.UPDATE, scope: 'team' },
    { resource: Resource.PLAYERS, action: Action.READ, scope: 'team' },
    { resource: Resource.PLAYERS, action: Action.ASSIGN, scope: 'team' },
    { resource: Resource.REGISTRATIONS, action: Action.CREATE, scope: 'team' },
    { resource: Resource.REGISTRATIONS, action: Action.READ, scope: 'team' },
    { resource: Resource.DOCUMENTS, action: Action.CREATE, scope: 'team' },
    { resource: Resource.DOCUMENTS, action: Action.READ, scope: 'team' },
    { resource: Resource.TRANSFERS, action: Action.CREATE, scope: 'team' },
    { resource: Resource.TRANSFERS, action: Action.READ, scope: 'team' },
    { resource: Resource.MATCH_LINEUP, action: Action.MANAGE, scope: 'team' },
    { resource: Resource.TOURNAMENTS, action: Action.READ, scope: 'public' },
    { resource: Resource.MATCHES, action: Action.READ, scope: 'team' },
    { resource: Resource.FIXTURES, action: Action.READ, scope: 'team' },
    { resource: Resource.ANALYTICS, action: Action.READ, scope: 'team' },
    { resource: Resource.REPORTS, action: Action.EXPORT, scope: 'team' },
  ],

  // TEAM STAFF - Limited team access
  [UserRole.TEAM_STAFF]: [
    { resource: Resource.TEAMS, action: Action.READ, scope: 'team' },
    { resource: Resource.PLAYERS, action: Action.READ, scope: 'team' },
    { resource: Resource.REGISTRATIONS, action: Action.READ, scope: 'team' },
    { resource: Resource.DOCUMENTS, action: Action.READ, scope: 'team' },
    { resource: Resource.TOURNAMENTS, action: Action.READ, scope: 'public' },
    { resource: Resource.MATCHES, action: Action.READ, scope: 'team' },
    { resource: Resource.FIXTURES, action: Action.READ, scope: 'team' },
    { resource: Resource.ANALYTICS, action: Action.READ, scope: 'team' },
  ],

  // PLAYER - Own information access
  [UserRole.PLAYER]: [
    { resource: Resource.PLAYERS, action: Action.READ, scope: 'own' },
    { resource: Resource.PLAYERS, action: Action.UPDATE, scope: 'own' },
    { resource: Resource.DOCUMENTS, action: Action.CREATE, scope: 'own' },
    { resource: Resource.DOCUMENTS, action: Action.READ, scope: 'own' },
    { resource: Resource.TEAMS, action: Action.READ, scope: 'own' },
    { resource: Resource.TOURNAMENTS, action: Action.READ, scope: 'public' },
    { resource: Resource.MATCHES, action: Action.READ, scope: 'own' },
    { resource: Resource.FIXTURES, action: Action.READ, scope: 'public' },
    { resource: Resource.STATISTICS, action: Action.READ, scope: 'own' },
    { resource: Resource.TRANSFERS, action: Action.READ, scope: 'own' },
  ],

  // VIEWER - Read-only access
  [UserRole.VIEWER]: [
    { resource: Resource.TOURNAMENTS, action: Action.READ, scope: 'organization' },
    { resource: Resource.TEAMS, action: Action.READ, scope: 'organization' },
    { resource: Resource.PLAYERS, action: Action.READ, scope: 'organization' },
    { resource: Resource.MATCHES, action: Action.READ, scope: 'organization' },
    { resource: Resource.FIXTURES, action: Action.READ, scope: 'organization' },
    { resource: Resource.REPORTS, action: Action.READ, scope: 'organization' },
    { resource: Resource.ANALYTICS, action: Action.READ, scope: 'organization' },
  ],

  // FAN - Public access
  [UserRole.FAN]: [
    { resource: Resource.TOURNAMENTS, action: Action.READ, scope: 'public' },
    { resource: Resource.TEAMS, action: Action.READ, scope: 'public' },
    { resource: Resource.PLAYERS, action: Action.READ, scope: 'public' },
    { resource: Resource.MATCHES, action: Action.READ, scope: 'public' },
    { resource: Resource.FIXTURES, action: Action.READ, scope: 'public' },
    { resource: Resource.STATISTICS, action: Action.READ, scope: 'public' },
    { resource: Resource.MARKETPLACE, action: Action.READ, scope: 'public' },
    { resource: Resource.TICKETING, action: Action.CREATE, scope: 'public' },
  ],

  // MEDIA - Public + media access
  [UserRole.MEDIA]: [
    { resource: Resource.TOURNAMENTS, action: Action.READ, scope: 'public' },
    { resource: Resource.TEAMS, action: Action.READ, scope: 'public' },
    { resource: Resource.PLAYERS, action: Action.READ, scope: 'public' },
    { resource: Resource.MATCHES, action: Action.READ, scope: 'public' },
    { resource: Resource.FIXTURES, action: Action.READ, scope: 'public' },
    { resource: Resource.STATISTICS, action: Action.READ, scope: 'public' },
    { resource: Resource.MEDIA, action: Action.CREATE, scope: 'public' },
    { resource: Resource.MEDIA, action: Action.READ, scope: 'public' },
    { resource: Resource.REPORTS, action: Action.EXPORT, scope: 'public' },
  ],

  // SPONSOR - Public + sponsor access
  [UserRole.SPONSOR]: [
    { resource: Resource.TOURNAMENTS, action: Action.READ, scope: 'public' },
    { resource: Resource.TEAMS, action: Action.READ, scope: 'public' },
    { resource: Resource.MATCHES, action: Action.READ, scope: 'public' },
    { resource: Resource.ANALYTICS, action: Action.READ, scope: 'public' },
    { resource: Resource.REPORTS, action: Action.READ, scope: 'public' },
    { resource: Resource.MARKETPLACE, action: Action.CREATE, scope: 'public' },
    { resource: Resource.MARKETPLACE, action: Action.READ, scope: 'public' },
  ],
};

/**
 * Check if a user has permission to perform an action
 */
export function hasPermission(
  userRoles: UserRole[],
  resource: Resource,
  action: Action,
  scope?: string
): boolean {
  // Super admin has all permissions
  if (userRoles.includes(UserRole.SUPER_ADMIN)) {
    return true;
  }

  // Check each role's permissions
  for (const role of userRoles) {
    const rolePermissions = RolePermissions[role] || [];
    
    for (const permission of rolePermissions) {
      // Match resource and action
      if (permission.resource === resource) {
        // Check if action matches (MANAGE includes all CRUD operations)
        const actionMatches = 
          permission.action === action ||
          (permission.action === Action.MANAGE && [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE].includes(action));
        
        if (actionMatches) {
          // Check scope if provided
          if (scope && permission.scope) {
            // System scope includes everything
            if (permission.scope === 'system') return true;
            // Organization scope includes tournament, team, own
            if (permission.scope === 'organization' && ['tournament', 'team', 'own'].includes(scope)) return true;
            // Tournament scope includes team
            if (permission.scope === 'tournament' && ['team'].includes(scope)) return true;
            // Exact scope match
            if (permission.scope === scope) return true;
          } else {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(userRoles: UserRole[], allowedRoles: UserRole[]): boolean {
  if (allowedRoles.length === 0) return true; // Public route
  return userRoles.some(role => allowedRoles.includes(role));
}

/**
 * Get highest priority role from user's roles
 */
export function getPrimaryRole(roles: UserRole[]): UserRole {
  const rolePriority = [
    UserRole.SUPER_ADMIN,
    UserRole.ORG_ADMIN,
    UserRole.COMPETITION_MANAGER,
    UserRole.REGISTRAR,
    UserRole.MATCH_OFFICIAL,
    UserRole.TEAM_MANAGER,
    UserRole.TEAM_STAFF,
    UserRole.PLAYER,
    UserRole.MEDIA,
    UserRole.SPONSOR,
    UserRole.FAN,
    UserRole.VIEWER,
  ];

  for (const role of rolePriority) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return UserRole.VIEWER;
}

/**
 * Get user-friendly role label
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Administrator',
    [UserRole.ORG_ADMIN]: 'Organization Admin',
    [UserRole.REGISTRAR]: 'Registrar',
    [UserRole.COMPETITION_MANAGER]: 'Competition Manager',
    [UserRole.MATCH_OFFICIAL]: 'Match Official',
    [UserRole.TEAM_MANAGER]: 'Team Manager',
    [UserRole.TEAM_STAFF]: 'Team Staff',
    [UserRole.PLAYER]: 'Player',
    [UserRole.VIEWER]: 'Viewer',
    [UserRole.FAN]: 'Fan',
    [UserRole.MEDIA]: 'Media',
    [UserRole.SPONSOR]: 'Sponsor',
  };

  return labels[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'bg-red-500',
    [UserRole.ORG_ADMIN]: 'bg-purple-500',
    [UserRole.REGISTRAR]: 'bg-blue-500',
    [UserRole.COMPETITION_MANAGER]: 'bg-green-500',
    [UserRole.MATCH_OFFICIAL]: 'bg-orange-500',
    [UserRole.TEAM_MANAGER]: 'bg-indigo-500',
    [UserRole.TEAM_STAFF]: 'bg-cyan-500',
    [UserRole.PLAYER]: 'bg-emerald-500',
    [UserRole.VIEWER]: 'bg-gray-500',
    [UserRole.FAN]: 'bg-pink-500',
    [UserRole.MEDIA]: 'bg-yellow-500',
    [UserRole.SPONSOR]: 'bg-amber-500',
  };

  return colors[role] || 'bg-gray-500';
}
