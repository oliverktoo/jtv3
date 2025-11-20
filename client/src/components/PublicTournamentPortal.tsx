import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  Trophy,
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  Star,
  Medal,
  Target,
  TrendingUp,
  Share2,
  Heart,
  MessageCircle,
  Eye,
  ChevronRight,
  Play,
  Download,
  Bell,
  Smartphone,
  Globe,
  Zap,
  Award
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Enhanced tournament data structure for public portal
interface PublicTournament {
  id: string;
  name: string;
  description: string;
  type: 'ADMINISTRATIVE' | 'INTER_COUNTY' | 'INDEPENDENT' | 'LEAGUE';
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  startDate: string;
  endDate: string;
  location: {
    region: string;
    venue: string;
    coordinates?: { lat: number; lng: number };
  };
  sport: {
    name: string;
    icon: string;
  };
  participants: {
    registered: number;
    capacity: number;
    teams: number;
  };
  featured: boolean;
  highlights: string[];
  media: {
    coverImage: string;
    gallery: string[];
    livestreamUrl?: string;
  };
  prizes: {
    totalValue: number;
    breakdown: Array<{
      position: string;
      prize: string;
      value: number;
    }>;
  };
  schedule: Array<{
    id: string;
    date: string;
    time: string;
    stage: string;
    matches: Array<{
      id: string;
      homeTeam: string;
      awayTeam: string;
      venue: string;
      status: 'scheduled' | 'live' | 'completed';
      score?: { home: number; away: number };
      isLive?: boolean;
    }>;
  }>;
  leaderboard: Array<{
    position: number;
    team: string;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
  }>;
  stats: {
    totalMatches: number;
    completedMatches: number;
    totalGoals: number;
    avgGoalsPerMatch: number;
    topScorer: { name: string; goals: number; team: string };
  };
  socialEngagement: {
    followers: number;
    likes: number;
    shares: number;
    comments: number;
  };
}

interface PublicTournamentPortalProps {
  organizationId?: string;
  featured?: boolean;
}

