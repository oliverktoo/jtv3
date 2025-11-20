import { ReactNode } from "react";
import { Switch, Route, Redirect } from "wouter";
import { PermissionGuard, RouteGuard } from "@/components/rbac/PermissionGuard";
import { UserRole } from "@/lib/rbac/roles";
import { useAuth } from "@/hooks/useAuth";

// Import all page components
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import PendingApproval from "@/pages/auth/PendingApproval";
import PublicTournament from "@/pages/PublicTournament";
// import Tournaments from "@/pages/Tournaments"; // Removed - using TournamentSuperHub for all tournament functionality
// import TournamentDetail from "@/pages/TournamentDetail"; // Removed - using TournamentSuperHub instead
import Fixtures from "@/pages/Fixtures";
import Standings from "@/pages/Standings";
import Players from "@/pages/Players";
import TeamRoster from "@/pages/TeamRoster";
import Contracts from "@/pages/Contracts";
import Transfers from "@/pages/Transfers";
import Disciplinary from "@/pages/Disciplinary";
import Documents from "@/pages/Documents";
import Eligibility from "@/pages/Eligibility";
import Reports from "@/pages/Reports";
import UserManagement from "@/pages/UserManagement";
import PlayerRegistration from "@/pages/PlayerRegistration";
import PlayerProfile from "@/pages/PlayerProfile";
import PlayerHubEnhanced from "@/pages/PlayerHubEnhanced";
import AdminSuperHub from "@/pages/AdminSuperHub";
import PlayerCards from "@/pages/PlayerCards";
import TeamCommandCenter from "@/pages/TeamCommandCenter";
import TournamentSuperHub from "@/pages/TournamentSuperHub";
import MatchdayOperationsCenter from "@/pages/MatchdayOperationsCenter";
import PublicEngagementHub from "@/pages/PublicEngagementHub";
import DocumentReportingCenter from "@/pages/DocumentReportingCenter";
import GeographyDemo from "@/pages/GeographyDemo";
import Teams from "@/pages/Teams";
import TeamSelectionDemo from "@/pages/TeamSelectionDemo";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Public pages (individual - for backward compatibility)
import PublicHome from "@/pages/public/PublicHome";
import CompetitionsHub from "@/pages/public/CompetitionsHub";
import LiveCenter from "@/pages/public/LiveCenter";
import Leaderboards from "@/pages/public/Leaderboards";
import Venues from "@/pages/public/Venues";
import NewsMedia from "@/pages/public/NewsMedia";
import RosterManagement from "@/pages/team/RosterManagement";
import StaffOrganization from "@/pages/team/StaffOrganization";
import OperationsCenter from "@/pages/team/OperationsCenter";
import TeamAnalytics from "@/pages/team/TeamAnalytics";
import TrainingManagement from "@/pages/team/TrainingManagement";
import TransferHub from "@/pages/team/TransferHub";
import TeamSettings from "@/pages/team/TeamSettings";

// Marketplace pages
import MarketplaceHub from "@/pages/marketplace/MarketplaceHub";
import SellerDashboard from "@/pages/marketplace/SellerDashboard";
import ProductManagement from "@/pages/marketplace/ProductManagement";
import OrderManagement from "@/pages/marketplace/OrderManagement";
import MarketplaceAnalytics from "@/pages/marketplace/MarketplaceAnalytics";
import CustomerService from "@/pages/marketplace/CustomerService";
import ShoppingCart from "@/pages/marketplace/ShoppingCart";
import CustomerAccount from "@/pages/marketplace/CustomerAccount";

// Admin pages
import SystemConfiguration from "@/pages/admin/SystemConfiguration";
import MediaCenter from "@/pages/admin/MediaCenter";

// Matchday pages
import LiveMatchControl from "@/pages/matchday/LiveMatchControl";

// Ticketing pages
import EventManagement from "@/pages/ticketing/EventManagement";
import SalesDashboard from "@/pages/ticketing/SalesDashboard";
import AccessControl from "@/pages/ticketing/AccessControl";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  path?: string;
}

function ProtectedRoute({ children, requiredRoles = [], path }: ProtectedRouteProps) {
  return (
    <PermissionGuard requiredRoles={requiredRoles}>
      {path ? (
        <RouteGuard path={path}>
          {children}
        </RouteGuard>
      ) : (
        children
      )}
    </PermissionGuard>
  );
}

