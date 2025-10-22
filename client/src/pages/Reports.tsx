import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrganizations } from "@/hooks/useReferenceData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, Users, Trophy, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";

interface PlayerStats {
  totalPlayers: number;
  activeCountPlayers: number;
  inactivePlayers: number;
  byNationality: { nationality: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

interface TournamentStats {
  totalTournaments: number;
  byStatus: { status: string; count: number }[];
  byModel: { model: string; count: number }[];
}

interface DisciplinaryStats {
  totalRecords: number;
  activeRecords: number;
  byType: { type: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

export default function Reports() {
  const { organizations } = useOrganizations();
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const { toast } = useToast();

  const { data: playerStats, isLoading: isLoadingPlayers } = useQuery<PlayerStats>({
    queryKey: [`/api/organizations/${selectedOrg}/reports/players`],
    enabled: !!selectedOrg,
  });

  const { data: tournamentStats, isLoading: isLoadingTournaments } = useQuery<TournamentStats>({
    queryKey: [`/api/organizations/${selectedOrg}/reports/tournaments`],
    enabled: !!selectedOrg,
  });

  const { data: disciplinaryStats, isLoading: isLoadingDisciplinary } = useQuery<DisciplinaryStats>({
    queryKey: [`/api/organizations/${selectedOrg}/reports/disciplinary`],
    enabled: !!selectedOrg,
  });

  const exportPlayersToExcel = () => {
    if (!playerStats) return;

    const orgName = organizations.find((o) => o.id === selectedOrg)?.name || "Organization";
    const timestamp = format(new Date(), "yyyy-MM-dd_HHmm");

    const ws = XLSX.utils.json_to_sheet([
      { Category: "Total Players", Value: playerStats.totalPlayers },
      { Category: "Active Players", Value: playerStats.activeCountPlayers },
      { Category: "Inactive Players", Value: playerStats.inactivePlayers },
      {},
      { Category: "By Nationality", Value: "" },
      ...playerStats.byNationality.map(n => ({ Category: n.nationality, Value: n.count })),
      {},
      { Category: "By Status", Value: "" },
      ...playerStats.byStatus.map(s => ({ Category: s.status, Value: s.count })),
    ]);

    ws["!cols"] = [{ wch: 25 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Player Statistics");
    XLSX.writeFile(wb, `${orgName}_Player_Stats_${timestamp}.xlsx`);

    toast({
      title: "Export successful",
      description: "Player statistics exported to Excel",
    });
  };

  const exportTournamentsToExcel = () => {
    if (!tournamentStats) return;

    const orgName = organizations.find((o) => o.id === selectedOrg)?.name || "Organization";
    const timestamp = format(new Date(), "yyyy-MM-dd_HHmm");

    const ws = XLSX.utils.json_to_sheet([
      { Category: "Total Tournaments", Value: tournamentStats.totalTournaments },
      {},
      { Category: "By Status", Value: "" },
      ...tournamentStats.byStatus.map(s => ({ Category: s.status, Value: s.count })),
      {},
      { Category: "By Model", Value: "" },
      ...tournamentStats.byModel.map(m => ({ Category: m.model, Value: m.count })),
    ]);

    ws["!cols"] = [{ wch: 25 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tournament Statistics");
    XLSX.writeFile(wb, `${orgName}_Tournament_Stats_${timestamp}.xlsx`);

    toast({
      title: "Export successful",
      description: "Tournament statistics exported to Excel",
    });
  };

  const exportDisciplinaryToExcel = () => {
    if (!disciplinaryStats) return;

    const orgName = organizations.find((o) => o.id === selectedOrg)?.name || "Organization";
    const timestamp = format(new Date(), "yyyy-MM-dd_HHmm");

    const ws = XLSX.utils.json_to_sheet([
      { Category: "Total Records", Value: disciplinaryStats.totalRecords },
      { Category: "Active Records", Value: disciplinaryStats.activeRecords },
      {},
      { Category: "By Incident Type", Value: "" },
      ...disciplinaryStats.byType.map(t => ({ Category: t.type, Value: t.count })),
      {},
      { Category: "By Status", Value: "" },
      ...disciplinaryStats.byStatus.map(s => ({ Category: s.status, Value: s.count })),
    ]);

    ws["!cols"] = [{ wch: 25 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Disciplinary Statistics");
    XLSX.writeFile(wb, `${orgName}_Disciplinary_Stats_${timestamp}.xlsx`);

    toast({
      title: "Export successful",
      description: "Disciplinary statistics exported to Excel",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View comprehensive statistics and export reports
        </p>
      </div>

      <div className="max-w-md">
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

      {!selectedOrg ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Select an organization to view reports</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="players" className="space-y-6">
          <TabsList>
            <TabsTrigger value="players" data-testid="tab-players">
              <Users className="w-4 h-4 mr-2" />
              Players
            </TabsTrigger>
            <TabsTrigger value="tournaments" data-testid="tab-tournaments">
              <Trophy className="w-4 h-4 mr-2" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="disciplinary" data-testid="tab-disciplinary">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Disciplinary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Player Statistics</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPlayersToExcel}
                  disabled={!playerStats || isLoadingPlayers}
                  data-testid="button-export-players"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingPlayers ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : !playerStats ? (
                  <p className="text-muted-foreground">No data available</p>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{playerStats.totalPlayers}</div>
                        <div className="text-sm text-muted-foreground">Total Players</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-chart-2">{playerStats.activeCountPlayers}</div>
                        <div className="text-sm text-muted-foreground">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-muted-foreground">{playerStats.inactivePlayers}</div>
                        <div className="text-sm text-muted-foreground">Inactive</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">By Nationality</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nationality</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {playerStats.byNationality.map((item) => (
                            <TableRow key={item.nationality}>
                              <TableCell>{item.nationality || "Unknown"}</TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">By Status</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {playerStats.byStatus.map((item) => (
                            <TableRow key={item.status}>
                              <TableCell>
                                <Badge variant="outline">{item.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Tournament Statistics</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTournamentsToExcel}
                  disabled={!tournamentStats || isLoadingTournaments}
                  data-testid="button-export-tournaments"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingTournaments ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : !tournamentStats ? (
                  <p className="text-muted-foreground">No data available</p>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{tournamentStats.totalTournaments}</div>
                      <div className="text-sm text-muted-foreground">Total Tournaments</div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">By Status</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tournamentStats.byStatus.map((item) => (
                            <TableRow key={item.status}>
                              <TableCell>
                                <Badge variant="outline">{item.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">By Model</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Model</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tournamentStats.byModel.map((item) => (
                            <TableRow key={item.model}>
                              <TableCell>{item.model}</TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disciplinary" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Disciplinary Statistics</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportDisciplinaryToExcel}
                  disabled={!disciplinaryStats || isLoadingDisciplinary}
                  data-testid="button-export-disciplinary"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingDisciplinary ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : !disciplinaryStats ? (
                  <p className="text-muted-foreground">No data available</p>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{disciplinaryStats.totalRecords}</div>
                        <div className="text-sm text-muted-foreground">Total Records</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-destructive">{disciplinaryStats.activeRecords}</div>
                        <div className="text-sm text-muted-foreground">Active</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">By Incident Type</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {disciplinaryStats.byType.map((item) => (
                            <TableRow key={item.type}>
                              <TableCell>{item.type}</TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">By Status</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {disciplinaryStats.byStatus.map((item) => (
                            <TableRow key={item.status}>
                              <TableCell>
                                <Badge variant="outline">{item.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
