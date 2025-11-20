import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertTournamentSchema, insertTeamSchema, insertMatchSchema, insertPlayerRegistrySchema, insertPlayerDocumentSchema, insertTournamentPlayerSchema, insertRosterMemberSchema, insertUserOrganizationRoleSchema } from "../shared/schema.js";
import { z } from "zod";
import { generateRoundRobinFixtures } from "./lib/fixtureGenerator.js";
import { calculateStandings } from "./lib/standingsCalculator.js";
import { db } from "./db.js";
import { testConnection, hybridQuery } from "./hybridDb.js";
import { rounds, stages, teams, matches, tournaments, playerRegistry, disciplinaryRecords, organizations, teamTournamentRegistrations, groups, teamGroups } from "../shared/schema.js";
import { eq, and, not, inArray } from "drizzle-orm";
import * as crypto from "crypto";

// Import tournament fixture routes
import tournamentFixtureRoutes from "./routes/tournament-fixtures.js";

// Authentication removed - all routes are now public

// Mock authentication middleware (pass-through)
function isAuthenticated(req: any, res: any, next: any) {
  next();
}

function requireSuperAdmin(req: any, res: any, next: any) {
  next();
}

function requireOrgAccess(roles: string[]) {
  return (req: any, res: any, next: any) => {
    next();
  };
}

// Helper function to hash identity keys
function hashIdentityKey(orgId: string, docType: string, docNumber: string): string {
  const salt = process.env.SESSION_SECRET || "default-salt";
  return crypto
    .createHmac("sha256", salt)
    .update(`${orgId}:${docType}:${docNumber}`)
    .digest("hex");
}

