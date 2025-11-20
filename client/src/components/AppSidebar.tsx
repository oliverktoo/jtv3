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
import { Home, Trophy, Calendar, BarChart3, Users, Settings, FileText, ArrowRightLeft, AlertTriangle, FileCheck, Shield, FileBarChart, UserCog, User, UserCheck, QrCode, Crown, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Registrar Console", url: "/registrar", icon: UserCheck },
  { title: "Manager Dashboard", url: "/manager", icon: Crown },
  { title: "Player Cards", url: "/cards", icon: QrCode },
  { title: "Kenya Geography", url: "/geography", icon: MapPin },
  { title: "Tournaments", url: "/tournaments", icon: Trophy },
  { title: "Teams", url: "/teams", icon: Users },
  { title: "Players", url: "/players", icon: Users },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "Transfers", url: "/transfers", icon: ArrowRightLeft },
  { title: "Disciplinary", url: "/disciplinary", icon: AlertTriangle },
  { title: "Documents", url: "/documents", icon: FileCheck },
  { title: "Eligibility", url: "/eligibility", icon: Shield },
  { title: "Standings", url: "/standings", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileBarChart },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const userInitials = user 
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"
    : "U";

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
              
              {user?.isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={location === "/users" ? "bg-sidebar-accent" : ""}
                    data-testid="link-user-management"
                  >
                    <Link href="/users">
                      <UserCog className="h-4 w-4" />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8" data-testid="avatar-user">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="text-user-role">
              {user?.isSuperAdmin ? "Super Admin" : "User"}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
