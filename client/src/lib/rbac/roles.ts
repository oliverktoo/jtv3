// Enhanced Role-Based Access Control System
// Defines all user roles and their permission matrices

export enum UserRole {
  // System Level
  SYSTEM_ADMIN = 'system_admin',
  
  // Organization Level  
  ORG_ADMIN = 'org_admin',
  REGISTRAR = 'registrar',
  
  // Competition Level
  MATCH_OFFICIAL = 'match_official',
  COMPETITION_MANAGER = 'competition_manager',
  
  // Team Level
  TEAM_MANAGER = 'team_manager',
  TEAM_STAFF = 'team_staff',
  
  // Individual Level
  PLAYER = 'player',
  
  // Public/External
  FAN = 'fan',
  MEDIA = 'media',
  SPONSOR = 'sponsor',
  PUBLIC = 'public'
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'approve' | 'export';
  scope: 'system' | 'organization' | 'tournament' | 'team' | 'own' | 'public';
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
  permissions?: Permission[];
  children?: NavigationItem[];
  badge?: string;
  description?: string;
  category: 'core' | 'admin' | 'public' | 'team' | 'player' | 'marketplace' | 'official' | 'special';
}

// Complete navigation configuration for all 76+ pages
export const navigationConfig: NavigationItem[] = [
  // CORE SYSTEM PAGES
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'Home',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.TEAM_MANAGER, UserRole.PLAYER, UserRole.MATCH_OFFICIAL],
    category: 'core'
  },

  // PUBLIC ENGAGEMENT MODULE - CONSOLIDATED HUB
  {
    id: 'public-engagement-hub',
    label: 'Public Engagement Hub',
    path: '/public',
    icon: 'Globe',
    roles: Object.values(UserRole), // All roles
    category: 'public',
    description: 'Unified public portal with Home, Competitions, Live Center, Leaderboards, Venues & News in one interface'
  },

  // TOURNAMENT MANAGEMENT HUB - UNIFIED INTERFACE
  {
    id: 'tournaments',
    label: 'Tournaments',
    path: '/tournament-hub',
    icon: 'Trophy',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.COMPETITION_MANAGER, UserRole.TEAM_MANAGER, UserRole.MATCH_OFFICIAL],
    category: 'core',
    description: 'Comprehensive tournament management with tournaments, teams, fixtures, standings, and settings'
  },

  // TEAMS MANAGEMENT
  {
    id: 'teams',
    label: 'Teams',
    path: '/teams',
    icon: 'Users',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF],
    category: 'core'
  },

  // TEAM COMMAND CENTER MODULE (8 pages)
  {
    id: 'team-center',
    label: 'Team Center',
    path: '/team',
    icon: 'Shield',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF, UserRole.PLAYER],
    category: 'team',
    children: [
      {
        id: 'team-command',
        label: 'Command Center',
        path: '/team/command',
        icon: 'Command',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF],
        category: 'team'
      },
      {
        id: 'roster-management',
        label: 'Roster Management',
        path: '/team/roster',
        icon: 'Users',
        roles: [UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF],
        category: 'team'
      },
      {
        id: 'staff-organization',
        label: 'Staff Organization',
        path: '/team/staff',
        icon: 'UserCog',
        roles: [UserRole.TEAM_MANAGER],
        category: 'team'
      },
      {
        id: 'operations-center',
        label: 'Operations Center',
        path: '/team/operations',
        icon: 'Activity',
        roles: [UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF],
        category: 'team'
      },
      {
        id: 'team-analytics',
        label: 'Team Analytics',
        path: '/team/analytics',
        icon: 'BarChart3',
        roles: [UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF],
        category: 'team'
      },
      {
        id: 'training-management',
        label: 'Training Management',
        path: '/team/training',
        icon: 'Zap',
        roles: [UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF],
        category: 'team'
      },
      {
        id: 'transfer-hub',
        label: 'Transfer Hub',
        path: '/team/transfers',
        icon: 'ArrowRightLeft',
        roles: [UserRole.TEAM_MANAGER],
        category: 'team'
      },
      {
        id: 'team-settings',
        label: 'Team Settings',
        path: '/team/settings',
        icon: 'Settings',
        roles: [UserRole.TEAM_MANAGER],
        category: 'team'
      }
    ]
  },

  // PLAYERS MANAGEMENT
  {
    id: 'players',
    label: 'Players',
    path: '/players',
    icon: 'Users',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.TEAM_MANAGER],
    category: 'core'
  },

  // PLAYER HUB MODULE (6 pages)
  {
    id: 'player-hub',
    label: 'Player Hub',
    path: '/player',
    icon: 'User',
    roles: [UserRole.PLAYER, UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF, UserRole.REGISTRAR],
    category: 'player',
    children: [
      {
        id: 'player-profile',
        label: 'My Profile',
        path: '/player/profile',
        icon: 'User',
        roles: [UserRole.PLAYER, UserRole.TEAM_MANAGER, UserRole.REGISTRAR],
        category: 'player'
      },
      {
        id: 'player-documents',
        label: 'Documents',
        path: '/player/documents',
        icon: 'FileText',
        roles: [UserRole.PLAYER, UserRole.REGISTRAR],
        category: 'player'
      },
      {
        id: 'player-achievements',
        label: 'Achievements',
        path: '/player/achievements',
        icon: 'Award',
        roles: [UserRole.PLAYER, UserRole.TEAM_MANAGER],
        category: 'player'
      },
      {
        id: 'player-statistics',
        label: 'Statistics',
        path: '/player/stats',
        icon: 'BarChart3',
        roles: [UserRole.PLAYER, UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF],
        category: 'player'
      },
      {
        id: 'player-privacy',
        label: 'Privacy Controls',
        path: '/player/privacy',
        icon: 'Shield',
        roles: [UserRole.PLAYER],
        category: 'player'
      },
      {
        id: 'player-notifications',
        label: 'Notifications',
        path: '/player/notifications',
        icon: 'Bell',
        roles: [UserRole.PLAYER],
        category: 'player'
      }
    ]
  },

  // MARKETPLACE MODULE (8 pages)
  {
    id: 'marketplace',
    label: 'Marketplace',
    path: '/marketplace',
    icon: 'ShoppingCart',
    roles: Object.values(UserRole), // All roles can access marketplace
    category: 'marketplace',
    children: [
      {
        id: 'marketplace-hub',
        label: 'Marketplace Hub',
        path: '/marketplace/hub',
        icon: 'Store',
        roles: Object.values(UserRole),
        category: 'marketplace'
      },
      {
        id: 'seller-dashboard',
        label: 'Seller Dashboard',
        path: '/marketplace/seller',
        icon: 'BarChart3',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR],
        category: 'marketplace'
      },
      {
        id: 'product-management',
        label: 'Product Management',
        path: '/marketplace/products',
        icon: 'Package',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR],
        category: 'marketplace'
      },
      {
        id: 'order-management',
        label: 'Order Management',
        path: '/marketplace/orders',
        icon: 'ShoppingBag',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR],
        category: 'marketplace'
      },
      {
        id: 'marketplace-analytics',
        label: 'Analytics',
        path: '/marketplace/analytics',
        icon: 'TrendingUp',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR],
        category: 'marketplace'
      },
      {
        id: 'customer-service',
        label: 'Customer Service',
        path: '/marketplace/support',
        icon: 'Headphones',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR],
        category: 'marketplace'
      },
      {
        id: 'shopping-cart',
        label: 'Shopping Cart',
        path: '/marketplace/cart',
        icon: 'ShoppingCart',
        roles: Object.values(UserRole),
        category: 'marketplace'
      },
      {
        id: 'customer-account',
        label: 'My Account',
        path: '/marketplace/account',
        icon: 'User',
        roles: Object.values(UserRole),
        category: 'marketplace'
      }
    ]
  },

  // MATCHDAY OPERATIONS MODULE - CONSOLIDATED HUB
  {
    id: 'matchday-operations-center',
    label: 'Matchday Operations Center',
    path: '/matchday',
    icon: 'Clock',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.MATCH_OFFICIAL, UserRole.COMPETITION_MANAGER],
    category: 'official',
    description: 'Comprehensive matchday management with Overview, Pre-Match, Live Control, Officials, and Post-Match tabs'
  },



  // TICKETING MODULE (4 pages)
  {
    id: 'ticketing',
    label: 'Ticketing',
    path: '/ticketing',
    icon: 'Ticket',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.COMPETITION_MANAGER, UserRole.FAN, UserRole.PUBLIC],
    category: 'special',
    children: [
      {
        id: 'event-management',
        label: 'Event Management',
        path: '/ticketing/events',
        icon: 'Calendar',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.COMPETITION_MANAGER],
        category: 'special'
      },
      {
        id: 'sales-dashboard',
        label: 'Sales Dashboard',
        path: '/ticketing/sales',
        icon: 'BarChart3',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.COMPETITION_MANAGER],
        category: 'special'
      },
      {
        id: 'access-control',
        label: 'Access Control',
        path: '/ticketing/access',
        icon: 'Scan',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.COMPETITION_MANAGER],
        category: 'special'
      },
      {
        id: 'ticket-support',
        label: 'Customer Support',
        path: '/ticketing/support',
        icon: 'Headphones',
        roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.COMPETITION_MANAGER],
        category: 'special'
      }
    ]
  },


  // DOCUMENT & REPORTING CENTER MODULE - CONSOLIDATED HUB
  {
    id: 'document-reporting-center',
    label: 'Document & Reporting Center',
    path: '/document-center',
    icon: 'FileBarChart',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.COMPETITION_MANAGER, UserRole.MATCH_OFFICIAL],
    category: 'admin',
    description: 'Unified administrative hub combining document management, analytics, eligibility rules, and disciplinary tracking'
  },



  // SPECIAL PAGES
  {
    id: 'admin-super-hub',
    label: 'Admin SuperHub',
    path: '/admin',
    icon: 'Settings',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR],
    category: 'admin',
    description: 'Unified administrative control center for system management, registrations, analytics, and configuration'
  },
  {
    id: 'player-cards',
    label: 'Player Cards',
    path: '/cards',
    icon: 'CreditCard',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.TEAM_MANAGER, UserRole.PLAYER],
    category: 'special'
  },
  {
    id: 'geography',
    label: 'Kenya Geography',
    path: '/geography',
    icon: 'MapPin',
    roles: [UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR],
    category: 'special'
  }
];

