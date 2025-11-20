import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Building, 
  UserPlus, 
  Shield, 
  Users, 
  ClipboardCheck,
  Calendar,
  Trophy,
  FileText,
  Settings,
  Eye,
  UserCog
} from "lucide-react";

interface RolePermission {
  category: string;
  permissions: string[];
}

interface TournamentRole {
  role: string;
  label: string;
  icon: any;
  color: string;
  description: string;
  responsibilities: string[];
  permissions: RolePermission[];
  canCreate: string[];
}

const tournamentRoles: TournamentRole[] = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    icon: Crown,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    description: "Platform owner with complete system access",
    responsibilities: [
      "Create and manage all tournament organizations",
      "Assign tournament admins to organizations",
      "Access all tournaments and organizations",
      "Configure platform-wide settings",
      "Monitor system health and analytics"
    ],
    permissions: [
      {
        category: "Platform Management",
        permissions: [
          "Create/delete tournament organizations",
          "Promote users to super admin",
          "Access system configuration",
          "View platform-wide analytics"
        ]
      },
      {
        category: "User Management",
        permissions: [
          "Create/manage all admin types",
          "Override all permissions",
          "Access all user data"
        ]
      }
    ],
    canCreate: ["Tournament Admins", "All other roles"]
  },
  {
    role: "ORG_ADMIN",
    label: "Tournament Admin",
    icon: Building,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Full control over a specific tournament organization",
    responsibilities: [
      "Manage tournament settings and configuration",
      "Create and assign roles (Registrars, Competition Managers, Match Officials)",
      "Approve team and player registrations",
      "Configure tournament rules and format",
      "Generate reports and analytics for their tournament"
    ],
    permissions: [
      {
        category: "Tournament Management",
        permissions: [
          "Edit tournament details",
          "Configure tournament format",
          "Set eligibility rules",
          "Manage tournament phases"
        ]
      },
      {
        category: "Team & Player Management",
        permissions: [
          "Approve/reject team registrations",
          "Review player documents",
          "Manage team rosters",
          "Handle transfers"
        ]
      },
      {
        category: "Staff Management",
        permissions: [
          "Create Registrars",
          "Create Competition Managers",
          "Create Match Officials",
          "Assign roles and permissions"
        ]
      },
      {
        category: "Financial",
        permissions: [
          "View registration fees",
          "Generate financial reports"
        ]
      }
    ],
    canCreate: ["Registrars", "Competition Managers", "Match Officials", "Viewers"]
  },
  {
    role: "REGISTRAR",
    label: "Registrar",
    icon: UserPlus,
    color: "text-green-600 bg-green-50 border-green-200",
    description: "Handle player and team registrations for the tournament",
    responsibilities: [
      "Review player registration documents",
      "Verify player eligibility",
      "Approve/reject team registrations",
      "Issue player cards",
      "Manage team rosters"
    ],
    permissions: [
      {
        category: "Registration Processing",
        permissions: [
          "View pending registrations",
          "Approve/reject registrations",
          "Request additional documents",
          "Add notes to registrations"
        ]
      },
      {
        category: "Player Management",
        permissions: [
          "View player profiles",
          "Verify player documents",
          "Check eligibility status",
          "Issue/revoke player cards"
        ]
      },
      {
        category: "Team Management",
        permissions: [
          "View team rosters",
          "Add/remove players from teams",
          "Update team information"
        ]
      }
    ],
    canCreate: []
  },
  {
    role: "COMPETITION_MANAGER",
    label: "Competition Manager",
    icon: Shield,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    description: "Manage tournament fixtures, schedules, and competition format",
    responsibilities: [
      "Create and manage tournament fixtures",
      "Schedule matches and assign venues",
      "Configure groups and knockout stages",
      "Manage tournament progression",
      "Generate competition reports"
    ],
    permissions: [
      {
        category: "Fixture Management",
        permissions: [
          "Generate fixtures",
          "Edit match schedules",
          "Assign venues",
          "Reschedule matches"
        ]
      },
      {
        category: "Competition Structure",
        permissions: [
          "Create groups",
          "Assign teams to groups",
          "Configure knockout brackets",
          "Manage tournament phases"
        ]
      },
      {
        category: "Match Management",
        permissions: [
          "Create Match Officials",
          "Assign officials to matches",
          "View match results",
          "Generate standings"
        ]
      }
    ],
    canCreate: ["Match Officials"]
  },
  {
    role: "MATCH_OFFICIAL",
    label: "Match Official",
    icon: ClipboardCheck,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    description: "Record match results and events",
    responsibilities: [
      "Record match scores",
      "Log match events (goals, cards, substitutions)",
      "Update live match data",
      "Generate match reports",
      "Mark matches as completed"
    ],
    permissions: [
      {
        category: "Match Recording",
        permissions: [
          "Enter match scores",
          "Record goals and assists",
          "Issue yellow/red cards",
          "Log substitutions",
          "Add match notes"
        ]
      },
      {
        category: "Match Status",
        permissions: [
          "Start matches",
          "End matches",
          "Mark matches as completed",
          "Report match incidents"
        ]
      }
    ],
    canCreate: []
  },
  {
    role: "VIEWER",
    label: "Viewer",
    icon: Eye,
    color: "text-gray-600 bg-gray-50 border-gray-200",
    description: "Read-only access to tournament information",
    responsibilities: [
      "View tournament fixtures and schedules",
      "View match results and standings",
      "View team and player information"
    ],
    permissions: [
      {
        category: "View Access",
        permissions: [
          "View fixtures",
          "View results",
          "View standings",
          "View team rosters"
        ]
      }
    ],
    canCreate: []
  }
];

