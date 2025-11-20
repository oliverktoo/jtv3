import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PrivacySetting {
  id: string;
  category: string;
  setting: string;
  description: string;
  value: 'Public' | 'Team Only' | 'Private' | 'Friends Only' | 'Custom';
  customOptions?: string[];
  lastUpdated: string;
}

interface DataRequest {
  id: string;
  requestType: 'Data Export' | 'Data Deletion' | 'Data Correction' | 'Access Request' | 'Portability';
  requestDate: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  description: string;
  completionDate?: string;
  downloadLink?: string;
  rejectionReason?: string;
}

interface ConsentRecord {
  id: string;
  consentType: string;
  purpose: string;
  granted: boolean;
  grantDate: string;
  revokeDate?: string;
  dataCategories: string[];
  thirdParties?: string[];
}

interface DataCategory {
  id: string;
  name: string;
  description: string;
  dataPoints: string[];
  retention: string;
  purposes: string[];
  thirdParties: string[];
}

export default function PlayerPrivacyControls() {
  const privacySettings: PrivacySetting[] = [
    {
      id: '1',
      category: 'Profile Information',
      setting: 'Profile Visibility',
      description: 'Who can view your basic profile information',
      value: 'Public',
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      category: 'Profile Information',
      setting: 'Contact Information',
      description: 'Visibility of email and phone number',
      value: 'Team Only',
      lastUpdated: '2024-01-15'
    },
    {
      id: '3',
      category: 'Performance Data',
      setting: 'Match Statistics',
      description: 'Who can view your match performance statistics',
      value: 'Public',
      lastUpdated: '2024-02-10'
    },
    {
      id: '4',
      category: 'Performance Data',
      setting: 'Training Data',
      description: 'Visibility of training session data and fitness metrics',
      value: 'Team Only',
      lastUpdated: '2024-02-10'
    },
    {
      id: '5',
      category: 'Media & Content',
      setting: 'Photos & Videos',
      description: 'Use of your photos and videos in club media',
      value: 'Public',
      lastUpdated: '2024-01-20'
    },
    {
      id: '6',
      category: 'Media & Content',
      setting: 'Interview Content',
      description: 'Sharing of interview quotes and statements',
      value: 'Public',
      lastUpdated: '2024-03-05'
    },
    {
      id: '7',
      category: 'Location Data',
      setting: 'Location Tracking',
      description: 'GPS tracking during training and matches',
      value: 'Team Only',
      lastUpdated: '2024-11-01'
    },
    {
      id: '8',
      category: 'Communication',
      setting: 'Marketing Communications',
      description: 'Receiving promotional emails and SMS',
      value: 'Private',
      lastUpdated: '2024-09-15'
    },
    {
      id: '9',
      category: 'Social Features',
      setting: 'Fan Interactions',
      description: 'Allowing direct messages from fans',
      value: 'Private',
      lastUpdated: '2024-10-20'
    },
    {
      id: '10',
      category: 'Social Features',
      setting: 'Social Media Linking',
      description: 'Linking your social media accounts to profile',
      value: 'Public',
      lastUpdated: '2024-01-25'
    }
  ];

  const dataRequests: DataRequest[] = [
    {
      id: '1',
      requestType: 'Data Export',
      requestDate: '2024-11-20',
      status: 'Processing',
      description: 'Export all personal data for backup purposes'
    },
    {
      id: '2',
      requestType: 'Data Correction',
      requestDate: '2024-10-15',
      status: 'Completed',
      description: 'Update birth date information',
      completionDate: '2024-10-16'
    },
    {
      id: '3',
      requestType: 'Access Request',
      requestDate: '2024-09-10',
      status: 'Completed',
      description: 'Request access to all stored data categories',
      completionDate: '2024-09-12',
      downloadLink: '/downloads/data-access-report-sept-2024.pdf'
    }
  ];

  const consentRecords: ConsentRecord[] = [
    {
      id: '1',
      consentType: 'Performance Analytics',
      purpose: 'Statistical analysis and performance improvement',
      granted: true,
      grantDate: '2024-01-15',
      dataCategories: ['Match Statistics', 'Training Data', 'Physical Metrics'],
      thirdParties: ['Performance Analytics Inc.']
    },
    {
      id: '2',
      consentType: 'Marketing Communications',
      purpose: 'Promotional content and club news',
      granted: false,
      grantDate: '2024-01-15',
      revokeDate: '2024-09-15',
      dataCategories: ['Contact Information', 'Preferences'],
      thirdParties: ['Marketing Partners', 'Sponsors']
    },
    {
      id: '3',
      consentType: 'Medical Data Processing',
      purpose: 'Health monitoring and injury prevention',
      granted: true,
      grantDate: '2024-02-01',
      dataCategories: ['Medical Records', 'Fitness Data', 'Injury History'],
      thirdParties: ['Medical Staff', 'Sports Scientists']
    },
    {
      id: '4',
      consentType: 'Social Media Integration',
      purpose: 'Cross-platform content sharing and engagement',
      granted: true,
      grantDate: '2024-01-25',
      dataCategories: ['Profile Information', 'Photos', 'Achievement Data'],
      thirdParties: ['Social Media Platforms']
    },
    {
      id: '5',
      consentType: 'Location Services',
      purpose: 'Travel coordination and venue navigation',
      granted: true,
      grantDate: '2024-11-01',
      dataCategories: ['GPS Data', 'Travel Patterns'],
      thirdParties: ['Travel Coordinators', 'Transport Services']
    }
  ];

  const dataCategories: DataCategory[] = [
    {
      id: '1',
      name: 'Personal Information',
      description: 'Basic identity and contact information',
      dataPoints: ['Full Name', 'Date of Birth', 'Address', 'Phone', 'Email', 'Emergency Contacts'],
      retention: '7 years after contract end',
      purposes: ['Player Registration', 'Communication', 'Emergency Contact'],
      thirdParties: ['Football Associations', 'Insurance Companies']
    },
    {
      id: '2',
      name: 'Performance Data',
      description: 'Match and training performance metrics',
      dataPoints: ['Match Statistics', 'Training Metrics', 'Physical Tests', 'Skill Assessments'],
      retention: '10 years for historical records',
      purposes: ['Performance Analysis', 'Career Development', 'Transfer Negotiations'],
      thirdParties: ['Scouts', 'Performance Analytics Companies', 'Media Partners']
    },
    {
      id: '3',
      name: 'Medical Information',
      description: 'Health and fitness related data',
      dataPoints: ['Medical History', 'Injury Records', 'Fitness Tests', 'Vaccination Status'],
      retention: '10 years for medical compliance',
      purposes: ['Health Monitoring', 'Injury Prevention', 'Medical Compliance'],
      thirdParties: ['Medical Staff', 'Insurance Providers', 'Sports Medicine Facilities']
    },
    {
      id: '4',
      name: 'Financial Data',
      description: 'Contract and payment related information',
      dataPoints: ['Contract Terms', 'Salary Information', 'Bonus Payments', 'Tax Details'],
      retention: '7 years for tax compliance',
      purposes: ['Payroll Processing', 'Tax Reporting', 'Contract Management'],
      thirdParties: ['Payroll Services', 'Tax Authorities', 'Banks']
    },
    {
      id: '5',
      name: 'Media Content',
      description: 'Photos, videos, and promotional material',
      dataPoints: ['Profile Photos', 'Action Videos', 'Interview Recordings', 'Social Media Content'],
      retention: '5 years or until consent withdrawal',
      purposes: ['Marketing', 'Media Relations', 'Fan Engagement'],
      thirdParties: ['Media Agencies', 'Broadcasters', 'Sponsors', 'Social Media Platforms']
    }
  ];

  const getPrivacyLevelColor = (level: PrivacySetting['value']) => {
    switch (level) {
      case 'Public': return 'bg-red-100 text-red-800';
      case 'Team Only': return 'bg-yellow-100 text-yellow-800';
      case 'Friends Only': return 'bg-blue-100 text-blue-800';
      case 'Private': return 'bg-green-100 text-green-800';
      case 'Custom': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusColor = (status: DataRequest['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculatePrivacyScore = () => {
    const privateCount = privacySettings.filter(setting => 
      setting.value === 'Private' || setting.value === 'Team Only'
    ).length;
    return Math.round((privateCount / privacySettings.length) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Privacy Controls</h1>
          <p className="text-muted-foreground">Manage your data privacy and consent preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📥 Export Data</Button>
          <Button variant="outline">🔒 Privacy Guide</Button>
          <Button>⚙️ Quick Setup</Button>
        </div>
      </div>

      {/* Privacy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{calculatePrivacyScore()}%</div>
            <div className="text-sm text-muted-foreground">Privacy Score</div>
            <div className="text-xs text-blue-600 mt-1">Data protection level</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{consentRecords.filter(c => c.granted).length}</div>
            <div className="text-sm text-muted-foreground">Active Consents</div>
            <div className="text-xs text-green-600 mt-1">Currently granted</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{dataRequests.filter(r => r.status === 'Processing').length}</div>
            <div className="text-sm text-muted-foreground">Pending Requests</div>
            <div className="text-xs text-yellow-600 mt-1">Being processed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{dataCategories.length}</div>
            <div className="text-sm text-muted-foreground">Data Categories</div>
            <div className="text-xs text-muted-foreground mt-1">Types collected</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can access different types of your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Profile Information', 'Performance Data', 'Media & Content', 'Location Data', 'Communication', 'Social Features'].map(category => (
                  <div key={category}>
                    <h4 className="font-semibold mb-3 text-lg">{category}</h4>
                    <div className="space-y-3 ml-4 border-l-2 border-gray-100 pl-4">
                      {privacySettings
                        .filter(setting => setting.category === category)
                        .map(setting => (
                          <div key={setting.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex-1">
                              <div className="font-medium">{setting.setting}</div>
                              <div className="text-sm text-muted-foreground">{setting.description}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Last updated: {setting.lastUpdated}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getPrivacyLevelColor(setting.value)} variant="secondary">
                                {setting.value}
                              </Badge>
                              <select 
                                defaultValue={setting.value}
                                className="p-2 border rounded text-sm min-w-32"
                              >
                                <option value="Public">Public</option>
                                <option value="Team Only">Team Only</option>
                                <option value="Friends Only">Friends Only</option>
                                <option value="Private">Private</option>
                                <option value="Custom">Custom</option>
                              </select>
                              <Button variant="outline" size="sm">✏️</Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Requests */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Data Requests</CardTitle>
                  <CardDescription>Your data access, export, and deletion requests</CardDescription>
                </div>
                <Button>📤 New Request</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataRequests.map(request => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold">{request.requestType}</div>
                          <Badge className={getRequestStatusColor(request.status)} variant="secondary">
                            {request.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{request.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Requested: {request.requestDate}
                          {request.completionDate && ` • Completed: ${request.completionDate}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {request.downloadLink && (
                          <Button variant="outline" size="sm">⬇️ Download</Button>
                        )}
                        <Button variant="outline" size="sm">👁️ View</Button>
                      </div>
                    </div>
                    
                    {request.rejectionReason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {request.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consent Management */}
          <Card>
            <CardHeader>
              <CardTitle>Consent Management</CardTitle>
              <CardDescription>Manage your consents for data processing activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentRecords.map(consent => (
                  <div key={consent.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold">{consent.consentType}</div>
                          <div className={`w-3 h-3 rounded-full ${consent.granted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{consent.purpose}</div>
                        <div className="text-xs text-muted-foreground">
                          Granted: {consent.grantDate}
                          {consent.revokeDate && ` • Revoked: ${consent.revokeDate}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded text-sm font-medium ${
                          consent.granted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {consent.granted ? 'Active' : 'Revoked'}
                        </div>
                        <Button 
                          variant={consent.granted ? 'destructive' : 'default'} 
                          size="sm"
                        >
                          {consent.granted ? 'Revoke' : 'Grant'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-1">Data Categories:</div>
                        <div className="space-y-1">
                          {consent.dataCategories.map((category, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {consent.thirdParties && consent.thirdParties.length > 0 && (
                        <div>
                          <div className="font-medium mb-1">Third Parties:</div>
                          <div className="space-y-1">
                            {consent.thirdParties.map((party, index) => (
                              <Badge key={index} variant="secondary" className="mr-1 mb-1">
                                {party}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Data Categories</CardTitle>
              <CardDescription>Understanding what data we collect and how it's used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataCategories.map(category => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{category.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                        <div className="text-xs text-muted-foreground">
                          <strong>Retention:</strong> {category.retention}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">📄 Details</Button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-1">Data Points:</div>
                        <div className="space-y-1">
                          {category.dataPoints.map((point, index) => (
                            <div key={index} className="text-xs p-1 bg-gray-100 rounded">
                              {point}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-1">Purposes:</div>
                        <div className="space-y-1">
                          {category.purposes.map((purpose, index) => (
                            <div key={index} className="text-xs p-1 bg-blue-100 rounded">
                              {purpose}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-1">Shared With:</div>
                        <div className="space-y-1">
                          {category.thirdParties.map((party, index) => (
                            <div key={index} className="text-xs p-1 bg-yellow-100 rounded">
                              {party}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Privacy Score */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {calculatePrivacyScore()}%
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Your data protection level
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${calculatePrivacyScore()}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {calculatePrivacyScore() >= 70 ? 'Excellent privacy protection' : 
                   calculatePrivacyScore() >= 50 ? 'Good privacy settings' : 
                   'Consider improving privacy settings'}
                </div>
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
                🔒 Set All Private
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📤 Export My Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🗑️ Delete Account
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ✏️ Update Consents
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Privacy Report
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Privacy Updated</div>
                    <div className="text-xs text-muted-foreground">Marketing communications set to private</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Data Exported</div>
                    <div className="text-xs text-muted-foreground">Full data export completed</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Consent Updated</div>
                    <div className="text-xs text-muted-foreground">Location services consent granted</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Data Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600">ℹ️</div>
                  <div>
                    <div className="font-semibold">Right to Access</div>
                    <div className="text-muted-foreground text-xs">Request copies of your personal data</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="text-green-600">✏️</div>
                  <div>
                    <div className="font-semibold">Right to Rectification</div>
                    <div className="text-muted-foreground text-xs">Correct inaccurate personal data</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="text-red-600">🗑️</div>
                  <div>
                    <div className="font-semibold">Right to Erasure</div>
                    <div className="text-muted-foreground text-xs">Request deletion of your data</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="text-purple-600">📤</div>
                  <div>
                    <div className="font-semibold">Right to Portability</div>
                    <div className="text-muted-foreground text-xs">Transfer data to another service</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="text-orange-600">🚫</div>
                  <div>
                    <div className="font-semibold">Right to Object</div>
                    <div className="text-muted-foreground text-xs">Object to processing of your data</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-3">
                <div>
                  <div className="font-semibold">📞 Privacy Officer</div>
                  <div className="text-muted-foreground">+254 700 444 123</div>
                </div>
                
                <div>
                  <div className="font-semibold">📧 Data Protection</div>
                  <div className="text-muted-foreground">privacy@nairobifc.com</div>
                </div>
                
                <div>
                  <div className="font-semibold">📋 Privacy Policy</div>
                  <Button variant="ghost" className="p-0 text-blue-600">
                    View full policy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}