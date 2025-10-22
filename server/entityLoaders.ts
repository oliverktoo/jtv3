import { RequestHandler } from "express";
import { storage } from "./storage";

/**
 * Entity-loading middleware that fetches an entity, extracts its orgId,
 * and stores it on req for requireOrgAccess to validate.
 * 
 * This prevents cross-organization data access on ID-scoped routes.
 */

interface AuthenticatedRequest extends Request {
  orgContextId?: string;
}

/**
 * Loads a player by ID and extracts orgId for authorization
 */
export const loadPlayerOrg: RequestHandler = async (req, res, next) => {
  try {
    const playerId = req.params.id || req.params.upid;
    const player = await storage.getPlayerById(playerId);
    
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }
    
    // Store orgId in request for requireOrgAccess to use
    (req as any).orgContextId = player.orgId;
    req.query.orgId = player.orgId; // Set in query so requireOrgAccess can find it
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a tournament by ID and extracts orgId for authorization
 */
export const loadTournamentOrg: RequestHandler = async (req, res, next) => {
  try {
    const tournamentId = req.params.id || req.params.tournamentId || req.params.slug;
    let tournament;
    
    if (req.params.slug) {
      tournament = await storage.getTournamentBySlug(tournamentId);
    } else {
      tournament = await storage.getTournamentById(tournamentId);
    }
    
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    
    (req as any).orgContextId = tournament.orgId;
    req.query.orgId = tournament.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a team by ID, fetches its tournament, and extracts orgId for authorization
 */
export const loadTeamOrg: RequestHandler = async (req, res, next) => {
  try {
    const teamId = req.params.id || req.params.teamId;
    const team = await storage.getTeamById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    
    // Teams belong to tournaments, so we need to get the tournament's orgId
    const tournament = await storage.getTournamentById(team.tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found for team" });
    }
    
    (req as any).orgContextId = tournament.orgId;
    req.query.orgId = tournament.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a contract by ID and extracts orgId for authorization
 */
export const loadContractOrg: RequestHandler = async (req, res, next) => {
  try {
    const contractId = req.params.id;
    const contract = await storage.getContractById(contractId);
    
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }
    
    (req as any).orgContextId = contract.orgId;
    req.query.orgId = contract.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a transfer by ID and extracts orgId for authorization
 */
export const loadTransferOrg: RequestHandler = async (req, res, next) => {
  try {
    const transferId = req.params.id;
    const transfer = await storage.getTransferById(transferId);
    
    if (!transfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }
    
    (req as any).orgContextId = transfer.orgId;
    req.query.orgId = transfer.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a disciplinary record by ID and extracts orgId for authorization
 */
export const loadDisciplinaryRecordOrg: RequestHandler = async (req, res, next) => {
  try {
    const recordId = req.params.id;
    const record = await storage.getDisciplinaryRecordById(recordId);
    
    if (!record) {
      return res.status(404).json({ error: "Disciplinary record not found" });
    }
    
    (req as any).orgContextId = record.orgId;
    req.query.orgId = record.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a player document and extracts orgId via the player
 */
export const loadPlayerDocumentOrg: RequestHandler = async (req, res, next) => {
  try {
    const docId = req.params.id;
    const document = await storage.getPlayerDocumentById(docId);
    
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    // Get player to extract orgId
    const player = await storage.getPlayerById(document.upid);
    if (!player) {
      return res.status(404).json({ error: "Player not found for document" });
    }
    
    (req as any).orgContextId = player.orgId;
    req.query.orgId = player.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads an eligibility rule and extracts orgId via tournament
 */
export const loadEligibilityRuleOrg: RequestHandler = async (req, res, next) => {
  try {
    const ruleId = req.params.id;
    const rule = await storage.getEligibilityRuleById(ruleId);
    
    if (!rule) {
      return res.status(404).json({ error: "Eligibility rule not found" });
    }
    
    // Get tournament to extract orgId
    const tournament = await storage.getTournamentById(rule.tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found for rule" });
    }
    
    (req as any).orgContextId = tournament.orgId;
    req.query.orgId = tournament.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a tournament player and extracts orgId via tournament
 */
export const loadTournamentPlayerOrg: RequestHandler = async (req, res, next) => {
  try {
    const tpId = req.params.id;
    const tournamentPlayer = await storage.getTournamentPlayerById(tpId);
    
    if (!tournamentPlayer) {
      return res.status(404).json({ error: "Tournament player not found" });
    }
    
    // Get tournament to extract orgId
    const tournament = await storage.getTournamentById(tournamentPlayer.tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    
    (req as any).orgContextId = tournament.orgId;
    req.query.orgId = tournament.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a roster member and extracts orgId via team → tournament
 */
export const loadRosterMemberOrg: RequestHandler = async (req, res, next) => {
  try {
    const rosterId = req.params.id;
    const rosterMember = await storage.getRosterMemberById(rosterId);
    
    if (!rosterMember) {
      return res.status(404).json({ error: "Roster member not found" });
    }
    
    // Get team to get tournament
    const team = await storage.getTeamById(rosterMember.teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    
    // Get tournament to extract orgId
    const tournament = await storage.getTournamentById(team.tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    
    (req as any).orgContextId = tournament.orgId;
    req.query.orgId = tournament.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a match and extracts orgId via round → stage → tournament
 */
export const loadMatchOrg: RequestHandler = async (req, res, next) => {
  try {
    const matchId = req.params.id;
    const match = await storage.getMatchById(matchId);
    
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    
    // Get round to get stage to get tournament
    const round = await storage.getRoundById(match.roundId);
    if (!round) {
      return res.status(404).json({ error: "Round not found" });
    }
    
    const stage = await storage.getStageById(round.stageId);
    if (!stage) {
      return res.status(404).json({ error: "Stage not found" });
    }
    
    const tournament = await storage.getTournamentById(stage.tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    
    (req as any).orgContextId = tournament.orgId;
    req.query.orgId = tournament.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Loads a round and extracts orgId via stage → tournament
 */
export const loadRoundOrg: RequestHandler = async (req, res, next) => {
  try {
    const roundId = req.params.roundId;
    const round = await storage.getRoundById(roundId);
    
    if (!round) {
      return res.status(404).json({ error: "Round not found" });
    }
    
    const stage = await storage.getStageById(round.stageId);
    if (!stage) {
      return res.status(404).json({ error: "Stage not found" });
    }
    
    const tournament = await storage.getTournamentById(stage.tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    
    (req as any).orgContextId = tournament.orgId;
    req.query.orgId = tournament.orgId;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
