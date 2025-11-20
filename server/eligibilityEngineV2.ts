import { db } from "./db.js";
import { 
  eligibilityRules, 
  playerRegistry, 
  wards, 
  subCounties, 
  counties,
  playerDocuments,
  playerConsents,
  playerStatusTransitions
} from "../shared/schema.js";
import { eq, and, desc } from "drizzle-orm";

export interface EligibilityCheckResult {
  isEligible: boolean;
  violations: EligibilityViolation[];
  warnings: EligibilityWarning[];
  summary: EligibilitySummary;
}

export interface EligibilityViolation {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  canOverride: boolean;
  suggestedAction?: string;
}

export interface EligibilityWarning {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  message: string;
  suggestedAction?: string;
}

export interface EligibilitySummary {
  overallStatus: 'ELIGIBLE' | 'INELIGIBLE' | 'PENDING_REVIEW' | 'NEEDS_ACTION';
  registrationStatus: string;
  documentsVerified: boolean;
  consentsGranted: boolean;
  medicalClearanceValid: boolean;
  ageEligible: boolean;
  geographicEligible: boolean;
  nextSteps: string[];
}

/**
 * Enhanced eligibility check that supports all new registration features
 */
export async function checkPlayerEligibilityEnhanced(
  upid: string,
  tournamentId: string
): Promise<EligibilityCheckResult> {
  // Get comprehensive player data including all related records
  const playerData = await db
    .select({
      // Basic player info
      id: playerRegistry.id,
      upid: playerRegistry.upid,
      firstName: playerRegistry.firstName,
      lastName: playerRegistry.lastName,
      dob: playerRegistry.dob,
      sex: playerRegistry.sex,
      nationality: playerRegistry.nationality,
      email: playerRegistry.email,
      phone: playerRegistry.phone,
      
      // Status and registration info
      status: playerRegistry.status,
      registrationStatus: playerRegistry.registrationStatus,
      isActive: playerRegistry.isActive,
      
      // Medical clearance
      medicalClearanceDate: playerRegistry.medicalClearanceDate,
      medicalClearanceStatus: playerRegistry.medicalClearanceStatus,
      medicalExpiryDate: playerRegistry.medicalExpiryDate,
      
      // Geographic info
      wardId: playerRegistry.wardId,
      wardName: wards.name,
      subCountyId: subCounties.id,
      subCountyName: subCounties.name,
      countyId: counties.id,
      countyName: counties.name,
      
      // Guardian info for minors
      guardianName: playerRegistry.guardianName,
      guardianPhone: playerRegistry.guardianPhone,
      
      // Timestamps
      createdAt: playerRegistry.createdAt,
      updatedAt: playerRegistry.updatedAt,
    })
    .from(playerRegistry)
    .leftJoin(wards, eq(playerRegistry.wardId, wards.id))
    .leftJoin(subCounties, eq(wards.subCountyId, subCounties.id))
    .leftJoin(counties, eq(subCounties.countyId, counties.id))
    .where(eq(playerRegistry.upid, upid))
    .limit(1);

  if (!playerData || playerData.length === 0) {
    return {
      isEligible: false,
      violations: [{
        ruleId: "SYSTEM_001",
        ruleName: "Player Not Found",
        ruleType: "SYSTEM",
        reason: "Player does not exist in the registry",
        severity: 'CRITICAL',
        canOverride: false,
        suggestedAction: "Verify the player ID and ensure registration is complete",
      }],
      warnings: [],
      summary: {
        overallStatus: 'INELIGIBLE',
        registrationStatus: 'UNKNOWN',
        documentsVerified: false,
        consentsGranted: false,
        medicalClearanceValid: false,
        ageEligible: false,
        geographicEligible: false,
        nextSteps: ['Complete player registration'],
      },
    };
  }

  const player = playerData[0];

  // Get player documents
  const documents = await db
    .select()
    .from(playerDocuments)
    .where(eq(playerDocuments.upid, upid));

  // Get player consents
  const consents = await db
    .select()
    .from(playerConsents)
    .where(eq(playerConsents.upid, upid));

  // Get tournament eligibility rules
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
  const warnings: EligibilityWarning[] = [];

  // 1. Check registration status eligibility
  const registrationCheck = checkRegistrationStatus(player);
  if (registrationCheck.violation) violations.push(registrationCheck.violation);
  if (registrationCheck.warning) warnings.push(registrationCheck.warning);

  // 2. Check document verification
  const documentCheck = checkDocumentVerification(documents);
  if (documentCheck.violation) violations.push(documentCheck.violation);
  if (documentCheck.warning) warnings.push(documentCheck.warning);

  // 3. Check consent verification
  const consentCheck = checkConsentVerification(consents);
  if (consentCheck.violation) violations.push(consentCheck.violation);
  if (consentCheck.warning) warnings.push(consentCheck.warning);

  // 4. Check medical clearance
  const medicalCheck = checkMedicalClearance(player);
  if (medicalCheck.violation) violations.push(medicalCheck.violation);
  if (medicalCheck.warning) warnings.push(medicalCheck.warning);

  // 5. Check tournament-specific rules
  for (const rule of rules) {
    const ruleResult = await evaluateEnhancedRule(rule, player, documents, consents);
    if (ruleResult.violation) violations.push(ruleResult.violation);
    if (ruleResult.warning) warnings.push(ruleResult.warning);
  }

  // Generate summary
  const summary = generateEligibilitySummary(player, documents, consents, violations, warnings);

  return {
    isEligible: violations.filter(v => v.severity === 'CRITICAL' || v.severity === 'HIGH').length === 0,
    violations,
    warnings,
    summary,
  };
}

