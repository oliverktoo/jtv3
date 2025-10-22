import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import PublicTournament from "@/pages/PublicTournament";
import Home from "@/pages/Home";
import Tournaments from "@/pages/Tournaments";
import TournamentDetail from "@/pages/TournamentDetail";
import Fixtures from "@/pages/Fixtures";
import Standings from "@/pages/Standings";
import Players from "@/pages/Players";
import TeamRoster from "@/pages/TeamRoster";
import Contracts from "@/pages/Contracts";
import Transfers from "@/pages/Transfers";
import Disciplinary from "@/pages/Disciplinary";
import Documents from "@/pages/Documents";
import Eligibility from "@/pages/Eligibility";
import Teams from "@/pages/Teams";
import Reports from "@/pages/Reports";
import UserManagement from "@/pages/UserManagement";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

// Public routes that don't require authentication
function PublicRoutes() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/tournament/:slug" component={PublicTournament} />
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

// Protected routes that require authentication
function ProtectedRouter() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/tournaments/:tournamentId" component={TournamentDetail} />
      <Route path="/teams" component={Teams} />
      <Route path="/players" component={Players} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/transfers" component={Transfers} />
      <Route path="/disciplinary" component={Disciplinary} />
      <Route path="/documents" component={Documents} />
      <Route path="/eligibility" component={Eligibility} />
      <Route path="/teams/:teamId/roster" component={TeamRoster} />
      <Route path="/fixtures" component={Fixtures} />
      <Route path="/standings" component={Standings} />
      <Route path="/reports" component={Reports} />
      <Route path="/users" component={UserManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <ProtectedRouter />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" data-testid="spinner-loading" />
      </div>
    );
  }

  // Public routes accessible without authentication
  const publicRoutes = ["/tournament/"];
  const isPublicRoute = publicRoutes.some(route => location.startsWith(route));

  if (!isAuthenticated && isPublicRoute) {
    return <PublicRoutes />;
  }

  if (isAuthenticated) {
    return <AuthenticatedApp />;
  }

  return <Landing />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
