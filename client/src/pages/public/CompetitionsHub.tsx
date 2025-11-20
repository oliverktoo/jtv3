import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CompetitionsHub() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Competitions</h1>
        <p className="text-muted-foreground">
          Browse all tournaments and leagues across Kenya
        </p>
      </div>

      {/* Filters */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-4">
          <select className="px-4 py-2 border rounded-lg">
            <option>All Status</option>
            <option>Active</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
          <select className="px-4 py-2 border rounded-lg">
            <option>All Counties</option>
            <option>Nairobi</option>
            <option>Kiambu</option>
            <option>Nakuru</option>
          </select>
          <select className="px-4 py-2 border rounded-lg">
            <option>All Categories</option>
            <option>Men</option>
            <option>Women</option>
            <option>Youth</option>
          </select>
        </div>
      </section>

      {/* Active Competitions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Active Competitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Governor's Cup 2025</CardTitle>
                  <CardDescription>County Championship</CardDescription>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  LIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span>League + Knockout</span>
                </div>
                <div className="flex justify-between">
                  <span>Teams:</span>
                  <span>16</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>Sep - Dec 2025</span>
                </div>
                <div className="flex justify-between">
                  <span>Venues:</span>
                  <span>4 stadiums</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Women's Premier League</CardTitle>
                  <CardDescription>National League</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  ACTIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span>League</span>
                </div>
                <div className="flex justify-between">
                  <span>Teams:</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>Oct - Nov 2025</span>
                </div>
                <div className="flex justify-between">
                  <span>Venues:</span>
                  <span>6 stadiums</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Youth Championship</CardTitle>
                  <CardDescription>Under-17 Tournament</CardDescription>
                </div>
                <Badge variant="outline" className="border-orange-200 text-orange-600">
                  UPCOMING
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span>Knockout</span>
                </div>
                <div className="flex justify-between">
                  <span>Teams:</span>
                  <span>32</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>Dec 2025 - Jan 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Venues:</span>
                  <span>8 stadiums</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Competitions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Upcoming Competitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inter-County Derby</CardTitle>
              <CardDescription>Multi-county competition</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Registration opens December 15, 2025
              </p>
              <Badge variant="outline">Registrations Opening Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>National Schools Tournament</CardTitle>
              <CardDescription>Secondary school championship</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Annual national schools competition
              </p>
              <Badge variant="outline">Planning Phase</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Completed Competitions */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recently Completed</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <div>
                <h3 className="font-semibold">Nairobi Cup 2025</h3>
                <p className="text-sm text-muted-foreground">
                  Champion: Nairobi FC • Completed: October 2025
                </p>
              </div>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                COMPLETED
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <div>
                <h3 className="font-semibold">Central Region League</h3>
                <p className="text-sm text-muted-foreground">
                  Champion: Kiambu United • Completed: September 2025
                </p>
              </div>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                COMPLETED
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}