// Role permission matrix
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SYSTEM_ADMIN]: [
    { resource: '*', action: 'manage', scope: 'system' }
  ],
  [UserRole.ORG_ADMIN]: [
    { resource: '*', action: 'manage', scope: 'organization' },
    { resource: 'public', action: 'read', scope: 'public' }
  ],
  [UserRole.REGISTRAR]: [
    { resource: 'players', action: 'manage', scope: 'organization' },
    { resource: 'teams', action: 'manage', scope: 'organization' },
    { resource: 'documents', action: 'manage', scope: 'organization' },
    { resource: 'eligibility', action: 'manage', scope: 'organization' }
  ],
  [UserRole.COMPETITION_MANAGER]: [
    { resource: 'tournaments', action: 'manage', scope: 'tournament' },
    { resource: 'matches', action: 'manage', scope: 'tournament' },
    { resource: 'fixtures', action: 'manage', scope: 'tournament' }
  ],
  [UserRole.MATCH_OFFICIAL]: [
    { resource: 'matches', action: 'update', scope: 'tournament' },
    { resource: 'disciplinary', action: 'create', scope: 'tournament' }
  ],
  [UserRole.TEAM_MANAGER]: [
    { resource: 'team', action: 'manage', scope: 'team' },
    { resource: 'players', action: 'manage', scope: 'team' },
    { resource: 'contracts', action: 'manage', scope: 'team' },
    { resource: 'transfers', action: 'create', scope: 'team' }
  ],
  [UserRole.TEAM_STAFF]: [
    { resource: 'team', action: 'read', scope: 'team' },
    { resource: 'players', action: 'read', scope: 'team' }
  ],
  [UserRole.PLAYER]: [
    { resource: 'profile', action: 'manage', scope: 'own' },
    { resource: 'documents', action: 'manage', scope: 'own' },
    { resource: 'contracts', action: 'read', scope: 'own' }
  ],
  [UserRole.FAN]: [
    { resource: 'public', action: 'read', scope: 'public' },
    { resource: 'marketplace', action: 'read', scope: 'public' },
    { resource: 'tickets', action: 'manage', scope: 'own' }
  ],
  [UserRole.MEDIA]: [
    { resource: 'public', action: 'read', scope: 'public' },
    { resource: 'media', action: 'create', scope: 'organization' }
  ],
  [UserRole.SPONSOR]: [
    { resource: 'public', action: 'read', scope: 'public' },
    { resource: 'marketplace', action: 'manage', scope: 'own' }
  ],
  [UserRole.PUBLIC]: [
    { resource: 'public', action: 'read', scope: 'public' }
  ]
};

