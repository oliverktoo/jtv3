import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PreMatchCenter() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Pre-Match Center</h1>
        <p className="text-muted-foreground">
          Team sheet submission and venue preparation checklist
        </p>
      </div>

      {/* Match Information */}
      <section className="mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-xl">Governor's Cup Final</CardTitle>
            <CardDescription>
              Nairobi FC vs Kiambu United • November 15, 2025 • 15:00 • Kasarani Stadium
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Team Sheets Status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Team Sheet Status</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Nairobi FC</CardTitle>
                <Badge variant="default" className="bg-green-100 text-green-800">SUBMITTED</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Manager:</span>
                    <div className="font-medium">John Kamau</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <div className="font-medium">Nov 14, 10:30 AM</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Players Listed:</span>
                    <div className="font-medium">18 (11 starting + 7 subs)</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="font-medium text-green-600">Approved</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Starting XI</h4>
                  <div className="text-sm space-y-1">
                    <div className="grid grid-cols-2 gap-2">
                      <span>1. James Kariuki (GK)</span>
                      <span>2. Peter Wanjiku</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span>3. David Ochieng</span>
                      <span>4. Samuel Kiptoo (C)</span>
                    </div>
                    <div className="text-xs text-muted-foreground">+ 7 more players...</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
                    View Full Team Sheet
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                    Download PDF
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Kiambu United</CardTitle>
                <Badge variant="destructive">PENDING</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Manager:</span>
                    <div className="font-medium">Mary Njeri</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deadline:</span>
                    <div className="font-medium text-red-600">Nov 15, 13:00 (2h left)</div>
                  </div>
                </div>
                
                <div className="p-4 border-2 border-dashed border-orange-300 rounded bg-orange-100">
                  <div className="text-center text-orange-700">
                    <div className="font-medium mb-1">Team Sheet Not Submitted</div>
                    <div className="text-sm">Reminder sent to team manager</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="bg-red-600 text-white px-4 py-2 rounded text-sm">
                    Send Urgent Reminder
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                    Contact Manager
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Venue Preparation Checklist */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Venue Preparation Checklist</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { task: "Pitch inspection completed", status: "completed", time: "Nov 14, 16:00" },
                { task: "Goal posts and nets checked", status: "completed", time: "Nov 14, 16:15" },
                { task: "Changing rooms prepared", status: "completed", time: "Nov 15, 08:00" },
                { task: "Medical facilities ready", status: "completed", time: "Nov 15, 09:30" },
                { task: "Security briefing completed", status: "completed", time: "Nov 15, 10:00" },
                { task: "Sound system tested", status: "in-progress", time: "In progress" },
                { task: "Floodlights tested", status: "pending", time: "Scheduled 14:00" },
                { task: "Final pitch preparation", status: "pending", time: "Scheduled 14:30" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'in-progress' ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`}></div>
                    <span className="font-medium">{item.task}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      item.status === 'completed' ? 'default' :
                      item.status === 'in-progress' ? 'secondary' :
                      'outline'
                    } className={
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      ''
                    }>
                      {item.status === 'completed' ? '✓ Complete' :
                       item.status === 'in-progress' ? '⏳ In Progress' :
                       '⏸ Pending'}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Match Officials Confirmation */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Match Officials Confirmation</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Referee</h3>
                  <Badge variant="default" className="bg-green-100 text-green-800">CONFIRMED</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-medium">John Mwangi</div>
                    <div className="text-muted-foreground">Level A Certified</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact:</span>
                    <div className="font-medium">+254 700 123 456</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confirmed:</span>
                    <div className="font-medium text-green-600">Nov 14, 18:30</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Assistant 1</h3>
                  <Badge variant="default" className="bg-green-100 text-green-800">CONFIRMED</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-medium">Peter Kariuki</div>
                    <div className="text-muted-foreground">Level B Certified</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact:</span>
                    <div className="font-medium">+254 700 234 567</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confirmed:</span>
                    <div className="font-medium text-green-600">Nov 14, 19:15</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Assistant 2</h3>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-medium">David Ochieng</div>
                    <div className="text-muted-foreground">Level B Certified</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact:</span>
                    <div className="font-medium">+254 700 345 678</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="font-medium text-yellow-600">Awaiting response</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}