import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTournamentSchema, insertTeamSchema, insertMatchSchema } from "@shared/schema";
import { z } from "zod";
import { generateRoundRobinFixtures } from "./lib/fixtureGenerator";
import { calculateStandings } from "./lib/standingsCalculator";
import { db } from "./db";
import { rounds, stages, teams, matches } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Reference Data
  app.get("/api/organizations", async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

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

  app.get("/api/counties/:countyId/sub-counties", async (req, res) => {
    try {
      const subCounties = await storage.getSubCountiesByCounty(req.params.countyId);
      res.json(subCounties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sub-counties/:subCountyId/wards", async (req, res) => {
    try {
      const wards = await storage.getWardsBySubCounty(req.params.subCountyId);
      res.json(wards);
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

  const httpServer = createServer(app);
  return httpServer;
}