/**
 * Check if player's registration status allows tournament participation
 */
function checkRegistrationStatus(player: any): { violation?: EligibilityViolation; warning?: EligibilityWarning } {
  const status = player.registrationStatus;
  
  switch (status) {
    case 'APPROVED':
      return {}; // All good
      
    case 'IN_REVIEW':
      return {
        warning: {
          ruleId: "REG_STATUS_001",
          ruleName: "Registration Under Review",
          ruleType: "REGISTRATION_STATUS",
          message: "Registration is still under review. Participation may be provisional pending approval.",
          suggestedAction: "Contact administration for review status",
        }
      };
      
    case 'DRAFT':
    case 'SUBMITTED':
      return {
        violation: {
          ruleId: "REG_STATUS_002",
          ruleName: "Registration Incomplete",
          ruleType: "REGISTRATION_STATUS",
          reason: `Registration status is ${status}. Must be approved for tournament participation.`,
          severity: 'HIGH',
          canOverride: false,
          suggestedAction: "Complete registration process and wait for approval",
        }
      };
      
    case 'REJECTED':
      return {
        violation: {
          ruleId: "REG_STATUS_003",
          ruleName: "Registration Rejected",
          ruleType: "REGISTRATION_STATUS",
          reason: "Registration has been rejected. Cannot participate until issues are resolved.",
          severity: 'CRITICAL',
          canOverride: false,
          suggestedAction: "Review rejection reasons and resubmit registration",
        }
      };
      
    case 'SUSPENDED':
      return {
        violation: {
          ruleId: "REG_STATUS_004",
          ruleName: "Registration Suspended",
          ruleType: "REGISTRATION_STATUS",
          reason: "Player registration is suspended. Cannot participate in tournaments.",
          severity: 'CRITICAL',
          canOverride: true,
          suggestedAction: "Contact administration regarding suspension",
        }
      };
      
    case 'INCOMPLETE':
      return {
        violation: {
          ruleId: "REG_STATUS_005",
          ruleName: "Registration Incomplete",
          ruleType: "REGISTRATION_STATUS",
          reason: "Missing required registration information or documents.",
          severity: 'HIGH',
          canOverride: false,
          suggestedAction: "Complete all required registration steps",
        }
      };
      
    default:
      return {
        violation: {
          ruleId: "REG_STATUS_006",
          ruleName: "Unknown Registration Status",
          ruleType: "REGISTRATION_STATUS",
          reason: `Unknown registration status: ${status}`,
          severity: 'CRITICAL',
          canOverride: false,
          suggestedAction: "Contact system administrator",
        }
      };
  }
}

/**
 * Check if required documents are verified
 */
