import { IStorage } from "./storage";
import type { PlayerRegistry, EligibilityRule, Contract, DisciplinaryRecord, PlayerDocument } from "@shared/schema";

export interface EligibilityCheckResult {
  eligible: boolean;
  reasons: string[];
  checkedRules: {
    ruleId: string;
    ruleName: string;
    passed: boolean;
    message: string;
  }[];
}

export class EligibilityService {
  constructor(private storage: IStorage) {}

  async checkPlayerEligibility(
    upid: string,
    tournamentId: string,
    teamId?: string
  ): Promise<EligibilityCheckResult> {
    const player = await this.storage.getPlayerById(upid);
    if (!player) {
      return {
        eligible: false,
        reasons: ["Player not found"],
        checkedRules: [],
      };
    }

    const rules = await this.storage.getEligibilityRulesByTournament(tournamentId);
    const activeRules = rules.filter(r => r.isActive);

    const checkedRules: EligibilityCheckResult['checkedRules'] = [];
    const reasons: string[] = [];

    for (const rule of activeRules) {
      const result = await this.checkRule(player, rule, teamId);
      checkedRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        passed: result.passed,
        message: result.message,
      });

      if (!result.passed) {
        reasons.push(result.message);
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons,
      checkedRules,
    };
  }

  private async checkRule(
    player: PlayerRegistry,
    rule: EligibilityRule,
    teamId?: string
  ): Promise<{ passed: boolean; message: string }> {
    const config = rule.config as any;

    switch (rule.ruleType) {
      case "AGE_RANGE":
        return this.checkAgeRange(player, config);

      case "DOCUMENT_VERIFIED":
        return await this.checkDocumentVerified(player.id);

      case "NO_ACTIVE_SUSPENSIONS":
        return await this.checkNoActiveSuspensions(player.id);

      case "VALID_CONTRACT":
        return await this.checkValidContract(player.id, teamId);

      case "NATIONALITY":
        return this.checkNationality(player, config);

      case "GENDER":
        return this.checkGender(player, config);

      case "PLAYER_STATUS":
        return this.checkPlayerStatus(player, config);

      case "GEOGRAPHIC":
        return this.checkGeographic(player, config);

      default:
        return { passed: true, message: "Rule not implemented" };
    }
  }

  private checkAgeRange(player: PlayerRegistry, config: any): { passed: boolean; message: string } {
    if (!player.dob) {
      if (config.requireDob === false) {
        return { passed: true, message: "Date of birth not required for this rule" };
      }
      return { passed: false, message: "Date of birth is required" };
    }

    const today = new Date();
    const birthDate = new Date(player.dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;

    if (config.minAge && actualAge < config.minAge) {
      return { passed: false, message: `Player must be at least ${config.minAge} years old (current age: ${actualAge})` };
    }

    if (config.maxAge && actualAge > config.maxAge) {
      return { passed: false, message: `Player must be at most ${config.maxAge} years old (current age: ${actualAge})` };
    }

    return { passed: true, message: `Age requirement met (${actualAge} years)` };
  }

  private async checkDocumentVerified(upid: string): Promise<{ passed: boolean; message: string }> {
    const documents = await this.storage.getPlayerDocuments(upid);
    const hasVerifiedDoc = documents.some(doc => doc.verified);

    if (!hasVerifiedDoc) {
      return { passed: false, message: "Player must have at least one verified document" };
    }

    return { passed: true, message: "Document verification requirement met" };
  }

  private async checkNoActiveSuspensions(upid: string): Promise<{ passed: boolean; message: string }> {
    const records = await this.storage.getDisciplinaryRecordsByPlayer(upid);
    const today = new Date();
    
    const activeSuspensions = records.filter(record => {
      if (record.status !== "ACTIVE") return false;
      if (record.incidentType !== "SUSPENSION" && record.incidentType !== "RED_CARD") return false;
      
      if (record.servingStartDate && record.servingEndDate) {
        const start = new Date(record.servingStartDate);
        const end = new Date(record.servingEndDate);
        return today >= start && today <= end;
      }
      
      if (record.matchesSuspended && record.matchesSuspended > 0) {
        return true;
      }
      
      return false;
    });

    if (activeSuspensions.length > 0) {
      return { 
        passed: false, 
        message: `Player has ${activeSuspensions.length} active suspension(s)` 
      };
    }

    return { passed: true, message: "No active suspensions" };
  }

  private async checkValidContract(upid: string, teamId?: string): Promise<{ passed: boolean; message: string }> {
    if (!teamId) {
      return { passed: false, message: "Team ID required for contract validation" };
    }

    const contracts = await this.storage.getContractsByPlayer(upid);
    const today = new Date();

    const validContract = contracts.find(contract => {
      if (contract.teamId !== teamId) return false;
      if (contract.status !== "ACTIVE") return false;

      const start = new Date(contract.startDate);
      if (today < start) return false;

      if (contract.endDate) {
        const end = new Date(contract.endDate);
        if (today > end) return false;
      }

      return true;
    });

    if (!validContract) {
      return { 
        passed: false, 
        message: "Player must have an active contract with the participating team" 
      };
    }

    return { passed: true, message: "Valid contract requirement met" };
  }

  private checkNationality(player: PlayerRegistry, config: any): { passed: boolean; message: string } {
    if (!config.allowedNationalities || config.allowedNationalities.length === 0) {
      return { passed: true, message: "No nationality restrictions" };
    }

    if (!player.nationality) {
      return { passed: false, message: "Player nationality is required" };
    }

    const allowed = (config.allowedNationalities as string[]).includes(player.nationality);
    if (!allowed) {
      return { 
        passed: false, 
        message: `Player nationality (${player.nationality}) not allowed for this tournament` 
      };
    }

    return { passed: true, message: "Nationality requirement met" };
  }

  private checkGender(player: PlayerRegistry, config: any): { passed: boolean; message: string } {
    if (!config.allowedGenders || config.allowedGenders.length === 0) {
      return { passed: true, message: "No gender restrictions" };
    }

    if (!player.sex) {
      return { passed: false, message: "Player gender is required" };
    }

    const allowed = (config.allowedGenders as string[]).includes(player.sex);
    if (!allowed) {
      return { 
        passed: false, 
        message: `This tournament is restricted to ${config.allowedGenders.join(", ")} players` 
      };
    }

    return { passed: true, message: "Gender requirement met" };
  }

  private checkPlayerStatus(player: PlayerRegistry, config: any): { passed: boolean; message: string } {
    if (!config.allowedStatuses || config.allowedStatuses.length === 0) {
      return { passed: true, message: "No status restrictions" };
    }

    const allowed = (config.allowedStatuses as string[]).includes(player.status);
    if (!allowed) {
      return { 
        passed: false, 
        message: `Player status (${player.status}) not allowed for this tournament` 
      };
    }

    return { passed: true, message: "Status requirement met" };
  }

  private checkGeographic(player: PlayerRegistry, config: any): { passed: boolean; message: string } {
    if (!config.allowedWards || config.allowedWards.length === 0) {
      return { passed: true, message: "No geographic restrictions" };
    }

    if (!player.wardId) {
      return { passed: false, message: "Player ward is required for geographic eligibility" };
    }

    const allowed = (config.allowedWards as string[]).includes(player.wardId);
    if (!allowed) {
      return { 
        passed: false, 
        message: "Player ward not allowed for this tournament" 
      };
    }

    return { passed: true, message: "Geographic requirement met" };
  }
}
