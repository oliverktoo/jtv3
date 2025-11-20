import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
  Download, 
  FileText, 
  Calendar,
  Clock,
  Users,
  Trophy,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { DataExporter, ExportFormat, ScheduledExportManager, ScheduledExportConfig } from '../../lib/dataExport';
import { useToast } from '../../hooks/use-toast';
import { usePermission, PermissionGuard } from '../rbac/PermissionGuards';
import { Permission } from '../../lib/rbac';

interface DataExportCenterProps {
  organizationId: string;
  organizationName: string;
}

export default function DataExportCenter({ organizationId, organizationName }: DataExportCenterProps) {
  const { toast } = useToast();
  const { hasPermission } = usePermission();
  
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<'registrations' | 'teams' | 'players' | ''>('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.EXCEL);
  const [isExporting, setIsExporting] = useState(false);

  // Scheduled export form state
  const [scheduledExportForm, setScheduledExportForm] = useState({
    name: '',
    type: 'registrations' as const,
    format: ExportFormat.EXCEL,
    frequency: 'weekly' as const,
    recipients: [''],
    isActive: true
  });

  // Mock scheduled exports data
  const scheduledExports: ScheduledExportConfig[] = [
    {
      id: '1',
      name: 'Weekly Registration Report',
      type: 'registrations',
      format: ExportFormat.EXCEL,
      frequency: 'weekly',
      recipients: ['admin@jamiitourney.com', 'manager@jamiitourney.com'],
      isActive: true,
      createdAt: new Date('2025-10-01'),
      lastRun: new Date('2025-11-01')
    },
    {
      id: '2',
      name: 'Monthly Team Statistics',
      type: 'teams',
      format: ExportFormat.CSV,
      frequency: 'monthly',
      recipients: ['stats@jamiitourney.com'],
      isActive: false,
      createdAt: new Date('2025-09-15'),
      lastRun: new Date('2025-10-15')
    }
  ];

  const exportTypes = [
    {
      id: 'registrations',
      name: 'Team Registrations',
      description: 'Export team registration data with approval status',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 'teams',
      name: 'Team Statistics',
      description: 'Export team performance and statistics data',
      icon: Trophy,
      color: 'text-green-600'
    },
    {
      id: 'players',
      name: 'Player Registry',
      description: 'Export player registration and profile data',
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ];

  const handleQuickExport = async (type: string) => {
    setIsExporting(true);
    try {
      // Mock data - in real implementation, fetch from API based on type
      let mockData;
      let exportResult;

      switch (type) {
        case 'registrations':
          mockData = {
            tournament: {
              id: 'tournament-1',
              name: 'Sample Tournament',
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
              model: 'LEAGUE',
              status: 'ACTIVE',
              organization: { name: organizationName }
            },
            registrations: [
              {
                id: '1',
                team: {
                  name: 'Team Alpha',
                  code: 'TMA',
                  county_id: 'nairobi',
                  contact_email: 'alpha@example.com',
                  contact_phone: '+254700000001'
                },
                registration_status: 'APPROVED',
                registration_date: new Date().toISOString(),
                approval_date: new Date().toISOString(),
                squad_size: 22,
                jersey_colors: 'Red/White',
                coach_name: 'John Doe'
              }
            ]
          };
          exportResult = await DataExporter.exportRegistrations(mockData, exportFormat);
          break;

        case 'teams':
          mockData = [
            {
              id: '1',
              name: 'Team Alpha',
              code: 'TMA',
              county_id: 'nairobi',
              contact_email: 'alpha@example.com',
              organization: { name: organizationName },
              tournaments: 3,
              matches_played: 15,
              wins: 10,
              draws: 3,
              losses: 2,
              goals_for: 25,
              goals_against: 12
            }
          ];
          exportResult = await DataExporter.exportTeamStatistics(mockData, exportFormat);
          break;

        case 'players':
          mockData = [
            {
              id: '1',
              upid: 'UP001',
              first_name: 'John',
              last_name: 'Player',
              date_of_birth: '1995-01-01',
              gender: 'MALE',
              county_id: 'nairobi',
              registration_status: 'APPROVED',
              team: { name: 'Team Alpha' },
              organization: { name: organizationName },
              created_at: new Date().toISOString()
            }
          ];
          exportResult = await DataExporter.exportPlayerRegistry(mockData, exportFormat);
          break;

        default:
          throw new Error('Unknown export type');
      }

      DataExporter.downloadFile(exportResult.blob, exportResult.filename);

      toast({
        title: "Export Successful ✅",
        description: `${type} data exported as ${exportResult.filename}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed ❌",
        description: `Failed to export ${type} data. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleScheduleExport = () => {
    // Validate form
    if (!scheduledExportForm.name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please provide a name for the scheduled export",
        variant: "destructive"
      });
      return;
    }

    // In real implementation, this would save to backend
    const newConfig = {
      ...scheduledExportForm,
      recipients: scheduledExportForm.recipients.filter(email => email.trim())
    };

    console.log('Creating scheduled export:', newConfig);

    toast({
      title: "Scheduled Export Created ✅",
      description: `"${scheduledExportForm.name}" has been scheduled to run ${scheduledExportForm.frequency}`,
    });

    setShowScheduleDialog(false);
    setScheduledExportForm({
      name: '',
      type: 'registrations',
      format: ExportFormat.EXCEL,
      frequency: 'weekly',
      recipients: [''],
      isActive: true
    });
  };

  const toggleScheduledExport = (id: string, isActive: boolean) => {
    console.log(`${isActive ? 'Activating' : 'Deactivating'} scheduled export:`, id);
    toast({
      title: `Export ${isActive ? 'Activated' : 'Deactivated'}`,
      description: `Scheduled export has been ${isActive ? 'activated' : 'deactivated'}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Export Center - {organizationName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionGuard 
            permission={Permission.REPORT_EXPORT}
            context={{ organizationId }}
            fallback={
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to export data.
                </AlertDescription>
              </Alert>
            }
          >
            {/* Quick Export Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Export</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card key={type.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gray-100 ${type.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {type.description}
                          </p>
                          <div className="flex gap-2">
                            <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ExportFormat.EXCEL}>Excel</SelectItem>
                                <SelectItem value={ExportFormat.CSV}>CSV</SelectItem>
                                <SelectItem value={ExportFormat.JSON}>JSON</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              onClick={() => handleQuickExport(type.id)}
                              disabled={isExporting}
                            >
                              {isExporting ? <Clock className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Scheduled Exports Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Scheduled Exports</h3>
                  <Button onClick={() => setShowScheduleDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Export
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledExports.map((exportConfig) => (
                      <TableRow key={exportConfig.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{exportConfig.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {exportConfig.recipients.length} recipient(s)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {exportConfig.type} ({exportConfig.format.toUpperCase()})
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {exportConfig.frequency}
                        </TableCell>
                        <TableCell>
                          {exportConfig.lastRun ? (
                            <div className="text-sm">
                              {new Date(exportConfig.lastRun).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={exportConfig.isActive ? "default" : "secondary"}>
                            {exportConfig.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleScheduledExport(exportConfig.id, !exportConfig.isActive)}
                            >
                              {exportConfig.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </PermissionGuard>
        </CardContent>
      </Card>

      {/* Schedule Export Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Automatic Export</DialogTitle>
            <DialogDescription>
              Create a scheduled export that runs automatically at specified intervals
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Export Name</label>
              <Input
                placeholder="e.g., Weekly Registration Report"
                value={scheduledExportForm.name}
                onChange={(e) => setScheduledExportForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Data Type</label>
                <Select 
                  value={scheduledExportForm.type} 
                  onValueChange={(value) => setScheduledExportForm(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registrations">Team Registrations</SelectItem>
                    <SelectItem value="teams">Team Statistics</SelectItem>
                    <SelectItem value="players">Player Registry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Format</label>
                <Select 
                  value={scheduledExportForm.format} 
                  onValueChange={(value) => setScheduledExportForm(prev => ({ ...prev, format: value as ExportFormat }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ExportFormat.EXCEL}>Excel (.xlsx)</SelectItem>
                    <SelectItem value={ExportFormat.CSV}>CSV (.csv)</SelectItem>
                    <SelectItem value={ExportFormat.JSON}>JSON (.json)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <Select 
                value={scheduledExportForm.frequency} 
                onValueChange={(value) => setScheduledExportForm(prev => ({ ...prev, frequency: value as any }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Email Recipients</label>
              {scheduledExportForm.recipients.map((email, index) => (
                <Input
                  key={index}
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => {
                    const newRecipients = [...scheduledExportForm.recipients];
                    newRecipients[index] = e.target.value;
                    setScheduledExportForm(prev => ({ ...prev, recipients: newRecipients }));
                  }}
                  className="mt-1"
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScheduledExportForm(prev => ({ 
                  ...prev, 
                  recipients: [...prev.recipients, ''] 
                }))}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Recipient
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleExport}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}