const PublicTournamentPortal: React.FC<PublicTournamentPortalProps> = ({
  organizationId,
  featured = false
}) => {
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<PublicTournament | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  // Mock tournament data for demonstration
  useEffect(() => {
    const mockTournaments: PublicTournament[] = [
      {
        id: 'tournament-1',
        name: 'Nairobi County Football Championship 2024',
        description: 'The premier football tournament bringing together the best teams from across Nairobi County. Experience world-class football action with live coverage and fan engagement.',
        type: 'ADMINISTRATIVE',
        status: 'ONGOING',
        startDate: '2024-11-01',
        endDate: '2024-12-15',
        location: {
          region: 'Nairobi County',
          venue: 'Nyayo National Stadium',
          coordinates: { lat: -1.3028, lng: 36.8219 }
        },
        sport: {
          name: 'Football',
          icon: '⚽'
        },
        participants: {
          registered: 156,
          capacity: 200,
          teams: 32
        },
        featured: true,
        highlights: [
          'Live streaming of all matches',
          'Professional commentary',
          'Real-time statistics',
          'Mobile app integration',
          'Fan voting and engagement'
        ],
        media: {
          coverImage: '/api/placeholder/800/400',
          gallery: [
            '/api/placeholder/300/200',
            '/api/placeholder/300/200', 
            '/api/placeholder/300/200'
          ],
          livestreamUrl: 'https://live.example.com/nairobi-championship'
        },
        prizes: {
          totalValue: 2500000,
          breakdown: [
            { position: '1st Place', prize: 'KSh 1,000,000 + Trophy', value: 1000000 },
            { position: '2nd Place', prize: 'KSh 600,000 + Medal', value: 600000 },
            { position: '3rd Place', prize: 'KSh 400,000 + Medal', value: 400000 },
            { position: 'Fair Play', prize: 'KSh 200,000', value: 200000 }
          ]
        },
        schedule: [
          {
            id: 'day-1',
            date: '2024-11-02',
            time: '14:00',
            stage: 'Group Stage - Matchday 3',
            matches: [
              {
                id: 'match-1',
                homeTeam: 'Nairobi Warriors',
                awayTeam: 'Eastlands FC',
                venue: 'Nyayo Stadium - Pitch 1',
                status: 'live',
                score: { home: 2, away: 1 },
                isLive: true
              },
              {
                id: 'match-2',
                homeTeam: 'Kibera United',
                awayTeam: 'Westlands FC',
                venue: 'Nyayo Stadium - Pitch 2',
                status: 'scheduled'
              }
            ]
          }
        ],
        leaderboard: [
          {
            position: 1,
            team: 'Nairobi Warriors',
            points: 15,
            played: 6,
            won: 5,
            drawn: 0,
            lost: 1,
            gf: 18,
            ga: 6,
            gd: 12
          },
          {
            position: 2,
            team: 'Eastlands FC',
            points: 12,
            played: 6,
            won: 4,
            drawn: 0,
            lost: 2,
            gf: 14,
            ga: 8,
            gd: 6
          },
          {
            position: 3,
            team: 'Kibera United',
            points: 10,
            played: 5,
            won: 3,
            drawn: 1,
            lost: 1,
            gf: 12,
            ga: 7,
            gd: 5
          }
        ],
        stats: {
          totalMatches: 48,
          completedMatches: 28,
          totalGoals: 89,
          avgGoalsPerMatch: 3.2,
          topScorer: { name: 'John Ochieng', goals: 12, team: 'Nairobi Warriors' }
        },
        socialEngagement: {
          followers: 15420,
          likes: 3240,
          shares: 890,
          comments: 567
        }
      },
      {
        id: 'tournament-2',
        name: 'Coast Basketball League 2024',
        description: 'Elite basketball competition featuring top teams from Mombasa, Kilifi, and Kwale counties.',
        type: 'INTER_COUNTY',
        status: 'UPCOMING',
        startDate: '2024-11-15',
        endDate: '2024-12-30',
        location: {
          region: 'Coast Region',
          venue: 'Mombasa Sports Complex',
          coordinates: { lat: -4.0435, lng: 39.6682 }
        },
        sport: {
          name: 'Basketball',
          icon: '🏀'
        },
        participants: {
          registered: 89,
          capacity: 120,
          teams: 16
        },
        featured: true,
        highlights: [
          'Multi-county competition',
          'Professional referees',
          'Live score updates',
          'Player statistics tracking'
        ],
        media: {
          coverImage: '/api/placeholder/800/400',
          gallery: ['/api/placeholder/300/200']
        },
        prizes: {
          totalValue: 1800000,
          breakdown: [
            { position: '1st Place', prize: 'KSh 800,000 + Trophy', value: 800000 },
            { position: '2nd Place', prize: 'KSh 500,000', value: 500000 },
            { position: '3rd Place', prize: 'KSh 300,000', value: 300000 }
          ]
        },
        schedule: [],
        leaderboard: [],
        stats: {
          totalMatches: 32,
          completedMatches: 0,
          totalGoals: 0,
          avgGoalsPerMatch: 0,
          topScorer: { name: 'TBD', goals: 0, team: 'TBD' }
        },
        socialEngagement: {
          followers: 8930,
          likes: 1240,
          shares: 340,
          comments: 189
        }
      },
      {
        id: 'tournament-3',
        name: 'Kenya Youth Volleyball Championship',
        description: 'National youth volleyball championship showcasing the next generation of talent.',
        type: 'INDEPENDENT',
        status: 'COMPLETED',
        startDate: '2024-09-01',
        endDate: '2024-10-15',
        location: {
          region: 'Nairobi',
          venue: 'Kasarani Sports Complex'
        },
        sport: {
          name: 'Volleyball',
          icon: '🏐'
        },
        participants: {
          registered: 240,
          capacity: 240,
          teams: 48
        },
        featured: false,
        highlights: [
          'Youth talent showcase',
          'National coverage',
          'Scholarship opportunities'
        ],
        media: {
          coverImage: '/api/placeholder/800/400',
          gallery: []
        },
        prizes: {
          totalValue: 1200000,
          breakdown: [
            { position: '1st Place', prize: 'KSh 500,000 + Scholarships', value: 500000 },
            { position: '2nd Place', prize: 'KSh 400,000', value: 400000 },
            { position: '3rd Place', prize: 'KSh 300,000', value: 300000 }
          ]
        },
        schedule: [],
        leaderboard: [
          {
            position: 1,
            team: 'Nairobi Volleyball Academy',
            points: 18,
            played: 6,
            won: 6,
            drawn: 0,
            lost: 0,
            gf: 18,
            ga: 4,
            gd: 14
          }
        ],
        stats: {
          totalMatches: 72,
          completedMatches: 72,
          totalGoals: 0,
          avgGoalsPerMatch: 0,
          topScorer: { name: 'Grace Wanjiku', goals: 0, team: 'Nairobi Volleyball Academy' }
        },
        socialEngagement: {
          followers: 5670,
          likes: 890,
          shares: 234,
          comments: 123
        }
      }
    ];

    setTournaments(mockTournaments);
    if (featured) {
      setSelectedTournament(mockTournaments.find(t => t.featured) || mockTournaments[0]);
    }
  }, [featured]);

  // Filter tournaments
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || tournament.type === filterType;
    const matchesStatus = filterStatus === 'all' || tournament.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    toast({
      title: isSubscribed ? "Unsubscribed" : "Subscribed!",
      description: isSubscribed 
        ? "You will no longer receive tournament updates" 
        : "You'll receive live updates and notifications"
    });
  };

  const handleShare = (tournament: PublicTournament) => {
    if (navigator.share) {
      navigator.share({
        title: tournament.name,
        text: tournament.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Tournament link copied to clipboard"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'ONGOING': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ADMINISTRATIVE': return 'County Championship';
      case 'INTER_COUNTY': return 'Multi-County League';
      case 'INDEPENDENT': return 'Open Tournament';
      case 'LEAGUE': return 'League Competition';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              🏆 Jamii Tourney
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Kenya's Premier Tournament Platform
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
                <Trophy className="w-5 h-5 mr-2" />
                <span>Professional Tournaments</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
                <Zap className="w-5 h-5 mr-2" />
                <span>Live Updates</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
                <Smartphone className="w-5 h-5 mr-2" />
                <span>Mobile Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tournaments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="ADMINISTRATIVE">County Championships</option>
                <option value="INTER_COUNTY">Multi-County</option>
                <option value="INDEPENDENT">Open Tournaments</option>
                <option value="LEAGUE">League</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Tournament */}
        {selectedTournament && (
          <Card className="mb-8 overflow-hidden">
            <div className="relative">
              <img
                src={selectedTournament.media.coverImage}
                alt={selectedTournament.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-500 text-black">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  <Badge className={getStatusColor(selectedTournament.status)}>
                    {selectedTournament.status}
                  </Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {selectedTournament.name}
                </h2>
                <p className="text-gray-200 mb-4 max-w-2xl">
                  {selectedTournament.description}
                </p>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(selectedTournament.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{selectedTournament.location.venue}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{selectedTournament.participants.teams} Teams</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setActiveTab('live')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Live
                  </Button>
                  <Button variant="outline" className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-black">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-black"
                    onClick={() => handleShare(selectedTournament)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tournament Tabs */}
        {selectedTournament && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="standings">Standings</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="engagement">Fan Zone</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tournament Info */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Tournament Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-600">Type</h4>
                        <p>{getTypeLabel(selectedTournament.type)}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-600">Sport</h4>
                        <p className="flex items-center">
                          <span className="mr-2">{selectedTournament.sport.icon}</span>
                          {selectedTournament.sport.name}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-600">Duration</h4>
                        <p>{new Date(selectedTournament.startDate).toLocaleDateString()} - {new Date(selectedTournament.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-600">Location</h4>
                        <p>{selectedTournament.location.region}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-600 mb-2">Highlights</h4>
                      <ul className="space-y-1">
                        {selectedTournament.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Award className="w-3 h-3 mr-2 text-green-600" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Prize Pool</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        KSh {selectedTournament.prizes.totalValue.toLocaleString()}
                      </div>
                      <div className="space-y-2">
                        {selectedTournament.prizes.breakdown.map((prize, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{prize.position}</span>
                            <span className="font-medium">KSh {prize.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Participation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Teams</span>
                          <span className="font-bold">{selectedTournament.participants.teams}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Players</span>
                          <span className="font-bold">{selectedTournament.participants.registered}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Followers</span>
                          <span className="font-bold">{selectedTournament.socialEngagement.followers.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscribe Button */}
                  <Button 
                    onClick={handleSubscribe}
                    className={`w-full ${isSubscribed ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    <Bell className={`w-4 h-4 mr-2 ${isSubscribed ? 'fill-current' : ''}`} />
                    {isSubscribed ? 'Subscribed' : 'Subscribe for Updates'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="live" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Matches */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      Live Matches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTournament.schedule
                        .flatMap(day => day.matches)
                        .filter(match => match.isLive)
                        .map(match => (
                          <div key={match.id} className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-red-100">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-red-500 text-white">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                                LIVE
                              </Badge>
                              <span className="text-sm text-gray-600">{match.venue}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-semibold">{match.homeTeam}</div>
                              <div className="text-2xl font-bold text-red-600">
                                {match.score ? `${match.score.home} - ${match.score.away}` : 'vs'}
                              </div>
                              <div className="text-lg font-semibold">{match.awayTeam}</div>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                <Play className="w-3 h-3 mr-1" />
                                Watch Live
                              </Button>
                              <Button size="sm" variant="outline">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Live Stats
                              </Button>
                            </div>
                          </div>
                        ))}
                      
                      {selectedTournament.schedule
                        .flatMap(day => day.matches)
                        .filter(match => !match.isLive).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No live matches at the moment</p>
                          <p className="text-sm">Check back during match times</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Live Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Tournament Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedTournament.stats.completedMatches}/{selectedTournament.stats.totalMatches}
                        </div>
                        <div className="text-sm text-gray-600">Matches Played</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedTournament.stats.totalGoals}
                        </div>
                        <div className="text-sm text-gray-600">Total Goals</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedTournament.stats.avgGoalsPerMatch}
                        </div>
                        <div className="text-sm text-gray-600">Avg Goals/Match</div>
                      </div>

                      {selectedTournament.stats.topScorer.name !== 'TBD' && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2">Top Scorer</h4>
                          <div className="text-center">
                            <div className="font-semibold">{selectedTournament.stats.topScorer.name}</div>
                            <div className="text-sm text-gray-600">{selectedTournament.stats.topScorer.team}</div>
                            <div className="text-lg font-bold text-yellow-600">
                              {selectedTournament.stats.topScorer.goals} goals
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedTournament.schedule.map(day => (
                      <div key={day.id}>
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-lg font-semibold">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <Badge variant="outline">{day.stage}</Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {day.matches.map(match => (
                            <div key={match.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-sm text-gray-600 min-w-16">{day.time}</div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold min-w-32 text-right">{match.homeTeam}</span>
                                    <span className="text-gray-400">vs</span>
                                    <span className="font-semibold min-w-32">{match.awayTeam}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  {match.score && (
                                    <div className="font-bold text-lg">
                                      {match.score.home} - {match.score.away}
                                    </div>
                                  )}
                                  <Badge className={
                                    match.status === 'live' ? 'bg-red-500' :
                                    match.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'
                                  }>
                                    {match.status === 'live' && <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>}
                                    {match.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="text-sm text-gray-600 mt-2 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {match.venue}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="standings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>League Standings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Pos</th>
                          <th className="text-left py-2 px-3">Team</th>
                          <th className="text-center py-2 px-3">Pld</th>
                          <th className="text-center py-2 px-3">W</th>
                          <th className="text-center py-2 px-3">D</th>
                          <th className="text-center py-2 px-3">L</th>
                          <th className="text-center py-2 px-3">GF</th>
                          <th className="text-center py-2 px-3">GA</th>
                          <th className="text-center py-2 px-3">GD</th>
                          <th className="text-center py-2 px-3 font-semibold">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTournament.leaderboard.map((team, index) => (
                          <tr key={index} className={`border-b hover:bg-gray-50 ${
                            index < 3 ? 'bg-green-50' : index >= selectedTournament.leaderboard.length - 3 ? 'bg-red-50' : ''
                          }`}>
                            <td className="py-2 px-3">
                              <div className="flex items-center">
                                <span className="font-semibold">{team.position}</span>
                                {index < 3 && <Medal className={`w-4 h-4 ml-2 ${
                                  index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-yellow-600'
                                }`} />}
                              </div>
                            </td>
                            <td className="py-2 px-3 font-semibold">{team.team}</td>
                            <td className="py-2 px-3 text-center">{team.played}</td>
                            <td className="py-2 px-3 text-center">{team.won}</td>
                            <td className="py-2 px-3 text-center">{team.drawn}</td>
                            <td className="py-2 px-3 text-center">{team.lost}</td>
                            <td className="py-2 px-3 text-center">{team.gf}</td>
                            <td className="py-2 px-3 text-center">{team.ga}</td>
                            <td className="py-2 px-3 text-center">{team.gd > 0 ? '+' : ''}{team.gd}</td>
                            <td className="py-2 px-3 text-center font-bold">{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{selectedTournament.stats.totalMatches}</div>
                    <div className="text-sm text-gray-600">Total Matches</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{selectedTournament.stats.totalGoals}</div>
                    <div className="text-sm text-gray-600">Total Goals</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{selectedTournament.stats.avgGoalsPerMatch}</div>
                    <div className="text-sm text-gray-600">Avg Goals/Match</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold">{selectedTournament.socialEngagement.followers}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Scorer */}
              {selectedTournament.stats.topScorer.name !== 'TBD' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Top Scorer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src="/api/placeholder/64/64" />
                        <AvatarFallback>{selectedTournament.stats.topScorer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold">{selectedTournament.stats.topScorer.name}</h3>
                        <p className="text-gray-600">{selectedTournament.stats.topScorer.team}</p>
                        <p className="text-2xl font-bold text-yellow-600">{selectedTournament.stats.topScorer.goals} Goals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Social Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Fan Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Likes</span>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-bold">{selectedTournament.socialEngagement.likes.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Shares</span>
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-blue-500" />
                          <span className="font-bold">{selectedTournament.socialEngagement.shares.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Comments</span>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          <span className="font-bold">{selectedTournament.socialEngagement.comments.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Followers</span>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span className="font-bold">{selectedTournament.socialEngagement.followers.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-2">
                      <Button className="flex-1">
                        <Heart className="w-4 h-4 mr-2" />
                        Like
                      </Button>
                      <Button variant="outline" onClick={() => handleShare(selectedTournament)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Download Match Schedule
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Bell className="w-4 h-4 mr-2" />
                        Set Match Reminders
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Globe className="w-4 h-4 mr-2" />
                        View on Map
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Tournament
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredTournaments.map(tournament => (
            <Card 
              key={tournament.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
              onClick={() => setSelectedTournament(tournament)}
            >
              <div className="relative">
                <img
                  src={tournament.media.coverImage}
                  alt={tournament.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {tournament.featured && (
                    <Badge className="bg-yellow-500 text-black">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge className={getStatusColor(tournament.status)}>
                    {tournament.status}
                  </Badge>
                </div>
                {tournament.status === 'ONGOING' && (
                  <div className="absolute top-3 right-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{tournament.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tournament.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{tournament.location.region}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{tournament.participants.teams} teams</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline">{getTypeLabel(tournament.type)}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{tournament.socialEngagement.followers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
              <p className="text-gray-600">Try adjusting your search filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicTournamentPortal;