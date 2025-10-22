import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrganizations } from "@/hooks/useReferenceData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface EligibilityRule {
  id: string;
  tournamentId: string;
  ruleType: string;
  name: string;
  description: string | null;
  config: any;
  isActive: boolean;
}

interface Tournament {
  id: string;
  name: string;
  orgId: string;
}

interface EligibilityCheckResult {
  eligible: boolean;
  reasons: string[];
  checkedRules: {
    ruleId: string;
    ruleName: string;
    passed: boolean;
    message: string;
  }[];
}

export default function Eligibility() {
  const { toast } = useToast();
  const { data: organizations = [] } = useOrganizations();
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [playerUpid, setPlayerUpid] = useState("");
  const [teamId, setTeamId] = useState("");

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments", selectedOrg],
    enabled: !!selectedOrg,
  });

  const { data: rules = [], isLoading } = useQuery<EligibilityRule[]>({
    queryKey: ["/api/tournaments", selectedTournament, "eligibility-rules"],
    enabled: !!selectedTournament,
  });

  const checkEligibility = useMutation({
    mutationFn: async ({ upid, teamId }: { upid: string; teamId?: string }) => {
      return await apiRequest<EligibilityCheckResult>(
        `/api/tournaments/${selectedTournament}/check-eligibility`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ upid, teamId }),
        }
      );
    },
    onSuccess: (data) => {
      if (data.eligible) {
        toast({
          title: "Player Eligible",
          description: "This player meets all eligibility requirements.",
        });
      } else {
        toast({
          title: "Player Ineligible",
          description: data.reasons.join(", "),
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check eligibility",
        variant: "destructive",
      });
    },
  });

  const handleCheckEligibility = () => {
    if (!playerUpid || !selectedTournament) {
      toast({
        title: "Missing Information",
        description: "Please select a tournament and enter a player UPID",
        variant: "destructive",
      });
      return;
    }
    checkEligibility.mutate({ upid: playerUpid, teamId: teamId || undefined });
    setCheckDialogOpen(false);
    setPlayerUpid("");
    setTeamId("");
  };

  const getRuleTypeLabel = (ruleType: string): string => {
    const labels: Record<string, string> = {
      AGE_RANGE: "Age Range",
      DOCUMENT_VERIFIED: "Document Verification",
      NO_ACTIVE_SUSPENSIONS: "No Active Suspensions",
      VALID_CONTRACT: "Valid Contract",
      NATIONALITY: "Nationality",
      GENDER: "Gender",
      PLAYER_STATUS: "Player Status",
      GEOGRAPHIC: "Geographic",
    };
    return labels[ruleType] || ruleType;
  };

  const getRuleConfigSummary = (ruleType: string, config: any): string => {
    if (!config) return "No configuration";

    switch (ruleType) {
      case "AGE_RANGE":
        const parts = [];
        if (config.minAge) parts.push(`Min: ${config.minAge}y`);
        if (config.maxAge) parts.push(`Max: ${config.maxAge}y`);
        return parts.length > 0 ? parts.join(", ") : "Any age";

      case "NATIONALITY":
        return config.allowedNationalities?.length > 0
          ? `Allowed: ${config.allowedNationalities.join(", ")}`
          : "Any nationality";

      case "GENDER":
        return config.allowedGenders?.length > 0
          ? `Allowed: ${config.allowedGenders.join(", ")}`
          : "Any gender";

      case "PLAYER_STATUS":
        return config.allowedStatuses?.length > 0
          ? `Allowed: ${config.allowedStatuses.join(", ")}`
          : "Any status";

      default:
        return "Configured";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eligibility Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage tournament eligibility rules and check player eligibility
          </p>
        </div>
        <Dialog open={checkDialogOpen} onOpenChange={setCheckDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedTournament} data-testid="button-check-eligibility">
              <Shield className="w-4 h-4 mr-2" />
              Check Eligibility
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check Player Eligibility</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Player UPID</Label>
                <Input
                  value={playerUpid}
                  onChange={(e) => setPlayerUpid(e.target.value)}
                  placeholder="Enter player UPID"
                  data-testid="input-player-upid"
                />
              </div>
              <div>
                <Label>Team ID (optional)</Label>
                <Input
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="Enter team ID for contract validation"
                  data-testid="input-team-id"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCheckDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCheckEligibility}
                disabled={checkEligibility.isPending}
                data-testid="button-submit-check"
              >
                {checkEligibility.isPending ? "Checking..." : "Check Eligibility"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Organization</Label>
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger data-testid="select-organization">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tournament</Label>
          <Select
            value={selectedTournament}
            onValueChange={setSelectedTournament}
            disabled={!selectedOrg}
          >
            <SelectTrigger data-testid="select-tournament">
              <SelectValue placeholder="Select tournament" />
            </SelectTrigger>
            <SelectContent>
              {tournaments.map((tournament) => (
                <SelectItem key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {checkEligibility.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {checkEligibility.data.eligible ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Eligible
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  Ineligible
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkEligibility.data.reasons.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Reasons:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {checkEligibility.data.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Rule Checks:</h3>
              <div className="space-y-2">
                {checkEligibility.data.checkedRules.map((rule) => (
                  <div
                    key={rule.ruleId}
                    className="flex items-start gap-2 p-2 rounded-md bg-card border"
                  >
                    {rule.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rule.ruleName}</p>
                      <p className="text-xs text-muted-foreground">{rule.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading rules...</p>
        </div>
      ) : !selectedTournament ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a tournament to view eligibility rules</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            No eligibility rules configured for this tournament
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">{rule.name}</CardTitle>
                <Badge variant={rule.isActive ? "default" : "secondary"} data-testid={`badge-status-${rule.id}`}>
                  {rule.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type: </span>
                    <span className="text-muted-foreground">{getRuleTypeLabel(rule.ruleType)}</span>
                  </div>
                  {rule.description && (
                    <div>
                      <span className="font-medium">Description: </span>
                      <span className="text-muted-foreground">{rule.description}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Config: </span>
                    <span className="text-muted-foreground">
                      {getRuleConfigSummary(rule.ruleType, rule.config)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
