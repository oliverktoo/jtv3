import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TrainingSession {
  id: string;
  title: string;
  type: 'Fitness' | 'Technical' | 'Tactical' | 'Recovery' | 'Match Prep';
  date: string;
  time: string;
  duration: string;
  location: string;
  coach: string;
  attendance: number;
  totalPlayers: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  focus: string[];
  notes?: string;
}

interface Player {
  id: string;
  name: string;
  position: string;
  attendance: number;
  fitnessLevel: number;
  technicalRating: number;
  tacticalRating: number;
  lastInjury?: string;
  trainingLoad: 'Light' | 'Moderate' | 'High';
}

interface TrainingPlan {
  id: string;
  name: string;
  duration: string;
  objective: string;
  phase: 'Pre-Season' | 'In-Season' | 'Off-Season';
  progress: number;
  sessions: number;
}

export default function TrainingManagement() {
  const trainingSessions: TrainingSession[] = [
    {
      id: '1',
      title: 'Match Preparation - Machakos United',
      type: 'Match Prep',
      date: '2024-11-16',
      time: '10:00',
      duration: '90 mins',
      location: 'Training Ground A',
      coach: 'John Kamau',
      attendance: 26,
      totalPlayers: 28,
      status: 'In Progress',
      focus: ['Set Pieces', 'Pressing', 'Final Third'],
      notes: 'Focus on defensive shape and quick transitions'
    },
    {
      id: '2',
      title: 'Technical Skills Development',
      type: 'Technical',
      date: '2024-11-17',
      time: '15:00',
      duration: '75 mins',
      location: 'Training Ground B',
      coach: 'Peter Njoroge',
      attendance: 0,
      totalPlayers: 28,
      status: 'Scheduled',
      focus: ['Ball Control', 'Passing', 'Finishing'],
      notes: 'Individual skill work with young players'
    },
    {
      id: '3',
      title: 'Recovery Session',
      type: 'Recovery',
      date: '2024-11-18',
      time: '09:00',
      duration: '45 mins',
      location: 'Gym & Pool',
      coach: 'Mary Wanjiku',
      attendance: 28,
      totalPlayers: 28,
      status: 'Completed',
      focus: ['Light Cardio', 'Stretching', 'Massage'],
      notes: 'Post-match recovery protocol'
    }
  ];

  const players: Player[] = [
    { id: '1', name: 'James Wanjiku', position: 'GK', attendance: 95, fitnessLevel: 92, technicalRating: 8.5, tacticalRating: 8.2, trainingLoad: 'Moderate' },
    { id: '2', name: 'Michael Otieno', position: 'CB', attendance: 88, fitnessLevel: 89, technicalRating: 7.8, tacticalRating: 8.8, trainingLoad: 'High' },
    { id: '3', name: 'David Kimani', position: 'CM', attendance: 0, fitnessLevel: 65, technicalRating: 9.1, tacticalRating: 8.9, lastInjury: 'Knee injury', trainingLoad: 'Light' },
    { id: '4', name: 'Samuel Ochieng', position: 'ST', attendance: 92, fitnessLevel: 94, technicalRating: 8.7, tacticalRating: 8.0, trainingLoad: 'High' },
  ];

  const trainingPlans: TrainingPlan[] = [
    { id: '1', name: 'Governor\'s Cup Preparation', duration: '3 weeks', objective: 'Match fitness and tactical preparation', phase: 'In-Season', progress: 78, sessions: 12 },
    { id: '2', name: 'Youth Development Program', duration: '8 weeks', objective: 'Technical skill enhancement', phase: 'In-Season', progress: 45, sessions: 24 },
    { id: '3', name: 'Injury Prevention Protocol', duration: 'Ongoing', objective: 'Reduce injury risk and improve recovery', phase: 'In-Season', progress: 100, sessions: 0 },
  ];

  const getSessionStatusColor = (status: TrainingSession['status']) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionTypeColor = (type: TrainingSession['type']) => {
    switch (type) {
      case 'Fitness': return 'bg-red-100 text-red-800';
      case 'Technical': return 'bg-blue-100 text-blue-800';
      case 'Tactical': return 'bg-purple-100 text-purple-800';
      case 'Recovery': return 'bg-green-100 text-green-800';
      case 'Match Prep': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrainingLoadColor = (load: Player['trainingLoad']) => {
    switch (load) {
      case 'Light': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Training Management</h1>
          <p className="text-muted-foreground">Plan, monitor, and analyze team training sessions and player development</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Training Report</Button>
          <Button>➕ New Session</Button>
        </div>
      </div>

      {/* Training Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">This Week</CardDescription>
              <CardTitle className="text-2xl font-bold">8</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">Training sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Avg Attendance</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">94%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">26.3/28 players</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Squad Fitness</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">88%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">Team average</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Training Load</CardDescription>
              <CardTitle className="text-2xl font-bold text-orange-600">Mod</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">This week's intensity</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Training Schedule</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">📅 Calendar</Button>
                  <Button variant="outline" size="sm">📋 Plan Session</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingSessions.map(session => (
                  <div key={session.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{session.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {session.date} • {session.time} • {session.duration}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.location} • Coach: {session.coach}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getSessionTypeColor(session.type)} variant="secondary">
                          {session.type}
                        </Badge>
                        <Badge className={getSessionStatusColor(session.status)} variant="secondary">
                          {session.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Session Focus Areas */}
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">Focus Areas:</div>
                      <div className="flex flex-wrap gap-1">
                        {session.focus.map(focus => (
                          <Badge key={focus} variant="outline" className="text-xs">
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Attendance */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Attendance: </span>
                        <span className={`font-bold ${getAttendanceColor((session.attendance / session.totalPlayers) * 100)}`}>
                          {session.attendance}/{session.totalPlayers}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({Math.round((session.attendance / session.totalPlayers) * 100)}%)
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">📋 Details</Button>
                        <Button variant="outline" size="sm">✏️ Edit</Button>
                      </div>
                    </div>

                    {/* Notes */}
                    {session.notes && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <strong>Notes:</strong> {session.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Player Training Status */}
          <Card>
            <CardHeader>
              <CardTitle>Player Training Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {players.map(player => (
                  <div key={player.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{player.name}</h4>
                        <div className="text-sm text-muted-foreground">{player.position}</div>
                        {player.lastInjury && (
                          <div className="text-xs text-red-600 mt-1">⚕️ {player.lastInjury}</div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getTrainingLoadColor(player.trainingLoad)} variant="secondary">
                          {player.trainingLoad} Load
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Attendance</div>
                        <div className={`font-bold ${getAttendanceColor(player.attendance)}`}>
                          {player.attendance}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Fitness</div>
                        <div className="font-bold">{player.fitnessLevel}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Technical</div>
                        <div className="font-bold">{player.technicalRating}/10</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Tactical</div>
                        <div className="font-bold">{player.tacticalRating}/10</div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="outline" size="sm">📊 Progress</Button>
                      <Button variant="outline" size="sm">📋 Plan</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <Button variant="outline">View All Players (24 more)</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Training Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Active Training Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingPlans.map(plan => (
                  <div key={plan.id} className="p-3 border rounded-lg">
                    <div className="mb-2">
                      <h4 className="font-semibold text-sm">{plan.name}</h4>
                      <div className="text-xs text-muted-foreground">{plan.duration} • {plan.phase}</div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-xs text-muted-foreground mb-1">Progress</div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{width: `${plan.progress}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{plan.progress}% complete</div>
                    </div>
                    
                    <div className="text-xs">
                      <div><strong>Objective:</strong> {plan.objective}</div>
                      {plan.sessions > 0 && (
                        <div><strong>Sessions:</strong> {plan.sessions}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                📋 Create New Plan
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Training Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Sessions This Month:</span>
                  <span className="font-bold">32</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Session Duration:</span>
                  <span className="font-bold">78 mins</span>
                </div>
                <div className="flex justify-between">
                  <span>Injury Rate:</span>
                  <span className="font-bold text-green-600">7%</span>
                </div>
                <div className="flex justify-between">
                  <span>Fitness Improvement:</span>
                  <span className="font-bold text-green-600">+5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Technical Growth:</span>
                  <span className="font-bold text-blue-600">+0.3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader>
              <CardTitle>Training Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Training Ground A</span>
                  <Badge className="bg-green-100 text-green-800" variant="secondary">Available</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Training Ground B</span>
                  <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">In Use</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Gym & Fitness</span>
                  <Badge className="bg-green-100 text-green-800" variant="secondary">Available</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Swimming Pool</span>
                  <Badge className="bg-blue-100 text-blue-800" variant="secondary">Reserved</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                  <div className="font-medium text-sm">Match Prep</div>
                  <div className="text-xs text-muted-foreground">Today 10:00 AM</div>
                </div>
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <div className="font-medium text-sm">Technical Skills</div>
                  <div className="text-xs text-muted-foreground">Tomorrow 3:00 PM</div>
                </div>
                <div className="p-3 border-l-4 border-green-500 bg-green-50">
                  <div className="font-medium text-sm">Recovery Session</div>
                  <div className="text-xs text-muted-foreground">Mon 9:00 AM</div>
                </div>
                <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                  <div className="font-medium text-sm">Tactical Workshop</div>
                  <div className="text-xs text-muted-foreground">Tue 2:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Training Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-sm text-red-800">⚠️ Low Attendance</div>
                  <div className="text-xs text-red-600">David Kimani - Extended absence</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-sm text-yellow-800">📋 Plan Review</div>
                  <div className="text-xs text-yellow-600">Youth program evaluation due</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-sm text-blue-800">🏆 Milestone</div>
                  <div className="text-xs text-blue-600">500 training sessions completed!</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}