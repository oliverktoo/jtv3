import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicHome() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Jamii Tourney</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Kenya's Premier Tournament Management Platform
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg">
              View Competitions
            </button>
            <button className="border border-primary text-primary px-6 py-3 rounded-lg">
              Buy Tickets
            </button>
          </div>
        </div>
      </section>

      {/* Today's Matches */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Today's Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team A vs Team B</CardTitle>
              <CardDescription>14:30 • Moi Annex • Live</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="font-semibold">2 - 1</span>
                <span className="text-sm text-green-600 font-medium">● LIVE</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team C vs Team D</CardTitle>
              <CardDescription>16:45 • Eldoret Stadium • Soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">vs</span>
                <span className="text-sm text-blue-600 font-medium">○ UPCOMING</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Table Snapshots */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">League Standings</h2>
        <Card>
          <CardHeader>
            <CardTitle>Premier League - Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">1. Team Alpha</span>
                <span>18 pts</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">2. Team Beta</span>
                <span>15 pts</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">3. Team Gamma</span>
                <span>12 pts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* News & Gallery */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Championship Final Set</CardTitle>
              <CardDescription>2 hours ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The final matchup has been confirmed after yesterday's thrilling semi-finals...
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Player of the Month</CardTitle>
              <CardDescription>1 day ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Outstanding performances throughout October have earned this recognition...
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}