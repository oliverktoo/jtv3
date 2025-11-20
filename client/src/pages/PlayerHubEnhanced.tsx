import React, { useState } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { 
  ArrowLeft, 
  Settings, 
  Download, 
  Share2, 
  RefreshCw, 
  User, 
  FileText, 
  Award, 
  BarChart3, 
  Shield, 
  Bell,
  Camera,
  Edit,
  Save,
  CreditCard,
  Trophy,
  Calendar,
  MapPin
} from 'lucide-react';
import { PlayerProfileCard, DocumentList, TournamentHistory } from '../components/PlayerDashboard';
import { useEnhancedPlayerImage } from '../hooks/useEnhancedPlayerImage';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'Tournament' | 'Individual' | 'Team';
  icon: string;
}

interface PlayerStat {
  category: string;
  value: number;
  label: string;
  change: string;
}

// Mock data for new tabs
const mockAchievements: Achievement[] = [
  { id: '1', title: 'Top Scorer', description: 'Leading scorer in County League 2024', date: '2024-09-15', type: 'Individual', icon: '🥇' },
  { id: '2', title: 'Team Captain', description: 'Elected team captain for City FC', date: '2024-08-01', type: 'Team', icon: '👑' },
  { id: '3', title: 'Championship Winner', description: 'Won District Championship with City FC', date: '2024-07-20', type: 'Tournament', icon: '🏆' },
];

const mockStats: PlayerStat[] = [
  { category: 'Goals', value: 15, label: 'Goals Scored', change: '+3 this month' },
  { category: 'Assists', value: 8, label: 'Assists Made', change: '+1 this month' },
  { category: 'Matches', value: 22, label: 'Matches Played', change: '95% attendance' },
  { category: 'Rating', value: 87, label: 'Performance Rating', change: '+5% improvement' },
];

const mockNotifications = [
  { id: '1', title: 'Training Session Tomorrow', message: 'Team training at 3 PM', date: '2024-10-31', type: 'reminder', read: false },
  { id: '2', title: 'Match Result Updated', message: 'Your stats from last match are now available', date: '2024-10-30', type: 'info', read: true },
  { id: '3', title: 'Document Expiring Soon', message: 'Your ID document expires in 30 days', date: '2024-10-29', type: 'warning', read: false },
];

