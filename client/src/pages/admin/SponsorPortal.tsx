import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Sponsor {
  id: string;
  name: string;
  type: 'Title Sponsor' | 'Main Partner' | 'Official Partner' | 'Supporter' | 'Media Partner';
  logo: string;
  contactPerson: string;
  email: string;
  phone: string;
  contractDetails: {
    startDate: string;
    endDate: string;
    value: number;
    currency: string;
    paymentSchedule: 'Monthly' | 'Quarterly' | 'Annual' | 'Lump Sum';
    status: 'Active' | 'Pending Renewal' | 'Expired' | 'Under Negotiation';
  };
  benefits: string[];
  deliverables: SponsorDeliverable[];
  metrics: {
    brandExposure: number;
    eventAttendance: number;
    mediaReach: number;
    socialEngagement: number;
  };
}

interface SponsorDeliverable {
  id: string;
  description: string;
  type: 'Logo Placement' | 'Event Activation' | 'Digital Content' | 'Media Coverage' | 'Hospitality';
  status: 'Completed' | 'In Progress' | 'Pending' | 'Overdue';
  dueDate: string;
  completionDate?: string;
  value: number;
}

interface SponsorshipOpportunity {
  id: string;
  title: string;
  description: string;
  category: 'Tournament Title' | 'Team Sponsorship' | 'Event Naming' | 'Equipment' | 'Digital' | 'Hospitality';
  value: number;
  duration: string;
  benefits: string[];
  target: string;
  status: 'Available' | 'Under Discussion' | 'Sold' | 'Reserved';
  interestedParties: string[];
}

interface Contract {
  id: string;
  sponsorId: string;
  sponsorName: string;
  title: string;
  value: number;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Under Review' | 'Signed' | 'Active' | 'Expired' | 'Terminated';
  paymentStatus: 'Up to Date' | 'Overdue' | 'Pending' | 'Disputed';
  nextPaymentDue: string;
  nextPaymentAmount: number;
  renewalDate: string;
  autoRenewal: boolean;
}

