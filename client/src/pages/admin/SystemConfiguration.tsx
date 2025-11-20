import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface SystemConfiguration {
  general: {
    organizationName: string;
    organizationLogo?: string;
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    fiscalYearStart: string;
  };
  tournament: {
    maxPlayersPerTeam: number;
    minPlayersPerTeam: number;
    maxTeamsPerTournament: number;
    allowLateRegistrations: boolean;
    registrationCutoffDays: number;
    automaticDraw: boolean;
    scoreValidationRequired: boolean;
    multiTournamentParticipation: boolean;
  };
  player: {
    minimumAge: number;
    maximumAge: number;
    requireMedicalCertificate: boolean;
    allowDuplicateRegistration: boolean;
    documentVerificationRequired: boolean;
    photographRequired: boolean;
    parentalConsentRequired: boolean;
    playerTransferCooldown: number; // days
  };
  security: {
    twoFactorAuthentication: boolean;
    sessionTimeout: number; // minutes
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      passwordExpiry: number; // days
    };
    loginAttempts: number;
    ipWhitelisting: boolean;
    auditLogging: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    matchReminders: boolean;
    paymentReminders: boolean;
    documentExpiryAlerts: boolean;
    systemMaintenanceAlerts: boolean;
  };
  integrations: {
    paymentGateway: {
      provider: 'Stripe' | 'PayPal' | 'M-Pesa' | 'Manual';
      enabled: boolean;
      testMode: boolean;
      webhookUrl?: string;
    };
    emailService: {
      provider: 'SendGrid' | 'Mailgun' | 'AWS SES' | 'SMTP';
      enabled: boolean;
      fromEmail: string;
      replyToEmail: string;
    };
    smsService: {
      provider: 'Twilio' | 'Africa\'s Talking' | 'SMS Gateway';
      enabled: boolean;
      countryCode: string;
    };
    cloudStorage: {
      provider: 'AWS S3' | 'Google Cloud' | 'Azure' | 'Local';
      enabled: boolean;
      bucketName?: string;
      maxFileSize: number; // MB
    };
  };
  backup: {
    automaticBackup: boolean;
    backupFrequency: 'Daily' | 'Weekly' | 'Monthly';
    backupRetention: number; // days
    backupLocation: 'Cloud' | 'Local' | 'Both';
    encryptBackups: boolean;
  };
  maintenance: {
    maintenanceMode: boolean;
    allowedIPs: string[];
    maintenanceMessage: string;
    scheduledMaintenance?: {
      startTime: string;
      endTime: string;
      description: string;
    };
  };
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  userCount: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'approve' | 'export';
  resource: string;
}

interface ApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requiresAuth: boolean;
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
  };
  caching: {
    enabled: boolean;
    ttl: number; // seconds
  };
  enabled: boolean;
}

