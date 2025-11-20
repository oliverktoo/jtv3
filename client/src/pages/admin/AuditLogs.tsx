import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  category: 'Authentication' | 'Data' | 'System' | 'Security' | 'Admin' | 'Transaction' | 'User Management' | 'Tournament' | 'Match';
  resource: string;
  resourceId?: string;
  details: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint?: string;
    ipAddress: string;
    userAgent: string;
    changes?: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    reason?: string;
    outcome: 'Success' | 'Failed' | 'Blocked' | 'Partial';
    errorMessage?: string;
  };
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  tags: string[];
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'Login Attempt' | 'Failed Login' | 'Account Locked' | 'Password Changed' | 'Role Changed' | 'Suspicious Activity' | 'Data Breach' | 'Unauthorized Access';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  user?: {
    id: string;
    name: string;
    email: string;
  };
  ipAddress: string;
  location?: string;
  details: string;
  status: 'Resolved' | 'Investigating' | 'Open' | 'False Positive';
  investigator?: string;
  resolution?: string;
}

interface ComplianceReport {
  id: string;
  period: string;
  type: 'GDPR' | 'Data Protection' | 'Financial' | 'Security' | 'Operational';
  status: 'Compliant' | 'Non-Compliant' | 'Partial' | 'Under Review';
  findings: {
    total: number;
    compliant: number;
    nonCompliant: number;
    pending: number;
  };
  generatedBy: string;
  generatedAt: string;
  nextReview: string;
}

