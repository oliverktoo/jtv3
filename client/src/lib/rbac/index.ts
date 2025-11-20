// Enhanced Role-Based Access Control (RBAC) System
// Comprehensive navigation and security system for Jamii Tourney v3

export { UserRole, navigationConfig, rolePermissions, getUserRoles, hasPermission, getNavigationForRole, canAccessRoute } from './roles';
export { PermissionGuard, RouteGuard } from '../../components/rbac/PermissionGuard';
export { default as RoleBasedSidebar } from '../../components/rbac/RoleBasedSidebar';
export { default as RoleBasedRouter } from '../../components/rbac/RoleBasedRouter';
export { DynamicBreadcrumbs, EnhancedBreadcrumbs } from '../../components/rbac/DynamicBreadcrumbs';
export { OrganizationContextSwitcher } from '../../components/rbac/OrganizationContextSwitcher';