export default function SponsorPortal() {
  const sponsors: Sponsor[] = [
    {
      id: '1',
      name: 'Nairobi Regional Bank',
      type: 'Title Sponsor',
      logo: '/logos/nairobi-bank.png',
      contactPerson: 'Sarah Kimani',
      email: 's.kimani@nairobibank.co.ke',
      phone: '+254 701 234 567',
      contractDetails: {
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        value: 15000000,
        currency: 'KES',
        paymentSchedule: 'Quarterly',
        status: 'Active'
      },
      benefits: [
        'Title naming rights',
        'Logo on all team jerseys',
        'Stadium naming rights',
        'VIP hospitality boxes',
        'Digital media rights',
        'Exclusive banking partner status'
      ],
      deliverables: [
        {
          id: '1',
          description: 'Logo placement on team jerseys for Q4 2024',
          type: 'Logo Placement',
          status: 'Completed',
          dueDate: '2024-10-01',
          completionDate: '2024-09-28',
          value: 500000
        },
        {
          id: '2',
          description: 'VIP hospitality for championship final',
          type: 'Hospitality',
          status: 'Completed',
          dueDate: '2024-11-28',
          completionDate: '2024-11-28',
          value: 800000
        }
      ],
      metrics: {
        brandExposure: 2500000,
        eventAttendance: 45000,
        mediaReach: 1200000,
        socialEngagement: 156000
      }
    },
    {
      id: '2',
      name: 'SportTech Solutions',
      type: 'Official Partner',
      logo: '/logos/sporttech.png',
      contactPerson: 'Michael Ochieng',
      email: 'm.ochieng@sporttech.com',
      phone: '+254 702 345 678',
      contractDetails: {
        startDate: '2024-06-01',
        endDate: '2025-05-31',
        value: 8500000,
        currency: 'KES',
        paymentSchedule: 'Annual',
        status: 'Active'
      },
      benefits: [
        'Official technology partner',
        'Equipment branding rights',
        'Training facility signage',
        'Digital platform integration',
        'Player performance data access'
      ],
      deliverables: [
        {
          id: '3',
          description: 'Performance analytics dashboard setup',
          type: 'Digital Content',
          status: 'In Progress',
          dueDate: '2024-12-15',
          value: 1200000
        },
        {
          id: '4',
          description: 'Training equipment branding',
          type: 'Logo Placement',
          status: 'Completed',
          dueDate: '2024-08-01',
          completionDate: '2024-07-28',
          value: 600000
        }
      ],
      metrics: {
        brandExposure: 800000,
        eventAttendance: 25000,
        mediaReach: 650000,
        socialEngagement: 89000
      }
    },
    {
      id: '3',
      name: 'Kenya Sports Apparel',
      type: 'Main Partner',
      logo: '/logos/kenya-sports.png',
      contactPerson: 'Grace Wanjiku',
      email: 'g.wanjiku@kenyasports.co.ke',
      phone: '+254 703 456 789',
      contractDetails: {
        startDate: '2024-03-01',
        endDate: '2025-02-28',
        value: 6200000,
        currency: 'KES',
        paymentSchedule: 'Monthly',
        status: 'Pending Renewal'
      },
      benefits: [
        'Official kit supplier',
        'Training wear branding',
        'Retail merchandise rights',
        'Player endorsement opportunities',
        'Fashion show participation'
      ],
      deliverables: [
        {
          id: '5',
          description: 'New season kit delivery',
          type: 'Event Activation',
          status: 'Pending',
          dueDate: '2024-12-10',
          value: 1500000
        }
      ],
      metrics: {
        brandExposure: 1200000,
        eventAttendance: 35000,
        mediaReach: 780000,
        socialEngagement: 124000
      }
    }
  ];

  const sponsorshipOpportunities: SponsorshipOpportunity[] = [
    {
      id: '1',
      title: 'Youth Academy Naming Rights',
      description: 'Exclusive naming rights for our new youth development academy facility',
      category: 'Event Naming',
      value: 5000000,
      duration: '3 years',
      benefits: [
        'Facility naming rights',
        'Youth program branding',
        'Community engagement opportunities',
        'Media coverage of youth events',
        'CSR partnership opportunities'
      ],
      target: 'Financial institutions, education companies, youth-focused brands',
      status: 'Available',
      interestedParties: ['Future Bank', 'Education Plus Ltd.']
    },
    {
      id: '2',
      title: 'Digital Match Center Sponsorship',
      description: 'Sponsor our digital match center and live streaming platform',
      category: 'Digital',
      value: 2500000,
      duration: '2 years',
      benefits: [
        'Digital platform branding',
        'Live stream sponsorship',
        'Mobile app integration',
        'Social media content rights',
        'Fan engagement analytics'
      ],
      target: 'Technology companies, telecom providers, digital platforms',
      status: 'Under Discussion',
      interestedParties: ['TechCorp Kenya', 'Digital Solutions Ltd.']
    },
    {
      id: '3',
      title: 'Player Wellness Program Partnership',
      description: 'Partner with our comprehensive player health and wellness program',
      category: 'Equipment',
      value: 3200000,
      duration: '2 years',
      benefits: [
        'Medical facility branding',
        'Wellness program association',
        'Health campaign participation',
        'Medical equipment visibility',
        'Professional network access'
      ],
      target: 'Healthcare providers, wellness brands, medical equipment companies',
      status: 'Available',
      interestedParties: ['HealthCare Plus', 'Wellness International']
    }
  ];

  const contracts: Contract[] = [
    {
      id: '1',
      sponsorId: '1',
      sponsorName: 'Nairobi Regional Bank',
      title: 'Title Sponsorship Agreement 2024-2026',
      value: 15000000,
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      status: 'Active',
      paymentStatus: 'Up to Date',
      nextPaymentDue: '2024-12-31',
      nextPaymentAmount: 3750000,
      renewalDate: '2026-09-30',
      autoRenewal: true
    },
    {
      id: '2',
      sponsorId: '2',
      sponsorName: 'SportTech Solutions',
      title: 'Technology Partnership Agreement',
      value: 8500000,
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      status: 'Active',
      paymentStatus: 'Up to Date',
      nextPaymentDue: '2025-05-31',
      nextPaymentAmount: 8500000,
      renewalDate: '2025-02-28',
      autoRenewal: false
    },
    {
      id: '3',
      sponsorId: '3',
      sponsorName: 'Kenya Sports Apparel',
      title: 'Kit Supply and Branding Agreement',
      value: 6200000,
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      status: 'Active',
      paymentStatus: 'Up to Date',
      nextPaymentDue: '2024-12-01',
      nextPaymentAmount: 516667,
      renewalDate: '2024-12-01',
      autoRenewal: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending Renewal': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Under Negotiation': return 'bg-blue-100 text-blue-800';
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Under Discussion': return 'bg-yellow-100 text-yellow-800';
      case 'Sold': return 'bg-red-100 text-red-800';
      case 'Reserved': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Signed': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Contract['paymentStatus']) => {
    switch (status) {
      case 'Up to Date': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (type: Sponsor['type']) => {
    switch (type) {
      case 'Title Sponsor': return 'bg-gold-100 text-gold-800 border-gold-300';
      case 'Main Partner': return 'bg-silver-100 text-silver-800 border-silver-300';
      case 'Official Partner': return 'bg-bronze-100 text-bronze-800 border-bronze-300';
      case 'Supporter': return 'bg-blue-100 text-blue-800';
      case 'Media Partner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${(amount / 1000000).toFixed(1)}M`;
  };

  const formatAmount = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sponsor Portal</h1>
          <p className="text-muted-foreground">Comprehensive sponsorship and partnership management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">🤝 New Sponsor</Button>
          <Button variant="outline">💰 Create Opportunity</Button>
          <Button>📊 Sponsor Dashboard</Button>
        </div>
      </div>

      {/* Sponsorship Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(sponsors.reduce((total, sponsor) => total + sponsor.contractDetails.value, 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Sponsorship Value</div>
            <div className="text-xs text-green-600 mt-1">Active contracts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{sponsors.filter(s => s.contractDetails.status === 'Active').length}</div>
            <div className="text-sm text-muted-foreground">Active Sponsors</div>
            <div className="text-xs text-blue-600 mt-1">Current partnerships</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{sponsorshipOpportunities.filter(o => o.status === 'Available').length}</div>
            <div className="text-sm text-muted-foreground">Available Opportunities</div>
            <div className="text-xs text-purple-600 mt-1">Ready for sale</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{contracts.filter(c => c.paymentStatus === 'Up to Date').length}</div>
            <div className="text-sm text-muted-foreground">Contracts Current</div>
            <div className="text-xs text-orange-600 mt-1">Payment status</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Sponsors */}
          <Card>
            <CardHeader>
              <CardTitle>Current Sponsors</CardTitle>
              <CardDescription>Active sponsorship partnerships and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sponsors.map(sponsor => (
                  <div key={sponsor.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <div className="text-2xl">🏢</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">{sponsor.name}</h3>
                            <Badge className={getTierColor(sponsor.type)} variant="secondary">
                              {sponsor.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{sponsor.contactPerson}</div>
                          <div className="text-sm text-muted-foreground">{sponsor.email}</div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(sponsor.contractDetails.status)} variant="secondary">
                        {sponsor.contractDetails.status}
                      </Badge>
                    </div>

                    {/* Contract Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm text-muted-foreground">Contract Value</div>
                        <div className="font-bold text-lg text-green-600">
                          {formatCurrency(sponsor.contractDetails.value)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Contract Period</div>
                        <div className="font-semibold">
                          {sponsor.contractDetails.startDate} - {sponsor.contractDetails.endDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Payment Schedule</div>
                        <div className="font-semibold">{sponsor.contractDetails.paymentSchedule}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Currency</div>
                        <div className="font-semibold">{sponsor.contractDetails.currency}</div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-blue-50 rounded">
                      <div className="text-center">
                        <div className="font-bold text-lg">{sponsor.metrics.brandExposure.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Brand Exposure</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{sponsor.metrics.eventAttendance.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Event Attendance</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{sponsor.metrics.mediaReach.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Media Reach</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{sponsor.metrics.socialEngagement.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Social Engagement</div>
                      </div>
                    </div>

                    {/* Recent Deliverables */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Recent Deliverables</h4>
                      <div className="space-y-2">
                        {sponsor.deliverables.slice(0, 2).map(deliverable => (
                          <div key={deliverable.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium text-sm">{deliverable.description}</div>
                              <div className="text-xs text-muted-foreground">
                                Due: {deliverable.dueDate} • Value: {formatAmount(deliverable.value)}
                              </div>
                            </div>
                            <Badge className={getStatusColor(deliverable.status)} variant="secondary">
                              {deliverable.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">👁️ View Details</Button>
                      <Button variant="outline" size="sm">📊 Performance Report</Button>
                      <Button variant="outline" size="sm">📞 Contact</Button>
                      <Button variant="outline" size="sm">📝 Renew Contract</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Opportunities */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Sponsorship Opportunities</CardTitle>
                  <CardDescription>Available partnerships and sponsorship packages</CardDescription>
                </div>
                <Button variant="outline" size="sm">➕ Create New</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sponsorshipOpportunities.map(opportunity => (
                  <div key={opportunity.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{opportunity.title}</h3>
                          <Badge className={getStatusColor(opportunity.status)} variant="secondary">
                            {opportunity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{opportunity.description}</p>
                        <div className="text-sm">
                          <span className="font-medium">Category:</span> {opportunity.category} • 
                          <span className="font-medium"> Duration:</span> {opportunity.duration}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-green-600">
                          {formatCurrency(opportunity.value)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Value</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">Key Benefits:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {opportunity.benefits.map((benefit, index) => (
                          <div key={index} className="text-xs p-1 bg-green-50 border border-green-200 rounded">
                            ✓ {benefit}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium">Target Audience:</div>
                      <div className="text-sm text-muted-foreground">{opportunity.target}</div>
                    </div>

                    {opportunity.interestedParties.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Interested Parties:</div>
                        <div className="flex flex-wrap gap-1">
                          {opportunity.interestedParties.map((party, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {party}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">📄 View Package</Button>
                      <Button variant="outline" size="sm">📧 Send Proposal</Button>
                      <Button variant="outline" size="sm">📞 Discuss</Button>
                      <Button size="sm">🤝 Mark as Sold</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Management */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Management</CardTitle>
              <CardDescription>Active contracts and payment tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.map(contract => (
                  <div key={contract.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{contract.title}</h3>
                        <div className="text-sm text-muted-foreground">{contract.sponsorName}</div>
                        <div className="text-sm">
                          {contract.startDate} - {contract.endDate} • {formatCurrency(contract.value)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(contract.status)} variant="secondary">
                          {contract.status}
                        </Badge>
                        <Badge className={getPaymentStatusColor(contract.paymentStatus)} variant="secondary">
                          {contract.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Next Payment:</span>
                        <div className="font-semibold">{formatAmount(contract.nextPaymentAmount)}</div>
                        <div className="text-xs text-muted-foreground">Due: {contract.nextPaymentDue}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Renewal Date:</span>
                        <div className="font-semibold">{contract.renewalDate}</div>
                        <div className="text-xs text-muted-foreground">
                          {contract.autoRenewal ? 'Auto-renewal enabled' : 'Manual renewal required'}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contract Status:</span>
                        <div className="font-semibold">{contract.status}</div>
                        <div className="text-xs text-muted-foreground">Current state</div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">📄 View Contract</Button>
                      <Button variant="outline" size="sm">💰 Payment History</Button>
                      <Button variant="outline" size="sm">📝 Renew</Button>
                      <Button variant="outline" size="sm">📧 Send Reminder</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Total Active Value</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(sponsors.reduce((total, sponsor) => 
                        sponsor.contractDetails.status === 'Active' ? total + sponsor.contractDetails.value : total, 0
                      ))}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Pending Renewals</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {formatCurrency(sponsors.reduce((total, sponsor) => 
                        sponsor.contractDetails.status === 'Pending Renewal' ? total + sponsor.contractDetails.value : total, 0
                      ))}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Available Opportunities</span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatCurrency(sponsorshipOpportunities.reduce((total, opp) => 
                        opp.status === 'Available' ? total + opp.value : total, 0
                      ))}
                    </span>
                  </div>
                </div>
                
                <hr />
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Potential Total</span>
                    <span className="text-sm font-bold">
                      {formatCurrency(
                        sponsors.reduce((total, sponsor) => total + sponsor.contractDetails.value, 0) +
                        sponsorshipOpportunities.reduce((total, opp) => 
                          opp.status === 'Available' ? total + opp.value : total, 0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Renewals */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contracts
                  .filter(contract => new Date(contract.renewalDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
                  .map(contract => (
                    <div key={contract.id} className="p-3 border rounded">
                      <div className="font-semibold text-sm">{contract.sponsorName}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(contract.value)}</div>
                      <div className="text-xs text-yellow-600 mt-1">
                        Renewal due: {contract.renewalDate}
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        Start Renewal
                      </Button>
                    </div>
                  ))}
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
                🤝 Add New Sponsor
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💰 Create Opportunity
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📧 Send Proposal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📞 Schedule Meeting
              </Button>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Sponsor Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Brand Exposure</span>
                    <span className="text-sm font-semibold">4.5M</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Contract Fulfillment</span>
                    <span className="text-sm font-semibold">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Payment Status</span>
                    <span className="text-sm font-semibold">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Renewal Rate</span>
                    <span className="text-sm font-semibold">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
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