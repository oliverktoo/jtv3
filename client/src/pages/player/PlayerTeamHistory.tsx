import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamAffiliation {
  id: string;
  teamName: string;
  clubName: string;
  position: string;
  shirtNumber: number;
  joinDate: string;
  endDate?: string;
  status: 'Active' | 'Former' | 'On Loan' | 'Transferred';
  achievements: string[];
  statistics: {
    appearances: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    manOfTheMatch: number;
  };
  contractDetails?: {
    signedDate: string;
    expiryDate: string;
    renewalOption?: boolean;
    transferValue?: string;
  };
}

interface TournamentHistory {
  id: string;
  tournamentName: string;
  season: string;
  teamName: string;
  position: string;
  statistics: {
    matchesPlayed: number;
    goals: number;
    assists: number;
    cleanSheets?: number;
    saves?: number;
  };
  achievements: string[];
  finalPosition: string;
  memorable: boolean;
}

interface TransferHistory {
  id: string;
  fromTeam: string;
  toTeam: string;
  transferDate: string;
  transferType: 'Permanent' | 'Loan' | 'Free Transfer' | 'End of Contract';
  fee?: string;
  reason: string;
  season: string;
}

export default function PlayerTeamHistory() {
  const currentAffiliation: TeamAffiliation = {
    id: '1',
    teamName: 'First Team',
    clubName: 'Nairobi Football Club',
    position: 'Striker',
    shirtNumber: 9,
    joinDate: '2023-01-15',
    status: 'Active',
    achievements: [
      'Top Scorer 2023 Season',
      'Player of the Month - March 2024',
      'Team Captain 2024',
      'Governor\'s Cup Winner 2023'
    ],
    statistics: {
      appearances: 45,
      goals: 28,
      assists: 12,
      yellowCards: 3,
      redCards: 0,
      manOfTheMatch: 8
    },
    contractDetails: {
      signedDate: '2023-01-15',
      expiryDate: '2026-12-31',
      renewalOption: true,
      transferValue: 'KES 2,500,000'
    }
  };

  const previousAffiliations: TeamAffiliation[] = [
    {
      id: '2',
      teamName: 'Youth Team',
      clubName: 'Kasarani Youth Academy',
      position: 'Striker',
      shirtNumber: 11,
      joinDate: '2021-08-01',
      endDate: '2022-12-31',
      status: 'Former',
      achievements: [
        'Youth League Champion 2022',
        'Top Youth Scorer 2021',
        'Academy Player of the Year'
      ],
      statistics: {
        appearances: 32,
        goals: 45,
        assists: 18,
        yellowCards: 2,
        redCards: 0,
        manOfTheMatch: 15
      }
    },
    {
      id: '3',
      teamName: 'Reserve Team',
      clubName: 'Mathare United Reserves',
      position: 'Winger',
      shirtNumber: 7,
      joinDate: '2020-01-10',
      endDate: '2021-07-30',
      status: 'Former',
      achievements: [
        'Reserve League Runner-up',
        'Most Assists 2020'
      ],
      statistics: {
        appearances: 28,
        goals: 12,
        assists: 22,
        yellowCards: 5,
        redCards: 1,
        manOfTheMatch: 6
      }
    }
  ];

  const tournamentHistory: TournamentHistory[] = [
    {
      id: '1',
      tournamentName: 'Nairobi County Championship',
      season: '2024',
      teamName: 'Nairobi FC',
      position: 'Striker',
      statistics: {
        matchesPlayed: 12,
        goals: 8,
        assists: 4
      },
      achievements: ['Top Scorer', 'Tournament Winner'],
      finalPosition: '1st Place - Champions',
      memorable: true
    },
    {
      id: '2',
      tournamentName: 'Governor\'s Cup',
      season: '2023',
      teamName: 'Nairobi FC',
      position: 'Striker',
      statistics: {
        matchesPlayed: 6,
        goals: 5,
        assists: 2
      },
      achievements: ['Golden Boot Winner'],
      finalPosition: '1st Place - Winners',
      memorable: true
    },
    {
      id: '3',
      tournamentName: 'Inter-County Cup',
      season: '2023',
      teamName: 'Nairobi FC',
      position: 'Striker',
      statistics: {
        matchesPlayed: 8,
        goals: 6,
        assists: 3
      },
      achievements: ['Player of the Tournament'],
      finalPosition: '2nd Place - Runners-up',
      memorable: false
    },
    {
      id: '4',
      tournamentName: 'Youth Championship',
      season: '2022',
      teamName: 'Kasarani Academy',
      position: 'Striker',
      statistics: {
        matchesPlayed: 10,
        goals: 12,
        assists: 6
      },
      achievements: ['Top Scorer', 'Best Young Player'],
      finalPosition: '1st Place - Champions',
      memorable: true
    }
  ];

  const transferHistory: TransferHistory[] = [
    {
      id: '1',
      fromTeam: 'Kasarani Youth Academy',
      toTeam: 'Nairobi Football Club',
      transferDate: '2023-01-15',
      transferType: 'Permanent',
      fee: 'KES 150,000',
      reason: 'Promotion to senior football',
      season: '2023'
    },
    {
      id: '2',
      fromTeam: 'Mathare United Reserves',
      toTeam: 'Kasarani Youth Academy',
      transferDate: '2021-08-01',
      transferType: 'Free Transfer',
      reason: 'Better development opportunities',
      season: '2021'
    },
    {
      id: '3',
      fromTeam: 'Nairobi School FC',
      toTeam: 'Mathare United Reserves',
      transferDate: '2020-01-10',
      transferType: 'Free Transfer',
      reason: 'First professional contract',
      season: '2020'
    }
  ];

  const getStatusColor = (status: TeamAffiliation['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Former': return 'bg-gray-100 text-gray-800';
      case 'On Loan': return 'bg-yellow-100 text-yellow-800';
      case 'Transferred': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransferTypeColor = (type: TransferHistory['transferType']) => {
    switch (type) {
      case 'Permanent': return 'bg-green-100 text-green-800';
      case 'Loan': return 'bg-yellow-100 text-yellow-800';
      case 'Free Transfer': return 'bg-blue-100 text-blue-800';
      case 'End of Contract': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateCareerStats = () => {
    const allAffiliations = [currentAffiliation, ...previousAffiliations];
    return allAffiliations.reduce((totals, affiliation) => ({
      appearances: totals.appearances + affiliation.statistics.appearances,
      goals: totals.goals + affiliation.statistics.goals,
      assists: totals.assists + affiliation.statistics.assists,
      yellowCards: totals.yellowCards + affiliation.statistics.yellowCards,
      redCards: totals.redCards + affiliation.statistics.redCards,
      manOfTheMatch: totals.manOfTheMatch + affiliation.statistics.manOfTheMatch
    }), { appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, manOfTheMatch: 0 });
  };

  const careerStats = calculateCareerStats();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team History</h1>
          <p className="text-muted-foreground">Complete football career journey and achievements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Career Report</Button>
          <Button variant="outline">📄 Export History</Button>
          <Button>⭐ Request Certificate</Button>
        </div>
      </div>

      {/* Career Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Career Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{careerStats.appearances}</div>
              <div className="text-sm text-muted-foreground">Total Appearances</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{careerStats.goals}</div>
              <div className="text-sm text-muted-foreground">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{careerStats.assists}</div>
              <div className="text-sm text-muted-foreground">Total Assists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{careerStats.yellowCards}</div>
              <div className="text-sm text-muted-foreground">Yellow Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{careerStats.redCards}</div>
              <div className="text-sm text-muted-foreground">Red Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{careerStats.manOfTheMatch}</div>
              <div className="text-sm text-muted-foreground">Man of Match</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Current Team Affiliation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                      {currentAffiliation.shirtNumber}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{currentAffiliation.clubName}</h3>
                      <p className="text-muted-foreground">
                        {currentAffiliation.position} • Joined {currentAffiliation.joinDate}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(currentAffiliation.status)} variant="secondary">
                    {currentAffiliation.status}
                  </Badge>
                </div>

                {/* Current Season Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                  <div className="text-center">
                    <div className="text-xl font-bold">{currentAffiliation.statistics.appearances}</div>
                    <div className="text-xs text-muted-foreground">Appearances</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{currentAffiliation.statistics.goals}</div>
                    <div className="text-xs text-muted-foreground">Goals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{currentAffiliation.statistics.assists}</div>
                    <div className="text-xs text-muted-foreground">Assists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{currentAffiliation.statistics.manOfTheMatch}</div>
                    <div className="text-xs text-muted-foreground">MOTM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-600">{currentAffiliation.statistics.yellowCards}</div>
                    <div className="text-xs text-muted-foreground">Yellow</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{currentAffiliation.statistics.redCards}</div>
                    <div className="text-xs text-muted-foreground">Red</div>
                  </div>
                </div>

                {/* Current Achievements */}
                {currentAffiliation.achievements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recent Achievements</h4>
                    <div className="space-y-2">
                      {currentAffiliation.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="text-yellow-600">🏆</div>
                          <div className="text-sm">{achievement}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contract Details */}
                {currentAffiliation.contractDetails && (
                  <div>
                    <h4 className="font-semibold mb-2">Contract Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Signed:</span>
                        <span className="ml-2 font-medium">{currentAffiliation.contractDetails.signedDate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="ml-2 font-medium">{currentAffiliation.contractDetails.expiryDate}</span>
                      </div>
                      {currentAffiliation.contractDetails.transferValue && (
                        <div>
                          <span className="text-muted-foreground">Value:</span>
                          <span className="ml-2 font-medium">{currentAffiliation.contractDetails.transferValue}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Renewal Option:</span>
                        <span className="ml-2 font-medium">
                          {currentAffiliation.contractDetails.renewalOption ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Previous Teams */}
          <Card>
            <CardHeader>
              <CardTitle>Previous Team Affiliations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {previousAffiliations.map(affiliation => (
                  <div key={affiliation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold">
                          {affiliation.shirtNumber}
                        </div>
                        <div>
                          <h3 className="font-semibold">{affiliation.clubName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {affiliation.position} • {affiliation.joinDate} - {affiliation.endDate}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(affiliation.status)} variant="secondary">
                        {affiliation.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                      <div className="text-center">
                        <div className="font-bold text-sm">{affiliation.statistics.appearances}</div>
                        <div className="text-xs text-muted-foreground">Apps</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-green-600">{affiliation.statistics.goals}</div>
                        <div className="text-xs text-muted-foreground">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-blue-600">{affiliation.statistics.assists}</div>
                        <div className="text-xs text-muted-foreground">Assists</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-purple-600">{affiliation.statistics.manOfTheMatch}</div>
                        <div className="text-xs text-muted-foreground">MOTM</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-yellow-600">{affiliation.statistics.yellowCards}</div>
                        <div className="text-xs text-muted-foreground">Yellow</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-red-600">{affiliation.statistics.redCards}</div>
                        <div className="text-xs text-muted-foreground">Red</div>
                      </div>
                    </div>

                    {affiliation.achievements.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold mb-2">Achievements</div>
                        <div className="flex flex-wrap gap-2">
                          {affiliation.achievements.map((achievement, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              🏆 {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tournament History */}
          <Card>
            <CardHeader>
              <CardTitle>Tournament History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tournamentHistory.map(tournament => (
                  <div key={tournament.id} className={`border rounded-lg p-4 ${
                    tournament.memorable ? 'border-yellow-300 bg-yellow-50' : ''
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {tournament.tournamentName}
                          {tournament.memorable && <span className="text-yellow-500">⭐</span>}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {tournament.season} • {tournament.teamName} • {tournament.position}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{tournament.finalPosition}</div>
                        {tournament.achievements.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {tournament.achievements.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      <div className="text-center">
                        <div className="font-bold text-sm">{tournament.statistics.matchesPlayed}</div>
                        <div className="text-xs text-muted-foreground">Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-green-600">{tournament.statistics.goals}</div>
                        <div className="text-xs text-muted-foreground">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-blue-600">{tournament.statistics.assists}</div>
                        <div className="text-xs text-muted-foreground">Assists</div>
                      </div>
                      {tournament.statistics.cleanSheets && (
                        <div className="text-center">
                          <div className="font-bold text-sm text-gray-600">{tournament.statistics.cleanSheets}</div>
                          <div className="text-xs text-muted-foreground">Clean Sheets</div>
                        </div>
                      )}
                      {tournament.statistics.saves && (
                        <div className="text-center">
                          <div className="font-bold text-sm text-orange-600">{tournament.statistics.saves}</div>
                          <div className="text-xs text-muted-foreground">Saves</div>
                        </div>
                      )}
                    </div>

                    {tournament.achievements.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {tournament.achievements.map((achievement, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
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
          {/* Career Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Career Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Current</div>
                    <div className="text-xs text-muted-foreground">Nairobi FC (2023-present)</div>
                  </div>
                </div>
                
                {previousAffiliations.map((affiliation, index) => (
                  <div key={affiliation.id} className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <div className="text-sm font-semibold">{affiliation.joinDate.split('-')[0]}-{affiliation.endDate?.split('-')[0]}</div>
                      <div className="text-xs text-muted-foreground">{affiliation.clubName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transfer History */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transferHistory.map(transfer => (
                  <div key={transfer.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold">{transfer.season}</div>
                      <Badge className={getTransferTypeColor(transfer.transferType)} variant="secondary">
                        {transfer.transferType}
                      </Badge>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">From:</span>
                        <span>{transfer.fromTeam}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">To:</span>
                        <span>{transfer.toTeam}</span>
                      </div>
                      {transfer.fee && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Fee:</span>
                          <span className="font-semibold text-green-600">{transfer.fee}</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {transfer.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Career Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Career Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-yellow-600">🏆</div>
                  <div className="text-sm">Top Scorer - 3 Tournaments</div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-blue-600">⭐</div>
                  <div className="text-sm">Player of the Tournament</div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded">
                  <div className="text-purple-600">👑</div>
                  <div className="text-sm">29 MOTM Awards</div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="text-green-600">⚽</div>
                  <div className="text-sm">85+ Career Goals</div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                  <div className="text-red-600">💯</div>
                  <div className="text-sm">100+ Appearances</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Goals per Game</span>
                    <span className="text-sm font-semibold">0.62</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Assists per Game</span>
                    <span className="text-sm font-semibold">0.27</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '27%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">MOTM Rate</span>
                    <span className="text-sm font-semibold">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Disciplinary Record</span>
                    <span className="text-sm font-semibold text-green-600">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
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
                📊 Detailed Statistics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📄 Career Certificate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎥 Video Highlights
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📧 Share Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📱 Mobile View
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}