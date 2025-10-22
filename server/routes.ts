import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTournamentSchema, insertTeamSchema, insertMatchSchema, insertPlayerRegistrySchema, insertPlayerDocumentSchema, insertTournamentPlayerSchema, insertRosterMemberSchema, insertUserOrganizationRoleSchema } from "@shared/schema";
import { z } from "zod";
import { generateRoundRobinFixtures } from "./lib/fixtureGenerator";
import { calculateStandings } from "./lib/standingsCalculator";
import { db } from "./db";
import { rounds, stages, teams, matches, tournaments, playerRegistry, disciplinaryRecords } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { setupAuth, isAuthenticated, requireSuperAdmin, requireOrgAccess } from "./replitAuth";

// Helper function to hash identity keys
function hashIdentityKey(orgId: string, docType: string, docNumber: string): string {
  const salt = process.env.SESSION_SECRET || "default-salt";
  return crypto
    .createHmac("sha256", salt)
    .update(`${orgId}:${docType}:${docNumber}`)
    .digest("hex");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);

  // Authentication endpoint - returns the current user with roles
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userWithRoles = await storage.getUserWithRoles(user.claims.sub);
      res.json(userWithRoles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User Management (Super Admin only)
  app.get("/api/users", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsersWithRoles();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users/:userId/roles", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const parsed = insertUserOrganizationRoleSchema.parse(req.body);
      const role = await storage.assignUserRole({ ...parsed, userId });
      res.status(201).json(role);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:userId/roles", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { orgId } = req.query;
      await storage.removeUserRole(userId, orgId as string || null);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reference Data
  app.get("/api/organizations", isAuthenticated, async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/organizations/:orgId/stats", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
    try {
      const orgId = req.params.orgId;
      const { inArray } = await import("drizzle-orm");
      
      // Get all tournament IDs for the organization
      const orgTournaments = await db
        .select({ id: tournaments.id })
        .from(tournaments)
        .where(eq(tournaments.orgId, orgId));
      
      const tournamentIds = orgTournaments.map(t => t.id);
      
      let totalTeams = 0;
      let completedMatches = 0;
      
      if (tournamentIds.length > 0) {
        // Count teams directly with WHERE clause
        const orgTeams = await db
          .select()
          .from(teams)
          .where(inArray(teams.tournamentId, tournamentIds));
        totalTeams = orgTeams.length;
        
        // Get stage IDs for org tournaments
        const orgStages = await db
          .select({ id: stages.id })
          .from(stages)
          .where(inArray(stages.tournamentId, tournamentIds));
        
        const stageIds = orgStages.map(s => s.id);
        
        if (stageIds.length > 0) {
          // Get round IDs for org stages
          const orgRounds = await db
            .select({ id: rounds.id })
            .from(rounds)
            .where(inArray(rounds.stageId, stageIds));
          
          const roundIds = orgRounds.map(r => r.id);
          
          if (roundIds.length > 0) {
            // Count completed matches directly with WHERE clauses
            const { and } = await import("drizzle-orm");
            const completed = await db
              .select()
              .from(matches)
              .where(
                and(
                  inArray(matches.roundId, roundIds),
                  eq(matches.status, 'COMPLETED')
                )
              );
            completedMatches = completed.length;
          }
        }
      }
      
      res.json({
        totalTeams,
        completedMatches,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sports", isAuthenticated, async (req, res) => {
    try {
      const sports = await storage.getSports();
      res.json(sports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/counties", isAuthenticated, async (req, res) => {
    try {
      const counties = await storage.getCounties();
      res.json(counties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/counties/:countyId/sub-counties", isAuthenticated, async (req, res) => {
    try {
      const subCounties = await storage.getSubCountiesByCounty(req.params.countyId);
      res.json(subCounties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sub-counties/:subCountyId/wards", isAuthenticated, async (req, res) => {
    try {
      const wards = await storage.getWardsBySubCounty(req.params.subCountyId);
      res.json(wards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Players
  app.get("/api/players", async (req, res) => {
    try {
      const orgId = req.query.orgId as string;
      if (!orgId) {
        return res.status(400).json({ error: "orgId is required" });
      }
      const players = await storage.getPlayersByOrg(orgId);
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/players/search", async (req, res) => {
    try {
      const orgId = req.query.orgId as string;
      const query = req.query.q as string;
      if (!orgId || !query) {
        return res.status(400).json({ error: "orgId and q are required" });
      }
      const players = await storage.searchPlayers(orgId, query);
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayerById(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      // Extract and validate request body
      const { docType, docNumber, ...playerData } = req.body;
      
      // Generate HMAC-SHA256 hash for identity keys
      let hashedKeys = "";
      if (docType && docNumber) {
        hashedKeys = hashIdentityKey(playerData.orgId, docType, docNumber);
      } else {
        // Use a combination of name + DOB as fallback identity
        hashedKeys = hashIdentityKey(
          playerData.orgId,
          "NAME_DOB",
          `${playerData.firstName}${playerData.lastName}${playerData.dob || ""}`
        );
      }
      
      // Validate with hashed keys
      const validatedData = insertPlayerRegistrySchema.parse({
        ...playerData,
        hashedIdentityKeys: hashedKeys,
      });
      
      // Check for duplicates using hashed identity keys
      const duplicates = await storage.findDuplicatePlayers(
        validatedData.orgId,
        hashedKeys
      );
      
      if (duplicates.length > 0) {
        return res.status(409).json({ 
          error: "Duplicate player found",
          duplicates: duplicates
        });
      }
      
      const player = await storage.createPlayer(validatedData);
      res.status(201).json(player);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.updatePlayer(req.params.id, req.body);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Player Documents
  app.get("/api/organizations/:orgId/documents", async (req, res) => {
    try {
      const verified = req.query.verified !== undefined
        ? req.query.verified === 'true'
        : undefined;
      const documents = await storage.getDocumentsByOrg(req.params.orgId, verified);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/players/:upid/documents", async (req, res) => {
    try {
      const documents = await storage.getPlayerDocuments(req.params.upid);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/players/:upid/documents", async (req, res) => {
    try {
      const validatedData = insertPlayerDocumentSchema.parse({
        ...req.body,
        upid: req.params.upid
      });
      
      // Hash the document number for uniqueness check
      if (req.body.docNumber) {
        validatedData.docNumberHash = hashIdentityKey(
          req.body.orgId,
          validatedData.docType,
          req.body.docNumber
        );
      }
      
      const document = await storage.createPlayerDocument(validatedData);
      res.status(201).json(document);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/player-documents/:id", async (req, res) => {
    try {
      const document = await storage.updatePlayerDocument(req.params.id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/player-documents/:id", async (req, res) => {
    try {
      await storage.deletePlayerDocument(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tournament Players (TPID)
  app.get("/api/tournaments/:tournamentId/players", async (req, res) => {
    try {
      const players = await storage.getTournamentPlayers(req.params.tournamentId);
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments/:tournamentId/players", async (req, res) => {
    try {
      // Check if player already exists in this tournament
      const existing = await storage.findTournamentPlayer(
        req.params.tournamentId,
        req.body.upid
      );
      
      if (existing) {
        return res.status(409).json({ 
          error: "Player already registered in this tournament",
          tpid: existing.id
        });
      }
      
      const validatedData = insertTournamentPlayerSchema.parse({
        ...req.body,
        tournamentId: req.params.tournamentId
      });
      
      const tournamentPlayer = await storage.createTournamentPlayer(validatedData);
      res.status(201).json(tournamentPlayer);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/tournament-players/:id", async (req, res) => {
    try {
      const tournamentPlayer = await storage.updateTournamentPlayer(req.params.id, req.body);
      if (!tournamentPlayer) {
        return res.status(404).json({ error: "Tournament player not found" });
      }
      res.json(tournamentPlayer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Roster Members
  app.get("/api/teams/:teamId/roster", async (req, res) => {
    try {
      const roster = await storage.getRosterMembersByTeam(req.params.teamId);
      res.json(roster);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:tournamentId/roster", async (req, res) => {
    try {
      const roster = await storage.getRosterMembersByTournament(req.params.tournamentId);
      res.json(roster);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teams/:teamId/roster", async (req, res) => {
    try {
      const validatedData = insertRosterMemberSchema.parse({
        ...req.body,
        teamId: req.params.teamId
      });
      
      const rosterMember = await storage.createRosterMember(validatedData);
      res.status(201).json(rosterMember);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/roster-members/:id", async (req, res) => {
    try {
      const rosterMember = await storage.updateRosterMember(req.params.id, req.body);
      if (!rosterMember) {
        return res.status(404).json({ error: "Roster member not found" });
      }
      res.json(rosterMember);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Eligibility
  app.post("/api/tournaments/:tournamentId/check-eligibility", async (req, res) => {
    try {
      const { upid, teamId } = req.body;
      if (!upid) {
        return res.status(400).json({ error: "upid is required" });
      }
      
      const { EligibilityService } = await import("./eligibilityService");
      const eligibilityService = new EligibilityService(storage);
      const result = await eligibilityService.checkPlayerEligibility(upid, req.params.tournamentId, teamId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:tournamentId/eligibility-rules", async (req, res) => {
    try {
      const rules = await storage.getEligibilityRulesByTournament(req.params.tournamentId);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments/:tournamentId/eligibility-rules", async (req, res) => {
    try {
      const { insertEligibilityRuleSchema } = await import("@shared/schema");
      const validatedData = insertEligibilityRuleSchema.parse({
        ...req.body,
        tournamentId: req.params.tournamentId,
      });
      
      const rule = await storage.createEligibilityRule(validatedData);
      res.status(201).json(rule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/eligibility-rules/:id", async (req, res) => {
    try {
      const { updateEligibilityRuleSchema } = await import("@shared/schema");
      // Validate update data using dedicated update schema
      const validatedData = updateEligibilityRuleSchema.parse(req.body);
      
      const rule = await storage.updateEligibilityRule(req.params.id, validatedData);
      if (!rule) {
        return res.status(404).json({ error: "Eligibility rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/eligibility-rules/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEligibilityRule(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Eligibility rule not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Contracts
  app.get("/api/organizations/:orgId/contracts", async (req, res) => {
    try {
      const contracts = await storage.getContractsByOrg(req.params.orgId);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/players/:upid/contracts", async (req, res) => {
    try {
      const contracts = await storage.getContractsByPlayer(req.params.upid);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teams/:teamId/contracts", async (req, res) => {
    try {
      const contracts = await storage.getContractsByTeam(req.params.teamId);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const contract = await storage.getContractById(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      const { insertContractSchema } = await import("@shared/schema");
      const validatedData = insertContractSchema.parse(req.body);
      
      const contract = await storage.createContract(validatedData);
      res.status(201).json(contract);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/contracts/:id", async (req, res) => {
    try {
      const { updateContractSchema } = await import("@shared/schema");
      const validatedData = updateContractSchema.parse(req.body);
      
      const contract = await storage.updateContract(req.params.id, validatedData);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/contracts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteContract(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Transfers
  app.get("/api/organizations/:orgId/transfers", async (req, res) => {
    try {
      const transfers = await storage.getTransfersByOrg(req.params.orgId);
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/players/:upid/transfers", async (req, res) => {
    try {
      const transfers = await storage.getTransfersByPlayer(req.params.upid);
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teams/:teamId/transfers", async (req, res) => {
    try {
      const transfers = await storage.getTransfersByTeam(req.params.teamId);
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transfers/:id", async (req, res) => {
    try {
      const transfer = await storage.getTransferById(req.params.id);
      if (!transfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transfers", async (req, res) => {
    try {
      const { insertTransferSchema } = await import("@shared/schema");
      const validatedData = insertTransferSchema.parse(req.body);
      
      const transfer = await storage.createTransfer(validatedData);
      res.status(201).json(transfer);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/transfers/:id", async (req, res) => {
    try {
      const { updateTransferSchema } = await import("@shared/schema");
      const validatedData = updateTransferSchema.parse(req.body);
      
      const transfer = await storage.updateTransfer(req.params.id, validatedData);
      if (!transfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/transfers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransfer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Disciplinary Records
  app.get("/api/organizations/:orgId/disciplinary-records", async (req, res) => {
    try {
      const records = await storage.getDisciplinaryRecordsByOrg(req.params.orgId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/players/:upid/disciplinary-records", async (req, res) => {
    try {
      const records = await storage.getDisciplinaryRecordsByPlayer(req.params.upid);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:tournamentId/disciplinary-records", async (req, res) => {
    try {
      const records = await storage.getDisciplinaryRecordsByTournament(req.params.tournamentId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/disciplinary-records/:id", async (req, res) => {
    try {
      const record = await storage.getDisciplinaryRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ error: "Disciplinary record not found" });
      }
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/disciplinary-records", async (req, res) => {
    try {
      const { insertDisciplinaryRecordSchema } = await import("@shared/schema");
      const validatedData = insertDisciplinaryRecordSchema.parse(req.body);
      
      const record = await storage.createDisciplinaryRecord(validatedData);
      res.status(201).json(record);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/disciplinary-records/:id", async (req, res) => {
    try {
      const record = await storage.updateDisciplinaryRecord(req.params.id, req.body);
      if (!record) {
        return res.status(404).json({ error: "Disciplinary record not found" });
      }
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/disciplinary-records/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDisciplinaryRecord(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Disciplinary record not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tournaments
  app.get("/api/tournaments", async (req, res) => {
    try {
      const orgId = req.query.orgId as string;
      if (!orgId) {
        return res.status(400).json({ error: "orgId is required" });
      }
      const tournaments = await storage.getTournaments(orgId);
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournamentById(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/slug/:slug", async (req, res) => {
    try {
      const tournament = await storage.getTournamentBySlug(req.params.slug);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments", async (req, res) => {
    try {
      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(validatedData);
      res.status(201).json(tournament);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.updateTournament(req.params.id, req.body);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tournaments/:id", async (req, res) => {
    try {
      await storage.deleteTournament(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teams
  app.get("/api/tournaments/:tournamentId/teams", async (req, res) => {
    try {
      const teams = await storage.getTeamsByTournament(req.params.tournamentId);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments/:tournamentId/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse({
        ...req.body,
        tournamentId: req.params.tournamentId,
      });
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments/:tournamentId/teams/bulk", async (req, res) => {
    try {
      const { teams } = req.body;
      if (!Array.isArray(teams)) {
        return res.status(400).json({ error: "teams must be an array" });
      }
      const teamsWithTournamentId = teams.map((team) => ({
        ...team,
        tournamentId: req.params.tournamentId,
      }));
      const created = await storage.createTeams(teamsWithTournamentId);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.updateTeam(req.params.id, req.body);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json(team);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      await storage.deleteTeam(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Matches
  app.get("/api/tournaments/:tournamentId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByTournament(req.params.tournamentId);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rounds/:roundId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByRound(req.params.roundId);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const validatedData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validatedData);
      res.status(201).json(match);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.updateMatch(req.params.id, req.body);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(match);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Fixture Generation
  app.post("/api/tournaments/:tournamentId/generate-fixtures", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const { startDate, kickoffTime, weekendsOnly, homeAndAway, venue } = req.body;

      // Get teams for this tournament
      const tournamentTeams = await storage.getTeamsByTournament(tournamentId);
      if (tournamentTeams.length < 2) {
        return res.status(400).json({ error: "At least 2 teams required to generate fixtures" });
      }

      // Get the first stage for this tournament
      const stagesList = await db
        .select()
        .from(stages)
        .where(eq(stages.tournamentId, tournamentId))
        .limit(1);

      if (stagesList.length === 0) {
        return res.status(400).json({ error: "No stages found for tournament" });
      }

      const stage = stagesList[0];

      // Generate fixtures
      const fixtures = generateRoundRobinFixtures({
        teams: tournamentTeams,
        startDate: new Date(startDate),
        kickoffTime: kickoffTime || "13:00",
        weekendsOnly: weekendsOnly !== false,
        homeAndAway: homeAndAway !== false,
        venue,
      });

      // Create rounds and matches
      const roundsPerLeg = tournamentTeams.length - (tournamentTeams.length % 2 === 0 ? 1 : 0);
      const totalRounds = homeAndAway !== false ? roundsPerLeg * 2 : roundsPerLeg;

      const createdRounds = [];
      for (let i = 1; i <= totalRounds; i++) {
        const [round] = await db
          .insert(rounds)
          .values({
            stageId: stage.id,
            number: i,
            leg: i <= roundsPerLeg ? 1 : 2,
            name: `Round ${i}`,
          })
          .returning();
        createdRounds.push(round);
      }

      // Create matches
      const roundIdMap = new Map(createdRounds.map((r) => [r.number, r.id]));
      const matchesToCreate = fixtures.map((fixture) => ({
        roundId: roundIdMap.get(fixture.round)!,
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        kickoff: fixture.kickoff,
        venue: fixture.venue,
        status: "SCHEDULED" as const,
      }));

      const createdMatches = await db.insert(matches).values(matchesToCreate).returning();

      res.status(201).json({
        rounds: createdRounds,
        matches: createdMatches,
        message: `Generated ${createdMatches.length} fixtures across ${createdRounds.length} rounds`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Standings
  app.get("/api/tournaments/:tournamentId/standings", async (req, res) => {
    try {
      const { tournamentId } = req.params;

      const tournamentTeams = await storage.getTeamsByTournament(tournamentId);
      const matchesData = await storage.getMatchesByTournament(tournamentId);

      // Extract just the match objects from the joined data
      const matches = matchesData.map((m: any) => m.match);

      const standings = calculateStandings(tournamentTeams, matches);

      res.json(standings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reports - Player Statistics
  app.get("/api/organizations/:orgId/reports/players", async (req, res) => {
    try {
      const { orgId } = req.params;

      const players = await db
        .select()
        .from(playerRegistry)
        .where(eq(playerRegistry.orgId, orgId));

      const totalPlayers = players.length;
      const activeCountPlayers = players.filter((p) => p.status === "ACTIVE").length;
      const inactivePlayers = totalPlayers - activeCountPlayers;

      const byNationality: Record<string, number> = {};
      const byStatus: Record<string, number> = {};

      players.forEach((player) => {
        const nationality = player.nationality || "Unknown";
        byNationality[nationality] = (byNationality[nationality] || 0) + 1;

        const status = player.status || "Unknown";
        byStatus[status] = (byStatus[status] || 0) + 1;
      });

      res.json({
        totalPlayers,
        activeCountPlayers,
        inactivePlayers,
        byNationality: Object.entries(byNationality).map(([nationality, count]) => ({
          nationality,
          count,
        })),
        byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reports - Tournament Statistics
  app.get("/api/organizations/:orgId/reports/tournaments", async (req, res) => {
    try {
      const { orgId } = req.params;

      const tournamentsList = await db
        .select()
        .from(tournaments)
        .where(eq(tournaments.orgId, orgId));

      const totalTournaments = tournamentsList.length;

      const byStatus: Record<string, number> = {};
      const byModel: Record<string, number> = {};

      tournamentsList.forEach((tournament) => {
        const status = tournament.status || "Unknown";
        byStatus[status] = (byStatus[status] || 0) + 1;

        const model = tournament.tournamentModel || "Unknown";
        byModel[model] = (byModel[model] || 0) + 1;
      });

      res.json({
        totalTournaments,
        byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
        byModel: Object.entries(byModel).map(([model, count]) => ({ model, count })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reports - Disciplinary Statistics
  app.get("/api/organizations/:orgId/reports/disciplinary", async (req, res) => {
    try {
      const { orgId } = req.params;

      const records = await db
        .select()
        .from(disciplinaryRecords)
        .where(eq(disciplinaryRecords.orgId, orgId));

      const totalRecords = records.length;
      const activeRecords = records.filter((r) => r.status === "ACTIVE").length;

      const byType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};

      records.forEach((record) => {
        const type = record.incidentType || "Unknown";
        byType[type] = (byType[type] || 0) + 1;

        const status = record.status || "Unknown";
        byStatus[status] = (byStatus[status] || 0) + 1;
      });

      res.json({
        totalRecords,
        activeRecords,
        byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
        byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
