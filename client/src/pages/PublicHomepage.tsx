import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Award, Shield, FileCheck, Mail, Key, ArrowRight } from "lucide-react";

export function PublicHomepage() {
  const [, setLocation] = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setLocation('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 to-secondary/5">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Jamii Tourney v3</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="/auth/login">Sign In</a>
            </Button>
            <Button asChild>
              <a href="/auth/magic-signup">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold mb-6">
              Tournament Management
              <span className="block text-primary">Made Simple</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Kenya's premier tournament management platform. Organize tournaments, manage teams, track players, and run competitions with professional-grade tools designed for Kenyan sports organizations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
              <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700" asChild>
                <a href="/auth/fast-signup" className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Instant Signup
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <a href="/auth/magic-signup" className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Magic Link
                </a>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <a href="/auth/login" className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Sign In
                </a>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Passwordless Login</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span>Professional Grade</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background/50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">
              Everything You Need for Tournament Success
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle>Player Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Universal Player ID (UPID) system with document verification, contracts, and comprehensive transfer tracking for Kenyan sports.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    <CardTitle>Tournament Formats</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Administrative hierarchies, inter-county competitions, independent tournaments, and full league systems designed for Kenya.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    <CardTitle>Smart Scheduling</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automatic fixture generation with configurable rules, weekend defaults, and intelligent kickoff time scheduling.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <CardTitle>Eligibility Engine</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Comprehensive eligibility rules with age verification, document checks, suspension tracking, and compliance monitoring.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    <CardTitle>Real-time Standings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automatic standings calculation with configurable point systems, tiebreakers, and live tournament updates.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-6 w-6 text-primary" />
                    <CardTitle>Professional Reports</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Comprehensive reporting and Excel export for players, tournaments, fixtures, disciplinary records, and more.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Tournaments?</h3>
              <p className="text-xl text-muted-foreground mb-8">
                Join Kenya's leading sports organizations who trust Jamii Tourney for their tournament management needs. Get started in minutes with our simple signup process.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700" asChild>
                  <a href="/auth/fast-signup" className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Instantly
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="/auth/magic-signup" className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Magic Link
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="/auth/login" className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Sign In
                  </a>
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                ⚡ Instant signup available • ✅ No credit card required • 🔒 Bank-level security
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background/80">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-semibold">Jamii Tourney v3</span>
            </div>
            <p className="text-muted-foreground">
              © 2025 Jamii Tourney. Built specifically for Kenyan sports organizations.
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground">
              <a href="/public" className="hover:text-primary transition-colors">Public Tournaments</a>
              <a href="/auth/login" className="hover:text-primary transition-colors">Sign In</a>
              <a href="/auth/magic-signup" className="hover:text-primary transition-colors">Get Started</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}