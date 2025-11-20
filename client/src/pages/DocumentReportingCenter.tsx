import React, { useState } from "react";
import { 
  FileText,
  BarChart3,
  Shield,
  AlertTriangle,
  Target,
  Download,
  Plus,
  Eye,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DocumentReportingCenter() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const stats = {
    documents: { total: 1247, verified: 892, pending: 283, rejected: 72 },
    reports: 47,
    eligibilityRules: 8,
    disciplinaryCases: 23
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document & Reporting Center</h1>
          <p className="text-muted-foreground">
            Comprehensive document management, reporting, eligibility, and compliance center
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{stats.documents.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <Progress value={71.5} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">71.5% verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reports</p>
                <p className="text-2xl font-bold">{stats.reports}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eligibility Rules</p>
                <p className="text-2xl font-bold">{stats.eligibilityRules}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">All active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disciplinary Cases</p>
                <p className="text-2xl font-bold">{stats.disciplinaryCases}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">5 active cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Eligibility
          </TabsTrigger>
          <TabsTrigger value="disciplinary" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Disciplinary
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">3 new documents uploaded</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tournament report generated</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New disciplinary case</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Document Verification</span>
                    <span className="font-semibold">71.5%</span>
                  </div>
                  <Progress value={71.5} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Eligibility Compliance</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Report Generation</span>
                    <span className="font-semibold">98.7%</span>
                  </div>
                  <Progress value={98.7} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => setActiveTab("documents")}
                >
                  <FileText className="w-6 h-6" />
                  <span>Manage Documents</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => setActiveTab("reports")}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>Generate Report</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => setActiveTab("eligibility")}
                >
                  <Shield className="w-6 h-6" />
                  <span>Check Eligibility</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => setActiveTab("disciplinary")}
                >
                  <AlertTriangle className="w-6 h-6" />
                  <span>Report Incident</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Document Management</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export List
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Documents</span>
                  <Badge variant="outline">{stats.documents.total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Verified
                  </span>
                  <Badge variant="default">{stats.documents.verified}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    Pending
                  </span>
                  <Badge variant="secondary">{stats.documents.pending}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Rejected
                  </span>
                  <Badge variant="destructive">{stats.documents.rejected}</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Documents</CardTitle>
                  <CardDescription>Latest document uploads and verification status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium">John Mburu</div>
                            <div className="text-sm text-muted-foreground">KE-NAI-001234</div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">National ID</Badge></TableCell>
                        <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium">Sarah Wanjiku</div>
                            <div className="text-sm text-muted-foreground">KE-KIA-002156</div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">Birth Certificate</Badge></TableCell>
                        <TableCell><Badge variant="default">Verified</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Custom Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Player Registration Report</h3>
                    <p className="text-sm text-muted-foreground">Complete player data export</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Tournament Statistics</h3>
                    <p className="text-sm text-muted-foreground">Match results and standings</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Compliance Report</h3>
                    <p className="text-sm text-muted-foreground">Disciplinary and eligibility summary</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ELIGIBILITY TAB */}
        <TabsContent value="eligibility" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Eligibility Management</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Rules</CardTitle>
                <CardDescription>Tournament eligibility criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Age Limit</h4>
                      <p className="text-sm text-muted-foreground">Governor's Cup 2025</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm mt-2">Players must be between 18-35 years old</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Document Verification</h4>
                      <p className="text-sm text-muted-foreground">All Tournaments</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm mt-2">All identity documents must be verified</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eligibility Checker</CardTitle>
                <CardDescription>Verify player eligibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Enter player name or UPID..." />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="governors-cup">Governor's Cup 2025</SelectItem>
                    <SelectItem value="youth-championship">Youth Championship</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Check Eligibility
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DISCIPLINARY TAB */}
        <TabsContent value="disciplinary" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Disciplinary Management</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Report Incident
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Track disciplinary cases and incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Incident</TableHead>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">Michael Otieno</div>
                        <div className="text-sm text-muted-foreground">KE-MOM-004567</div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">Yellow Card</Badge></TableCell>
                    <TableCell>Governor's Cup Final</TableCell>
                    <TableCell><Badge variant="destructive">Active</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">James Kiptoo</div>
                        <div className="text-sm text-muted-foreground">KE-ELD-005432</div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">Red Card</Badge></TableCell>
                    <TableCell>Premier League</TableCell>
                    <TableCell><Badge variant="secondary">Under Review</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600">5</div>
                <div className="text-sm text-muted-foreground">Active Cases</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">8</div>
                <div className="text-sm text-muted-foreground">Under Review</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">45</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}