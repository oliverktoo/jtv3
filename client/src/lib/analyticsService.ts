// Analytics data service for tournament insights
import { format, subDays, parseISO } from 'date-fns';

export interface AnalyticsMetrics {
  registrationTrends: RegistrationTrend[];
  geographicDistribution: GeographicDistribution[];
  performanceMetrics: PerformanceMetrics[];
  tournamentStats: TournamentStats;
  predictiveInsights: PredictiveInsights;
}

export interface RegistrationTrend {
  date: string;
  registrations: number;
  approvals: number;
  rejections: number;
  cumulative: number;
  processingTime: number; // in hours
}

export interface GeographicDistribution {
  county: string;
  subcounty?: string;
  teams: number;
  players: number;
  tournaments: number;
  percentage: number;
  growthRate: number;
  coordinates?: { lat: number; lng: number };
}

export interface PerformanceMetrics {
  tournamentId: string;
  tournamentName: string;
  organizationId: string;
  startDate: string;
  endDate?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  
  // Registration metrics
  teamsRegistered: number;
  teamsApproved: number;
  registrationRate: number;
  avgProcessingTime: number;
  
  // Competition metrics
  matchesScheduled: number;
  matchesCompleted: number;
  matchesPostponed: number;
  matchesCancelled: number;
  
  // Performance indicators
  avgGoalsPerMatch: number;
  competitiveness: number; // Based on score variance
  popularity: number; // Registration vs capacity ratio
  completionRate: number;
  
  // Financial metrics (if available)
  budget?: number;
  expenses?: number;
  revenue?: number;
}

export interface TournamentStats {
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  plannedTournaments: number;
  cancelledTournaments: number;
  
  totalTeams: number;
  activeTeams: number;
  totalPlayers: number;
  
  totalMatches: number;
  completedMatches: number;
  
  averageTeamsPerTournament: number;
  averageMatchesPerTournament: number;
  registrationRate: number;
  approvalRate: number;
  completionRate: number;
  
  // Trends
  monthOverMonthGrowth: number;
  yearOverYearGrowth: number;
}

export interface PredictiveInsights {
  // Forecasting
  projectedRegistrations: number;
  projectedCompletionDate: string;
  capacityUtilization: number;
  
  // Risk analysis
  riskFactors: Array<{
    id: string;
    factor: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number; // 0-100%
    impact: string;
    mitigation: string;
  }>;
  
  // Recommendations
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'operational' | 'strategic' | 'financial' | 'technical';
    estimatedImpact: string;
    implementationCost: 'low' | 'medium' | 'high';
  }>;
  
  // Market insights
  marketTrends: Array<{
    trend: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    confidence: number; // 0-100%
    implications: string;
  }>;
}

