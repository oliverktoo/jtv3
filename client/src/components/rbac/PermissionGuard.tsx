import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  UserRole, 
  Resource, 
  Action, 
  hasPermission, 
  canAccessRoute 
} from "@/lib/rbac/permissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface PermissionGuardProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  resource?: Resource;
  action?: Action;
  scope?: string;
  fallback?: ReactNode;
  showError?: boolean;
}

/**
 * Permission Guard Component
 * Protects content based on user roles and permissions
 * 
 * Usage Examples:
 * 1. Role-based: <PermissionGuard requiredRoles={[UserRole.ORG_ADMIN]}>...</PermissionGuard>
 * 2. Permission-based: <PermissionGuard resource={Resource.TOURNAMENTS} action={Action.CREATE}>...</PermissionGuard>
 * 3. Combined: <PermissionGuard requiredRoles={[UserRole.ORG_ADMIN]} resource={Resource.TEAMS} action={Action.DELETE}>...</PermissionGuard>
 */
export function PermissionGuard({
  children,
  requiredRoles = [],
  resource,
  action,
  scope,
  fallback,
  showError = true,
}: PermissionGuardProps) {
  const { user, isLoading, getUserRoles } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    if (fallback) return <>{fallback}</>;
    
    if (showError) {
      return (
        <Alert variant="destructive" className="m-4">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access this content.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  }

  const userRoles = getUserRoles() as UserRole[];

  // Super admins have access to everything
  if (user.isSuperAdmin) {
    console.log('✅ PermissionGuard: Super admin access granted');
    return <>{children}</>;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = canAccessRoute(userRoles, requiredRoles);
    
    console.log('🔍 PermissionGuard role check:', { 
      userRoles, 
      requiredRoles, 
      hasRequiredRole,
      isSuperAdmin: user.isSuperAdmin 
    });
    
    if (!hasRequiredRole) {
      if (fallback) return <>{fallback}</>;
      
      if (showError) {
        return (
          <Alert variant="destructive" className="m-4">
            <Lock className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have the required permissions to access this content.
              <div className="mt-3">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        );
      }
      
      return null;
    }
  }

  // Check permission-based access
  if (resource && action) {
    const hasRequiredPermission = hasPermission(userRoles, resource, action, scope);
    
    if (!hasRequiredPermission) {
      if (fallback) return <>{fallback}</>;
      
      if (showError) {
        return (
          <Alert variant="destructive" className="m-4">
            <Lock className="h-4 w-4" />
            <AlertTitle>Insufficient Permissions</AlertTitle>
            <AlertDescription>
              You don't have permission to {action} {resource}.
              <div className="mt-3">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        );
      }
      
      return null;
    }
  }

  return <>{children}</>;
}

/**
 * Route Guard Component
 * Wrapper for protecting entire routes
 */
interface RouteGuardProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export function RouteGuard({ 
  children, 
  requiredRoles = [],
  redirectTo = "/"
}: RouteGuardProps) {
  return (
    <PermissionGuard 
      requiredRoles={requiredRoles}
      showError={true}
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-md">
            <Lock className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this page.
              <div className="mt-4">
                <Link href={redirectTo}>
                  <Button variant="outline" size="sm">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      }
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Hook for checking permissions in components
 */
export function usePermissions() {
  const { getUserRoles } = useAuth();

  const checkPermission = (
    resource: Resource,
    action: Action,
    scope?: string
  ): boolean => {
    const userRoles = getUserRoles() as UserRole[];
    return hasPermission(userRoles, resource, action, scope);
  };

  const checkRole = (role: UserRole | UserRole[]): boolean => {
    const userRoles = getUserRoles() as UserRole[];
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return canAccessRoute(userRoles, rolesToCheck);
  };

  return {
    checkPermission,
    checkRole,
    can: checkPermission,
    hasRole: checkRole,
  };
}
