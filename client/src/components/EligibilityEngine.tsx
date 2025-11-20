import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  FileText,
  User,
  Shield,
  Eye,
  RefreshCw,
  Filter,
  Search,
  AlertCircle,
  Info
} from 'lucide-react';
import { differenceInYears, parseISO, format } from 'date-fns';
import { useToast } from '../hooks/use-toast';

export interface EligibilityRule {
  id: string;
  type: 'AGE' | 'GEOGRAPHY' | 'DOCUMENT' | 'TOURNAMENT_SPECIFIC' | 'CUSTOM';
  name: string;
  description: string;
  isActive: boolean;
  parameters: Record<string, any>;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface EligibilityCheck {
  id: string;
  playerId: string;
  playerName: string;
  tournamentId: string;
  ruleId: string;
  ruleName: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'PENDING';
  message: string;
  checkedAt: string;
  validatedBy?: string;
  evidence?: string[];
  canOverride: boolean;
  overrideReason?: string;
}

export interface PlayerEligibility {
  playerId: string;
  upid: string;
  playerName: string;
  dateOfBirth: string;
  county: string;
  subCounty?: string;
  ward?: string;
  nationality: string;
  tournamentId: string;
  teamName: string;
  checks: EligibilityCheck[];
  overallStatus: 'ELIGIBLE' | 'INELIGIBLE' | 'CONDITIONAL' | 'PENDING';
  lastChecked: string;
}

export interface EligibilityEngineProps {
  tournamentId: string;
  onRevalidate?: (playerId: string) => Promise<void>;
  onOverride?: (checkId: string, reason: string) => Promise<void>;
  onBulkCheck?: (playerIds: string[]) => Promise<void>;
}

const ELIGIBILITY_RULES: EligibilityRule[] = [
  {
    id: 'age-minimum',
    type: 'AGE',
    name: 'Minimum Age Requirement',
    description: 'Player must be at least the minimum age for the tournament category',
    isActive: true,
    parameters: { minAge: 16 },
    severity: 'ERROR'
  },
  {
    id: 'age-maximum',
    type: 'AGE', 
    name: 'Maximum Age Requirement',
    description: 'Player must not exceed the maximum age for the tournament category',
    isActive: true,
    parameters: { maxAge: 35 },
    severity: 'ERROR'
  },
  {
    id: 'geographic-boundary',
    type: 'GEOGRAPHY',
    name: 'Geographic Boundary',
    description: 'Player must be from the correct administrative area',
    isActive: true,
    parameters: { allowedCounties: ['Nairobi', 'Kiambu', 'Machakos'] },
    severity: 'ERROR'
  },
  {
    id: 'identity-document',
    type: 'DOCUMENT',
    name: 'Identity Document Verification',
    description: 'Valid national ID or passport required',
    isActive: true,
    parameters: { requiredDocuments: ['national_id', 'passport'] },
    severity: 'ERROR'
  },
  {
    id: 'medical-clearance',
    type: 'DOCUMENT',
    name: 'Medical Clearance',
    description: 'Valid medical certificate required',
    isActive: true,
    parameters: { validityPeriod: 365 },
    severity: 'WARNING'
  },
  {
    id: 'registration-timing',
    type: 'TOURNAMENT_SPECIFIC',
    name: 'Registration Deadline',
    description: 'Registration must be within the allowed period',
    isActive: true,
    parameters: { 
      registrationStart: '2024-10-01',
      registrationEnd: '2024-11-30'
    },
    severity: 'ERROR'
  }
];

export default function EligibilityEngine({
  tournamentId,
  onRevalidate,
  onOverride,
  onBulkCheck
}: EligibilityEngineProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerEligibility | null>(null);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<EligibilityCheck | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ruleFilter, setRuleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for development
  const mockPlayerEligibilities: PlayerEligibility[] = [
    {
      playerId: '1',
      upid: 'UP001234',
      playerName: 'John Kamau Mwangi',
      dateOfBirth: '1995-06-15',
      county: 'Nairobi',
      subCounty: 'Westlands',
      ward: 'Parklands',
      nationality: 'Kenyan',
      tournamentId: '1',
      teamName: 'Nairobi United FC',
      checks: [
        {
          id: '1-1',
          playerId: '1',
          playerName: 'John Kamau Mwangi',
          tournamentId: '1',
          ruleId: 'age-minimum',
          ruleName: 'Minimum Age Requirement',
          status: 'PASS',
          message: 'Player meets minimum age requirement (29 years)',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'system',
          canOverride: false
        },
        {
          id: '1-2',
          playerId: '1',
          playerName: 'John Kamau Mwangi',
          tournamentId: '1',
          ruleId: 'geographic-boundary',
          ruleName: 'Geographic Boundary',
          status: 'PASS',
          message: 'Player is from eligible county: Nairobi',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'system',
          canOverride: false
        },
        {
          id: '1-3',
          playerId: '1',
          playerName: 'John Kamau Mwangi',
          tournamentId: '1',
          ruleId: 'identity-document',
          ruleName: 'Identity Document Verification',
          status: 'PASS',
          message: 'National ID verified successfully',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'registrar_001',
          evidence: ['national_id_12345678.pdf'],
          canOverride: false
        },
        {
          id: '1-4',
          playerId: '1',
          playerName: 'John Kamau Mwangi',
          tournamentId: '1',
          ruleId: 'medical-clearance',
          ruleName: 'Medical Clearance',
          status: 'WARNING',
          message: 'Medical certificate expires in 30 days',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'system',
          evidence: ['medical_cert_john_k.pdf'],
          canOverride: true
        }
      ],
      overallStatus: 'ELIGIBLE',
      lastChecked: '2024-10-29T10:30:00Z'
    },
    {
      playerId: '2',
      upid: 'UP001235',
      playerName: 'Mary Wanjiku Njeri',
      dateOfBirth: '2010-03-22',
      county: 'Kiambu',
      subCounty: 'Kiambu',
      ward: 'Township',
      nationality: 'Kenyan',
      tournamentId: '1',
      teamName: 'Kiambu Queens FC',
      checks: [
        {
          id: '2-1',
          playerId: '2',
          playerName: 'Mary Wanjiku Njeri',
          tournamentId: '1',
          ruleId: 'age-minimum',
          ruleName: 'Minimum Age Requirement',
          status: 'FAIL',
          message: 'Player is too young (14 years, minimum 16 required)',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'system',
          canOverride: true
        },
        {
          id: '2-2',
          playerId: '2',
          playerName: 'Mary Wanjiku Njeri',
          tournamentId: '1',
          ruleId: 'geographic-boundary',
          ruleName: 'Geographic Boundary',
          status: 'PASS',
          message: 'Player is from eligible county: Kiambu',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'system',
          canOverride: false
        },
        {
          id: '2-3',
          playerId: '2',
          playerName: 'Mary Wanjiku Njeri',
          tournamentId: '1',
          ruleId: 'identity-document',
          ruleName: 'Identity Document Verification',
          status: 'PENDING',
          message: 'Identity document pending verification',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'system',
          canOverride: false
        }
      ],
      overallStatus: 'INELIGIBLE',
      lastChecked: '2024-10-29T10:30:00Z'
    },
    {
      playerId: '3',
      upid: 'UP001236',
      playerName: 'Peter Ochieng Otieno',
      dateOfBirth: '1988-11-08',
      county: 'Kisumu',
      subCounty: 'Kisumu East',
      ward: 'Central',
      nationality: 'Kenyan',
      tournamentId: '1',
      teamName: 'Kisumu Lakeside FC',
      checks: [
        {
          id: '3-1',
          playerId: '3',
          playerName: 'Peter Ochieng Otieno',
          tournamentId: '1',
          ruleId: 'age-minimum',
          ruleName: 'Minimum Age Requirement',
          status: 'PASS',
          message: 'Player meets minimum age requirement (36 years)',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'system',
          canOverride: false
        },
        {
          id: '3-2',
          playerId: '3',
          playerName: 'Peter Ochieng Otieno',
          tournamentId: '1',
          ruleId: 'age-maximum',
          ruleName: 'Maximum Age Requirement',
          status: 'FAIL',
          message: 'Player exceeds maximum age (36 years, maximum 35 allowed)',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'system',
          canOverride: true
        },
        {
          id: '3-3',
          playerId: '3',
          playerName: 'Peter Ochieng Otieno',
          tournamentId: '1',
          ruleId: 'geographic-boundary',
          ruleName: 'Geographic Boundary',
          status: 'FAIL',
          message: 'Player is from ineligible county: Kisumu (allowed: Nairobi, Kiambu, Machakos)',
          checkedAt: '2024-10-29T10:30:00Z',
          validatedBy: 'system',
          canOverride: true
        }
      ],
      overallStatus: 'INELIGIBLE',
      lastChecked: '2024-10-29T10:30:00Z'
    }
  ];

  const playerEligibilities = mockPlayerEligibilities;

  // Filter players based on search and filters
  const filteredPlayers = useMemo(() => {
    return playerEligibilities.filter(player => {
      const matchesSearch = !searchTerm || 
        player.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.upid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.teamName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || player.overallStatus === statusFilter;
      
      const matchesRule = ruleFilter === 'all' || 
        player.checks.some(check => check.ruleId === ruleFilter);
      
      return matchesSearch && matchesStatus && matchesRule;
    });
  }, [playerEligibilities, searchTerm, statusFilter, ruleFilter]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    return differenceInYears(new Date(), parseISO(dateOfBirth));
  };

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'ELIGIBLE':
        return 'bg-green-100 text-green-800';
      case 'FAIL':
      case 'INELIGIBLE':
        return 'bg-red-100 text-red-800';
      case 'WARNING':
      case 'CONDITIONAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'ELIGIBLE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'FAIL':
      case 'INELIGIBLE':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'WARNING':
      case 'CONDITIONAL':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Handle revalidation
  const handleRevalidate = async (playerId: string) => {
    try {
      setLoading(true);
      await onRevalidate?.(playerId);
      toast({
        title: "Revalidation Complete",
        description: "Player eligibility has been rechecked successfully.",
      });
    } catch (error) {
      toast({
        title: "Revalidation Failed",
        description: "Failed to revalidate player eligibility.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle override
  const handleOverride = async () => {
    if (!selectedCheck || !overrideReason.trim()) {
      toast({
        title: "Override Failed",
        description: "Please provide a reason for the override.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await onOverride?.(selectedCheck.id, overrideReason);
      toast({
        title: "Override Applied",
        description: "Eligibility check has been overridden successfully.",
      });
      setShowOverrideDialog(false);
      setSelectedCheck(null);
      setOverrideReason('');
    } catch (error) {
      toast({
        title: "Override Failed",
        description: "Failed to apply eligibility override.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Eligibility Engine</h2>
          <p className="text-gray-600">Automated eligibility validation for tournament participants</p>
        </div>
        
        <Button
          onClick={() => onBulkCheck?.(filteredPlayers.map(p => p.playerId))}
          disabled={loading || filteredPlayers.length === 0}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Bulk Recheck
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Players</p>
                <p className="text-2xl font-bold">{playerEligibilities.length}</p>
              </div>
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eligible</p>
                <p className="text-2xl font-bold text-green-600">
                  {playerEligibilities.filter(p => p.overallStatus === 'ELIGIBLE').length}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ineligible</p>
                <p className="text-2xl font-bold text-red-600">
                  {playerEligibilities.filter(p => p.overallStatus === 'INELIGIBLE').length}
                </p>
              </div>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {playerEligibilities.filter(p => p.overallStatus === 'PENDING').length}
                </p>
              </div>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search players by name, UPID, or team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ELIGIBLE">Eligible</SelectItem>
                <SelectItem value="INELIGIBLE">Ineligible</SelectItem>
                <SelectItem value="CONDITIONAL">Conditional</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ruleFilter} onValueChange={setRuleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Rule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rules</SelectItem>
                {ELIGIBILITY_RULES.map(rule => (
                  <SelectItem key={rule.id} value={rule.id}>
                    {rule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPlayers.length} of {playerEligibilities.length} players
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.playerId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{player.playerName}</div>
                        <div className="text-sm text-gray-600">{player.upid}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {calculateAge(player.dateOfBirth)} years
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {player.county}
                        </div>
                        {player.subCounty && (
                          <div className="text-sm text-gray-500">
                            {player.subCounty}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">{player.teamName}</div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(player.overallStatus)}
                        <Badge className={getStatusColor(player.overallStatus)}>
                          {player.overallStatus}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {player.checks
                          .filter(check => check.status === 'FAIL' || check.status === 'WARNING')
                          .slice(0, 2)
                          .map((check, index) => (
                            <div key={index} className="text-xs">
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(check.status)}
                              >
                                {check.ruleName}
                              </Badge>
                            </div>
                          ))
                        }
                        {player.checks.filter(c => c.status === 'FAIL' || c.status === 'WARNING').length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{player.checks.filter(c => c.status === 'FAIL' || c.status === 'WARNING').length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {format(parseISO(player.lastChecked), 'MMM dd, HH:mm')}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPlayer(player)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevalidate(player.playerId)}
                          disabled={loading}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No players found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Details Dialog */}
      <Dialog 
        open={selectedPlayer !== null} 
        onOpenChange={() => setSelectedPlayer(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Eligibility Details: {selectedPlayer?.playerName}
            </DialogTitle>
            <DialogDescription>
              Complete eligibility assessment for {selectedPlayer?.upid}
            </DialogDescription>
          </DialogHeader>

          {selectedPlayer && (
            <div className="space-y-6">
              {/* Player Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Player Information</h4>
                  <div className="space-y-1 mt-2">
                    <div><span className="font-medium">Name:</span> {selectedPlayer.playerName}</div>
                    <div><span className="font-medium">UPID:</span> {selectedPlayer.upid}</div>
                    <div><span className="font-medium">Age:</span> {calculateAge(selectedPlayer.dateOfBirth)} years</div>
                    <div><span className="font-medium">Team:</span> {selectedPlayer.teamName}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Location</h4>
                  <div className="space-y-1 mt-2">
                    <div><span className="font-medium">County:</span> {selectedPlayer.county}</div>
                    {selectedPlayer.subCounty && (
                      <div><span className="font-medium">Sub County:</span> {selectedPlayer.subCounty}</div>
                    )}
                    {selectedPlayer.ward && (
                      <div><span className="font-medium">Ward:</span> {selectedPlayer.ward}</div>
                    )}
                    <div><span className="font-medium">Nationality:</span> {selectedPlayer.nationality}</div>
                  </div>
                </div>
              </div>

              {/* Eligibility Checks */}
              <div>
                <h4 className="font-medium mb-4">Eligibility Checks</h4>
                <div className="space-y-3">
                  {selectedPlayer.checks.map((check) => (
                    <Card key={check.id} className="border-l-4" style={{
                      borderLeftColor: check.status === 'PASS' ? '#10b981' : 
                                     check.status === 'FAIL' ? '#ef4444' :
                                     check.status === 'WARNING' ? '#f59e0b' : '#6b7280'
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(check.status)}
                              <h5 className="font-medium">{check.ruleName}</h5>
                              <Badge className={getStatusColor(check.status)}>
                                {check.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{check.message}</p>
                            {check.evidence && check.evidence.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FileText className="w-3 h-3" />
                                Evidence: {check.evidence.join(', ')}
                              </div>
                            )}
                            {check.validatedBy && (
                              <div className="text-xs text-gray-500 mt-1">
                                Validated by: {check.validatedBy} • {format(parseISO(check.checkedAt), 'MMM dd, yyyy HH:mm')}
                              </div>
                            )}
                          </div>
                          
                          {check.canOverride && check.status !== 'PASS' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCheck(check);
                                setShowOverrideDialog(true);
                              }}
                            >
                              Override
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
              Close
            </Button>
            {selectedPlayer && (
              <Button onClick={() => handleRevalidate(selectedPlayer.playerId)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Revalidate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Eligibility Check</DialogTitle>
            <DialogDescription>
              You are about to override the eligibility check: {selectedCheck?.ruleName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedCheck && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Current Status:</strong> {selectedCheck.status} - {selectedCheck.message}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <div className="text-sm font-medium mb-2">Override Reason (Required)</div>
              <Textarea
                placeholder="Provide a detailed reason for overriding this eligibility check..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOverride}
              disabled={!overrideReason.trim() || loading}
            >
              Apply Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}