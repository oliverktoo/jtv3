import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Venues() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Venues</h1>
        <p className="text-muted-foreground">
          Stadiums and facilities hosting competitions across Kenya
        </p>
      </div>

      {/* Featured Venues */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Premier Venues</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold">Kasarani Stadium</h3>
                <p className="text-blue-100">Nairobi</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <div className="font-semibold">60,000</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Surface:</span>
                    <div className="font-semibold">Natural Grass</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Opened:</span>
                    <div className="font-semibold">1987</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">County:</span>
                    <div className="font-semibold">Nairobi</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">VIP Boxes</Badge>
                    <Badge variant="secondary" className="text-xs">Floodlights</Badge>
                    <Badge variant="secondary" className="text-xs">Parking</Badge>
                    <Badge variant="secondary" className="text-xs">Food Courts</Badge>
                    <Badge variant="secondary" className="text-xs">Medical Center</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Upcoming Events</h4>
                  <div className="text-sm space-y-1">
                    <div>Governor's Cup Final - Nov 15</div>
                    <div>Inter-County Derby - Dec 1</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm">
                    View Events
                  </button>
                  <button className="border border-primary text-primary py-2 px-4 rounded-lg text-sm">
                    Directions
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold">Nyayo Stadium</h3>
                <p className="text-green-100">Nairobi</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <div className="font-semibold">30,000</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Surface:</span>
                    <div className="font-semibold">Artificial Turf</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Opened:</span>
                    <div className="font-semibold">1983</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">County:</span>
                    <div className="font-semibold">Nairobi</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">Athletics Track</Badge>
                    <Badge variant="secondary" className="text-xs">Floodlights</Badge>
                    <Badge variant="secondary" className="text-xs">Press Box</Badge>
                    <Badge variant="secondary" className="text-xs">Hospitality</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Upcoming Events</h4>
                  <div className="text-sm space-y-1">
                    <div>Youth Championship Semi - Dec 8</div>
                    <div>Women's League Final - Dec 15</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm">
                    View Events
                  </button>
                  <button className="border border-primary text-primary py-2 px-4 rounded-lg text-sm">
                    Directions
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* All Venues */}
      <section>
        <h2 className="text-2xl font-bold mb-6">All Competition Venues</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Nakuru Athletic Club",
              location: "Nakuru",
              capacity: "15,000",
              surface: "Natural Grass",
              events: ["Women's Premier League", "Regional Matches"]
            },
            {
              name: "Mombasa Sports Club",
              location: "Mombasa",
              capacity: "12,000",
              surface: "Natural Grass",
              events: ["Inter-County Derby", "Coastal League"]
            },
            {
              name: "Eldoret Stadium",
              location: "Eldoret",
              capacity: "10,000",
              surface: "Artificial Turf",
              events: ["Rift Valley Championship", "Youth League"]
            },
            {
              name: "Thika Stadium",
              location: "Thika",
              capacity: "8,000",
              surface: "Natural Grass",
              events: ["Central Region League", "School Championships"]
            },
            {
              name: "Machakos Stadium",
              location: "Machakos",
              capacity: "5,000",
              surface: "Natural Grass",
              events: ["Eastern League", "Community Matches"]
            },
            {
              name: "Garissa Stadium",
              location: "Garissa",
              capacity: "6,000",
              surface: "Natural Grass",
              events: ["Northern League", "Regional Championships"]
            }
          ].map((venue) => (
            <Card key={venue.name} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{venue.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  📍 {venue.location}
                  <Badge variant="outline" className="text-xs">
                    {venue.capacity} capacity
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Surface:</span>
                    <span className="ml-2 font-medium">{venue.surface}</span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Current Events</h4>
                    <div className="space-y-1">
                      {venue.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs mr-1 mb-1">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 text-xs bg-primary text-primary-foreground py-2 rounded">
                      View Schedule
                    </button>
                    <button className="text-xs border border-primary text-primary py-2 px-3 rounded">
                      Map
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Venue Information */}
      <section className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Venue Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-3">Accessibility Features</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Wheelchair accessible entrances</li>
              <li>• Designated disabled parking</li>
              <li>• Accessible restroom facilities</li>
              <li>• Sign language interpretation (on request)</li>
              <li>• Audio commentary systems</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">General Facilities</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Food and beverage outlets</li>
              <li>• Secure parking facilities</li>
              <li>• First aid and medical services</li>
              <li>• Public transportation access</li>
              <li>• Security and crowd control</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">📍 Getting There</h4>
          <p className="text-sm text-blue-700">
            All venues are accessible by public transport. Dedicated shuttle services are available 
            for major events. Check individual venue pages for detailed directions and transport options.
          </p>
        </div>
      </section>
    </div>
  );
}