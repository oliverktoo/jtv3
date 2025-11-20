import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Shield, Edit, Trash2, AlertCircle, Crown, Users, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/rbac/permissions";

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationName: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

const ADMIN_ROLES = [
  { value: UserRole.SUPER_ADMIN, label: "Super Admin", icon: Crown, description: "Full system access" },
  { value: UserRole.ORG_ADMIN, label: "Tournament Admin", icon: Building, description: "Manage tournament organization" },
  { value: UserRole.REGISTRAR, label: "Registrar", icon: UserPlus, description: "Handle registrations" },
  { value: UserRole.COMPETITION_MANAGER, label: "Competition Manager", icon: Shield, description: "Manage tournaments" },
  { value: UserRole.MATCH_OFFICIAL, label: "Match Official", icon: Users, description: "Manage matches" },
];

export default function AdminManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: UserRole.ORG_ADMIN,
    organizationName: "",
    isSuperAdmin: false,
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create admin");
      }

      toast({
        title: "Tournament Admin Created",
        description: `${formData.firstName} ${formData.lastName} created as admin for "${formData.organizationName}"`,
      });

      // Reset form
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: UserRole.ORG_ADMIN,
        organizationName: "",
        isSuperAdmin: false,
      });

      setIsCreateDialogOpen(false);
      // Refresh admin list
      loadAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch("/api/admin/list");
      const result = await response.json();
      if (result.success) {
        setAdmins(result.data);
      }
    } catch (error) {
      console.error("Failed to load admins:", error);
    }
  };

  const handleMakeSuperAdmin = async (email: string) => {
    try {
      const response = await fetch("/api/users/make-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Super Admin Granted",
          description: `${email} is now a Super Admin`,
        });
        loadAdmins();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tournament Admin Management</h2>
          <p className="text-muted-foreground">Create tournament organizations and assign administrators</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Tournament Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Tournament Organization & Admin</DialogTitle>
              <DialogDescription>
                Create a new tournament organization and assign an administrator to manage it
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <p className="text-sm text-muted-foreground">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName">Tournament/Organization Name</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  required
                  placeholder="e.g., County Football League 2025"
                />
                <p className="text-sm text-muted-foreground">Each tournament is treated as an organization</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Admin Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <role.icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tournament Organization Model:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Each tournament operates as its own organization</li>
                    <li>• <strong>Tournament Admin:</strong> Full control of their tournament organization</li>
                    <li>• <strong>Registrar:</strong> Handle player/team registrations for the tournament</li>
                    <li>• <strong>Competition Manager:</strong> Manage fixtures, matches, and schedules</li>
                    <li>• <strong>Match Official:</strong> Record match results and events</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Admin"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ADMIN_ROLES.slice(0, 3).map((role) => (
          <Card key={role.value}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{role.label}</CardTitle>
              <role.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Organizations & Admins</CardTitle>
          <CardDescription>
            View and manage all tournament organizations and their administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={loadAdmins} className="mb-4">
            Load Tournament Admins
          </Button>
          
          {admins.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tournament/Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.firstName} {admin.lastName}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{admin.role}</Badge>
                    </TableCell>
                    <TableCell>{admin.organizationName}</TableCell>
                    <TableCell>
                      {admin.isSuperAdmin ? (
                        <Badge className="bg-yellow-500">
                          <Crown className="h-3 w-3 mr-1" />
                          Super Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">Admin</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!admin.isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMakeSuperAdmin(admin.email)}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Make Super Admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No administrators loaded. Click "Load Admins" to view.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