export default function SystemConfiguration() {
  const systemConfig: SystemConfiguration = {
    general: {
      organizationName: 'Jamii Tourney',
      timezone: 'Africa/Nairobi',
      currency: 'KES',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      fiscalYearStart: '01/01'
    },
    tournament: {
      maxPlayersPerTeam: 25,
      minPlayersPerTeam: 16,
      maxTeamsPerTournament: 32,
      allowLateRegistrations: true,
      registrationCutoffDays: 7,
      automaticDraw: false,
      scoreValidationRequired: true,
      multiTournamentParticipation: true
    },
    player: {
      minimumAge: 16,
      maximumAge: 35,
      requireMedicalCertificate: true,
      allowDuplicateRegistration: false,
      documentVerificationRequired: true,
      photographRequired: true,
      parentalConsentRequired: true,
      playerTransferCooldown: 30
    },
    security: {
      twoFactorAuthentication: false,
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        passwordExpiry: 90
      },
      loginAttempts: 5,
      ipWhitelisting: false,
      auditLogging: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      matchReminders: true,
      paymentReminders: true,
      documentExpiryAlerts: true,
      systemMaintenanceAlerts: true
    },
    integrations: {
      paymentGateway: {
        provider: 'M-Pesa',
        enabled: true,
        testMode: false
      },
      emailService: {
        provider: 'SendGrid',
        enabled: true,
        fromEmail: 'noreply@jamiitourney.com',
        replyToEmail: 'support@jamiitourney.com'
      },
      smsService: {
        provider: 'Africa\'s Talking',
        enabled: true,
        countryCode: '+254'
      },
      cloudStorage: {
        provider: 'AWS S3',
        enabled: true,
        bucketName: 'jamii-tourney-storage',
        maxFileSize: 10
      }
    },
    backup: {
      automaticBackup: true,
      backupFrequency: 'Daily',
      backupRetention: 30,
      backupLocation: 'Cloud',
      encryptBackups: true
    },
    maintenance: {
      maintenanceMode: false,
      allowedIPs: ['127.0.0.1', '192.168.1.0/24'],
      maintenanceMessage: 'System is currently under maintenance. Please check back later.'
    }
  };

  const userRoles: UserRole[] = [
    {
      id: '1',
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: [], // Would contain all permissions
      isSystem: true,
      userCount: 2
    },
    {
      id: '2',
      name: 'Organization Administrator',
      description: 'Full access to organization data and settings',
      permissions: [], // Would contain org-level permissions
      isSystem: true,
      userCount: 5
    },
    {
      id: '3',
      name: 'Tournament Manager',
      description: 'Manage tournaments, teams, and fixtures',
      permissions: [], // Would contain tournament permissions
      isSystem: false,
      userCount: 12
    },
    {
      id: '4',
      name: 'Team Manager',
      description: 'Manage team rosters and player registrations',
      permissions: [], // Would contain team permissions
      isSystem: false,
      userCount: 45
    },
    {
      id: '5',
      name: 'Match Official',
      description: 'Access match day operations and scoring',
      permissions: [], // Would contain match permissions
      isSystem: false,
      userCount: 28
    },
    {
      id: '6',
      name: 'Player',
      description: 'Basic player access for profile and team information',
      permissions: [], // Would contain player permissions
      isSystem: false,
      userCount: 1250
    }
  ];

  const apiEndpoints: ApiEndpoint[] = [
    {
      id: '1',
      path: '/api/tournaments',
      method: 'GET',
      description: 'Retrieve tournament listings',
      requiresAuth: false,
      rateLimit: { enabled: true, requestsPerMinute: 100 },
      caching: { enabled: true, ttl: 300 },
      enabled: true
    },
    {
      id: '2',
      path: '/api/tournaments',
      method: 'POST',
      description: 'Create new tournament',
      requiresAuth: true,
      rateLimit: { enabled: true, requestsPerMinute: 20 },
      caching: { enabled: false, ttl: 0 },
      enabled: true
    },
    {
      id: '3',
      path: '/api/players/register',
      method: 'POST',
      description: 'Register new player',
      requiresAuth: true,
      rateLimit: { enabled: true, requestsPerMinute: 10 },
      caching: { enabled: false, ttl: 0 },
      enabled: true
    },
    {
      id: '4',
      path: '/api/matches/live',
      method: 'GET',
      description: 'Live match updates',
      requiresAuth: false,
      rateLimit: { enabled: true, requestsPerMinute: 200 },
      caching: { enabled: true, ttl: 30 },
      enabled: true
    },
    {
      id: '5',
      path: '/api/admin/reports',
      method: 'GET',
      description: 'Administrative reports',
      requiresAuth: true,
      rateLimit: { enabled: true, requestsPerMinute: 30 },
      caching: { enabled: true, ttl: 600 },
      enabled: true
    }
  ];

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getMethodColor = (method: ApiEndpoint['method']) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-orange-100 text-orange-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Comprehensive platform settings and configuration management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">💾 Save Configuration</Button>
          <Button variant="outline">🔄 Reset to Defaults</Button>
          <Button>📊 Configuration Report</Button>
        </div>
      </div>

      {/* Configuration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{userRoles.length}</div>
            <div className="text-sm text-muted-foreground">User Roles</div>
            <div className="text-xs text-blue-600 mt-1">Configured</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{apiEndpoints.filter(api => api.enabled).length}</div>
            <div className="text-sm text-muted-foreground">Active APIs</div>
            <div className="text-xs text-green-600 mt-1">Endpoints enabled</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">4</div>
            <div className="text-sm text-muted-foreground">Integrations</div>
            <div className="text-xs text-purple-600 mt-1">Active services</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {systemConfig.backup.automaticBackup ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-muted-foreground">Auto Backup</div>
            <div className="text-xs text-orange-600 mt-1">{systemConfig.backup.backupFrequency}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic organization and system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Organization Name</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.general.organizationName}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.general.timezone}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Currency</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.general.currency}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      English ({systemConfig.general.language})
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Format</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.general.dateFormat}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Fiscal Year Start</label>
                  <div className="mt-1 p-2 border rounded bg-gray-50">
                    {systemConfig.general.fiscalYearStart}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">✏️ Edit Settings</Button>
                  <Button variant="outline" size="sm">🔄 Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tournament Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Tournament Configuration</CardTitle>
              <CardDescription>Tournament rules and validation settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Min Players/Team</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.tournament.minPlayersPerTeam}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Players/Team</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.tournament.maxPlayersPerTeam}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Teams/Tournament</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.tournament.maxTeamsPerTournament}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Registration Cutoff</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.tournament.registrationCutoffDays} days before tournament
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Allow Late Registrations</span>
                      <Switch checked={systemConfig.tournament.allowLateRegistrations} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Automatic Draw</span>
                      <Switch checked={systemConfig.tournament.automaticDraw} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Score Validation Required</span>
                      <Switch checked={systemConfig.tournament.scoreValidationRequired} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Multi-Tournament Participation</span>
                      <Switch checked={systemConfig.tournament.multiTournamentParticipation} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">✏️ Edit Tournament Rules</Button>
                  <Button variant="outline" size="sm">📋 Rule Templates</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Player Configuration</CardTitle>
              <CardDescription>Player registration and validation requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Minimum Age</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.player.minimumAge} years
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Maximum Age</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.player.maximumAge} years
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Transfer Cooldown</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.player.playerTransferCooldown} days
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Medical Certificate Required</div>
                      <div className="text-xs text-muted-foreground">Require valid medical certificate for registration</div>
                    </div>
                    <Switch checked={systemConfig.player.requireMedicalCertificate} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Document Verification Required</div>
                      <div className="text-xs text-muted-foreground">Verify identity documents before approval</div>
                    </div>
                    <Switch checked={systemConfig.player.documentVerificationRequired} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Photograph Required</div>
                      <div className="text-xs text-muted-foreground">Player photo required for registration</div>
                    </div>
                    <Switch checked={systemConfig.player.photographRequired} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Parental Consent (Under 18)</div>
                      <div className="text-xs text-muted-foreground">Require parent/guardian consent for minors</div>
                    </div>
                    <Switch checked={systemConfig.player.parentalConsentRequired} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Allow Duplicate Registration</div>
                      <div className="text-xs text-muted-foreground">Allow same player in multiple organizations</div>
                    </div>
                    <Switch checked={systemConfig.player.allowDuplicateRegistration} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">✏️ Edit Player Rules</Button>
                  <Button variant="outline" size="sm">📄 Document Templates</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Authentication, authorization, and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Session Timeout</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.security.sessionTimeout} minutes
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Login Attempts</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50">
                      {systemConfig.security.loginAttempts} attempts
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Password Policy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Minimum Length:</span>
                        <span className="font-semibold">{systemConfig.security.passwordPolicy.minLength}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Password Expiry:</span>
                        <span className="font-semibold">{systemConfig.security.passwordPolicy.passwordExpiry} days</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Require Uppercase:</span>
                        <Switch checked={systemConfig.security.passwordPolicy.requireUppercase} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Require Numbers:</span>
                        <Switch checked={systemConfig.security.passwordPolicy.requireNumbers} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Require Special Characters:</span>
                        <Switch checked={systemConfig.security.passwordPolicy.requireSpecialChars} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Two-Factor Authentication</div>
                      <div className="text-xs text-muted-foreground">Enable 2FA for enhanced security</div>
                    </div>
                    <Switch checked={systemConfig.security.twoFactorAuthentication} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">IP Whitelisting</div>
                      <div className="text-xs text-muted-foreground">Restrict access to specific IP addresses</div>
                    </div>
                    <Switch checked={systemConfig.security.ipWhitelisting} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Audit Logging</div>
                      <div className="text-xs text-muted-foreground">Log all system activities for security review</div>
                    </div>
                    <Switch checked={systemConfig.security.auditLogging} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">🔐 Security Settings</Button>
                  <Button variant="outline" size="sm">📊 Security Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Roles & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>User Roles & Permissions</CardTitle>
              <CardDescription>Manage system roles and access permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRoles.map(role => (
                  <div key={role.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{role.name}</h4>
                            {role.isSystem && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                System Role
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{role.userCount} users</div>
                        <div className="text-xs text-muted-foreground">assigned</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">👁️ View Permissions</Button>
                      {!role.isSystem && (
                        <>
                          <Button variant="outline" size="sm">✏️ Edit Role</Button>
                          <Button variant="outline" size="sm">👥 Manage Users</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline">➕ Create New Role</Button>
                  <Button variant="outline">📋 Permission Matrix</Button>
                  <Button variant="outline">👥 Bulk User Assignment</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Manage API endpoints, rate limiting, and caching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map(endpoint => (
                  <div key={endpoint.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getMethodColor(endpoint.method)} variant="secondary">
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.path}</code>
                          <Badge className={getStatusColor(endpoint.enabled)} variant="secondary">
                            {endpoint.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{endpoint.description}</div>
                      </div>
                      <Switch checked={endpoint.enabled} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Auth Required:</span>
                        <span className={`ml-2 font-semibold ${endpoint.requiresAuth ? 'text-red-600' : 'text-green-600'}`}>
                          {endpoint.requiresAuth ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate Limit:</span>
                        <span className="ml-2 font-semibold">
                          {endpoint.rateLimit.enabled ? `${endpoint.rateLimit.requestsPerMinute}/min` : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cache:</span>
                        <span className="ml-2 font-semibold">
                          {endpoint.caching.enabled ? `${endpoint.caching.ttl}s TTL` : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">⚙️ Configure</Button>
                      <Button variant="outline" size="sm">📊 Analytics</Button>
                      <Button variant="outline" size="sm">🔧 Test Endpoint</Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline">📋 API Documentation</Button>
                  <Button variant="outline">🔑 API Keys</Button>
                  <Button variant="outline">📊 Usage Analytics</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Database</span>
                    <span className="text-sm font-semibold text-green-600">Healthy</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">API Response</span>
                    <span className="text-sm font-semibold text-green-600">125ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Storage Usage</span>
                    <span className="text-sm font-semibold text-orange-600">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="text-sm font-semibold text-blue-600">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>💳</span>
                  <span className="text-sm">{systemConfig.integrations.paymentGateway.provider}</span>
                </div>
                <Badge className={getStatusColor(systemConfig.integrations.paymentGateway.enabled)} variant="secondary">
                  {systemConfig.integrations.paymentGateway.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span className="text-sm">{systemConfig.integrations.emailService.provider}</span>
                </div>
                <Badge className={getStatusColor(systemConfig.integrations.emailService.enabled)} variant="secondary">
                  {systemConfig.integrations.emailService.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>📱</span>
                  <span className="text-sm">{systemConfig.integrations.smsService.provider}</span>
                </div>
                <Badge className={getStatusColor(systemConfig.integrations.smsService.enabled)} variant="secondary">
                  {systemConfig.integrations.smsService.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>☁️</span>
                  <span className="text-sm">{systemConfig.integrations.cloudStorage.provider}</span>
                </div>
                <Badge className={getStatusColor(systemConfig.integrations.cloudStorage.enabled)} variant="secondary">
                  {systemConfig.integrations.cloudStorage.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Backup Status */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Automatic Backup</span>
                  <Badge className={getStatusColor(systemConfig.backup.automaticBackup)} variant="secondary">
                    {systemConfig.backup.automaticBackup ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Frequency</span>
                  <span className="font-semibold text-sm">{systemConfig.backup.backupFrequency}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Retention</span>
                  <span className="font-semibold text-sm">{systemConfig.backup.backupRetention} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Location</span>
                  <span className="font-semibold text-sm">{systemConfig.backup.backupLocation}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Encryption</span>
                  <Badge className={getStatusColor(systemConfig.backup.encryptBackups)} variant="secondary">
                    {systemConfig.backup.encryptBackups ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                
                <hr />
                
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Last Backup</div>
                  <div className="text-xs text-muted-foreground">Today at 02:00 AM</div>
                  <div className="text-xs text-green-600">✓ Successful (2.3 GB)</div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  💾 Run Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium text-sm">Maintenance Mode</div>
                    <div className="text-xs text-muted-foreground">
                      {systemConfig.maintenance.maintenanceMode ? 'System is in maintenance' : 'System is operational'}
                    </div>
                  </div>
                  <Switch checked={systemConfig.maintenance.maintenanceMode} />
                </div>
                
                {systemConfig.maintenance.scheduledMaintenance && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm font-medium text-yellow-800">Scheduled Maintenance</div>
                    <div className="text-xs text-yellow-600 mt-1">
                      {systemConfig.maintenance.scheduledMaintenance.description}
                    </div>
                    <div className="text-xs text-yellow-600">
                      {systemConfig.maintenance.scheduledMaintenance.startTime} - {systemConfig.maintenance.scheduledMaintenance.endTime}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Maintenance Message</label>
                  <div className="p-2 border rounded bg-gray-50 text-sm">
                    {systemConfig.maintenance.maintenanceMessage}
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  📅 Schedule Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                ⚙️ Configuration Wizard
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 System Health Check
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔐 Security Audit
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Export Configuration
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📥 Import Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}