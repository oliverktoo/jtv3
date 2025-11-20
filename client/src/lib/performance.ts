import { lazy } from 'react';

// Preload strategy for critical routes
export const preloadRoutes = {
  // Preload these components when user is authenticated
  preloadOnAuth: [
    () => import("@/pages/TournamentSuperHub"),
    () => import("@/pages/PlayerHubEnhanced"),
    () => import("@/pages/Players"),
    () => import("@/pages/Tournaments")
  ],
  
  // Preload these on user interaction (hover, etc)
  preloadOnHover: {
    '/admin': () => import("@/pages/AdminSuperHub"),
    '/teams': () => import("@/pages/TeamCommandCenter"),
    '/matchday': () => import("@/pages/MatchdayOperationsCenter"),
    '/settings': () => import("@/pages/Settings")
  },

  // Preload these components in idle time
  preloadOnIdle: [
    () => import("@/pages/ManagerDashboard"),
    () => import("@/pages/SimpleDashboard"),
    () => import("@/pages/TeamRoster")
  ]
};

// Preload function to be called after initial load
export const preloadCriticalComponents = () => {
  if ('requestIdleCallback' in window) {
    // Use idle callback if available
    requestIdleCallback(() => {
      preloadRoutes.preloadOnAuth.forEach(loader => {
        loader().catch(() => {}); // Silently fail
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      preloadRoutes.preloadOnAuth.forEach(loader => {
        loader().catch(() => {});
      });
    }, 2000);
  }
};

// Preload on hover function
export const preloadOnHover = (path: string) => {
  const loader = preloadRoutes.preloadOnHover[path as keyof typeof preloadRoutes.preloadOnHover];
  if (loader) {
    loader().catch(() => {});
  }
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};