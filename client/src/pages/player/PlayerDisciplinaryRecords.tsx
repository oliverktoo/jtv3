import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DisciplinaryRecord {
  id: string;
  incidentDate: string;
  matchDetails: {
    tournament: string;
    opponent: string;
    matchDate: string;
    venue: string;
    referee: string;
  };
  offense: {
    type: 'Yellow Card' | 'Red Card' | 'Suspension' | 'Fine' | 'Warning' | 'Misconduct';
    severity: 'Minor' | 'Major' | 'Severe';
    description: string;
    category: 'On-Field' | 'Off-Field' | 'Administrative';
  };
  punishment: {
    type: 'Card Only' | 'Suspension' | 'Fine' | 'Community Service' | 'Training' | 'Warning';
    duration?: string;
    amount?: string;
    details: string;
    completed: boolean;
  };
  status: 'Active' | 'Completed' | 'Under Review' | 'Appealed' | 'Overturned';
  appealDetails?: {
    appealDate: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
    outcome?: string;
  };
  reportedBy: string;
  reviewedBy?: string;
  notes?: string;
}

interface DisciplinaryStats {
  totalIncidents: number;
  yellowCards: number;
  redCards: number;
  suspensions: number;
  fines: number;
  activeSuspensions: number;
  disciplinaryPoints: number;
  fairPlayRating: number;
}

interface BehaviorReport {
  id: string;
  reportDate: string;
  reportType: 'Positive' | 'Negative' | 'Neutral';
  reporter: string;
  category: 'Training' | 'Match' | 'Social' | 'Club Events' | 'Community';
  summary: string;
  details?: string;
  verified: boolean;
}

