import React from 'react';
import { UserRole, Permission, PermissionChecker, PermissionContext, ContextualPermissionChecker } from '../../lib/rbac';
import { useAuth } from '../../hooks/useAuth';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
  context?: PermissionContext;
  fallback?: React.ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  context,
  fallback,
  showError = true,
  errorMessage
}: PermissionGuardProps) {
  const { user } = useAuth();
  
  if (!user) {
    return showError ? (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Authentication required to access this feature.
        </AlertDescription>
      </Alert>
    ) : null;
  }

  const userRole = user.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.ORG_ADMIN; // Simplified for now
  const userContext: PermissionContext = {
    organizationId: user.currentOrgId,
    userId: user.id
  };

  // Build permission list
  const permissionsToCheck = permission ? [permission, ...permissions] : permissions;
  
  if (permissionsToCheck.length === 0) {
    return <>{children}</>;
  }

  // Check permissions
  let hasPermission = false;
  
  if (context) {
    // Contextual permission check
    if (requireAll) {
      hasPermission = permissionsToCheck.every(perm => 
        ContextualPermissionChecker.hasContextualPermission(userRole, perm, context, userContext)
      );
    } else {
      hasPermission = permissionsToCheck.some(perm => 
        ContextualPermissionChecker.hasContextualPermission(userRole, perm, context, userContext)
      );
    }
  } else {
    // Basic permission check
    if (requireAll) {
      hasPermission = PermissionChecker.hasAllPermissions(userRole, permissionsToCheck);
    } else {
      hasPermission = PermissionChecker.hasAnyPermission(userRole, permissionsToCheck);
    }
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  // Permission denied
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showError) {
    return (
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          {errorMessage || `Insufficient permissions. Required: ${permissionsToCheck.join(', ')}`}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

// Specialized guards for common use cases
interface RegistrationManagementGuardProps {
  children: React.ReactNode;
  context?: PermissionContext;
  fallback?: React.ReactNode;
}

export function RegistrationManagementGuard({ children, context, fallback }: RegistrationManagementGuardProps) {
  return (
    <PermissionGuard
      permissions={[
        Permission.REGISTRATION_APPROVE,
        Permission.REGISTRATION_REJECT,
        Permission.REGISTRATION_BULK_OPERATIONS
      ]}
      requireAll={false}
      context={context}
      fallback={fallback}
      errorMessage="You don't have permission to manage team registrations."
    >
      {children}
    </PermissionGuard>
  );
}

export function FixtureManagementGuard({ children, context, fallback }: RegistrationManagementGuardProps) {
  return (
    <PermissionGuard
      permissions={[
        Permission.FIXTURE_CREATE,
        Permission.FIXTURE_EDIT,
        Permission.FIXTURE_GENERATE,
        Permission.FIXTURE_PUBLISH
      ]}
      requireAll={false}
      context={context}
      fallback={fallback}
      errorMessage="You don't have permission to manage fixtures."
    >
      {children}
    </PermissionGuard>
  );
}

export function TournamentManagementGuard({ children, context, fallback }: RegistrationManagementGuardProps) {
  return (
    <PermissionGuard
      permissions={[
        Permission.TOURNAMENT_CREATE,
        Permission.TOURNAMENT_EDIT,
        Permission.TOURNAMENT_DELETE
      ]}
      requireAll={false}
      context={context}
      fallback={fallback}
      errorMessage="You don't have permission to manage tournaments."
    >
      {children}
    </PermissionGuard>
  );
}

export function ResultsManagementGuard({ children, context, fallback }: RegistrationManagementGuardProps) {
  return (
    <PermissionGuard
      permissions={[
        Permission.RESULT_ENTER,
        Permission.RESULT_EDIT,
        Permission.RESULT_APPROVE
      ]}
      requireAll={false}
      context={context}
      fallback={fallback}
      errorMessage="You don't have permission to manage match results."
    >
      {children}
    </PermissionGuard>
  );
}

// Hook for checking permissions in components
export function usePermission() {
  const { user } = useAuth();
  
  const hasPermission = (permission: Permission, context?: PermissionContext): boolean => {
    if (!user) return false;
    
    const userRole = user.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.ORG_ADMIN;
    const userContext: PermissionContext = {
      organizationId: user.currentOrgId,
      userId: user.id
    };
    
    if (context) {
      return ContextualPermissionChecker.hasContextualPermission(userRole, permission, context, userContext);
    }
    
    return PermissionChecker.hasPermission(userRole, permission);
  };

  const hasAnyPermission = (permissions: Permission[], context?: PermissionContext): boolean => {
    return permissions.some(permission => hasPermission(permission, context));
  };

  const hasAllPermissions = (permissions: Permission[], context?: PermissionContext): boolean => {
    return permissions.every(permission => hasPermission(permission, context));
  };

  const canManageRegistrations = (context?: PermissionContext): boolean => {
    return hasAnyPermission([
      Permission.REGISTRATION_APPROVE,
      Permission.REGISTRATION_REJECT,
      Permission.REGISTRATION_BULK_OPERATIONS
    ], context);
  };

  const canManageFixtures = (context?: PermissionContext): boolean => {
    return hasAnyPermission([
      Permission.FIXTURE_CREATE,
      Permission.FIXTURE_EDIT,
      Permission.FIXTURE_GENERATE,
      Permission.FIXTURE_PUBLISH
    ], context);
  };

  const canManageTournaments = (context?: PermissionContext): boolean => {
    return hasAnyPermission([
      Permission.TOURNAMENT_CREATE,
      Permission.TOURNAMENT_EDIT,
      Permission.TOURNAMENT_DELETE
    ], context);
  };

  const canEnterResults = (context?: PermissionContext): boolean => {
    return hasAnyPermission([
      Permission.RESULT_ENTER,
      Permission.RESULT_EDIT,
      Permission.RESULT_APPROVE
    ], context);
  };

  const getUserRole = (): UserRole | null => {
    return user ? (user.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.ORG_ADMIN) : null;
  };

  const getPermissions = (): Permission[] => {
    const userRole = getUserRole();
    return userRole ? PermissionChecker.getPermissionsForRole(userRole) : [];
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageRegistrations,
    canManageFixtures,
    canManageTournaments,
    canEnterResults,
    getUserRole,
    getPermissions,
    user
  };
}

// Role-based routing guard
interface RoleBasedRouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function RoleBasedRouteGuard({ children, allowedRoles, fallback }: RoleBasedRouteGuardProps) {
  const { user } = useAuth();
  
  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userRole = user.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.ORG_ADMIN;
  
  if (!allowedRoles.includes(userRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Required roles: {allowedRoles.join(', ')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}