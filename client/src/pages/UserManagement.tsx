import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, UserOrganizationRole, Organization } from "@shared/schema";
import { UserCog, Plus, Trash2 } from "lucide-react";

interface UserWithRoles extends User {
  roles: UserOrganizationRole[];
}

export default function UserManagement() {
  const { toast } = useToast();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery<UserWithRoles[]>({
    queryKey: ["/api/users"],
  });

  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role, orgId }: { userId: string; role: string; orgId: string | null }) => {
      return await apiRequest("POST", `/api/users/${userId}/roles`, { role, orgId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAssignDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
      setSelectedOrg(null);
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, orgId }: { userId: string; orgId: string | null }) => {
      const params = orgId ? `?orgId=${orgId}` : "";
      return await apiRequest("DELETE", `/api/users/${userId}/roles${params}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Role removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssignRole = () => {
    if (!selectedUser || !selectedRole) return;

    if (selectedRole === "SUPER_ADMIN") {
      assignRoleMutation.mutate({ userId: selectedUser.id, role: selectedRole, orgId: null });
    } else if (selectedOrg) {
      assignRoleMutation.mutate({ userId: selectedUser.id, role: selectedRole, orgId: selectedOrg });
    }
  };

  const handleRemoveRole = (userId: string, orgId: string | null) => {
    if (confirm("Are you sure you want to remove this role?")) {
      removeRoleMutation.mutate({ userId, orgId });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "destructive";
      case "ORG_ADMIN":
        return "default";
      case "VIEWER":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getOrgName = (orgId: string | null) => {
    if (!orgId) return "Platform-wide";
    return organizations?.find(o => o.id === orgId)?.name || "Unknown";
  };

  if (usersLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" data-testid="spinner-loading" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">User Management</h1>
          <p className="text-muted-foreground mt-1" data-testid="text-page-description">
            Manage user roles and permissions across organizations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage user roles in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell className="font-medium" data-testid={`text-user-name-${user.id}`}>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email}
                  </TableCell>
                  <TableCell data-testid={`text-user-email-${user.id}`}>
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline" data-testid={`badge-no-roles-${user.id}`}>No Roles</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <div key={role.id} className="flex items-center gap-1">
                            <Badge 
                              variant={getRoleBadgeVariant(role.role)}
                              data-testid={`badge-role-${user.id}-${role.id}`}
                            >
                              {role.role} - {getOrgName(role.orgId)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => handleRemoveRole(user.id, role.orgId)}
                              data-testid={`button-remove-role-${user.id}-${role.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={isAssignDialogOpen && selectedUser?.id === user.id}
                      onOpenChange={(open) => {
                        setIsAssignDialogOpen(open);
                        if (open) {
                          setSelectedUser(user);
                        } else {
                          setSelectedUser(null);
                          setSelectedRole("");
                          setSelectedOrg(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-assign-role-${user.id}`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Assign Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid="dialog-assign-role">
                        <DialogHeader>
                          <DialogTitle>Assign Role</DialogTitle>
                          <DialogDescription>
                            Assign a role to {user.firstName} {user.lastName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger id="role" data-testid="select-role">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SUPER_ADMIN">Super Admin (Platform-wide)</SelectItem>
                                <SelectItem value="ORG_ADMIN">Organization Admin</SelectItem>
                                <SelectItem value="VIEWER">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedRole && selectedRole !== "SUPER_ADMIN" && (
                            <div className="space-y-2">
                              <Label htmlFor="organization">Organization</Label>
                              <Select value={selectedOrg || ""} onValueChange={setSelectedOrg}>
                                <SelectTrigger id="organization" data-testid="select-organization">
                                  <SelectValue placeholder="Select an organization" />
                                </SelectTrigger>
                                <SelectContent>
                                  {organizations?.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                      {org.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleAssignRole}
                            disabled={
                              assignRoleMutation.isPending ||
                              !selectedRole ||
                              (selectedRole !== "SUPER_ADMIN" && !selectedOrg)
                            }
                            data-testid="button-submit-assign-role"
                          >
                            {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
