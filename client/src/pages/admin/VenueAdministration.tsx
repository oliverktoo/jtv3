import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Venue {
  id: string;
  name: string;
  type: 'Stadium' | 'Training Ground' | 'Indoor Facility' | 'Community Field' | 'Multi-purpose';
  location: {
    address: string;
    county: string;
    subCounty: string;
    ward: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  capacity: {
    seating: number;
    standing?: number;
    total: number;
    vipBoxes?: number;
  };
  facilities: string[];
  status: 'Active' | 'Under Maintenance' | 'Under Construction' | 'Inactive' | 'Suspended';
  ownership: 'Owned' | 'Leased' | 'Partnership' | 'Government' | 'Private Rental';
  contact: {
    manager: string;
    phone: string;
    email: string;
    emergencyContact: string;
  };
  availability: VenueAvailability[];
  maintenance: MaintenanceRecord[];
  bookings: VenueBooking[];
  costs: {
    rentalRate: number;
    securityDeposit: number;
    cleaningFee: number;
    equipmentFee?: number;
    hourlyRate?: number;
  };
  certifications: {
    safetyCompliance: boolean;
    fireSafety: boolean;
    accessibilityCompliant: boolean;
    lastInspection: string;
    nextInspection: string;
  };
}

interface VenueAvailability {
  id: string;
  date: string;
  timeSlots: {
    start: string;
    end: string;
    available: boolean;
    bookedBy?: string;
    eventType?: string;
  }[];
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Routine' | 'Emergency' | 'Preventive' | 'Repair' | 'Upgrade';
  description: string;
  area: string;
  cost: number;
  contractor?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  completionDate?: string;
  notes?: string;
}

interface VenueBooking {
  id: string;
  venueId: string;
  eventName: string;
  eventType: 'Match' | 'Training' | 'Meeting' | 'Community Event' | 'Tournament' | 'Private Event';
  organizer: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedAttendance: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  paymentStatus: 'Paid' | 'Pending' | 'Overdue' | 'Waived';
  totalCost: number;
  requirements: string[];
  contact: {
    name: string;
    phone: string;
    email: string;
  };
}

export default function VenueAdministration() {
  const venues: Venue[] = [
    {
      id: '1',
      name: 'Nairobi County Stadium',
      type: 'Stadium',
      location: {
        address: 'Kasarani Road, Kasarani',
        county: 'Nairobi',
        subCounty: 'Kasarani',
        ward: 'Kasarani North',
        coordinates: {
          latitude: -1.2232,
          longitude: 36.8913
        }
      },
      capacity: {
        seating: 15000,
        standing: 5000,
        total: 20000,
        vipBoxes: 12
      },
      facilities: [
        'FIFA Standard Pitch',
        'Floodlights',
        'Electronic Scoreboard',
        'VIP Lounges',
        'Press Box',
        'Player Facilities',
        'Medical Room',
        'Parking (500 spaces)',
        'Security Systems',
        'Concession Stands'
      ],
      status: 'Active',
      ownership: 'Government',
      contact: {
        manager: 'James Kiprotich',
        phone: '+254 701 234 567',
        email: 'j.kiprotich@nairobicounty.go.ke',
        emergencyContact: '+254 701 234 568'
      },
      availability: [
        {
          id: '1',
          date: '2024-12-01',
          timeSlots: [
            { start: '09:00', end: '12:00', available: true },
            { start: '14:00', end: '17:00', available: false, bookedBy: 'Nairobi FC', eventType: 'Match' },
            { start: '18:00', end: '21:00', available: true }
          ]
        }
      ],
      maintenance: [
        {
          id: '1',
          date: '2024-11-25',
          type: 'Routine',
          description: 'Pitch maintenance and line marking',
          area: 'Playing Field',
          cost: 150000,
          status: 'Completed',
          completionDate: '2024-11-25'
        }
      ],
      bookings: [
        {
          id: '1',
          venueId: '1',
          eventName: 'County Championship Final',
          eventType: 'Match',
          organizer: 'Nairobi FC',
          date: '2024-12-01',
          startTime: '14:00',
          endTime: '17:00',
          expectedAttendance: 18000,
          status: 'Confirmed',
          paymentStatus: 'Paid',
          totalCost: 800000,
          requirements: ['Security', 'Medical Team', 'Broadcasting Setup', 'VIP Services'],
          contact: {
            name: 'Mary Wanjiku',
            phone: '+254 702 345 678',
            email: 'm.wanjiku@nairobifc.com'
          }
        }
      ],
      costs: {
        rentalRate: 500000,
        securityDeposit: 200000,
        cleaningFee: 50000,
        equipmentFee: 100000
      },
      certifications: {
        safetyCompliance: true,
        fireSafety: true,
        accessibilityCompliant: true,
        lastInspection: '2024-10-15',
        nextInspection: '2025-04-15'
      }
    },
    {
      id: '2',
      name: 'Community Training Center',
      type: 'Training Ground',
      location: {
        address: 'Mathare North Road',
        county: 'Nairobi',
        subCounty: 'Mathare',
        ward: 'Mathare North',
        coordinates: {
          latitude: -1.2545,
          longitude: 36.8612
        }
      },
      capacity: {
        seating: 500,
        total: 1500
      },
      facilities: [
        'Training Pitches (3)',
        'Changing Rooms',
        'Equipment Storage',
        'Basic Medical Facility',
        'Parking (50 spaces)',
        'Refreshment Area',
        'Coach Office'
      ],
      status: 'Active',
      ownership: 'Leased',
      contact: {
        manager: 'Peter Njoroge',
        phone: '+254 703 456 789',
        email: 'p.njoroge@trainingcenter.co.ke',
        emergencyContact: '+254 703 456 790'
      },
      availability: [],
      maintenance: [
        {
          id: '2',
          date: '2024-12-05',
          type: 'Preventive',
          description: 'Goal post safety inspection and repairs',
          area: 'Training Pitch 2',
          cost: 45000,
          status: 'Scheduled'
        }
      ],
      bookings: [],
      costs: {
        rentalRate: 75000,
        securityDeposit: 25000,
        cleaningFee: 10000,
        hourlyRate: 3500
      },
      certifications: {
        safetyCompliance: true,
        fireSafety: false,
        accessibilityCompliant: false,
        lastInspection: '2024-09-20',
        nextInspection: '2025-03-20'
      }
    },
    {
      id: '3',
      name: 'Indoor Sports Complex',
      type: 'Indoor Facility',
      location: {
        address: 'Westlands Avenue',
        county: 'Nairobi',
        subCounty: 'Westlands',
        ward: 'Parklands',
        coordinates: {
          latitude: -1.2634,
          longitude: 36.8047
        }
      },
      capacity: {
        seating: 800,
        total: 1200
      },
      facilities: [
        'Indoor Courts (2)',
        'Air Conditioning',
        'Audio System',
        'LED Lighting',
        'Changing Rooms',
        'Reception Area',
        'Cafeteria',
        'Parking (100 spaces)'
      ],
      status: 'Under Maintenance',
      ownership: 'Private Rental',
      contact: {
        manager: 'Grace Mwangi',
        phone: '+254 704 567 890',
        email: 'g.mwangi@indoorsports.co.ke',
        emergencyContact: '+254 704 567 891'
      },
      availability: [],
      maintenance: [
        {
          id: '3',
          date: '2024-11-28',
          type: 'Repair',
          description: 'Air conditioning system repair',
          area: 'Main Hall',
          cost: 285000,
          contractor: 'CoolAir Systems Ltd',
          status: 'In Progress'
        }
      ],
      bookings: [],
      costs: {
        rentalRate: 125000,
        securityDeposit: 50000,
        cleaningFee: 15000,
        equipmentFee: 25000
      },
      certifications: {
        safetyCompliance: true,
        fireSafety: true,
        accessibilityCompliant: true,
        lastInspection: '2024-08-10',
        nextInspection: '2025-02-10'
      }
    }
  ];

  const upcomingBookings = venues.flatMap(venue => 
    venue.bookings.filter(booking => 
      new Date(booking.date) >= new Date() && booking.status === 'Confirmed'
    )
  );

  const maintenanceSchedule = venues.flatMap(venue => 
    venue.maintenance.filter(maintenance => 
      maintenance.status === 'Scheduled' || maintenance.status === 'In Progress'
    )
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Under Construction': return 'bg-blue-100 text-blue-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: VenueBooking['paymentStatus']) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Waived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOwnershipColor = (ownership: Venue['ownership']) => {
    switch (ownership) {
      case 'Owned': return 'bg-green-100 text-green-800';
      case 'Leased': return 'bg-blue-100 text-blue-800';
      case 'Partnership': return 'bg-purple-100 text-purple-800';
      case 'Government': return 'bg-orange-100 text-orange-800';
      case 'Private Rental': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const getCertificationStatus = (venue: Venue) => {
    const certifications = venue.certifications;
    const total = Object.keys(certifications).filter(key => key !== 'lastInspection' && key !== 'nextInspection').length;
    const compliant = Object.values(certifications).filter((value, index) => 
      index < total && value === true
    ).length;
    return { compliant, total, percentage: Math.round((compliant / total) * 100) };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Venue Administration</h1>
          <p className="text-muted-foreground">Comprehensive venue and facility management system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">🏟️ Add Venue</Button>
          <Button variant="outline">📅 Schedule Booking</Button>
          <Button>📊 Venue Analytics</Button>
        </div>
      </div>

      {/* Venue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{venues.length}</div>
            <div className="text-sm text-muted-foreground">Total Venues</div>
            <div className="text-xs text-blue-600 mt-1">Under management</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{venues.filter(v => v.status === 'Active').length}</div>
            <div className="text-sm text-muted-foreground">Active Venues</div>
            <div className="text-xs text-green-600 mt-1">Currently operational</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{upcomingBookings.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming Bookings</div>
            <div className="text-xs text-purple-600 mt-1">This week</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{maintenanceSchedule.length}</div>
            <div className="text-sm text-muted-foreground">Maintenance Tasks</div>
            <div className="text-xs text-orange-600 mt-1">Scheduled/Active</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Venue Listings */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Portfolio</CardTitle>
              <CardDescription>Complete venue inventory and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {venues.map(venue => {
                  const certStatus = getCertificationStatus(venue);
                  return (
                    <div key={venue.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center text-2xl">
                            {venue.type === 'Stadium' && '🏟️'}
                            {venue.type === 'Training Ground' && '⚽'}
                            {venue.type === 'Indoor Facility' && '🏢'}
                            {venue.type === 'Community Field' && '🌱'}
                            {venue.type === 'Multi-purpose' && '🏗️'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold">{venue.name}</h3>
                              <Badge className={getStatusColor(venue.status)} variant="secondary">
                                {venue.status}
                              </Badge>
                              <Badge className={getOwnershipColor(venue.ownership)} variant="secondary">
                                {venue.ownership}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{venue.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {venue.location.address}, {venue.location.subCounty}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Capacity & Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Capacity</div>
                          <div className="font-bold text-lg">{venue.capacity.total.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Seating</div>
                          <div className="font-semibold">{venue.capacity.seating.toLocaleString()}</div>
                        </div>
                        {venue.capacity.vipBoxes && (
                          <div>
                            <div className="text-sm text-muted-foreground">VIP Boxes</div>
                            <div className="font-semibold">{venue.capacity.vipBoxes}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground">Rental Rate</div>
                          <div className="font-semibold text-green-600">{formatCurrency(venue.costs.rentalRate)}</div>
                        </div>
                      </div>

                      {/* Contact & Certifications */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">Contact Information</h4>
                          <div className="text-sm space-y-1">
                            <div><span className="text-muted-foreground">Manager:</span> {venue.contact.manager}</div>
                            <div><span className="text-muted-foreground">Phone:</span> {venue.contact.phone}</div>
                            <div><span className="text-muted-foreground">Email:</span> {venue.contact.email}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Certifications</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Compliance Status</span>
                              <span className={`text-sm font-semibold ${certStatus.percentage >= 80 ? 'text-green-600' : certStatus.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {certStatus.compliant}/{certStatus.total} ({certStatus.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${certStatus.percentage >= 80 ? 'bg-green-600' : certStatus.percentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                style={{ width: `${certStatus.percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Next inspection: {venue.certifications.nextInspection}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Facilities */}
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Facilities & Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {venue.facilities.slice(0, 6).map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                          {venue.facilities.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{venue.facilities.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Recent Activity */}
                      {venue.bookings.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Recent Bookings</h4>
                          <div className="space-y-2">
                            {venue.bookings.slice(0, 2).map(booking => (
                              <div key={booking.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <div className="font-medium text-sm">{booking.eventName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {booking.date} • {booking.startTime}-{booking.endTime} • {booking.expectedAttendance} expected
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Badge className={getStatusColor(booking.status)} variant="secondary">
                                    {booking.status}
                                  </Badge>
                                  <Badge className={getPaymentStatusColor(booking.paymentStatus)} variant="secondary">
                                    {booking.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">👁️ View Details</Button>
                        <Button variant="outline" size="sm">📅 Schedule</Button>
                        <Button variant="outline" size="sm">🔧 Maintenance</Button>
                        <Button variant="outline" size="sm">📊 Analytics</Button>
                        <Button variant="outline" size="sm">✏️ Edit</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Booking Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Booking Management</CardTitle>
                  <CardDescription>Upcoming and pending venue bookings</CardDescription>
                </div>
                <Button variant="outline" size="sm">📅 New Booking</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">📅</div>
                    <div>No upcoming bookings</div>
                    <Button variant="outline" className="mt-4">Schedule New Booking</Button>
                  </div>
                ) : (
                  upcomingBookings.map(booking => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{booking.eventName}</h3>
                            <Badge className={getStatusColor(booking.status)} variant="secondary">
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Organized by: {booking.organizer} • Type: {booking.eventType}
                          </div>
                          <div className="text-sm">
                            📅 {booking.date} • 🕐 {booking.startTime}-{booking.endTime}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatCurrency(booking.totalCost)}</div>
                          <Badge className={getPaymentStatusColor(booking.paymentStatus)} variant="secondary">
                            {booking.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Expected Attendance:</span>
                          <span className="ml-2 font-semibold">{booking.expectedAttendance.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contact:</span>
                          <span className="ml-2">{booking.contact.name} • {booking.contact.phone}</span>
                        </div>
                      </div>
                      
                      {booking.requirements.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1">Special Requirements:</div>
                          <div className="flex flex-wrap gap-1">
                            {booking.requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">👁️ View</Button>
                        <Button variant="outline" size="sm">✏️ Edit</Button>
                        <Button variant="outline" size="sm">📧 Contact</Button>
                        <Button variant="outline" size="sm">🚫 Cancel</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Schedule */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <CardDescription>Ongoing and scheduled maintenance activities</CardDescription>
                </div>
                <Button variant="outline" size="sm">🔧 Schedule Maintenance</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceSchedule.map(maintenance => (
                  <div key={maintenance.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold">{maintenance.description}</div>
                          <Badge className={getStatusColor(maintenance.status)} variant="secondary">
                            {maintenance.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {maintenance.area} • {maintenance.type} • {maintenance.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(maintenance.cost)}</div>
                        {maintenance.contractor && (
                          <div className="text-xs text-muted-foreground">{maintenance.contractor}</div>
                        )}
                      </div>
                    </div>
                    
                    {maintenance.notes && (
                      <div className="text-sm p-2 bg-gray-50 rounded mt-2">
                        {maintenance.notes}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">👁️ View</Button>
                      <Button variant="outline" size="sm">✏️ Update</Button>
                      <Button variant="outline" size="sm">📋 Complete</Button>
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
              <CardTitle>Venue Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Utilization Rate</span>
                    <span className="text-sm font-semibold">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Revenue Target</span>
                    <span className="text-sm font-semibold">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Maintenance Budget</span>
                    <span className="text-sm font-semibold">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Compliance Score</span>
                    <span className="text-sm font-semibold">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
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
                🏟️ Add New Venue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📅 Schedule Booking
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔧 Request Maintenance
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🗓️ Availability Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Inspections */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {venues
                  .filter(venue => new Date(venue.certifications.nextInspection) <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000))
                  .map(venue => (
                    <div key={venue.id} className="p-3 border rounded">
                      <div className="font-semibold text-sm">{venue.name}</div>
                      <div className="text-xs text-muted-foreground">{venue.type}</div>
                      <div className="text-xs text-orange-600 mt-1">
                        Due: {venue.certifications.nextInspection}
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        Schedule Inspection
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Month</span>
                  <span className="font-bold text-green-600">KES 2.4M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bookings Revenue</span>
                  <span className="font-semibold">KES 1.8M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Equipment Rental</span>
                  <span className="font-semibold">KES 450K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Other Services</span>
                  <span className="font-semibold">KES 150K</span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="text-sm">Maintenance Costs</span>
                  <span className="font-semibold text-red-600">-KES 480K</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span>Net Revenue</span>
                  <span className="text-green-600">KES 1.92M</span>
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
                    <div className="text-sm font-semibold">Booking Confirmed</div>
                    <div className="text-xs text-muted-foreground">Championship Final - Stadium</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Maintenance Completed</div>
                    <div className="text-xs text-muted-foreground">Pitch line marking</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Inspection Due</div>
                    <div className="text-xs text-muted-foreground">Indoor Complex - Fire Safety</div>
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