export default function AuditLogs() {
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-11-30T14:30:15Z',
      user: {
        id: 'u001',
        name: 'John Mwangi',
        email: 'j.mwangi@jamiitourney.com',
        role: 'Tournament Manager'
      },
      action: 'Tournament Created',
      category: 'Tournament',
      resource: 'tournaments',
      resourceId: 't001',
      details: {
        method: 'POST',
        endpoint: '/api/tournaments',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        changes: {
          name: 'County Championship 2024',
          type: 'Knockout',
          maxTeams: 16
        },
        outcome: 'Success'
      },
      severity: 'Info',
      tags: ['tournament', 'creation', 'admin']
    },
    {
      id: '2',
      timestamp: '2024-11-30T14:25:42Z',
      user: {
        id: 'u002',
        name: 'Grace Nyong\'o',
        email: 'g.nyongo@jamiitourney.com',
        role: 'System Administrator'
      },
      action: 'User Role Modified',
      category: 'User Management',
      resource: 'users',
      resourceId: 'u005',
      details: {
        method: 'PUT',
        endpoint: '/api/users/u005/role',
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        oldValues: { role: 'Team Manager' },
        newValues: { role: 'Tournament Manager' },
        reason: 'Promotion to tournament management',
        outcome: 'Success'
      },
      severity: 'Warning',
      tags: ['user', 'role', 'permission', 'admin']
    },
    {
      id: '3',
      timestamp: '2024-11-30T14:20:18Z',
      user: {
        id: 'u003',
        name: 'Peter Kamau',
        email: 'p.kamau@jamiitourney.com',
        role: 'Team Manager'
      },
      action: 'Player Registration',
      category: 'Data',
      resource: 'players',
      resourceId: 'p001',
      details: {
        method: 'POST',
        endpoint: '/api/players/register',
        ipAddress: '172.16.0.25',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        changes: {
          firstName: 'David',
          lastName: 'Ochieng',
          teamId: 'tm001'
        },
        outcome: 'Success'
      },
      severity: 'Info',
      tags: ['player', 'registration', 'team']
    },
    {
      id: '4',
      timestamp: '2024-11-30T14:15:33Z',
      user: {
        id: 'u004',
        name: 'Mary Wanjiku',
        email: 'm.wanjiku@jamiitourney.com',
        role: 'Match Official'
      },
      action: 'Match Score Update',
      category: 'Match',
      resource: 'matches',
      resourceId: 'm001',
      details: {
        method: 'PUT',
        endpoint: '/api/matches/m001/score',
        ipAddress: '192.168.2.75',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        oldValues: { homeScore: 1, awayScore: 0 },
        newValues: { homeScore: 2, awayScore: 1 },
        outcome: 'Success'
      },
      severity: 'Info',
      tags: ['match', 'score', 'official']
    },
    {
      id: '5',
      timestamp: '2024-11-30T14:10:07Z',
      user: {
        id: 'system',
        name: 'System',
        email: 'system@jamiitourney.com',
        role: 'System'
      },
      action: 'Failed Login Attempt',
      category: 'Security',
      resource: 'authentication',
      details: {
        ipAddress: '203.0.113.45',
        userAgent: 'curl/7.68.0',
        errorMessage: 'Invalid credentials for user: admin@example.com',
        outcome: 'Failed'
      },
      severity: 'Warning',
      tags: ['security', 'authentication', 'failed-login']
    },
    {
      id: '6',
      timestamp: '2024-11-30T14:05:22Z',
      user: {
        id: 'u001',
        name: 'John Mwangi',
        email: 'j.mwangi@jamiitourney.com',
        role: 'Tournament Manager'
      },
      action: 'Data Export',
      category: 'Data',
      resource: 'players',
      details: {
        method: 'GET',
        endpoint: '/api/reports/players/export',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        changes: { exportFormat: 'Excel', recordCount: 145 },
        outcome: 'Success'
      },
      severity: 'Info',
      tags: ['export', 'data', 'reporting']
    }
  ];

  const securityEvents: SecurityEvent[] = [
    {
      id: '1',
      timestamp: '2024-11-30T14:10:07Z',
      type: 'Failed Login',
      severity: 'Medium',
      ipAddress: '203.0.113.45',
      location: 'External (Unknown)',
      details: 'Multiple failed login attempts for admin@example.com from suspicious IP address',
      status: 'Investigating',
      investigator: 'Security Team'
    },
    {
      id: '2',
      timestamp: '2024-11-30T13:45:12Z',
      type: 'Suspicious Activity',
      severity: 'High',
      user: {
        id: 'u007',
        name: 'Unknown User',
        email: 'test@test.com'
      },
      ipAddress: '198.51.100.23',
      location: 'External (VPN)',
      details: 'Rapid API calls exceeding normal usage patterns',
      status: 'Resolved',
      investigator: 'John Doe',
      resolution: 'Blocked IP address, activity confirmed as automated bot'
    },
    {
      id: '3',
      timestamp: '2024-11-30T12:30:44Z',
      type: 'Role Changed',
      severity: 'Low',
      user: {
        id: 'u005',
        name: 'Sarah Johnson',
        email: 's.johnson@jamiitourney.com'
      },
      ipAddress: '10.0.0.50',
      location: 'Internal (Admin Office)',
      details: 'User role elevated from Team Manager to Tournament Manager',
      status: 'Resolved',
      investigator: 'Grace Nyong\'o',
      resolution: 'Authorized promotion, documented in HR system'
    }
  ];

  const complianceReports: ComplianceReport[] = [
    {
      id: '1',
      period: 'November 2024',
      type: 'GDPR',
      status: 'Compliant',
      findings: {
        total: 25,
        compliant: 23,
        nonCompliant: 0,
        pending: 2
      },
      generatedBy: 'Compliance Officer',
      generatedAt: '2024-11-30T10:00:00Z',
      nextReview: '2024-12-30'
    },
    {
      id: '2',
      period: 'November 2024',
      type: 'Security',
      status: 'Partial',
      findings: {
        total: 18,
        compliant: 15,
        nonCompliant: 2,
        pending: 1
      },
      generatedBy: 'Security Team',
      generatedAt: '2024-11-29T16:30:00Z',
      nextReview: '2024-12-15'
    },
    {
      id: '3',
      period: 'October 2024',
      type: 'Financial',
      status: 'Compliant',
      findings: {
        total: 12,
        compliant: 12,
        nonCompliant: 0,
        pending: 0
      },
      generatedBy: 'Financial Controller',
      generatedAt: '2024-11-01T09:00:00Z',
      nextReview: '2025-01-01'
    }
  ];

  const getSeverityColor = (severity: AuditLog['severity'] | SecurityEvent['severity']) => {
    switch (severity) {
      case 'Info': 
      case 'Low': 
        return 'bg-blue-100 text-blue-800';
      case 'Warning': 
      case 'Medium': 
        return 'bg-yellow-100 text-yellow-800';
      case 'Error': 
      case 'High': 
        return 'bg-orange-100 text-orange-800';
      case 'Critical': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: AuditLog['category']) => {
    switch (category) {
      case 'Authentication': 
      case 'Security': 
        return 'bg-red-100 text-red-800';
      case 'Data': 
        return 'bg-blue-100 text-blue-800';
      case 'System': 
        return 'bg-gray-100 text-gray-800';
      case 'Admin': 
      case 'User Management': 
        return 'bg-purple-100 text-purple-800';
      case 'Transaction': 
        return 'bg-green-100 text-green-800';
      case 'Tournament': 
      case 'Match': 
        return 'bg-orange-100 text-orange-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Success': 
        return 'bg-green-100 text-green-800';
      case 'Failed': 
      case 'Blocked': 
        return 'bg-red-100 text-red-800';
      case 'Partial': 
        return 'bg-yellow-100 text-yellow-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': 
      case 'Compliant': 
        return 'bg-green-100 text-green-800';
      case 'Investigating': 
      case 'Under Review': 
      case 'Partial': 
        return 'bg-yellow-100 text-yellow-800';
      case 'Open': 
      case 'Non-Compliant': 
        return 'bg-red-100 text-red-800';
      case 'False Positive': 
        return 'bg-blue-100 text-blue-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTotalLogs = () => auditLogs.length;
  const getSecurityEvents = () => securityEvents.length;
  const getCriticalEvents = () => [...auditLogs, ...securityEvents].filter(
    event => event.severity === 'Critical' || event.severity === 'Error'
  ).length;
  const getActiveInvestigations = () => securityEvents.filter(
    event => event.status === 'Investigating' || event.status === 'Open'
  ).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs & Compliance</h1>
          <p className="text-muted-foreground">Comprehensive system activity monitoring and compliance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Generate Report</Button>
          <Button variant="outline">📥 Export Logs</Button>
          <Button>🔍 Advanced Search</Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{getTotalLogs()}</div>
            <div className="text-sm text-muted-foreground">Total Audit Logs</div>
            <div className="text-xs text-blue-600 mt-1">Last 24 hours</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{getSecurityEvents()}</div>
            <div className="text-sm text-muted-foreground">Security Events</div>
            <div className="text-xs text-orange-600 mt-1">Active monitoring</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{getCriticalEvents()}</div>
            <div className="text-sm text-muted-foreground">Critical Events</div>
            <div className="text-xs text-red-600 mt-1">Requiring attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{getActiveInvestigations()}</div>
            <div className="text-sm text-muted-foreground">Active Investigations</div>
            <div className="text-xs text-purple-600 mt-1">Under review</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>Detailed activity logs for all system operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map(log => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                          {log.category === 'Authentication' && '🔐'}
                          {log.category === 'Data' && '📊'}
                          {log.category === 'System' && '⚙️'}
                          {log.category === 'Security' && '🛡️'}
                          {log.category === 'Admin' && '👨‍💼'}
                          {log.category === 'Transaction' && '💰'}
                          {log.category === 'User Management' && '👥'}
                          {log.category === 'Tournament' && '🏆'}
                          {log.category === 'Match' && '⚽'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{log.action}</h4>
                            <Badge className={getSeverityColor(log.severity)} variant="secondary">
                              {log.severity}
                            </Badge>
                            <Badge className={getCategoryColor(log.category)} variant="secondary">
                              {log.category}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            By {log.user.name} ({log.user.role}) • {formatTimestamp(log.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Badge className={getOutcomeColor(log.details.outcome)} variant="secondary">
                        {log.details.outcome}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs text-muted-foreground">Resource</div>
                        <div className="font-medium text-sm">
                          {log.resource}{log.resourceId && ` (${log.resourceId})`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">IP Address</div>
                        <div className="font-medium text-sm">{log.details.ipAddress}</div>
                      </div>
                      {log.details.method && (
                        <div>
                          <div className="text-xs text-muted-foreground">Method</div>
                          <Badge variant="outline">{log.details.method}</Badge>
                        </div>
                      )}
                      {log.details.endpoint && (
                        <div>
                          <div className="text-xs text-muted-foreground">Endpoint</div>
                          <code className="text-xs bg-gray-100 px-1 rounded">{log.details.endpoint}</code>
                        </div>
                      )}
                    </div>

                    {(log.details.changes || log.details.oldValues) && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">Changes Made</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {log.details.oldValues && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Previous Values</div>
                              <div className="bg-red-50 border border-red-200 p-2 rounded">
                                {Object.entries(log.details.oldValues).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="font-medium">{key}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {(log.details.newValues || log.details.changes) && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">New Values</div>
                              <div className="bg-green-50 border border-green-200 p-2 rounded">
                                {Object.entries(log.details.newValues || log.details.changes || {}).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="font-medium">{key}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {log.details.reason && (
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-xs text-muted-foreground">Reason</div>
                        <div className="text-sm">{log.details.reason}</div>
                      </div>
                    )}

                    {log.details.errorMessage && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="text-xs text-muted-foreground">Error Message</div>
                        <div className="text-sm text-red-700">{log.details.errorMessage}</div>
                      </div>
                    )}

                    {log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {log.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">👁️ View Details</Button>
                      <Button variant="outline" size="sm">🔄 Related Logs</Button>
                      <Button variant="outline" size="sm">📧 Alert Admin</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Events */}
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Security incidents and monitoring alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-lg">
                          {event.type === 'Failed Login' && '🚫'}
                          {event.type === 'Suspicious Activity' && '⚠️'}
                          {event.type === 'Role Changed' && '🔄'}
                          {event.type === 'Account Locked' && '🔒'}
                          {event.type === 'Data Breach' && '💀'}
                          {event.type === 'Unauthorized Access' && '🚨'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{event.type}</h4>
                            <Badge className={getSeverityColor(event.severity)} variant="secondary">
                              {event.severity}
                            </Badge>
                            <Badge className={getStatusColor(event.status)} variant="secondary">
                              {event.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTimestamp(event.timestamp)} • {event.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs text-muted-foreground">IP Address</div>
                        <div className="font-medium text-sm">{event.ipAddress}</div>
                      </div>
                      {event.user && (
                        <div>
                          <div className="text-xs text-muted-foreground">User</div>
                          <div className="font-medium text-sm">{event.user.name}</div>
                        </div>
                      )}
                      {event.investigator && (
                        <div>
                          <div className="text-xs text-muted-foreground">Investigator</div>
                          <div className="font-medium text-sm">{event.investigator}</div>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">Event Details</div>
                      <div className="text-sm p-2 bg-gray-50 border rounded">
                        {event.details}
                      </div>
                    </div>

                    {event.resolution && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Resolution</div>
                        <div className="text-sm p-2 bg-green-50 border border-green-200 rounded">
                          {event.resolution}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">🔍 Investigate</Button>
                      <Button variant="outline" size="sm">📋 Update Status</Button>
                      <Button variant="outline" size="sm">🔒 Block IP</Button>
                      <Button variant="outline" size="sm">📧 Alert Team</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Regulatory compliance status and audit reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{report.type} Compliance Report</h4>
                          <Badge className={getStatusColor(report.status)} variant="secondary">
                            {report.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {report.period} • Generated by {report.generatedBy}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {formatTimestamp(report.generatedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{report.findings.total}</div>
                        <div className="text-xs text-muted-foreground">Total Checks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{report.findings.compliant}</div>
                        <div className="text-xs text-muted-foreground">Compliant</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{report.findings.nonCompliant}</div>
                        <div className="text-xs text-muted-foreground">Non-Compliant</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{report.findings.pending}</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Compliance Rate</span>
                        <span className="text-sm font-semibold">
                          {Math.round((report.findings.compliant / report.findings.total) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(report.findings.compliant / report.findings.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-3 text-sm">
                      <span className="text-muted-foreground">Next Review:</span>
                      <span className="ml-2 font-semibold">{report.nextReview}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">📄 View Report</Button>
                      <Button variant="outline" size="sm">📊 Detailed Analysis</Button>
                      <Button variant="outline" size="sm">📥 Download</Button>
                      <Button variant="outline" size="sm">📧 Share</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">System Uptime</span>
                    <span className="text-sm font-semibold text-green-600">99.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Security Score</span>
                    <span className="text-sm font-semibold text-blue-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Compliance Rate</span>
                    <span className="text-sm font-semibold text-green-600">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Data Integrity</span>
                    <span className="text-sm font-semibold text-green-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Log Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Log Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🔐</span>
                  <span className="text-sm">Authentication</span>
                </div>
                <span className="font-semibold">1</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span className="text-sm">Data Operations</span>
                </div>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span className="text-sm">Security Events</span>
                </div>
                <span className="font-semibold">1</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span className="text-sm">User Management</span>
                </div>
                <span className="font-semibold">1</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🏆</span>
                  <span className="text-sm">Tournament Activities</span>
                </div>
                <span className="font-semibold">1</span>
              </div>
            </CardContent>
          </Card>

          {/* Filter Options */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                📅 Date Range
              </Button>
              <Button variant="outline" className="w-full justify-start">
                👤 User Filter
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🏷️ Category Filter
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⚠️ Severity Filter
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎯 Action Filter
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                🚨 Security Alert
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📥 Export Logs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔍 Advanced Search
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⚙️ Configure Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Failed Login Attempts</div>
                    <div className="text-xs text-muted-foreground">Multiple attempts detected</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">High API Usage</div>
                    <div className="text-xs text-muted-foreground">Rate limit approaching</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Compliance Check</div>
                    <div className="text-xs text-muted-foreground">Monthly report due</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}