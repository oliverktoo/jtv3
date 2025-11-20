// Mock authentication for testing - remove auth requirement
import type { Express, Request, Response, NextFunction } from "express";

// Mock setup function
export async function setupAuth(app: Express) {
  // No-op for testing
}

// Mock middleware that always allows access
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Mock user for testing
  (req as any).user = {
    claims: {
      sub: "test-user-123"
    }
  };
  next();
}

// Mock admin check
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  next();
}

// Mock org access check
export function requireOrgAccess(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}

// Mock function for checking user org access
export async function checkUserOrgAccess(userId: string, orgId: string, roles?: string[]): Promise<boolean> {
  // Always return true for testing
  return true;
}