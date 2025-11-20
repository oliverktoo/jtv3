import React from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Settings, Download, Share2, RefreshCw } from 'lucide-react';
import { PlayerProfileCard, DocumentList, TournamentHistory } from '../components/PlayerDashboard';
import { 
  StatusSummary,
  StatusTimeline,
  NotificationCenter
} from '../components/RegistrationStatusComponents';
import { 
  EligibilityDashboard,
  EligibilityQuickCheck
} from '../components/EligibilityComponents';
import { 
  usePlayerProfile, 
  usePlayerDocuments, 
  usePlayerConsents, 
  useTournamentParticipation,
  usePlayerStats,
  useAllPlayers
} from '../hooks/usePlayerDashboard';
import { toast } from '../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function PlayerProfile() {
  // Use the same orgId as the Registrar Console to show real data
  const orgId = '550e8400-e29b-41d4-a716-446655440001';
  
  // State to track selected player
  const [selectedPlayerId, setSelectedPlayerId] = React.useState<string>('');
  
  // Fetch all players for selection
  const { data: allPlayers, isLoading: playersLoading } = useAllPlayers(orgId);
  
  // Mock profile data for demonstration
  const mockProfile = {
    id: 'mock-player-123',
    first_name: 'John',
    last_name: 'Doe',
    dob: '1995-05-15',
    sex: 'Male',
    phone_number: '+254712345678',
    email: 'john.doe@example.com',
    county: 'Nairobi',
    sub_county: 'Westlands',
    ward: 'Parklands',
    nationality: 'Kenyan',
    id_number: '12345678',
    passport_number: null,
    status: 'IN_REVIEW',
    photo_path: undefined,
    created_at: '2024-10-20T00:00:00Z',
    updated_at: '2024-10-29T00:00:00Z'
  };

  const mockStats = {
    totalTournaments: 3,
    activeTournaments: 1,
    documentsUploaded: 4,
    documentsVerified: 3,
    registrationStatus: 'IN_REVIEW'
  };

  const mockDocuments = [
    {
      id: '1',
      document_type: 'NATIONAL_ID',
      file_path: 'national_id.jpg',
      uploaded_at: '2024-10-20T00:00:00Z',
      verification_status: 'VERIFIED' as const,
      rejection_reason: undefined
    },
    {
      id: '2',
      document_type: 'BIRTH_CERTIFICATE',
      file_path: 'birth_cert.pdf',
      uploaded_at: '2024-10-21T00:00:00Z',
      verification_status: 'VERIFIED' as const,
      rejection_reason: undefined
    },
    {
      id: '3',
      document_type: 'SELFIE',
      file_path: 'selfie.jpg',
      uploaded_at: '2024-10-22T00:00:00Z',
      verification_status: 'VERIFIED' as const,
      rejection_reason: undefined
    },
    {
      id: '4',
      document_type: 'MEDICAL_CLEARANCE',
      file_path: 'medical.pdf',
      uploaded_at: '2024-10-25T00:00:00Z',
      verification_status: 'PENDING' as const,
      rejection_reason: undefined
    }
  ];

  const mockTournaments = [
    {
      id: '1',
      tournament_name: 'Nairobi County Football Championship',
      tournament_status: 'ACTIVE',
      registration_date: '2024-09-15T00:00:00Z',
      player_status: 'ACTIVE',
      team_name: 'Parklands FC'
    },
    {
      id: '2',
      tournament_name: 'Inter-Ward Basketball League',
      tournament_status: 'COMPLETED',
      registration_date: '2024-08-10T00:00:00Z',
      player_status: 'COMPLETED',
      team_name: 'Westlands Warriors'
    },
    {
      id: '3',
      tournament_name: 'National Youth Athletics Meet',
      tournament_status: 'COMPLETED',
      registration_date: '2024-07-01T00:00:00Z',
      player_status: 'COMPLETED',
      team_name: undefined
    }
  ];

  // Auto-select first player if none selected and players are loaded
  React.useEffect(() => {
    if (allPlayers && allPlayers.length > 0 && !selectedPlayerId) {
      console.log('Auto-selecting first player:', allPlayers[0]);
      setSelectedPlayerId(allPlayers[0].id);
    }
  }, [allPlayers, selectedPlayerId]);

  // Only use real hooks when we have a valid player ID
  const { data: profile, isLoading: profileLoading, error: profileError } = usePlayerProfile(selectedPlayerId || '');
  const { data: documents, isLoading: documentsLoading } = usePlayerDocuments(selectedPlayerId || '');
  const { data: consents, isLoading: consentsLoading } = usePlayerConsents(selectedPlayerId || '');
  const { data: tournaments, isLoading: tournamentsLoading } = useTournamentParticipation(selectedPlayerId || '');
  const { data: stats, isLoading: statsLoading } = usePlayerStats(selectedPlayerId || '');

  // Debug logging
  React.useEffect(() => {
    console.log('PlayerProfile - Data Status:', {
      allPlayers: allPlayers?.length || 0,
      selectedPlayerId,
      profile: profile ? 'loaded' : 'none',
      playersLoading,
      profileLoading
    });
  }, [allPlayers, selectedPlayerId, profile, playersLoading, profileLoading]);

  // Transform real data to match expected UI format
  const displayProfile = profile ? {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    dob: profile.dob,
    sex: profile.sex,
    phone_number: profile.phone || '',
    email: profile.email || '',
    county: profile.ward?.sub_county?.county?.name || 'N/A',
    sub_county: profile.ward?.sub_county?.name || 'N/A',  
    ward: profile.ward?.name || 'N/A',
    nationality: profile.nationality,
    id_number: 'Protected', // Don't display sensitive ID number
    passport_number: null,
    status: profile.registration_status,
    photo_path: profile.photo_path, // Use the correct database field
    created_at: profile.created_at,
    updated_at: profile.updated_at
  } : null;
  
  const displayStats = stats || mockStats;
  const displayDocuments = documents || mockDocuments;
  const displayTournaments = tournaments || mockTournaments;

  if (playersLoading || profileLoading || !selectedPlayerId || !displayProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {playersLoading ? 'Loading players...' : 
             profileLoading ? 'Loading profile...' : 
             !selectedPlayerId ? 'Select a player to view profile...' :
             'Loading player data...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error only if there's an actual error AND no mock data to display
  if (profileError && !displayProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Failed to load player profile. Showing demo data instead.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to Your Player Dashboard</h2>
              <p className="text-gray-600 mb-6">
                It looks like you don't have a player profile yet, or we couldn't find your data.
              </p>
              <div className="space-x-4">
                <Button onClick={() => window.location.href = '/register'}>
                  Complete Registration
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleExportProfile = () => {
    toast({
      title: 'Profile Export',
      description: 'Your profile data will be exported shortly.',
    });
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Profile Link Copied',
      description: 'Share this link to show your player profile.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Player Dashboard</h1>
                <p className="text-gray-600">Manage your profile and tournament participation</p>
              </div>
              
              {/* Player Selector */}
              <div className="ml-8">
                <label className="text-sm font-medium text-gray-700 block mb-2">Select Player:</label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Choose a player..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allPlayers?.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.first_name} {player.last_name} ({player.registration_status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShareProfile}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportProfile}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      {(!profile && mockProfile) && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">i</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> Showing sample player data. Complete registration to see your actual profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Summary */}
            <StatusSummary playerId={selectedPlayerId} />
            
            {/* Profile Card */}
            <PlayerProfileCard profile={displayProfile} stats={displayStats} />
            
            {/* Status Timeline */}
            <StatusTimeline playerId={selectedPlayerId} />
            
            {/* Eligibility Dashboard */}
            <EligibilityDashboard playerId={selectedPlayerId} />
            
            {/* Tournament History */}
            <TournamentHistory tournaments={displayTournaments} />
          </div>

          {/* Right Column - Notifications & Documents */}
          <div className="space-y-6">
            {/* Notifications */}
            <NotificationCenter playerId={selectedPlayerId} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => window.location.href = '/tournaments'}>
                  Browse Tournaments
                </Button>
                <Button variant="outline" className="w-full">
                  Update Profile
                </Button>
                <Button variant="outline" className="w-full">
                  Upload Documents
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Documents */}
            <DocumentList documents={displayDocuments} />

            {/* Registration Status */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Profile Verification</span>
                  <Badge variant="secondary">In Review</Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Identity Verified</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓ Complete
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Documents Uploaded</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      ⏳ Pending
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Eligibility Check</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      📋 Scheduled
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-xs text-gray-600">
                  <p>• Complete verification typically takes 2-3 business days</p>
                  <p>• You can participate in tournaments while verification is pending</p>
                  <p>• Upload additional documents to speed up the process</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}