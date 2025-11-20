import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { organizations, sports, counties } from "../shared/schema.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Test database connection endpoint
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      // Test basic database connection
      const result = await db.select().from(organizations).limit(1);
      res.json({ 
        status: "OK", 
        database: "Connected to Supabase",
        timestamp: new Date().toISOString(),
        organizationsCount: result.length
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: "Error", 
        database: "Connection failed",
        error: error.message 
      });
    }
  });

  // Mock auth endpoint
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    const mockUser = { 
      id: "1", 
      email: "admin@jamiitourney.com", 
      firstName: "Admin", 
      lastName: "User", 
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [], 
      isSuperAdmin: true 
    };
    res.json(mockUser);
  });

  // Basic endpoints for testing
  app.get("/api/organizations", async (req: Request, res: Response) => {
    try {
      const orgs = await db.select().from(organizations);
      res.json(orgs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sports", async (req: Request, res: Response) => {
    try {
      const sportsData = await db.select().from(sports);
      res.json(sportsData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/counties", async (req: Request, res: Response) => {
    try {
      const countiesData = await db.select().from(counties);
      res.json(countiesData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const server = createServer(app);
  return server;
}