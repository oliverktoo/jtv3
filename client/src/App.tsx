import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import RoleBasedSidebar from "@/components/rbac/RoleBasedSidebar";
import RoleBasedRouter from "@/components/rbac/RoleBasedRouter";
import { DynamicBreadcrumbs } from "@/components/rbac/DynamicBreadcrumbs";
import { OrganizationContextSwitcher } from "@/components/rbac/OrganizationContextSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function App() {
  const { user } = useAuth();
  
  const style = {
    "--sidebar-width": "18rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full bg-background">
            {/* Enhanced RBAC Sidebar */}
            <RoleBasedSidebar />
            
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Enhanced Header with RBAC Context */}
              <header className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  
                  {/* Organization Context Switcher */}
                  <OrganizationContextSwitcher variant="compact" />
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  {/* Quick Search */}
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <Search className="h-4 w-4" />
                  </Button>
                  
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 bg-red-500">
                      3
                    </Badge>
                  </Button>
                  
                  {/* User Profile */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {user?.roles?.[0]?.role || 'Admin'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <ThemeToggle />
                </div>
              </header>
              
              {/* Dynamic Breadcrumbs */}
              <div className="px-4 py-2 border-b bg-muted/30">
                <DynamicBreadcrumbs />
              </div>
              
              {/* Main Content Area with RBAC Router */}
              <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                  <RoleBasedRouter />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

