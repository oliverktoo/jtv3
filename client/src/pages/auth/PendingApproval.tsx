import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, CheckCircle2, XCircle, AlertCircle, Trophy, Calendar, RefreshCw } from "lucide-react";

interface AdminRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  request_message: string | null;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  tournament: {
    id: string;
    name: string;
    season: string;
    start_date: string;
    end_date: string;
  };
}

export default function PendingApproval() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const userId = searchParams.get("userId");
  
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setLocation("/auth/login");
      return;
    }
    fetchRequests();
  }, [userId]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/admin-requests/my-requests/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch requests");
      }

      setRequests(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchRequests();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "CANCELLED":
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Loading your requests...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const approvedRequests = requests.filter(r => r.status === "APPROVED");
  const rejectedRequests = requests.filter(r => r.status === "REJECTED");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-primary" />
                  Tournament Admin Requests
                </CardTitle>
                <CardDescription>
                  Track the status of your tournament admin applications
                </CardDescription>
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Approval
              </CardTitle>
              <CardDescription>
                Your request is being reviewed by the super admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">
                            {request.tournament.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Season: {request.tournament.season}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(request.tournament.start_date)} - {formatDate(request.tournament.end_date)}
                          </div>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      {request.request_message && (
                        <div className="bg-background/50 p-3 rounded-md">
                          <p className="text-sm font-medium mb-1">Your Message:</p>
                          <p className="text-sm text-muted-foreground">
                            {request.request_message}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted on {formatDate(request.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You will receive an email notification once your request is reviewed.
                  Check back here for updates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Approved Requests */}
        {approvedRequests.length > 0 && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Approved Requests
              </CardTitle>
              <CardDescription>
                You are now an admin for these tournaments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">
                            {request.tournament.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Season: {request.tournament.season}
                          </p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Approved on {request.reviewed_at ? formatDate(request.reviewed_at) : "N/A"}
                      </p>
                      <Button 
                        onClick={() => setLocation("/auth/login")}
                        className="w-full"
                      >
                        Login to Manage Tournament
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Rejected Requests
              </CardTitle>
              <CardDescription>
                These requests were not approved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rejectedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">
                            {request.tournament.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Season: {request.tournament.season}
                          </p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      {request.rejection_reason && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Reason:</strong> {request.rejection_reason}
                          </AlertDescription>
                        </Alert>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Rejected on {request.reviewed_at ? formatDate(request.reviewed_at) : "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Requests */}
        {requests.length === 0 && !isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4 py-8">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No Requests Found</h3>
                  <p className="text-muted-foreground">
                    You haven't submitted any tournament admin requests yet.
                  </p>
                </div>
                <Button onClick={() => setLocation("/auth/signup")}>
                  Request Tournament Admin Access
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/auth/login")}>
            Go to Login
          </Button>
          <Button variant="outline" onClick={() => setLocation("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
