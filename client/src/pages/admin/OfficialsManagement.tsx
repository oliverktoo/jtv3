import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Official {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationalId: string;
    phoneNumber: string;
    email: string;
    address: {
      county: string;
      subCounty: string;
      ward: string;
      physicalAddress: string;
    };
  };
  officialInfo: {
    licenseNumber: string;
    role: 'Referee' | 'Assistant Referee' | 'Fourth Official' | 'Match Commissioner' | 'Assessor' | 'Instructor';
    level: 'County' | 'Regional' | 'National' | 'International' | 'FIFA';
    specializations: string[];
    yearsOfExperience: number;
  };
  certifications: {
    id: string;
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    status: 'Valid' | 'Expired' | 'Suspended' | 'Under Review';
    certificateNumber: string;
  }[];
  assignments: OfficialAssignment[];
  performance: {
    matchesOfficiated: number;
    averageRating: number;
    incidentReports: number;
    commendations: number;
    disciplinaryActions: number;
  };
  availability: OfficialAvailability[];
  financials: {
    ratePerMatch: number;
    paymentPreference: 'Bank Transfer' | 'Mobile Money' | 'Cash' | 'Cheque';
    accountDetails?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
    totalEarnings: number;
    pendingPayments: number;
  };
  status: 'Active' | 'Inactive' | 'Suspended' | 'Under Investigation' | 'Retired';
}

interface OfficialAssignment {
  id: string;
  matchId: string;
  matchTitle: string;
  tournament: string;
  venue: string;
  date: string;
  time: string;
  role: Official['officialInfo']['role'];
  status: 'Assigned' | 'Confirmed' | 'Declined' | 'Completed' | 'Cancelled';
  fee: number;
  paymentStatus: 'Pending' | 'Paid' | 'Overdue';
  rating?: number;
  feedback?: string;
  notes?: string;
}

interface OfficialAvailability {
  id: string;
  date: string;
  timeSlots: {
    start: string;
    end: string;
    available: boolean;
    reason?: string;
  }[];
  restrictions?: string[];
}

interface PerformanceMetrics {
  period: string;
  matchesAssigned: number;
  matchesCompleted: number;
  averageRating: number;
  incidentRate: number;
  onTimeRate: number;
  cancellationRate: number;
}

