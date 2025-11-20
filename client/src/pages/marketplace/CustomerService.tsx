import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: 'Buyer' | 'Seller' | 'Admin';
  };
  subject: string;
  category: 'Technical' | 'Payment' | 'Order' | 'Account' | 'Product' | 'Shipping' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
  description: string;
  attachments?: string[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  author: {
    name: string;
    type: 'Customer' | 'Agent' | 'System';
  };
  message: string;
  timestamp: string;
  attachments?: string[];
}

interface ChatMessage {
  id: string;
  customer: {
    id: string;
    name: string;
    type: 'Buyer' | 'Seller';
  };
  agent?: {
    id: string;
    name: string;
  };
  messages: {
    id: string;
    sender: 'customer' | 'agent';
    content: string;
    timestamp: string;
    type: 'text' | 'image' | 'file';
  }[];
  status: 'Active' | 'Waiting' | 'Resolved';
  startedAt: string;
  lastActivity: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  views: number;
  lastUpdated: string;
}

interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory: string;
  tags: string[];
  author: string;
  views: number;
  rating: number;
  lastUpdated: string;
}

export default function CustomerService() {
  const [activeTab, setActiveTab] = useState("tickets");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatMessage | null>(null);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState(false);
  const [ticketFilters, setTicketFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    assigned: "all"
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Waiting': return 'bg-orange-100 text-orange-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical': return '⚙️';
      case 'Payment': return '💳';
      case 'Order': return '📦';
      case 'Account': return '👤';
      case 'Product': return '🛍️';
      case 'Shipping': return '🚚';
      default: return '❓';
    }
  };

  // Sample data
  const supportTickets: SupportTicket[] = [
    {
      id: 'tick_001',
      ticketNumber: 'CS-2025-1045',
      customer: {
        id: 'cust_001',
        name: 'John Kamau',
        email: 'john.kamau@email.com',
        phone: '+254 701 234 567',
        type: 'Buyer'
      },
      subject: 'Payment failed but amount was deducted',
      category: 'Payment',
      priority: 'High',
      status: 'In Progress',
      description: 'I tried to purchase a jersey but the payment failed. However, the amount was deducted from my account. Order ID: ORD-2025-1045',
      assignedTo: 'Agent Sarah',
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-01-15T14:22:00Z',
      responses: [
        {
          id: 'resp_001',
          author: { name: 'John Kamau', type: 'Customer' },
          message: 'I tried to purchase a jersey but the payment failed. However, the amount was deducted from my account. Order ID: ORD-2025-1045',
          timestamp: '2025-01-15T10:30:00Z'
        },
        {
          id: 'resp_002',
          author: { name: 'Agent Sarah', type: 'Agent' },
          message: 'Hi John, I\'m sorry to hear about this issue. I\'ve located your transaction and can see the deduction. We\'re investigating with our payment provider and will have an update within 24 hours.',
          timestamp: '2025-01-15T11:45:00Z'
        }
      ]
    },
    {
      id: 'tick_002',
      ticketNumber: 'CS-2025-1046',
      customer: {
        id: 'sell_001',
        name: 'Sports Emporium',
        email: 'support@sportsemporium.co.ke',
        phone: '+254 702 345 678',
        type: 'Seller'
      },
      subject: 'Unable to upload product images',
      category: 'Technical',
      priority: 'Medium',
      status: 'Open',
      description: 'Getting error when trying to upload product images. Browser console shows 413 error.',
      createdAt: '2025-01-15T09:15:00Z',
      updatedAt: '2025-01-15T09:15:00Z',
      responses: [
        {
          id: 'resp_003',
          author: { name: 'Sports Emporium', type: 'Customer' },
          message: 'Getting error when trying to upload product images. Browser console shows 413 error.',
          timestamp: '2025-01-15T09:15:00Z'
        }
      ]
    },
    {
      id: 'tick_003',
      ticketNumber: 'CS-2025-1047',
      customer: {
        id: 'cust_002',
        name: 'Mary Wanjiku',
        email: 'mary.wanjiku@email.com',
        phone: '+254 703 456 789',
        type: 'Buyer'
      },
      subject: 'Wrong item received in order',
      category: 'Order',
      priority: 'Medium',
      status: 'Waiting',
      description: 'Ordered a blue scarf but received a red one. Need exchange or refund.',
      assignedTo: 'Agent Mike',
      createdAt: '2025-01-14T16:20:00Z',
      updatedAt: '2025-01-15T08:30:00Z',
      responses: []
    }
  ];

  const chatSessions: ChatMessage[] = [
    {
      id: 'chat_001',
      customer: {
        id: 'cust_003',
        name: 'Peter Ochieng',
        type: 'Buyer'
      },
      agent: {
        id: 'agent_001',
        name: 'Agent Linda'
      },
      messages: [
        {
          id: 'msg_001',
          sender: 'customer',
          content: 'Hi, I need help with my order status',
          timestamp: '2025-01-15T15:30:00Z',
          type: 'text'
        },
        {
          id: 'msg_002',
          sender: 'agent',
          content: 'Hello Peter! I\'d be happy to help you with your order. Can you please provide your order number?',
          timestamp: '2025-01-15T15:31:00Z',
          type: 'text'
        },
        {
          id: 'msg_003',
          sender: 'customer',
          content: 'It\'s ORD-2025-1048',
          timestamp: '2025-01-15T15:32:00Z',
          type: 'text'
        }
      ],
      status: 'Active',
      startedAt: '2025-01-15T15:30:00Z',
      lastActivity: '2025-01-15T15:32:00Z'
    }
  ];

  const faqItems: FAQItem[] = [
    {
      id: 'faq_001',
      question: 'How do I track my order?',
      answer: 'You can track your order by logging into your account and going to "My Orders". You\'ll see real-time status updates and tracking information.',
      category: 'Orders',
      helpful: 145,
      notHelpful: 12,
      views: 892,
      lastUpdated: '2025-01-10T00:00:00Z'
    },
    {
      id: 'faq_002',
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, Airtel Money, Visa, Mastercard, and bank transfers. All payments are processed securely.',
      category: 'Payment',
      helpful: 234,
      notHelpful: 8,
      views: 1456,
      lastUpdated: '2025-01-08T00:00:00Z'
    },
    {
      id: 'faq_003',
      question: 'How do I return or exchange an item?',
      answer: 'Returns and exchanges are accepted within 14 days of purchase. Items must be in original condition with tags attached.',
      category: 'Returns',
      helpful: 189,
      notHelpful: 15,
      views: 678,
      lastUpdated: '2025-01-05T00:00:00Z'
    },
    {
      id: 'faq_004',
      question: 'How do I become a verified seller?',
      answer: 'To become a verified seller, submit your business license, tax certificate, and identity documents through the seller dashboard.',
      category: 'Selling',
      helpful: 98,
      notHelpful: 6,
      views: 345,
      lastUpdated: '2025-01-12T00:00:00Z'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎧 Customer Service Center</h1>
          <p className="text-muted-foreground">Comprehensive support and customer communication hub</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNewTicketForm(true)}>
            🎫 New Ticket
          </Button>
          <Button>📊 Service Reports</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">Open Tickets</div>
              </div>
              <div className="text-2xl">🎫</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Active Chats</div>
              </div>
              <div className="text-2xl">💬</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div className="text-2xl">😊</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">2.3h</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
              <div className="text-2xl">⏱️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tickets">🎫 Support Tickets</TabsTrigger>
          <TabsTrigger value="chat">💬 Live Chat</TabsTrigger>
          <TabsTrigger value="faq">❓ FAQ Management</TabsTrigger>
          <TabsTrigger value="knowledge">📚 Knowledge Base</TabsTrigger>
          <TabsTrigger value="analytics">📊 Service Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 Ticket Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={ticketFilters.status} onValueChange={(value) => setTicketFilters({...ticketFilters, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={ticketFilters.priority} onValueChange={(value) => setTicketFilters({...ticketFilters, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={ticketFilters.category} onValueChange={(value) => setTicketFilters({...ticketFilters, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="shipping">Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Search</Label>
                  <Input placeholder="Search tickets..." />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets ({supportTickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map(ticket => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getCategoryIcon(ticket.category)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{ticket.subject}</h3>
                            <Badge className={getStatusColor(ticket.status)} variant="secondary">
                              {ticket.status}
                            </Badge>
                            <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                              {ticket.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.ticketNumber} • {ticket.customer.name} ({ticket.customer.type})
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Created: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                        <div>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</div>
                        {ticket.assignedTo && (
                          <div className="text-blue-600">Assigned to: {ticket.assignedTo}</div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowTicketDetail(true);
                        }}
                      >
                        👁️ View Details
                      </Button>
                      <Button size="sm" variant="outline">💬 Reply</Button>
                      <Button size="sm" variant="outline">🔄 Assign</Button>
                      <Select>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Sessions List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>💬 Active Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chatSessions.map(chat => (
                    <div 
                      key={chat.id} 
                      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedChat(chat);
                        setShowChatWindow(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{chat.customer.name}</div>
                        <Badge className={getStatusColor(chat.status)} variant="secondary">
                          {chat.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {chat.messages[chat.messages.length - 1]?.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(chat.lastActivity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedChat ? `Chat with ${selectedChat.customer.name}` : 'Select a chat to view'}
                </CardTitle>
                {selectedChat && (
                  <CardDescription>
                    {selectedChat.agent ? `Agent: ${selectedChat.agent.name}` : 'Unassigned'} • 
                    Started: {new Date(selectedChat.startedAt).toLocaleString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedChat ? (
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto border rounded p-4 space-y-3">
                      {selectedChat.messages.map(message => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs p-3 rounded-lg ${
                            message.sender === 'agent' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            <div className="text-sm">{message.content}</div>
                            <div className={`text-xs mt-1 ${
                              message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Textarea 
                        placeholder="Type your message..."
                        className="flex-1"
                        rows={2}
                      />
                      <div className="flex flex-col gap-2">
                        <Button size="sm">Send</Button>
                        <Button size="sm" variant="outline">📎</Button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline">🏷️ Add Tag</Button>
                      <Button size="sm" variant="outline">📋 Create Ticket</Button>
                      <Button size="sm" variant="outline">✅ Resolve</Button>
                      <Button size="sm" variant="outline">🔄 Transfer</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a chat session to view and respond to messages
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">❓ FAQ Management</h2>
            <Button>➕ Add New FAQ</Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {faqItems.map(faq => (
                  <div key={faq.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground mb-3">{faq.answer}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="secondary">{faq.category}</Badge>
                          <span>👁️ {faq.views} views</span>
                          <span>👍 {faq.helpful} helpful</span>
                          <span>👎 {faq.notHelpful} not helpful</span>
                          <span>Updated: {new Date(faq.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">✏️ Edit</Button>
                        <Button size="sm" variant="outline">📊 Stats</Button>
                        <Button size="sm" variant="outline">🗑️ Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">📚 Knowledge Base</h2>
            <Button>📝 Create Article</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🛍️ For Buyers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium">How to Place an Order</div>
                    <div className="text-muted-foreground">Step-by-step guide</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Payment Methods</div>
                    <div className="text-muted-foreground">Accepted payment options</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Order Tracking</div>
                    <div className="text-muted-foreground">Monitor your purchases</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View All →
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🏪 For Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium">Seller Registration</div>
                    <div className="text-muted-foreground">Getting started guide</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Product Management</div>
                    <div className="text-muted-foreground">Listing and inventory</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Order Fulfillment</div>
                    <div className="text-muted-foreground">Processing and shipping</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View All →
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚙️ Technical Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium">Account Issues</div>
                    <div className="text-muted-foreground">Login and access problems</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Browser Compatibility</div>
                    <div className="text-muted-foreground">Supported browsers</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Mobile App</div>
                    <div className="text-muted-foreground">App features and troubleshooting</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View All →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">94%</div>
                  <div className="text-sm text-muted-foreground">First Contact Resolution</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2.1h</div>
                  <div className="text-sm text-muted-foreground">Average Resolution Time</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4.8/5</div>
                  <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">156</div>
                  <div className="text-sm text-muted-foreground">Tickets This Week</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Support Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { category: 'Payment Issues', count: 45, percentage: 29 },
                  { category: 'Order Problems', count: 38, percentage: 24 },
                  { category: 'Technical Support', count: 32, percentage: 21 },
                  { category: 'Account Questions', count: 25, percentage: 16 },
                  { category: 'Product Inquiries', count: 16, percentage: 10 }
                ].map(item => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{item.category}</div>
                      <div className="text-sm text-muted-foreground">({item.count} tickets)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Ticket Form Modal */}
      {newTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🎫 Create New Support Ticket</h2>
                <Button variant="outline" onClick={() => setNewTicketForm(false)}>✖️</Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Name</Label>
                    <Input placeholder="Enter customer name" />
                  </div>
                  <div>
                    <Label>Customer Email</Label>
                    <Input placeholder="Enter email address" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="order">Order</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Subject</Label>
                  <Input placeholder="Brief description of the issue" />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Provide detailed description of the issue..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Assign to Agent</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Agent Sarah</SelectItem>
                      <SelectItem value="mike">Agent Mike</SelectItem>
                      <SelectItem value="linda">Agent Linda</SelectItem>
                      <SelectItem value="john">Agent John</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewTicketForm(false)}>
                    Cancel
                  </Button>
                  <Button>Create Ticket</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}