function checkDocumentVerification(documents: any[]): { violation?: EligibilityViolation; warning?: EligibilityWarning } {
  const requiredDocs = ['NATIONAL_ID', 'SELFIE']; // Basic required documents
  const uploadedDocs = documents.map(d => d.documentType);
  const verifiedDocs = documents.filter(d => d.verificationStatus === 'VERIFIED').map(d => d.documentType);
  const rejectedDocs = documents.filter(d => d.verificationStatus === 'REJECTED');
  
  // Check if all required documents are uploaded
  const missingDocs = requiredDocs.filter(doc => !uploadedDocs.includes(doc));
  if (missingDocs.length > 0) {
    return {
      violation: {
        ruleId: "DOC_001",
        ruleName: "Missing Required Documents",
        ruleType: "DOCUMENT_VERIFICATION",
        reason: `Missing required documents: ${missingDocs.join(', ')}`,
        severity: 'HIGH',
        canOverride: false,
        suggestedAction: "Upload all required documents",
      }
    };
  }
  
  // Check if required documents are verified
  const unverifiedRequired = requiredDocs.filter(doc => !verifiedDocs.includes(doc));
  if (unverifiedRequired.length > 0) {
    return {
      warning: {
        ruleId: "DOC_002",
        ruleName: "Documents Pending Verification",
        ruleType: "DOCUMENT_VERIFICATION",
        message: `Documents pending verification: ${unverifiedRequired.join(', ')}`,
        suggestedAction: "Wait for document verification or contact administration",
      }
    };
  }
  
  // Check for rejected documents
  if (rejectedDocs.length > 0) {
    return {
      violation: {
        ruleId: "DOC_003",
        ruleName: "Documents Rejected",
        ruleType: "DOCUMENT_VERIFICATION",
        reason: `Rejected documents need to be re-uploaded: ${rejectedDocs.map(d => d.documentType).join(', ')}`,
        severity: 'HIGH',
        canOverride: false,
        suggestedAction: "Re-upload rejected documents with correct information",
      }
    };
  }
  
  return {}; // All documents verified
}

/**
 * Check if required consents are granted
 */
function checkConsentVerification(consents: any[]): { violation?: EligibilityViolation; warning?: EligibilityWarning } {
  const requiredConsents = ['TERMS_CONDITIONS', 'DATA_PROCESSING'];
  const grantedConsents = consents.filter(c => c.isConsented).map(c => c.consentType);
  
  const missingConsents = requiredConsents.filter(consent => !grantedConsents.includes(consent));
  
  if (missingConsents.length > 0) {
    return {
      violation: {
        ruleId: "CONSENT_001",
        ruleName: "Missing Required Consents",
        ruleType: "CONSENT_VERIFICATION",
        reason: `Missing required consents: ${missingConsents.join(', ')}`,
        severity: 'HIGH',
        canOverride: false,
        suggestedAction: "Grant all required consents",
      }
    };
  }
  
  return {}; // All consents granted
}

/**
 * Check medical clearance validity
 */
function checkMedicalClearance(player: any): { violation?: EligibilityViolation; warning?: EligibilityWarning } {
  const status = player.medicalClearanceStatus;
  const expiryDate = player.medicalExpiryDate;
  
  if (status === 'PENDING') {
    return {
      warning: {
        ruleId: "MEDICAL_001",
        ruleName: "Medical Clearance Pending",
        ruleType: "MEDICAL_CLEARANCE",
        message: "Medical clearance is still pending review",
        suggestedAction: "Wait for medical clearance approval or contact medical officer",
      }
    };
  }
  
  if (status === 'REJECTED') {
    return {
      violation: {
        ruleId: "MEDICAL_002",
        ruleName: "Medical Clearance Rejected",
        ruleType: "MEDICAL_CLEARANCE",
        reason: "Medical clearance has been rejected",
        severity: 'HIGH',
        canOverride: true,
        suggestedAction: "Consult medical officer and resubmit medical documents",
      }
    };
  }
  
  if (status === 'EXPIRED' || (expiryDate && new Date(expiryDate) < new Date())) {
    return {
      violation: {
        ruleId: "MEDICAL_003",
        ruleName: "Medical Clearance Expired",
        ruleType: "MEDICAL_CLEARANCE",
        reason: "Medical clearance has expired",
        severity: 'HIGH',
        canOverride: false,
        suggestedAction: "Renew medical clearance",
      }
    };
  }
  
  return {}; // Medical clearance valid
}

/**
 * Enhanced rule evaluation with new features
 */
