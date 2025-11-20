// Enhanced RBAC System with Granular Permissions
// This file defines comprehensive permission management for tournament operations

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN', 
  REGISTRATION_MANAGER = 'REGISTRATION_MANAGER',
  FIXTURE_COORDINATOR = 'FIXTURE_COORDINATOR',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  RESULTS_OFFICER = 'RESULTS_OFFICER',
  VIEWER = 'VIEWER'
}

// Permission categories for different system modules
export enum Permission {
  // Tournament Management
  TOURNAMENT_CREATE = 'tournament:create',
  TOURNAMENT_EDIT = 'tournament:edit',
  TOURNAMENT_DELETE = 'tournament:delete',
  TOURNAMENT_VIEW = 'tournament:view',
  
  // Team Registration Management
  REGISTRATION_APPROVE = 'registration:approve',
  REGISTRATION_REJECT = 'registration:reject',
  REGISTRATION_VIEW = 'registration:view',
  REGISTRATION_BULK_OPERATIONS = 'registration:bulk_operations',
  REGISTRATION_EXPORT = 'registration:export',
  
  // Fixture Management
  FIXTURE_CREATE = 'fixture:create',
  FIXTURE_EDIT = 'fixture:edit',
  FIXTURE_DELETE = 'fixture:delete',
  FIXTURE_VIEW = 'fixture:view',
  FIXTURE_GENERATE = 'fixture:generate',
  FIXTURE_PUBLISH = 'fixture:publish',
  
  // Venue Management
  VENUE_CREATE = 'venue:create',
  VENUE_EDIT = 'venue:edit',
  VENUE_DELETE = 'venue:delete',
  VENUE_VIEW = 'venue:view',
  
  // Player Management
  PLAYER_APPROVE = 'player:approve',
  PLAYER_REJECT = 'player:reject',
  PLAYER_VIEW = 'player:view',
  PLAYER_EDIT = 'player:edit',
  PLAYER_ELIGIBILITY = 'player:eligibility',
  
  // Results & Statistics
  RESULT_ENTER = 'result:enter',
  RESULT_EDIT = 'result:edit',
  RESULT_VIEW = 'result:view',
  RESULT_APPROVE = 'result:approve',
  
  // Content Management
  CONTENT_CREATE = 'content:create',
  CONTENT_EDIT = 'content:edit',
  CONTENT_DELETE = 'content:delete',
  CONTENT_PUBLISH = 'content:publish',
  
  // Organization Management
  ORG_MANAGE = 'org:manage',
  ORG_VIEW = 'org:view',
  
  // User Management
  USER_MANAGE = 'user:manage',
  USER_VIEW = 'user:view',
  
  // System Administration
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_LOGS = 'system:logs',
  
  // Reports & Analytics
  REPORT_VIEW = 'report:view',
  REPORT_EXPORT = 'report:export',
  ANALYTICS_VIEW = 'analytics:view'
}

// Role-to-Permission mapping
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Full system access
    ...Object.values(Permission)
  ],
  
  [UserRole.ORG_ADMIN]: [
    // Full organization management within assigned orgs
    Permission.TOURNAMENT_CREATE,
    Permission.TOURNAMENT_EDIT,
    Permission.TOURNAMENT_DELETE,
    Permission.TOURNAMENT_VIEW,
    Permission.REGISTRATION_APPROVE,
    Permission.REGISTRATION_REJECT,
    Permission.REGISTRATION_VIEW,
    Permission.REGISTRATION_BULK_OPERATIONS,
    Permission.REGISTRATION_EXPORT,
    Permission.FIXTURE_CREATE,
    Permission.FIXTURE_EDIT,
    Permission.FIXTURE_DELETE,
    Permission.FIXTURE_VIEW,
    Permission.FIXTURE_GENERATE,
    Permission.FIXTURE_PUBLISH,
    Permission.VENUE_CREATE,
    Permission.VENUE_EDIT,
    Permission.VENUE_DELETE,
    Permission.VENUE_VIEW,
    Permission.PLAYER_APPROVE,
    Permission.PLAYER_REJECT,
    Permission.PLAYER_VIEW,
    Permission.PLAYER_EDIT,
    Permission.PLAYER_ELIGIBILITY,
    Permission.RESULT_ENTER,
    Permission.RESULT_EDIT,
    Permission.RESULT_VIEW,
    Permission.RESULT_APPROVE,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    Permission.ORG_VIEW,
    Permission.USER_VIEW,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.ANALYTICS_VIEW
  ],
  
  [UserRole.REGISTRATION_MANAGER]: [
    // Specialized in registration and player management
    Permission.TOURNAMENT_VIEW,
    Permission.REGISTRATION_APPROVE,
    Permission.REGISTRATION_REJECT,
    Permission.REGISTRATION_VIEW,
    Permission.REGISTRATION_BULK_OPERATIONS,
    Permission.REGISTRATION_EXPORT,
    Permission.PLAYER_APPROVE,
    Permission.PLAYER_REJECT,
    Permission.PLAYER_VIEW,
    Permission.PLAYER_EDIT,
    Permission.PLAYER_ELIGIBILITY,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT
  ],
  
  [UserRole.FIXTURE_COORDINATOR]: [
    // Specialized in fixture and venue management
    Permission.TOURNAMENT_VIEW,
    Permission.REGISTRATION_VIEW,
    Permission.FIXTURE_CREATE,
    Permission.FIXTURE_EDIT,
    Permission.FIXTURE_DELETE,
    Permission.FIXTURE_VIEW,
    Permission.FIXTURE_GENERATE,
    Permission.FIXTURE_PUBLISH,
    Permission.VENUE_CREATE,
    Permission.VENUE_EDIT,
    Permission.VENUE_DELETE,
    Permission.VENUE_VIEW,
    Permission.RESULT_VIEW,
    Permission.REPORT_VIEW
  ],
  
  [UserRole.CONTENT_MANAGER]: [
    // Specialized in content and communications
    Permission.TOURNAMENT_VIEW,
    Permission.REGISTRATION_VIEW,
    Permission.FIXTURE_VIEW,
    Permission.PLAYER_VIEW,
    Permission.RESULT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    Permission.REPORT_VIEW
  ],
  
  [UserRole.RESULTS_OFFICER]: [
    // Specialized in match results and statistics
    Permission.TOURNAMENT_VIEW,
    Permission.FIXTURE_VIEW,
    Permission.PLAYER_VIEW,
    Permission.RESULT_ENTER,
    Permission.RESULT_EDIT,
    Permission.RESULT_VIEW,
    Permission.REPORT_VIEW,
    Permission.ANALYTICS_VIEW
  ],
  
  [UserRole.VIEWER]: [
    // Read-only access
    Permission.TOURNAMENT_VIEW,
    Permission.REGISTRATION_VIEW,
    Permission.FIXTURE_VIEW,
    Permission.VENUE_VIEW,
    Permission.PLAYER_VIEW,
    Permission.RESULT_VIEW,
    Permission.ORG_VIEW,
    Permission.REPORT_VIEW
  ]
};

