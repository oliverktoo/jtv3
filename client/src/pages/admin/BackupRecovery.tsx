import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface BackupConfiguration {
  automatic: {
    enabled: boolean;
    frequency: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
    time: string;
    retention: {
      dailyBackups: number;
      weeklyBackups: number;
      monthlyBackups: number;
      yearlyBackups: number;
    };
  };
  storage: {
    primary: 'Local' | 'AWS S3' | 'Google Cloud' | 'Azure Blob' | 'FTP';
    secondary?: 'Local' | 'AWS S3' | 'Google Cloud' | 'Azure Blob' | 'FTP';
    encryption: boolean;
    compression: boolean;
    location: string;
    maxSize: number; // GB
  };
  components: {
    database: boolean;
    files: boolean;
    configurations: boolean;
    logs: boolean;
    userUploads: boolean;
  };
}

interface BackupRecord {
  id: string;
  timestamp: string;
  type: 'Full' | 'Incremental' | 'Differential' | 'Manual';
  status: 'Completed' | 'Failed' | 'In Progress' | 'Cancelled' | 'Partial';
  size: number; // MB
  duration: number; // minutes
  components: string[];
  location: string;
  checksum: string;
  triggeredBy: 'Automatic' | 'Manual' | 'API' | 'Schedule';
  notes?: string;
  errorMessage?: string;
  restorable: boolean;
}

interface RestorePoint {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  backupIds: string[];
  systemVersion: string;
  dataIntegrity: 'Verified' | 'Partial' | 'Unknown' | 'Corrupted';
  size: number; // MB
  components: string[];
  tags: string[];
}

interface RecoveryPlan {
  id: string;
  name: string;
  type: 'Disaster Recovery' | 'Data Corruption' | 'System Failure' | 'Security Breach' | 'User Error';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedRTO: number; // hours (Recovery Time Objective)
  estimatedRPO: number; // hours (Recovery Point Objective)
  steps: RecoveryStep[];
  contacts: {
    primary: string;
    secondary: string;
    technical: string;
  };
  lastTested: string;
  testStatus: 'Passed' | 'Failed' | 'Not Tested' | 'Scheduled';
}

interface RecoveryStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  responsible: string;
  dependencies: string[];
  automation: boolean;
  commands?: string[];
  verificationChecks: string[];
}

interface SystemHealth {
  overall: 'Healthy' | 'Warning' | 'Critical' | 'Unknown';
  database: {
    status: 'Online' | 'Offline' | 'Degraded' | 'Maintenance';
    size: number; // GB
    lastBackup: string;
    integrity: 'Good' | 'Warning' | 'Error';
  };
  storage: {
    used: number; // GB
    available: number; // GB
    usage: number; // percentage
    backupSpace: number; // GB
  };
  services: {
    api: 'Running' | 'Stopped' | 'Error' | 'Degraded';
    database: 'Running' | 'Stopped' | 'Error' | 'Degraded';
    backup: 'Running' | 'Stopped' | 'Error' | 'Degraded';
    monitoring: 'Running' | 'Stopped' | 'Error' | 'Degraded';
  };
}

