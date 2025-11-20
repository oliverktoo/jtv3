import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
  Users, 
  Hash, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Edit,
  Shuffle,
  Download,
  Upload,
  Save,
  Undo2,
  Search,
  Filter,
  Settings,
  UserCheck
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import * as XLSX from 'xlsx';

export interface SquadPlayer {
  id: string;
  upid: string;
  firstName: string;
  lastName: string;
  position: string;
  jerseyNumber?: number;
  isAssigned: boolean;
  preferredNumbers: number[];
  conflicts: string[];
  registrationStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  teamId: string;
  joinedAt: string;
}

export interface SquadTeam {
  id: string;
  name: string;
  division: string;
  totalPlayers: number;
  assignedNumbers: number;
  availableNumbers: number[];
  conflictCount: number;
}

export interface SquadNumberManagementProps {
  tournamentId: string;
  onNumberAssigned?: (playerId: string, jerseyNumber: number) => Promise<void>;
  onBulkAssignment?: (assignments: Record<string, number>) => Promise<void>;
  onNumberRemoved?: (playerId: string) => Promise<void>;
}

const JERSEY_NUMBER_RANGE = { min: 1, max: 99 };
const RESERVED_NUMBERS = [1]; // Goalkeeper traditionally wears #1

export default function SquadNumberManagement({
  tournamentId,
  onNumberAssigned,
  onBulkAssignment,
  onNumberRemoved
}: SquadNumberManagementProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<SquadPlayer | null>(null);
  const [customNumber, setCustomNumber] = useState<string>('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAssignments, setBulkAssignments] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for development
  const mockTeams: SquadTeam[] = [
    {
      id: '1',
      name: 'Nairobi United FC',
      division: 'Premier Division',
      totalPlayers: 25,
      assignedNumbers: 18,
      availableNumbers: [2, 3, 5, 8, 12, 15, 19],
      conflictCount: 2
    },
    {
      id: '2',
      name: 'Kiambu Queens FC',
      division: 'Women\'s Premier',
      totalPlayers: 22,
      assignedNumbers: 20,
      availableNumbers: [13, 16],
      conflictCount: 0
    },
    {
      id: '3',
      name: 'Kisumu Lakeside FC',
      division: 'Premier Division',
      totalPlayers: 28,
      assignedNumbers: 15,
      availableNumbers: Array.from({ length: 13 }, (_, i) => i + 16),
      conflictCount: 5
    }
  ];

  const mockPlayers: SquadPlayer[] = [
    {
      id: '1',
      upid: 'UP001234',
      firstName: 'John',
      lastName: 'Kamau',
      position: 'Goalkeeper',
      jerseyNumber: 1,
      isAssigned: true,
      preferredNumbers: [1, 12],
      conflicts: [],
      registrationStatus: 'APPROVED',
      teamId: '1',
      joinedAt: '2024-10-15T10:30:00Z'
    },
    {
      id: '2',
      upid: 'UP001235',
      firstName: 'Grace',
      lastName: 'Wanjiku',
      position: 'Midfielder',
      jerseyNumber: 10,
      isAssigned: true,
      preferredNumbers: [10, 7, 8],
      conflicts: [],
      registrationStatus: 'APPROVED',
      teamId: '1',
      joinedAt: '2024-10-16T14:15:00Z'
    },
    {
      id: '3',
      upid: 'UP001236',
      firstName: 'David',
      lastName: 'Ochieng',
      position: 'Forward',
      jerseyNumber: undefined,
      isAssigned: false,
      preferredNumbers: [9, 11, 21],
      conflicts: ['Number 9 already taken by Peter Mwangi'],
      registrationStatus: 'APPROVED',
      teamId: '1',
      joinedAt: '2024-10-17T16:45:00Z'
    },
    {
      id: '4',
      upid: 'UP001237',
      firstName: 'Mary',
      lastName: 'Akinyi',
      position: 'Defender',
      jerseyNumber: undefined,
      isAssigned: false,
      preferredNumbers: [5, 6],
      conflicts: ['Number 5 requested by multiple players'],
      registrationStatus: 'APPROVED',
      teamId: '1',
      joinedAt: '2024-10-18T09:20:00Z'
    },
    {
      id: '5',
      upid: 'UP001238',
      firstName: 'Samuel',
      lastName: 'Mwangi',
      position: 'Midfielder',
      jerseyNumber: 8,
      isAssigned: true,
      preferredNumbers: [8, 14],
      conflicts: [],
      registrationStatus: 'APPROVED',
      teamId: '1',
      joinedAt: '2024-10-19T11:00:00Z'
    }
  ];

  const teams = mockTeams;
  const allPlayers = mockPlayers;

  // Filter players by selected team and search term
  const filteredPlayers = useMemo(() => {
    let players = selectedTeam 
      ? allPlayers.filter(p => p.teamId === selectedTeam)
      : allPlayers;

    if (searchTerm) {
      players = players.filter(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.upid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return players;
  }, [allPlayers, selectedTeam, searchTerm]);

  const selectedTeamData = teams.find(t => t.id === selectedTeam);

  // Get available numbers for a team
  const getAvailableNumbers = (teamId: string): number[] => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];

    const assignedNumbers = allPlayers
      .filter(p => p.teamId === teamId && p.jerseyNumber)
      .map(p => p.jerseyNumber!);

    const availableNumbers = [];
    for (let i = JERSEY_NUMBER_RANGE.min; i <= JERSEY_NUMBER_RANGE.max; i++) {
      if (!assignedNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }

    return availableNumbers;
  };

  // Assign jersey number to player
  const handleAssignNumber = async (playerId: string, jerseyNumber: number) => {
    try {
      setLoading(true);
      
      // Validate number is available
      const player = allPlayers.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');

      const availableNumbers = getAvailableNumbers(player.teamId);
      if (!availableNumbers.includes(jerseyNumber)) {
        throw new Error(`Jersey number ${jerseyNumber} is not available`);
      }

      await onNumberAssigned?.(playerId, jerseyNumber);
      
      toast({
        title: "Jersey Number Assigned",
        description: `Successfully assigned #${jerseyNumber} to ${player.firstName} ${player.lastName}`,
      });

      setShowAssignDialog(false);
      setSelectedPlayer(null);
      setCustomNumber('');
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "Failed to assign jersey number",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-assign numbers to unassigned players
  const handleAutoAssign = async () => {
    if (!selectedTeam) {
      toast({
        title: "No Team Selected",
        description: "Please select a team first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const unassignedPlayers = filteredPlayers.filter(p => !p.isAssigned);
      const availableNumbers = getAvailableNumbers(selectedTeam);
      const assignments: Record<string, number> = {};

      if (availableNumbers.length < unassignedPlayers.length) {
        throw new Error('Not enough jersey numbers available for all players');
      }

      // Prioritize preferred numbers first
      const usedNumbers = new Set<number>();
      
      // First pass: assign preferred numbers if available
      unassignedPlayers.forEach(player => {
        for (const preferred of player.preferredNumbers) {
          if (availableNumbers.includes(preferred) && !usedNumbers.has(preferred)) {
            assignments[player.id] = preferred;
            usedNumbers.add(preferred);
            break;
          }
        }
      });

      // Second pass: assign remaining players to available numbers
      const remainingPlayers = unassignedPlayers.filter(p => !assignments[p.id]);
      const remainingNumbers = availableNumbers.filter(n => !usedNumbers.has(n));

      remainingPlayers.forEach((player, index) => {
        if (remainingNumbers[index]) {
          assignments[player.id] = remainingNumbers[index];
        }
      });

      await onBulkAssignment?.(assignments);
      
      toast({
        title: "Auto-Assignment Complete",
        description: `Successfully assigned jersey numbers to ${Object.keys(assignments).length} players`,
      });

    } catch (error) {
      toast({
        title: "Auto-Assignment Failed",
        description: error instanceof Error ? error.message : "Failed to auto-assign numbers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove jersey number from player
  const handleRemoveNumber = async (playerId: string) => {
    try {
      setLoading(true);
      
      const player = allPlayers.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');

      await onNumberRemoved?.(playerId);
      
      toast({
        title: "Jersey Number Removed",
        description: `Successfully removed jersey number from ${player.firstName} ${player.lastName}`,
      });

    } catch (error) {
      toast({
        title: "Removal Failed",
        description: error instanceof Error ? error.message : "Failed to remove jersey number",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Export squad numbers
  const handleExport = () => {
    const exportData = filteredPlayers.map(player => ({
      'Player ID': player.upid,
      'Player Name': `${player.firstName} ${player.lastName}`,
      'Position': player.position,
      'Jersey Number': player.jerseyNumber || 'Unassigned',
      'Status': player.isAssigned ? 'Assigned' : 'Unassigned',
      'Preferred Numbers': player.preferredNumbers.join(', '),
      'Conflicts': player.conflicts.join('; ') || 'None',
      'Registration Status': player.registrationStatus,
      'Team': selectedTeamData?.name || 'All Teams'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Squad Numbers');

    // Auto-size columns
    const maxWidth = exportData.reduce((acc, row) => {
      Object.entries(row).forEach(([key, value]) => {
        const len = value.toString().length;
        acc[key] = Math.max(acc[key] || 0, len);
      });
      return acc;
    }, {} as Record<string, number>);

    ws['!cols'] = Object.values(maxWidth).map(w => ({ wch: Math.min(w + 2, 50) }));

    const filename = `Squad_Numbers_${selectedTeamData?.name || 'All_Teams'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    toast({
      title: "Export Successful",
      description: `Squad numbers exported to ${filename}`
    });
  };

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'goalkeeper': return 'bg-green-100 text-green-800';
      case 'defender': return 'bg-blue-100 text-blue-800';
      case 'midfielder': return 'bg-yellow-100 text-yellow-800';
      case 'forward': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Team Selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Squad Number Management</h2>
          <p className="text-gray-600">Manage jersey number assignments for tournament teams</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAutoAssign} disabled={!selectedTeam || loading}>
            <Shuffle className="w-4 h-4 mr-2" />
            Auto-Assign
          </Button>
        </div>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card 
            key={team.id} 
            className={`cursor-pointer transition-all ${
              selectedTeam === team.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedTeam(team.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold truncate">{team.name}</h3>
                {team.conflictCount > 0 && (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{team.division}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Players:</span>
                  <span className="font-medium">{team.totalPlayers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Assigned Numbers:</span>
                  <span className="font-medium text-green-600">{team.assignedNumbers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available:</span>
                  <span className="font-medium">{team.availableNumbers.length}</span>
                </div>
                {team.conflictCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Conflicts:</span>
                    <span className="font-medium text-yellow-600">{team.conflictCount}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search players by name, UPID, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPlayers.length} players
            {selectedTeamData && (
              <span className=" ml-2">
                • {selectedTeamData.assignedNumbers}/{selectedTeamData.totalPlayers} numbers assigned
                • {selectedTeamData.availableNumbers.length} available
              </span>
            )}
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
                  <TableHead>Position</TableHead>
                  <TableHead>Jersey Number</TableHead>
                  <TableHead>Preferred Numbers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conflicts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{player.firstName} {player.lastName}</div>
                        <div className="text-sm text-gray-600">{player.upid}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getPositionColor(player.position)}>
                        {player.position}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {player.jerseyNumber ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-800">
                            {player.jerseyNumber}
                          </div>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Hash className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-gray-500">Unassigned</span>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        {player.preferredNumbers.map(num => (
                          <Badge key={num} variant="outline" className="text-xs">
                            {num}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        className={
                          player.isAssigned 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {player.isAssigned ? 'Assigned' : 'Pending'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {player.conflicts.length > 0 ? (
                        <div className="space-y-1">
                          {player.conflicts.map((conflict, index) => (
                            <div key={index} className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                              {conflict}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        {player.isAssigned ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPlayer(player);
                                setCustomNumber(player.jerseyNumber?.toString() || '');
                                setShowAssignDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveNumber(player.id)}
                              disabled={loading}
                            >
                              <Undo2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(player);
                              setCustomNumber('');
                              setShowAssignDialog(true);
                            }}
                          >
                            <Hash className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No players found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedTeam 
                  ? 'No players match your search criteria for the selected team.'
                  : 'Select a team to view players and manage jersey numbers.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Number Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPlayer?.isAssigned ? 'Change Jersey Number' : 'Assign Jersey Number'}
            </DialogTitle>
            <DialogDescription>
              {selectedPlayer && (
                <>
                  Assigning jersey number for {selectedPlayer.firstName} {selectedPlayer.lastName}
                  {selectedPlayer.preferredNumbers.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium">Preferred numbers: </span>
                      {selectedPlayer.preferredNumbers.join(', ')}
                    </div>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Jersey Number</div>
              <Input
                id="jerseyNumber"
                type="number"
                min={JERSEY_NUMBER_RANGE.min}
                max={JERSEY_NUMBER_RANGE.max}
                value={customNumber}
                onChange={(e) => setCustomNumber(e.target.value)}
                placeholder="Enter jersey number (1-99)"
              />
            </div>

            {selectedPlayer && selectedTeam && (
              <div>
                <div className="text-sm font-medium mb-2">Available Numbers</div>
                <div className="mt-2 grid grid-cols-10 gap-1">
                  {getAvailableNumbers(selectedTeam).slice(0, 30).map(num => (
                    <Button
                      key={num}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCustomNumber(num.toString())}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                {getAvailableNumbers(selectedTeam).length > 30 && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{getAvailableNumbers(selectedTeam).length - 30} more available
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const number = parseInt(customNumber);
                if (selectedPlayer && number >= JERSEY_NUMBER_RANGE.min && number <= JERSEY_NUMBER_RANGE.max) {
                  handleAssignNumber(selectedPlayer.id, number);
                }
              }}
              disabled={
                !customNumber || 
                parseInt(customNumber) < JERSEY_NUMBER_RANGE.min || 
                parseInt(customNumber) > JERSEY_NUMBER_RANGE.max ||
                loading
              }
            >
              <Save className="w-4 h-4 mr-2" />
              {selectedPlayer?.isAssigned ? 'Update' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}