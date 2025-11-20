import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Camera,
  Upload,
  Edit3,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Trophy,
  Star,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Building,
  User,
  Shield,
  Clock,
  FileImage,
  Plus
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Team profile data structure
interface TeamProfile {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  foundedYear?: number;
  description?: string;
  venue: {
    name: string;
    address?: string;
    capacity?: number;
    coordinates?: { lat: number; lng: number };
  };
  contact: {
    primaryEmail: string;
    primaryPhone: string;
    website?: string;
    address?: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  management: {
    coach: {
      name: string;
      email: string;
      phone: string;
      certifications?: string[];
    };
    captain?: {
      name: string;
      playerId: string;
    };
    manager?: {
      name: string;
      email: string;
      phone: string;
    };
  };
  statistics: {
    totalPlayers: number;
    activePlayers: number;
    wins: number;
    losses: number;
    draws: number;
    goalsScored: number;
    goalsConceded: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    year: number;
    description?: string;
    level: 'local' | 'regional' | 'national' | 'international';
  }>;
  colors: {
    primary: string;
    secondary: string;
    kit: {
      home: { primary: string; secondary: string; accent?: string };
      away: { primary: string; secondary: string; accent?: string };
    };
  };
  gallery: Array<{
    id: string;
    url: string;
    title?: string;
    description?: string;
    category: 'match' | 'training' | 'event' | 'facility';
  }>;
}

interface EnhancedTeamProfilesProps {
  teamId?: string;
  mode?: 'view' | 'edit';
  onSave?: (profile: TeamProfile) => void;
}

const EnhancedTeamProfiles: React.FC<EnhancedTeamProfilesProps> = ({
  teamId = 'team-1',
  mode: initialMode = 'view',
  onSave
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [activeTab, setActiveTab] = useState('overview');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mock team data
  const [teamProfile, setTeamProfile] = useState<TeamProfile>({
    id: teamId,
    name: "Nairobi Warriors FC",
    shortName: "Warriors",
    logo: "/api/placeholder/150/150",
    foundedYear: 2015,
    description: "Professional football club based in Nairobi, committed to developing local talent and promoting excellence in football. We are dedicated to community engagement and youth development programs.",
    venue: {
      name: "Nyayo National Stadium",
      address: "Nairobi Sports Road, Nairobi, Kenya",
      capacity: 30000,
      coordinates: { lat: -1.3028, lng: 36.8219 }
    },
    contact: {
      primaryEmail: "info@nairobi-warriors.co.ke",
      primaryPhone: "+254722345678",
      website: "https://nairobi-warriors.co.ke",
      address: "P.O. Box 12345-00100, Nairobi, Kenya"
    },
    socialMedia: {
      facebook: "https://facebook.com/nairobiwarriors",
      twitter: "https://twitter.com/nairobiwarriors",
      instagram: "https://instagram.com/nairobiwarriors",
      youtube: "https://youtube.com/c/nairobiwarriors"
    },
    management: {
      coach: {
        name: "John Kiprotich",
        email: "j.kiprotich@nairobi-warriors.co.ke",
        phone: "+254701234567",
        certifications: ["CAF License A", "FIFA Coaching Badge", "Sports Management Diploma"]
      },
      captain: {
        name: "Michael Otieno",
        playerId: "PL-001"
      },
      manager: {
        name: "Mary Wanjiku",
        email: "m.wanjiku@nairobi-warriors.co.ke", 
        phone: "+254733456789"
      }
    },
    statistics: {
      totalPlayers: 28,
      activePlayers: 25,
      wins: 15,
      losses: 3,
      draws: 7,
      goalsScored: 42,
      goalsConceded: 18
    },
    achievements: [
      {
        id: "ach-1",
        title: "Nairobi County Championship",
        year: 2023,
        description: "Winners of the premier county-level tournament",
        level: "regional"
      },
      {
        id: "ach-2", 
        title: "Regional Youth Cup",
        year: 2022,
        description: "Champions in the under-21 category",
        level: "regional"
      },
      {
        id: "ach-3",
        title: "Community Service Award",
        year: 2023,
        description: "Recognition for outstanding community engagement",
        level: "local"
      }
    ],
    colors: {
      primary: "#1E40AF",
      secondary: "#FFA500", 
      kit: {
        home: { primary: "#1E40AF", secondary: "#FFFFFF", accent: "#FFA500" },
        away: { primary: "#FFFFFF", secondary: "#1E40AF", accent: "#FFA500" }
      }
    },
    gallery: [
      {
        id: "img-1",
        url: "/api/placeholder/300/200",
        title: "Victory Celebration",
        description: "Team celebrating championship victory",
        category: "match"
      },
      {
        id: "img-2",
        url: "/api/placeholder/300/200", 
        title: "Training Session",
        description: "Daily training at Nyayo Stadium",
        category: "training"
      },
      {
        id: "img-3",
        url: "/api/placeholder/300/200",
        title: "Community Outreach",
        description: "Youth coaching clinic in Kibera",
        category: "event"
      }
    ]
  });

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Logo must be smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setTeamProfile(prev => ({
        ...prev,
        logo: e.target?.result as string
      }));
      
      toast({
        title: "Logo Updated",
        description: "Team logo has been updated successfully"
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle gallery upload
  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} must be smaller than 10MB`,
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: `img-${Date.now()}-${Math.random()}`,
          url: e.target?.result as string,
          title: file.name,
          description: "",
          category: 'match' as const
        };
        
        setTeamProfile(prev => ({
          ...prev,
          gallery: [...prev.gallery, newImage]
        }));
      };
      reader.readAsDataURL(file);
    });

    toast({
      title: "Images Added",
      description: `${files.length} image(s) added to gallery`
    });
  };

  // Save profile changes
  const handleSave = () => {
    if (onSave) {
      onSave(teamProfile);
    }
    
    setMode('view');
    toast({
      title: "Profile Updated",
      description: "Team profile has been saved successfully"
    });
  };

  // Update profile field
  const updateField = (field: string, value: any) => {
    setTeamProfile(prev => {
      const keys = field.split('.');
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      current[keys[keys.length - 1]] = value;
      
      return updated;
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'international': return 'text-purple-600 bg-purple-100';
      case 'national': return 'text-blue-600 bg-blue-100';
      case 'regional': return 'text-green-600 bg-green-100';
      case 'local': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Logo and Basic Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={teamProfile.logo} alt={teamProfile.name} />
                  <AvatarFallback className="text-2xl font-bold">
                    {teamProfile.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {mode === 'edit' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full p-2"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Camera className="w-3 h-3" />
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              
              <div className="flex-1">
                {mode === 'edit' ? (
                  <div className="space-y-3">
                    <Input
                      value={teamProfile.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="text-2xl font-bold"
                      placeholder="Team Name"
                    />
                    <Input
                      value={teamProfile.shortName || ''}
                      onChange={(e) => updateField('shortName', e.target.value)}
                      placeholder="Short Name (e.g., Warriors)"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{teamProfile.name}</h1>
                    {teamProfile.shortName && (
                      <p className="text-lg text-gray-600">"{teamProfile.shortName}"</p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-4 mt-3">
                  <Badge variant="outline" className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Est. {teamProfile.foundedYear}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {teamProfile.statistics.totalPlayers} Players
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {teamProfile.venue.name}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {mode === 'view' ? (
                <Button onClick={() => setMode('edit')}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setMode('view')}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{teamProfile.statistics.wins}</div>
              <div className="text-sm text-green-700">Wins</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{teamProfile.statistics.draws}</div>
              <div className="text-sm text-gray-700">Draws</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{teamProfile.statistics.losses}</div>
              <div className="text-sm text-red-700">Losses</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {teamProfile.statistics.goalsScored - teamProfile.statistics.goalsConceded > 0 ? '+' : ''}
                {teamProfile.statistics.goalsScored - teamProfile.statistics.goalsConceded}
              </div>
              <div className="text-sm text-blue-700">Goal Diff</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About the Team</CardTitle>
              </CardHeader>
              <CardContent>
                {mode === 'edit' ? (
                  <Textarea
                    value={teamProfile.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your team..."
                    rows={6}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {teamProfile.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Venue Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Home Venue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'edit' ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Venue Name</Label>
                      <Input
                        value={teamProfile.venue.name}
                        onChange={(e) => updateField('venue.name', e.target.value)}
                        placeholder="Stadium/Ground Name"
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={teamProfile.venue.address || ''}
                        onChange={(e) => updateField('venue.address', e.target.value)}
                        placeholder="Full address"
                      />
                    </div>
                    <div>
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        value={teamProfile.venue.capacity || ''}
                        onChange={(e) => updateField('venue.capacity', parseInt(e.target.value) || 0)}
                        placeholder="Stadium capacity"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{teamProfile.venue.name}</h4>
                      {teamProfile.venue.address && (
                        <p className="text-gray-600 flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {teamProfile.venue.address}
                        </p>
                      )}
                      {teamProfile.venue.capacity && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Capacity: {teamProfile.venue.capacity.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Team Colors & Kit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Home Kit */}
                <div>
                  <h4 className="font-medium mb-3">Home Kit</h4>
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-gray-300"
                      style={{ backgroundColor: teamProfile.colors.kit.home.primary }}
                    />
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-gray-300"
                      style={{ backgroundColor: teamProfile.colors.kit.home.secondary }}
                    />
                    {teamProfile.colors.kit.home.accent && (
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: teamProfile.colors.kit.home.accent }}
                      />
                    )}
                  </div>
                </div>

                {/* Away Kit */}
                <div>
                  <h4 className="font-medium mb-3">Away Kit</h4>
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-gray-300"
                      style={{ backgroundColor: teamProfile.colors.kit.away.primary }}
                    />
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-gray-300"
                      style={{ backgroundColor: teamProfile.colors.kit.away.secondary }}
                    />
                    {teamProfile.colors.kit.away.accent && (
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: teamProfile.colors.kit.away.accent }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'edit' ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={teamProfile.contact.primaryEmail}
                        onChange={(e) => updateField('contact.primaryEmail', e.target.value)}
                        placeholder="team@example.com"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={teamProfile.contact.primaryPhone}
                        onChange={(e) => updateField('contact.primaryPhone', e.target.value)}
                        placeholder="+254..."
                      />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input
                        value={teamProfile.contact.website || ''}
                        onChange={(e) => updateField('contact.website', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Postal Address</Label>
                      <Textarea
                        value={teamProfile.contact.address || ''}
                        onChange={(e) => updateField('contact.address', e.target.value)}
                        placeholder="P.O. Box..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${teamProfile.contact.primaryEmail}`} 
                         className="text-blue-600 hover:underline">
                        {teamProfile.contact.primaryEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${teamProfile.contact.primaryPhone}`} 
                         className="text-blue-600 hover:underline">
                        {teamProfile.contact.primaryPhone}
                      </a>
                    </div>
                    {teamProfile.contact.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a href={teamProfile.contact.website} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:underline">
                          {teamProfile.contact.website}
                        </a>
                      </div>
                    )}
                    {teamProfile.contact.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <span className="text-gray-700">{teamProfile.contact.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'edit' ? (
                  <div className="space-y-3">
                    {[
                      { key: 'facebook', icon: Facebook, placeholder: 'Facebook URL', label: 'Facebook' },
                      { key: 'twitter', icon: Twitter, placeholder: 'Twitter URL', label: 'Twitter' },
                      { key: 'instagram', icon: Instagram, placeholder: 'Instagram URL', label: 'Instagram' },
                      { key: 'youtube', icon: Youtube, placeholder: 'YouTube URL', label: 'YouTube' }
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <Input
                          value={teamProfile.socialMedia[key as keyof typeof teamProfile.socialMedia] || ''}
                          onChange={(e) => updateField(`socialMedia.${key}`, e.target.value)}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { key: 'facebook', icon: Facebook, label: 'Facebook' },
                      { key: 'twitter', icon: Twitter, label: 'Twitter' },
                      { key: 'instagram', icon: Instagram, label: 'Instagram' },
                      { key: 'youtube', icon: Youtube, label: 'YouTube' }
                    ].map(({ key, icon: Icon, label }) => {
                      const url = teamProfile.socialMedia[key as keyof typeof teamProfile.socialMedia];
                      return url ? (
                        <div key={key} className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <a href={url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-blue-600 hover:underline">
                            {label}
                          </a>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Coach */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Head Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'edit' ? (
                  <div className="space-y-3">
                    <Input
                      value={teamProfile.management.coach.name}
                      onChange={(e) => updateField('management.coach.name', e.target.value)}
                      placeholder="Coach Name"
                    />
                    <Input
                      type="email"
                      value={teamProfile.management.coach.email}
                      onChange={(e) => updateField('management.coach.email', e.target.value)}
                      placeholder="Coach Email"
                    />
                    <Input
                      value={teamProfile.management.coach.phone}
                      onChange={(e) => updateField('management.coach.phone', e.target.value)}
                      placeholder="Coach Phone"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{teamProfile.management.coach.name}</h4>
                      <p className="text-sm text-gray-600">{teamProfile.management.coach.email}</p>
                      <p className="text-sm text-gray-600">{teamProfile.management.coach.phone}</p>
                    </div>
                    {teamProfile.management.coach.certifications && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Certifications:</h5>
                        <div className="space-y-1">
                          {teamProfile.management.coach.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline" className="mr-2">
                              <Shield className="w-3 h-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Captain */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Team Captain
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mode === 'edit' ? (
                  <div className="space-y-3">
                    <Input
                      value={teamProfile.management.captain?.name || ''}
                      onChange={(e) => updateField('management.captain.name', e.target.value)}
                      placeholder="Captain Name"
                    />
                    <Input
                      value={teamProfile.management.captain?.playerId || ''}
                      onChange={(e) => updateField('management.captain.playerId', e.target.value)}
                      placeholder="Player ID"
                    />
                  </div>
                ) : (
                  teamProfile.management.captain && (
                    <div>
                      <h4 className="font-semibold">{teamProfile.management.captain.name}</h4>
                      <p className="text-sm text-gray-600">ID: {teamProfile.management.captain.playerId}</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* Team Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Team Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'edit' ? (
                  <div className="space-y-3">
                    <Input
                      value={teamProfile.management.manager?.name || ''}
                      onChange={(e) => updateField('management.manager.name', e.target.value)}
                      placeholder="Manager Name"
                    />
                    <Input
                      type="email"
                      value={teamProfile.management.manager?.email || ''}
                      onChange={(e) => updateField('management.manager.email', e.target.value)}
                      placeholder="Manager Email"
                    />
                    <Input
                      value={teamProfile.management.manager?.phone || ''}
                      onChange={(e) => updateField('management.manager.phone', e.target.value)}
                      placeholder="Manager Phone"
                    />
                  </div>
                ) : (
                  teamProfile.management.manager && (
                    <div>
                      <h4 className="font-semibold">{teamProfile.management.manager.name}</h4>
                      <p className="text-sm text-gray-600">{teamProfile.management.manager.email}</p>
                      <p className="text-sm text-gray-600">{teamProfile.management.manager.phone}</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Team Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamProfile.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <Badge className={getLevelColor(achievement.level)}>
                          {achievement.level}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{achievement.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {achievement.year}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileImage className="w-5 h-5" />
                  Team Gallery
                </div>
                {mode === 'edit' && (
                  <Button
                    variant="outline"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Photos
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamProfile.gallery.map((image) => (
                  <div key={image.id} className="group relative">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-end">
                      <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <h5 className="font-semibold">{image.title}</h5>
                        {image.description && (
                          <p className="text-sm">{image.description}</p>
                        )}
                        <Badge variant="secondary" className="mt-2">
                          {image.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTeamProfiles;