import { db } from "./db";
import { eligibilityRules, playerRegistry, wards, subCounties, counties } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface EligibilityCheckResult {
  isEligible: boolean;
  violations: EligibilityViolation[];
}

export interface EligibilityViolation {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  reason: string;
}

export async function checkPlayerEligibility(
  upid: string,
  tournamentId: string
): Promise<EligibilityCheckResult> {
  const playerData = await db
    .select({
      id: playerRegistry.id,
      dob: playerRegistry.dob,
      status: playerRegistry.status,
      wardId: playerRegistry.wardId,
      wardName: wards.name,
      subCountyId: subCounties.id,
      subCountyName: subCounties.name,
      countyId: counties.id,
      countyName: counties.name,
    })
    .from(playerRegistry)
    .leftJoin(wards, eq(playerRegistry.wardId, wards.id))
    .leftJoin(subCounties, eq(wards.subCountyId, subCounties.id))
    .leftJoin(counties, eq(subCounties.countyId, counties.id))
    .where(eq(playerRegistry.id, upid))
    .limit(1);

  if (!playerData || playerData.length === 0) {
    return {
      isEligible: false,
      violations: [{
        ruleId: "SYSTEM",
        ruleName: "Player Not Found",
        ruleType: "SYSTEM",
        reason: "Player does not exist in the registry",
      }],
    };
  }

  const player = playerData[0];

  const rules = await db
    .select()
    .from(eligibilityRules)
    .where(
      and(
        eq(eligibilityRules.tournamentId, tournamentId),
        eq(eligibilityRules.isActive, true)
      )
    );

  const violations: EligibilityViolation[] = [];

  for (const rule of rules) {
    const violation = await evaluateRule(rule, player);
    if (violation) {
      violations.push(violation);
    }
  }

  return {
    isEligible: violations.length === 0,
    violations,
  };
}

async function evaluateRule(
  rule: any,
  player: any
): Promise<EligibilityViolation | null> {
  switch (rule.ruleType) {
    case "AGE_RANGE":
      return evaluateAgeRange(rule, player);
    case "GEOGRAPHIC":
      return evaluateGeographic(rule, player);
    case "PLAYER_STATUS":
      return evaluatePlayerStatus(rule, player);
    default:
      return null;
  }
}

function evaluateAgeRange(rule: any, player: any): EligibilityViolation | null {
  const config = rule.config as {
    minAge?: number;
    maxAge?: number;
    ageCalculationDate: string;
  };

  if (!player.dob) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: "Player date of birth is not set",
    };
  }

  const calculationDate = new Date(config.ageCalculationDate);
  const dob = new Date(player.dob);
  const age = Math.floor(
    (calculationDate.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  if (config.minAge !== undefined && age < config.minAge) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Player is ${age} years old, minimum age is ${config.minAge}`,
    };
  }

  if (config.maxAge !== undefined && age > config.maxAge) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Player is ${age} years old, maximum age is ${config.maxAge}`,
    };
  }

  return null;
}

function evaluateGeographic(rule: any, player: any): EligibilityViolation | null {
  const config = rule.config as {
    scope: "COUNTY" | "SUBCOUNTY" | "WARD";
    allowedIds: string[];
  };

  let playerId: string | null = null;
  let scopeName: string = "";

  switch (config.scope) {
    case "WARD":
      playerId = player.wardId;
      scopeName = "ward";
      break;
    case "SUBCOUNTY":
      playerId = player.subCountyId;
      scopeName = "sub-county";
      break;
    case "COUNTY":
      playerId = player.countyId;
      scopeName = "county";
      break;
  }

  if (!playerId) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Player ${scopeName} is not set`,
    };
  }

  if (!config.allowedIds.includes(playerId)) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Player's ${scopeName} is not in the allowed list`,
    };
  }

  return null;
}

function evaluatePlayerStatus(rule: any, player: any): EligibilityViolation | null {
  const config = rule.config as {
    allowedStatuses: string[];
  };

  if (!config.allowedStatuses.includes(player.status)) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Player status is ${player.status}, allowed statuses are: ${config.allowedStatuses.join(", ")}`,
    };
  }

  return null;
}
