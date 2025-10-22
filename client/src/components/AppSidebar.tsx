import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, Trophy, Calendar, BarChart3, Users, Settings, FileText, ArrowRightLeft, AlertTriangle, FileCheck } from "lucide-react";
import { Link, useLocation } from "wouter";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Tournaments", url: "/tournaments", icon: Trophy },
  { title: "Players", url: "/players", icon: Users },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "Transfers", url: "/transfers", icon: ArrowRightLeft },
  { title: "Disciplinary", url: "/disciplinary", icon: AlertTriangle },
  { title: "Documents", url: "/documents", icon: FileCheck },
  { title: "Fixtures", url: "/fixtures", icon: Calendar },
  { title: "Standings", url: "/standings", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Jamii Tourney</h2>
            <p className="text-xs text-muted-foreground">v3.0</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? "bg-sidebar-accent" : ""}
                      data-testid={`link-${item.title.toLowerCase()}`}
                    >
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          © 2025 Jamii Tourney
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
