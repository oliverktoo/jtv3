import { useMemo } from "react";
import { useLocation, Link } from "wouter";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navigationConfig, NavigationItem } from "@/lib/rbac/roles";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbSegment {
  label: string;
  path: string;
  icon?: string;
}

export function DynamicBreadcrumbs() {
  const [location] = useLocation();
  
  const breadcrumbSegments = useMemo(() => {
    const segments: BreadcrumbSegment[] = [];
    
    // Always start with home
    if (location !== '/') {
      segments.push({
        label: 'Dashboard',
        path: '/',
        icon: 'Home'
      });
    }
    
    // Find the navigation item for current path
    const findNavigationItem = (items: NavigationItem[], currentPath: string): NavigationItem | null => {
      for (const item of items) {
        if (item.path === currentPath) return item;
        if (item.children) {
          const found = findNavigationItem(item.children, currentPath);
          if (found) return found;
        }
      }
      return null;
    };
    
    const currentItem = findNavigationItem(navigationConfig, location);
    
    if (currentItem) {
      // Build breadcrumb path by working backwards from current item
      const buildPath = (targetPath: string): BreadcrumbSegment[] => {
        const pathSegments: BreadcrumbSegment[] = [];
        
        // Find parent items by checking if current path starts with parent path
        for (const item of navigationConfig) {
          if (targetPath.startsWith(item.path) && item.path !== targetPath) {
            if (item.children) {
              for (const child of item.children) {
                if (child.path === targetPath) {
                  // Add parent
                  pathSegments.push({
                    label: item.label,
                    path: item.path,
                    icon: item.icon
                  });
                  // Add current child
                  pathSegments.push({
                    label: child.label,
                    path: child.path,
                    icon: child.icon
                  });
                  return pathSegments;
                }
              }
            }
          }
        }
        
        // If no parent found, just add current item
        pathSegments.push({
          label: currentItem.label,
          path: currentItem.path,
          icon: currentItem.icon
        });
        
        return pathSegments;
      };
      
      const pathSegments = buildPath(location);
      segments.push(...pathSegments);
    } else {
      // Fallback: generate breadcrumbs from URL structure
      const pathParts = location.split('/').filter(Boolean);
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        currentPath += `/${part}`;
        
        // Convert path part to readable label
        const label = part
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        segments.push({
          label,
          path: currentPath
        });
      });
    }
    
    return segments;
  }, [location]);
  
  // Don't show breadcrumbs for home page
  if (location === '/') {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbSegments.map((segment, index) => {
            const isLast = index === breadcrumbSegments.length - 1;
            
            return (
              <div key={segment.path} className="flex items-center">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium text-foreground">
                      {segment.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        href={segment.path}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {segment.icon === 'Home' && <Home className="h-3 w-3" />}
                        {segment.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                
                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3 w-3" />
                  </BreadcrumbSeparator>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

// Enhanced breadcrumbs with context menu for related pages
export function EnhancedBreadcrumbs() {
  const [location] = useLocation();
  
  const { segments, relatedPages } = useMemo(() => {
    // Same breadcrumb logic as above
    const segments: BreadcrumbSegment[] = [];
    const related: NavigationItem[] = [];
    
    if (location !== '/') {
      segments.push({
        label: 'Dashboard',
        path: '/',
        icon: 'Home'
      });
    }
    
    // Find current category and add related pages
    for (const item of navigationConfig) {
      if (location.startsWith(item.path) && item.children) {
        related.push(...item.children.filter(child => child.path !== location));
        break;
      }
    }
    
    // Build segments (simplified for this example)
    const pathParts = location.split('/').filter(Boolean);
    let currentPath = '';
    
    pathParts.forEach(part => {
      currentPath += `/${part}`;
      const label = part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      segments.push({
        label,
        path: currentPath
      });
    });
    
    return { segments, relatedPages: related.slice(0, 5) };
  }, [location]);
  
  if (location === '/') return null;
  
  return (
    <div className="flex items-center justify-between mb-6">
      <DynamicBreadcrumbs />
      
      {relatedPages.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <BreadcrumbEllipsis className="h-3 w-3" />
            Related Pages
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {relatedPages.map(page => (
              <DropdownMenuItem key={page.id} asChild>
                <Link href={page.path} className="flex items-center gap-2">
                  <span>{page.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}