import {
  type Tournament,
  type InsertTournament,
  type Team,
  type InsertTeam,
  type Match,
  type InsertMatch,
  type Organization,
  type Sport,
  type County,
  type PlayerRegistry,
  type InsertPlayerRegistry,
  type PlayerDocument,
  type InsertPlayerDocument,
  type TournamentPlayer,
  type InsertTournamentPlayer,
  type RosterMember,
  type InsertRosterMember,
  tournaments,
  teams,
  matches,
  organizations,
  sports,
  counties,
  subCounties,
  wards,
  stages,
  leagueDivisions,
  groups,
  teamGroups,
  rounds,
  playerRegistry,
  playerDocuments,
  tournamentPlayers,
  rosterMembers,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // Tournaments
  getTournaments(orgId: string): Promise<Tournament[]>;
  getTournamentById(id: string): Promise<Tournament | undefined>;
  getTournamentBySlug(slug: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, tournament: Partial<InsertTournament>): Promise<Tournament | undefined>;
  deleteTournament(id: string): Promise<boolean>;

  // Teams
  getTeamsByTournament(tournamentId: string): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  createTeams(teams: InsertTeam[]): Promise<Team[]>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;

  // Matches
  getMatchesByTournament(tournamentId: string): Promise<any[]>;
  getMatchesByRound(roundId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined>;

  // Players
  getPlayersByOrg(orgId: string): Promise<PlayerRegistry[]>;
  getPlayerById(id: string): Promise<PlayerRegistry | undefined>;
  searchPlayers(orgId: string, query: string): Promise<PlayerRegistry[]>;
  findDuplicatePlayers(orgId: string, hashedIdentityKeys: string): Promise<PlayerRegistry[]>;
  createPlayer(player: InsertPlayerRegistry): Promise<PlayerRegistry>;
  updatePlayer(id: string, player: Partial<InsertPlayerRegistry>): Promise<PlayerRegistry | undefined>;
  
  // Player Documents
  getPlayerDocuments(upid: string): Promise<PlayerDocument[]>;
  createPlayerDocument(document: InsertPlayerDocument): Promise<PlayerDocument>;
  updatePlayerDocument(id: string, document: Partial<InsertPlayerDocument>): Promise<PlayerDocument | undefined>;
  deletePlayerDocument(id: string): Promise<boolean>;

  // Tournament Players (TPID)
  getTournamentPlayers(tournamentId: string): Promise<TournamentPlayer[]>;
  getTournamentPlayerById(id: string): Promise<TournamentPlayer | undefined>;
  findTournamentPlayer(tournamentId: string, upid: string): Promise<TournamentPlayer | undefined>;
  createTournamentPlayer(tournamentPlayer: InsertTournamentPlayer): Promise<TournamentPlayer>;
  updateTournamentPlayer(id: string, tournamentPlayer: Partial<InsertTournamentPlayer>): Promise<TournamentPlayer | undefined>;

  // Roster Members
  getRosterMembersByTeam(teamId: string): Promise<any[]>;
  getRosterMembersByTournament(tournamentId: string): Promise<any[]>;
  createRosterMember(rosterMember: InsertRosterMember): Promise<RosterMember>;
  updateRosterMember(id: string, rosterMember: Partial<InsertRosterMember>): Promise<RosterMember | undefined>;

  // Reference Data
  getOrganizations(): Promise<Organization[]>;
  getSports(): Promise<Sport[]>;
  getCounties(): Promise<County[]>;
  getSubCountiesByCounty(countyId: string): Promise<any[]>;
  getWardsBySubCounty(subCountyId: string): Promise<any[]>;
}

export class DbStorage implements IStorage {
  // Tournaments
  async getTournaments(orgId: string): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.orgId, orgId))
      .orderBy(desc(tournaments.createdAt));
  }

  async getTournamentById(id: string): Promise<Tournament | undefined> {
    const result = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id))
      .limit(1);
    return result[0];
  }

  async getTournamentBySlug(slug: string): Promise<Tournament | undefined> {
    const result = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.slug, slug))
      .limit(1);
    return result[0];
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [created] = await db.insert(tournaments).values(tournament).returning();
    
    // Create default stage
    const [stage] = await db.insert(stages).values({
      tournamentId: created.id,
      name: "Main Stage",
      stageType: "LEAGUE",
      seq: 1,
    }).returning();

    // Create default division
    await db.insert(leagueDivisions).values({
      stageId: stage.id,
      name: "Division 1",
      level: 1,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      tiebreakers: ["POINTS", "GD", "GF", "H2H"],
    });

    return created;
  }

  async updateTournament(id: string, tournament: Partial<InsertTournament>): Promise<Tournament | undefined> {
    const [updated] = await db
      .update(tournaments)
      .set({ ...tournament, updatedAt: new Date() })
      .where(eq(tournaments.id, id))
      .returning();
    return updated;
  }

  async deleteTournament(id: string): Promise<boolean> {
    const result = await db.delete(tournaments).where(eq(tournaments.id, id));
    return true;
  }

  // Teams
  async getTeamsByTournament(tournamentId: string): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.tournamentId, tournamentId));
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [created] = await db.insert(teams).values(team).returning();
    return created;
  }

  async createTeams(teamList: InsertTeam[]): Promise<Team[]> {
    return await db.insert(teams).values(teamList).returning();
  }

  async updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updated] = await db
      .update(teams)
      .set({ ...team, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return updated;
  }

  async deleteTeam(id: string): Promise<boolean> {
    await db.delete(teams).where(eq(teams.id, id));
    return true;
  }

  // Matches
  async getMatchesByTournament(tournamentId: string): Promise<any[]> {
    const result = await db
      .select({
        match: matches,
        homeTeam: teams,
        round: rounds,
      })
      .from(matches)
      .leftJoin(teams, eq(matches.homeTeamId, teams.id))
      .leftJoin(rounds, eq(matches.roundId, rounds.id))
      .where(eq(teams.tournamentId, tournamentId));
    
    return result as any[];
  }

  async getMatchesByRound(roundId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(eq(matches.roundId, roundId));
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [created] = await db.insert(matches).values(match).returning();
    return created;
  }

  async updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined> {
    const [updated] = await db
      .update(matches)
      .set({ ...match, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return updated;
  }

  // Reference Data
  async getOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  async getSports(): Promise<Sport[]> {
    return await db.select().from(sports);
  }

  async getCounties(): Promise<County[]> {
    return await db.select().from(counties);
  }

  async getSubCountiesByCounty(countyId: string): Promise<any[]> {
    return await db
      .select()
      .from(subCounties)
      .where(eq(subCounties.countyId, countyId));
  }

  async getWardsBySubCounty(subCountyId: string): Promise<any[]> {
    return await db
      .select()
      .from(wards)
      .where(eq(wards.subCountyId, subCountyId));
  }

  // Players
  async getPlayersByOrg(orgId: string): Promise<PlayerRegistry[]> {
    return await db
      .select()
      .from(playerRegistry)
      .where(eq(playerRegistry.orgId, orgId))
      .orderBy(desc(playerRegistry.createdAt));
  }

  async getPlayerById(id: string): Promise<PlayerRegistry | undefined> {
    const result = await db
      .select()
      .from(playerRegistry)
      .where(eq(playerRegistry.id, id))
      .limit(1);
    return result[0];
  }

  async searchPlayers(orgId: string, query: string): Promise<PlayerRegistry[]> {
    return await db
      .select()
      .from(playerRegistry)
      .where(
        and(
          eq(playerRegistry.orgId, orgId),
          or(
            ilike(playerRegistry.firstName, `%${query}%`),
            ilike(playerRegistry.lastName, `%${query}%`),
            ilike(sql`CONCAT(${playerRegistry.firstName}, ' ', ${playerRegistry.lastName})`, `%${query}%`)
          )
        )
      )
      .orderBy(desc(playerRegistry.createdAt))
      .limit(20);
  }

  async findDuplicatePlayers(orgId: string, hashedIdentityKeys: string): Promise<PlayerRegistry[]> {
    return await db
      .select()
      .from(playerRegistry)
      .where(
        and(
          eq(playerRegistry.orgId, orgId),
          eq(playerRegistry.hashedIdentityKeys, hashedIdentityKeys)
        )
      );
  }

  async createPlayer(player: InsertPlayerRegistry): Promise<PlayerRegistry> {
    const [created] = await db.insert(playerRegistry).values(player).returning();
    return created;
  }

  async updatePlayer(id: string, player: Partial<InsertPlayerRegistry>): Promise<PlayerRegistry | undefined> {
    const [updated] = await db
      .update(playerRegistry)
      .set({ ...player, updatedAt: new Date() })
      .where(eq(playerRegistry.id, id))
      .returning();
    return updated;
  }

  // Player Documents
  async getPlayerDocuments(upid: string): Promise<PlayerDocument[]> {
    return await db
      .select()
      .from(playerDocuments)
      .where(eq(playerDocuments.upid, upid))
      .orderBy(desc(playerDocuments.createdAt));
  }

  async createPlayerDocument(document: InsertPlayerDocument): Promise<PlayerDocument> {
    const [created] = await db.insert(playerDocuments).values(document).returning();
    return created;
  }

  async updatePlayerDocument(id: string, document: Partial<InsertPlayerDocument>): Promise<PlayerDocument | undefined> {
    const [updated] = await db
      .update(playerDocuments)
      .set(document)
      .where(eq(playerDocuments.id, id))
      .returning();
    return updated;
  }

  async deletePlayerDocument(id: string): Promise<boolean> {
    await db.delete(playerDocuments).where(eq(playerDocuments.id, id));
    return true;
  }

  // Tournament Players (TPID)
  async getTournamentPlayers(tournamentId: string): Promise<TournamentPlayer[]> {
    return await db
      .select()
      .from(tournamentPlayers)
      .where(eq(tournamentPlayers.tournamentId, tournamentId))
      .orderBy(desc(tournamentPlayers.registeredAt));
  }

  async getTournamentPlayerById(id: string): Promise<TournamentPlayer | undefined> {
    const result = await db
      .select()
      .from(tournamentPlayers)
      .where(eq(tournamentPlayers.id, id))
      .limit(1);
    return result[0];
  }

  async findTournamentPlayer(tournamentId: string, upid: string): Promise<TournamentPlayer | undefined> {
    const result = await db
      .select()
      .from(tournamentPlayers)
      .where(
        and(
          eq(tournamentPlayers.tournamentId, tournamentId),
          eq(tournamentPlayers.upid, upid)
        )
      )
      .limit(1);
    return result[0];
  }

  async createTournamentPlayer(tournamentPlayer: InsertTournamentPlayer): Promise<TournamentPlayer> {
    const [created] = await db.insert(tournamentPlayers).values(tournamentPlayer).returning();
    return created;
  }

  async updateTournamentPlayer(id: string, tournamentPlayer: Partial<InsertTournamentPlayer>): Promise<TournamentPlayer | undefined> {
    const [updated] = await db
      .update(tournamentPlayers)
      .set(tournamentPlayer)
      .where(eq(tournamentPlayers.id, id))
      .returning();
    return updated;
  }

  // Roster Members
  async getRosterMembersByTeam(teamId: string): Promise<any[]> {
    return await db
      .select({
        id: rosterMembers.id,
        tpid: rosterMembers.tpid,
        teamId: rosterMembers.teamId,
        joinedAt: rosterMembers.joinedAt,
        leftAt: rosterMembers.leftAt,
        jerseyNumber: tournamentPlayers.jerseyNumber,
        position: tournamentPlayers.position,
        upid: tournamentPlayers.upid,
        firstName: playerRegistry.firstName,
        lastName: playerRegistry.lastName,
        dob: playerRegistry.dob,
        sex: playerRegistry.sex,
      })
      .from(rosterMembers)
      .innerJoin(tournamentPlayers, eq(rosterMembers.tpid, tournamentPlayers.id))
      .innerJoin(playerRegistry, eq(tournamentPlayers.upid, playerRegistry.id))
      .where(
        and(
          eq(rosterMembers.teamId, teamId),
          sql`${rosterMembers.leftAt} IS NULL`
        )
      )
      .orderBy(desc(rosterMembers.joinedAt));
  }

  async getRosterMembersByTournament(tournamentId: string): Promise<any[]> {
    return await db
      .select({
        id: rosterMembers.id,
        tpid: rosterMembers.tpid,
        teamId: rosterMembers.teamId,
        teamName: teams.name,
        joinedAt: rosterMembers.joinedAt,
        leftAt: rosterMembers.leftAt,
        jerseyNumber: tournamentPlayers.jerseyNumber,
        position: tournamentPlayers.position,
        upid: tournamentPlayers.upid,
        firstName: playerRegistry.firstName,
        lastName: playerRegistry.lastName,
      })
      .from(rosterMembers)
      .innerJoin(tournamentPlayers, eq(rosterMembers.tpid, tournamentPlayers.id))
      .innerJoin(playerRegistry, eq(tournamentPlayers.upid, playerRegistry.id))
      .innerJoin(teams, eq(rosterMembers.teamId, teams.id))
      .where(
        and(
          eq(tournamentPlayers.tournamentId, tournamentId),
          sql`${rosterMembers.leftAt} IS NULL`
        )
      )
      .orderBy(desc(rosterMembers.joinedAt));
  }

  async createRosterMember(rosterMember: InsertRosterMember): Promise<RosterMember> {
    const [created] = await db.insert(rosterMembers).values(rosterMember).returning();
    return created;
  }

  async updateRosterMember(id: string, rosterMember: Partial<InsertRosterMember>): Promise<RosterMember | undefined> {
    const [updated] = await db
      .update(rosterMembers)
      .set(rosterMember)
      .where(eq(rosterMembers.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DbStorage();