// Permission checking utilities
export class PermissionChecker {
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = RolePermissions[userRole];
    return rolePermissions.includes(permission);
  }
  
  static hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }
  
  static hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }
  
  static getPermissionsForRole(userRole: UserRole): Permission[] {
    return RolePermissions[userRole] || [];
  }
  
  static canAccessTournamentManagement(userRole: UserRole): boolean {
    return this.hasAnyPermission(userRole, [
      Permission.TOURNAMENT_CREATE,
      Permission.TOURNAMENT_EDIT,
      Permission.TOURNAMENT_DELETE
    ]);
  }
  
  static canManageRegistrations(userRole: UserRole): boolean {
    return this.hasAnyPermission(userRole, [
      Permission.REGISTRATION_APPROVE,
      Permission.REGISTRATION_REJECT,
      Permission.REGISTRATION_BULK_OPERATIONS
    ]);
  }
  
  static canManageFixtures(userRole: UserRole): boolean {
    return this.hasAnyPermission(userRole, [
      Permission.FIXTURE_CREATE,
      Permission.FIXTURE_EDIT,
      Permission.FIXTURE_GENERATE,
      Permission.FIXTURE_PUBLISH
    ]);
  }
  
  static canEnterResults(userRole: UserRole): boolean {
    return this.hasAnyPermission(userRole, [
      Permission.RESULT_ENTER,
      Permission.RESULT_EDIT,
      Permission.RESULT_APPROVE
    ]);
  }
}

// Role hierarchy for escalation and delegation
export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ORG_ADMIN]: 80,
  [UserRole.REGISTRATION_MANAGER]: 60,
  [UserRole.FIXTURE_COORDINATOR]: 60,
  [UserRole.CONTENT_MANAGER]: 50,
  [UserRole.RESULTS_OFFICER]: 40,
  [UserRole.VIEWER]: 10
};

export class RoleManager {
  static canDelegateToRole(currentRole: UserRole, targetRole: UserRole): boolean {
    return RoleHierarchy[currentRole] > RoleHierarchy[targetRole];
  }
  
  static isHigherRole(role1: UserRole, role2: UserRole): boolean {
    return RoleHierarchy[role1] > RoleHierarchy[role2];
  }
  
  static getSubordinateRoles(currentRole: UserRole): UserRole[] {
    const currentLevel = RoleHierarchy[currentRole];
    return Object.entries(RoleHierarchy)
      .filter(([_, level]) => level < currentLevel)
      .map(([role, _]) => role as UserRole);
  }
}

// Contextual permissions (organization-specific)
export interface PermissionContext {
  organizationId?: string;
  tournamentId?: string;
  userId?: string;
}

export class ContextualPermissionChecker extends PermissionChecker {
  static hasContextualPermission(
    userRole: UserRole,
    permission: Permission,
    context: PermissionContext,
    userContext: PermissionContext
  ): boolean {
    // Base permission check
    if (!this.hasPermission(userRole, permission)) {
      return false;
    }
    
    // Organization-level isolation
    if (context.organizationId && userContext.organizationId) {
      if (userRole !== UserRole.SUPER_ADMIN && context.organizationId !== userContext.organizationId) {
        return false;
      }
    }
    
    return true;
  }
}