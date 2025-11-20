import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  budgetVariance: number;
  monthlyGrowth: number;
}

interface RevenueStream {
  id: string;
  category: string;
  source: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  lastMonth: number;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  budgeted: number;
  variance: number;
  frequency: 'Monthly' | 'Quarterly' | 'Annual' | 'One-time';
  status: 'Paid' | 'Pending' | 'Overdue' | 'Approved';
  dueDate: string;
}

interface BudgetAllocation {
  id: string;
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilizationRate: number;
  projectedSpend: number;
}

interface FinancialTransaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense' | 'Transfer';
  description: string;
  amount: number;
  category: string;
  account: string;
  reference: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export default function FinancialManagement() {
  const financialSummary: FinancialSummary = {
    totalRevenue: 45780000, // KES
    totalExpenses: 38450000,
    netProfit: 7330000,
    cashFlow: 12500000,
    budgetVariance: 5.2, // %
    monthlyGrowth: 8.7 // %
  };

  const revenueStreams: RevenueStream[] = [
    {
      id: '1',
      category: 'Tournament Fees',
      source: 'Registration & Entry Fees',
      amount: 18500000,
      percentage: 40.4,
      trend: 'up',
      lastMonth: 16200000
    },
    {
      id: '2',
      category: 'Sponsorship',
      source: 'Corporate Partners',
      amount: 12300000,
      percentage: 26.9,
      trend: 'up',
      lastMonth: 11800000
    },
    {
      id: '3',
      category: 'Ticket Sales',
      source: 'Match Attendance',
      amount: 8450000,
      percentage: 18.5,
      trend: 'stable',
      lastMonth: 8350000
    },
    {
      id: '4',
      category: 'Merchandise',
      source: 'Team Store & Online',
      amount: 3200000,
      percentage: 7.0,
      trend: 'up',
      lastMonth: 2900000
    },
    {
      id: '5',
      category: 'Media Rights',
      source: 'Broadcasting & Digital',
      amount: 2180000,
      percentage: 4.8,
      trend: 'down',
      lastMonth: 2480000
    },
    {
      id: '6',
      category: 'Training Programs',
      source: 'Youth & Skills Development',
      amount: 1150000,
      percentage: 2.4,
      trend: 'up',
      lastMonth: 980000
    }
  ];

  const majorExpenses: Expense[] = [
    {
      id: '1',
      category: 'Salaries & Benefits',
      description: 'Player and staff salaries, benefits, insurance',
      amount: 15600000,
      budgeted: 16000000,
      variance: -2.5,
      frequency: 'Monthly',
      status: 'Paid',
      dueDate: '2024-11-30'
    },
    {
      id: '2',
      category: 'Venue & Facilities',
      description: 'Stadium rental, maintenance, utilities',
      amount: 7800000,
      budgeted: 7500000,
      variance: 4.0,
      frequency: 'Monthly',
      status: 'Paid',
      dueDate: '2024-11-25'
    },
    {
      id: '3',
      category: 'Equipment & Supplies',
      description: 'Training equipment, uniforms, medical supplies',
      amount: 4200000,
      budgeted: 4500000,
      variance: -6.7,
      frequency: 'Quarterly',
      status: 'Approved',
      dueDate: '2024-12-15'
    },
    {
      id: '4',
      category: 'Marketing & Promotion',
      description: 'Advertising, media, fan engagement activities',
      amount: 3450000,
      budgeted: 3200000,
      variance: 7.8,
      frequency: 'Monthly',
      status: 'Pending',
      dueDate: '2024-12-05'
    },
    {
      id: '5',
      category: 'Travel & Accommodation',
      description: 'Team travel, lodging, meal allowances',
      amount: 2850000,
      budgeted: 3000000,
      variance: -5.0,
      frequency: 'Monthly',
      status: 'Paid',
      dueDate: '2024-11-28'
    },
    {
      id: '6',
      category: 'Technology & Systems',
      description: 'Software licenses, IT infrastructure, digital platforms',
      amount: 1680000,
      budgeted: 1500000,
      variance: 12.0,
      frequency: 'Annual',
      status: 'Paid',
      dueDate: '2024-12-31'
    }
  ];

  const budgetAllocations: BudgetAllocation[] = [
    {
      id: '1',
      department: 'Player Operations',
      allocated: 20000000,
      spent: 18200000,
      remaining: 1800000,
      utilizationRate: 91.0,
      projectedSpend: 19500000
    },
    {
      id: '2',
      department: 'Facilities & Venues',
      allocated: 8500000,
      spent: 7800000,
      remaining: 700000,
      utilizationRate: 91.8,
      projectedSpend: 8300000
    },
    {
      id: '3',
      department: 'Marketing & Media',
      allocated: 4000000,
      spent: 3450000,
      remaining: 550000,
      utilizationRate: 86.3,
      projectedSpend: 3900000
    },
    {
      id: '4',
      department: 'Technology',
      allocated: 2500000,
      spent: 1680000,
      remaining: 820000,
      utilizationRate: 67.2,
      projectedSpend: 2200000
    },
    {
      id: '5',
      department: 'Administration',
      allocated: 3000000,
      spent: 2750000,
      remaining: 250000,
      utilizationRate: 91.7,
      projectedSpend: 2950000
    }
  ];

  const recentTransactions: FinancialTransaction[] = [
    {
      id: '1',
      date: '2024-11-28',
      type: 'Income',
      description: 'Tournament registration fees - December championship',
      amount: 2500000,
      category: 'Tournament Fees',
      account: 'Primary Revenue',
      reference: 'TRN-2024-1128-001',
      status: 'Completed'
    },
    {
      id: '2',
      date: '2024-11-27',
      type: 'Expense',
      description: 'Monthly salary payment - November 2024',
      amount: -1300000,
      category: 'Salaries',
      account: 'Payroll Account',
      reference: 'PAY-2024-1127-002',
      status: 'Completed'
    },
    {
      id: '3',
      date: '2024-11-26',
      type: 'Income',
      description: 'Sponsorship payment - Regional Bank Q4',
      amount: 3000000,
      category: 'Sponsorship',
      account: 'Sponsorship Revenue',
      reference: 'SPO-2024-1126-003',
      status: 'Completed'
    },
    {
      id: '4',
      date: '2024-11-25',
      type: 'Expense',
      description: 'Stadium rental - Weekend matches',
      amount: -650000,
      category: 'Venues',
      account: 'Operations Account',
      reference: 'VEN-2024-1125-004',
      status: 'Completed'
    },
    {
      id: '5',
      date: '2024-11-24',
      type: 'Transfer',
      description: 'Budget allocation transfer - Marketing department',
      amount: 500000,
      category: 'Internal Transfer',
      account: 'Marketing Budget',
      reference: 'TRF-2024-1124-005',
      status: 'Pending'
    }
  ];

  const getTrendIcon = (trend: RevenueStream['trend']) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getTrendColor = (trend: RevenueStream['trend']) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-yellow-600';
    }
  };

  const getExpenseStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type: FinancialTransaction['type']) => {
    switch (type) {
      case 'Income': return 'text-green-600';
      case 'Expense': return 'text-red-600';
      case 'Transfer': return 'text-blue-600';
      default: return 'text-gray-600';
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
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Comprehensive financial oversight and budget control</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Generate Report</Button>
          <Button variant="outline">💰 New Transaction</Button>
          <Button>📈 Financial Dashboard</Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-xs text-green-600 mt-1">+{financialSummary.monthlyGrowth}% this month</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(financialSummary.totalExpenses)}</div>
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-xs text-blue-600 mt-1">{financialSummary.budgetVariance > 0 ? '+' : ''}{financialSummary.budgetVariance}% vs budget</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialSummary.netProfit)}</div>
            <div className="text-sm text-muted-foreground">Net Profit</div>
            <div className="text-xs text-green-600 mt-1">
              {((financialSummary.netProfit / financialSummary.totalRevenue) * 100).toFixed(1)}% margin
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Streams</CardTitle>
              <CardDescription>Income sources and performance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueStreams.map(stream => (
                  <div key={stream.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getTrendIcon(stream.trend)}</div>
                      <div>
                        <div className="font-semibold">{stream.source}</div>
                        <div className="text-sm text-muted-foreground">{stream.category}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(stream.amount)}</div>
                      <div className="text-sm text-muted-foreground">{stream.percentage}% of total</div>
                      <div className={`text-xs ${getTrendColor(stream.trend)}`}>
                        {stream.trend === 'up' && '+'}
                        {((stream.amount - stream.lastMonth) / stream.lastMonth * 100).toFixed(1)}% vs last month
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget vs Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation & Utilization</CardTitle>
              <CardDescription>Department-wise budget performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetAllocations.map(allocation => (
                  <div key={allocation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold">{allocation.department}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatAmount(allocation.spent)} of {formatAmount(allocation.allocated)} spent
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{allocation.utilizationRate}%</div>
                        <div className="text-sm text-muted-foreground">Utilization</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${allocation.utilizationRate}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Remaining: {formatAmount(allocation.remaining)}
                        </span>
                        <span className="text-muted-foreground">
                          Projected: {formatAmount(allocation.projectedSpend)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Major Expenses</CardTitle>
              <CardDescription>Key expense categories and budget variance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {majorExpenses.map(expense => (
                  <div key={expense.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{expense.category}</div>
                        <div className="text-sm text-muted-foreground">{expense.description}</div>
                      </div>
                      <Badge className={getExpenseStatusColor(expense.status)} variant="secondary">
                        {expense.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="ml-2 font-semibold">{formatAmount(expense.amount)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Budgeted:</span>
                        <span className="ml-2">{formatAmount(expense.budgeted)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Variance:</span>
                        <span className={`ml-2 font-semibold ${expense.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {expense.variance >= 0 ? '+' : ''}{expense.variance}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due:</span>
                        <span className="ml-2">{expense.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest financial activities</CardDescription>
                </div>
                <Button variant="outline" size="sm">📋 View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">
                        {transaction.type === 'Income' && '💰'}
                        {transaction.type === 'Expense' && '💸'}
                        {transaction.type === 'Transfer' && '🔄'}
                      </div>
                      <div>
                        <div className="font-semibold">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.date} • {transaction.reference} • {transaction.account}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.amount >= 0 ? '+' : ''}{formatAmount(Math.abs(transaction.amount))}
                      </div>
                      <div className="text-sm text-muted-foreground">{transaction.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cash Flow Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(financialSummary.cashFlow)}
                </div>
                <div className="text-sm text-muted-foreground mb-4">Current Balance</div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Opening Balance:</span>
                    <span className="font-semibold">KES 8.2M</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Inflows:</span>
                    <span className="font-semibold">+{formatCurrency(financialSummary.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Outflows:</span>
                    <span className="font-semibold">-{formatCurrency(financialSummary.totalExpenses)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Closing Balance:</span>
                    <span>{formatCurrency(financialSummary.cashFlow)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Ratios */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Ratios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Profit Margin</span>
                    <span className="text-sm font-semibold">16.0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '16%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Revenue Growth</span>
                    <span className="text-sm font-semibold text-green-600">+8.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Budget Efficiency</span>
                    <span className="text-sm font-semibold">95.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Cash Reserve Ratio</span>
                    <span className="text-sm font-semibold">27.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '27%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div>
                    <div className="text-sm font-semibold">Staff Salaries</div>
                    <div className="text-xs text-muted-foreground">Due: Dec 1, 2024</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">KES 1.3M</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-blue-50 border border-blue-200 rounded">
                  <div>
                    <div className="text-sm font-semibold">Stadium Rental</div>
                    <div className="text-xs text-muted-foreground">Due: Dec 5, 2024</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">KES 650K</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                  <div>
                    <div className="text-sm font-semibold">Equipment Order</div>
                    <div className="text-xs text-muted-foreground">Due: Dec 15, 2024</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">KES 420K</div>
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
                💰 Record Payment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Budget Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔄 Reconcile Accounts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📈 Forecast Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🏦 Bank Statement Import
              </Button>
            </CardContent>
          </Card>

          {/* Financial Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm font-semibold text-green-800">✅ Budget Target Met</div>
                  <div className="text-xs text-green-600">Revenue exceeded monthly target by 8.7%</div>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm font-semibold text-yellow-800">⚠️ High Variance Alert</div>
                  <div className="text-xs text-yellow-600">Marketing expenses 7.8% over budget</div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm font-semibold text-blue-800">ℹ️ Cash Flow Positive</div>
                  <div className="text-xs text-blue-600">Strong cash position for Q4 operations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}