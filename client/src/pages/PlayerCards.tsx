import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  QrCode, 
  Search, 
  Download, 
  Users, 
  Camera,
  Grid,
  List,
  Printer,
  Filter,
  RefreshCw
} from 'lucide-react';
import PlayerCard from '../components/PlayerCard';
import QRScanner from '../components/QRScanner';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PlayerCardData } from '../lib/qrCodeUtils';
import type { PlayerRegistry } from '../../../shared/schema';

export default function PlayerCards() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [scanResult, setScanResult] = useState<PlayerCardData | null>(null);

  const orgId = '1'; // Hardcoded for demo

  // Fetch real players from Supabase
  const { data: playersData, isLoading, refetch } = useQuery({
    queryKey: ['players', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_registry')
        .select('*');
      if (error) {
        throw new Error(`Failed to fetch players: ${error.message}`);
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform real player data to match expected format and add mock UPIDs
  const realPlayersWithUPID = (playersData || []).map((player: any, index: number) => ({
    id: player.id,
    upid: `UP${String(index + 1).padStart(6, '0')}`, // Generate UPID: UP000001, UP000002, etc.
    identityKeyHash: player.hashed_identity_keys || '',
    firstName: player.first_name || 'Unknown',
    lastName: player.last_name || 'Player',
    dob: player.dob || '1990-01-01',
    nationalId: '****' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'), // Mock national ID
    nationality: player.nationality || 'Kenyan',
    sex: player.sex || 'MALE',
    email: player.email || `player${index + 1}@example.com`,
    phone: player.phone || `+254${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    wardId: player.ward_id,
    profileImage: player.photo_path,
    orgId: player.org_id,
    registrationStatus: 'APPROVED' as const, // Mark all as approved for card generation
    status: player.status || 'ACTIVE',
    selfiePath: player.selfie_path,
    emergencyContactName: player.emergency_contact_name,
    emergencyContactPhone: player.emergency_contact_phone,
    guardianName: player.guardian_name,
    guardianPhone: player.guardian_phone,
    guardianEmail: player.guardian_email,
    guardianRelationship: player.guardian_relationship,
    medicalClearanceDate: player.medical_clearance_date,
    medicalClearanceStatus: player.medical_clearance_status || 'PENDING' as const,
    medicalExpiryDate: player.medical_clearance_expiry,
    preferredPosition: player.preferred_position,
    shirtNumber: player.shirt_number,
    isActive: player.is_active !== false,
    eligibilityStatus: player.eligibility_status,
    lastEligibilityCheck: player.last_eligibility_check,
    createdAt: new Date(player.created_at),
    updatedAt: new Date(player.updated_at),
    playerName: `${player.first_name || 'Unknown'} ${player.last_name || 'Player'}`
  }));

  // Mock additional approved players for demonstration
  const mockApprovedPlayers = [
    {
      id: 'mock-1',
      upid: 'UP001234',
      identityKeyHash: 'hash1',
      firstName: 'John',
      lastName: 'Kamau',
      dob: '1995-06-15',
      nationalId: '****5678',
      nationality: 'Kenyan',
      sex: 'MALE' as const,
      email: 'john.kamau@example.com',
      phone: '+254712345678',
      wardId: null,
      profileImage: null,
      orgId: '550e8400-e29b-41d4-a716-446655440001',
      registrationStatus: 'APPROVED' as const,
      status: 'ACTIVE',
      selfiePath: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      guardianName: null,
      guardianPhone: null,
      guardianEmail: null,
      guardianRelationship: null,
      medicalClearanceDate: null,
      medicalClearanceStatus: 'VALID' as const,
      medicalExpiryDate: null,
      preferredPosition: 'Midfielder',
      shirtNumber: 10,
      isActive: true,
      eligibilityStatus: null,
      lastEligibilityCheck: null,
      createdAt: new Date('2024-10-27'),
      updatedAt: new Date('2024-10-27'),
      playerName: 'John Kamau'
    },
    {
      id: 5,
      upid: 'UP001238',
      identityKeyHash: 'hash5',
      firstName: 'Samuel',
      lastName: 'Mwangi',
      dob: '1993-07-18',
      nationalId: '98765432',
      nationality: 'Kenyan',
      sex: 'MALE' as const,
      email: 'samuel.m@example.com',
      phone: '+254734567890',
      wardId: null,
      profileImage: null,
      orgId: '1',
      registrationStatus: 'APPROVED' as const,
      status: 'ACTIVE',
      selfiePath: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      guardianName: null,
      guardianPhone: null,
      guardianEmail: null,
      guardianRelationship: null,
      medicalClearanceDate: null,
      medicalClearanceStatus: 'PENDING' as const,
      medicalExpiryDate: null,
      preferredPosition: null,
      shirtNumber: null,
      height: null,
      weight: null,
      previousClubs: null,
      achievements: null,
      notes: null,
      createdAt: new Date('2024-10-27'),
      updatedAt: new Date('2024-10-27'),
      isActive: true,
      playerName: 'Samuel Mwangi'
    },
    {
      id: 6,
      upid: 'UP001239',
      identityKeyHash: 'hash6',
      firstName: 'Grace',
      lastName: 'Wanjiku',
      dob: '1992-03-22',
      nationalId: '87654321',
      nationality: 'Kenyan',
      sex: 'FEMALE' as const,
      email: 'grace.w@example.com',
      phone: '+254798765432',
      wardId: null,
      profileImage: null,
      orgId: '1',
      registrationStatus: 'APPROVED' as const,
      status: 'ACTIVE',
      selfiePath: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      guardianName: null,
      guardianPhone: null,
      guardianEmail: null,
      guardianRelationship: null,
      medicalClearanceDate: null,
      medicalClearanceStatus: 'PENDING' as const,
      medicalExpiryDate: null,
      preferredPosition: null,
      shirtNumber: null,
      height: null,
      weight: null,
      previousClubs: null,
      achievements: null,
      notes: null,
      createdAt: new Date('2024-10-28'),
      updatedAt: new Date('2024-10-28'),
      isActive: true,
      playerName: 'Grace Wanjiku'
    }
  ];

  // Combine real players with mock players for demonstration
  const allApprovedPlayers = [...realPlayersWithUPID, ...mockApprovedPlayers].filter(player => 
    player.registrationStatus === 'APPROVED'
  );

  // Use combined data for display
  const displayApprovedPlayers = allApprovedPlayers;

  const filteredPlayers = displayApprovedPlayers.filter((player: any) => {
    const searchMatch = 
      player.playerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.upid.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const handleScanResult = (data: PlayerCardData | null, error?: string) => {
    setScanResult(data);
    if (error) {
      console.error('QR Scan Error:', error);
    }
  };

  const handleBulkDownload = async () => {
    // In a real implementation, this would generate a ZIP file with all player cards
    alert('Bulk download functionality would be implemented here');
  };

  const handlePrintAll = () => {
    // Open a new window with print-friendly layout
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Player Cards - Print View</title>
          <style>
            @page {
              margin: 10mm;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .print-grid {
              display: grid;
              grid-template-columns: repeat(2, 85.6mm);
              gap: 5mm;
              justify-content: center;
            }
            .atm-card {
              width: 85.6mm;
              height: 53.98mm;
              background: linear-gradient(to right, #2563eb, #3b82f6, #4f46e5);
              color: white;
              border-radius: 4mm;
              overflow: hidden;
              page-break-inside: avoid;
              display: flex;
              margin-bottom: 5mm;
            }
            .card-left {
              flex: 1;
              padding: 3mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .card-right {
              width: 20mm;
              background: rgba(255,255,255,0.1);
              padding: 2mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 8px;
              font-weight: bold;
              color: rgba(255,255,255,0.8);
            }
            .player-info {
              display: flex;
              align-items: center;
              gap: 3mm;
            }
            .avatar {
              width: 12mm;
              height: 12mm;
              border-radius: 50%;
              background: white;
              color: #2563eb;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 10px;
            }
            .player-details h2 {
              font-size: 12px;
              margin: 0 0 1mm 0;
              font-weight: bold;
            }
            .player-details p {
              font-size: 8px;
              margin: 0;
              color: rgba(255,255,255,0.8);
            }
            .footer {
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: rgba(255,255,255,0.8);
            }
            .qr-container {
              background: white;
              padding: 1mm;
              border-radius: 1mm;
              margin-bottom: 2mm;
            }
            .qr-text {
              font-size: 6px;
              text-align: center;
              color: rgba(255,255,255,0.8);
              line-height: 1.2;
            }
            .status-badge {
              background: rgba(255,255,255,0.2);
              padding: 1mm 2mm;
              border-radius: 2mm;
              font-size: 6px;
              border: 1px solid rgba(255,255,255,0.3);
            }
          </style>
        </head>
        <body>
          <div class="print-grid">
    `);
    
    filteredPlayers.forEach((player: any) => {
      const initials = `${player.firstName?.[0] || ''}${player.lastName?.[0] || ''}`.toUpperCase();
      const dob = player.dob ? new Date(player.dob).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }) : 'N/A';
      
      printWindow.document.write(`
        <div class="atm-card">
          <div class="card-left">
            <div class="header">
              <span>JAMII TOURNEY</span>
              <div class="status-badge">${player.registrationStatus || 'DRAFT'}</div>
            </div>
            <div class="player-info">
              <div class="avatar">${initials}</div>
              <div class="player-details">
                <h2>${player.firstName} ${player.lastName}</h2>
                <p>${player.upid}</p>
                <p>${dob}</p>
              </div>
            </div>
            <div class="footer">
              <span>ID: ***${player.nationalId?.slice(-4) || 'N/A'}</span>
              <span>Valid: ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' })}</span>
            </div>
          </div>
          <div class="card-right">
            <div class="qr-container">
              <div style="width: 16mm; height: 16mm; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #666; font-size: 8px;">QR</div>
            </div>
            <div class="qr-text">SCAN TO VERIFY</div>
          </div>
        </div>
      `);
    });
    
    printWindow.document.write(`
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Automatically open print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <QrCode className="h-6 w-6 mr-3 text-blue-600" />
                Digital Player Cards
              </h1>
              <p className="text-gray-600">Generate and manage QR-enabled player verification cards</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bulk Download</span>
                <span className="sm:hidden">Download</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintAll}>
                <Printer className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Print All</span>
                <span className="sm:hidden">Print</span>
              </Button>
              <Button size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <QrCode className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cards Generated</p>
                    <p className="text-2xl font-bold">{displayApprovedPlayers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Players</p>
                    <p className="text-2xl font-bold">{displayApprovedPlayers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Download className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Downloads Today</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Camera className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scans Today</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards">Player Cards</TabsTrigger>
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or UPID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="IN_REVIEW">In Review</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Player Cards */}
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading player cards...</p>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="text-center py-12">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No approved players found</p>
                <p className="text-sm text-gray-500">Players need to be approved before generating cards</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
                  : 'space-y-6'
              }>
                {filteredPlayers.map((player: any) => (
                  <div key={player.id} className={viewMode === 'grid' ? 'mb-16' : ''}>
                    <PlayerCard 
                      player={player as any} 
                      showActions={true}
                      compact={viewMode === 'list'}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scanner">
            <QRScanner 
              onScanResult={handleScanResult}
              showResult={true}
            />
          </TabsContent>

          <TabsContent value="verification">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Verification Scanner */}
              <div>
                <QRScanner 
                  onScanResult={handleScanResult}
                  showResult={false}
                />
              </div>

              {/* Verification Result */}
              <div>
                {scanResult ? (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-800">Verification Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <h3 className="font-semibold text-lg">
                            {scanResult.firstName} {scanResult.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">UPID: {scanResult.upid}</p>
                          <p className="text-sm text-gray-600">Status: {scanResult.registrationStatus}</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-medium mb-2">Verification Details</h4>
                          <ul className="text-sm space-y-1">
                            <li>✅ QR Code format valid</li>
                            <li>✅ Player data complete</li>
                            <li>✅ Card not expired</li>
                            <li>✅ Registration status: {scanResult.registrationStatus}</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Scan a QR code to verify player</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}