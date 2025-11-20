import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Mail, Lock, User, AlertCircle, CheckCircle2, Search } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  season: string;
  start_date: string;
  end_date: string;
}

export default function Signup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    tournamentId: "",
    requestMessage: "",
  });
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  // Fetch available tournaments on mount
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      // Fetch all tournaments (no status filter to show all available tournaments)
      const response = await fetch("/api/tournaments");
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setTournaments(data.data);
        console.log(`Loaded ${data.data.length} tournaments`);
      }
    } catch (err) {
      console.error("Failed to fetch tournaments:", err);
    } finally {
      setLoadingTournaments(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.season.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (!formData.tournamentId) {
      setError("Please select a tournament");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Create user account
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || "Signup failed");
      }

      const userId = signupData.user?.id;
      if (!userId) {
        throw new Error("Failed to create user account");
      }

      // Step 2: Create tournament admin request
      const requestResponse = await fetch("/api/admin-requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          tournamentId: formData.tournamentId,
          requestMessage: formData.requestMessage,
        }),
      });

      const requestData = await requestResponse.json();

      if (!requestResponse.ok) {
        throw new Error(requestData.error || "Failed to submit admin request");
      }

      setSuccess(true);
      
      // Redirect to pending approval page after 3 seconds
      setTimeout(() => {
        setLocation(`/auth/pending-approval?userId=${userId}`);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">Request Submitted!</h3>
              <p className="text-muted-foreground">
                Your tournament admin request has been submitted successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                You will receive a confirmation email once the super admin reviews your request.
                Redirecting...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="h-12 w-12 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
          </div>
          <CardTitle className="text-2xl">Become a Tournament Admin</CardTitle>
          <CardDescription>
            Create your account and request to manage a tournament
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tournament">Select Tournament</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isLoading || loadingTournaments}
                />
              </div>
              <Select
                value={formData.tournamentId}
                onValueChange={(value) => handleChange("tournamentId", value)}
                disabled={isLoading || loadingTournaments}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingTournaments ? "Loading tournaments..." : "Choose a tournament"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredTournaments.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {loadingTournaments ? "Loading..." : "No tournaments available"}
                    </div>
                  ) : (
                    filteredTournaments.map(tournament => (
                      <SelectItem key={tournament.id} value={tournament.id}>
                        {tournament.name} - {tournament.season}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the tournament you want to manage
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestMessage">Why do you want to manage this tournament? (Optional)</Label>
              <Textarea
                id="requestMessage"
                placeholder="Tell us why you'd be a great admin for this tournament..."
                value={formData.requestMessage}
                onChange={(e) => handleChange("requestMessage", e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || loadingTournaments}>
              {isLoading ? "Submitting..." : "Create Account & Request Access"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="ghost"
                className="p-0 h-auto font-semibold text-primary"
                onClick={() => setLocation("/auth/login")}
                type="button"
              >
                Sign in
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground"
                onClick={() => setLocation("/")}
                type="button"
              >
                ← Back to public site
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