// Helper functions
export function getUserRoles(user: any): UserRole[] {
  if (!user) return [UserRole.PUBLIC];
  if (user.isSuperAdmin) return [UserRole.SYSTEM_ADMIN];
  
  // Extract roles from user.roles array or default to basic roles
  const roles = user.roles?.map((role: any) => role.role) || [];
  return roles.length > 0 ? roles : [UserRole.FAN];
}

export function hasPermission(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  if (requiredRoles.includes(UserRole.PUBLIC)) return true;
  return userRoles.some(role => requiredRoles.includes(role));
}

export function getNavigationForRole(userRoles: UserRole[]): NavigationItem[] {
  return navigationConfig.filter(item => hasPermission(userRoles, item.roles));
}

export function canAccessRoute(userRoles: UserRole[], route: string): boolean {
  const item = findNavigationItem(route);
  if (!item) return false;
  return hasPermission(userRoles, item.roles);
}

function findNavigationItem(path: string): NavigationItem | null {
  // First try exact match
  for (const item of navigationConfig) {
    if (item.path === path) return item;
    if (item.children) {
      for (const child of item.children) {
        if (child.path === path) return child;
      }
    }
  }
  
  // If no exact match, try pattern matching for dynamic routes
  for (const item of navigationConfig) {
    if (matchesRoutePattern(item.path, path)) return item;
    if (item.children) {
      for (const child of item.children) {
        if (matchesRoutePattern(child.path, path)) return child;
      }
    }
  }
  
  return null;
}

// Helper function to match route patterns like /tournaments/:id with /tournaments/123
function matchesRoutePattern(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  if (patternParts.length !== pathParts.length) return false;
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    
    // If pattern part starts with :, it's a parameter and matches any value
    if (patternPart.startsWith(':')) continue;
    
    // Otherwise it must match exactly
    if (patternPart !== pathPart) return false;
  }
  
  return true;
}