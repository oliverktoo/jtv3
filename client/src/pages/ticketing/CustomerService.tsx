import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CustomerTicket {
  id: string;
  eventName: string;
  ticketType: string;
  purchaseDate: string;
  amount: number;
  status: 'Active' | 'Used' | 'Refunded' | 'Expired';
  qrCode: string;
  seatNumber?: string;
}

interface CustomerInquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  type: 'Refund Request' | 'Ticket Issue' | 'Event Question' | 'Technical Support' | 'Complaint';
  subject: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  createdDate: string;
  lastUpdate: string;
}

interface RefundRequest {
  id: string;
  customerName: string;
  ticketId: string;
  eventName: string;
  reason: string;
  requestDate: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  reviewedBy?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'Tickets' | 'Events' | 'Refunds' | 'Technical' | 'General';
  views: number;
  helpful: number;
}

export default function CustomerService() {
  const inquiries: CustomerInquiry[] = [
    {
      id: '1',
      customerName: 'John Kamau',
      email: 'john.kamau@email.com',
      phone: '+254701234567',
      type: 'Refund Request',
      subject: 'Request refund for cancelled match',
      description: 'Hello, I purchased VIP tickets for the match on Nov 15th which was cancelled due to weather. I would like to request a full refund.',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Grace Mutindi',
      createdDate: '2024-11-16',
      lastUpdate: '2 hours ago'
    },
    {
      id: '2',
      customerName: 'Mary Wanjiku',
      email: 'mary.w@email.com',
      phone: '+254701234568',
      type: 'Technical Support',
      subject: 'QR code not scanning at gate',
      description: 'My QR code is not working at the stadium entrance. I have tried multiple times but it shows as invalid.',
      priority: 'High',
      status: 'Open',
      assignedTo: 'Technical Team',
      createdDate: '2024-11-16',
      lastUpdate: '30 minutes ago'
    },
    {
      id: '3',
      customerName: 'Peter Njoroge',
      email: 'peter.njoroge@email.com',
      phone: '+254701234569',
      type: 'Event Question',
      subject: 'Parking information for upcoming match',
      description: 'Could you provide information about parking arrangements for the Governor\'s Cup final?',
      priority: 'Medium',
      status: 'Resolved',
      assignedTo: 'Customer Care',
      createdDate: '2024-11-15',
      lastUpdate: '1 day ago'
    }
  ];

  const refundRequests: RefundRequest[] = [
    {
      id: '1',
      customerName: 'John Kamau',
      ticketId: 'TKT-001234',
      eventName: 'Nairobi FC vs Thika United',
      reason: 'Event cancelled due to weather',
      requestDate: '2024-11-16',
      amount: 1500,
      status: 'Pending',
    },
    {
      id: '2',
      customerName: 'Sarah Muthoni',
      ticketId: 'TKT-001189',
      eventName: 'Youth Championship',
      reason: 'Personal emergency - cannot attend',
      requestDate: '2024-11-15',
      amount: 300,
      status: 'Approved',
      reviewedBy: 'Grace Mutindi'
    }
  ];

  const customerTickets: CustomerTicket[] = [
    { id: '1', eventName: 'Nairobi FC vs Machakos United', ticketType: 'VIP', purchaseDate: '2024-11-15', amount: 1500, status: 'Active', qrCode: 'QR123456789', seatNumber: 'A-15' },
    { id: '2', eventName: 'Youth Tournament Final', ticketType: 'Family', purchaseDate: '2024-11-10', amount: 300, status: 'Used', qrCode: 'QR123456790' },
    { id: '3', eventName: 'Community Festival', ticketType: 'General', purchaseDate: '2024-11-08', amount: 200, status: 'Refunded', qrCode: 'QR123456791' }
  ];

  const faqs: FAQ[] = [
    { id: '1', question: 'How do I get a refund for my ticket?', answer: 'Refunds can be requested through our customer service portal or by contacting support directly. Refunds are processed within 5-7 business days.', category: 'Refunds', views: 1250, helpful: 980 },
    { id: '2', question: 'Can I transfer my ticket to someone else?', answer: 'Yes, tickets can be transferred through your account dashboard up to 24 hours before the event starts.', category: 'Tickets', views: 890, helpful: 745 },
    { id: '3', question: 'What should I do if my QR code is not working?', answer: 'If your QR code is not scanning, please contact our support team immediately or visit the customer service desk at the venue.', category: 'Technical', views: 567, helpful: 432 }
  ];

  const getInquiryStatusColor = (status: CustomerInquiry['status']) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInquiryPriorityColor = (priority: CustomerInquiry['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRefundStatusColor = (status: RefundRequest['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Processed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketStatusColor = (status: CustomerTicket['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Used': return 'bg-blue-100 text-blue-800';
      case 'Refunded': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInquiryTypeColor = (type: CustomerInquiry['type']) => {
    switch (type) {
      case 'Refund Request': return 'bg-orange-100 text-orange-800';
      case 'Ticket Issue': return 'bg-red-100 text-red-800';
      case 'Event Question': return 'bg-blue-100 text-blue-800';
      case 'Technical Support': return 'bg-purple-100 text-purple-800';
      case 'Complaint': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customer Service Center</h1>
          <p className="text-muted-foreground">Manage customer inquiries, refunds, and support requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Service Report</Button>
          <Button variant="outline">📧 Bulk Email</Button>
          <Button>➕ New Inquiry</Button>
        </div>
      </div>

      {/* Service Metrics */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Open Inquiries</CardDescription>
              <CardTitle className="text-2xl font-bold text-red-600">8</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">2 high priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Avg Response Time</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">2.4h</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">Target: 4h</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Resolution Rate</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">94%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">This week</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Customer Satisfaction</CardDescription>
              <CardTitle className="text-2xl font-bold text-purple-600">4.8</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">Out of 5.0</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Service Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Inquiries */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Customer Inquiries</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">🔍 Filter</Button>
                  <Button variant="outline" size="sm">📋 Assign</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inquiries.map(inquiry => (
                  <div key={inquiry.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{inquiry.subject}</h4>
                        <div className="text-sm text-muted-foreground">
                          {inquiry.customerName} • {inquiry.email} • {inquiry.phone}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getInquiryTypeColor(inquiry.type)} variant="secondary">
                          {inquiry.type}
                        </Badge>
                        <div className="flex gap-1">
                          <Badge className={getInquiryPriorityColor(inquiry.priority)} variant="secondary">
                            {inquiry.priority}
                          </Badge>
                          <Badge className={getInquiryStatusColor(inquiry.status)} variant="secondary">
                            {inquiry.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-3 p-3 bg-gray-50 rounded">
                      {inquiry.description}
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                      <span>Assigned to: {inquiry.assignedTo}</span>
                      <span>Created: {inquiry.createdDate} • Updated: {inquiry.lastUpdate}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">💬 Reply</Button>
                      <Button variant="outline" size="sm">📞 Call</Button>
                      <Button variant="outline" size="sm">👁️ View Full</Button>
                      <Button variant="outline" size="sm">✅ Resolve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Refund Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {refundRequests.map(refund => (
                  <div key={refund.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{refund.customerName}</h4>
                        <div className="text-sm text-muted-foreground">
                          {refund.eventName} • Ticket: {refund.ticketId}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(refund.amount)}</div>
                        <Badge className={getRefundStatusColor(refund.status)} variant="secondary">
                          {refund.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-sm mb-3">
                      <strong>Reason:</strong> {refund.reason}
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                      <span>Request Date: {refund.requestDate}</span>
                      {refund.reviewedBy && <span>Reviewed by: {refund.reviewedBy}</span>}
                    </div>

                    <div className="flex gap-2">
                      {refund.status === 'Pending' && (
                        <>
                          <Button variant="outline" size="sm" className="bg-green-50 border-green-200 text-green-700">
                            ✅ Approve
                          </Button>
                          <Button variant="outline" size="sm" className="bg-red-50 border-red-200 text-red-700">
                            ❌ Reject
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">👁️ View Details</Button>
                      <Button variant="outline" size="sm">💬 Contact Customer</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Ticket Lookup */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Ticket Lookup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter customer name, email, or ticket ID"
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  <Button>🔍 Search</Button>
                </div>

                <div className="space-y-3">
                  {customerTickets.map(ticket => (
                    <div key={ticket.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold text-sm">{ticket.eventName}</h5>
                          <div className="text-xs text-muted-foreground">
                            {ticket.ticketType} • Purchased: {ticket.purchaseDate}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-sm">{formatCurrency(ticket.amount)}</div>
                          <Badge className={getTicketStatusColor(ticket.status)} variant="secondary">
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-2">
                        QR: {ticket.qrCode} 
                        {ticket.seatNumber && ` • Seat: ${ticket.seatNumber}`}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">📧 Resend</Button>
                        <Button variant="outline" size="sm">🔄 Reissue</Button>
                        <Button variant="outline" size="sm">💰 Refund</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                📧 Send Mass Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💰 Process Refunds
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎫 Bulk Ticket Resend
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⚙️ Service Settings
              </Button>
            </CardContent>
          </Card>

          {/* FAQ Management */}
          <Card>
            <CardHeader>
              <CardTitle>Popular FAQs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faqs.map(faq => (
                  <div key={faq.id} className="p-3 border rounded">
                    <div className="font-medium text-sm mb-1">{faq.question}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {faq.views} views • {faq.helpful} helpful votes
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {faq.category}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                📝 Manage FAQ
              </Button>
            </CardContent>
          </Card>

          {/* Team Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Support Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Grace Mutindi</span>
                  <Badge className="bg-green-100 text-green-800" variant="secondary">Online</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Peter Njoroge</span>
                  <Badge className="bg-green-100 text-green-800" variant="secondary">Online</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Technical Team</span>
                  <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">Busy</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Customer Care</span>
                  <Badge className="bg-red-100 text-red-800" variant="secondary">Offline</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>This Week's Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Total Inquiries:</span>
                  <span className="font-bold">42</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved:</span>
                  <span className="font-bold text-green-600">38</span>
                </div>
                <div className="flex justify-between">
                  <span>Refunds Processed:</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Refund Amount:</span>
                  <span className="font-bold">KSH 45K</span>
                </div>
                <div className="flex justify-between">
                  <span>Tickets Reissued:</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Satisfaction Score:</span>
                  <span className="font-bold text-purple-600">4.8/5.0</span>
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
                <div className="text-sm">
                  <div className="font-medium">Refund processed</div>
                  <div className="text-xs text-muted-foreground">John Kamau - KSH 1,500</div>
                  <div className="text-xs text-green-600">30 minutes ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Inquiry resolved</div>
                  <div className="text-xs text-muted-foreground">Mary Wanjiku - Technical support</div>
                  <div className="text-xs text-blue-600">1 hour ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Ticket reissued</div>
                  <div className="text-xs text-muted-foreground">Peter Njoroge - QR code issue</div>
                  <div className="text-xs text-purple-600">2 hours ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}