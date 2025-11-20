import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamSetting {
  id: string;
  category: 'General' | 'Privacy' | 'Communication' | 'Integrations' | 'Financial';
  title: string;
  description: string;
  currentValue: string;
  type: 'text' | 'select' | 'toggle' | 'number';
  options?: string[];
  required?: boolean;
}

interface Permission {
  id: string;
  role: string;
  module: string;
  access: 'Full' | 'Read' | 'Limited' | 'None';
  description: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'Social Media' | 'Analytics' | 'Finance' | 'Communication' | 'Broadcasting';
  status: 'Connected' | 'Disconnected' | 'Error';
  lastSync?: string;
  description: string;
}

export default function TeamSettings() {
  const teamSettings: TeamSetting[] = [
    {
      id: '1',
      category: 'General',
      title: 'Team Name',
      description: 'Official team name for competitions and documentation',
      currentValue: 'Nairobi Football Club',
      type: 'text',
      required: true
    },
    {
      id: '2',
      category: 'General',
      title: 'Founded Year',
      description: 'Year the team was established',
      currentValue: '1985',
      type: 'number',
      required: true
    },
    {
      id: '3',
      category: 'Privacy',
      title: 'Public Profile Visibility',
      description: 'Control who can view team profile and statistics',
      currentValue: 'Public',
      type: 'select',
      options: ['Public', 'Members Only', 'Private']
    },
    {
      id: '4',
      category: 'Communication',
      title: 'Match Result Notifications',
      description: 'Automatically notify stakeholders of match results',
      currentValue: 'Enabled',
      type: 'toggle'
    },
    {
      id: '5',
      category: 'Financial',
      title: 'Budget Alerts',
      description: 'Receive alerts when approaching budget limits',
      currentValue: 'Enabled',
      type: 'toggle'
    }
  ];

  const permissions: Permission[] = [
    { id: '1', role: 'Head Coach', module: 'Squad Management', access: 'Full', description: 'Complete control over player selection and tactics' },
    { id: '2', role: 'Assistant Coach', module: 'Squad Management', access: 'Limited', description: 'Can view and suggest, cannot modify' },
    { id: '3', role: 'Team Manager', module: 'Operations', access: 'Full', description: 'Manage logistics and administrative tasks' },
    { id: '4', role: 'Physiotherapist', module: 'Medical Records', access: 'Full', description: 'Access to all player health information' },
    { id: '5', role: 'Team Captain', module: 'Player Communication', access: 'Limited', description: 'Can send messages to team members' },
  ];

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Facebook',
      type: 'Social Media',
      status: 'Connected',
      lastSync: '2024-11-16 10:30',
      description: 'Auto-post match results and team updates'
    },
    {
      id: '2',
      name: 'Twitter/X',
      type: 'Social Media',
      status: 'Connected',
      lastSync: '2024-11-16 10:30',
      description: 'Share live match updates and news'
    },
    {
      id: '3',
      name: 'Google Analytics',
      type: 'Analytics',
      status: 'Disconnected',
      description: 'Track website and social media performance'
    },
    {
      id: '4',
      name: 'M-Pesa Integration',
      type: 'Finance',
      status: 'Connected',
      lastSync: '2024-11-16 09:15',
      description: 'Process player fees and merchandise payments'
    },
    {
      id: '5',
      name: 'WhatsApp Business',
      type: 'Communication',
      status: 'Error',
      description: 'Team communication and parent notifications'
    }
  ];

  const getAccessColor = (access: Permission['access']) => {
    switch (access) {
      case 'Full': return 'bg-green-100 text-green-800';
      case 'Read': return 'bg-blue-100 text-blue-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'None': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'Connected': return 'bg-green-100 text-green-800';
      case 'Disconnected': return 'bg-gray-100 text-gray-800';
      case 'Error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: TeamSetting['category']) => {
    switch (category) {
      case 'General': return 'bg-blue-100 text-blue-800';
      case 'Privacy': return 'bg-purple-100 text-purple-800';
      case 'Communication': return 'bg-green-100 text-green-800';
      case 'Integrations': return 'bg-orange-100 text-orange-800';
      case 'Financial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-muted-foreground">Configure team preferences, permissions, and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">🔄 Reset Defaults</Button>
          <Button>💾 Save Changes</Button>
        </div>
      </div>

      {/* Quick Settings Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Active Settings</CardDescription>
              <CardTitle className="text-2xl font-bold">28</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">5 categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">User Roles</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">8</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">With permissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Integrations</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">5</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">3 active, 1 error</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Last Updated</CardDescription>
              <CardTitle className="text-2xl font-bold text-purple-600">2d</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">Ago</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Team Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Settings by Category */}
                {['General', 'Privacy', 'Communication', 'Financial'].map(category => (
                  <div key={category}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Badge className={getCategoryColor(category as TeamSetting['category'])} variant="secondary">
                        {category}
                      </Badge>
                    </h3>
                    
                    <div className="space-y-4 pl-4">
                      {teamSettings.filter(setting => setting.category === category).map(setting => (
                        <div key={setting.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {setting.title}
                                {setting.required && <span className="text-red-500 text-xs">*</span>}
                              </h4>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1">
                              {setting.type === 'text' && (
                                <input 
                                  type="text" 
                                  value={setting.currentValue}
                                  className="w-full p-2 border rounded text-sm"
                                  placeholder={setting.title}
                                />
                              )}
                              
                              {setting.type === 'number' && (
                                <input 
                                  type="number" 
                                  value={setting.currentValue}
                                  className="w-full p-2 border rounded text-sm"
                                />
                              )}
                              
                              {setting.type === 'select' && (
                                <select 
                                  value={setting.currentValue}
                                  className="w-full p-2 border rounded text-sm"
                                >
                                  {setting.options?.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              )}
                              
                              {setting.type === 'toggle' && (
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    checked={setting.currentValue === 'Enabled'}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm">{setting.currentValue}</span>
                                </div>
                              )}
                            </div>
                            
                            <Button variant="outline" size="sm">Update</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Role Permissions</CardTitle>
                <Button variant="outline" size="sm">➕ Add Role</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {permissions.map(permission => (
                  <div key={permission.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{permission.role}</h4>
                        <p className="text-sm text-muted-foreground">{permission.module}</p>
                      </div>
                      <Badge className={getAccessColor(permission.access)} variant="secondary">
                        {permission.access}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{permission.description}</p>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">✏️ Edit</Button>
                      <Button variant="outline" size="sm">👥 Assign Users</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>System Integrations</CardTitle>
                <Button variant="outline" size="sm">🔗 Add Integration</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map(integration => (
                  <div key={integration.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {integration.name}
                          <Badge variant="outline" className="text-xs">
                            {integration.type}
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                        {integration.lastSync && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last sync: {integration.lastSync}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(integration.status)} variant="secondary">
                        {integration.status}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {integration.status === 'Connected' && (
                        <>
                          <Button variant="outline" size="sm">🔄 Sync Now</Button>
                          <Button variant="outline" size="sm">❌ Disconnect</Button>
                        </>
                      )}
                      {integration.status === 'Disconnected' && (
                        <Button variant="outline" size="sm">🔗 Connect</Button>
                      )}
                      {integration.status === 'Error' && (
                        <>
                          <Button variant="outline" size="sm">🔧 Fix</Button>
                          <Button variant="outline" size="sm">🔄 Retry</Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">⚙️ Configure</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                📊 Export Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📁 Import Configuration
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔒 Security Audit
              </Button>
              <Button variant="outline" className="w-full justify-start">
                👥 User Management
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Activity Log
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Two-Factor Auth</span>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">Enabled</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Enhanced security for admin accounts
                  </div>
                </div>
                
                <div className="p-3 border rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Backup</span>
                    <Badge className="bg-blue-100 text-blue-800" variant="secondary">Daily</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last backup: Today 3:00 AM
                  </div>
                </div>
                
                <div className="p-3 border rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Access Logs</span>
                    <Badge className="bg-purple-100 text-purple-800" variant="secondary">Active</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Tracking user activities
                  </div>
                </div>
                
                <div className="p-3 border rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Privacy</span>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">GDPR</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Compliant with regulations
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Database:</span>
                  <span className="font-bold text-green-600">✅ Online</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>API Services:</span>
                  <span className="font-bold text-green-600">✅ Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>File Storage:</span>
                  <span className="font-bold text-green-600">✅ Available</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Email Service:</span>
                  <span className="font-bold text-green-600">✅ Running</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Integrations:</span>
                  <span className="font-bold text-yellow-600">⚠️ 1 Error</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  System uptime: 99.8% (30 days)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Privacy settings updated</div>
                  <div className="text-xs text-muted-foreground">Profile visibility changed to Public</div>
                  <div className="text-xs text-blue-600">2 days ago by John Kamau</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">New role added</div>
                  <div className="text-xs text-muted-foreground">Equipment Manager role created</div>
                  <div className="text-xs text-blue-600">1 week ago by Grace Mutindi</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Integration connected</div>
                  <div className="text-xs text-muted-foreground">M-Pesa payment integration activated</div>
                  <div className="text-xs text-green-600">2 weeks ago by Admin</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                📚 Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💬 Contact Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🐛 Report Issue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💡 Feature Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}