export default function PlayerHubEnhanced() {
  // Get player ID from URL params if available
  const params = useParams();
  
  // Use the same orgId as the Registrar Console to show real data
  const orgId = '550e8400-e29b-41d4-a716-446655440001';
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(params.playerId || '');
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: false,
    showStats: true,
    showAchievements: true,
    allowMessaging: true,
    profileVisibility: 'public'
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    matchReminders: true,
    trainingUpdates: true,
    documentExpiry: true,
    achievementAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });
  
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
    position: 'Forward',
    jersey_number: '10',
    team: 'City FC',
    joined_date: '2024-01-15',
    status: 'Active'
  };

  const playerId = selectedPlayerId;
  
  // Use hooks only when we have a valid player ID
  const { data: profile, isLoading: profileLoading } = usePlayerProfile(playerId || '');
  const { data: documents } = usePlayerDocuments(playerId || '');
  const { data: consents } = usePlayerConsents(playerId || '');  
  const { data: participation } = useTournamentParticipation(playerId || '');
  const { data: stats } = usePlayerStats(playerId || '');

  // Auto-select first player if none selected and players are loaded
  React.useEffect(() => {
    if (allPlayers && allPlayers.length > 0 && !selectedPlayerId) {
      // Known players with images (prefer these for demo)
      const playersWithImages = [
        'd2556605-1f87-44e1-bdf0-fa157b4a7e23', // VVVV VVVV
        '18d646d2-d64c-47d0-abde-63089d9fa37b', // XXXXA XXXXA  
        '4f85212a-0cf1-4353-afff-95002865d89b'  // AAAA AAAA
      ];
      
      console.log('🔍 Checking auto-selection with', allPlayers.length, 'players loaded');
      console.log('🎯 Looking for players with images:', playersWithImages);
      
      // Log all player IDs to see what we have
      console.log('📄 All player IDs available:');
      allPlayers.forEach((player: any, index: number) => {
        const hasImage = playersWithImages.includes(player.id);
        console.log(`   ${index + 1}. ${player.first_name} ${player.last_name} (${player.id}) - ${hasImage ? '📸 HAS IMAGE' : '👤 no image'}`);
      });
      
      // Try to find a player with images first
      const playerWithImage = allPlayers.find((p: any) => playersWithImages.includes(p.id));
      
      // Force selection to VVVV VVVV if available, otherwise use found player or first player
      const forceSelectVVVV = allPlayers.find((p: any) => p.id === 'd2556605-1f87-44e1-bdf0-fa157b4a7e23');
      const selectedPlayer = forceSelectVVVV || playerWithImage || allPlayers[0];
      
      console.log('🎯 Auto-selecting player:', selectedPlayer?.first_name, selectedPlayer?.last_name);
      console.log('📸 Selected player has images:', playersWithImages.includes(selectedPlayer?.id) ? 'YES' : 'NO');
      console.log('🆔 Selected player ID:', selectedPlayer?.id);
      
      setSelectedPlayerId(selectedPlayer.id);
    }
  }, [allPlayers, selectedPlayerId]);

  // Use real profile data only
  const displayProfile: any = profile;

  // Enhanced image loading for profile picture
  const playerImage = useEnhancedPlayerImage(
    playerId || '',
    displayProfile?.photo_path || displayProfile?.profileImage,
    displayProfile?.first_name || '',
    displayProfile?.last_name || ''
  );

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.'
    });
  };

  const handlePrivacySave = () => {
    toast({
      title: 'Privacy Settings Updated',
      description: 'Your privacy preferences have been saved.'
    });
  };

  const handleNotificationSave = () => {
    toast({
      title: 'Notification Settings Updated',
      description: 'Your notification preferences have been saved.'
    });
  };

  // Show loading state if no profile is available
  if (!displayProfile) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading player data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Player Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive player profile and management center
          </p>
        </div>
        <div className="flex gap-2">
          {/* Player Selection */}
          {allPlayers && allPlayers.length > 0 && (
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select player to view" />
              </SelectTrigger>
              <SelectContent>
                {allPlayers.map((player: any) => {
                  // Known players with images
                  const playersWithImages = [
                    'd2556605-1f87-44e1-bdf0-fa157b4a7e23', // VVVV VVVV
                    '18d646d2-d64c-47d0-abde-63089d9fa37b', // XXXXA XXXXA  
                    '4f85212a-0cf1-4353-afff-95002865d89b'  // AAAA AAAA
                  ];
                  const hasImage = playersWithImages.includes(player.id);
                  
                  return (
                    <SelectItem key={player.id} value={player.id}>
                      {hasImage ? '📸 ' : '👤 '}{player.first_name} {player.last_name} - {player.email}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Comprehensive Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Image and Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Avatar className="mx-auto w-32 h-32">
                  <AvatarImage 
                    src={playerImage.src} 
                    alt={playerImage.alt}
                    className="object-cover"
                    onLoad={() => console.log('🎉 Avatar image loaded successfully!', playerImage.src?.substring(0, 30))}
                    onError={() => console.log('❌ Avatar image failed to load:', playerImage.src?.substring(0, 30))}
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {playerImage.isLoading ? '⏳' : playerImage.fallbackText}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-muted-foreground">
                  {playerImage.isLoading ? 'Loading profile picture...' : 
                   playerImage.src ? `Profile picture loaded (${playerImage.src.substring(0, 30)}...)` : 'Using initials as fallback'}
                </div>
                {/* Debug section - remove this later */}
                <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                  <div>Player ID: {playerId}</div>
                  <div>Image Source Length: {playerImage.src?.length || 'undefined'}</div>
                  <div>Is Loading: {playerImage.isLoading ? 'Yes' : 'No'}</div>
                  <div>Fallback Text: {playerImage.fallbackText}</div>
                  {playerImage.src && (
                    <div>
                      <div>Image Type: {playerImage.src.substring(0, 20)}</div>
                      <button 
                        onClick={() => (window as any).testImageAccess?.()} 
                        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                      >
                        Test Image Access
                      </button>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Basic Information</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input 
                      value={displayProfile.first_name} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input 
                      value={displayProfile.last_name} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      value={displayProfile.email} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input 
                      value={displayProfile.phone_number} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input 
                      value={displayProfile.dob} 
                      type="date"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input 
                      value={displayProfile.position} 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team and Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Team</Label>
                  <Input value={displayProfile?.team || ''} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Jersey Number</Label>
                  <Input value={displayProfile?.jersey_number || ''} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={displayProfile?.status === 'Active' ? 'default' : 'secondary'}>
                    {displayProfile?.status || 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>County</Label>
                  <Input value={displayProfile?.county || ''} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Sub County</Label>
                  <Input value={displayProfile?.sub_county || ''} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Ward</Label>
                  <Input value={displayProfile?.ward || ''} disabled={!isEditing} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Player Profile Card */}
          {displayProfile && stats && (
            <PlayerProfileCard 
              profile={{
                id: displayProfile.id || playerId || '',
                first_name: displayProfile.first_name || '',
                last_name: displayProfile.last_name || '',
                dob: displayProfile.date_of_birth || displayProfile.dob || '',
                sex: displayProfile.sex || 'M',
                nationality: displayProfile.nationality || 'KE',
                photo_path: displayProfile.photo_path || displayProfile.profileImage || undefined,
                status: displayProfile.status || 'ACTIVE',
                created_at: displayProfile.created_at || new Date().toISOString()
              }} 
              stats={{
                totalTournaments: stats.totalTournaments || 0,
                activeTournaments: stats.activeTournaments || 0,
                documentsUploaded: stats.documentsUploaded || 0,
                documentsVerified: stats.documentsVerified || 0,
                registrationStatus: stats.registrationStatus || 'DRAFT'
              }}
            />
          )}

          {/* Player Card Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Player ID Card Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Player ID card preview will be generated here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Document management interface will be integrated here</p>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Status */}
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Eligibility status checking will be integrated here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAchievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    {achievement.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{achievement.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(achievement.date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tournament History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tournament History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Tournament history will be integrated here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockStats.map((stat) => (
              <Card key={stat.category}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Detailed performance analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-email">Show email address publicly</Label>
                  <Switch 
                    id="show-email"
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, showEmail: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-phone">Show phone number publicly</Label>
                  <Switch 
                    id="show-phone"
                    checked={privacySettings.showPhone}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, showPhone: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-stats">Show performance statistics</Label>
                  <Switch 
                    id="show-stats"
                    checked={privacySettings.showStats}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, showStats: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-achievements">Show achievements and awards</Label>
                  <Switch 
                    id="show-achievements"
                    checked={privacySettings.showAchievements}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, showAchievements: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-messaging">Allow direct messaging</Label>
                  <Switch 
                    id="allow-messaging"
                    checked={privacySettings.allowMessaging}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, allowMessaging: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Select 
                  value={privacySettings.profileVisibility} 
                  onValueChange={(value) => 
                    setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="team">Team Only - Only teammates can view</SelectItem>
                    <SelectItem value="organization">Organization - Only org members can view</SelectItem>
                    <SelectItem value="private">Private - Only you can view</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePrivacySave} className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="match-reminders">Match reminders</Label>
                  <Switch 
                    id="match-reminders"
                    checked={notificationSettings.matchReminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, matchReminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="training-updates">Training updates</Label>
                  <Switch 
                    id="training-updates"
                    checked={notificationSettings.trainingUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, trainingUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="document-expiry">Document expiry alerts</Label>
                  <Switch 
                    id="document-expiry"
                    checked={notificationSettings.documentExpiry}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, documentExpiry: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="achievement-alerts">Achievement notifications</Label>
                  <Switch 
                    id="achievement-alerts"
                    checked={notificationSettings.achievementAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, achievementAlerts: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email notifications</Label>
                  <Switch 
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS notifications</Label>
                  <Switch 
                    id="sms-notifications"
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push notifications</Label>
                  <Switch 
                    id="push-notifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleNotificationSave} className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${notification.read ? 'bg-muted' : 'bg-primary/10'}`}>
                      <Bell className={`h-4 w-4 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`font-medium ${notification.read ? 'text-muted-foreground' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.date}</p>
                    </div>
                    <Badge variant={notification.type === 'warning' ? 'destructive' : 'outline'}>
                      {notification.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}