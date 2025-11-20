import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Leaderboards() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Leaderboards</h1>
        <p className="text-muted-foreground">
          Player and team statistics across all competitions
        </p>
      </div>

      {/* Filter Section */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-4">
          <select className="px-4 py-2 border rounded-lg">
            <option>All Competitions</option>
            <option>Governor's Cup</option>
            <option>Women's Premier League</option>
            <option>Youth Championship</option>
          </select>
          <select className="px-4 py-2 border rounded-lg">
            <option>2025 Season</option>
            <option>2024 Season</option>
            <option>All Time</option>
          </select>
          <select className="px-4 py-2 border rounded-lg">
            <option>All Categories</option>
            <option>Men</option>
            <option>Women</option>
            <option>Youth</option>
          </select>
        </div>
      </section>

      {/* Top Scorers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Top Goal Scorers</h2>
        
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {[
                { rank: 1, name: "John Mburu", team: "Nairobi FC", goals: 18, matches: 12 },
                { rank: 2, name: "Peter Wanjiku", team: "Kiambu United", goals: 15, matches: 11 },
                { rank: 3, name: "David Ochieng", team: "Nakuru FC", goals: 14, matches: 13 },
                { rank: 4, name: "Samuel Kiptoo", team: "Eldoret City", goals: 12, matches: 10 },
                { rank: 5, name: "Michael Otieno", team: "Mombasa FC", goals: 11, matches: 12 }
              ].map((player, index) => (
                <div 
                  key={player.rank}
                  className={`flex items-center justify-between p-4 border-b last:border-b-0 ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {player.rank}
                    </div>
                    <div>
                      <div className="font-semibold">{player.name}</div>
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
      </section>

      {/* Team Rankings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Team Performance Rankings</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Goals Scored</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { team: "Nairobi FC", stat: "42 goals", substat: "12 matches" },
                  { team: "Kiambu United", stat: "38 goals", substat: "11 matches" },
                  { team: "Nakuru FC", stat: "35 goals", substat: "13 matches" },
                  { team: "Eldoret City", stat: "31 goals", substat: "10 matches" },
                  { team: "Mombasa FC", stat: "28 goals", substat: "12 matches" }
                ].map((team, index) => (
                  <div key={team.team} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gray-100 rounded text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{team.team}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{team.stat}</div>
                      <div className="text-xs text-muted-foreground">{team.substat}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Defense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { team: "Thika United", stat: "4 goals conceded", substat: "12 matches" },
                  { team: "Machakos FC", stat: "6 goals conceded", substat: "11 matches" },
                  { team: "Nyeri FC", stat: "8 goals conceded", substat: "13 matches" },
                  { team: "Murang'a United", stat: "9 goals conceded", substat: "10 matches" },
                  { team: "Kiambu United", stat: "11 goals conceded", substat: "11 matches" }
                ].map((team, index) => (
                  <div key={team.team} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gray-100 rounded text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{team.team}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{team.stat}</div>
                      <div className="text-xs text-muted-foreground">{team.substat}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Player Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Player Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Top Assists</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">Sarah Wanjiku</div>
              <div className="text-muted-foreground">Nakuru Queens</div>
              <Badge variant="secondary" className="mt-2">12 Assists</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Clean Sheets</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">James Kariuki</div>
              <div className="text-muted-foreground">Thika United</div>
              <Badge variant="secondary" className="mt-2">8 Clean Sheets</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Most Cards</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">Paul Mwangi</div>
              <div className="text-muted-foreground">Garissa FC</div>
              <Badge variant="destructive" className="mt-2">7 Yellow Cards</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Most Appearances</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">Grace Njeri</div>
              <div className="text-muted-foreground">Eldoret Ladies</div>
              <Badge variant="secondary" className="mt-2">15 Matches</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Records */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Competition Records</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Single Match Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Highest Scoring Match:</span>
                  <span className="font-medium">Nairobi FC 6-4 Mombasa FC</span>
                </div>
                <div className="flex justify-between">
                  <span>Most Goals by Player:</span>
                  <span className="font-medium">John Mburu (4 goals)</span>
                </div>
                <div className="flex justify-between">
                  <span>Fastest Goal:</span>
                  <span className="font-medium">2'15" - Peter Wanjiku</span>
                </div>
                <div className="flex justify-between">
                  <span>Latest Goal:</span>
                  <span className="font-medium">94'32" - David Ochieng</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Season Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Longest Winning Streak:</span>
                  <span className="font-medium">Thika United (8 matches)</span>
                </div>
                <div className="flex justify-between">
                  <span>Most Consecutive Clean Sheets:</span>
                  <span className="font-medium">James Kariuki (5 matches)</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Goal Difference:</span>
                  <span className="font-medium">Nairobi FC (+28)</span>
                </div>
                <div className="flex justify-between">
                  <span>Most Hat-tricks:</span>
                  <span className="font-medium">John Mburu (3)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}