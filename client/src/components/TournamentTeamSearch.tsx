import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Users, Mail, Phone, Plus, Search, Filter } from "lucide-react";
import { useCounties } from "../hooks/useReferenceData";
import { useTeamsByRegion, useRegisterTeamForTournament } from "../hooks/useTournamentTeams";
import { toast } from "../hooks/use-toast";

interface TournamentTeamSearchProps {
  tournamentId: string;
  tournamentName: string;
  onTeamRegistered: () => void;
}

export function TournamentTeamSearch({ 
  tournamentId, 
  tournamentName, 
  onTeamRegistered 
}: TournamentTeamSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedSubCounty, setSelectedSubCounty] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [registrationData, setRegistrationData] = useState({
    coachName: "",
    squadSize: 22,
    jerseyColors: "",
    notes: "",
  });

  const { data: counties = [] } = useCounties();
  const { data: teams = [] } = useTeamsByRegion(selectedCounty, selectedSubCounty, selectedWard);
  const { mutate: registerTeam, isPending: isRegistering } = useRegisterTeamForTournament();

  // Filter teams by search term
  const filteredTeams = teams.filter((team: any) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.club_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ""
  );

  const handleRegisterTeam = () => {
    if (!selectedTeam) return;

    registerTeam({
      teamId: selectedTeam.id,
      tournamentId,
      representingOrgId: selectedTeam.org_id,
      registrationStatus: "SUBMITTED",
      coachName: registrationData.coachName || undefined,
      squadSize: registrationData.squadSize || 22,
      jerseyColors: registrationData.jerseyColors || undefined,
      notes: registrationData.notes || undefined,
    }, {
      onSuccess: () => {
        toast({
          title: "Team Registered",
          description: `${selectedTeam.name} has been registered for ${tournamentName}`,
        });
        setIsOpen(false);
        setSelectedTeam(null);
        setRegistrationData({
          coachName: "",
          squadSize: 22,
          jerseyColors: "",
          notes: "",
        });
        onTeamRegistered();
      },
      onError: (error: any) => {
        toast({
          title: "Registration Failed",
          description: error.message || "Failed to register team",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Team to Tournament
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team to {tournamentName}</DialogTitle>
          <DialogDescription>
            Search for teams by region. Teams must have ward registration to be eligible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Region Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="county">County</Label>
                  <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select County" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Counties</SelectItem>
                      {counties.map((county: any) => (
                        <SelectItem key={county.id} value={county.id}>
                          {county.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub-county and Ward selectors would need additional hooks */}
                <div>
                  <Label htmlFor="subcounty">Sub-County</Label>
                  <Select 
                    value={selectedSubCounty} 
                    onValueChange={setSelectedSubCounty}
                    disabled={!selectedCounty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sub-County" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sub-Counties</SelectItem>
                      {/* Sub-counties would be loaded based on selected county */}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ward">Ward</Label>
                  <Select 
                    value={selectedWard} 
                    onValueChange={setSelectedWard}
                    disabled={!selectedSubCounty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ward" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Wards</SelectItem>
                      {/* Wards would be loaded based on selected sub-county */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Search */}
          <div>
            <Label htmlFor="search">Search Teams</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by team name or club..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Team Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Available Teams</h3>
              <Badge variant="secondary">
                {filteredTeams.length} teams found
              </Badge>
            </div>

            {filteredTeams.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No teams found matching your criteria.</p>
                  <p className="text-sm mt-1">
                    Try adjusting your region filters or search terms.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {filteredTeams.map((team: any) => (
                  <Card 
                    key={team.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTeam?.id === team.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          {team.club_name && (
                            <p className="text-sm text-muted-foreground">
                              {team.club_name}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {team.wards?.name}, {team.sub_counties?.name}, {team.counties?.name}
                        </div>
                        
                        {team.contact_email && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {team.contact_email}
                          </div>
                        )}
                        
                        {team.contact_phone && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {team.contact_phone}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Registration Details */}
          {selectedTeam && (
            <Card>
              <CardHeader>
                <CardTitle>Registration Details for {selectedTeam.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coach">Coach Name</Label>
                    <Input
                      id="coach"
                      placeholder="Enter coach name"
                      value={registrationData.coachName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegistrationData(prev => ({
                        ...prev,
                        coachName: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="squadSize">Squad Size</Label>
                    <Input
                      id="squadSize"
                      type="number"
                      min="1"
                      max="50"
                      value={registrationData.squadSize}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegistrationData(prev => ({
                        ...prev,
                        squadSize: parseInt(e.target.value) || 22
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="jerseyColors">Jersey Colors</Label>
                  <Input
                    id="jerseyColors"
                    placeholder="e.g., Home: Blue, Away: White"
                    value={registrationData.jerseyColors}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegistrationData(prev => ({
                      ...prev,
                      jerseyColors: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional registration notes..."
                    value={registrationData.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRegistrationData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRegisterTeam} disabled={isRegistering}>
                    {isRegistering ? "Registering..." : "Register Team"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}