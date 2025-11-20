import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { navigationConfig } from "@/lib/rbac/roles";

// Memoize navigation items to prevent unnecessary re-renders
const NavigationItem = memo(({ item }: { item: any }) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild>
      <a 
        href={item.href} 
        className={cn(
          "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
          "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="text-xs">
            {item.badge}
          </Badge>
        )}
      </a>
    </SidebarMenuButton>
  </SidebarMenuItem>
));

NavigationItem.displayName = "NavigationItem";

// Memoize navigation groups
const NavigationGroup = memo(({ group }: { group: any }) => (
  <SidebarGroup>
    <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {group.label}
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {group.items.map((item: any) => (
          <NavigationItem key={item.href} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
));

NavigationGroup.displayName = "NavigationGroup";

// Main optimized sidebar component
const OptimizedRoleBasedSidebar = memo(() => {
  const { user } = useAuth();

  // Get navigation items based on user roles (memoized)
  const userRoles = user?.roles || [];
  const visibleGroups = React.useMemo(() => {
    return navigationConfig.filter(group => {
      // Show group if user has any of the required roles for any item in the group
      return group.items.some(item => 
        !item.roles || item.roles.some(role => userRoles.includes(role))
      );
    }).map(group => ({
      ...group,
      items: group.items.filter(item => 
        !item.roles || item.roles.some(role => userRoles.includes(role))
      )
    }));
  }, [userRoles]);

  return (
    <Sidebar className="border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">JT</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Jamii Tourney</span>
            <span className="text-xs text-muted-foreground">v3.0</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {visibleGroups.map((group, index) => (
          <NavigationGroup key={`${group.label}-${index}`} group={group} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
});

OptimizedRoleBasedSidebar.displayName = "OptimizedRoleBasedSidebar";

export default OptimizedRoleBasedSidebar;