export default function TournamentRolesOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Tournament Role Structure</h2>
        <p className="text-muted-foreground">
          Understanding the hierarchy and permissions for tournament management
        </p>
      </div>

      {/* Role Hierarchy Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Role Hierarchy</CardTitle>
          <CardDescription>
            How roles are organized in the tournament system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-yellow-50">
              <Crown className="h-8 w-8 text-yellow-600" />
              <div className="flex-1">
                <div className="font-bold">Super Admin</div>
                <div className="text-sm text-muted-foreground">Platform level</div>
              </div>
              <div className="text-sm text-muted-foreground">→ Can create Tournament Admins</div>
            </div>

            <div className="ml-8 flex items-center gap-4 p-4 border rounded-lg bg-blue-50">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <div className="font-bold">Tournament Admin</div>
                <div className="text-sm text-muted-foreground">Tournament/Organization level</div>
              </div>
              <div className="text-sm text-muted-foreground">→ Can create staff roles</div>
            </div>

            <div className="ml-16 space-y-2">
              <div className="flex items-center gap-4 p-3 border rounded-lg bg-green-50">
                <UserPlus className="h-6 w-6 text-green-600" />
                <div className="font-medium">Registrar</div>
                <Badge variant="outline">Staff</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-3 border rounded-lg bg-purple-50">
                <Shield className="h-6 w-6 text-purple-600" />
                <div className="font-medium">Competition Manager</div>
                <Badge variant="outline">Staff</Badge>
              </div>

              <div className="ml-8 flex items-center gap-4 p-3 border rounded-lg bg-orange-50">
                <ClipboardCheck className="h-6 w-6 text-orange-600" />
                <div className="font-medium">Match Official</div>
                <Badge variant="outline">Staff</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Role Cards */}
      <div className="space-y-6">
        {tournamentRoles.map((role) => {
          const IconComponent = role.icon;
          return (
            <Card key={role.role} className={`border-2 ${role.color}`}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${role.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {role.label}
                      <Badge variant="outline">{role.role}</Badge>
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Responsibilities */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Key Responsibilities
                  </h4>
                  <ul className="space-y-1 ml-6">
                    {role.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {resp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Permissions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {role.permissions.map((permGroup, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="font-medium text-sm mb-2">{permGroup.category}</div>
                        <ul className="space-y-1">
                          {permGroup.permissions.map((perm, pidx) => (
                            <li key={pidx} className="text-xs text-muted-foreground">
                              ✓ {perm}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Can Create */}
                {role.canCreate.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      Can Create Roles
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {role.canCreate.map((createRole, idx) => (
                        <Badge key={idx} variant="secondary">{createRole}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference: What Each Role Can Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Action</th>
                  <th className="text-center p-2">Super Admin</th>
                  <th className="text-center p-2">Tournament Admin</th>
                  <th className="text-center p-2">Registrar</th>
                  <th className="text-center p-2">Comp Manager</th>
                  <th className="text-center p-2">Match Official</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Create Tournament</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Approve Registrations</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Generate Fixtures</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Record Match Results</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Create Admins</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Create Staff Roles</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">⚠️ Officials only</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">View All Tournaments</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">⚠️ Own only</td>
                  <td className="text-center">⚠️ Own only</td>
                  <td className="text-center">⚠️ Own only</td>
                  <td className="text-center">⚠️ Assigned only</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>✅ Full access | ⚠️ Limited access | ❌ No access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