export default function PlayerDisciplinaryRecords() {
  const disciplinaryRecords: DisciplinaryRecord[] = [
    {
      id: '1',
      incidentDate: '2024-11-15',
      matchDetails: {
        tournament: 'Nairobi County Championship',
        opponent: 'Kasarani FC',
        matchDate: '2024-11-15',
        venue: 'Nairobi Stadium',
        referee: 'John Kiprotich'
      },
      offense: {
        type: 'Yellow Card',
        severity: 'Minor',
        description: 'Unsporting behavior - arguing with referee decision',
        category: 'On-Field'
      },
      punishment: {
        type: 'Card Only',
        details: 'Standard yellow card caution',
        completed: true
      },
      status: 'Completed',
      reportedBy: 'Match Referee',
      reviewedBy: 'Disciplinary Committee'
    },
    {
      id: '2',
      incidentDate: '2024-09-20',
      matchDetails: {
        tournament: 'Governor\'s Cup',
        opponent: 'Mathare United',
        matchDate: '2024-09-20',
        venue: 'City Stadium',
        referee: 'Mary Wanjiku'
      },
      offense: {
        type: 'Red Card',
        severity: 'Major',
        description: 'Serious foul play - dangerous tackle',
        category: 'On-Field'
      },
      punishment: {
        type: 'Suspension',
        duration: '2 matches',
        details: 'Two match suspension for serious foul play',
        completed: true
      },
      status: 'Completed',
      reportedBy: 'Match Referee',
      reviewedBy: 'Disciplinary Committee',
      appealDetails: {
        appealDate: '2024-09-22',
        status: 'Rejected',
        outcome: 'Original decision upheld'
      }
    },
    {
      id: '3',
      incidentDate: '2024-07-10',
      matchDetails: {
        tournament: 'Inter-County Cup',
        opponent: 'Kiambu FC',
        matchDate: '2024-07-10',
        venue: 'Thika Stadium',
        referee: 'James Ochieng'
      },
      offense: {
        type: 'Yellow Card',
        severity: 'Minor',
        description: 'Delay of game - time wasting',
        category: 'On-Field'
      },
      punishment: {
        type: 'Card Only',
        details: 'Standard caution for time wasting',
        completed: true
      },
      status: 'Completed',
      reportedBy: 'Match Referee'
    },
    {
      id: '4',
      incidentDate: '2024-03-15',
      matchDetails: {
        tournament: 'Training Session',
        opponent: 'N/A',
        matchDate: '2024-03-15',
        venue: 'Training Ground',
        referee: 'N/A'
      },
      offense: {
        type: 'Warning',
        severity: 'Minor',
        description: 'Late arrival to training session',
        category: 'Administrative'
      },
      punishment: {
        type: 'Warning',
        details: 'Verbal warning for punctuality',
        completed: true
      },
      status: 'Completed',
      reportedBy: 'Head Coach',
      notes: 'Player acknowledged and apologized'
    }
  ];

  const disciplinaryStats: DisciplinaryStats = {
    totalIncidents: 4,
    yellowCards: 2,
    redCards: 1,
    suspensions: 1,
    fines: 0,
    activeSuspensions: 0,
    disciplinaryPoints: 8, // Yellow = 2pts, Red = 5pts, etc.
    fairPlayRating: 7.2
  };

  const behaviorReports: BehaviorReport[] = [
    {
      id: '1',
      reportDate: '2024-11-20',
      reportType: 'Positive',
      reporter: 'Head Coach',
      category: 'Training',
      summary: 'Excellent leadership during training session',
      details: 'Helped younger players with technique and showed great team spirit',
      verified: true
    },
    {
      id: '2',
      reportDate: '2024-11-10',
      reportType: 'Positive',
      reporter: 'Community Officer',
      category: 'Community',
      summary: 'Participated in youth football clinic',
      details: 'Volunteered time to coach local youth team and donated equipment',
      verified: true
    },
    {
      id: '3',
      reportDate: '2024-10-05',
      reportType: 'Neutral',
      reporter: 'Club Manager',
      category: 'Club Events',
      summary: 'Attended club charity event',
      details: 'Present at annual charity gala, participated in fundraising activities',
      verified: true
    },
    {
      id: '4',
      reportDate: '2024-09-25',
      reportType: 'Negative',
      reporter: 'Team Manager',
      category: 'Social',
      summary: 'Minor social media incident',
      details: 'Posted controversial opinion on social media, quickly removed after discussion',
      verified: true
    }
  ];

  const getOffenseColor = (type: DisciplinaryRecord['offense']['type']) => {
    switch (type) {
      case 'Yellow Card': return 'bg-yellow-100 text-yellow-800';
      case 'Red Card': return 'bg-red-100 text-red-800';
      case 'Suspension': return 'bg-orange-100 text-orange-800';
      case 'Fine': return 'bg-purple-100 text-purple-800';
      case 'Warning': return 'bg-blue-100 text-blue-800';
      case 'Misconduct': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: DisciplinaryRecord['offense']['severity']) => {
    switch (severity) {
      case 'Minor': return 'bg-green-100 text-green-800';
      case 'Major': return 'bg-yellow-100 text-yellow-800';
      case 'Severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: DisciplinaryRecord['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Active': return 'bg-red-100 text-red-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Appealed': return 'bg-blue-100 text-blue-800';
      case 'Overturned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBehaviorColor = (type: BehaviorReport['reportType']) => {
    switch (type) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      case 'Neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFairPlayGrade = (rating: number) => {
    if (rating >= 9) return { grade: 'A+', color: 'text-green-600' };
    if (rating >= 8) return { grade: 'A', color: 'text-green-600' };
    if (rating >= 7) return { grade: 'B', color: 'text-blue-600' };
    if (rating >= 6) return { grade: 'C', color: 'text-yellow-600' };
    return { grade: 'D', color: 'text-red-600' };
  };

  const fairPlay = getFairPlayGrade(disciplinaryStats.fairPlayRating);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Disciplinary Records</h1>
          <p className="text-muted-foreground">Complete disciplinary history and behavior reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Generate Report</Button>
          <Button variant="outline">📧 Appeal Decision</Button>
          <Button>📄 Export Records</Button>
        </div>
      </div>

      {/* Disciplinary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{disciplinaryStats.totalIncidents}</div>
            <div className="text-sm text-muted-foreground">Total Incidents</div>
            <div className="text-xs text-blue-600 mt-1">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{disciplinaryStats.yellowCards}</div>
            <div className="text-sm text-muted-foreground">Yellow Cards</div>
            <div className="text-xs text-yellow-600 mt-1">Career total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{disciplinaryStats.redCards}</div>
            <div className="text-sm text-muted-foreground">Red Cards</div>
            <div className="text-xs text-red-600 mt-1">Career total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${fairPlay.color}`}>{fairPlay.grade}</div>
            <div className="text-sm text-muted-foreground">Fair Play Rating</div>
            <div className="text-xs text-muted-foreground mt-1">{disciplinaryStats.fairPlayRating}/10</div>
          </CardContent>
        </Card>
      </div>

      {/* Fair Play Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Fair Play Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Disciplinary Points</div>
              <div className="text-2xl font-bold">{disciplinaryStats.disciplinaryPoints}</div>
              <div className="text-xs text-muted-foreground">Current season</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Active Suspensions</div>
              <div className={`text-2xl font-bold ${disciplinaryStats.activeSuspensions > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {disciplinaryStats.activeSuspensions}
              </div>
              <div className="text-xs text-muted-foreground">
                {disciplinaryStats.activeSuspensions > 0 ? 'Suspended' : 'Clear to play'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Outstanding Fines</div>
              <div className={`text-2xl font-bold ${disciplinaryStats.fines > 0 ? 'text-red-600' : 'text-green-600'}`}>
                KES {disciplinaryStats.fines.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {disciplinaryStats.fines > 0 ? 'Payment due' : 'No outstanding'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Next Review</div>
              <div className="text-2xl font-bold">Dec 15</div>
              <div className="text-xs text-muted-foreground">2024 season end</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Disciplinary History */}
          <Card>
            <CardHeader>
              <CardTitle>Disciplinary History</CardTitle>
              <CardDescription>Complete record of all disciplinary incidents and punishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disciplinaryRecords.map(record => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {record.offense.type === 'Yellow Card' && '🟡'}
                          {record.offense.type === 'Red Card' && '🔴'}
                          {record.offense.type === 'Warning' && '⚠️'}
                          {record.offense.type === 'Fine' && '💰'}
                          {record.offense.type === 'Suspension' && '🚫'}
                          {record.offense.type === 'Misconduct' && '❌'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getOffenseColor(record.offense.type)} variant="secondary">
                              {record.offense.type}
                            </Badge>
                            <Badge className={getSeverityColor(record.offense.severity)} variant="secondary">
                              {record.offense.severity}
                            </Badge>
                            <Badge className={getStatusColor(record.status)} variant="secondary">
                              {record.status}
                            </Badge>
                          </div>
                          <div className="font-semibold">{record.offense.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.incidentDate} • {record.matchDetails.tournament}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Opponent:</span>
                          <span className="ml-2 font-medium">{record.matchDetails.opponent}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Venue:</span>
                          <span className="ml-2">{record.matchDetails.venue}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="ml-2">{record.matchDetails.matchDate}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Referee:</span>
                          <span className="ml-2">{record.matchDetails.referee}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="ml-2">{record.offense.category}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Reported by:</span>
                          <span className="ml-2">{record.reportedBy}</span>
                        </div>
                      </div>
                    </div>

                    {/* Punishment Details */}
                    <div className="border-t pt-3">
                      <div className="text-sm font-semibold mb-2">Punishment</div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-2">{record.punishment.type}</span>
                        </div>
                        {record.punishment.duration && (
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2">{record.punishment.duration}</span>
                          </div>
                        )}
                        {record.punishment.amount && (
                          <div>
                            <span className="text-muted-foreground">Fine Amount:</span>
                            <span className="ml-2 font-semibold text-red-600">{record.punishment.amount}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Details:</span>
                          <span className="ml-2">{record.punishment.details}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`ml-2 font-semibold ${record.punishment.completed ? 'text-green-600' : 'text-red-600'}`}>
                            {record.punishment.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Appeal Details */}
                    {record.appealDetails && (
                      <div className="border-t pt-3 mt-3">
                        <div className="text-sm font-semibold mb-2">Appeal Information</div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-muted-foreground">Appeal Date:</span>
                            <span className="ml-2">{record.appealDetails.appealDate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Appeal Status:</span>
                            <span className="ml-2">{record.appealDetails.status}</span>
                          </div>
                          {record.appealDetails.outcome && (
                            <div>
                              <span className="text-muted-foreground">Outcome:</span>
                              <span className="ml-2">{record.appealDetails.outcome}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                      <div className="border-t pt-3 mt-3">
                        <div className="text-sm font-semibold mb-1">Additional Notes</div>
                        <div className="text-sm text-muted-foreground">{record.notes}</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <Button variant="outline" size="sm">📄 View Details</Button>
                      <Button variant="outline" size="sm">📧 Contact Committee</Button>
                      {record.status === 'Active' && (
                        <Button variant="outline" size="sm">⚖️ File Appeal</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Behavior Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Behavior Reports</CardTitle>
              <CardDescription>Reports from coaches, officials, and community members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {behaviorReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">
                          {report.reportType === 'Positive' && '👍'}
                          {report.reportType === 'Negative' && '👎'}
                          {report.reportType === 'Neutral' && '👤'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getBehaviorColor(report.reportType)} variant="secondary">
                              {report.reportType}
                            </Badge>
                            <Badge variant="outline">{report.category}</Badge>
                            {report.verified && (
                              <Badge className="bg-blue-100 text-blue-800" variant="secondary">Verified</Badge>
                            )}
                          </div>
                          <div className="font-semibold">{report.summary}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.reportDate} • Reported by {report.reporter}
                          </div>
                        </div>
                      </div>
                    </div>

                    {report.details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        {report.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fair Play Score */}
          <Card>
            <CardHeader>
              <CardTitle>Fair Play Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${fairPlay.color}`}>
                  {disciplinaryStats.fairPlayRating}
                </div>
                <div className="text-lg font-semibold mb-2">Grade: {fairPlay.grade}</div>
                <div className="text-sm text-muted-foreground mb-4">Out of 10.0</div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full" 
                    style={{ width: `${(disciplinaryStats.fairPlayRating / 10) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Based on disciplinary record, behavior reports, and sportsmanship
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disciplinary Points Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Points Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Yellow Cards</span>
                  </div>
                  <span className="font-semibold">{disciplinaryStats.yellowCards * 2} pts</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-sm">Red Cards</span>
                  </div>
                  <span className="font-semibold">{disciplinaryStats.redCards * 5} pts</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-sm">Suspensions</span>
                  </div>
                  <span className="font-semibold">{disciplinaryStats.suspensions * 1} pts</span>
                </div>
                
                <hr />
                
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Points</span>
                  <span>{disciplinaryStats.disciplinaryPoints}</span>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  Points reset at season end. Maximum 20 points before review.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Nov 15, 2024</div>
                    <div className="text-xs text-muted-foreground">Yellow card - Nairobi Championship</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Nov 10, 2024</div>
                    <div className="text-xs text-muted-foreground">Positive behavior - Community service</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Sep 20, 2024</div>
                    <div className="text-xs text-muted-foreground">Red card - Governor's Cup</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Improvement Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Improvement Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm font-semibold text-blue-800">Recommended</div>
                  <div className="text-xs text-blue-600">Anger management workshop</div>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm font-semibold text-green-800">Completed</div>
                  <div className="text-xs text-green-600">Sportsmanship training course</div>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm font-semibold text-yellow-800">Pending</div>
                  <div className="text-xs text-yellow-600">Community service hours</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                📧 File Appeal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📞 Contact Committee
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Request Hearing
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📄 Get Certificate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📚 Training Resources
              </Button>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-3">
                <div>
                  <div className="font-semibold">📞 Disciplinary Committee</div>
                  <div className="text-muted-foreground">+254 700 555 123</div>
                </div>
                
                <div>
                  <div className="font-semibold">📧 Appeals Office</div>
                  <div className="text-muted-foreground">appeals@nairobifc.com</div>
                </div>
                
                <div>
                  <div className="font-semibold">🕒 Office Hours</div>
                  <div className="text-muted-foreground">Mon-Fri: 9AM-5PM</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}