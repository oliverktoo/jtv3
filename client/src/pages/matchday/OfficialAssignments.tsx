import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OfficialAssignments() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-4">Official Assignments</h1>
          <p className="text-muted-foreground">
            Manage referee and official assignments for matches
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium">
          Assign Officials
        </button>
      </div>

      {/* Assignment Overview */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Matches</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">45</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Assigned</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">32</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Pending</CardDescription>
              <CardTitle className="text-2xl font-bold text-orange-600">13</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Available Officials</CardDescription>
              <CardTitle className="text-2xl font-bold text-purple-600">28</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Upcoming Match Assignments</h2>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">Nairobi FC vs Kiambu United</h3>
                    <Badge variant="default" className="bg-green-100 text-green-800">ASSIGNED</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <div className="font-medium">Nov 15, 2025</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <div className="font-medium">15:00</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Venue:</span>
                      <div className="font-medium">Kasarani Stadium</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Competition:</span>
                      <div className="font-medium">Governor's Cup Final</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-muted-foreground text-xs">REFEREE</div>
                      <div className="font-medium">John Mwangi</div>
                      <div className="text-xs text-green-600">Certified Level A</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-muted-foreground text-xs">ASSISTANT 1</div>
                      <div className="font-medium">Peter Kariuki</div>
                      <div className="text-xs text-green-600">Certified Level B</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-muted-foreground text-xs">ASSISTANT 2</div>
                      <div className="font-medium">David Ochieng</div>
                      <div className="text-xs text-green-600">Certified Level B</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
                    Modify
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                    Contact
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">Nakuru FC vs Eldoret City</h3>
                    <Badge variant="destructive">URGENT</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <div className="font-medium">Nov 16, 2025</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <div className="font-medium">16:00</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Venue:</span>
                      <div className="font-medium">Nakuru Athletic Club</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Competition:</span>
                      <div className="font-medium">Women's League Final</div>
                    </div>
                  </div>
                  <div className="p-4 border-2 border-dashed border-orange-300 rounded bg-orange-50">
                    <div className="text-center text-orange-700">
                      <div className="font-medium mb-1">No Officials Assigned</div>
                      <div className="text-sm">Match in 2 days - Urgent assignment needed</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="bg-red-600 text-white px-4 py-2 rounded text-sm">
                    Assign Now
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Available Officials */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Available Officials</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "James Kiprotich", level: "Level A", matches: 12, rating: 4.8, availability: "Available" },
            { name: "Mary Wanjiku", level: "Level A", matches: 8, rating: 4.9, availability: "Available" },
            { name: "Samuel Ouma", level: "Level B", matches: 15, rating: 4.6, availability: "Busy Nov 15" },
            { name: "Grace Njeri", level: "Level B", matches: 10, rating: 4.7, availability: "Available" },
            { name: "Paul Mwangi", level: "Level C", matches: 6, rating: 4.5, availability: "Available" },
            { name: "Ruth Akinyi", level: "Level C", matches: 4, rating: 4.4, availability: "Available" }
          ].map((official) => (
            <Card key={official.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{official.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {official.level}
                    </Badge>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">⭐ {official.rating}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Matches this season:</span>
                    <span className="font-medium">{official.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Availability:</span>
                    <span className={`font-medium ${
                      official.availability === 'Available' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {official.availability}
                    </span>
                  </div>
                </div>
                <button className="w-full mt-3 bg-primary text-primary-foreground py-2 rounded text-sm">
                  Assign to Match
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}