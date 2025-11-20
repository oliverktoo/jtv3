import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function LiveCenter() {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Live Center</h1>
        <p className="text-muted-foreground">
          Follow live matches and get real-time updates
        </p>
      </div>

      {/* Live Matches */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          Live Matches
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Nairobi FC vs Kiambu United</CardTitle>
                <Badge variant="destructive">LIVE</Badge>
              </div>
              <CardDescription>Governor's Cup Final • Kasarani Stadium</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Score */}
                <div className="text-center py-4">
                  <div className="text-4xl font-bold">2 - 1</div>
                  <div className="text-lg text-muted-foreground">67' MIN</div>
                </div>
                
                {/* Live Events */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-red-600">67'</span>
                    <span>🟨 Yellow card - John Doe (Nairobi FC)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">63'</span>
                    <span>⚽ GOAL! - Mike Smith (Kiambu United)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">45'</span>
                    <span>⚽ GOAL! - Peter Jones (Nairobi FC)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm"
                    onClick={() => setSelectedMatch('match1')}
                  >
                    Follow Match
                  </button>
                  <button className="border border-primary text-primary py-2 px-4 rounded-lg text-sm">
                    Match Stats
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Nakuru FC vs Eldoret City</CardTitle>
                <Badge variant="destructive">LIVE</Badge>
              </div>
              <CardDescription>Women's Premier League • Nakuru Stadium</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold">0 - 0</div>
                  <div className="text-lg text-muted-foreground">23' MIN</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-orange-600">20'</span>
                    <span>🔄 Substitution - Sarah Wilson ON, Jane Doe OFF</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-600">15'</span>
                    <span>🏃 Free kick - Eldoret City</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm"
                    onClick={() => setSelectedMatch('match2')}
                  >
                    Follow Match
                  </button>
                  <button className="border border-primary text-primary py-2 px-4 rounded-lg text-sm">
                    Match Stats
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Today */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Upcoming Today</h2>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <div>
                <h3 className="font-semibold">Mombasa FC vs Kisumu United</h3>
                <p className="text-sm text-muted-foreground">
                  16:00 • Mombasa Stadium • Inter-County Derby
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">16:00</Badge>
                <p className="text-xs text-muted-foreground mt-1">In 2 hours</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <div>
                <h3 className="font-semibold">Thika United vs Machakos FC</h3>
                <p className="text-sm text-muted-foreground">
                  18:30 • Thika Stadium • Youth Championship
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">18:30</Badge>
                <p className="text-xs text-muted-foreground mt-1">In 4.5 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Results */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Results</h2>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <div>
                <h3 className="font-semibold">Nyeri FC 3 - 1 Murang'a United</h3>
                <p className="text-sm text-muted-foreground">
                  Yesterday • Nyeri Stadium • Governor's Cup
                </p>
              </div>
              <Badge variant="outline" className="bg-gray-100">
                FT
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <div>
                <h3 className="font-semibold">Garissa FC 2 - 2 Mandera United</h3>
                <p className="text-sm text-muted-foreground">
                  Yesterday • Garissa Stadium • Regional League
                </p>
              </div>
              <Badge variant="outline" className="bg-gray-100">
                FT
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Live Updates Panel */}
      {selectedMatch && (
        <div className="fixed bottom-4 right-4 w-80 bg-white border rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Live Updates</h3>
            <button 
              onClick={() => setSelectedMatch(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-xs space-y-1">
            <div className="text-red-600">68' - Corner kick for Nairobi FC</div>
            <div className="text-red-600">67' - Yellow card - John Doe</div>
            <div className="text-green-600">63' - GOAL! Mike Smith</div>
          </div>
        </div>
      )}
    </div>
  );
}