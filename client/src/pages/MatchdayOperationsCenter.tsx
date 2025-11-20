import React, { useState } from "react";
import { 
  Activity,
  CheckSquare,
  Play,
  Flag,
  FileText,
  Clock,
  Users,
  Timer,
  AlertTriangle,
  Settings,
  Calendar,
  MapPin,
  BarChart3,
  Pause,
  Plus,
  Save,
  Send,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Award,
  TrendingUp,
  RefreshCw,
  Share2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export default function MatchdayOperationsCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLive, setIsLive] = useState(true);
  const [matchTime, setMatchTime] = useState("67'");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [newEventType, setNewEventType] = useState("");
  
  // Enhanced match data
  const currentMatch = {
    id: "match-001",
    name: "Governor's Cup Final",
    homeTeam: "Nairobi FC",
    awayTeam: "Kiambu United",
    homeScore: 2,
    awayScore: 1,
    date: "November 15, 2025",
    time: "15:00",
    venue: "Kasarani Stadium",
    competition: "Governor's Cup 2025",
    status: isLive ? "LIVE" : "SCHEDULED",
    weather: "Clear, 24°C",
    attendance: 55000,
    capacity: 60000
  };

  // Match events with enhanced structure
  const [matchEvents, setMatchEvents] = useState([
    { 
      id: "1", 
      minute: 67, 
      event: "Yellow Card", 
      player: "John Doe", 
      team: "Nairobi FC", 
      time: "67'", 
      description: "Unsporting behavior - dissent",
      severity: "warning" as const,
      icon: "🟨"
    },
    { 
      id: "2", 
      minute: 63, 
      event: "Goal", 
      player: "Mike Smith", 
      team: "Kiambu United", 
      time: "63'", 
      description: "Header from corner kick - assisted by Peter Wilson",
      severity: "goal" as const,
      icon: "⚽"
    },
    { 
      id: "3", 
      minute: 45, 
      event: "Goal", 
      player: "Peter Jones", 
      team: "Nairobi FC", 
      time: "45'", 
      description: "Right foot shot from outside the box",
      severity: "goal" as const,
      icon: "⚽"
    },
    { 
      id: "4", 
      minute: 35, 
      event: "Substitution", 
      player: "David Kim → Samuel Weru", 
      team: "Nairobi FC", 
      time: "35'", 
      description: "Tactical substitution - injury prevention",
      severity: "info" as const,
      icon: "🔄"
    }
  ]);

  // Match officials
  const officials = [
    { id: "1", name: "James Mwangi", role: "Referee", status: "confirmed", experience: "FIFA Level", contact: "+254-XXX-XXXX" },
    { id: "2", name: "Sarah Njeri", role: "Assistant Referee 1", status: "confirmed", experience: "CAF Level", contact: "+254-XXX-XXXX" },
    { id: "3", name: "John Kiprotich", role: "Assistant Referee 2", status: "confirmed", experience: "CAF Level", contact: "+254-XXX-XXXX" },
    { id: "4", name: "Mary Wanjiku", role: "Fourth Official", status: "confirmed", experience: "National Level", contact: "+254-XXX-XXXX" }
  ];

  // Pre-match checklist
  const [preMatchChecklist, setPreMatchChecklist] = useState([
    { id: "1", task: "Field inspection completed", status: "completed", assignee: "Ground Staff", priority: "high" },
    { id: "2", task: "Team sheets submitted", status: "completed", assignee: "Match Secretary", priority: "high" },
    { id: "3", task: "Officials briefing completed", status: "completed", assignee: "Referee", priority: "high" },
    { id: "4", task: "Security clearance obtained", status: "completed", assignee: "Security Chief", priority: "high" },
    { id: "5", task: "Medical team on standby", status: "completed", assignee: "Medical Officer", priority: "medium" },
    { id: "6", task: "Broadcast setup completed", status: "in-progress", assignee: "Media Team", priority: "medium" },
    { id: "7", task: "VIP arrangements finalized", status: "pending", assignee: "Protocol Team", priority: "low" }
  ]);

  // Post-match tasks
  const [postMatchTasks, setPostMatchTasks] = useState([
    { id: "1", task: "Match report compilation", status: "pending", deadline: "2 hours", priority: "high" },
    { id: "2", task: "Statistical data verification", status: "pending", deadline: "1 hour", priority: "high" },
    { id: "3", task: "Disciplinary incidents review", status: "pending", deadline: "24 hours", priority: "medium" },
    { id: "4", task: "Media interviews coordination", status: "pending", deadline: "30 minutes", priority: "medium" },
    { id: "5", task: "Financial settlement", status: "pending", deadline: "48 hours", priority: "low" }
  ]);

  const getEventBadgeVariant = (severity: string) => {
    switch (severity) {
      case "goal": return "default";
      case "warning": return "destructive";
      case "info": return "secondary";
      default: return "outline";
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress": return <Clock className="w-4 h-4 text-yellow-600" />;
      case "pending": return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const addMatchEvent = (eventData: any) => {
    const newEvent = {
      id: `event-${Date.now()}`,
      minute: parseInt(matchTime.replace("'", "")),
      time: matchTime,
      ...eventData,
      description: eventData.description || "",
      severity: eventData.severity || "info"
    };
    setMatchEvents([newEvent, ...matchEvents]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Matchday Operations Center</h1>
          <p className="text-muted-foreground">
            Complete matchday management and live control system
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              🔴 LIVE
            </Badge>
          )}
          <div className="text-right">
            <div className="text-2xl font-bold">{matchTime}</div>
            <div className="text-sm text-muted-foreground">Match Time</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Current Match Overview Card */}
      <div className="mb-8">
        <Card className={isLive ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Match Score */}
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">{currentMatch.name}</h2>
                <div className="flex justify-center items-center gap-8 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-medium">{currentMatch.homeTeam}</div>
                    <div className="text-4xl font-bold text-primary">{currentMatch.homeScore}</div>
                  </div>
                  <div className="text-2xl text-muted-foreground">-</div>
                  <div className="text-center">
                    <div className="text-lg font-medium">{currentMatch.awayTeam}</div>
                    <div className="text-4xl font-bold text-primary">{currentMatch.awayScore}</div>
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{currentMatch.date} • {currentMatch.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{currentMatch.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{currentMatch.competition}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{currentMatch.attendance.toLocaleString()} / {currentMatch.capacity.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{officials.filter(o => o.status === 'confirmed').length}</div>
                  <div className="text-xs text-muted-foreground">Officials Ready</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{matchEvents.length}</div>
                  <div className="text-xs text-muted-foreground">Match Events</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{preMatchChecklist.filter(t => t.status === 'completed').length}/{preMatchChecklist.length}</div>
                  <div className="text-xs text-muted-foreground">Pre-Match</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{Math.round((currentMatch.attendance / currentMatch.capacity) * 100)}%</div>
                  <div className="text-xs text-muted-foreground">Capacity</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pre-match" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Pre-Match
          </TabsTrigger>
          <TabsTrigger value="live-control" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Live Control
          </TabsTrigger>
          <TabsTrigger value="officials" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Officials
          </TabsTrigger>
          <TabsTrigger value="post-match" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Post-Match
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Match Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pre-Match Preparation</span>
                  <Progress value={85} className="w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Officials Assignment</span>
                  <Progress value={100} className="w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Venue Preparation</span>
                  <Progress value={95} className="w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Safety & Security</span>
                  <Progress value={100} className="w-24" />
                </div>
              </CardContent>
            </Card>

            {/* Key Personnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Key Personnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {officials.slice(0, 4).map((official) => (
                  <div key={official.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{official.name}</div>
                      <div className="text-xs text-muted-foreground">{official.role}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {official.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {matchEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 bg-muted rounded">
                    <Badge variant="outline" className="text-xs min-w-12">{event.time}</Badge>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{event.event}</div>
                      <div className="text-xs text-muted-foreground">{event.player} - {event.team}</div>
                    </div>
                    <span className="text-lg">{event.icon}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Match Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Previous Match</h4>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Nakuru FC vs Eldoret City</p>
                  <p className="text-sm">Final: 1-2 • 13:00</p>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Current Match</h4>
                    <Badge variant="destructive">LIVE</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{currentMatch.homeTeam} vs {currentMatch.awayTeam}</p>
                  <p className="text-sm">Live: {currentMatch.homeScore}-{currentMatch.awayScore} • {currentMatch.time}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Next Match</h4>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Mombasa FC vs Thika United</p>
                  <p className="text-sm">Scheduled: 17:30</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRE-MATCH TAB */}
        <TabsContent value="pre-match" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Pre-Match Preparation</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Progress
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pre-Match Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Pre-Match Checklist</CardTitle>
                <CardDescription>
                  Complete all tasks before match start
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {preMatchChecklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex items-center">
                      {getTaskStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.task}</div>
                      <div className="text-xs text-muted-foreground">
                        Assigned: {item.assignee} • Priority: {item.priority}
                      </div>
                    </div>
                    <Badge variant={
                      item.priority === 'high' ? 'destructive' : 
                      item.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team Information */}
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>
                  Submitted team sheets and player details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">{currentMatch.homeTeam}</h4>
                    <div className="space-y-1 text-sm">
                      <div>Players: 18/18 ✓</div>
                      <div>Officials: 4/4 ✓</div>
                      <div>Medical: Ready ✓</div>
                      <div>Equipment: Checked ✓</div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">{currentMatch.awayTeam}</h4>
                    <div className="space-y-1 text-sm">
                      <div>Players: 18/18 ✓</div>
                      <div>Officials: 4/4 ✓</div>
                      <div>Medical: Ready ✓</div>
                      <div>Equipment: Checked ✓</div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h5 className="font-medium">Match Preparation Status</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Field Inspection:</span>
                      <Badge variant="secondary">Complete</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Weather Check:</span>
                      <Badge variant="secondary">Clear</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Brief:</span>
                      <Badge variant="secondary">Complete</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Media Setup:</span>
                      <Badge variant="outline">In Progress</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Venue Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Venue & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl mb-2">☀️</div>
                  <div className="font-semibold">Weather</div>
                  <div className="text-sm text-muted-foreground">{currentMatch.weather}</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl mb-2">🏟️</div>
                  <div className="font-semibold">Field</div>
                  <div className="text-sm text-muted-foreground">Natural Grass - Excellent</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-semibold">Expected Attendance</div>
                  <div className="text-sm text-muted-foreground">{currentMatch.attendance.toLocaleString()}</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="font-semibold">Security</div>
                  <div className="text-sm text-muted-foreground">Level 2 - High Profile</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LIVE CONTROL TAB */}
        <TabsContent value="live-control" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Live Match Control</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={isLive} onCheckedChange={setIsLive} />
                <Label>Live Mode</Label>
              </div>
              <Button variant={isLive ? "destructive" : "default"}>
                {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isLive ? "Pause" : "Start"} Match
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Match Control Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Match Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="match-time">Match Time</Label>
                    <Input 
                      id="match-time" 
                      value={matchTime} 
                      onChange={(e) => setMatchTime(e.target.value)}
                      className="text-center text-lg font-bold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="period">Match Period</Label>
                    <Select defaultValue="second-half">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first-half">First Half</SelectItem>
                        <SelectItem value="half-time">Half Time</SelectItem>
                        <SelectItem value="second-half">Second Half</SelectItem>
                        <SelectItem value="extra-time">Extra Time</SelectItem>
                        <SelectItem value="penalties">Penalties</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Quick Actions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      ⚽ Goal
                    </Button>
                    <Button variant="outline" size="sm">
                      🟨 Yellow Card
                    </Button>
                    <Button variant="outline" size="sm">
                      🟥 Red Card
                    </Button>
                    <Button variant="outline" size="sm">
                      🔄 Substitution
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Add Match Event</Label>
                  <Select value={newEventType} onValueChange={setNewEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goal">Goal</SelectItem>
                      <SelectItem value="yellow-card">Yellow Card</SelectItem>
                      <SelectItem value="red-card">Red Card</SelectItem>
                      <SelectItem value="substitution">Substitution</SelectItem>
                      <SelectItem value="offside">Offside</SelectItem>
                      <SelectItem value="foul">Foul</SelectItem>
                      <SelectItem value="corner">Corner Kick</SelectItem>
                      <SelectItem value="free-kick">Free Kick</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input placeholder="Player name" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">{currentMatch.homeTeam}</SelectItem>
                      <SelectItem value="away">{currentMatch.awayTeam}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Textarea placeholder="Event description (optional)" rows={2} />
                  
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Events Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Live Events Feed</CardTitle>
                <CardDescription>
                  Real-time match events and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {matchEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Badge variant="outline" className="text-xs min-w-12">{event.time}</Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getEventBadgeVariant(event.severity)}>
                            {event.event}
                          </Badge>
                          <span className="text-lg">{event.icon}</span>
                        </div>
                        <div className="text-sm font-medium">{event.player}</div>
                        <div className="text-xs text-muted-foreground">{event.team}</div>
                        {event.description && (
                          <div className="text-xs text-muted-foreground mt-1">{event.description}</div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Live Match Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="font-semibold mb-3">{currentMatch.homeTeam}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Possession</span>
                      <span className="font-semibold">58%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shots</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shots on Target</span>
                      <span className="font-semibold">6</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Corners</span>
                      <span className="font-semibold">4</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fouls</span>
                      <span className="font-semibold">8</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="font-semibold mb-3">Match Stats</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Ball Possession</div>
                      <div className="flex">
                        <div className="bg-blue-500 h-2 rounded-l" style={{ width: '58%' }}></div>
                        <div className="bg-red-500 h-2 rounded-r" style={{ width: '42%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>58%</span>
                        <span>42%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Shots on Target</div>
                      <div className="flex">
                        <div className="bg-blue-500 h-2 rounded-l" style={{ width: '67%' }}></div>
                        <div className="bg-red-500 h-2 rounded-r" style={{ width: '33%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>6</span>
                        <span>3</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="font-semibold mb-3">{currentMatch.awayTeam}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Possession</span>
                      <span className="font-semibold">42%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shots</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shots on Target</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Corners</span>
                      <span className="font-semibold">2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fouls</span>
                      <span className="font-semibold">6</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OFFICIALS TAB */}
        <TabsContent value="officials" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Match Officials</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Assign Officials
              </Button>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send Instructions
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Officials List */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Officials</CardTitle>
                <CardDescription>
                  Complete officiating team for this match
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {officials.map((official) => (
                  <div key={official.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <Flag className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{official.name}</div>
                      <div className="text-sm text-muted-foreground">{official.role}</div>
                      <div className="text-xs text-muted-foreground">
                        {official.experience} • {official.contact}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        official.status === 'confirmed' ? 'default' : 'outline'
                      }>
                        {official.status}
                      </Badge>
                      <div className="mt-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Officials Communication */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Center</CardTitle>
                <CardDescription>
                  Send updates and instructions to officials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="message-type">Message Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select message type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instruction">Match Instructions</SelectItem>
                      <SelectItem value="update">Status Update</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Officials</SelectItem>
                      <SelectItem value="referee">Referee Only</SelectItem>
                      <SelectItem value="assistants">Assistant Referees</SelectItem>
                      <SelectItem value="fourth">Fourth Official</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Type your message here..."
                    rows={4}
                  />
                </div>

                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>

                <Separator />

                <div>
                  <h5 className="font-medium mb-3">Recent Communications</h5>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded text-sm">
                      <div className="font-medium">Match Instructions Sent</div>
                      <div className="text-muted-foreground">To: All Officials • 1 hour ago</div>
                    </div>
                    <div className="p-3 bg-muted rounded text-sm">
                      <div className="font-medium">Pre-Match Briefing Reminder</div>
                      <div className="text-muted-foreground">To: All Officials • 2 hours ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Officials Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Officials Performance & History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {officials.map((official) => (
                  <div key={official.id} className="p-4 border rounded-lg text-center">
                    <div className="font-semibold mb-2">{official.name}</div>
                    <div className="text-sm text-muted-foreground mb-3">{official.role}</div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Matches This Season</div>
                        <div className="font-semibold">24</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Average Rating</div>
                        <div className="font-semibold">8.5/10</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Experience</div>
                        <div className="font-semibold">{official.experience}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POST-MATCH TAB */}
        <TabsContent value="post-match" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Post-Match Processing</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Submit Results
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Post-Match Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Post-Match Tasks</CardTitle>
                <CardDescription>
                  Complete all required post-match procedures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {postMatchTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex items-center">
                      {getTaskStatusIcon(task.status)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{task.task}</div>
                      <div className="text-xs text-muted-foreground">
                        Deadline: {task.deadline} • Priority: {task.priority}
                      </div>
                    </div>
                    <Badge variant={
                      task.priority === 'high' ? 'destructive' : 
                      task.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Match Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Match Summary</CardTitle>
                <CardDescription>
                  Final match results and key statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold mb-2">
                    {currentMatch.homeTeam} {currentMatch.homeScore} - {currentMatch.awayScore} {currentMatch.awayTeam}
                  </div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">Match Statistics</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>90' + 4' ET</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Goals:</span>
                        <span>3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cards:</span>
                        <span>🟨 3 🟥 0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subs:</span>
                        <span>6</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Attendance</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Tickets Sold:</span>
                        <span>52,450</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span>87.4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VIP:</span>
                        <span>98%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span>KES 2.1M</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Reports & Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">Match Report</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Official match report with events and statistics
                  </p>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Report
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold">Statistics</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Detailed match statistics and player performance
                  </p>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Stats
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold">Awards</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Man of the match and other recognitions
                  </p>
                  <Button variant="outline" className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    View Awards
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}