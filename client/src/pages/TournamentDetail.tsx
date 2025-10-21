import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Trophy, Users, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Tournament, EligibilityRule } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEligibilityRuleSchema, type InsertEligibilityRule } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  REGISTRATION: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  ACTIVE: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  COMPLETED: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  ARCHIVED: "bg-muted text-muted-foreground",
};

const modelLabels: Record<string, string> = {
  ADMINISTRATIVE_WARD: "Ward",
  ADMINISTRATIVE_SUB_COUNTY: "Sub-County",
  ADMINISTRATIVE_COUNTY: "County",
  ADMINISTRATIVE_NATIONAL: "National",
  INTER_COUNTY: "Inter-County",
  INDEPENDENT: "Independent",
  LEAGUE: "League",
};

export default function TournamentDetail() {
  const { tournamentId } = useParams();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EligibilityRule | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  const { data: tournament, isLoading: isTournamentLoading } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/${tournamentId}`],
    enabled: !!tournamentId,
  });

  const { data: eligibilityRules = [], isLoading: isRulesLoading } = useQuery<EligibilityRule[]>({
    queryKey: [`/api/tournaments/${tournamentId}/eligibility-rules`],
    enabled: !!tournamentId,
  });

  const [selectedRuleType, setSelectedRuleType] = useState<string>("AGE_RANGE");
  const [configData, setConfigData] = useState<any>({});

  const form = useForm<InsertEligibilityRule>({
    resolver: zodResolver(insertEligibilityRuleSchema),
    defaultValues: {
      tournamentId: tournamentId || "",
      name: "",
      description: "",
      ruleType: "AGE_RANGE",
      config: {},
      isActive: true,
    },
  });

  const handleCreateRule = async (data: InsertEligibilityRule) => {
    try {
      // Validate config data
      const ruleType = data.ruleType;
      if (ruleType === "AGE_RANGE") {
        if (!configData.minAge && !configData.maxAge) {
          toast({
            title: "Validation Error",
            description: "Please specify at least a minimum or maximum age for the age range rule.",
            variant: "destructive",
          });
          return;
        }
        if (!configData.ageCalculationDate) {
          toast({
            title: "Validation Error",
            description: "Please specify an age calculation date for the age range rule.",
            variant: "destructive",
          });
          return;
        }
      }
      if (ruleType === "GEOGRAPHIC") {
        if (!configData.scope) {
          toast({
            title: "Validation Error",
            description: "Please select a geographic scope (County, Sub-County, or Ward).",
            variant: "destructive",
          });
          return;
        }
        if (!configData.allowedIds || configData.allowedIds.length === 0) {
          toast({
            title: "Validation Error",
            description: "Please specify at least one allowed ID for the geographic rule.",
            variant: "destructive",
          });
          return;
        }
      }
      if (ruleType === "PLAYER_STATUS" && (!configData.allowedStatuses || configData.allowedStatuses.length === 0)) {
        toast({
          title: "Validation Error",
          description: "Please specify at least one allowed status for the player status rule.",
          variant: "destructive",
        });
        return;
      }
      
      // Merge config data before submission
      const payload = {
        ...data,
        config: configData,
      };
      
      const response = await apiRequest("POST", `/api/tournaments/${tournamentId}/eligibility-rules`, payload);
      await response.json();
      
      toast({
        title: "Rule created",
        description: "Eligibility rule has been created successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/eligibility-rules`] });
      setIsCreateDialogOpen(false);
      setConfigData({});
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create eligibility rule.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRule = async (data: Partial<InsertEligibilityRule>) => {
    if (!editingRule) return;
    
    try {
      // Validate config data
      const ruleType = editingRule.ruleType;
      if (ruleType === "AGE_RANGE") {
        if (!configData.minAge && !configData.maxAge) {
          toast({
            title: "Validation Error",
            description: "Please specify at least a minimum or maximum age for the age range rule.",
            variant: "destructive",
          });
          return;
        }
        if (!configData.ageCalculationDate) {
          toast({
            title: "Validation Error",
            description: "Please specify an age calculation date for the age range rule.",
            variant: "destructive",
          });
          return;
        }
      }
      if (ruleType === "GEOGRAPHIC") {
        if (!configData.scope) {
          toast({
            title: "Validation Error",
            description: "Please select a geographic scope (County, Sub-County, or Ward).",
            variant: "destructive",
          });
          return;
        }
        if (!configData.allowedIds || configData.allowedIds.length === 0) {
          toast({
            title: "Validation Error",
            description: "Please specify at least one allowed ID for the geographic rule.",
            variant: "destructive",
          });
          return;
        }
      }
      if (ruleType === "PLAYER_STATUS" && (!configData.allowedStatuses || configData.allowedStatuses.length === 0)) {
        toast({
          title: "Validation Error",
          description: "Please specify at least one allowed status for the player status rule.",
          variant: "destructive",
        });
        return;
      }
      
      // Merge config data before submission
      const payload = {
        ...data,
        config: configData,
      };
      
      const response = await apiRequest("PATCH", `/api/eligibility-rules/${editingRule.id}`, payload);
      await response.json();
      
      toast({
        title: "Rule updated",
        description: "Eligibility rule has been updated successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/eligibility-rules`] });
      setEditingRule(null);
      setConfigData({});
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update eligibility rule.",
        variant: "destructive",
        });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await apiRequest("DELETE", `/api/eligibility-rules/${ruleId}`, undefined);
      
      toast({
        title: "Rule deleted",
        description: "Eligibility rule has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/eligibility-rules`] });
      setDeletingRuleId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete eligibility rule.",
        variant: "destructive",
      });
    }
  };

  const renderConfigDetails = (rule: EligibilityRule) => {
    const config = rule.config as any;
    
    if (rule.ruleType === "AGE_RANGE") {
      return (
        <div className="text-sm">
          Age: {config.minAge || "No min"} - {config.maxAge || "No max"} years
          {config.ageCalculationDate && ` (as of ${format(new Date(config.ageCalculationDate), "MMM d, yyyy")})`}
        </div>
      );
    }
    
    if (rule.ruleType === "GEOGRAPHIC") {
      const scopeLabel = config.scope === "COUNTY" ? "Counties" : config.scope === "SUBCOUNTY" ? "Sub-Counties" : "Wards";
      const ids = config.allowedIds && config.allowedIds.length > 0 ? config.allowedIds.join(", ") : "None";
      
      return (
        <div className="text-sm">
          {scopeLabel}: {ids}
        </div>
      );
    }
    
    if (rule.ruleType === "PLAYER_STATUS") {
      return (
        <div className="text-sm">
          Allowed statuses: {config.allowedStatuses?.join(", ") || "Not specified"}
        </div>
      );
    }
    
    return null;
  };

  if (isTournamentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading tournament...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Tournament not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tournaments">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold" data-testid="text-tournament-name">{tournament.name}</h1>
          <p className="text-muted-foreground mt-1">{tournament.season}</p>
        </div>
        <Badge className={statusColors[tournament.status]} variant="outline" data-testid="badge-status">
          {tournament.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Model:</span>
              <span>{modelLabels[tournament.tournamentModel]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Dates:</span>
              <span className="font-mono">
                {format(new Date(tournament.startDate), "MMM d, yyyy")} - {format(new Date(tournament.endDate), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Eligibility Rules</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) { setSelectedRuleType("AGE_RANGE"); setConfigData({}); } }}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-create-rule">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Eligibility Rule</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateRule)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rule Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Under 18 Age Limit" {...field} data-testid="input-rule-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe this eligibility rule..." 
                              {...field} 
                              value={field.value || ""}
                              data-testid="input-rule-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ruleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rule Type</FormLabel>
                          <Select onValueChange={(value) => { 
                            field.onChange(value); 
                            setSelectedRuleType(value); 
                            setConfigData(value === "GEOGRAPHIC" ? { scope: "COUNTY" } : {}); 
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-rule-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="AGE_RANGE">Age Range</SelectItem>
                              <SelectItem value="GEOGRAPHIC">Geographic</SelectItem>
                              <SelectItem value="PLAYER_STATUS">Player Status</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedRuleType === "AGE_RANGE" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FormLabel>Minimum Age</FormLabel>
                          <Input
                            type="number"
                            placeholder="e.g., 16"
                            value={configData.minAge || ""}
                            onChange={(e) => setConfigData({ ...configData, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                            data-testid="input-min-age"
                          />
                        </div>
                        <div>
                          <FormLabel>Maximum Age</FormLabel>
                          <Input
                            type="number"
                            placeholder="e.g., 18"
                            value={configData.maxAge || ""}
                            onChange={(e) => setConfigData({ ...configData, maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                            data-testid="input-max-age"
                          />
                        </div>
                        <div className="col-span-2">
                          <FormLabel>Age Calculation Date (optional)</FormLabel>
                          <Input
                            type="date"
                            value={configData.ageCalculationDate || ""}
                            onChange={(e) => setConfigData({ ...configData, ageCalculationDate: e.target.value })}
                            data-testid="input-age-calculation-date"
                          />
                        </div>
                      </div>
                    )}
                    
                    {selectedRuleType === "GEOGRAPHIC" && (
                      <div className="space-y-3">
                        <div>
                          <FormLabel>Geographic Scope</FormLabel>
                          <Select 
                            value={configData.scope || "COUNTY"} 
                            onValueChange={(value) => setConfigData({ ...configData, scope: value })}
                          >
                            <SelectTrigger data-testid="select-geographic-scope">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COUNTY">County</SelectItem>
                              <SelectItem value="SUBCOUNTY">Sub-County</SelectItem>
                              <SelectItem value="WARD">Ward</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <FormLabel>Allowed IDs (comma-separated)</FormLabel>
                          <Input
                            placeholder="e.g., id-1, id-2, id-3"
                            value={configData.allowedIds?.join(", ") || ""}
                            onChange={(e) => setConfigData({ ...configData, allowedIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                            data-testid="input-allowed-ids"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter {configData.scope === "COUNTY" ? "county" : configData.scope === "SUBCOUNTY" ? "sub-county" : "ward"} IDs separated by commas
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {selectedRuleType === "PLAYER_STATUS" && (
                      <div>
                        <FormLabel>Allowed Player Statuses (comma-separated)</FormLabel>
                        <Input
                          placeholder="e.g., ACTIVE, REGISTERED"
                          value={configData.allowedStatuses?.join(", ") || ""}
                          onChange={(e) => setConfigData({ ...configData, allowedStatuses: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                          data-testid="input-allowed-statuses"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Common statuses: ACTIVE, REGISTERED, SUSPENDED, etc.</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel">
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-submit">
                        Create Rule
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isRulesLoading ? (
            <p className="text-muted-foreground">Loading rules...</p>
          ) : eligibilityRules.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-2">No eligibility rules defined</p>
              <p className="text-sm text-muted-foreground">Add rules to control which players can participate</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eligibilityRules.map((rule) => (
                <Card key={rule.id} className="hover-elevate" data-testid={`card-rule-${rule.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold" data-testid={`text-rule-name-${rule.id}`}>{rule.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {rule.ruleType.replace("_", " ")}
                          </Badge>
                          {!rule.isActive && (
                            <Badge variant="outline" className="text-xs bg-muted">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                        )}
                        {renderConfigDetails(rule)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingRule(rule);
                            setSelectedRuleType(rule.ruleType);
                            setConfigData(rule.config || {});
                            form.reset({
                              ...rule,
                              config: rule.config || {},
                            });
                          }}
                          data-testid={`button-edit-rule-${rule.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingRuleId(rule.id)}
                          data-testid={`button-delete-rule-${rule.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingRule} onOpenChange={(open) => { if (!open) { setEditingRule(null); setSelectedRuleType("AGE_RANGE"); setConfigData({}); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Eligibility Rule</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateRule)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-rule-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-edit-rule-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedRuleType === "AGE_RANGE" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Minimum Age</FormLabel>
                    <Input
                      type="number"
                      placeholder="e.g., 16"
                      value={configData.minAge || ""}
                      onChange={(e) => setConfigData({ ...configData, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                      data-testid="input-edit-min-age"
                    />
                  </div>
                  <div>
                    <FormLabel>Maximum Age</FormLabel>
                    <Input
                      type="number"
                      placeholder="e.g., 18"
                      value={configData.maxAge || ""}
                      onChange={(e) => setConfigData({ ...configData, maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                      data-testid="input-edit-max-age"
                    />
                  </div>
                  <div className="col-span-2">
                    <FormLabel>Age Calculation Date (required)</FormLabel>
                    <Input
                      type="date"
                      value={configData.ageCalculationDate || ""}
                      onChange={(e) => setConfigData({ ...configData, ageCalculationDate: e.target.value })}
                      data-testid="input-edit-age-calculation-date"
                    />
                  </div>
                </div>
              )}
              
              {selectedRuleType === "GEOGRAPHIC" && (
                <div className="space-y-3">
                  <div>
                    <FormLabel>Geographic Scope</FormLabel>
                    <Select 
                      value={configData.scope || "COUNTY"} 
                      onValueChange={(value) => setConfigData({ ...configData, scope: value })}
                    >
                      <SelectTrigger data-testid="select-edit-geographic-scope">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COUNTY">County</SelectItem>
                        <SelectItem value="SUBCOUNTY">Sub-County</SelectItem>
                        <SelectItem value="WARD">Ward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FormLabel>Allowed IDs (comma-separated)</FormLabel>
                    <Input
                      placeholder="e.g., id-1, id-2, id-3"
                      value={configData.allowedIds?.join(", ") || ""}
                      onChange={(e) => setConfigData({ ...configData, allowedIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                      data-testid="input-edit-allowed-ids"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter {configData.scope === "COUNTY" ? "county" : configData.scope === "SUBCOUNTY" ? "sub-county" : "ward"} IDs separated by commas
                    </p>
                  </div>
                </div>
              )}
              
              {selectedRuleType === "PLAYER_STATUS" && (
                <div>
                  <FormLabel>Allowed Player Statuses (comma-separated)</FormLabel>
                  <Input
                    placeholder="e.g., ACTIVE, REGISTERED"
                    value={configData.allowedStatuses?.join(", ") || ""}
                    onChange={(e) => setConfigData({ ...configData, allowedStatuses: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                    data-testid="input-edit-allowed-statuses"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Common statuses: ACTIVE, REGISTERED, SUSPENDED, etc.</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingRule(null)} data-testid="button-edit-cancel">
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-edit-submit">
                  Update Rule
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingRuleId} onOpenChange={(open) => !open && setDeletingRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Eligibility Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this eligibility rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingRuleId && handleDeleteRule(deletingRuleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-delete-confirm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
