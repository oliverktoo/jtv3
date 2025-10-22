import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Award, Shield, FileCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" data-testid="icon-logo" />
            <h1 className="text-2xl font-bold" data-testid="text-app-name">
              Jamii Tourney v3
            </h1>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Sign In with Replit</a>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4" data-testid="text-hero-title">
              Tournament Management Made Simple
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
              A comprehensive platform for Kenyan sports organizations to manage tournaments, teams, players, and competitions with ease.
            </p>
            <Button size="lg" asChild data-testid="button-get-started">
              <a href="/api/login">Get Started</a>
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12" data-testid="text-features-title">
              Everything You Need
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card data-testid="card-feature-players">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle>Player Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Secure Universal Player ID (UPID) system with document verification, contracts, and transfer tracking.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card data-testid="card-feature-tournaments">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    <CardTitle>Tournament Formats</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Support for administrative hierarchies, inter-county competitions, independent tournaments, and full league systems.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card data-testid="card-feature-scheduling">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    <CardTitle>Smart Scheduling</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automatic fixture generation with configurable scheduling rules, weekend defaults, and kickoff times.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card data-testid="card-feature-eligibility">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <CardTitle>Eligibility Rules</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Comprehensive eligibility engine with age ranges, document verification, suspension checks, and more.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card data-testid="card-feature-standings">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    <CardTitle>Real-time Standings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automatic standings calculation with configurable point systems and tiebreakers.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card data-testid="card-feature-reports">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-6 w-6 text-primary" />
                    <CardTitle>Reports & Export</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Comprehensive reports and Excel export for players, tournaments, fixtures, and disciplinary records.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-muted py-16">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-4" data-testid="text-cta-title">
              Ready to Get Started?
            </h3>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta-description">
              Sign in with your Replit account to access the platform
            </p>
            <Button size="lg" asChild data-testid="button-sign-in-cta">
              <a href="/api/login">Sign In Now</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p data-testid="text-footer">
            &copy; 2025 Jamii Tourney v3. Built for Kenyan Sports Organizations.
          </p>
        </div>
      </footer>
    </div>
  );
}