export default function RoleBasedRouter() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Auth routes - no authentication required */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/auth/pending-approval" component={PendingApproval} />
      
      {/* Public routes - no authentication required */}
      <Route path="/landing" component={Landing} />
      <Route path="/tournament/:slug" component={PublicTournament} />
      
      {/* Root route - show Landing if not authenticated, Home if authenticated */}
      <Route path="/">
        {user ? (
          <ProtectedRoute 
            requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.TEAM_MANAGER, UserRole.PLAYER, UserRole.MATCH_OFFICIAL]}
            path="/"
          >
            <Home />
          </ProtectedRoute>
        ) : (
          <Landing />
        )}
      </Route>
      
      {/* Public portal routes - consolidated hub */}
      <Route path="/public">
        <PublicEngagementHub />
      </Route>
      
      {/* Legacy public routes - redirect to consolidated hub */}
      <Route path="/public/home">
        <Redirect to="/public" />
      </Route>
      
      <Route path="/public/competitions">
        <Redirect to="/public" />
      </Route>
      
      <Route path="/public/live">
        <Redirect to="/public" />
      </Route>
      
      <Route path="/public/leaderboards">
        <Redirect to="/public" />
      </Route>
      
      <Route path="/public/venues">
        <Redirect to="/public" />
      </Route>
      
      <Route path="/public/news">
        <Redirect to="/public" />
      </Route>
      
      <Route path="/tournament-hub">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.COMPETITION_MANAGER, UserRole.TEAM_MANAGER, UserRole.MATCH_OFFICIAL]}
          path="/tournament-hub"
        >
          <TournamentSuperHub />
        </ProtectedRoute>
      </Route>
      
      {/* Team Selection Demo */}
      <Route path="/demo/team-selection">
        <ProtectedRoute path="/demo/team-selection">
          <TeamSelectionDemo />
        </ProtectedRoute>
      </Route>
      
      <Route path="/demo/team-selection/:tournamentId">
        <ProtectedRoute path="/demo/team-selection/:tournamentId">
          <TeamSelectionDemo />
        </ProtectedRoute>
      </Route>
      
      <Route path="/tournaments">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.COMPETITION_MANAGER, UserRole.TEAM_MANAGER, UserRole.MATCH_OFFICIAL]}
          path="/tournaments"
        >
          <TournamentSuperHub />
        </ProtectedRoute>
      </Route>
      
      <Route path="/tournaments/:id">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.COMPETITION_MANAGER, UserRole.TEAM_MANAGER, UserRole.MATCH_OFFICIAL]}
          path="/tournaments/:id"
        >
          <TournamentSuperHub />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teams">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF]}
          path="/teams"
        >
          <ErrorBoundary>
            <Teams />
          </ErrorBoundary>
        </ProtectedRoute>
      </Route>
      
      <Route path="/players">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR, UserRole.TEAM_MANAGER]}
          path="/players"
        >
          <Players />
        </ProtectedRoute>
      </Route>
      
      {/* Team management routes */}
      <Route path="/team/command">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF]}
          path="/team/command"
        >
          <TeamCommandCenter />
        </ProtectedRoute>
      </Route>
      
      <Route path="/team/roster">
        <ProtectedRoute 
          requiredRoles={[UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF]}
          path="/team/roster"
        >
          <RosterManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/team/staff">
        <ProtectedRoute 
          requiredRoles={[UserRole.TEAM_MANAGER]}
          path="/team/staff"
        >
          <StaffOrganization />
        </ProtectedRoute>
      </Route>
      
      <Route path="/team/operations">
        <ProtectedRoute 
          requiredRoles={[UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF]}
          path="/team/operations"
        >
          <OperationsCenter />
        </ProtectedRoute>
      </Route>
      
      <Route path="/team/analytics">
        <ProtectedRoute 
          requiredRoles={[UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF]}
          path="/team/analytics"
        >
          <TeamAnalytics />
        </ProtectedRoute>
      </Route>
      
      <Route path="/team/training">
        <ProtectedRoute 
          requiredRoles={[UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF]}
          path="/team/training"
        >
          <TrainingManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/team/transfers">
        <ProtectedRoute 
          requiredRoles={[UserRole.TEAM_MANAGER]}
          path="/team/transfers"
        >
          <TransferHub />
        </ProtectedRoute>
      </Route>
      
      <Route path="/team/settings">
        <ProtectedRoute 
          requiredRoles={[UserRole.TEAM_MANAGER]}
          path="/team/settings"
        >
          <TeamSettings />
        </ProtectedRoute>
      </Route>
      
      {/* Marketplace routes */}
      <Route path="/marketplace/hub">
        <ProtectedRoute path="/marketplace/hub">
          <MarketplaceHub />
        </ProtectedRoute>
      </Route>
      
      <Route path="/marketplace/seller">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR]}
          path="/marketplace/seller"
        >
          <SellerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/marketplace/products">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR]}
          path="/marketplace/products"
        >
          <ProductManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/marketplace/orders">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR]}
          path="/marketplace/orders"
        >
          <OrderManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/marketplace/analytics">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR]}
          path="/marketplace/analytics"
        >
          <MarketplaceAnalytics />
        </ProtectedRoute>
      </Route>
      
      <Route path="/marketplace/support">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER, UserRole.SPONSOR]}
          path="/marketplace/support"
        >
          <CustomerService />
        </ProtectedRoute>
      </Route>
      
      <Route path="/marketplace/cart">
        <ProtectedRoute path="/marketplace/cart">
          <ShoppingCart />
        </ProtectedRoute>
      </Route>
      
      <Route path="/marketplace/account">
        <ProtectedRoute path="/marketplace/account">
          <CustomerAccount />
        </ProtectedRoute>
      </Route>
      
      {/* Matchday Operations Center - Consolidated Hub */}
      <Route path="/matchday">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.MATCH_OFFICIAL, UserRole.COMPETITION_MANAGER]}
          path="/matchday"
        >
          <MatchdayOperationsCenter />
        </ProtectedRoute>
      </Route>
      
      {/* Legacy matchday routes - redirect to consolidated hub */}
      <Route path="/matchday/live-control">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/pre-match">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/post-match">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/officials">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/sheets">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/referee">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/disciplinary">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/venue">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/security">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/broadcast">
        <Redirect to="/matchday" />
      </Route>
      
      <Route path="/matchday/reports">
        <Redirect to="/matchday" />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin/config">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN]}
          path="/admin/config"
        >
          <SystemConfiguration />
        </ProtectedRoute>
      </Route>

      
      <Route path="/admin/media">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.MEDIA]}
          path="/admin/media"
        >
          <MediaCenter />
        </ProtectedRoute>
      </Route>
      
      {/* Ticketing routes */}
      <Route path="/ticketing/events">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.COMPETITION_MANAGER]}
          path="/ticketing/events"
        >
          <EventManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/ticketing/sales">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.COMPETITION_MANAGER]}
          path="/ticketing/sales"
        >
          <SalesDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/ticketing/access">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.COMPETITION_MANAGER]}
          path="/ticketing/access"
        >
          <AccessControl />
        </ProtectedRoute>
      </Route>
      
      {/* Legacy routes */}
      <Route path="/teams/:teamId/roster" component={TeamRoster} />
      <Route path="/fixtures" component={TournamentSuperHub} />
      <Route path="/standings" component={TournamentSuperHub} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/transfers" component={Transfers} />
      {/* DOCUMENT & REPORTING CENTER - Consolidated administrative hub */}
      <Route path="/document-center" component={DocumentReportingCenter} />
      
      {/* Legacy redirects for backward compatibility */}
      <Route path="/disciplinary"><Redirect to="/document-center" /></Route>
      <Route path="/documents"><Redirect to="/document-center" /></Route>
      <Route path="/eligibility"><Redirect to="/document-center" /></Route>
      <Route path="/reports"><Redirect to="/document-center" /></Route>
      
      <Route path="/users">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN]}
          path="/users"
        >
          <UserManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/register" component={PlayerRegistration} />
      <Route path="/profile" component={PlayerHubEnhanced} />
      <Route path="/player/:playerId" component={PlayerHubEnhanced} />
      
      <Route path="/registrar">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN, UserRole.REGISTRAR]}
          path="/registrar"
        >
          <AdminSuperHub />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute 
          requiredRoles={[UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN]}
          path="/admin"
        >
          <AdminSuperHub />
        </ProtectedRoute>
      </Route>
      
      {/* Legacy redirects for consolidated systems */}
      <Route path="/admin/dashboard"><Redirect to="/admin" /></Route>
      <Route path="/admin/analytics"><Redirect to="/admin" /></Route>
      <Route path="/manager"><Redirect to="/team" /></Route>
      
      <Route path="/cards" component={PlayerCards} />
      
      <Route path="/manager">
        <ProtectedRoute 
          requiredRoles={[UserRole.TEAM_MANAGER, UserRole.TEAM_STAFF]}
          path="/manager"
        >
          <TeamCommandCenter />
        </ProtectedRoute>
      </Route>
      
      <Route path="/geography" component={GeographyDemo} />
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}