export class AnalyticsService {
  // Fetch comprehensive analytics data
  static async fetchAnalytics(
    organizationId?: string,
    tournamentId?: string,
    timeframe?: string
  ): Promise<AnalyticsMetrics> {
    try {
      // In production, make API calls to backend
      // For now, return mock data with realistic patterns
      
      const endDate = new Date();
      const startDate = this.getStartDateFromTimeframe(timeframe || '30d');
      
      return {
        registrationTrends: this.generateRegistrationTrends(startDate, endDate),
        geographicDistribution: this.getGeographicDistribution(),
        performanceMetrics: this.getPerformanceMetrics(organizationId, tournamentId),
        tournamentStats: this.getTournamentStats(),
        predictiveInsights: this.getPredictiveInsights()
      };
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  // Generate realistic registration trends
  private static generateRegistrationTrends(startDate: Date, endDate: Date): RegistrationTrend[] {
    const trends: RegistrationTrend[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let cumulative = 0;
    
    for (let i = 0; i < daysDiff; i++) {
      const date = subDays(endDate, daysDiff - i - 1);
      
      // Simulate realistic patterns: higher on weekdays, lower on weekends
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseRegistrations = isWeekend ? 8 : 18;
      
      // Add some randomness and seasonal trends
      const registrations = Math.max(0, Math.floor(
        baseRegistrations + 
        Math.random() * 12 - 6 + // Random variance
        Math.sin((i / daysDiff) * Math.PI) * 8 // Seasonal pattern
      ));
      
      const approvals = Math.floor(registrations * (0.85 + Math.random() * 0.10));
      const rejections = registrations - approvals;
      
      cumulative += registrations;
      
      trends.push({
        date: format(date, 'yyyy-MM-dd'),
        registrations,
        approvals,
        rejections,
        cumulative,
        processingTime: 1.5 + Math.random() * 3 // 1.5-4.5 hours
      });
    }
    
    return trends;
  }

  // Get geographic distribution data
  private static getGeographicDistribution(): GeographicDistribution[] {
    const kenyaCounties = [
      { name: 'Nairobi', population: 4397073, urbanization: 0.95 },
      { name: 'Kiambu', population: 2417735, urbanization: 0.72 },
      { name: 'Nakuru', population: 2162202, urbanization: 0.68 },
      { name: 'Kakamega', population: 1867579, urbanization: 0.42 },
      { name: 'Bungoma', population: 1670570, urbanization: 0.35 },
      { name: 'Meru', population: 1545714, urbanization: 0.48 },
      { name: 'Kilifi', population: 1453787, urbanization: 0.38 },
      { name: 'Machakos', population: 1421932, urbanization: 0.58 },
      { name: 'Mombasa', population: 1208333, urbanization: 0.98 },
      { name: 'Kisumu', population: 1155574, urbanization: 0.74 }
    ];
    
    return kenyaCounties.map((county, index) => {
      // Calculate teams based on population and urbanization
      const baseTeams = Math.floor((county.population / 50000) * county.urbanization);
      const teams = Math.max(5, baseTeams + Math.floor(Math.random() * 10 - 5));
      
      const players = teams * (18 + Math.floor(Math.random() * 10));
      const tournaments = Math.max(1, Math.floor(teams / 8) + Math.floor(Math.random() * 3));
      
      return {
        county: county.name,
        teams,
        players,
        tournaments,
        percentage: 0, // Will be calculated after all counties
        growthRate: -20 + Math.random() * 40 // -20% to +20%
      };
    }).map(county => ({
      ...county,
      percentage: (county.teams / kenyaCounties.reduce((sum, c, i) => sum + (i < 10 ? Math.floor((c.population / 50000) * c.urbanization) : 0), 0)) * 100
    }));
  }

  // Get tournament performance metrics
  private static getPerformanceMetrics(organizationId?: string, tournamentId?: string): PerformanceMetrics[] {
    const tournaments = [
      {
        tournamentId: 'kpl_2024',
        tournamentName: 'Kenyan Premier League 2024',
        organizationId: 'fkf',
        startDate: '2024-01-15',
        endDate: '2024-11-30',
        status: 'active' as const
      },
      {
        tournamentId: 'nsf_2024',
        tournamentName: 'National Super Cup 2024',
        organizationId: 'fkf',
        startDate: '2024-03-01',
        endDate: '2024-05-30',
        status: 'completed' as const
      },
      {
        tournamentId: 'div_one_2024',
        tournamentName: 'Division One League 2024',
        organizationId: 'fkf',
        startDate: '2024-02-01',
        status: 'active' as const
      }
    ];
    
    return tournaments
      .filter(t => !organizationId || t.organizationId === organizationId)
      .filter(t => !tournamentId || t.tournamentId === tournamentId)
      .map(tournament => {
        const teamsRegistered = 16 + Math.floor(Math.random() * 20);
        const teamsApproved = Math.floor(teamsRegistered * (0.8 + Math.random() * 0.15));
        
        const matchesScheduled = this.calculateTotalMatches(teamsApproved);
        const completionProgress = tournament.status === 'completed' ? 1 : 
                                  tournament.status === 'active' ? 0.3 + Math.random() * 0.5 : 0;
        const matchesCompleted = Math.floor(matchesScheduled * completionProgress);
        
        return {
          ...tournament,
          teamsRegistered,
          teamsApproved,
          registrationRate: (teamsApproved / teamsRegistered) * 100,
          avgProcessingTime: 2 + Math.random() * 4, // 2-6 hours
          
          matchesScheduled,
          matchesCompleted,
          matchesPostponed: Math.floor(matchesScheduled * 0.02 + Math.random() * 0.03),
          matchesCancelled: Math.floor(matchesScheduled * 0.01 + Math.random() * 0.02),
          
          avgGoalsPerMatch: 2 + Math.random() * 1.5,
          competitiveness: 70 + Math.random() * 25, // 70-95%
          popularity: 90 + Math.random() * 40, // 90-130%
          completionRate: completionProgress * 100,
          
          budget: tournament.organizationId === 'fkf' ? 5000000 + Math.random() * 3000000 : undefined,
          expenses: tournament.organizationId === 'fkf' ? 3000000 + Math.random() * 2000000 : undefined,
          revenue: tournament.organizationId === 'fkf' ? 4000000 + Math.random() * 2500000 : undefined
        };
      });
  }

  // Calculate tournament statistics
  private static getTournamentStats(): TournamentStats {
    return {
      totalTournaments: 47,
      activeTournaments: 12,
      completedTournaments: 28,
      plannedTournaments: 6,
      cancelledTournaments: 1,
      
      totalTeams: 284,
      activeTeams: 156,
      totalPlayers: 6840,
      
      totalMatches: 1247,
      completedMatches: 934,
      
      averageTeamsPerTournament: 18.5,
      averageMatchesPerTournament: 42.3,
      registrationRate: 87.3,
      approvalRate: 89.2,
      completionRate: 94.6,
      
      monthOverMonthGrowth: 12.5,
      yearOverYearGrowth: 34.8
    };
  }

  // Generate predictive insights
  private static getPredictiveInsights(): PredictiveInsights {
    return {
      projectedRegistrations: 342,
      projectedCompletionDate: '2024-06-15',
      capacityUtilization: 78.5,
      
      riskFactors: [
        {
          id: 'weather_risk',
          factor: 'Weather Disruption Risk',
          severity: 'medium',
          probability: 35,
          impact: 'May delay 15-20% of scheduled matches during rainy season (March-May)',
          mitigation: 'Schedule indoor alternatives or reschedule critical matches'
        },
        {
          id: 'facility_availability',
          factor: 'Facility Availability Constraints',
          severity: 'low',
          probability: 25,
          impact: 'Limited access to premium venues during peak season',
          mitigation: 'Book facilities earlier and develop backup venue network'
        },
        {
          id: 'funding_shortfall',
          factor: 'Budget Constraints',
          severity: 'high',
          probability: 60,
          impact: 'Potential 20-30% reduction in tournament capacity',
          mitigation: 'Diversify funding sources and implement cost-saving measures'
        }
      ],
      
      recommendations: [
        {
          id: 'expand_rural',
          title: 'Expand Rural Outreach Programs',
          description: 'Target counties with lower participation rates (Turkana, Mandera, Wajir) to increase geographic diversity and tap into untapped talent pools.',
          priority: 'high',
          category: 'strategic',
          estimatedImpact: '25-30% increase in rural team participation',
          implementationCost: 'medium'
        },
        {
          id: 'optimize_scheduling',
          title: 'Implement AI-Powered Scheduling',
          description: 'Use machine learning to optimize fixture scheduling considering weather patterns, venue availability, and team preferences.',
          priority: 'medium',
          category: 'technical',
          estimatedImpact: '15-20% reduction in scheduling conflicts',
          implementationCost: 'high'
        },
        {
          id: 'mobile_registration',
          title: 'Launch Mobile Registration Platform',
          description: 'Develop mobile-first registration system to improve accessibility, especially in areas with limited computer access.',
          priority: 'high',
          category: 'technical',
          estimatedImpact: '40-50% increase in registration completion rate',
          implementationCost: 'medium'
        }
      ],
      
      marketTrends: [
        {
          trend: 'Youth Football Participation',
          direction: 'increasing',
          confidence: 85,
          implications: 'Growing interest in structured youth competitions, opportunity for U-15 and U-17 leagues'
        },
        {
          trend: 'Women\'s Football Growth',
          direction: 'increasing',
          confidence: 78,
          implications: 'Significant growth in women\'s team registrations, need for dedicated tournaments'
        },
        {
          trend: 'Digital Engagement',
          direction: 'increasing',
          confidence: 92,
          implications: 'Teams and fans expect real-time updates, live streaming, and social media integration'
        }
      ]
    };
  }

  // Helper methods
  private static getStartDateFromTimeframe(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      case '90d': return subDays(now, 90);
      case '1y': return subDays(now, 365);
      default: return subDays(now, 30);
    }
  }

  private static calculateTotalMatches(teams: number): number {
    // For round-robin: n(n-1)/2, for knockout: n-1
    // Assume most tournaments use round-robin in groups then knockout
    if (teams <= 8) {
      return Math.floor(teams * (teams - 1) / 2); // Full round-robin
    } else {
      // Groups + knockout
      const groups = Math.ceil(teams / 4);
      const groupMatches = groups * 6; // 4 teams per group = 6 matches
      const knockoutMatches = teams - 1;
      return groupMatches + Math.floor(knockoutMatches / 2);
    }
  }

  // Export analytics data
  static async exportAnalytics(
    format: 'csv' | 'excel' | 'pdf' | 'json',
    data: AnalyticsMetrics,
    options?: {
      includeCharts?: boolean;
      customFields?: string[];
      dateRange?: { start: string; end: string };
    }
  ): Promise<Blob> {
    try {
      switch (format) {
        case 'json':
          return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          
        case 'csv':
          const csvContent = this.convertToCSV(data);
          return new Blob([csvContent], { type: 'text/csv' });
          
        case 'excel':
          // In production, use a library like exceljs
          const excelContent = this.convertToExcel(data);
          return new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          
        case 'pdf':
          // In production, use a library like jsPDF
          const pdfContent = this.convertToPDF(data, options);
          return new Blob([pdfContent], { type: 'application/pdf' });
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  private static convertToCSV(data: AnalyticsMetrics): string {
    // Simplified CSV conversion - in production, use proper CSV library
    const lines: string[] = [];
    
    // Registration trends
    lines.push('Registration Trends');
    lines.push('Date,Registrations,Approvals,Rejections,Cumulative');
    data.registrationTrends.forEach(trend => {
      lines.push(`${trend.date},${trend.registrations},${trend.approvals},${trend.rejections},${trend.cumulative}`);
    });
    
    lines.push(''); // Empty line
    
    // Geographic distribution
    lines.push('Geographic Distribution');
    lines.push('County,Teams,Players,Tournaments,Percentage');
    data.geographicDistribution.forEach(geo => {
      lines.push(`${geo.county},${geo.teams},${geo.players},${geo.tournaments},${geo.percentage}`);
    });
    
    return lines.join('\n');
  }

  private static convertToExcel(data: AnalyticsMetrics): string {
    // Mock Excel conversion - in production, use proper Excel library
    return 'Mock Excel content - use exceljs or similar library';
  }

  private static convertToPDF(data: AnalyticsMetrics, options?: any): string {
    // Mock PDF conversion - in production, use jsPDF or similar
    return 'Mock PDF content - use jsPDF or similar library';
  }
}