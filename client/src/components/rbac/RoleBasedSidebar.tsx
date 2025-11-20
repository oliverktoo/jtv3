import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  ChevronRight, 
  Search, 
  Settings, 
  LogOut,
  Building,
  ChevronDown,
  Home,
  Users,
  User,
  Globe,
  Shield,
  BarChart3,
  Calendar,
  FileText,
  ArrowRightLeft,
  AlertTriangle,
  FileCheck,
  FileBarChart,
  UserCog,
  UserCheck,
  Crown,
  CreditCard,
  MapPin,
  ShoppingCart,
  Clock,
  Ticket
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NavigationItem, getUserRoles, getNavigationForRole } from "@/lib/rbac/roles";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Simple icon component that renders appropriate icons
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const iconComponents = {
    Home, Trophy, Users, User, Globe, Shield, Settings, BarChart3, 
    Calendar, FileText, ArrowRightLeft, AlertTriangle, FileCheck,
    FileBarChart, UserCog, UserCheck, Crown, CreditCard, MapPin, 
    ShoppingCart, Clock, Ticket,
    // Additional icons with fallbacks
    Radio: Trophy,
    Newspaper: FileText,
    Store: ShoppingCart,
    Package: Trophy,
    ShoppingBag: ShoppingCart,
    TrendingUp: BarChart3,
    Headphones: Trophy,
    Command: Trophy,
    Activity: BarChart3,
    Zap: Trophy,
    Award: Trophy,
    Bell: Trophy,
    Video: Trophy,
    LayoutDashboard: Trophy,
    DollarSign: Trophy,
    Camera: Trophy,
    Handshake: Trophy,
    Cog: Settings,
    Scan: Trophy
  };
  
  const IconComponent = iconComponents[name as keyof typeof iconComponents] || Trophy;
  return <IconComponent className={className} />;
}

interface RoleBasedSidebarProps {
  className?: string;
}

export default function RoleBasedSidebar({ className }: RoleBasedSidebarProps) {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['core']));
  const { user } = useAuth();
  
  const userRoles = getUserRoles(user);
  const navigation = getNavigationForRole(userRoles);
  
  // Filter navigation based on search term
  const filteredNavigation = useMemo(() => {
    if (!searchTerm) return navigation;
    
    return navigation.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.children?.some(child => 
        child.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ).map(item => ({
      ...item,
      children: item.children?.filter(child =>
        child.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }));
  }, [navigation, searchTerm]);
  
  // Group navigation items by category
  const groupedNavigation = useMemo(() => {
    const groups: Record<string, NavigationItem[]> = {};
    
    filteredNavigation.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    
    return groups;
  }, [filteredNavigation]);
  
  const userInitials = user 
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"
    : "U";
  
  const toggleGroup = (groupName: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupName)) {
      newOpenGroups.delete(groupName);
    } else {
      newOpenGroups.add(groupName);
    }
    setOpenGroups(newOpenGroups);
  };
  
  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };
  
  const getCategoryLabel = (category: string) => {
    const labels = {
      core: 'Core System',
      public: 'Public Portal',
      admin: 'Admin Console',
      team: 'Team Management',
      player: 'Player Hub',
      marketplace: 'Marketplace',
      official: 'Match Officials',
      special: 'Special Features'
    };
    return labels[category as keyof typeof labels] || category;
  };
  
  const getCategoryIcon = (category: string) => {
    const icons = {
      core: Trophy,
      public: Globe,
      admin: Settings,
      team: Shield,
      player: User,
      marketplace: ShoppingCart,
      official: Clock,
      special: Trophy
    };
    return icons[category as keyof typeof icons] || Trophy;
  };

  return (
    <Sidebar className={className}>
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Jamii Tourney</h2>
            <p className="text-xs text-muted-foreground">v3.0 RBAC</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto">
        {Object.entries(groupedNavigation).map(([category, items]) => {
          const isGroupOpen = openGroups.has(category);
          const CategoryIcon = getCategoryIcon(category);
          
          return (
            <Collapsible 
              key={category}
              open={isGroupOpen}
              onOpenChange={() => toggleGroup(category)}
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between py-2 px-3 hover:bg-sidebar-accent rounded-md cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4" />
                      <span>{getCategoryLabel(category)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {items.length}
                      </Badge>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`} />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          {item.children && item.children.length > 0 ? (
                            // Parent item with children
                            <Collapsible defaultOpen={isActive(item.path)}>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                  className={`w-full justify-between ${isActive(item.path) ? "bg-sidebar-accent" : ""}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <DynamicIcon name={item.icon} className="h-4 w-4" />
                                    <span>{item.label}</span>
                                  </div>
                                  <ChevronRight className="h-3 w-3" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {item.children.map((child) => (
                                    <SidebarMenuSubItem key={child.id}>
                                      <SidebarMenuSubButton
                                        asChild
                                        className={isActive(child.path) ? "bg-sidebar-accent" : ""}
                                      >
                                        <Link href={child.path}>
                                          <DynamicIcon name={child.icon} className="h-3 w-3" />
                                          <span>{child.label}</span>
                                          {child.badge && (
                                            <Badge variant="secondary" className="ml-auto text-xs">
                                              {child.badge}
                                            </Badge>
                                          )}
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : (
                            // Regular menu item
                            <SidebarMenuButton
                              asChild
                              className={isActive(item.path) ? "bg-sidebar-accent" : ""}
                            >
                              <Link href={item.path}>
                                <DynamicIcon name={item.icon} className="h-4 w-4" />
                                <span>{item.label}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="ml-auto text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs px-1 py-0">
                {userRoles[0] || 'Public'}
              </Badge>
              {userRoles.length > 1 && (
                <span className="text-muted-foreground">+{userRoles.length - 1}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Organization Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start mb-2">
              <Building className="h-4 w-4 mr-2" />
              <span className="truncate">Default Organization</span>
              <ChevronDown className="h-3 w-3 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuItem>
              <Building className="h-4 w-4 mr-2" />
              Default Organization
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Manage Organizations
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="flex-1">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}