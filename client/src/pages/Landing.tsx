import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, Users, Calendar, Award, Shield, 
  MapPin, Ticket, Newspaper, Search, Globe2,
  Play, Clock, ArrowRight, ExternalLink, ChevronRight,
  Home, ListIcon, TableIcon, Building2, Image, FileText
} from "lucide-react";

export default function Landing() {
  // Mock data for today's matches
  const todayMatches = [
    { time: "14:30", teamA: "ABC United", teamB: "DEF Stars", venue: "Moi Annex", status: "live", score: "1-0" },
    { time: "16:45", teamB: "JKL Warriors", teamA: "GHI Rovers", venue: "Eldoret Stadium", status: "upcoming" },
  ];

  // Mock standings data
  const standings = [
    { pos: 1, team: "ABC United", p: 10, w: 6, d: 3, l: 1, gf: 18, ga: 10, gd: 8, pts: 21 },
    { pos: 2, team: "GHI Stars", p: 10, w: 6, d: 2, l: 2, gf: 16, ga: 9, gd: 7, pts: 20 },
    { pos: 3, team: "DEF Stars", p: 10, w: 5, d: 3, l: 2, gf: 14, ga: 11, gd: 3, pts: 18 },
    { pos: 4, team: "JKL Warriors", p: 10, w: 4, d: 4, l: 2, gf: 12, ga: 10, gd: 2, pts: 16 },
    { pos: 5, team: "MNO City", p: 10, w: 3, d: 2, l: 5, gf: 10, ga: 15, gd: -5, pts: 11 },
  ];

  // Mock news items
  const newsItems = [
    { title: "Governor's Cup Quarter-Finals Draw Announced", date: "20 Nov 2025", category: "Tournament" },
    { title: "Record Attendance at Women's Derby Match", date: "19 Nov 2025", category: "Match Report" },
    { title: "Youth Development Program Launches in 10 Counties", date: "18 Nov 2025", category: "Community" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="h-8 w-8 text-primary" data-testid="icon-logo" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-background animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-lg" data-testid="text-app-name">Jamii Sports</h1>
                <p className="text-xs text-muted-foreground">Live Tournament Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                <Globe2 className="h-4 w-4 mr-1" />
                EN
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                <Search className="h-4 w-4" />
              </Button>
              <Button asChild data-testid="button-login" className="bg-primary hover:bg-primary/90">
                <a href="/auth/login">Sign In</a>
              </Button>
            </div>
          </div>

          {/* Main Nav */}
          <nav className="border-t">
            <div className="flex items-center gap-1 overflow-x-auto py-2 text-sm">
              <Button variant="ghost" size="sm" className="shrink-0">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Trophy className="h-4 w-4 mr-1" />
                Competitions
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Calendar className="h-4 w-4 mr-1" />
                Fixtures
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0">
                <ListIcon className="h-4 w-4 mr-1" />
                Results
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0">
                <TableIcon className="h-4 w-4 mr-1" />
                Standings
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Users className="h-4 w-4 mr-1" />
                Teams
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Building2 className="h-4 w-4 mr-1" />
                Venues
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Ticket className="h-4 w-4 mr-1" />
                Tickets
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Newspaper className="h-4 w-4 mr-1" />
                News
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero - Featured Competition */}
        <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
          <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-red-500/90 text-white border-0 animate-pulse">
                <Play className="h-3 w-3 mr-1" />
                NOW LIVE
              </Badge>
              
              <h2 className="text-4xl md:text-6xl font-extrabold mb-4" data-testid="text-hero-title">
                Governor's Cup 2025
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                47 Counties • 200+ Teams • Live Coverage
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Fixtures
                </Button>
                <Button size="lg" variant="outline" className="text-lg">
                  <Ticket className="mr-2 h-5 w-5" />
                  Buy Tickets
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Today's Matches */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Today's Matches
              </h3>
              <Button variant="link" className="text-primary">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {todayMatches.map((match, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{match.time}</span>
                      </div>
                      {match.status === "live" && (
                        <Badge className="bg-red-500 text-white border-0 animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full mr-2" />
                          LIVE
                        </Badge>
                      )}
                      {match.status === "upcoming" && (
                        <Badge variant="outline">Upcoming</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center mb-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{match.teamA}</p>
                      </div>
                      
                      {match.status === "live" && match.score ? (
                        <div className="text-center px-4">
                          <p className="text-2xl font-bold text-primary">{match.score}</p>
                        </div>
                      ) : (
                        <div className="text-center px-4">
                          <p className="text-xl font-bold text-muted-foreground">vs</p>
                        </div>
                      )}
                      
                      <div className="text-left">
                        <p className="font-bold text-lg">{match.teamB}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.venue}
                      </div>
                      <Button variant="link" size="sm" className="h-auto p-0">
                        Match Details
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Standings Snapshot */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Governor's Cup - Standings
              </h3>
              <Button variant="link" className="text-primary">
                Full Table
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr className="text-sm">
                        <th className="text-left p-3 font-semibold">#</th>
                        <th className="text-left p-3 font-semibold">Team</th>
                        <th className="text-center p-3 font-semibold">P</th>
                        <th className="text-center p-3 font-semibold hidden sm:table-cell">W</th>
                        <th className="text-center p-3 font-semibold hidden sm:table-cell">D</th>
                        <th className="text-center p-3 font-semibold hidden sm:table-cell">L</th>
                        <th className="text-center p-3 font-semibold hidden md:table-cell">GF</th>
                        <th className="text-center p-3 font-semibold hidden md:table-cell">GA</th>
                        <th className="text-center p-3 font-semibold">GD</th>
                        <th className="text-center p-3 font-semibold font-bold">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team) => (
                        <tr key={team.pos} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{team.pos}</td>
                          <td className="p-3 font-semibold">{team.team}</td>
                          <td className="text-center p-3">{team.p}</td>
                          <td className="text-center p-3 hidden sm:table-cell">{team.w}</td>
                          <td className="text-center p-3 hidden sm:table-cell">{team.d}</td>
                          <td className="text-center p-3 hidden sm:table-cell">{team.l}</td>
                          <td className="text-center p-3 hidden md:table-cell">{team.gf}</td>
                          <td className="text-center p-3 hidden md:table-cell">{team.ga}</td>
                          <td className="text-center p-3 font-medium">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                          <td className="text-center p-3 font-bold text-primary">{team.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* News & Updates */}
        <section className="py-12 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-primary" />
                Latest News
              </h3>
              <Button variant="link" className="text-primary">
                All News
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {newsItems.map((item, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{item.category}</Badge>
                    <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{item.date}</p>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      Read More
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Access Cards */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold mb-6 text-center">Explore Jamii Sports</h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold mb-1">Competitions</h4>
                  <p className="text-sm text-muted-foreground">Browse active tournaments</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold mb-1">Teams</h4>
                  <p className="text-sm text-muted-foreground">Discover team profiles</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold mb-1">Venues</h4>
                  <p className="text-sm text-muted-foreground">Find match locations</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Image className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold mb-1">Gallery</h4>
                  <p className="text-sm text-muted-foreground">View match photos</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Find Your County */}
        <section className="py-12 bg-gradient-to-br from-primary/10 to-primary/5 border-y">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Find Your County Competition</h3>
            <p className="text-muted-foreground mb-6">
              Discover tournaments, teams, and players from all 47 counties across Kenya
            </p>
            <Button size="lg" variant="outline" className="bg-background">
              <MapPin className="mr-2 h-5 w-5" />
              Browse by County
            </Button>
          </div>
        </section>

        {/* Organizer CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-3xl font-bold mb-4">Are you a Tournament Organizer?</h3>
            <p className="text-lg mb-8 opacity-90">
              Manage tournaments, fixtures, teams, and players with our comprehensive platform. 
              Real-time updates, automated standings, and professional reporting tools.
            </p>
            <Button size="lg" variant="secondary" asChild data-testid="button-organizer-signin">
              <a href="/auth/login">
                Sign In to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Jamii Sports</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Kenya's premier sports tournament management and live coverage platform.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Globe2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Competitions</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Fixtures & Results</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Standings</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Teams</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Venues</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">News & Updates</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Media Kit</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Regulations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sponsorship</a></li>
              </ul>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p data-testid="text-footer">
              © 2025 Jamii Sports. All rights reserved. Built for Kenyan Sports.
            </p>
            <p className="text-xs">
              Player privacy protected • No residential data collected
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
