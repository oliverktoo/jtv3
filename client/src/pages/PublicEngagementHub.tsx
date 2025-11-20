import React, { useState } from "react";
import { 
  Home, 
  Trophy, 
  Play, 
  BarChart3, 
  MapPin, 
  Newspaper,
  Ticket,
  Users,
  Calendar,
  Star,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Share2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PublicEngagementHub() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Mock data
  const liveMatches = [
    {
      id: "1",
      homeTeam: "Nairobi FC",
      awayTeam: "Kiambu United",
      homeScore: 2,
      awayScore: 1,
      minute: "67'",
      status: "LIVE",
      competition: "Governor's Cup Final",
      venue: "Kasarani Stadium"
    },
    {
      id: "2", 
      homeTeam: "Nakuru FC",
      awayTeam: "Eldoret City",
      homeScore: 0,
      awayScore: 0,
      minute: "22'",
      status: "LIVE",
      competition: "League Match",
      venue: "Afraha Stadium"
    }
  ];

  const upcomingMatches = [
    {
      id: "3",
      homeTeam: "Mombasa FC",
      awayTeam: "Kisumu All Stars", 
      time: "16:45",
      date: "Today",
      competition: "Premier League",
      venue: "Mombasa Stadium"
    },
    {
      id: "4",
      homeTeam: "Thika United",
      awayTeam: "Nyeri FC",
      time: "14:00",
      date: "Tomorrow",
      competition: "Championship",
      venue: "Thika Stadium"
    }
  ];

  const competitions = [
    {
      name: "Governor's Cup 2025",
      category: "County Championship",
      status: "LIVE",
      teams: 32,
      matches: 63,
      progress: 85
    },
    {
      name: "Women's Premier League",
      category: "National League",
      status: "ACTIVE",
      teams: 16,
      matches: 240,
      progress: 60
    },
    {
      name: "Youth Championship",
      category: "Youth Tournament",
      status: "UPCOMING",
      teams: 24,
      matches: 47,
      progress: 0
    }
  ];

  const topScorers = [
    { rank: 1, name: "John Mburu", team: "Nairobi FC", goals: 18, matches: 12 },
    { rank: 2, name: "Peter Wanjiku", team: "Kiambu United", goals: 15, matches: 11 },
    { rank: 3, name: "David Ochieng", team: "Nakuru FC", goals: 14, matches: 13 },
    { rank: 4, name: "Samuel Kiptoo", team: "Eldoret City", goals: 12, matches: 10 },
    { rank: 5, name: "Michael Otieno", team: "Mombasa FC", goals: 11, matches: 12 }
  ];

  const venues = [
    {
      name: "Kasarani Stadium",
      location: "Nairobi",
      capacity: 60000,
      surface: "Natural Grass",
      facilities: ["VIP Boxes", "Media Center", "Parking", "Security"],
      upcomingEvents: 3
    },
    {
      name: "Nyayo Stadium",
      location: "Nairobi", 
      capacity: 30000,
      surface: "Artificial Turf",
      facilities: ["Media Center", "Parking", "Floodlights"],
      upcomingEvents: 2
    }
  ];

  const newsArticles = [
    {
      id: "1",
      title: "Governor's Cup Final: A Battle for Glory",
      excerpt: "Nairobi FC and Kiambu United are set to clash in what promises to be an electrifying final...",
      category: "Featured",
      author: "Sports Desk",
      time: "2 hours ago",
      featured: true
    },
    {
      id: "2", 
      title: "Women's League Sees Record Attendance",
      excerpt: "The women's premier league continues to break attendance records with passionate fan support...",
      category: "Match Reports",
      author: "Sarah Njeri",
      time: "4 hours ago",
      featured: false
    },
    {
      id: "3",
      title: "New Stadium Opens in Eldoret",
      excerpt: "The newly constructed Eldoret Sports Complex opens its doors to host championship matches...",
      category: "Announcements",
      author: "News Team",
      time: "1 day ago",
      featured: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Jamii Tourney Public Hub</h1>
          <p className="text-muted-foreground">
            Your gateway to Kenya's premier football tournaments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button>
            <Ticket className="w-4 h-4 mr-2" />
            Get Tickets
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="home" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Home
          </TabsTrigger>
          <TabsTrigger value="competitions" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Competitions
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Live Center
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Leaderboards
          </TabsTrigger>
          <TabsTrigger value="venues" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Venues
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            News
          </TabsTrigger>
        </TabsList>

        {/* Home Tab */}
        <TabsContent value="home" className="space-y-8">
          {/* Hero Section */}
          <section className="text-center py-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
            <h2 className="text-4xl font-bold mb-4">Welcome to Jamii Tourney</h2>
            <p className="text-xl text-muted-foreground mb-6">
              Kenya's Premier Tournament Management Platform
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setActiveTab("competitions")}>
                <Trophy className="w-4 h-4 mr-2" />
                View Competitions
              </Button>
              <Button variant="outline">
                <Ticket className="w-4 h-4 mr-2" />
                Buy Tickets
              </Button>
            </div>
          </section>

          {/* Live Matches Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Live Matches
              </h3>
              <Button variant="outline" onClick={() => setActiveTab("live")}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <Card key={match.id} className="border-red-200 bg-red-50">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{match.homeTeam} vs {match.awayTeam}</CardTitle>
                      <Badge variant="destructive">LIVE</Badge>
                    </div>
                    <CardDescription>{match.competition} • {match.venue}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <div className="text-lg text-muted-foreground">{match.minute}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Upcoming Matches */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Upcoming Matches</h3>
              <Button variant="outline" onClick={() => setActiveTab("competitions")}>
                View Schedule <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMatches.map((match) => (
                <Card key={match.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{match.homeTeam} vs {match.awayTeam}</CardTitle>
                    <CardDescription>{match.competition} • {match.venue}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">{match.date}</div>
                        <div className="font-semibold">{match.time}</div>
                      </div>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Quick Stats */}
          <section>
            <h3 className="text-2xl font-bold mb-6">Tournament Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                  <div className="text-sm text-muted-foreground">Active Competitions</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">340</div>
                  <div className="text-sm text-muted-foreground">Registered Teams</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-orange-600 mb-2">1,247</div>
                  <div className="text-sm text-muted-foreground">Total Matches</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">47</div>
                  <div className="text-sm text-muted-foreground">Counties Represented</div>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        {/* Competitions Tab */}
        <TabsContent value="competitions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Competitions</h2>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by county" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  <SelectItem value="nairobi">Nairobi</SelectItem>
                  <SelectItem value="kiambu">Kiambu</SelectItem>
                  <SelectItem value="nakuru">Nakuru</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{competition.name}</CardTitle>
                      <CardDescription>{competition.category}</CardDescription>
                    </div>
                    <Badge 
                      variant={competition.status === 'LIVE' ? 'destructive' : 'default'}
                      className={
                        competition.status === 'LIVE' ? '' :
                        competition.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {competition.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Teams:</span>
                        <div className="font-semibold">{competition.teams}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Matches:</span>
                        <div className="font-semibold">{competition.matches}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{competition.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${competition.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Center Tab */}
        <TabsContent value="live" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Live Center
            </h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Watch Stream
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Matches */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold">Live Matches</h3>
              {liveMatches.map((match) => (
                <Card key={match.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold">{match.homeTeam} vs {match.awayTeam}</h4>
                      <Badge variant="destructive">LIVE</Badge>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold mb-2">
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <div className="text-lg text-muted-foreground">{match.minute}</div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground text-center">
                      {match.competition} • {match.venue}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Feed */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Live Feed</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <div className="flex items-start gap-3 p-2 bg-red-50 rounded">
                      <Badge variant="outline" className="text-xs">67'</Badge>
                      <div className="flex-1 text-sm">
                        🟨 Yellow card - John Doe (Nairobi FC)
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-green-50 rounded">
                      <Badge variant="outline" className="text-xs">63'</Badge>
                      <div className="flex-1 text-sm">
                        ⚽ GOAL! Mike Smith (Kiambu United)
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                      <Badge variant="outline" className="text-xs">45'</Badge>
                      <div className="flex-1 text-sm">
                        ⚽ GOAL! Peter Jones (Nairobi FC)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Leaderboards</h2>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Competition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Competitions</SelectItem>
                  <SelectItem value="governors">Governor's Cup</SelectItem>
                  <SelectItem value="womens">Women's League</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025 Season</SelectItem>
                  <SelectItem value="2024">2024 Season</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Scorers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Top Goal Scorers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topScorers.map((player) => (
                    <div key={player.rank} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {player.rank}
                        </div>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-muted-foreground">{player.team}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{player.goals}</div>
                        <div className="text-xs text-muted-foreground">{player.matches} matches</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Standings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  League Standings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground p-2">
                    <div>Pos</div>
                    <div className="col-span-2">Team</div>
                    <div className="text-center">MP</div>
                    <div className="text-center">Pts</div>
                  </div>
                  {[
                    { pos: 1, team: "Nairobi FC", mp: 12, pts: 34 },
                    { pos: 2, team: "Kiambu United", mp: 11, pts: 28 },
                    { pos: 3, team: "Nakuru FC", mp: 13, pts: 26 },
                    { pos: 4, team: "Eldoret City", mp: 10, pts: 24 },
                    { pos: 5, team: "Mombasa FC", mp: 12, pts: 22 }
                  ].map((team) => (
                    <div key={team.pos} className="grid grid-cols-5 gap-2 p-2 hover:bg-muted rounded">
                      <div className="font-medium">{team.pos}</div>
                      <div className="col-span-2 font-medium">{team.team}</div>
                      <div className="text-center">{team.mp}</div>
                      <div className="text-center font-bold">{team.pts}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Venues Tab */}
        <TabsContent value="venues" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Venues</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search venues..." className="pl-10 w-64" />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by county" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  <SelectItem value="nairobi">Nairobi</SelectItem>
                  <SelectItem value="mombasa">Mombasa</SelectItem>
                  <SelectItem value="eldoret">Eldoret</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {venues.map((venue, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">{venue.name}</h3>
                    <p className="text-blue-100">{venue.location}</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <div className="font-semibold">{venue.capacity.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Surface:</span>
                      <div className="font-semibold">{venue.surface}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Facilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {venue.facilities.map((facility) => (
                        <Badge key={facility} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Upcoming events:</span>
                      <span className="font-semibold ml-1">{venue.upcomingEvents}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">News & Media</h2>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All News</SelectItem>
                  <SelectItem value="match-reports">Match Reports</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                  <SelectItem value="features">Player Features</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Story */}
          <Card className="overflow-hidden border-primary bg-primary/5">
            <div className="md:flex">
              <div className="md:w-1/2 h-64 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Featured Story</h3>
                  <p className="text-blue-100">Championship Final Preview</p>
                </div>
              </div>
              <div className="md:w-1/2 p-6">
                <Badge variant="default" className="mb-3">Featured</Badge>
                <h3 className="text-2xl font-bold mb-3">Governor's Cup Final: A Battle for Glory</h3>
                <p className="text-muted-foreground mb-4">
                  Nairobi FC and Kiambu United are set to clash in what promises to be 
                  an electrifying final at Kasarani Stadium...
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">By Sports Desk • 2 hours ago</span>
                  <Button variant="ghost" className="p-0">Read More →</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.filter(article => !article.featured).map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="h-48 bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Newspaper className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">News Article</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">{article.category}</Badge>
                  <h4 className="font-semibold mb-2 line-clamp-2">{article.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>By {article.author}</span>
                    <span>{article.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}