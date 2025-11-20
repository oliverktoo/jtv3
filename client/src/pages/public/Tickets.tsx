import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Tickets() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Event Tickets</h1>
        <p className="text-muted-foreground">
          Purchase tickets for upcoming matches and events
        </p>
      </div>

      {/* Featured Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Governor's Cup Final</CardTitle>
                  <CardDescription>Nairobi FC vs Kiambu United</CardDescription>
                </div>
                <Badge variant="default">LIVE NOW</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <div className="font-medium">November 15, 2025</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <div className="font-medium">15:00 EAT</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Venue:</span>
                    <div className="font-medium">Kasarani Stadium</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <div className="font-medium">60,000</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Ticket Categories</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">VIP</div>
                        <div className="text-xs text-muted-foreground">Premium seating with refreshments</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">KSh 2,500</div>
                        <div className="text-xs text-red-600">43 left</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Regular</div>
                        <div className="text-xs text-muted-foreground">Standard stadium seating</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">KSh 500</div>
                        <div className="text-xs text-green-600">1,247 available</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg opacity-50">
                      <div>
                        <div className="font-medium">Student</div>
                        <div className="text-xs text-muted-foreground">Valid student ID required</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">KSh 200</div>
                        <div className="text-xs text-red-600">Sold out</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium">
                  Buy Tickets
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Women's Premier League Final</CardTitle>
              <CardDescription>Nakuru Queens vs Eldoret Ladies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <div className="font-medium">November 22, 2025</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <div className="font-medium">16:00 EAT</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Venue:</span>
                    <div className="font-medium">Nakuru Athletic Club</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <div className="font-medium">15,000</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Ticket Categories</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">VIP</div>
                        <div className="text-xs text-muted-foreground">Covered seating</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">KSh 1,000</div>
                        <div className="text-xs text-green-600">156 available</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Regular</div>
                        <div className="text-xs text-muted-foreground">General admission</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">KSh 300</div>
                        <div className="text-xs text-green-600">2,843 available</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium">
                  Buy Tickets
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* All Events */}
      <section>
        <h2 className="text-2xl font-bold mb-6">All Events</h2>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <div className="flex-1">
                <h3 className="font-semibold">Inter-County Derby - Round 1</h3>
                <p className="text-sm text-muted-foreground">
                  December 1, 2025 • 14:00 • Mombasa Sports Club
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">VIP - KSh 800</Badge>
                  <Badge variant="secondary" className="text-xs">Regular - KSh 250</Badge>
                </div>
              </div>
              <div className="text-right">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">
                  Buy Tickets
                </button>
                <p className="text-xs text-muted-foreground mt-1">3,245 available</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <div className="flex-1">
                <h3 className="font-semibold">Youth Championship - Semi Final</h3>
                <p className="text-sm text-muted-foreground">
                  December 8, 2025 • 15:30 • Nyayo Stadium
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">VIP - KSh 600</Badge>
                  <Badge variant="secondary" className="text-xs">Regular - KSh 200</Badge>
                  <Badge variant="secondary" className="text-xs">Student - KSh 100</Badge>
                </div>
              </div>
              <div className="text-right">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">
                  Buy Tickets
                </button>
                <p className="text-xs text-muted-foreground mt-1">8,567 available</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <div className="flex-1">
                <h3 className="font-semibold">Regional League - Final Day</h3>
                <p className="text-sm text-muted-foreground">
                  December 15, 2025 • 16:00 • Various Venues
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">Day Pass - KSh 400</Badge>
                </div>
              </div>
              <div className="text-right">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">
                  Buy Tickets
                </button>
                <p className="text-xs text-muted-foreground mt-1">Multiple venues</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">How Ticket Purchase Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto mb-3">
              1
            </div>
            <h4 className="font-medium mb-2">Select Event</h4>
            <p className="text-muted-foreground">Choose your preferred match and ticket category</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto mb-3">
              2
            </div>
            <h4 className="font-medium mb-2">Secure Payment</h4>
            <p className="text-muted-foreground">Pay safely using M-Pesa or card payment</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto mb-3">
              3
            </div>
            <h4 className="font-medium mb-2">QR Entry</h4>
            <p className="text-muted-foreground">Present QR code at venue for quick entry</p>
          </div>
        </div>
      </section>
    </div>
  );
}