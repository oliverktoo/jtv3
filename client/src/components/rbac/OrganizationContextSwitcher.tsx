import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building, 
  ChevronDown, 
  Check, 
  Plus, 
  Settings, 
  Crown,
  Shield,
  Users
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  type: 'County' | 'Club' | 'League' | 'National';
  logo?: string;
  role: string;
  isActive: boolean;
}

interface OrganizationContextSwitcherProps {
  variant?: 'sidebar' | 'header' | 'compact';
  className?: string;
}

export function OrganizationContextSwitcher({ 
  variant = 'sidebar', 
  className 
}: OrganizationContextSwitcherProps) {
  const [currentOrgId, setCurrentOrgId] = useState("org-1");
  
  // Mock organizations - in real app, this would come from user context
  const organizations: Organization[] = [
    {
      id: "org-1",
      name: "Nairobi County FA",
      type: "County",
      logo: "/api/placeholder/32/32",
      role: "Administrator",
      isActive: true
    },
    {
      id: "org-2", 
      name: "Mathare United FC",
      type: "Club",
      role: "Team Manager",
      isActive: true
    },
    {
      id: "org-3",
      name: "Kenya Premier League",
      type: "League", 
      role: "Competition Manager",
      isActive: true
    },
    {
      id: "org-4",
      name: "Football Kenya Federation",
      type: "National",
      role: "Observer",
      isActive: false
    }
  ];
  
  const currentOrg = organizations.find(org => org.id === currentOrgId);
  
  const handleOrgSwitch = (orgId: string) => {
    setCurrentOrgId(orgId);
    // In real app, this would update the global context and potentially navigate
    console.log(`Switched to organization: ${orgId}`);
  };
  
  const getOrgIcon = (type: string) => {
    switch (type) {
      case 'County': return Crown;
      case 'Club': return Shield;
      case 'League': return Users;
      case 'National': return Building;
      default: return Building;
    }
  };
  
  const getOrgColor = (type: string) => {
    switch (type) {
      case 'County': return 'bg-purple-100 text-purple-700';
      case 'Club': return 'bg-blue-100 text-blue-700';
      case 'League': return 'bg-green-100 text-green-700';
      case 'National': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`h-8 px-2 ${className}`}>
            <Building className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map(org => (
            <DropdownMenuItem 
              key={org.id}
              onClick={() => handleOrgSwitch(org.id)}
              className="flex items-center gap-3 p-3"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={org.logo} />
                <AvatarFallback className="text-xs">
                  {org.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{org.name}</div>
                <div className="text-xs text-muted-foreground">{org.role}</div>
              </div>
              {org.id === currentOrgId && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  if (variant === 'header') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={`flex items-center gap-2 ${className}`}>
            <Avatar className="h-5 w-5">
              <AvatarImage src={currentOrg?.logo} />
              <AvatarFallback className="text-xs">
                {currentOrg?.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{currentOrg?.name}</span>
            <Badge variant="secondary" className="text-xs">
              {currentOrg?.role}
            </Badge>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Switch Organization
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map(org => {
            const OrgIcon = getOrgIcon(org.type);
            return (
              <DropdownMenuItem 
                key={org.id}
                onClick={() => handleOrgSwitch(org.id)}
                className="flex items-center gap-3 p-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={org.logo} />
                  <AvatarFallback className="text-xs">
                    {org.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{org.name}</span>
                    {org.id === currentOrgId && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getOrgColor(org.type)}`}>
                      <OrgIcon className="h-3 w-3 mr-1" />
                      {org.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{org.role}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`h-2 w-2 rounded-full ${org.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-muted-foreground mt-1">
                    {org.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="flex items-center gap-2 text-blue-600">
            <Plus className="h-4 w-4" />
            Join Organization
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Organizations
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // Default sidebar variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`w-full justify-start ${className}`}>
          <Avatar className="h-5 w-5 mr-2">
            <AvatarImage src={currentOrg?.logo} />
            <AvatarFallback className="text-xs">
              {currentOrg?.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <div className="truncate text-sm font-medium">{currentOrg?.name}</div>
            <div className="truncate text-xs text-muted-foreground">{currentOrg?.role}</div>
          </div>
          <ChevronDown className="h-3 w-3 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {organizations.map(org => {
          const OrgIcon = getOrgIcon(org.type);
          return (
            <DropdownMenuItem 
              key={org.id}
              onClick={() => handleOrgSwitch(org.id)}
              className="flex items-center gap-3 p-3"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={org.logo} />
                <AvatarFallback className="text-xs">
                  {org.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{org.name}</span>
                  {org.id === currentOrgId && <Check className="h-3 w-3 text-green-600" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-xs ${getOrgColor(org.type)}`}>
                    <OrgIcon className="h-2 w-2 mr-1" />
                    {org.type}
                  </Badge>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Join Organization
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Manage Organizations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}