// Mock user for authentication-removed app
function getMockUser() {
  return {
    id: "1",
    email: "admin@jamiitourney.com",
    firstName: "Admin",
    lastName: "User",
    claims: { sub: "1" },
    isSuperAdmin: true,
    currentOrgId: "550e8400-e29b-41d4-a716-446655440001",
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication removed - all routes are public

  // Mount tournament fixture routes
  app.use("/api/fixtures", tournamentFixtureRoutes);

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      res.json({ 
        status: "healthy", 
        database: "mock",
        timestamp: new Date().toISOString(),
        message: "Backend server is running"
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: "unhealthy", 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Authentication endpoint - returns the current user with roles
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = getMockUser();
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
  app.get("/api/organizations", async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create Organization
  app.post("/api/organizations", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { name, slug } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      const { eq } = await import("drizzle-orm");
      
      // Check if slug already exists
      const existing = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Organization with this slug already exists" });
      }

      const [organization] = await db
        .insert(organizations)
        .values({
          name,
          slug,
        })
        .returning();

      res.status(201).json(organization);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update Organization
  app.put("/api/organizations/:orgId", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { orgId } = req.params;
      const { name, slug } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      const { eq, and, not } = await import("drizzle-orm");
      
      // Check if slug already exists for another organization
      const existing = await db.select().from(organizations)
        .where(and(eq(organizations.slug, slug), not(eq(organizations.id, orgId))))
        .limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Another organization with this slug already exists" });
      }

      const [organization] = await db
        .update(organizations)
        .set({
          name,
          slug,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId))
        .returning();

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json(organization);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete Organization
  app.delete("/api/organizations/:orgId", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { orgId } = req.params;
      const { eq } = await import("drizzle-orm");

      // Check if organization exists
      const existing = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // TODO: Add check for dependent data (tournaments, teams, players) if needed
      
      await db.delete(organizations).where(eq(organizations.id, orgId));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/organizations/:orgId/stats", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
    try {
      const orgId = req.params.orgId;
      console.log(`[ORG STATS] Request for org: ${orgId}`);
      
      // Return simplified stats for now to prevent crashes
      const stats = {
        totalTournaments: 0,
        totalTeams: 0,
        totalPlayers: 0,
        completedMatches: 0,
        upcomingMatches: 0
      };
      
      try {
        // Get basic tournament count
        const orgTournaments = await db
          .select({ id: tournaments.id })
          .from(tournaments)
          .where(eq(tournaments.orgId, orgId));
        
        stats.totalTournaments = orgTournaments.length;
        console.log(`[ORG STATS] Found ${stats.totalTournaments} tournaments`);
        
        // Get basic team count
        const orgTeams = await db
          .select({ id: teams.id })
          .from(teams)
          .where(eq(teams.orgId, orgId));
          
        stats.totalTeams = orgTeams.length;
        console.log(`[ORG STATS] Found ${stats.totalTeams} teams`);
        
      } catch (dbError: any) {
        console.error('[ORG STATS] Database query failed:', dbError.message);
        // Continue with default stats instead of crashing
      }
      
      console.log(`[ORG STATS] Returning stats:`, stats);
      res.json(stats);
    } catch (error: any) {
      console.error(`[ORG STATS] Endpoint error:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // Public route - no authentication required
  app.get("/api/sports", async (req, res) => {
    try {
      const sports = await storage.getSports();
      res.json(sports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/counties", async (req, res) => {
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
  app.get("/api/players", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
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

  app.get("/api/players/search", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
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

  app.get("/api/players/:id", isAuthenticated, async (req, res) => {
    try {
      const player = await storage.getPlayerById(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Check if user has access to this player's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, player.orgId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      res.json(player);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/players", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN"]), async (req, res) => {
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

  app.patch("/api/players/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the player to check org access
      const existingPlayer = await storage.getPlayerById(req.params.id);
      if (!existingPlayer) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Check if user has access to this player's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingPlayer.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const player = await storage.updatePlayer(req.params.id, req.body);
      res.json(player);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Player Documents
  app.get("/api/organizations/:orgId/documents", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
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

  app.get("/api/players/:upid/documents", isAuthenticated, async (req, res) => {
    try {
      // First get the player to check org access
      const player = await storage.getPlayerByUpid(req.params.upid);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Check if user has access to this player's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, player.orgId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const documents = await storage.getPlayerDocuments(req.params.upid);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/players/:upid/documents", isAuthenticated, async (req, res) => {
    try {
      // First get the player to check org access
      const player = await storage.getPlayerByUpid(req.params.upid);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Check if user has access to this player's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, player.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
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

  app.patch("/api/player-documents/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the document and player to check org access
      const existingDoc = await storage.getPlayerDocumentById(req.params.id);
      if (!existingDoc) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      const player = await storage.getPlayerByUpid(existingDoc.upid);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Check if user has access to this player's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, player.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const document = await storage.updatePlayerDocument(req.params.id, req.body);
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/player-documents/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the document and player to check org access
      const existingDoc = await storage.getPlayerDocumentById(req.params.id);
      if (!existingDoc) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      const player = await storage.getPlayerByUpid(existingDoc.upid);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Check if user has access to this player's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, player.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      await storage.deletePlayerDocument(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================================
  // PLAYER REGISTRATION WORKFLOW API
  // ========================================

  // Start a new player registration (DRAFT status)
  app.post("/api/player-registration/start", isAuthenticated, async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        dob,
        sex,
        nationality,
        email,
        phone,
        wardId,
        orgId,
        selfiePath,
        guardianName,
        guardianPhone,
        guardianRelationship
      } = req.body;

      // Generate UPID
      const upid = crypto.randomUUID();
      
      // Create identity key hash for duplicate detection
      const identityKeyHash = hashIdentityKey(
        orgId,
        "NAME_DOB",
        `${firstName}${lastName}${dob}`
      );

      // Check for duplicates
      const duplicates = await storage.findDuplicatePlayers(orgId, identityKeyHash);
      if (duplicates.length > 0) {
        return res.status(409).json({ 
          error: "Player with same identity already exists",
          duplicates: duplicates
        });
      }

      // Create player registration in DRAFT status
      const player = await storage.createPlayer({
        upid,
        identityKeyHash,
        firstName,
        lastName,
        dob,
        sex,
        nationality,
        email,
        phone,
        wardId,
        orgId,
        selfiePath,
        guardianName,
        guardianPhone,
        guardianRelationship,
        registrationStatus: "DRAFT",
        status: "ACTIVE",
        isActive: true
      });

      res.status(201).json({
        upid: player.upid,
        id: player.id,
        registrationStatus: player.registrationStatus,
        message: "Player registration started successfully"
      });

    } catch (error: any) {
      console.error('Start registration error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Submit registration for review (DRAFT -> SUBMITTED)
  app.patch("/api/player-registration/:upid/submit", isAuthenticated, async (req, res) => {
    try {
      const player = await storage.getPlayerByUpid(req.params.upid);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      if (player.registrationStatus !== "DRAFT") {
        return res.status(400).json({ 
          error: `Cannot submit registration from status: ${player.registrationStatus}` 
        });
      }

      const updated = await storage.updatePlayer(player.id.toString(), {
        registrationStatus: "SUBMITTED"
      });

      res.json({
        upid: updated?.upid,
        registrationStatus: updated?.registrationStatus,
        message: "Registration submitted for review"
      });

    } catch (error: any) {
      console.error('Submit registration error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Review registration (SUBMITTED -> APPROVED/REJECTED/IN_REVIEW)
  app.patch("/api/player-registration/:upid/review", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN"]), async (req, res) => {
    try {
      const { decision, reason, adminNotes } = req.body;
      
      if (!["APPROVED", "REJECTED", "IN_REVIEW"].includes(decision)) {
        return res.status(400).json({ error: "Invalid review decision" });
      }

      const player = await storage.getPlayerByUpid(req.params.upid);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      if (player.registrationStatus !== "SUBMITTED" && player.registrationStatus !== "IN_REVIEW") {
        return res.status(400).json({ 
          error: `Cannot review registration from status: ${player.registrationStatus}` 
        });
      }

      const updated = await storage.updatePlayer(player.id.toString(), {
        registrationStatus: decision,
        adminNotes: adminNotes || reason
      });

      res.json({
        upid: updated?.upid,
        registrationStatus: updated?.registrationStatus,
        message: `Registration ${decision.toLowerCase()}`
      });

    } catch (error: any) {
      console.error('Review registration error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Record player consent
  app.post("/api/player-registration/:upid/consent", isAuthenticated, async (req, res) => {
    try {
      const {
        consentType,
        isConsented,
        consentVersion = "1.0",
        guardianName,
        guardianRelationship
      } = req.body;

      const player = await storage.getPlayerByUpid(req.params.upid);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      // For now, we'll store consent in a simple way
      // In production, you'd want to create a proper player_consents table
      const consentData = {
        [`${consentType.toLowerCase()}Consent`]: isConsented,
        [`${consentType.toLowerCase()}ConsentTimestamp`]: new Date().toISOString(),
        guardianName,
        guardianRelationship
      };

      const updated = await storage.updatePlayer(player.id.toString(), consentData);

      res.json({
        upid: updated?.upid,
        consentType,
        isConsented,
        message: "Consent recorded successfully"
      });

    } catch (error: any) {
      console.error('Record consent error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update medical clearance
  app.patch("/api/player-registration/:upid/medical", isAuthenticated, async (req, res) => {
    try {
      const { status, clearanceDate, expiryDate, notes } = req.body;

      const player = await storage.getPlayerByUpid(req.params.upid);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      const updated = await storage.updatePlayer(player.id.toString(), {
        medicalClearanceStatus: status,
        medicalClearanceDate: clearanceDate,
        medicalExpiryDate: expiryDate,
        medicalNotes: notes
      });

      res.json({
        upid: updated?.upid,
        medicalClearanceStatus: updated?.medicalClearanceStatus,
        message: "Medical clearance updated"
      });

    } catch (error: any) {
      console.error('Update medical clearance error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get registration status and details
  app.get("/api/player-registration/:upid/status", isAuthenticated, async (req, res) => {
    try {
      const player = await storage.getPlayerByUpid(req.params.upid);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      res.json({
        upid: player.upid,
        registrationStatus: player.registrationStatus,
        status: player.status,
        firstName: player.firstName,
        lastName: player.lastName,
        email: player.email,
        phone: player.phone,
        medicalClearanceStatus: player.medicalClearanceStatus,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt
      });

    } catch (error: any) {
      console.error('Get registration status error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Tournament Players (TPID)
  // Public route - no authentication required for viewing tournament players
  app.get("/api/tournaments/:tournamentId/players", async (req, res) => {
    try {
      const players = await storage.getTournamentPlayers(req.params.tournamentId);
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments/:tournamentId/players", isAuthenticated, async (req, res) => {
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

  app.patch("/api/tournament-players/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the tournament player to check org access
      const existingTP = await storage.getTournamentPlayerById(req.params.id);
      if (!existingTP) {
        return res.status(404).json({ error: "Tournament player not found" });
      }
      
      // Get tournament to check org access
      const tournament = await storage.getTournamentById(existingTP.tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      
      // Check if user has access to this tournament's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, tournament.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const tournamentPlayer = await storage.updateTournamentPlayer(req.params.id, req.body);
      res.json(tournamentPlayer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Roster Members
  app.get("/api/teams/:teamId/roster", isAuthenticated, async (req, res) => {
    try {
      // First get the team to check org access
      const team = await storage.getTeamById(req.params.teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      // Check if user has access to this team's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, team.orgId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const roster = await storage.getRosterMembersByTeam(req.params.teamId);
      res.json(roster);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:tournamentId/roster", isAuthenticated, async (req, res) => {
    try {
      const roster = await storage.getRosterMembersByTournament(req.params.tournamentId);
      res.json(roster);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teams/:teamId/roster", isAuthenticated, async (req, res) => {
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

  app.patch("/api/roster-members/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the roster member to check org access
      const existingRM = await storage.getRosterMemberById(req.params.id);
      if (!existingRM) {
        return res.status(404).json({ error: "Roster member not found" });
      }
      
      // Get team to check org access
      const team = await storage.getTeamById(existingRM.teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      // Check if user has access to this team's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, team.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const rosterMember = await storage.updateRosterMember(req.params.id, req.body);
      res.json(rosterMember);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Eligibility
  app.post("/api/tournaments/:tournamentId/check-eligibility", isAuthenticated, async (req, res) => {
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

  app.get("/api/tournaments/:tournamentId/eligibility-rules", isAuthenticated, async (req, res) => {
    try {
      const rules = await storage.getEligibilityRulesByTournament(req.params.tournamentId);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments/:tournamentId/eligibility-rules", isAuthenticated, async (req, res) => {
    try {
      const { insertEligibilityRuleSchema } = await import("../shared/schema.js");
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

  app.patch("/api/eligibility-rules/:id", isAuthenticated, async (req, res) => {
    try {
      const { updateEligibilityRuleSchema } = await import("../shared/schema.js");
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

  app.delete("/api/eligibility-rules/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/organizations/:orgId/contracts", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
    try {
      const contracts = await storage.getContractsByOrg(req.params.orgId);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/players/:upid/contracts", isAuthenticated, async (req, res) => {
    try {
      const contracts = await storage.getContractsByPlayer(req.params.upid);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teams/:teamId/contracts", isAuthenticated, async (req, res) => {
    try {
      // First get the team to check org access
      const team = await storage.getTeamById(req.params.teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      // Check if user has access to this team's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, team.orgId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const contracts = await storage.getContractsByTeam(req.params.teamId);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contracts/:id", isAuthenticated, async (req, res) => {
    try {
      const contract = await storage.getContractById(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Check if user has access to this contract's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, contract.orgId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      res.json(contract);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contracts", isAuthenticated, async (req, res) => {
    try {
      const { insertContractSchema } = await import("../shared/schema.js");
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

  app.patch("/api/contracts/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the contract to check org access
      const existingContract = await storage.getContractById(req.params.id);
      if (!existingContract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Check if user has access to this contract's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingContract.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const { updateContractSchema } = await import("../shared/schema.js");
      const validatedData = updateContractSchema.parse(req.body);
      
      const contract = await storage.updateContract(req.params.id, validatedData);
      res.json(contract);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/contracts/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the contract to check org access
      const existingContract = await storage.getContractById(req.params.id);
      if (!existingContract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Check if user has access to this contract's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingContract.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const deleted = await storage.deleteContract(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Transfers
  app.get("/api/organizations/:orgId/transfers", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
    try {
      const transfers = await storage.getTransfersByOrg(req.params.orgId);
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/players/:upid/transfers", isAuthenticated, async (req, res) => {
    try {
      const transfers = await storage.getTransfersByPlayer(req.params.upid);
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teams/:teamId/transfers", isAuthenticated, async (req, res) => {
    try {
      const transfers = await storage.getTransfersByTeam(req.params.teamId);
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transfers/:id", isAuthenticated, async (req, res) => {
    try {
      const transfer = await storage.getTransferById(req.params.id);
      if (!transfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      
      // Check if user has access to this transfer's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, transfer.orgId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      res.json(transfer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transfers", isAuthenticated, async (req, res) => {
    try {
      const { insertTransferSchema } = await import("../shared/schema.js");
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

  app.patch("/api/transfers/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the transfer to check org access
      const existingTransfer = await storage.getTransferById(req.params.id);
      if (!existingTransfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      
      // Check if user has access to this transfer's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingTransfer.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const { updateTransferSchema } = await import("../shared/schema.js");
      const validatedData = updateTransferSchema.parse(req.body);
      
      const transfer = await storage.updateTransfer(req.params.id, validatedData);
      res.json(transfer);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/transfers/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the transfer to check org access
      const existingTransfer = await storage.getTransferById(req.params.id);
      if (!existingTransfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      
      // Check if user has access to this transfer's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingTransfer.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const deleted = await storage.deleteTransfer(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Disciplinary Records
  app.get("/api/organizations/:orgId/disciplinary-records", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
    try {
      const records = await storage.getDisciplinaryRecordsByOrg(req.params.orgId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/players/:upid/disciplinary-records", isAuthenticated, async (req, res) => {
    try {
      const records = await storage.getDisciplinaryRecordsByPlayer(req.params.upid);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:tournamentId/disciplinary-records", isAuthenticated, async (req, res) => {
    try {
      const records = await storage.getDisciplinaryRecordsByTournament(req.params.tournamentId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/disciplinary-records/:id", isAuthenticated, async (req, res) => {
    try {
      const record = await storage.getDisciplinaryRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ error: "Disciplinary record not found" });
      }
      
      // Check if user has access to this record's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, record.orgId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/disciplinary-records", isAuthenticated, async (req, res) => {
    try {
      const { insertDisciplinaryRecordSchema } = await import("../shared/schema.js");
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

  app.patch("/api/disciplinary-records/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the record to check org access
      const existingRecord = await storage.getDisciplinaryRecordById(req.params.id);
      if (!existingRecord) {
        return res.status(404).json({ error: "Disciplinary record not found" });
      }
      
      // Check if user has access to this record's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingRecord.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const record = await storage.updateDisciplinaryRecord(req.params.id, req.body);
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/disciplinary-records/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the record to check org access
      const existingRecord = await storage.getDisciplinaryRecordById(req.params.id);
      if (!existingRecord) {
        return res.status(404).json({ error: "Disciplinary record not found" });
      }
      
      // Check if user has access to this record's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingRecord.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const deleted = await storage.deleteDisciplinaryRecord(req.params.id);
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

  // Public route - no authentication required for viewing tournaments
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

  // Public route - no authentication required for viewing tournaments by slug
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

  app.patch("/api/tournaments/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the tournament to check org access
      const existingTournament = await storage.getTournamentById(req.params.id);
      if (!existingTournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      
      // Check if user has access to this tournament's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingTournament.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const tournament = await storage.updateTournament(req.params.id, req.body);
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tournaments/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the tournament to check org access
      const existingTournament = await storage.getTournamentById(req.params.id);
      if (!existingTournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      
      // Check if user has access to this tournament's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingTournament.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      await storage.deleteTournament(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teams - Global team management
  app.get("/api/organizations/:orgId/teams", async (req, res) => {
    try {
      const { includeUnattached } = req.query;
      const teams = await storage.getTeamsByOrganization(req.params.orgId, includeUnattached === 'true');
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/organizations/:orgId/teams", isAuthenticated, async (req, res) => {
    try {
      const globalTeamSchema = insertTeamSchema.extend({
        orgId: z.string(),
      });
      
      const validatedData = globalTeamSchema.parse({
        ...req.body,
        orgId: req.params.orgId,
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

  // Teams - Tournament-specific
  // Public route - no authentication required for viewing tournament teams
  app.get("/api/tournaments/:tournamentId/teams", async (req, res) => {
    try {
      const teams = await storage.getTeamsByTournament(req.params.tournamentId);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments/:tournamentId/teams", isAuthenticated, async (req, res) => {
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

  app.post("/api/tournaments/:tournamentId/teams/bulk", isAuthenticated, async (req, res) => {
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

  app.patch("/api/teams/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the team to check org access
      const existingTeam = await storage.getTeamById(req.params.id);
      if (!existingTeam) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      // Check if user has access to this team's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingTeam.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      const team = await storage.updateTeam(req.params.id, req.body);
      res.json(team);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/teams/:id", isAuthenticated, async (req, res) => {
    try {
      // First get the team to check org access
      const existingTeam = await storage.getTeamById(req.params.id);
      if (!existingTeam) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      // Check if user has access to this team's organization
      const user = getMockUser();
      const { checkUserOrgAccess } = await import("./replitAuth");
      const hasAccess = await checkUserOrgAccess(user.claims.sub, existingTeam.orgId, ["SUPER_ADMIN", "ORG_ADMIN"]);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this organization" });
      }
      
      await storage.deleteTeam(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Team Registrations
  // Get team registrations for a tournament
  app.get("/api/tournaments/:tournamentId/team-registrations", async (req, res) => {
    try {
      const tournamentId = req.params.tournamentId;
      // Use Supabase client directly from hybridDb
      const { supabase } = await import('./hybridDb.js');
      
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .select(`
          *,
          teams:team_id (
            id,
            name,
            club_name,
            contact_email,
            contact_phone,
            home_venue,
            logo_url,
            county_id,
            sub_county_id,
            ward_id
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('registration_date', { ascending: false });

      if (error) throw error;
      
      res.json(data || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Groups
  // Get tournament groups
  app.get("/api/tournaments/:tournamentId/groups", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      console.log(`[GET groups] Request for tournament: ${tournamentId}`);
      
      // Get stages for this tournament
      console.log('[GET groups] Querying stages...');
      let tournamentStages = await db.select()
        .from(stages)
        .where(eq(stages.tournamentId, tournamentId));
      
      console.log(`[GET groups] Found ${tournamentStages.length} stages`);
      
      // Create a default stage if none exists
      if (tournamentStages.length === 0) {
        console.log('[GET groups] Creating default stage...');
        const [newStage] = await db.insert(stages).values({
          tournamentId,
          name: "Main Stage",
          stageType: "GROUP",
          seq: 1,
        }).returning();
        
        tournamentStages = [newStage];
        console.log('[GET groups] Created stage:', newStage.id);
      }
      
      // Get groups for all stages in this tournament
      const stageIds = tournamentStages.map(stage => stage.id);
      console.log('[GET groups] Looking for groups in stages:', stageIds);
      
      const tournamentGroups = await db.select()
        .from(groups)
        .where(inArray(groups.stageId, stageIds))
        .orderBy(groups.seq);
      
      console.log(`[GET groups] Found ${tournamentGroups.length} groups`);
      res.json(tournamentGroups);
    } catch (error: any) {
      console.error('[GET groups] Error:', error);
      res.status(500).json({ error: `Failed query: ${error.message}` });
    }
  });

  // Create group for tournament
  app.post("/api/tournaments/:tournamentId/groups", isAuthenticated, async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const { name, seq } = req.body;
      
      // Get or create default stage for this tournament
      let stage = await db.select()
        .from(stages)
        .where(eq(stages.tournamentId, tournamentId))
        .limit(1);
      
      if (stage.length === 0) {
        // Create default stage
        const [newStage] = await db.insert(stages).values({
          tournamentId,
          name: "Main Stage",
          seq: 1,
          stageType: "GROUP"
        }).returning();
        stage = [newStage];
      }
      
      const [group] = await db.insert(groups).values({
        stageId: stage[0].id,
        name,
        seq
      }).returning();
      
      res.status(201).json(group);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update group
  app.put("/api/groups/:groupId", isAuthenticated, async (req, res) => {
    try {
      const { groupId } = req.params;
      const { name } = req.body;
      
      const [updatedGroup] = await db.update(groups)
        .set({ name })
        .where(eq(groups.id, groupId))
        .returning();
      
      if (!updatedGroup) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      res.json(updatedGroup);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete group
  app.delete("/api/groups/:groupId", isAuthenticated, async (req, res) => {
    try {
      const { groupId } = req.params;
      
      await db.delete(groups).where(eq(groups.id, groupId));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get team-group assignments for tournament
  app.get("/api/tournaments/:tournamentId/team-groups", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      
      // Get stages for this tournament
      const tournamentStages = await db.select()
        .from(stages)
        .where(eq(stages.tournamentId, tournamentId));
      
      if (tournamentStages.length === 0) {
        return res.json([]);
      }
      
      // Get groups for all stages in this tournament
      const stageIds = tournamentStages.map(stage => stage.id);
      const tournamentGroups = await db.select({ id: groups.id })
        .from(groups)
        .where(inArray(groups.stageId, stageIds));
      
      if (tournamentGroups.length === 0) {
        return res.json([]);
      }
      
      const groupIds = tournamentGroups.map(group => group.id);
      const teamGroupsWithTeams = await db.select({
        id: teamGroups.id,
        teamId: teamGroups.teamId,
        groupId: teamGroups.groupId,
        divisionId: teamGroups.divisionId,
        createdAt: teamGroups.createdAt,
        team: {
          id: teams.id,
          name: teams.name,
          club_name: teams.clubName,
          logo_url: teams.logoUrl
        }
      })
      .from(teamGroups)
      .leftJoin(teams, eq(teamGroups.teamId, teams.id))
      .where(inArray(teamGroups.groupId, groupIds));
      
      res.json(teamGroupsWithTeams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Assign team to group
  app.post("/api/team-groups", isAuthenticated, async (req, res) => {
    try {
      const { teamId, groupId } = req.body;
      
      console.log("[team-groups POST] Request body:", req.body);
      
      // Validate input
      if (!teamId || !groupId) {
        return res.status(400).json({ error: "teamId and groupId are required" });
      }
      
      // Skip existing assignment check for now and insert directly
      const [teamGroup] = await db.insert(teamGroups).values({
        teamId,
        groupId
      }).returning();
      
      console.log("[team-groups POST] Created team group:", teamGroup);
      res.status(201).json(teamGroup);
    } catch (error: any) {
      console.error("[team-groups POST] Error:", error);
      res.status(500).json({ error: `Failed query: ${error.message}` });
    }
  });

  // Remove team from group
  app.delete("/api/team-groups/:teamGroupId", isAuthenticated, async (req, res) => {
    try {
      const { teamGroupId } = req.params;
      
      await db.delete(teamGroups).where(eq(teamGroups.id, teamGroupId));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auto-assign teams to groups
  app.post("/api/tournaments/:tournamentId/auto-assign-teams", isAuthenticated, async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const { mode } = req.body; // 'random' or 'balanced'
      
      // Get tournament teams
      const tournamentTeams = await storage.getTeamsByTournament(tournamentId);
      
      // Get tournament groups
      const tournamentStages = await db.select()
        .from(stages)
        .where(eq(stages.tournamentId, tournamentId));
      
      if (tournamentStages.length === 0) {
        return res.status(400).json({ error: "No stages found for tournament" });
      }
      
      const stageIds = tournamentStages.map(stage => stage.id);
      const tournamentGroups = await db.select()
        .from(groups)
        .where(inArray(groups.stageId, stageIds))
        .orderBy(groups.seq);
      
      if (tournamentGroups.length === 0) {
        return res.status(400).json({ error: "No groups found for tournament" });
      }
      
      // Clear existing assignments
      const groupIds = tournamentGroups.map(group => group.id);
      await db.delete(teamGroups).where(inArray(teamGroups.groupId, groupIds));
      
      // Assign teams based on mode
      const assignments = [];
      if (mode === 'random') {
        // Shuffle teams randomly
        const shuffledTeams = [...tournamentTeams].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < shuffledTeams.length; i++) {
          const team = shuffledTeams[i];
          const group = tournamentGroups[i % tournamentGroups.length];
          assignments.push({
            teamId: team.id,
            groupId: group.id
          });
        }
      } else if (mode === 'balanced') {
        // Distribute teams evenly across groups
        for (let i = 0; i < tournamentTeams.length; i++) {
          const team = tournamentTeams[i];
          const group = tournamentGroups[i % tournamentGroups.length];
          assignments.push({
            teamId: team.id,
            groupId: group.id
          });
        }
      }
      
      // Insert assignments
      if (assignments.length > 0) {
        await db.insert(teamGroups).values(assignments);
      }
      
      res.json({ message: `Successfully assigned ${assignments.length} teams to groups`, assignments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Matches
  // Public route - no authentication required for viewing tournament fixtures
  app.get("/api/tournaments/:tournamentId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByTournament(req.params.tournamentId);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Public route - no authentication required for viewing round fixtures
  app.get("/api/rounds/:roundId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByRound(req.params.roundId);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/matches", isAuthenticated, async (req, res) => {
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

  app.patch("/api/matches/:id", isAuthenticated, async (req, res) => {
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
  app.post("/api/tournaments/:tournamentId/generate-fixtures", isAuthenticated, async (req, res) => {
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
  // Public route - no authentication required for viewing tournament standings
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
  app.get("/api/organizations/:orgId/reports/players", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
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
  app.get("/api/organizations/:orgId/reports/tournaments", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
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
  app.get("/api/organizations/:orgId/reports/disciplinary", isAuthenticated, requireOrgAccess(["SUPER_ADMIN", "ORG_ADMIN", "VIEWER"]), async (req, res) => {
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

  // ========================================
  // JAMII FIXTURES - Enhanced Fixture Generation System
  // ========================================

  // Generate fixtures using the enhanced Jamii Fixtures engine
  app.post("/api/fixtures/generate", isAuthenticated, async (req, res) => {
    try {
      const { teams, config, tournamentId } = req.body;

      // Import the Jamii Fixture Engine (dynamic import since it's TypeScript)
      const { generateJamiiFixtures } = await import("../client/src/services/jamiiFixtureEngine.js");

      // Add mock venues if none provided
      const mockVenues = config.venues?.length > 0 ? config.venues : [
        {
          id: "venue_1",
          name: "Main Stadium",
          location: "Nairobi",
          county: "Nairobi",
          constituency: "Westlands",
          pitchCount: 2,
          coordinates: { lat: -1.286389, lng: 36.817223 }
        },
        {
          id: "venue_2", 
          name: "Sports Complex",
          location: "Kiambu",
          county: "Kiambu",
          constituency: "Kiambu Town",
          pitchCount: 1,
          coordinates: { lat: -1.171944, lng: 36.834167 }
        }
      ];

      const enhancedConfig = {
        ...config,
        venues: mockVenues
      };

      // Generate fixtures using the intelligent engine
      const result = generateJamiiFixtures(teams, enhancedConfig);

      res.json({
        success: true,
        fixtures: result.fixtures,
        conflicts: result.conflicts,
        groups: result.groups,
        message: `Generated ${result.fixtures.length} fixtures with ${result.conflicts.length} conflicts`,
        algorithm: "Jamii Enhanced Engine with Geographical Optimization"
      });

    } catch (error: any) {
      console.error("Jamii Fixtures Generation Error:", error);
      res.status(500).json({ 
        error: error.message,
        details: "Enhanced fixture generation failed"
      });
    }
  });

  // Publish fixtures to multiple channels
  app.post("/api/fixtures/publish", isAuthenticated, async (req, res) => {
    try {
      const { fixtures, config, channels } = req.body;

      // Mock publication results
      const publicationResults = {
        website: { success: true, url: "https://jamiitourney.com/fixtures" },
        pdf: { success: true, downloadUrl: "/api/fixtures/download/pdf" },
        sms: { success: true, messagesSent: fixtures.length * 2 }, // 2 teams per fixture
        teams: { success: true, teamsNotified: new Set(fixtures.flatMap(f => [f.homeTeam.id, f.awayTeam.id])).size }
      };

      // In a real implementation, this would:
      // 1. Save fixtures to database
      // 2. Generate PDF documents
      // 3. Send SMS notifications
      // 4. Update team portals
      // 5. Publish to website

      res.json({
        success: true,
        publicationResults,
        message: "Fixtures published successfully across all channels",
        publishedAt: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("Fixture Publication Error:", error);
      res.status(500).json({ 
        error: error.message,
        details: "Fixture publication failed"
      });
    }
  });

  // Get available venues for fixture generation
  app.get("/api/fixtures/venues", async (req, res) => {
    try {
      // Mock venue data - in production, this would come from a venues database
      const venues = [
        {
          id: "venue_1",
          name: "Nairobi City Stadium",
          location: "Nairobi CBD",
          county: "Nairobi",
          constituency: "Starehe",
          pitchCount: 1,
          coordinates: { lat: -1.286389, lng: 36.817223 },
          facilities: ["Floodlights", "VIP Section", "Parking"]
        },
        {
          id: "venue_2",
          name: "Kiambu Sports Complex",
          location: "Kiambu Town",
          county: "Kiambu", 
          constituency: "Kiambu Town",
          pitchCount: 2,
          coordinates: { lat: -1.171944, lng: 36.834167 },
          facilities: ["Multiple Pitches", "Changing Rooms"]
        },
        {
          id: "venue_3",
          name: "Thika Municipal Stadium",
          location: "Thika",
          county: "Kiambu",
          constituency: "Thika Town", 
          pitchCount: 1,
          coordinates: { lat: -1.033056, lng: 37.069167 },
          facilities: ["Natural Grass", "Spectator Stands"]
        },
        {
          id: "venue_4",
          name: "Machakos Stadium",
          location: "Machakos",
          county: "Machakos",
          constituency: "Machakos Town",
          pitchCount: 1,
          coordinates: { lat: -1.516667, lng: 37.263889 },
          facilities: ["Athletics Track", "Floodlights"]
        }
      ];

      res.json({
        success: true,
        venues,
        count: venues.length
      });

    } catch (error: any) {
      console.error("Venues Fetch Error:", error);
      res.status(500).json({ 
        error: error.message,
        details: "Failed to fetch venue data"
      });
    }
  });

  // Download fixtures as PDF
  app.get("/api/fixtures/download/pdf", async (req, res) => {
    try {
      // Mock PDF generation - in production, use libraries like PDFKit or Puppeteer
      const pdfContent = `
        JAMII TOURNEY - FIXTURE LIST
        ===========================
        Generated: ${new Date().toLocaleDateString()}
        
        This would be a properly formatted PDF with:
        - Tournament header and branding
        - Fixtures organized by date/round
        - Venue and time information
        - Contact details for inquiries
        
        [PDF content would be binary data in production]
      `;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="jamii-fixtures.pdf"');
      res.send(pdfContent);

    } catch (error: any) {
      console.error("PDF Download Error:", error);
      res.status(500).json({ 
        error: error.message,
        details: "PDF generation failed"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
