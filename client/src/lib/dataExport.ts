import * as XLSX from 'xlsx';
// Using dynamic import for json2csv to handle ESM/CommonJS compatibility
import { format } from 'date-fns';

// Export formats supported
export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'xlsx',
  JSON = 'json'
}

// Data export utilities
export class DataExporter {
  // Export tournament registration data
  static async exportRegistrations(
    tournamentData: {
      tournament: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
        model: string;
        status: string;
        organization?: {
          name: string;
        };
      };
      registrations: Array<{
        id: string;
        team: {
          name: string;
          code: string;
          county_id: string;
          contact_email: string;
          contact_phone?: string;
        };
        registration_status: string;
        registration_date: string;
        approval_date?: string;
        rejection_date?: string;
        rejection_reason?: string;
        squad_size: number;
        jersey_colors?: string;
        coach_name?: string;
        notes?: string;
      }>;
    },
    format: ExportFormat = ExportFormat.EXCEL
  ): Promise<{ blob: Blob; filename: string }> {
    
    const { tournament, registrations } = tournamentData;
    
    // Prepare data for export
    const exportData = registrations.map(reg => ({
      'Team Name': reg.team.name,
      'Team Code': reg.team.code,
      'County': reg.team.county_id,
      'Contact Email': reg.team.contact_email,
      'Contact Phone': reg.team.contact_phone || 'N/A',
      'Registration Status': reg.registration_status,
      'Registration Date': format(new Date(reg.registration_date), 'yyyy-MM-dd HH:mm:ss'),
      'Approval Date': reg.approval_date ? format(new Date(reg.approval_date), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      'Rejection Date': reg.rejection_date ? format(new Date(reg.rejection_date), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      'Rejection Reason': reg.rejection_reason || 'N/A',
      'Squad Size': reg.squad_size,
      'Jersey Colors': reg.jersey_colors || 'N/A',
      'Coach Name': reg.coach_name || 'N/A',
      'Notes': reg.notes || 'N/A'
    }));

    // Add summary sheet data
    const summaryData = {
      'Tournament Name': tournament.name,
      'Tournament ID': tournament.id,
      'Start Date': format(new Date(tournament.startDate), 'yyyy-MM-dd'),
      'End Date': format(new Date(tournament.endDate), 'yyyy-MM-dd'),
      'Tournament Model': tournament.model,
      'Tournament Status': tournament.status,
      'Organization': tournament.organization?.name || 'Independent',
      'Total Registrations': registrations.length,
      'Approved Teams': registrations.filter(r => r.registration_status === 'APPROVED').length,
      'Rejected Teams': registrations.filter(r => r.registration_status === 'REJECTED').length,
      'Pending Teams': registrations.filter(r => r.registration_status === 'SUBMITTED').length,
      'Export Date': format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };

    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const baseFilename = `${tournament.name.replace(/[^a-zA-Z0-9]/g, '_')}_registrations_${timestamp}`;

    if (format === ExportFormat.CSV) {
      return this.exportAsCSV(exportData, `${baseFilename}.csv`);
    } else if (format === ExportFormat.EXCEL) {
      return this.exportAsExcel(
        {
          'Summary': [summaryData],
          'Registrations': exportData
        },
        `${baseFilename}.xlsx`
      );
    } else {
      return this.exportAsJSON(
        { summary: summaryData, registrations: exportData },
        `${baseFilename}.json`
      );
    }
  }

  // Export team statistics
  static async exportTeamStatistics(
    teamsData: Array<{
      id: string;
      name: string;
      code: string;
      county_id: string;
      contact_email: string;
      organization?: { name: string };
      tournaments: number;
      matches_played?: number;
      wins?: number;
      draws?: number;
      losses?: number;
      goals_for?: number;
      goals_against?: number;
    }>,
    format: ExportFormat = ExportFormat.EXCEL
  ): Promise<{ blob: Blob; filename: string }> {
    
    const exportData = teamsData.map(team => ({
      'Team Name': team.name,
      'Team Code': team.code,
      'County': team.county_id,
      'Organization': team.organization?.name || 'Independent',
      'Contact Email': team.contact_email,
      'Tournaments Participated': team.tournaments,
      'Matches Played': team.matches_played || 0,
      'Wins': team.wins || 0,
      'Draws': team.draws || 0,
      'Losses': team.losses || 0,
      'Goals For': team.goals_for || 0,
      'Goals Against': team.goals_against || 0,
      'Goal Difference': (team.goals_for || 0) - (team.goals_against || 0),
      'Win Percentage': team.matches_played ? ((team.wins || 0) / team.matches_played * 100).toFixed(1) + '%' : '0%'
    }));

    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const baseFilename = `team_statistics_${timestamp}`;

    if (format === ExportFormat.CSV) {
      return this.exportAsCSV(exportData, `${baseFilename}.csv`);
    } else if (format === ExportFormat.EXCEL) {
      return this.exportAsExcel({ 'Team Statistics': exportData }, `${baseFilename}.xlsx`);
    } else {
      return this.exportAsJSON(exportData, `${baseFilename}.json`);
    }
  }

  // Export player registry
  static async exportPlayerRegistry(
    playersData: Array<{
      id: string;
      upid: string;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      gender: string;
      county_id: string;
      ward_id?: string;
      registration_status: string;
      team?: { name: string };
      organization?: { name: string };
      created_at: string;
    }>,
    format: ExportFormat = ExportFormat.EXCEL
  ): Promise<{ blob: Blob; filename: string }> {
    
    const exportData = playersData.map(player => ({
      'UPID': player.upid,
      'First Name': player.first_name,
      'Last Name': player.last_name,
      'Full Name': `${player.first_name} ${player.last_name}`,
      'Date of Birth': format(new Date(player.date_of_birth), 'yyyy-MM-dd'),
      'Age': new Date().getFullYear() - new Date(player.date_of_birth).getFullYear(),
      'Gender': player.gender,
      'County': player.county_id,
      'Ward': player.ward_id || 'N/A',
      'Registration Status': player.registration_status,
      'Current Team': player.team?.name || 'Unaffiliated',
      'Organization': player.organization?.name || 'Independent',
      'Registration Date': format(new Date(player.created_at), 'yyyy-MM-dd HH:mm:ss')
    }));

    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const baseFilename = `player_registry_${timestamp}`;

    if (format === ExportFormat.CSV) {
      return this.exportAsCSV(exportData, `${baseFilename}.csv`);
    } else if (format === ExportFormat.EXCEL) {
      return this.exportAsExcel({ 'Player Registry': exportData }, `${baseFilename}.xlsx`);
    } else {
      return this.exportAsJSON(exportData, `${baseFilename}.json`);
    }
  }

  // Private helper methods
  private static exportAsCSV(data: any[], filename: string): { blob: Blob; filename: string } {
    // Fallback CSV conversion without json2csv dependency
    if (data.length === 0) {
      const blob = new Blob(['No data available'], { type: 'text/csv;charset=utf-8;' });
      return { blob, filename };
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return { blob, filename };
  }

  private static exportAsExcel(
    sheets: { [sheetName: string]: any[] },
    filename: string
  ): { blob: Blob; filename: string } {
    const workbook = XLSX.utils.book_new();
    
    Object.entries(sheets).forEach(([sheetName, data]) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const columnWidths: { [key: string]: number } = {};
      
      // Calculate column widths based on content
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          if (cell && cell.v) {
            const columnName = XLSX.utils.encode_col(col);
            const currentWidth = columnWidths[columnName] || 0;
            const cellWidth = String(cell.v).length;
            if (cellWidth > currentWidth) {
              columnWidths[columnName] = Math.min(cellWidth, 50); // Max width of 50
            }
          }
        }
      }
      
      // Set column widths
      worksheet['!cols'] = Object.values(columnWidths).map(width => ({ width: width + 2 }));
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    return { blob, filename };
  }

  private static exportAsJSON(data: any, filename: string): { blob: Blob; filename: string } {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    return { blob, filename };
  }

  // Utility to download the exported file
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate export with custom date range
  static async exportWithDateRange(
    exportFunction: Function,
    startDate: Date,
    endDate: Date,
    additionalFilters?: any
  ) {
    // This would be implemented to filter data by date range
    // For now, it's a placeholder for the concept
    console.log(`Exporting data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    return exportFunction(additionalFilters);
  }
}

// Scheduled export configurations
export interface ScheduledExportConfig {
  id: string;
  name: string;
  type: 'registrations' | 'teams' | 'players' | 'fixtures' | 'results';
  format: ExportFormat;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  filters?: {
    organizationId?: string;
    tournamentId?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  isActive: boolean;
  createdAt: Date;
  lastRun?: Date;
}

export class ScheduledExportManager {
  private static configs: Map<string, ScheduledExportConfig> = new Map();

  static addScheduledExport(config: Omit<ScheduledExportConfig, 'id' | 'createdAt'>): string {
    const id = `export_${Date.now()}`;
    const fullConfig: ScheduledExportConfig = {
      ...config,
      id,
      createdAt: new Date()
    };
    
    this.configs.set(id, fullConfig);
    return id;
  }

  static getScheduledExports(): ScheduledExportConfig[] {
    return Array.from(this.configs.values());
  }

  static updateScheduledExport(id: string, updates: Partial<ScheduledExportConfig>): boolean {
    const config = this.configs.get(id);
    if (!config) return false;
    
    this.configs.set(id, { ...config, ...updates });
    return true;
  }

  static deleteScheduledExport(id: string): boolean {
    return this.configs.delete(id);
  }

  // In a real implementation, this would be called by a cron job or scheduler
  static async runScheduledExports(): Promise<void> {
    const now = new Date();
    
    // Convert Map values to array for iteration
    const configArray = Array.from(this.configs.values());
    for (const config of configArray) {
      if (!config.isActive) continue;
      
      const shouldRun = this.shouldRunExport(config, now);
      if (shouldRun) {
        try {
          await this.executeScheduledExport(config);
          config.lastRun = now;
        } catch (error) {
          console.error(`Failed to run scheduled export ${config.id}:`, error);
        }
      }
    }
  }

  private static shouldRunExport(config: ScheduledExportConfig, now: Date): boolean {
    if (!config.lastRun) return true;
    
    const timeSinceLastRun = now.getTime() - config.lastRun.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    switch (config.frequency) {
      case 'daily':
        return timeSinceLastRun >= oneDayMs;
      case 'weekly':
        return timeSinceLastRun >= (7 * oneDayMs);
      case 'monthly':
        return timeSinceLastRun >= (30 * oneDayMs);
      default:
        return false;
    }
  }

  private static async executeScheduledExport(config: ScheduledExportConfig): Promise<void> {
    console.log(`Executing scheduled export: ${config.name}`);
    
    // In a real implementation, this would:
    // 1. Fetch the data based on config.type and filters
    // 2. Generate the export using DataExporter
    // 3. Send to recipients via email or API integration
    // 4. Log the execution
    
    // Placeholder implementation
    const mockData = { message: `Scheduled export ${config.name} executed` };
    console.log('Export result:', mockData);
  }
}