import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  Play,
  Share2,
  Bell,
  Heart,
  MessageSquare,
  Users,
  Calendar,
  MapPin,
  Trophy,
  Target,
  Zap,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  Settings,
  Download,
  Star
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface MobileTournamentViewProps {
  tournamentId: string;
}

const MobileTournamentView: React.FC<MobileTournamentViewProps> = ({
  tournamentId
}) => {
  const [activeView, setActiveView] = useState<'live' | 'scores' | 'standings' | 'feed'>('live');
  const [isLiveStreamFullscreen, setIsLiveStreamFullscreen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const { toast } = useToast();

  // Mock live data
  const [liveMatches] = useState([
    {
      id: 'live-1',
      homeTeam: { name: 'Nairobi Warriors', logo: '/api/placeholder/50/50', score: 2 },
      awayTeam: { name: 'Eastlands FC', logo: '/api/placeholder/50/50', score: 1 },
      time: '67\'',
      venue: 'Nyayo Stadium',
      viewers: 3420,
      isLive: true,
      events: [
        { time: '15\'', type: 'goal', player: 'J. Ochieng', team: 'home' },
        { time: '34\'', type: 'goal', player: 'M. Otieno', team: 'away' },
        { time: '58\'', type: 'goal', player: 'P. Wanjiku', team: 'home' }
      ]
    },
    {
      id: 'live-2', 
      homeTeam: { name: 'Kibera United', logo: '/api/placeholder/50/50', score: 0 },
      awayTeam: { name: 'Westlands FC', logo: '/api/placeholder/50/50', score: 0 },
      time: '22\'',
      venue: 'Nyayo Stadium - Pitch 2',
      viewers: 1890,
      isLive: true,
      events: []
    }
  ]);

  const [recentScores] = useState([
    {
      homeTeam: { name: 'Mathare Utd', score: 3 },
      awayTeam: { name: 'City Stars', score: 1 },
      status: 'FT',
      time: '2h ago'
    },
    {
      homeTeam: { name: 'Dandora FC', score: 2 },
      awayTeam: { name: 'Pipeline FC', score: 2 },
      status: 'FT',
      time: '4h ago'
    }
  ]);

  const [standings] = useState([
    { pos: 1, team: 'Nairobi Warriors', points: 15, gd: '+12' },
    { pos: 2, team: 'Eastlands FC', points: 12, gd: '+6' },
    { pos: 3, team: 'Kibera United', points: 10, gd: '+5' }
  ]);

  const [socialFeed] = useState([
    {
      id: 1,
      user: 'Football Kenya',
      avatar: '/api/placeholder/40/40',
      content: 'What a goal by J. Ochieng! Nairobi Warriors looking strong! ⚽🔥',
      likes: 234,
      comments: 45,
      time: '2m ago',
      type: 'post'
    },
    {
      id: 2,
      user: 'Sports Kenya',
      avatar: '/api/placeholder/40/40',
      content: 'Live: Nairobi Warriors 2-1 Eastlands FC. Thrilling match at Nyayo!',
      likes: 189,
      comments: 67,
      time: '5m ago',
      type: 'live-update'
    }
  ]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Live Tournament',
        text: 'Watch live tournament action!',
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

  const toggleNotifications = () => {
    setNotifications(!notifications);
    toast({
      title: notifications ? "Notifications Off" : "Notifications On",
      description: notifications 
        ? "You won't receive live updates" 
        : "You'll receive live match updates"
    });
  };

  const nextMatch = () => {
    setCurrentMatchIndex((prev) => (prev + 1) % liveMatches.length);
  };

  const prevMatch = () => {
    setCurrentMatchIndex((prev) => (prev - 1 + liveMatches.length) % liveMatches.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">🏆 Live Tournament</h1>
            <p className="text-sm text-blue-100">Nairobi Championship 2024</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={toggleNotifications}
            >
              <Bell className={`w-4 h-4 ${notifications ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="flex">
          {[
            { key: 'live', label: 'Live', icon: Play },
            { key: 'scores', label: 'Scores', icon: Target },
            { key: 'standings', label: 'Table', icon: Trophy },
            { key: 'feed', label: 'Feed', icon: MessageSquare }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex-1 flex flex-col items-center py-3 text-sm font-medium border-b-2 transition-colors ${
                activeView === key 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live View */}
      {activeView === 'live' && (
        <div className="p-4 space-y-4">
          {/* Live Stream Card */}
          <Card className="overflow-hidden">
            <div className="relative bg-black aspect-video">
              <img 
                src="/api/placeholder/400/225" 
                alt="Live Stream"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button className="bg-red-600 hover:bg-red-700 rounded-full p-4">
                  <Play className="w-6 h-6 fill-current" />
                </Button>
              </div>
              
              {/* Live indicator */}
              <div className="absolute top-3 left-3 flex items-center bg-red-600 text-white px-2 py-1 rounded">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-semibold">LIVE</span>
              </div>

              {/* Viewer count */}
              <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                <Users className="w-3 h-3 inline mr-1" />
                {liveMatches[currentMatchIndex]?.viewers.toLocaleString()}
              </div>

              {/* Controls */}
              <div className="absolute bottom-3 right-3 flex space-x-2">
                <Button size="sm" variant="ghost" className="text-white bg-black bg-opacity-50 hover:bg-opacity-70">
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white bg-black bg-opacity-50 hover:bg-opacity-70">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white bg-black bg-opacity-50 hover:bg-opacity-70">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Match Navigation */}
          {liveMatches.length > 1 && (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prevMatch}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Match {currentMatchIndex + 1} of {liveMatches.length}
              </span>
              <Button variant="outline" size="sm" onClick={nextMatch}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Live Match Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-red-500 text-white">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                  LIVE - {liveMatches[currentMatchIndex]?.time}
                </Badge>
                <span className="text-sm text-gray-600">{liveMatches[currentMatchIndex]?.venue}</span>
              </div>

              {/* Team Score Display */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={liveMatches[currentMatchIndex]?.homeTeam.logo} />
                    <AvatarFallback>{liveMatches[currentMatchIndex]?.homeTeam.name.split(' ')[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{liveMatches[currentMatchIndex]?.homeTeam.name}</div>
                    <div className="text-sm text-gray-600">Home</div>
                  </div>
                </div>
                
                <div className="text-center px-4">
                  <div className="text-3xl font-bold">
                    {liveMatches[currentMatchIndex]?.homeTeam.score} - {liveMatches[currentMatchIndex]?.awayTeam.score}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 flex-1 justify-end text-right">
                  <div>
                    <div className="font-semibold">{liveMatches[currentMatchIndex]?.awayTeam.name}</div>
                    <div className="text-sm text-gray-600">Away</div>
                  </div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={liveMatches[currentMatchIndex]?.awayTeam.logo} />
                    <AvatarFallback>{liveMatches[currentMatchIndex]?.awayTeam.name.split(' ')[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Recent Events */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Recent Events</h4>
                <div className="space-y-2">
                  {liveMatches[currentMatchIndex]?.events.slice(-3).reverse().map((event, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Target className="w-3 h-3 mr-2 text-green-600" />
                        <span>{event.player} - {event.time}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.type.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="flex flex-col items-center py-3">
              <Heart className="w-4 h-4 mb-1" />
              <span className="text-xs">Like</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center py-3">
              <MessageSquare className="w-4 h-4 mb-1" />
              <span className="text-xs">Comment</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center py-3">
              <Download className="w-4 h-4 mb-1" />
              <span className="text-xs">Highlights</span>
            </Button>
          </div>
        </div>
      )}

      {/* Scores View */}
      {activeView === 'scores' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Results</h2>
            <Button variant="outline" size="sm">Today</Button>
          </div>
          
          <div className="space-y-3">
            {recentScores.map((match, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{match.homeTeam.name}</span>
                        <span className="font-bold text-lg">{match.homeTeam.score}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{match.awayTeam.name}</span>
                        <span className="font-bold text-lg">{match.awayTeam.score}</span>
                      </div>
                    </div>
                    <div className="ml-4 text-center">
                      <Badge variant="outline">{match.status}</Badge>
                      <div className="text-xs text-gray-500 mt-1">{match.time}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Live Matches Section */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Live Now
            </h3>
            {liveMatches.map((match, index) => (
              <Card key={index} className="mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{match.homeTeam.name}</span>
                        <span className="font-bold text-lg text-red-600">{match.homeTeam.score}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{match.awayTeam.name}</span>
                        <span className="font-bold text-lg text-red-600">{match.awayTeam.score}</span>
                      </div>
                    </div>
                    <div className="ml-4 text-center">
                      <Badge className="bg-red-500 text-white">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
                        {match.time}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 w-full"
                        onClick={() => setActiveView('live')}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Watch
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Standings View */}
      {activeView === 'standings' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">League Table</h2>
            <Button variant="outline" size="sm">Group A</Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Pos</th>
                      <th className="text-left py-3 px-4 font-medium">Team</th>
                      <th className="text-center py-3 px-4 font-medium">Pts</th>
                      <th className="text-center py-3 px-4 font-medium">GD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="font-semibold">{team.pos}</span>
                            {index < 3 && <Star className={`w-3 h-3 ml-2 ${
                              index === 0 ? 'text-yellow-500' : 'text-gray-400'
                            }`} />}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{team.team}</td>
                        <td className="py-3 px-4 text-center font-bold">{team.points}</td>
                        <td className="py-3 px-4 text-center">{team.gd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Social Feed View */}
      {activeView === 'feed' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tournament Feed</h2>
            <Button variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-1" />
              Live
            </Button>
          </div>
          
          <div className="space-y-4">
            {socialFeed.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">{post.user}</span>
                        <span className="text-xs text-gray-500">{post.time}</span>
                        {post.type === 'live-update' && (
                          <Badge className="bg-red-500 text-white text-xs">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-xs">{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs">{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button for Quick Share */}
      <Button 
        className="fixed bottom-6 right-6 rounded-full p-4 shadow-lg bg-blue-600 hover:bg-blue-700"
        onClick={handleShare}
      >
        <Share2 className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default MobileTournamentView;