async function evaluateEnhancedRule(
  rule: any,
  player: any,
  documents: any[],
  consents: any[]
): Promise<{ violation?: EligibilityViolation; warning?: EligibilityWarning }> {
  switch (rule.ruleType) {
    case "AGE_RANGE":
      return { violation: evaluateAgeRangeEnhanced(rule, player) };
    case "GEOGRAPHIC":
      return { violation: evaluateGeographicEnhanced(rule, player) };
    case "PLAYER_STATUS":
      return { violation: evaluatePlayerStatusEnhanced(rule, player) };
    case "DOCUMENT_REQUIREMENT":
      return { violation: evaluateDocumentRequirement(rule, documents) };
    case "CONSENT_REQUIREMENT":
      return { violation: evaluateConsentRequirement(rule, consents) };
    case "GENDER_RESTRICTION":
      return { violation: evaluateGenderRestriction(rule, player) };
    case "MEDICAL_REQUIREMENT":
      return { violation: evaluateMedicalRequirement(rule, player) };
    default:
      return {};
  }
}

function evaluateAgeRangeEnhanced(rule: any, player: any): EligibilityViolation | null {
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
      reason: "Date of birth is not set",
      severity: 'HIGH',
      canOverride: false,
      suggestedAction: "Update profile with correct date of birth",
    };
  }

  const birthDate = new Date(player.dob);
  const calculationDate = new Date(config.ageCalculationDate);
  const ageInYears = Math.floor((calculationDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  if (config.minAge !== undefined && ageInYears < config.minAge) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Player is ${ageInYears} years old, minimum age is ${config.minAge}`,
      severity: 'HIGH',
      canOverride: true,
      suggestedAction: "Wait until minimum age is reached or apply for age exception",
    };
  }

  if (config.maxAge !== undefined && ageInYears > config.maxAge) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Player is ${ageInYears} years old, maximum age is ${config.maxAge}`,
      severity: 'HIGH',
      canOverride: true,
      suggestedAction: "Apply for age exception if allowed by tournament rules",
    };
  }

  return null;
}

function evaluateGeographicEnhanced(rule: any, player: any): EligibilityViolation | null {
  const config = rule.config as {
    scope: "WARD" | "SUBCOUNTY" | "COUNTY";
    allowedIds: string[];
  };

  let playerId: string | null = null;
  let scopeName: string;

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
      severity: 'HIGH',
      canOverride: false,
      suggestedAction: `Update profile with correct ${scopeName} information`,
    };
  }

  if (!config.allowedIds.includes(playerId)) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Player's ${scopeName} is not eligible for this tournament`,
      severity: 'HIGH',
      canOverride: true,
      suggestedAction: "Apply for geographic exception if allowed",
    };
  }

  return null;
}

function evaluatePlayerStatusEnhanced(rule: any, player: any): EligibilityViolation | null {
  const config = rule.config as {
    allowedStatuses: string[];
  };

  if (!config.allowedStatuses.includes(player.status)) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Player status is ${player.status}, allowed statuses are: ${config.allowedStatuses.join(", ")}`,
      severity: 'MEDIUM',
      canOverride: true,
      suggestedAction: "Contact administration to update player status",
    };
  }

  return null;
}

function evaluateDocumentRequirement(rule: any, documents: any[]): EligibilityViolation | null {
  const config = rule.config as {
    requiredDocuments: string[];
  };

  const verifiedDocs = documents.filter(d => d.verificationStatus === 'VERIFIED').map(d => d.documentType);
  const missingDocs = config.requiredDocuments.filter(doc => !verifiedDocs.includes(doc));

  if (missingDocs.length > 0) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Missing required documents: ${missingDocs.join(', ')}`,
      severity: 'HIGH',
      canOverride: false,
      suggestedAction: "Upload and verify all required documents",
    };
  }

  return null;
}