export default function BackupRecovery() {
  const backupConfig: BackupConfiguration = {
    automatic: {
      enabled: true,
      frequency: 'Daily',
      time: '02:00',
      retention: {
        dailyBackups: 7,
        weeklyBackups: 4,
        monthlyBackups: 12,
        yearlyBackups: 3
      }
    },
    storage: {
      primary: 'AWS S3',
      secondary: 'Local',
      encryption: true,
      compression: true,
      location: 's3://jamii-tourney-backups/',
      maxSize: 500
    },
    components: {
      database: true,
      files: true,
      configurations: true,
      logs: true,
      userUploads: true
    }
  };

  const backupHistory: BackupRecord[] = [
    {
      id: 'bkp_001',
      timestamp: '2024-11-30T02:00:00Z',
      type: 'Full',
      status: 'Completed',
      size: 2456,
      duration: 18,
      components: ['Database', 'Files', 'Configurations', 'User Uploads'],
      location: 's3://jamii-tourney-backups/2024/11/30/full-backup-001.tar.gz',
      checksum: 'sha256:a1b2c3d4e5f6...',
      triggeredBy: 'Automatic',
      restorable: true
    },
    {
      id: 'bkp_002',
      timestamp: '2024-11-29T02:00:00Z',
      type: 'Full',
      status: 'Completed',
      size: 2389,
      duration: 16,
      components: ['Database', 'Files', 'Configurations', 'User Uploads'],
      location: 's3://jamii-tourney-backups/2024/11/29/full-backup-002.tar.gz',
      checksum: 'sha256:b2c3d4e5f6a1...',
      triggeredBy: 'Automatic',
      restorable: true
    },
    {
      id: 'bkp_003',
      timestamp: '2024-11-28T14:30:00Z',
      type: 'Manual',
      status: 'Completed',
      size: 2412,
      duration: 22,
      components: ['Database', 'Configurations'],
      location: 's3://jamii-tourney-backups/2024/11/28/manual-backup-003.tar.gz',
      checksum: 'sha256:c3d4e5f6a1b2...',
      triggeredBy: 'Manual',
      notes: 'Pre-deployment backup before system upgrade',
      restorable: true
    },
    {
      id: 'bkp_004',
      timestamp: '2024-11-27T02:00:00Z',
      type: 'Full',
      status: 'Failed',
      size: 0,
      duration: 5,
      components: ['Database', 'Files', 'Configurations', 'User Uploads'],
      location: '',
      checksum: '',
      triggeredBy: 'Automatic',
      errorMessage: 'Network timeout during transfer to S3 bucket',
      restorable: false
    },
    {
      id: 'bkp_005',
      timestamp: '2024-11-26T02:00:00Z',
      type: 'Full',
      status: 'Completed',
      size: 2298,
      duration: 19,
      components: ['Database', 'Files', 'Configurations', 'User Uploads'],
      location: 's3://jamii-tourney-backups/2024/11/26/full-backup-005.tar.gz',
      checksum: 'sha256:d4e5f6a1b2c3...',
      triggeredBy: 'Automatic',
      restorable: true
    }
  ];

  const restorePoints: RestorePoint[] = [
    {
      id: 'rp_001',
      name: 'Pre-Tournament Setup',
      timestamp: '2024-11-28T14:30:00Z',
      description: 'System state before County Championship tournament configuration',
      backupIds: ['bkp_003'],
      systemVersion: 'v3.2.1',
      dataIntegrity: 'Verified',
      size: 2412,
      components: ['Database', 'Configurations'],
      tags: ['stable', 'pre-tournament', 'tested']
    },
    {
      id: 'rp_002',
      name: 'Monthly Checkpoint',
      timestamp: '2024-11-01T02:00:00Z',
      description: 'Monthly full system backup with all components',
      backupIds: ['bkp_012', 'bkp_013'],
      systemVersion: 'v3.1.8',
      dataIntegrity: 'Verified',
      size: 4890,
      components: ['Database', 'Files', 'Configurations', 'User Uploads', 'Logs'],
      tags: ['monthly', 'complete', 'verified']
    },
    {
      id: 'rp_003',
      name: 'Clean State Baseline',
      timestamp: '2024-10-15T10:00:00Z',
      description: 'Clean system state after data migration and optimization',
      backupIds: ['bkp_025'],
      systemVersion: 'v3.1.5',
      dataIntegrity: 'Verified',
      size: 1876,
      components: ['Database', 'Configurations'],
      tags: ['baseline', 'clean', 'optimized']
    }
  ];

  const recoveryPlans: RecoveryPlan[] = [
    {
      id: 'drp_001',
      name: 'Complete System Disaster Recovery',
      type: 'Disaster Recovery',
      priority: 'Critical',
      estimatedRTO: 4,
      estimatedRPO: 1,
      steps: [
        {
          id: 'step_001',
          order: 1,
          title: 'Assess System Damage',
          description: 'Evaluate the extent of system failure and data loss',
          estimatedTime: 30,
          responsible: 'System Administrator',
          dependencies: [],
          automation: false,
          verificationChecks: ['System accessibility', 'Database connectivity', 'File system integrity']
        },
        {
          id: 'step_002',
          order: 2,
          title: 'Initialize Backup Infrastructure',
          description: 'Set up temporary infrastructure for restoration',
          estimatedTime: 60,
          responsible: 'DevOps Team',
          dependencies: ['step_001'],
          automation: true,
          commands: ['terraform apply -var="environment=disaster-recovery"'],
          verificationChecks: ['Infrastructure provisioned', 'Network connectivity', 'Storage mounted']
        },
        {
          id: 'step_003',
          order: 3,
          title: 'Restore Database',
          description: 'Restore database from the latest verified backup',
          estimatedTime: 90,
          responsible: 'Database Administrator',
          dependencies: ['step_002'],
          automation: true,
          commands: ['restore_database.sh --source=latest --verify-integrity'],
          verificationChecks: ['Database online', 'Data integrity verified', 'User access restored']
        }
      ],
      contacts: {
        primary: 'John Mwangi (+254 701 234 567)',
        secondary: 'Grace Nyong\'o (+254 702 345 678)',
        technical: 'DevOps Team (+254 703 456 789)'
      },
      lastTested: '2024-10-15',
      testStatus: 'Passed'
    },
    {
      id: 'drp_002',
      name: 'Database Corruption Recovery',
      type: 'Data Corruption',
      priority: 'High',
      estimatedRTO: 2,
      estimatedRPO: 0.5,
      steps: [
        {
          id: 'step_004',
          order: 1,
          title: 'Isolate Corrupted Database',
          description: 'Take corrupted database offline to prevent further damage',
          estimatedTime: 15,
          responsible: 'Database Administrator',
          dependencies: [],
          automation: true,
          commands: ['stop_database_service.sh', 'backup_corrupted_state.sh'],
          verificationChecks: ['Database offline', 'Corruption isolated', 'Backup created']
        }
      ],
      contacts: {
        primary: 'Database Team (+254 704 567 890)',
        secondary: 'System Administrator (+254 701 234 567)',
        technical: 'Technical Support (+254 705 678 901)'
      },
      lastTested: '2024-11-01',
      testStatus: 'Passed'
    }
  ];

  const systemHealth: SystemHealth = {
    overall: 'Healthy',
    database: {
      status: 'Online',
      size: 15.6,
      lastBackup: '2024-11-30T02:00:00Z',
      integrity: 'Good'
    },
    storage: {
      used: 89.4,
      available: 410.6,
      usage: 18,
      backupSpace: 45.2
    },
    services: {
      api: 'Running',
      database: 'Running',
      backup: 'Running',
      monitoring: 'Running'
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Healthy':
      case 'Online':
      case 'Running':
      case 'Good':
      case 'Verified':
      case 'Passed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
      case 'Warning':
      case 'Degraded':
      case 'Partial':
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
      case 'Critical':
      case 'Offline':
      case 'Stopped':
      case 'Error':
      case 'Corrupted':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
      case 'Unknown':
      case 'Not Tested':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full': return 'bg-blue-100 text-blue-800';
      case 'Incremental': return 'bg-green-100 text-green-800';
      case 'Differential': return 'bg-orange-100 text-orange-800';
      case 'Manual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: RecoveryPlan['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(2)} GB`;
    }
    return `${sizeInMB.toFixed(0)} MB`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuccessRate = () => {
    const completed = backupHistory.filter(b => b.status === 'Completed').length;
    return Math.round((completed / backupHistory.length) * 100);
  };

  const getTotalBackupSize = () => {
    return backupHistory
      .filter(b => b.status === 'Completed')
      .reduce((total, backup) => total + backup.size, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Backup & Recovery</h1>
          <p className="text-muted-foreground">Comprehensive data protection and disaster recovery management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">💾 Run Backup Now</Button>
          <Button variant="outline">🔄 Test Recovery</Button>
          <Button>📊 Recovery Report</Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{getSuccessRate()}%</div>
            <div className="text-sm text-muted-foreground">Backup Success Rate</div>
            <div className="text-xs text-green-600 mt-1">Last 30 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{formatFileSize(getTotalBackupSize())}</div>
            <div className="text-sm text-muted-foreground">Total Backup Size</div>
            <div className="text-xs text-blue-600 mt-1">Current retention</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{restorePoints.length}</div>
            <div className="text-sm text-muted-foreground">Restore Points</div>
            <div className="text-xs text-purple-600 mt-1">Available</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{recoveryPlans.length}</div>
            <div className="text-sm text-muted-foreground">Recovery Plans</div>
            <div className="text-xs text-orange-600 mt-1">Ready to execute</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Health Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Health Status</CardTitle>
              <CardDescription>Real-time monitoring of critical system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                      💚
                    </div>
                    <div>
                      <h3 className="font-semibold">Overall System Status</h3>
                      <p className="text-sm text-muted-foreground">All systems operational</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(systemHealth.overall)} variant="secondary">
                    {systemHealth.overall}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Database Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Status</span>
                        <Badge className={getStatusColor(systemHealth.database.status)} variant="secondary">
                          {systemHealth.database.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Size</span>
                        <span className="font-semibold">{systemHealth.database.size} GB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Backup</span>
                        <span className="font-semibold text-green-600">
                          {formatTimestamp(systemHealth.database.lastBackup)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Integrity</span>
                        <Badge className={getStatusColor(systemHealth.database.integrity)} variant="secondary">
                          {systemHealth.database.integrity}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Storage Status</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Storage Usage</span>
                          <span className="text-sm font-semibold">{systemHealth.storage.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${systemHealth.storage.usage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {systemHealth.storage.used} GB / {systemHealth.storage.used + systemHealth.storage.available} GB
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Backup Space</span>
                        <span className="font-semibold">{systemHealth.storage.backupSpace} GB</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Service Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(systemHealth.services).map(([service, status]) => (
                      <div key={service} className="text-center p-3 border rounded">
                        <div className="capitalize font-medium text-sm">{service}</div>
                        <Badge className={getStatusColor(status)} variant="secondary">
                          {status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
              <CardDescription>Automated backup settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Automatic Backups</h4>
                    <p className="text-sm text-muted-foreground">
                      {backupConfig.automatic.frequency} at {backupConfig.automatic.time}
                    </p>
                  </div>
                  <Switch checked={backupConfig.automatic.enabled} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Retention Policy</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Backups</span>
                        <span className="font-semibold">{backupConfig.automatic.retention.dailyBackups} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Weekly Backups</span>
                        <span className="font-semibold">{backupConfig.automatic.retention.weeklyBackups} weeks</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Monthly Backups</span>
                        <span className="font-semibold">{backupConfig.automatic.retention.monthlyBackups} months</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Yearly Backups</span>
                        <span className="font-semibold">{backupConfig.automatic.retention.yearlyBackups} years</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Storage Settings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Primary Storage</span>
                        <span className="font-semibold">{backupConfig.storage.primary}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Secondary Storage</span>
                        <span className="font-semibold">{backupConfig.storage.secondary || 'None'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Encryption</span>
                        <Badge className={getStatusColor(backupConfig.storage.encryption ? 'Enabled' : 'Disabled')} variant="secondary">
                          {backupConfig.storage.encryption ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Compression</span>
                        <Badge className={getStatusColor(backupConfig.storage.compression ? 'Enabled' : 'Disabled')} variant="secondary">
                          {backupConfig.storage.compression ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Backup Components</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(backupConfig.components).map(([component, enabled]) => (
                      <div key={component} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm capitalize">{component.replace(/([A-Z])/g, ' $1')}</span>
                        <Switch checked={enabled} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">⚙️ Configure</Button>
                  <Button variant="outline" size="sm">🧪 Test Backup</Button>
                  <Button variant="outline" size="sm">📅 Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>Recent backup operations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupHistory.map(backup => (
                  <div key={backup.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                          {backup.type === 'Full' && '💾'}
                          {backup.type === 'Incremental' && '📀'}
                          {backup.type === 'Differential' && '💿'}
                          {backup.type === 'Manual' && '👤'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">Backup #{backup.id.split('_')[1]}</h4>
                            <Badge className={getTypeColor(backup.type)} variant="secondary">
                              {backup.type}
                            </Badge>
                            <Badge className={getStatusColor(backup.status)} variant="secondary">
                              {backup.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTimestamp(backup.timestamp)} • Triggered by {backup.triggeredBy}
                          </div>
                        </div>
                      </div>
                      {backup.restorable && (
                        <Button variant="outline" size="sm">
                          🔄 Restore
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs text-muted-foreground">Size</div>
                        <div className="font-semibold">{formatFileSize(backup.size)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="font-semibold">{formatDuration(backup.duration)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Components</div>
                        <div className="font-semibold">{backup.components.length} items</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Checksum</div>
                        <div className="font-mono text-xs">{backup.checksum.substring(0, 16)}...</div>
                      </div>
                    </div>

                    {backup.components.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">Backed Up Components</div>
                        <div className="flex flex-wrap gap-1">
                          {backup.components.map((component, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {backup.notes && (
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-xs text-muted-foreground">Notes</div>
                        <div className="text-sm">{backup.notes}</div>
                      </div>
                    )}

                    {backup.errorMessage && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="text-xs text-muted-foreground">Error</div>
                        <div className="text-sm text-red-700">{backup.errorMessage}</div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">👁️ View Details</Button>
                      <Button variant="outline" size="sm">📊 Verify Integrity</Button>
                      {backup.location && (
                        <Button variant="outline" size="sm">📥 Download</Button>
                      )}
                      {!backup.restorable && backup.status === 'Failed' && (
                        <Button variant="outline" size="sm">🔄 Retry</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Restore Points */}
          <Card>
            <CardHeader>
              <CardTitle>System Restore Points</CardTitle>
              <CardDescription>Verified system states available for restoration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restorePoints.map(point => (
                  <div key={point.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg">
                          📍
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{point.name}</h4>
                            <Badge className={getStatusColor(point.dataIntegrity)} variant="secondary">
                              {point.dataIntegrity}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created: {formatTimestamp(point.timestamp)} • Version: {point.systemVersion}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        🔄 Restore to This Point
                      </Button>
                    </div>

                    <div className="mb-3 p-2 bg-gray-50 rounded">
                      <div className="text-sm">{point.description}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Size</div>
                        <div className="font-semibold">{formatFileSize(point.size)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Components</div>
                        <div className="font-semibold">{point.components.length} items</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Backup References</div>
                        <div className="font-semibold">{point.backupIds.length} backups</div>
                      </div>
                    </div>

                    {point.tags.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Tags</div>
                        <div className="flex flex-wrap gap-1">
                          {point.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">👁️ View Details</Button>
                      <Button variant="outline" size="sm">✅ Verify Integrity</Button>
                      <Button variant="outline" size="sm">📊 Compare Versions</Button>
                      <Button variant="outline" size="sm">🏷️ Add Tags</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recovery Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Disaster Recovery Plans</CardTitle>
              <CardDescription>Documented procedures for system recovery scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recoveryPlans.map(plan => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-lg">
                          🛡️
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{plan.name}</h4>
                            <Badge className={getPriorityColor(plan.priority)} variant="secondary">
                              {plan.priority}
                            </Badge>
                            <Badge className={getStatusColor(plan.testStatus)} variant="secondary">
                              {plan.testStatus}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {plan.type} • Last tested: {plan.lastTested}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        🚀 Execute Plan
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs text-muted-foreground">Recovery Time</div>
                        <div className="font-semibold">{plan.estimatedRTO}h RTO</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Data Loss</div>
                        <div className="font-semibold">{plan.estimatedRPO}h RPO</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Steps</div>
                        <div className="font-semibold">{plan.steps.length} procedures</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Primary Contact</div>
                        <div className="font-semibold text-sm">{plan.contacts.primary.split(' ')[0]}</div>
                      </div>
                    </div>

                    {plan.steps.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">Recovery Steps Preview</div>
                        <div className="space-y-2">
                          {plan.steps.slice(0, 3).map(step => (
                            <div key={step.id} className="flex items-center gap-3 p-2 border rounded">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                                {step.order}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{step.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDuration(step.estimatedTime)} • {step.responsible}
                                </div>
                              </div>
                              {step.automation && (
                                <Badge variant="outline" className="text-xs">
                                  🤖 Automated
                                </Badge>
                              )}
                            </div>
                          ))}
                          {plan.steps.length > 3 && (
                            <div className="text-center text-sm text-muted-foreground">
                              +{plan.steps.length - 3} more steps
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">📋 View Full Plan</Button>
                      <Button variant="outline" size="sm">🧪 Test Procedure</Button>
                      <Button variant="outline" size="sm">✏️ Edit Plan</Button>
                      <Button variant="outline" size="sm">📧 Contact Team</Button>
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
                💾 Start Backup Now
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔄 Quick Restore
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🧪 Test Recovery Plan
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📍 Create Restore Point
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⚙️ Configure Backup
              </Button>
            </CardContent>
          </Card>

          {/* Backup Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Next Backup</span>
                  <span className="font-semibold">Tonight 2:00 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Type</span>
                  <Badge className={getTypeColor('Full')} variant="secondary">Full</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estimated Duration</span>
                  <span className="font-semibold">~20 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estimated Size</span>
                  <span className="font-semibold">~2.5 GB</span>
                </div>
                <hr />
                <div className="text-center">
                  <Button variant="outline" size="sm" className="w-full">
                    📅 Modify Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Backup Storage</span>
                    <span className="text-sm font-semibold">9%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '9%' }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {systemHealth.storage.backupSpace} GB / {backupConfig.storage.maxSize} GB
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Full Backups</span>
                    <span>32.1 GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Incremental</span>
                    <span>8.7 GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Archives</span>
                    <span>4.4 GB</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Target RTO</span>
                  <span className="font-semibold text-green-600">4 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Target RPO</span>
                  <span className="font-semibold text-green-600">1 hour</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Test</span>
                  <span className="font-semibold">Nov 15, 2024</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Test Result</span>
                  <Badge className={getStatusColor('Passed')} variant="secondary">Passed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recovery Plans</span>
                  <span className="font-semibold">{recoveryPlans.length} ready</span>
                </div>
              </div>
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
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Daily Backup Completed</div>
                    <div className="text-xs text-muted-foreground">2.46 GB backup successful</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Restore Point Created</div>
                    <div className="text-xs text-muted-foreground">Pre-tournament configuration</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Recovery Plan Tested</div>
                    <div className="text-xs text-muted-foreground">Database recovery - Passed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm font-semibold text-green-800">✅ All Systems Normal</div>
                  <div className="text-xs text-green-600">Backups running as scheduled</div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm font-semibold text-blue-800">ℹ️ Scheduled Maintenance</div>
                  <div className="text-xs text-blue-600">Storage cleanup in 3 days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}