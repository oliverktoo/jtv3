import React, { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="ml-4 text-gray-600">Loading...</p>
  </div>
);

// Keep critical pages loaded immediately (no lazy loading for auth and landing)
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import PublicTournament from "@/pages/PublicTournament";

// Auth pages - keep these non-lazy for faster authentication flow
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import SimpleSignupPage from "@/pages/auth/SimpleSignupPage";
import FixedSignupPage from "@/pages/auth/FixedSignupPage";
import { MagicLinkSignupPage } from "@/pages/auth/MagicLinkSignupPage";
import { FastSignupPage } from "@/pages/auth/FastSignupPage";
import { AuthCallbackPage } from "@/pages/auth/AuthCallbackPage";
import { ImprovedLoginPage } from "@/pages/auth/ImprovedLoginPage";
import { AuthNavigationDebug } from "@/components/auth/AuthNavigationDebug";

// Lazy load major feature hubs (these are large and benefit most from splitting)
const TournamentSuperHub = lazy(() => import("@/pages/TournamentSuperHub"));
const PlayerHubEnhanced = lazy(() => import("@/pages/PlayerHubEnhanced"));
const AdminSuperHub = lazy(() => import("@/pages/AdminSuperHub"));
const TeamCommandCenter = lazy(() => import("@/pages/TeamCommandCenter"));
const MatchdayOperationsCenter = lazy(() => import("@/pages/MatchdayOperationsCenter"));
const PublicEngagementHub = lazy(() => import("@/pages/PublicEngagementHub"));

// Lazy load individual pages (only confirmed existing ones)
const Players = lazy(() => import("@/pages/Players"));
const Tournaments = lazy(() => import("@/pages/Tournaments"));
const Teams = lazy(() => import("@/pages/Teams"));
const ManagerDashboard = lazy(() => import("@/pages/ManagerDashboard"));
const SimpleDashboard = lazy(() => import("@/pages/SimpleDashboard"));
const PlayerRegistration = lazy(() => import("@/pages/PlayerRegistration"));
const TeamRoster = lazy(() => import("@/pages/TeamRoster"));
const Settings = lazy(() => import("@/pages/Settings"));

// Higher-order component to wrap lazy components with Suspense
const withSuspense = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );
};

// Create wrapped components for the main pages
const LazyTournamentSuperHub = withSuspense(TournamentSuperHub);
const LazyPlayerHubEnhanced = withSuspense(PlayerHubEnhanced);
const LazyAdminSuperHub = withSuspense(AdminSuperHub);
const LazyTeamCommandCenter = withSuspense(TeamCommandCenter);
const LazyMatchdayOperationsCenter = withSuspense(MatchdayOperationsCenter);
const LazyPublicEngagementHub = withSuspense(PublicEngagementHub);
const LazyPlayers = withSuspense(Players);
const LazyTournaments = withSuspense(Tournaments);
const LazyTeams = withSuspense(Teams);
const LazyManagerDashboard = withSuspense(ManagerDashboard);
const LazySimpleDashboard = withSuspense(SimpleDashboard);
const LazyPlayerRegistration = withSuspense(PlayerRegistration);
const LazyTeamRoster = withSuspense(TeamRoster);
const LazySettings = withSuspense(Settings);

export default function OptimizedRoleBasedRouter() {
  return (
    <Switch>
      {/* Public Routes - No lazy loading for instant access */}
      <Route path="/landing" component={Landing} />
      <Route path="/public/tournament/:id" component={PublicTournament} />

      {/* Auth Routes - No lazy loading for fast auth flow */}
      <Route path="/login" component={LoginPage} />
      <Route path="/improved-login" component={ImprovedLoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/simple-signup" component={SimpleSignupPage} />
      <Route path="/fixed-signup" component={FixedSignupPage} />
      <Route path="/magic-link-signup" component={MagicLinkSignupPage} />
      <Route path="/fast-signup" component={FastSignupPage} />
      <Route path="/auth/callback" component={AuthCallbackPage} />
      <Route path="/auth-debug" component={AuthNavigationDebug} />
      
      {/* Main app routes */}
      <Route path="/home" component={Home} />

      {/* Feature Hubs - Lazy loaded for performance */}
      <Route path="/tournaments/*" component={LazyTournamentSuperHub} />
      <Route path="/players/*" component={LazyPlayerHubEnhanced} />
      <Route path="/admin/*" component={LazyAdminSuperHub} />
      <Route path="/teams/*" component={LazyTeamCommandCenter} />
      <Route path="/matchday/*" component={LazyMatchdayOperationsCenter} />
      <Route path="/public/*" component={LazyPublicEngagementHub} />

      {/* Individual Pages - Lazy loaded */}      
      <Route path="/players-list" component={LazyPlayers} />
      <Route path="/tournaments-list" component={LazyTournaments} />
      <Route path="/teams-list" component={LazyTeams} />
      <Route path="/manager-dashboard" component={LazyManagerDashboard} />
      <Route path="/simple-dashboard" component={LazySimpleDashboard} />
      <Route path="/player-registration" component={LazyPlayerRegistration} />
      <Route path="/team-roster" component={LazyTeamRoster} />
      <Route path="/settings" component={LazySettings} />

      {/* Redirect root to home */}
      <Route path="/">
        <Redirect to="/home" />
      </Route>
    </Switch>
  );
}

// Named export for compatibility
export { OptimizedRoleBasedRouter };