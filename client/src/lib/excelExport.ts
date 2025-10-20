import * as XLSX from "xlsx";
import { format } from "date-fns";

export interface FixtureExportData {
  round: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  status: string;
}

export interface StandingExportData {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export function exportFixturesToExcel(
  fixtures: FixtureExportData[],
  tournamentName: string
) {
  const worksheet = XLSX.utils.json_to_sheet(fixtures);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 10 }, // Round
    { wch: 15 }, // Date
    { wch: 10 }, // Time
    { wch: 25 }, // Home Team
    { wch: 25 }, // Away Team
    { wch: 25 }, // Venue
    { wch: 12 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Fixtures");

  const filename = `${tournamentName.replace(/\s+/g, "_")}_Fixtures_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function exportStandingsToExcel(
  standings: StandingExportData[],
  tournamentName: string
) {
  const worksheet = XLSX.utils.json_to_sheet(standings);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 8 },  // Position
    { wch: 25 }, // Team
    { wch: 8 },  // Played
    { wch: 6 },  // Won
    { wch: 6 },  // Drawn
    { wch: 6 },  // Lost
    { wch: 8 },  // GF
    { wch: 8 },  // GA
    { wch: 8 },  // GD
    { wch: 8 },  // Points
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Standings");

  const filename = `${tournamentName.replace(/\s+/g, "_")}_Standings_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
