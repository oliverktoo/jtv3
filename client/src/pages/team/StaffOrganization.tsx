import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: 'Technical' | 'Medical' | 'Administration' | 'Operations';
  experience: string;
  license: string;
  contact: string;
  salary: string;
  contract: string;
  status: 'Active' | 'Leave' | 'Suspended';
}

interface Department {
  name: string;
  headCount: number;
  budget: string;
  vacancies: number;
}

export default function StaffOrganization() {
  const staffMembers: StaffMember[] = [
    { id: '1', name: 'John Kamau', role: 'Head Coach', department: 'Technical', experience: '15 years', license: 'CAF A', contact: '+254 701 234 567', salary: '850K', contract: '2026', status: 'Active' },
    { id: '2', name: 'Peter Njoroge', role: 'Assistant Coach', department: 'Technical', experience: '8 years', license: 'CAF B', contact: '+254 701 234 568', salary: '450K', contract: '2025', status: 'Active' },
    { id: '3', name: 'Mary Wanjiku', role: 'Physiotherapist', department: 'Medical', experience: '10 years', license: 'Licensed Physio', contact: '+254 701 234 569', salary: '380K', contract: '2027', status: 'Active' },
    { id: '4', name: 'Grace Mutindi', role: 'Team Manager', department: 'Administration', experience: '12 years', license: 'FKF Certified', contact: '+254 701 234 570', salary: '320K', contract: '2025', status: 'Active' },
    { id: '5', name: 'Dr. Samuel Ochieng', role: 'Team Doctor', department: 'Medical', experience: '18 years', license: 'Medical License', contact: '+254 701 234 571', salary: '650K', contract: '2026', status: 'Active' },
    { id: '6', name: 'James Mwenda', role: 'Equipment Manager', department: 'Operations', experience: '6 years', license: 'Certified', contact: '+254 701 234 572', salary: '180K', contract: '2025', status: 'Leave' },
  ];

  const departments: Department[] = [
    { name: 'Technical', headCount: 4, budget: '2.1M', vacancies: 1 },
    { name: 'Medical', headCount: 3, budget: '1.4M', vacancies: 0 },
    { name: 'Administration', headCount: 2, budget: '650K', vacancies: 0 },
    { name: 'Operations', headCount: 3, budget: '480K', vacancies: 1 }
  ];

  const getStatusColor = (status: StaffMember['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentColor = (department: StaffMember['department']) => {
    switch (department) {
      case 'Technical': return 'bg-blue-100 text-blue-800';
      case 'Medical': return 'bg-red-100 text-red-800';
      case 'Administration': return 'bg-purple-100 text-purple-800';
      case 'Operations': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Staff Organization</h1>
          <p className="text-muted-foreground">Manage coaching staff, support personnel, and organizational structure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Staff Report</Button>
          <Button>➕ Add Staff Member</Button>
        </div>
      </div>

      {/* Department Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Department Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {departments.map(dept => (
            <Card key={dept.name}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">{dept.name} Department</CardDescription>
                <CardTitle className="text-2xl font-bold">{dept.headCount}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Budget: {dept.budget}</div>
                  <div>Vacancies: {dept.vacancies}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Directory */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Staff Directory</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">🔍 Filter</Button>
                  <Button variant="outline" size="sm">📄 Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Department Filter */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {['All', 'Technical', 'Medical', 'Administration', 'Operations'].map(dept => (
                  <button
                    key={dept}
                    className={`px-4 py-2 rounded text-sm whitespace-nowrap ${
                      dept === 'All' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              {/* Staff List */}
              <div className="space-y-4">
                {staffMembers.map(member => (
                  <div key={member.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getDepartmentColor(member.department)} variant="secondary">
                          {member.department}
                        </Badge>
                        <Badge className={getStatusColor(member.status)} variant="secondary">
                          {member.status}
                        </Badge>
                        <button className="p-2 hover:bg-gray-200 rounded">⋮</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-xs text-muted-foreground">Experience</div>
                        <div>{member.experience}</div>
                      </div>
                      <div>
                        <div className="font-medium text-xs text-muted-foreground">License</div>
                        <div>{member.license}</div>
                      </div>
                      <div>
                        <div className="font-medium text-xs text-muted-foreground">Contact</div>
                        <div>{member.contact}</div>
                      </div>
                      <div>
                        <div className="font-medium text-xs text-muted-foreground">Contract</div>
                        <div>Until {member.contract}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Salary: </span>
                        <span className="font-semibold">{member.salary} KSH/month</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">✏️ Edit</Button>
                        <Button variant="outline" size="sm">📞 Contact</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organizational Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Organizational Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Head Coach */}
                <div className="text-center">
                  <div className="p-3 bg-blue-100 border border-blue-200 rounded font-semibold text-sm">
                    Head Coach
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">John Kamau</div>
                </div>

                {/* Second Level */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs font-medium">
                      Assistant Coach
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Peter Njoroge</div>
                  </div>
                  <div className="text-center">
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs font-medium">
                      Team Doctor
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Dr. Samuel</div>
                  </div>
                </div>

                {/* Third Level */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs font-medium">
                      Team Manager
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Grace Mutindi</div>
                  </div>
                  <div className="text-center">
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs font-medium">
                      Physiotherapist
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Mary Wanjiku</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Staff:</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active:</span>
                  <span className="font-bold text-green-600">11</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>On Leave:</span>
                  <span className="font-bold text-yellow-600">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Experience:</span>
                  <span className="font-bold">10.2 years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly Payroll:</span>
                  <span className="font-bold">4.63M KSH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Open Positions:</span>
                  <span className="font-bold text-orange-600">2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium text-sm">New Hire</div>
                  <div className="text-xs text-muted-foreground">Dr. Samuel Ochieng joined as Team Doctor</div>
                  <div className="text-xs text-green-600">2 days ago</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-sm">Leave Request</div>
                  <div className="text-xs text-muted-foreground">James Mwenda - Equipment Manager</div>
                  <div className="text-xs text-yellow-600">5 days ago</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-sm">License Renewal</div>
                  <div className="text-xs text-muted-foreground">Peter Njoroge completed CAF B renewal</div>
                  <div className="text-xs text-blue-600">1 week ago</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                👥 Add Staff Member
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Staff Evaluation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💼 Contract Management
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎓 Training & Development
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Performance Review
              </Button>
            </CardContent>
          </Card>

          {/* Contract Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-sm text-red-800">Expiring Soon</div>
                  <div className="text-xs text-red-600">Peter Njoroge, Grace Mutindi (2025)</div>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="font-medium text-sm text-orange-800">License Renewal</div>
                  <div className="text-xs text-orange-600">2 staff licenses expire in Q1 2025</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}