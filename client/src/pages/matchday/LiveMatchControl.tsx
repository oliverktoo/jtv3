import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function LiveMatchControl() {
  const [matchEvents, setMatchEvents] = useState([
    { minute: 67, event: "Yellow Card", player: "John Doe", team: "Nairobi FC", time: "67'" },
    { minute: 63, event: "Goal", player: "Mike Smith", team: "Kiambu United", time: "63'" },
    { minute: 45, event: "Goal", player: "Peter Jones", team: "Nairobi FC", time: "45'" },
    { minute: 35, event: "Substitution", player: "David Kim → Samuel Weru", team: "Nairobi FC", time: "35'" }
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">Live Match Control</h1>
            <p className="text-muted-foreground">
              Real-time event logging and match management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="animate-pulse">
              🔴 LIVE
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold">67'</div>
              <div className="text-sm text-muted-foreground">Match Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Score */}
      <section className="mb-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Governor's Cup Final</h2>
              <div className="flex justify-center items-center gap-8 mb-4">
                <div className="text-center">
                  <div className="text-lg font-medium">Nairobi FC</div>
                  <div className="text-4xl font-bold text-primary">2</div>
                </div>
                <div className="text-2xl text-muted-foreground">-</div>
                <div className="text-center">
                  <div className="text-lg font-medium">Kiambu United</div>
                  <div className="text-4xl font-bold text-primary">1</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Kasarani Stadium • November 15, 2025
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Logging */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Event Logging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="bg-green-600 text-white p-3 rounded text-sm font-medium">
                  ⚽ Goal
                </button>
                <button className="bg-yellow-500 text-white p-3 rounded text-sm font-medium">
                  🟨 Yellow Card
                </button>
                <button className="bg-red-600 text-white p-3 rounded text-sm font-medium">
                  🟥 Red Card
                </button>
                <button className="bg-blue-600 text-white p-3 rounded text-sm font-medium">
                  🔄 Substitution
                </button>
                <button className="bg-purple-600 text-white p-3 rounded text-sm font-medium">
                  🏃 Free Kick
                </button>
                <button className="bg-orange-600 text-white p-3 rounded text-sm font-medium">
                  ⚠️ Penalty
                </button>
                <button className="bg-gray-600 text-white p-3 rounded text-sm font-medium">
                  👨‍⚕️ Injury
                </button>
                <button className="bg-indigo-600 text-white p-3 rounded text-sm font-medium">
                  ⏰ Time
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Event Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Match Events Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {matchEvents.map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {event.time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            event.event === 'Goal' ? 'text-green-600' :
                            event.event === 'Yellow Card' ? 'text-yellow-600' :
                            event.event === 'Red Card' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {event.event === 'Goal' ? '⚽' :
                             event.event === 'Yellow Card' ? '🟨' :
                             event.event === 'Red Card' ? '🟥' :
                             '🔄'} {event.event}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.player} • {event.team}
                        </div>
                      </div>
                    </div>
                    <button className="text-red-600 hover:bg-red-50 p-1 rounded">
                      ✗
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Stats & Controls */}
        <div className="space-y-6">
          {/* Match Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Match Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full bg-red-600 text-white py-3 rounded font-medium">
                ⏸️ Pause Match
              </button>
              <button className="w-full bg-orange-600 text-white py-2 rounded">
                ⏰ Add Injury Time
              </button>
              <button className="w-full bg-blue-600 text-white py-2 rounded">
                🔄 Half Time
              </button>
              <button className="w-full bg-green-600 text-white py-2 rounded">
                🏁 End Match
              </button>
            </CardContent>
          </Card>

          {/* Live Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Live Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Ball Possession</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Nairobi FC</span>
                  <span className="text-xs">58% - 42%</span>
                  <span className="text-xs">Kiambu United</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shots on Target</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">5</span>
                  <span className="text-xs">Shots</span>
                  <span className="text-xs">3</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Corners</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">4</span>
                  <span className="text-xs">Corners</span>
                  <span className="text-xs">2</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Yellow Cards</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">2</span>
                  <span className="text-xs">Cards</span>
                  <span className="text-xs">1</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Sheets */}
          <Card>
            <CardHeader>
              <CardTitle>Active Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Nairobi FC</h4>
                  <div className="text-xs space-y-1">
                    <div>1. James Kariuki (GK)</div>
                    <div>2. Peter Wanjiku</div>
                    <div>3. David Ochieng 🟨</div>
                    <div className="text-muted-foreground">+ 8 more...</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Kiambu United</h4>
                  <div className="text-xs space-y-1">
                    <div>1. Michael Otieno (GK)</div>
                    <div>2. Samuel Kiptoo</div>
                    <div>3. John Mburu</div>
                    <div className="text-muted-foreground">+ 8 more...</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}