export default function OfficialsManagement() {
  const officials: Official[] = [
    {
      id: '1',
      personalInfo: {
        firstName: 'John',
        lastName: 'Mwangi',
        dateOfBirth: '1985-03-15',
        nationalId: '29485612',
        phoneNumber: '+254 701 234 567',
        email: 'j.mwangi@kenyarefs.org',
        address: {
          county: 'Nairobi',
          subCounty: 'Kasarani',
          ward: 'Kasarani Central',
          physicalAddress: 'P.O. Box 12345, Nairobi'
        }
      },
      officialInfo: {
        licenseNumber: 'KFF-REF-2024-001',
        role: 'Referee',
        level: 'National',
        specializations: ['Football', '11-a-side', 'Youth Matches'],
        yearsOfExperience: 12
      },
      certifications: [
        {
          id: '1',
          name: 'FIFA Basic Referee Course',
          issuingBody: 'Kenya Football Federation',
          issueDate: '2024-01-15',
          expiryDate: '2026-01-15',
          status: 'Valid',
          certificateNumber: 'FIFA-KEN-2024-REF-001'
        },
        {
          id: '2',
          name: 'First Aid Certification',
          issuingBody: 'Kenya Red Cross',
          issueDate: '2024-03-10',
          expiryDate: '2025-03-10',
          status: 'Valid',
          certificateNumber: 'KRC-FA-2024-0145'
        }
      ],
      assignments: [
        {
          id: '1',
          matchId: 'M001',
          matchTitle: 'Nairobi FC vs Mombasa United',
          tournament: 'County Championship',
          venue: 'Nairobi County Stadium',
          date: '2024-12-01',
          time: '15:00',
          role: 'Referee',
          status: 'Confirmed',
          fee: 15000,
          paymentStatus: 'Pending',
          rating: 4.5
        }
      ],
      performance: {
        matchesOfficiated: 156,
        averageRating: 4.3,
        incidentReports: 8,
        commendations: 23,
        disciplinaryActions: 2
      },
      availability: [
        {
          id: '1',
          date: '2024-12-01',
          timeSlots: [
            { start: '09:00', end: '12:00', available: true },
            { start: '14:00', end: '18:00', available: false, reason: 'Match Assignment' }
          ]
        }
      ],
      financials: {
        ratePerMatch: 15000,
        paymentPreference: 'Mobile Money',
        totalEarnings: 2340000,
        pendingPayments: 45000
      },
      status: 'Active'
    },
    {
      id: '2',
      personalInfo: {
        firstName: 'Grace',
        lastName: 'Nyong\'o',
        dateOfBirth: '1990-07-22',
        nationalId: '32178945',
        phoneNumber: '+254 702 345 678',
        email: 'g.nyongo@kenyarefs.org',
        address: {
          county: 'Kisumu',
          subCounty: 'Kisumu Central',
          ward: 'Migosi',
          physicalAddress: 'P.O. Box 5678, Kisumu'
        }
      },
      officialInfo: {
        licenseNumber: 'KFF-AREF-2024-002',
        role: 'Assistant Referee',
        level: 'Regional',
        specializations: ['Football', 'Offside Calls', 'Women\'s Football'],
        yearsOfExperience: 8
      },
      certifications: [
        {
          id: '3',
          name: 'Assistant Referee Certification',
          issuingBody: 'Kenya Football Federation',
          issueDate: '2024-02-20',
          expiryDate: '2026-02-20',
          status: 'Valid',
          certificateNumber: 'KFF-AREF-2024-002'
        }
      ],
      assignments: [],
      performance: {
        matchesOfficiated: 89,
        averageRating: 4.1,
        incidentReports: 3,
        commendations: 15,
        disciplinaryActions: 0
      },
      availability: [],
      financials: {
        ratePerMatch: 8000,
        paymentPreference: 'Bank Transfer',
        accountDetails: {
          bankName: 'Kenya Commercial Bank',
          accountNumber: '1234567890',
          accountName: 'Grace Nyong\'o'
        },
        totalEarnings: 712000,
        pendingPayments: 16000
      },
      status: 'Active'
    },
    {
      id: '3',
      personalInfo: {
        firstName: 'Peter',
        lastName: 'Kamau',
        dateOfBirth: '1978-11-08',
        nationalId: '21654987',
        phoneNumber: '+254 703 456 789',
        email: 'p.kamau@kenyarefs.org',
        address: {
          county: 'Nakuru',
          subCounty: 'Nakuru Town East',
          ward: 'Biashara',
          physicalAddress: 'P.O. Box 9876, Nakuru'
        }
      },
      officialInfo: {
        licenseNumber: 'KFF-MC-2024-003',
        role: 'Match Commissioner',
        level: 'National',
        specializations: ['Match Administration', 'Tournament Management', 'Disciplinary Procedures'],
        yearsOfExperience: 18
      },
      certifications: [
        {
          id: '4',
          name: 'Match Commissioner License',
          issuingBody: 'Kenya Football Federation',
          issueDate: '2024-01-10',
          expiryDate: '2026-01-10',
          status: 'Valid',
          certificateNumber: 'KFF-MC-2024-003'
        },
        {
          id: '5',
          name: 'Sports Management Diploma',
          issuingBody: 'Kenya Institute of Management',
          issueDate: '2020-08-15',
          expiryDate: '2030-08-15',
          status: 'Valid',
          certificateNumber: 'KIM-SM-2020-156'
        }
      ],
      assignments: [],
      performance: {
        matchesOfficiated: 245,
        averageRating: 4.6,
        incidentReports: 12,
        commendations: 38,
        disciplinaryActions: 1
      },
      availability: [],
      financials: {
        ratePerMatch: 20000,
        paymentPreference: 'Bank Transfer',
        accountDetails: {
          bankName: 'Equity Bank',
          accountNumber: '0987654321',
          accountName: 'Peter Kamau'
        },
        totalEarnings: 4900000,
        pendingPayments: 60000
      },
      status: 'Active'
    }
  ];

  const upcomingAssignments = officials.flatMap(official => 
    official.assignments.filter(assignment => 
      new Date(assignment.date) >= new Date() && 
      (assignment.status === 'Assigned' || assignment.status === 'Confirmed')
    )
  );

  const pendingPayments = officials.reduce((total, official) => 
    total + official.financials.pendingPayments, 0
  );

  const performanceMetrics: PerformanceMetrics[] = [
    {
      period: 'November 2024',
      matchesAssigned: 45,
      matchesCompleted: 43,
      averageRating: 4.2,
      incidentRate: 0.05,
      onTimeRate: 0.95,
      cancellationRate: 0.04
    },
    {
      period: 'October 2024',
      matchesAssigned: 52,
      matchesCompleted: 50,
      averageRating: 4.3,
      incidentRate: 0.04,
      onTimeRate: 0.96,
      cancellationRate: 0.04
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': 
      case 'Valid': 
      case 'Confirmed': 
      case 'Completed': 
      case 'Paid': 
        return 'bg-green-100 text-green-800';
      case 'Assigned': 
      case 'Pending': 
      case 'Under Review': 
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': 
      case 'Declined': 
      case 'Cancelled': 
        return 'bg-gray-100 text-gray-800';
      case 'Suspended': 
      case 'Under Investigation': 
      case 'Expired': 
      case 'Overdue': 
        return 'bg-red-100 text-red-800';
      case 'Retired': 
        return 'bg-blue-100 text-blue-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: Official['officialInfo']['role']) => {
    switch (role) {
      case 'Referee': return '👨‍⚖️';
      case 'Assistant Referee': return '🚩';
      case 'Fourth Official': return '4️⃣';
      case 'Match Commissioner': return '📋';
      case 'Assessor': return '📊';
      case 'Instructor': return '👨‍🏫';
      default: return '⚽';
    }
  };

  const getLevelColor = (level: Official['officialInfo']['level']) => {
    switch (level) {
      case 'FIFA': 
      case 'International': 
        return 'bg-purple-100 text-purple-800';
      case 'National': 
        return 'bg-blue-100 text-blue-800';
      case 'Regional': 
        return 'bg-green-100 text-green-800';
      case 'County': 
        return 'bg-orange-100 text-orange-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Officials Management</h1>
          <p className="text-muted-foreground">Comprehensive match officials administration and coordination</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">👨‍⚖️ Register Official</Button>
          <Button variant="outline">📅 Assignment Calendar</Button>
          <Button>📊 Performance Reports</Button>
        </div>
      </div>

      {/* Officials Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{officials.length}</div>
            <div className="text-sm text-muted-foreground">Registered Officials</div>
            <div className="text-xs text-blue-600 mt-1">Active pool</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{officials.filter(o => o.status === 'Active').length}</div>
            <div className="text-sm text-muted-foreground">Active Officials</div>
            <div className="text-xs text-green-600 mt-1">Available for assignment</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{upcomingAssignments.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming Assignments</div>
            <div className="text-xs text-purple-600 mt-1">This week</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingPayments)}</div>
            <div className="text-sm text-muted-foreground">Pending Payments</div>
            <div className="text-xs text-orange-600 mt-1">Outstanding fees</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Officials Directory */}
          <Card>
            <CardHeader>
              <CardTitle>Officials Directory</CardTitle>
              <CardDescription>Complete registry of match officials and their qualifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {officials.map(official => (
                  <div key={official.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                          {getRoleIcon(official.officialInfo.role)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">
                              {official.personalInfo.firstName} {official.personalInfo.lastName}
                            </h3>
                            <Badge className={getStatusColor(official.status)} variant="secondary">
                              {official.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getLevelColor(official.officialInfo.level)} variant="secondary">
                              {official.officialInfo.level} {official.officialInfo.role}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {official.officialInfo.yearsOfExperience} years experience
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Age {calculateAge(official.personalInfo.dateOfBirth)} • 
                            License: {official.officialInfo.licenseNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm text-muted-foreground">Contact</div>
                        <div className="font-semibold">{official.personalInfo.phoneNumber}</div>
                        <div className="text-sm">{official.personalInfo.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Location</div>
                        <div className="font-semibold">{official.personalInfo.address.county}</div>
                        <div className="text-sm">{official.personalInfo.address.subCounty}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Rate per Match</div>
                        <div className="font-semibold text-green-600">{formatCurrency(official.financials.ratePerMatch)}</div>
                        <div className="text-sm">{official.financials.paymentPreference}</div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{official.performance.matchesOfficiated}</div>
                        <div className="text-xs text-muted-foreground">Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{official.performance.averageRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Avg Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{official.performance.commendations}</div>
                        <div className="text-xs text-muted-foreground">Commendations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{official.performance.incidentReports}</div>
                        <div className="text-xs text-muted-foreground">Incidents</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{official.performance.disciplinaryActions}</div>
                        <div className="text-xs text-muted-foreground">Disciplinary</div>
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {official.officialInfo.specializations.map((specialization, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialization}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Certifications</h4>
                      <div className="space-y-2">
                        {official.certifications.map(cert => (
                          <div key={cert.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium text-sm">{cert.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {cert.issuingBody} • Expires: {cert.expiryDate}
                              </div>
                            </div>
                            <Badge className={getStatusColor(cert.status)} variant="secondary">
                              {cert.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Assignments */}
                    {official.assignments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Recent Assignments</h4>
                        <div className="space-y-2">
                          {official.assignments.slice(0, 2).map(assignment => (
                            <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium text-sm">{assignment.matchTitle}</div>
                                <div className="text-xs text-muted-foreground">
                                  {assignment.date} • {assignment.time} • {assignment.venue}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge className={getStatusColor(assignment.status)} variant="secondary">
                                  {assignment.status}
                                </Badge>
                                <div className="text-xs text-right">{formatCurrency(assignment.fee)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-green-50 rounded mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Earnings</div>
                        <div className="font-bold text-green-600">{formatCurrency(official.financials.totalEarnings)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                        <div className="font-bold text-orange-600">{formatCurrency(official.financials.pendingPayments)}</div>
                      </div>
                      {official.financials.accountDetails && (
                        <div>
                          <div className="text-sm text-muted-foreground">Bank</div>
                          <div className="font-semibold text-sm">{official.financials.accountDetails.bankName}</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">👁️ View Profile</Button>
                      <Button variant="outline" size="sm">📅 Assign Match</Button>
                      <Button variant="outline" size="sm">💰 Process Payment</Button>
                      <Button variant="outline" size="sm">📋 Performance Review</Button>
                      <Button variant="outline" size="sm">✏️ Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Assignment Management</CardTitle>
                  <CardDescription>Upcoming match assignments and scheduling</CardDescription>
                </div>
                <Button variant="outline" size="sm">📅 New Assignment</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAssignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">📅</div>
                    <div>No upcoming assignments</div>
                    <Button variant="outline" className="mt-4">Create New Assignment</Button>
                  </div>
                ) : (
                  upcomingAssignments.map(assignment => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{assignment.matchTitle}</h3>
                            <Badge className={getStatusColor(assignment.status)} variant="secondary">
                              {assignment.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Tournament: {assignment.tournament} • Role: {assignment.role}
                          </div>
                          <div className="text-sm">
                            📅 {assignment.date} • 🕐 {assignment.time} • 📍 {assignment.venue}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatCurrency(assignment.fee)}</div>
                          <Badge className={getStatusColor(assignment.paymentStatus)} variant="secondary">
                            {assignment.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      {assignment.rating && (
                        <div className="mb-3 p-2 bg-blue-50 rounded">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Rating:</span>
                            <span className="ml-2 font-semibold">⭐ {assignment.rating}/5</span>
                          </div>
                          {assignment.feedback && (
                            <div className="text-xs text-muted-foreground mt-1">"{assignment.feedback}"</div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">👁️ View Details</Button>
                        <Button variant="outline" size="sm">✏️ Edit Assignment</Button>
                        <Button variant="outline" size="sm">📧 Contact Official</Button>
                        <Button variant="outline" size="sm">🚫 Cancel</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Overall performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{metric.period}</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{metric.matchesAssigned}</div>
                        <div className="text-xs text-muted-foreground">Assigned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{metric.matchesCompleted}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{metric.averageRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Avg Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{(metric.incidentRate * 100).toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Incident Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{(metric.onTimeRate * 100).toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">On Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{(metric.cancellationRate * 100).toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Cancellation</div>
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
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Officials Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Active Officials</span>
                    <span className="text-sm font-semibold">93%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '93%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Certification Compliance</span>
                    <span className="text-sm font-semibold">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Assignment Fill Rate</span>
                    <span className="text-sm font-semibold">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Payment Processing</span>
                    <span className="text-sm font-semibold">82%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Officials by Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>👨‍⚖️</span>
                  <span className="text-sm">Referees</span>
                </div>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🚩</span>
                  <span className="text-sm">Assistant Referees</span>
                </div>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>4️⃣</span>
                  <span className="text-sm">Fourth Officials</span>
                </div>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span className="text-sm">Match Commissioners</span>
                </div>
                <span className="font-semibold">6</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span className="text-sm">Assessors</span>
                </div>
                <span className="font-semibold">4</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                👨‍⚖️ Register New Official
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📅 Create Assignment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💰 Process Payments
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Performance Review
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎓 Training Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Expiring Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certification Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {officials
                  .filter(official => 
                    official.certifications.some(cert => 
                      new Date(cert.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    )
                  )
                  .map(official => (
                    <div key={official.id} className="p-3 border rounded">
                      <div className="font-semibold text-sm">
                        {official.personalInfo.firstName} {official.personalInfo.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{official.officialInfo.role}</div>
                      <div className="text-xs text-red-600 mt-1">
                        Certification expiring soon
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        Review Certifications
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Month</span>
                  <span className="font-bold text-green-600">KES 1.2M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Processed Payments</span>
                  <span className="font-semibold">KES 956K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Payments</span>
                  <span className="font-semibold text-orange-600">KES {pendingPayments.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average per Match</span>
                  <span className="font-semibold">KES 12,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Officials Paid</span>
                  <span className="font-semibold">28</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Assignment Confirmed</div>
                    <div className="text-xs text-muted-foreground">John Mwangi - County Championship</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Payment Processed</div>
                    <div className="text-xs text-muted-foreground">Grace Nyong'o - KES 15,000</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Certification Expiring</div>
                    <div className="text-xs text-muted-foreground">Peter Kamau - First Aid Certificate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}