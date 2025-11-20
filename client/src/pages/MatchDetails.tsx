import { useState } from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Clock, ArrowLeft, Edit, Save, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MatchDetails() {
  const { matchId } = useParams();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: "",
    homeScore: "",
    awayScore: "",
    venue: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: [`/api/matches/${matchId}`],
    queryFn: () => apiRequest("GET", `/api/matches/${matchId}`),
    enabled: !!matchId,
  });

  const updateMatch = useMutation({
    mutationFn: (updates: any) => apiRequest("PATCH", `/api/matches/${matchId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
      toast({
        title: "Success",
        description: "Match updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update match",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-center">Loading match details...</p>
      </div>
    );
  }

  const match = data?.match;

  if (!match) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-center text-destructive">Match not found</p>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      status: match.status,
      homeScore: match.home_score?.toString() || "",
      awayScore: match.away_score?.toString() || "",
      venue: match.venue || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const updates: any = {
      status: editData.status,
      venue: editData.venue,
    };

    if (editData.homeScore !== "") {
      updates.homeScore = parseInt(editData.homeScore);
    }
    if (editData.awayScore !== "") {
      updates.awayScore = parseInt(editData.awayScore);
    }

    updateMatch.mutate(updates);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      status: "",
      homeScore: "",
      awayScore: "",
      venue: "",
    });
  };

  const statusColors: Record<string, string> = {
    SCHEDULED: "secondary",
    LIVE: "destructive",
    COMPLETED: "default",
    POSTPONED: "outline",
    CANCELLED: "outline",
  };

  const tournamentId = match.round?.stage?.tournament_id;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {tournamentId && (
            <Link href={`/tournaments/${tournamentId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tournament
              </Button>
            </Link>
          )}
          <h1 className="text-3xl font-bold">Match Details</h1>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Match
          </Button>
        )}
      </div>

      {/* Match Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {match.round?.name} - {match.round?.stage?.name}
            </CardTitle>
            <Badge variant={statusColors[match.status] as any}>
              {match.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date and Venue */}
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(match.kickoff), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(match.kickoff), "HH:mm")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {isEditing ? (
                <Input
                  value={editData.venue}
                  onChange={(e) => setEditData({ ...editData, venue: e.target.value })}
                  className="h-7"
                />
              ) : (
                <span>{match.venue}</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Teams and Score */}
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-8">
            {/* Home Team */}
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{match.home_team.name}</div>
              {isEditing && (
                <Input
                  type="number"
                  min="0"
                  value={editData.homeScore}
                  onChange={(e) => setEditData({ ...editData, homeScore: e.target.value })}
                  className="w-20 mx-auto text-center text-2xl font-bold"
                  placeholder="0"
                />
              )}
              {!isEditing && match.home_score !== null && (
                <div className="text-6xl font-bold text-primary">{match.home_score}</div>
              )}
            </div>

            {/* VS or Score Separator */}
            <div className="text-4xl font-bold text-muted-foreground">
              {match.status === "COMPLETED" ? "-" : "vs"}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{match.away_team.name}</div>
              {isEditing && (
                <Input
                  type="number"
                  min="0"
                  value={editData.awayScore}
                  onChange={(e) => setEditData({ ...editData, awayScore: e.target.value })}
                  className="w-20 mx-auto text-center text-2xl font-bold"
                  placeholder="0"
                />
              )}
              {!isEditing && match.away_score !== null && (
                <div className="text-6xl font-bold text-primary">{match.away_score}</div>
              )}
            </div>
          </div>

          {/* Edit Controls */}
          {isEditing && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label>Match Status</Label>
                  <Select value={editData.status} onValueChange={(val) => setEditData({ ...editData, status: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="LIVE">Live</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="POSTPONED">Postponed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={updateMatch.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateMatch.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Match Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Match Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Round:</span>
              <span className="font-semibold">{match.round?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leg:</span>
              <span className="font-semibold">{match.round?.leg || 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stage:</span>
              <span className="font-semibold">{match.round?.stage?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{format(new Date(match.created_at), "MMM d, yyyy")}</span>
            </div>
            {match.updated_at !== match.created_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{format(new Date(match.updated_at), "MMM d, yyyy HH:mm")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Officials - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Match Officials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No officials assigned yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
