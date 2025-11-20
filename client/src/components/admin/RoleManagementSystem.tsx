import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  Shield, 
  UserCog, 
  Crown,
  Eye,
  Settings,
  Calendar,
  FileText,
  BarChart3,
  Edit,
  Trash2,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { UserRole, Permission, PermissionChecker, RoleManager } from '../../lib/rbac';
import { usePermission, PermissionGuard } from '../rbac/PermissionGuards';
import { useToast } from '../../hooks/use-toast';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  lastActive: string;
  isActive: boolean;
}

interface RoleManagementProps {
  organizationId: string;
  organizationName: string;
}

// Role configuration with icons and descriptions
const RoleConfig = {
  [UserRole.SUPER_ADMIN]: {
    icon: Crown,
    color: 'text-purple-600 bg-purple-100',
    description: 'Full platform access across all organizations',
    permissions: 'All system permissions'
  },
  [UserRole.ORG_ADMIN]: {
    icon: Shield,
    color: 'text-blue-600 bg-blue-100',
    description: 'Full access within assigned organizations',
    permissions: 'Organization management, tournaments, registrations, fixtures'
  },
  [UserRole.REGISTRATION_MANAGER]: {
    icon: Users,
    color: 'text-green-600 bg-green-100',
    description: 'Manages team registrations and player eligibility',
    permissions: 'Registration approval/rejection, player management'
  },
  [UserRole.FIXTURE_COORDINATOR]: {
    icon: Calendar,
    color: 'text-orange-600 bg-orange-100',
    description: 'Manages fixtures, venues, and match scheduling',
    permissions: 'Fixture creation/editing, venue management'
  },
  [UserRole.CONTENT_MANAGER]: {
    icon: FileText,
    color: 'text-indigo-600 bg-indigo-100',
    description: 'Manages tournament content and communications',
    permissions: 'Content creation/editing, announcements'
  },
  [UserRole.RESULTS_OFFICER]: {
    icon: BarChart3,
    color: 'text-amber-600 bg-amber-100',
    description: 'Records match results and statistics',
    permissions: 'Result entry/editing, statistics'
  },
  [UserRole.VIEWER]: {
    icon: Eye,
    color: 'text-gray-600 bg-gray-100',
    description: 'Read-only access to tournament information',
    permissions: 'View tournaments, registrations, fixtures, results'
  }
};

export default function RoleManagementSystem({ organizationId, organizationName }: RoleManagementProps) {
  const { toast } = useToast();
  const { user, getUserRole } = usePermission();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<UserRole | ''>('');

  // Mock data - in real implementation, this would come from API
  const mockUsers: UserWithRole[] = [
    {
      id: '1',
      name: 'John Admin',
      email: 'john@jamiitourney.com',
      role: UserRole.ORG_ADMIN,
      organizationId,
      lastActive: '2025-11-03T10:30:00Z',
      isActive: true
    },
    {
      id: '2',
      name: 'Sarah Registration',
      email: 'sarah@jamiitourney.com',
      role: UserRole.REGISTRATION_MANAGER,
      organizationId,
      lastActive: '2025-11-03T09:15:00Z',
      isActive: true
    },
    {
      id: '3',
      name: 'Mike Fixtures',
      email: 'mike@jamiitourney.com',
      role: UserRole.FIXTURE_COORDINATOR,
      organizationId,
      lastActive: '2025-11-02T16:45:00Z',
      isActive: true
    },
    {
      id: '4',
      name: 'Lisa Content',
      email: 'lisa@jamiitourney.com',
      role: UserRole.CONTENT_MANAGER,
      organizationId,
      lastActive: '2025-11-03T08:20:00Z',
      isActive: false
    }
  ];

  const currentUserRole = getUserRole();
  
  const handleEditRole = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowEditDialog(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      // Check if current user can delegate to the new role
      if (currentUserRole && !RoleManager.canDelegateToRole(currentUserRole, newRole)) {
        toast({
          title: "Permission Denied ❌",
          description: "You cannot assign a role higher than or equal to your own.",
          variant: "destructive",
        });
        return;
      }

      // API call would go here
      console.log(`Updating user ${selectedUser.id} role to ${newRole}`);
      
      toast({
        title: "Role Updated ✅",
        description: `${selectedUser.name}'s role has been updated to ${newRole}`,
      });
      
      setShowEditDialog(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      toast({
        title: "Update Failed ❌",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const getAvailableRoles = (): UserRole[] => {
    if (!currentUserRole) return [];
    return RoleManager.getSubordinateRoles(currentUserRole);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Role Management - {organizationName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {Object.entries(RoleConfig).map(([role, config]) => {
              const Icon = config.icon;
              const userCount = mockUsers.filter(u => u.role === role).length;
              
              return (
                <Card key={role} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{role.replace('_', ' ')}</h4>
                      <Badge variant="outline">{userCount} users</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {config.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.permissions}
                  </p>
                </Card>
              );
            })}
          </div>

          <PermissionGuard 
            permission={Permission.USER_MANAGE}
            context={{ organizationId }}
            fallback={
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to manage user roles.
                </AlertDescription>
              </Alert>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => {
                  const roleConfig = RoleConfig[user.role];
                  const Icon = roleConfig.icon;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${roleConfig.color}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <Badge variant="outline">
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {PermissionChecker.getPermissionsForRole(user.role).length} permissions
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditRole(user)}
                            disabled={!currentUserRole || !RoleManager.canDelegateToRole(currentUserRole, user.role)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </PermissionGuard>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change {selectedUser?.name}'s role within {organizationName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Role</label>
              <div className="flex items-center gap-2 mt-1">
                {selectedUser && (
                  <>
                    <div className={`p-1 rounded ${RoleConfig[selectedUser.role].color}`}>
                      {React.createElement(RoleConfig[selectedUser.role].icon, { className: "w-3 h-3" })}
                    </div>
                    <span className="text-sm">{selectedUser.role.replace('_', ' ')}</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles().map((role) => {
                    const config = RoleConfig[role];
                    const Icon = config.icon;
                    return (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${config.color}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          {role.replace('_', ' ')}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {newRole && (
              <Alert>
                <AlertDescription>
                  <strong>{newRole.replace('_', ' ')}</strong>: {RoleConfig[newRole as UserRole]?.description}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={!newRole || newRole === selectedUser?.role}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}