function evaluateConsentRequirement(rule: any, consents: any[]): EligibilityViolation | null {
  const config = rule.config as {
    requiredConsents: string[];
  };

  const grantedConsents = consents.filter(c => c.isConsented).map(c => c.consentType);
  const missingConsents = config.requiredConsents.filter(consent => !grantedConsents.includes(consent));

  if (missingConsents.length > 0) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Missing required consents: ${missingConsents.join(', ')}`,
      severity: 'HIGH',
      canOverride: false,
      suggestedAction: "Grant all required consents",
    };
  }

  return null;
}

function evaluateGenderRestriction(rule: any, player: any): EligibilityViolation | null {
  const config = rule.config as {
    allowedGenders: string[];
  };

  if (!config.allowedGenders.includes(player.sex)) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: `Tournament is restricted to ${config.allowedGenders.join(' and ')} players only`,
      severity: 'HIGH',
      canOverride: false,
      suggestedAction: "Register for appropriate gender category",
    };
  }

  return null;
}

function evaluateMedicalRequirement(rule: any, player: any): EligibilityViolation | null {
  const config = rule.config as {
    requireValidMedical: boolean;
    maxMedicalAge?: number; // Maximum age of medical clearance in days
  };

  if (!config.requireValidMedical) {
    return null;
  }

  if (player.medicalClearanceStatus !== 'VALID') {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      reason: "Valid medical clearance is required for this tournament",
      severity: 'HIGH',
      canOverride: false,
      suggestedAction: "Obtain valid medical clearance",
    };
  }

  if (config.maxMedicalAge && player.medicalClearanceDate) {
    const medicalDate = new Date(player.medicalClearanceDate);
    const daysSinceMedical = Math.floor((Date.now() - medicalDate.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysSinceMedical > config.maxMedicalAge) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.ruleType,
        reason: `Medical clearance is ${daysSinceMedical} days old, maximum allowed is ${config.maxMedicalAge} days`,
        severity: 'MEDIUM',
        canOverride: true,
        suggestedAction: "Renew medical clearance",
      };
    }
  }

  return null;
}

function generateEligibilitySummary(
  player: any,
  documents: any[],
  consents: any[],
  violations: EligibilityViolation[],
  warnings: EligibilityWarning[]
): EligibilitySummary {
  const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
  const highViolations = violations.filter(v => v.severity === 'HIGH');
  
  let overallStatus: 'ELIGIBLE' | 'INELIGIBLE' | 'PENDING_REVIEW' | 'NEEDS_ACTION';
  
  if (criticalViolations.length > 0) {
    overallStatus = 'INELIGIBLE';
  } else if (highViolations.length > 0) {
    overallStatus = 'NEEDS_ACTION';
  } else if (warnings.length > 0) {
    overallStatus = 'PENDING_REVIEW';
  } else {
    overallStatus = 'ELIGIBLE';
  }

  const requiredDocs = ['NATIONAL_ID', 'SELFIE'];
  const verifiedDocs = documents.filter(d => d.verificationStatus === 'VERIFIED');
  const documentsVerified = requiredDocs.every(doc => 
    verifiedDocs.some(vd => vd.documentType === doc)
  );

  const requiredConsents = ['TERMS_CONDITIONS', 'DATA_PROCESSING'];
  const grantedConsents = consents.filter(c => c.isConsented);
  const consentsGranted = requiredConsents.every(consent => 
    grantedConsents.some(gc => gc.consentType === consent)
  );

  const medicalClearanceValid = player.medicalClearanceStatus === 'VALID' && 
    (!player.medicalExpiryDate || new Date(player.medicalExpiryDate) > new Date());

  const ageEligible = !violations.some(v => v.ruleType === 'AGE_RANGE');
  const geographicEligible = !violations.some(v => v.ruleType === 'GEOGRAPHIC');

  const nextSteps: string[] = [];
  
  if (!documentsVerified) nextSteps.push('Complete document verification');
  if (!consentsGranted) nextSteps.push('Grant required consents');
  if (!medicalClearanceValid) nextSteps.push('Obtain valid medical clearance');
  if (player.registrationStatus !== 'APPROVED') nextSteps.push('Complete registration approval');
  
  violations.forEach(v => {
    if (v.suggestedAction && !nextSteps.includes(v.suggestedAction)) {
      nextSteps.push(v.suggestedAction);
    }
  });

  if (nextSteps.length === 0) nextSteps.push('Ready for tournament participation');

  return {
    overallStatus,
    registrationStatus: player.registrationStatus,
    documentsVerified,
    consentsGranted,
    medicalClearanceValid,
    ageEligible,
    geographicEligible,
    nextSteps,
  };
}

// Export both old and new functions for backward compatibility
export {
  checkPlayerEligibility, // Original function for backward compatibility
  checkPlayerEligibilityEnhanced as checkPlayerEligibilityV2, // New enhanced function
};