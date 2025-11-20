import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PostMatchProcessing() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Post-Match Processing</h1>
        <p className="text-muted-foreground">
          Complete match reports, ratings, and follow-up actions
        </p>
      </div>

      {/* Match Summary */}
      <section className="mb-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <Badge variant="default" className="bg-green-100 text-green-800 mb-3">
                MATCH COMPLETED
              </Badge>
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
                Full Time • Kasarani Stadium • November 15, 2025 • 90+3 minutes
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Report */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official Report */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Official Match Report</CardTitle>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  PENDING REVIEW
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Referee Report</label>
                <textarea 
                  className="w-full p-3 border rounded-lg text-sm"
                  rows={4}
                  placeholder="Enter match summary, key incidents, and observations..."
                  defaultValue="Match proceeded smoothly with good sportsmanship from both teams. One yellow card issued to David Ochieng (Nairobi FC) for unsporting behavior in the 67th minute. No major incidents to report. Both teams showed excellent discipline throughout."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Key Incidents</label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">45' - Goal: Peter Jones (Nairobi FC)</span>
                    <button className="text-blue-600 text-xs hover:underline">Edit</button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">63' - Goal: Mike Smith (Kiambu United)</span>
                    <button className="text-blue-600 text-xs hover:underline">Edit</button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">67' - Yellow Card: David Ochieng (Nairobi FC)</span>
                    <button className="text-blue-600 text-xs hover:underline">Edit</button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">89' - Goal: Samuel Kiptoo (Nairobi FC)</span>
                    <button className="text-blue-600 text-xs hover:underline">Edit</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="bg-primary text-primary-foreground px-6 py-2 rounded">
                  Submit Report
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded">
                  Save Draft
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Player Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Player Performance Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Nairobi FC</h4>
                  <div className="space-y-2">
                    {[
                      { name: "James Kariuki (GK)", rating: 8.5, status: "Man of the Match" },
                      { name: "Peter Wanjiku", rating: 7.8, status: "Goal" },
                      { name: "David Ochieng", rating: 6.2, status: "Yellow Card" },
                      { name: "Samuel Kiptoo", rating: 8.1, status: "Goal" }
                    ].map((player) => (
                      <div key={player.name} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <span className="font-medium text-sm">{player.name}</span>
                          {player.status && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {player.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star}
                                className={`text-lg ${
                                  star <= Math.floor(player.rating / 2) ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="font-bold text-sm w-8">{player.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Kiambu United</h4>
                  <div className="space-y-2">
                    {[
                      { name: "Michael Otieno (GK)", rating: 7.3, status: "" },
                      { name: "John Mburu", rating: 6.8, status: "" },
                      { name: "Mike Smith", rating: 7.9, status: "Goal" },
                      { name: "Paul Mwangi", rating: 6.5, status: "" }
                    ].map((player) => (
                      <div key={player.name} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <span className="font-medium text-sm">{player.name}</span>
                          {player.status && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {player.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star}
                                className={`text-lg ${
                                  star <= Math.floor(player.rating / 2) ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="font-bold text-sm w-8">{player.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Checklist */}
        <div className="space-y-6">
          {/* Post-Match Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Post-Match Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { task: "Match result recorded", completed: true },
                  { task: "Event log reviewed", completed: true },
                  { task: "Player statistics updated", completed: true },
                  { task: "Official report submitted", completed: false },
                  { task: "Player ratings completed", completed: false },
                  { task: "Disciplinary actions processed", completed: false },
                  { task: "Media photos uploaded", completed: false },
                  { task: "Competition standings updated", completed: false }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={item.completed}
                        className="rounded"
                      />
                      <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.task}
                      </span>
                    </div>
                    <Badge variant={item.completed ? 'default' : 'outline'} className={
                      item.completed ? 'bg-green-100 text-green-800' : ''
                    }>
                      {item.completed ? '✓' : '○'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Match Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Final Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Ball Possession</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">58%</span>
                  <span className="text-xs">Nairobi FC</span>
                  <span className="text-xs">42%</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Total Shots</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">12</span>
                  <span className="text-xs">(5 on target)</span>
                  <span className="text-xs">8 (3)</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Corners</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">7</span>
                  <span className="text-xs">Corners</span>
                  <span className="text-xs">4</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Fouls</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">8</span>
                  <span className="text-xs">Fouls</span>
                  <span className="text-xs">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm">
                📊 Update Standings
              </button>
              <button className="w-full bg-green-600 text-white py-2 rounded text-sm">
                📰 Generate Press Release
              </button>
              <button className="w-full bg-purple-600 text-white py-2 rounded text-sm">
                📷 Upload Match Photos
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded text-sm">
                📄 Download Report PDF
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}