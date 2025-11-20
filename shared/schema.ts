import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uuid,
  date,
  jsonb,
  index,
  serial,
  unique,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Authentication Enums
export const userRoleEnum = pgEnum("user_role_enum", [
  "SUPER_ADMIN",          // Platform super admin - full access across all organizations
  "ORG_ADMIN",            // Organization admin - full access within assigned organizations
  "REGISTRAR",            // Can register teams and players
  "COMPETITION_MANAGER",  // Manages tournaments and fixtures
  "MATCH_OFFICIAL",       // Referees, match commissioners
  "TEAM_MANAGER",         // Team coach/manager
  "TEAM_STAFF",           // Team staff members
  "PLAYER",               // Registered player
  "VIEWER",               // Read-only access
  "FAN",                  // Public fan access
  "MEDIA",                // Media personnel
  "SPONSOR",              // Sponsor access
]);

// Enums
export const tournamentModelEnum = pgEnum("tournament_model_enum", [
  "ADMINISTRATIVE_WARD",
  "ADMINISTRATIVE_SUB_COUNTY",
  "ADMINISTRATIVE_COUNTY",
  "ADMINISTRATIVE_NATIONAL",
  "INTER_COUNTY",
  "INDEPENDENT",
  "LEAGUE",
]);

export const tournamentStatusEnum = pgEnum("tournament_status_enum", [
  "DRAFT",
  "REGISTRATION",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
]);

export const federationTypeEnum = pgEnum("federation_type_enum", [
  "FKF",
  "SCHOOLS",
  "CORPORATE",
  "OTHER",
]);

export const stageTypeEnum = pgEnum("stage_type_enum", [
  "LEAGUE",
  "GROUP",
  "KNOCKOUT",
]);

export const participationModelEnum = pgEnum("participation_model_enum", [
  "ORGANIZATIONAL", // Teams must be from organizing organization (leagues)
  "GEOGRAPHIC",     // Teams based on geographic eligibility (admin tournaments)
  "OPEN",          // Any team can participate (independent tournaments)
]);

export const matchStatusEnum = pgEnum("match_status_enum", [
  "SCHEDULED",
  "LIVE",
  "COMPLETED",
  "POSTPONED",
  "CANCELLED",
]);

export const matchEventTypeEnum = pgEnum("match_event_type_enum", [
  "GOAL",
  "YELLOW_CARD",
  "RED_CARD",
  "SUBSTITUTION",
  "PENALTY",
  "OWN_GOAL",
  "KICK_OFF",
  "HALF_TIME",
  "FULL_TIME",
  "EXTRA_TIME",
  "PENALTY_SHOOTOUT",
  "VAR_REVIEW",
  "INJURY",
]);

export const documentTypeEnum = pgEnum("document_type_enum", [
  "NATIONAL_ID",
  "PASSPORT",
  "BIRTH_CERTIFICATE",
  "GUARDIAN_ID",
  "OTHER",
]);

export const sexEnum = pgEnum("sex_enum", [
  "MALE",
  "FEMALE",
  "OTHER",
]);

export const playerStatusEnum = pgEnum("player_status_enum", [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "RETIRED",
]);

export const eligibilityRuleTypeEnum = pgEnum("eligibility_rule_type_enum", [
  "AGE_RANGE",             // Age-based restrictions
  "GEOGRAPHIC",            // Ward/Sub-county/County restrictions  
  "PLAYER_STATUS",         // Player active/inactive status
  "DOCUMENT_REQUIREMENT",  // Required document verification
  "CONSENT_REQUIREMENT",   // Required consent verification
  "GENDER_RESTRICTION",    // Gender-based tournament restrictions
  "MEDICAL_REQUIREMENT",   // Medical clearance requirements
  "NATIONALITY",           // Nationality restrictions
  "NO_ACTIVE_SUSPENSIONS", // No active disciplinary actions
  "VALID_CONTRACT",        // Valid contract requirement
]);

export const contractStatusEnum = pgEnum("contract_status_enum", [
  "PENDING",
  "ACTIVE",
  "EXPIRED",
  "TERMINATED",
]);

export const contractTypeEnum = pgEnum("contract_type_enum", [
  "PERMANENT",
  "LOAN",
  "TRIAL",
  "SHORT_TERM",
]);

export const transferStatusEnum = pgEnum("transfer_status_enum", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
]);

export const transferTypeEnum = pgEnum("transfer_type_enum", [
  "PERMANENT",
  "LOAN",
  "LOAN_RETURN",
]);

export const disciplinaryIncidentTypeEnum = pgEnum("disciplinary_incident_type_enum", [
  "YELLOW_CARD",
  "RED_CARD",
  "SUSPENSION",
  "FINE",
  "WARNING",
  "MISCONDUCT",
  "OTHER",
]);

export const disciplinaryStatusEnum = pgEnum("disciplinary_status_enum", [
  "ACTIVE",
  "SERVED",
  "APPEALED",
  "OVERTURNED",
  "CANCELLED",
]);

// Team Transfer Enums
export const teamTransferTypeEnum = pgEnum("team_transfer_type_enum", [
  "VOLUNTARY", // Team voluntarily transfers to new organization
  "ADMINISTRATIVE", // Administrative transfer (merger, restructure, etc.)
  "DISCIPLINARY", // Transfer due to disciplinary action
  "DISSOLUTION" // Original organization dissolving
]);

export const teamTransferStatusEnum = pgEnum("team_transfer_status_enum", [
  "PENDING", // Transfer request submitted
  "APPROVED", // Transfer approved and completed
  "REJECTED", // Transfer request rejected
  "CANCELLED", // Transfer request cancelled
  "IN_PROGRESS" // Transfer in process of completion
]);

// Player Registration Enums
export const registrationStatusEnum = pgEnum("registration_status_enum", [
  "DRAFT",         // Initial state - player started but hasn't submitted
  "SUBMITTED",     // Player completed all steps and submitted
  "IN_REVIEW",     // Admin is reviewing documents/eligibility
  "APPROVED",      // All checks passed, player is verified
  "REJECTED",      // Failed verification, needs correction
  "SUSPENDED",     // Temporary suspension (disciplinary)
  "INCOMPLETE",    // Missing required documents/information
]);

// Notification type enum for player notifications
export const notificationTypeEnum = pgEnum("notification_type_enum", [
  "STATUS_CHANGE",
  "DOCUMENT_REQUIRED", 
  "VERIFICATION_COMPLETE",
  "ACTION_REQUIRED",
]);

export const consentTypeEnum = pgEnum("consent_type_enum", [
  "PLAYER_TERMS",
  "DATA_PROCESSING", 
  "MEDIA_CONSENT",
  "GUARDIAN_CONSENT",
]);

export const medicalStatusEnum = pgEnum("medical_status_enum", [
  "VALID",
  "EXPIRED", 
  "PENDING",
  "REJECTED",
]);

export const adminRequestStatusEnum = pgEnum("admin_request_status_enum", [
  "PENDING",      // User submitted request, awaiting super admin approval
  "APPROVED",     // Super admin approved, user is now tournament admin
  "REJECTED",     // Super admin rejected the request
  "CANCELLED",    // User cancelled their own request
]);



// Core Tables
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sports = pgTable("sports", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const counties = pgTable("counties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  code: varchar("code", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subCounties = pgTable("sub_counties", {
  id: uuid("id").primaryKey().defaultRandom(),
  countyId: uuid("county_id").notNull().references(() => counties.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wards = pgTable("wards", {
  id: uuid("id").primaryKey().defaultRandom(),
  subCountyId: uuid("sub_county_id").notNull().references(() => subCounties.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Tables (Authentication removed)

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role Assignment Table - links users to organizations with specific roles
export const userOrganizationRoles = pgTable("user_organization_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }), // null means platform-wide role (SUPER_ADMIN)
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tournament Admin Requests - Users request to become tournament admins
export const tournamentAdminRequests = pgTable("tournament_admin_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tournamentId: uuid("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  status: adminRequestStatusEnum("status").default("PENDING").notNull(),
  requestMessage: text("request_message"), // Optional message from user explaining why they want to admin
  rejectionReason: text("rejection_reason"), // Reason if rejected by super admin
  reviewedBy: uuid("reviewed_by").references(() => users.id), // Super admin who approved/rejected
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Player Registry - Unique Player Identity (UPID system)
export const playerRegistry = pgTable("player_registry", {
  id: serial("id").primaryKey(),
  upid: text("upid").notNull().unique(), // Unique Player ID
  identityKeyHash: text("identity_key_hash").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob").notNull(), // Date of birth - existing code expects this field
  nationalId: text("national_id"),
  nationality: text("nationality"), // Existing code expects this field  
  sex: sexEnum("sex").notNull(), // Existing code expects this field
  email: text("email").unique(),
  phone: text("phone").unique(),
  wardId: integer("ward_id").references(() => wards.id),
  profileImage: text("profile_image"),
  
  // Organization scoping - CRITICAL for multi-tenancy
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  
  // Extended Registration Fields from Blueprint
  registrationStatus: registrationStatusEnum("registration_status").default("DRAFT"),
  status: text("status").default("ACTIVE"), // Existing code expects this field
  selfiePath: text("selfie_path"), // For selfie verification
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  
  // Guardian Information (for minors)
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  guardianEmail: text("guardian_email"),
  guardianRelationship: text("guardian_relationship"),
  
  // Medical Clearance
  medicalClearanceDate: date("medical_clearance_date"),
  medicalClearanceStatus: medicalStatusEnum("medical_clearance_status").default("PENDING"),
  medicalExpiryDate: date("medical_expiry_date"),
  
  // Player Preferences
  preferredPosition: text("preferred_position"),
  shirtNumber: integer("shirt_number"),
  
  // Eligibility Status
  eligibilityStatus: text("eligibility_status").default("PENDING"), // JSON string of eligibility rules
  lastEligibilityCheck: timestamp("last_eligibility_check"),
  
  // Registration info
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const playerDocuments = pgTable("player_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  upid: uuid("upid").notNull().references(() => playerRegistry.id, { onDelete: "cascade" }),
  docType: documentTypeEnum("doc_type").notNull(),
  docNumberHash: text("doc_number_hash").notNull(),
  documentPath: text("document_path"),
  verified: boolean("verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  uploadedBy: uuid("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Player Consents - GDPR compliance and consent management
export const playerConsents = pgTable("player_consents", {
  id: uuid("id").primaryKey().defaultRandom(),
  upid: text("upid").references(() => playerRegistry.upid, { onDelete: "cascade" }).notNull(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  consentType: consentTypeEnum("consent_type").notNull(),
  
  // Consent details
  isConsented: boolean("is_consented").notNull(),
  consentTimestamp: timestamp("consent_timestamp"),
  withdrawalTimestamp: timestamp("withdrawal_timestamp"),
  
  // Version tracking for legal compliance (blueprint requirement)
  consentVersion: text("consent_version").notNull(), // Version of T&C when consented
  ipAddress: text("ip_address"), // For legal audit trail
  userAgent: text("user_agent"), // Device/browser information
  
  // Guardian consent for minors (blueprint requirement)
  guardianName: text("guardian_name"), // If minor
  guardianRelationship: text("guardian_relationship"), // Parent, legal guardian, etc.
  guardianSignature: text("guardian_signature"), // Digital signature or confirmation
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Player Status Transitions - Track registration status changes
export const playerStatusTransitions = pgTable("player_status_transitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: text("player_id").notNull().references(() => playerRegistry.id, { onDelete: "cascade" }),
  fromStatus: registrationStatusEnum("from_status"), // null for initial status
  toStatus: registrationStatusEnum("to_status").notNull(),
  reason: text("reason"), // Reason for the transition
  adminId: text("admin_id"), // Admin who made the change (null for automatic)
  adminNotes: text("admin_notes"), // Additional admin notes
  automaticTransition: boolean("automatic_transition").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Player Notifications - Status updates and action items
export const playerNotifications = pgTable("player_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: text("player_id").notNull().references(() => playerRegistry.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: registrationStatusEnum("status").notNull(), // Status when notification was created
  actionRequired: boolean("action_required").default(false),
  actionUrl: text("action_url"), // URL to take action (if required)
  readAt: timestamp("read_at"), // When notification was read
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tournamentPlayers = pgTable("tournament_players", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  upid: uuid("upid").notNull().references(() => playerRegistry.id, { onDelete: "cascade" }),
  jerseyNumber: integer("jersey_number"),
  position: text("position"),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rosterMembers = pgTable("roster_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  tpid: uuid("tpid").notNull().references(() => tournamentPlayers.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eligibilityRules = pgTable("eligibility_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  ruleType: eligibilityRuleTypeEnum("rule_type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  config: jsonb("config").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  upid: uuid("upid").notNull().references(() => playerRegistry.id),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  contractType: contractTypeEnum("contract_type").notNull(),
  status: contractStatusEnum("status").notNull().default("PENDING"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  terms: jsonb("terms"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  upid: uuid("upid").notNull().references(() => playerRegistry.id),
  fromTeamId: uuid("from_team_id").references(() => teams.id, { onDelete: "set null" }),
  toTeamId: uuid("to_team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  transferType: transferTypeEnum("transfer_type").notNull(),
  status: transferStatusEnum("status").notNull().default("PENDING"),
  requestDate: date("request_date").notNull(),
  effectiveDate: date("effective_date"),
  expiryDate: date("expiry_date"),
  terms: jsonb("terms"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const disciplinaryRecords = pgTable("disciplinary_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  upid: uuid("upid").notNull().references(() => playerRegistry.id),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  tournamentId: uuid("tournament_id").references(() => tournaments.id, { onDelete: "set null" }),
  matchId: uuid("match_id").references(() => matches.id, { onDelete: "set null" }),
  incidentType: disciplinaryIncidentTypeEnum("incident_type").notNull(),
  status: disciplinaryStatusEnum("status").notNull().default("ACTIVE"),
  incidentDate: date("incident_date").notNull(),
  description: text("description").notNull(),
  sanctionDetails: jsonb("sanction_details"),
  matchesSuspended: integer("matches_suspended"),
  fineAmount: integer("fine_amount"),
  servingStartDate: date("serving_start_date"),
  servingEndDate: date("serving_end_date"),
  appealDate: date("appeal_date"),
  appealOutcome: text("appeal_outcome"),
  issuedBy: text("issued_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tournaments = pgTable("tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  sportId: uuid("sport_id").notNull().references(() => sports.id),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  season: varchar("season", { length: 50 }).notNull(),
  tournamentModel: tournamentModelEnum("tournament_model").notNull(),
  participationModel: participationModelEnum("participation_model").notNull().default("ORGANIZATIONAL"),
  status: tournamentStatusEnum("status").notNull().default("DRAFT"),
  federationType: federationTypeEnum("federation_type"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  countyId: uuid("county_id").references(() => counties.id),
  subCountyId: uuid("sub_county_id").references(() => subCounties.id),
  wardId: uuid("ward_id").references(() => wards.id),
  preferredVenues: uuid("preferred_venues").array(),
  customRules: jsonb("custom_rules"),
  leagueStructure: jsonb("league_structure"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stages = pgTable("stages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  stageType: stageTypeEnum("stage_type").notNull(),
  seq: integer("seq").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leagueDivisions = pgTable("league_divisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  stageId: uuid("stage_id").notNull().references(() => stages.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: integer("level").notNull(),
  pointsWin: integer("points_win").notNull().default(3),
  pointsDraw: integer("points_draw").notNull().default(1),
  pointsLoss: integer("points_loss").notNull().default(0),
  tiebreakers: text("tiebreakers").array().notNull().default(sql`ARRAY['POINTS', 'GD', 'GF', 'H2H']`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  stageId: uuid("stage_id").references(() => stages.id, { onDelete: "cascade" }),
  divisionId: uuid("division_id").references(() => leagueDivisions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  seq: integer("seq").notNull(),
  venue: text("venue"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamGroups = pgTable("team_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }),
  divisionId: uuid("division_id").references(() => leagueDivisions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rounds = pgTable("rounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  stageId: uuid("stage_id").references(() => stages.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }),
  number: integer("number").notNull(),
  leg: integer("leg").notNull().default(1),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  roundId: uuid("round_id").notNull().references(() => rounds.id, { onDelete: "cascade" }),
  homeTeamId: uuid("home_team_id").references(() => teams.id),
  awayTeamId: uuid("away_team_id").references(() => teams.id),
  kickoff: timestamp("kickoff").notNull(),
  venue: text("venue"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: matchStatusEnum("status").notNull().default("SCHEDULED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Match Events table - tracks all match events (goals, cards, substitutions)
export const matchEvents = pgTable("match_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  eventType: matchEventTypeEnum("event_type").notNull(),
  minute: integer("minute").notNull(),
  addedTime: integer("added_time").default(0),
  playerId: uuid("player_id"), // Nullable for non-player events
  teamId: uuid("team_id").notNull().references(() => teams.id),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional event data (assist, VAR result, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: uuid("created_by"), // User who logged the event
}, (table) => ({
  matchIdIdx: index("idx_match_events_match_id").on(table.matchId),
  eventTypeIdx: index("idx_match_events_type").on(table.eventType),
  playerIdIdx: index("idx_match_events_player_id").on(table.playerId),
}));

// Match Statistics table - live match statistics (possession, shots, etc.)
export const matchStatistics = pgTable("match_statistics", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }).unique(),
  
  // Possession
  homePossession: integer("home_possession").default(50),
  awayPossession: integer("away_possession").default(50),
  
  // Shots
  homeShots: integer("home_shots").default(0),
  awayShots: integer("away_shots").default(0),
  homeShotsOnTarget: integer("home_shots_on_target").default(0),
  awayShotsOnTarget: integer("away_shots_on_target").default(0),
  
  // Corners & Free kicks
  homeCorners: integer("home_corners").default(0),
  awayCorners: integer("away_corners").default(0),
  homeFreeKicks: integer("home_free_kicks").default(0),
  awayFreeKicks: integer("away_free_kicks").default(0),
  
  // Fouls & Cards
  homeFouls: integer("home_fouls").default(0),
  awayFouls: integer("away_fouls").default(0),
  homeYellowCards: integer("home_yellow_cards").default(0),
  awayYellowCards: integer("away_yellow_cards").default(0),
  homeRedCards: integer("home_red_cards").default(0),
  awayRedCards: integer("away_red_cards").default(0),
  
  // Offsides & Saves
  homeOffsides: integer("home_offsides").default(0),
  awayOffsides: integer("away_offsides").default(0),
  homeSaves: integer("home_saves").default(0),
  awaySaves: integer("away_saves").default(0),
  
  // Additional data
  commentary: text("commentary"), // Live commentary text
  currentMinute: integer("current_minute").default(0),
  period: text("period").default("FIRST_HALF"), // FIRST_HALF, HALF_TIME, SECOND_HALF, etc.
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  matchIdIdx: index("idx_match_statistics_match_id").on(table.matchId),
}));

export const tournamentCounties = pgTable("tournament_counties", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  countyId: uuid("county_id").notNull().references(() => counties.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tournamentCountySlots = pgTable("tournament_county_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentCountyId: uuid("tournament_county_id").notNull().references(() => tournamentCounties.id, { onDelete: "cascade" }),
  baseSlots: integer("base_slots").notNull().default(0),
  bonusSlots: integer("bonus_slots").notNull().default(0),
  wildcardSlots: integer("wildcard_slots").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertOrganizationSchema = createInsertSchema(organizations, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const insertSportSchema = createInsertSchema(sports, {
  id: undefined,
  createdAt: undefined,
});

export const insertCountySchema = createInsertSchema(counties, {
  id: undefined,
  createdAt: undefined,
});

export const insertPlayerRegistrySchema = createInsertSchema(playerRegistry, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const insertPlayerDocumentSchema = createInsertSchema(playerDocuments, {
  id: undefined,
  createdAt: undefined,
});

export const insertPlayerConsentSchema = createInsertSchema(playerConsents, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const insertTournamentPlayerSchema = createInsertSchema(tournamentPlayers, {
  id: undefined,
  registeredAt: undefined,
  createdAt: undefined,
});

export const insertRosterMemberSchema = createInsertSchema(rosterMembers, {
  id: undefined,
  joinedAt: undefined,
  createdAt: undefined,
});

export const insertTournamentSchema = createInsertSchema(tournaments, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const insertStageSchema = createInsertSchema(stages, {
  id: undefined,
  createdAt: undefined,
});

export const insertLeagueDivisionSchema = createInsertSchema(leagueDivisions, {
  id: undefined,
  createdAt: undefined,
});

export const insertGroupSchema = createInsertSchema(groups, {
  id: undefined,
  createdAt: undefined,
});

export const insertRoundSchema = createInsertSchema(rounds, {
  id: undefined,
  createdAt: undefined,
});

export const insertMatchSchema = createInsertSchema(matches, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const insertEligibilityRuleSchema = createInsertSchema(eligibilityRules, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const updateEligibilityRuleSchema = createInsertSchema(eligibilityRules, {
  id: undefined,
  tournamentId: undefined,
  createdAt: undefined,
  updatedAt: undefined,
}).partial();

export const insertContractSchema = createInsertSchema(contracts, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const updateContractSchema = createInsertSchema(contracts, {
  id: undefined,
  upid: undefined,
  orgId: undefined,
  createdAt: undefined,
  updatedAt: undefined,
}).partial();

export const insertTransferSchema = createInsertSchema(transfers, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const updateTransferSchema = createInsertSchema(transfers, {
  id: undefined,
  upid: undefined,
  fromTeamId: undefined,
  toTeamId: undefined,
  orgId: undefined,
  createdAt: undefined,
  updatedAt: undefined,
}).partial();

// Types
// Authentication Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserOrganizationRoleSchema = createInsertSchema(userOrganizationRoles, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});
export type InsertUserOrganizationRole = z.infer<typeof insertUserOrganizationRoleSchema>;
export type UserOrganizationRole = typeof userOrganizationRoles.$inferSelect;

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export type InsertSport = z.infer<typeof insertSportSchema>;
export type Sport = typeof sports.$inferSelect;

export type InsertCounty = z.infer<typeof insertCountySchema>;
export type County = typeof counties.$inferSelect;

export type InsertPlayerRegistry = z.infer<typeof insertPlayerRegistrySchema>;
export type PlayerRegistry = typeof playerRegistry.$inferSelect;

export type InsertPlayerDocument = z.infer<typeof insertPlayerDocumentSchema>;
export type PlayerDocument = typeof playerDocuments.$inferSelect;

export type InsertTournamentPlayer = z.infer<typeof insertTournamentPlayerSchema>;
export type TournamentPlayer = typeof tournamentPlayers.$inferSelect;

export type InsertRosterMember = z.infer<typeof insertRosterMemberSchema>;
export type RosterMember = typeof rosterMembers.$inferSelect;

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

export type InsertStage = z.infer<typeof insertStageSchema>;
export type Stage = typeof stages.$inferSelect;

export type InsertLeagueDivision = z.infer<typeof insertLeagueDivisionSchema>;
export type LeagueDivision = typeof leagueDivisions.$inferSelect;

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

export type InsertRound = z.infer<typeof insertRoundSchema>;
export type Round = typeof rounds.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertEligibilityRule = z.infer<typeof insertEligibilityRuleSchema>;
export type UpdateEligibilityRule = z.infer<typeof updateEligibilityRuleSchema>;
export type EligibilityRule = typeof eligibilityRules.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type UpdateContract = z.infer<typeof updateContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type UpdateTransfer = z.infer<typeof updateTransferSchema>;
export type Transfer = typeof transfers.$inferSelect;

export const insertDisciplinaryRecordSchema = createInsertSchema(disciplinaryRecords, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export type InsertDisciplinaryRecord = z.infer<typeof insertDisciplinaryRecordSchema>;
export type DisciplinaryRecord = typeof disciplinaryRecords.$inferSelect;

// Player Status Transitions Schema and Types
export const insertPlayerStatusTransitionSchema = createInsertSchema(playerStatusTransitions, {
  id: undefined,
  createdAt: undefined,
});

export const updatePlayerStatusTransitionSchema = insertPlayerStatusTransitionSchema.partial();

export type InsertPlayerStatusTransition = z.infer<typeof insertPlayerStatusTransitionSchema>;
export type UpdatePlayerStatusTransition = z.infer<typeof updatePlayerStatusTransitionSchema>;
export type PlayerStatusTransition = typeof playerStatusTransitions.$inferSelect;

// Player Notifications Schema and Types
export const insertPlayerNotificationSchema = createInsertSchema(playerNotifications, {
  id: undefined,
  createdAt: undefined,
});

export const updatePlayerNotificationSchema = insertPlayerNotificationSchema.partial();

export type InsertPlayerNotification = z.infer<typeof insertPlayerNotificationSchema>;
export type UpdatePlayerNotification = z.infer<typeof updatePlayerNotificationSchema>;
export type PlayerNotification = typeof playerNotifications.$inferSelect;

// ========================================
// Manager-Led Registration System Tables
// ========================================

// Enums for manager system
export const teamStatusEnum = pgEnum("team_status_enum", [
  "DRAFT",
  "ACTIVE", 
  "DORMANT",   // Enhanced: For inactive but not disbanded teams
  "SUSPENDED",
  "DISBANDED"
]);

export const affiliationTypeEnum = pgEnum("affiliation_type_enum", [
  "PRIMARY",    // Main organizational affiliation
  "SECONDARY",  // Secondary affiliation
  "SPONSOR",    // Sponsored by organization
  "PARTNER",    // Partnership arrangement
  "TEMPORARY"   // Temporary affiliation for specific tournaments
]);

export const managerStatusEnum = pgEnum("manager_status_enum", [
  "ACTIVE",
  "SUSPENDED", 
  "INACTIVE"
]);

export const managerRoleEnum = pgEnum("manager_role_enum", [
  "HEAD_MANAGER",
  "ASSISTANT_MANAGER",
  "TECHNICAL_DIRECTOR"
]);

export const assignmentStatusEnum = pgEnum("assignment_status_enum", [
  "ACTIVE",
  "INACTIVE",
  "TERMINATED"
]);

export const invitationStatusEnum = pgEnum("invitation_status_enum", [
  "PENDING",
  "STARTED",
  "COMPLETED", 
  "EXPIRED",
  "CANCELLED"
]);

export const emailDeliveryStatusEnum = pgEnum("email_delivery_status_enum", [
  "SENT",
  "DELIVERED",
  "BOUNCED",
  "FAILED"
]);

export const emailTypeEnum = pgEnum("email_type_enum", [
  "INITIAL_INVITE",
  "REMINDER",
  "COMPLETION_NOTICE"
]);

export const templateTypeEnum = pgEnum("template_type_enum", [
  "INVITATION",
  "REMINDER",
  "WELCOME",
  "REJECTION"
]);

export const positionEnum = pgEnum("position_enum", [
  "GOALKEEPER",
  "DEFENDER",
  "MIDFIELDER",
  "FORWARD"
]);

// Teams table (fully independent entities with multi-tournament capability)
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Core team information
  name: varchar("name", { length: 255 }).notNull(),
  clubName: varchar("club_name", { length: 255 }),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 500 }),
  foundedDate: date("founded_date"),
  
  // Team management
  managerId: uuid("manager_id"), // References team_managers.id
  createdBy: uuid("created_by"), // User who created the team
  
  // Contact information (independent of organizations)
  primaryContactEmail: varchar("primary_contact_email", { length: 255 }),
  primaryContactPhone: varchar("primary_contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 255 }), // Deprecated - use primaryContactEmail
  contactPhone: varchar("contact_phone", { length: 20 }), // Deprecated - use primaryContactPhone
  
  // Team properties
  maxPlayers: integer("max_players").default(22),
  homeVenue: varchar("home_venue", { length: 255 }),
  teamStatus: teamStatusEnum("team_status").default("ACTIVE"),
  
  // Geographic location (for eligibility in geographic tournaments)
  countyId: uuid("county_id").references(() => counties.id),
  subCountyId: uuid("sub_county_id").references(() => subCounties.id),
  wardId: uuid("ward_id").references(() => wards.id),
  
  // Legacy organizational reference (optional for backward compatibility)
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "set null" }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  orgIdIdx: index("idx_teams_org_id").on(table.orgId),
  managerIdIdx: index("idx_teams_manager_id").on(table.managerId),
  countyIdIdx: index("idx_teams_county_id").on(table.countyId),
  wardIdIdx: index("idx_teams_ward_id").on(table.wardId),
  // Unique constraint: one team name per organization
  uniqueTeamNamePerOrg: unique().on(table.name, table.orgId),
}));

// Team affiliations (many-to-many relationships between teams and organizations)
export const teamAffiliations = pgTable("team_affiliations", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  
  // Type of affiliation
  affiliationType: affiliationTypeEnum("affiliation_type").default("PRIMARY"),
  
  // Affiliation details
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // null for ongoing affiliations
  isActive: boolean("is_active").default(true),
  
  // Affiliation metadata
  description: text("description"),
  sponsorshipValue: decimal("sponsorship_value", { precision: 10, scale: 2 }),
  
  // Permissions/roles within the affiliation
  canRepresentInTournaments: boolean("can_represent_in_tournaments").default(true),
  canUseOrgFacilities: boolean("can_use_org_facilities").default(false),
  canAccessOrgResources: boolean("can_access_org_resources").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Composite index for efficient queries
  teamOrgIndex: index("team_org_affiliation_idx").on(table.teamId, table.orgId),
  
  // Index for active affiliations
  activeAffiliationsIndex: index("active_affiliations_idx")
    .on(table.teamId, table.isActive)
    .where(sql`${table.isActive} = true`),
    
  // Index for primary affiliations
  primaryAffiliationsIndex: index("primary_affiliations_idx")
    .on(table.teamId, table.affiliationType)
    .where(sql`${table.affiliationType} = 'PRIMARY'`),
}));

// Team Transfer History - Track team ownership transfers between organizations
export const teamTransferHistory = pgTable("team_transfer_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  fromOrgId: uuid("from_org_id").notNull().references(() => organizations.id),
  toOrgId: uuid("to_org_id").notNull().references(() => organizations.id),
  
  // Transfer details
  transferDate: timestamp("transfer_date").defaultNow(),
  transferReason: text("transfer_reason"),
  transferType: teamTransferTypeEnum("transfer_type").notNull(),
  
  // Approval workflow
  requestedBy: varchar("requested_by"), // User who requested the transfer
  approvedBy: varchar("approved_by"), // Admin who approved the transfer
  transferStatus: teamTransferStatusEnum("transfer_status").default("PENDING"),
  
  // Administrative notes
  adminNotes: text("admin_notes"),
  playerCount: integer("player_count"), // Number of players at time of transfer
  activeRegistrations: integer("active_registrations"), // Active tournament registrations at transfer
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  teamIdIdx: index("idx_team_transfers_team_id").on(table.teamId),
  fromOrgIdx: index("idx_team_transfers_from_org").on(table.fromOrgId),
  toOrgIdx: index("idx_team_transfers_to_org").on(table.toOrgId),
  transferDateIdx: index("idx_team_transfers_date").on(table.transferDate),
}));

// Team Tournament Registrations - Junction table for many-to-many relationship
export const teamTournamentRegistrations = pgTable("team_tournament_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  tournamentId: uuid("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  
  // Organization team is representing (optional for independent teams in open tournaments)
  representingOrgId: uuid("representing_org_id").references(() => organizations.id, { onDelete: "cascade" }),
  
  // Team affiliation used for this registration (links to team_affiliations)
  affiliationId: uuid("affiliation_id").references(() => teamAffiliations.id, { onDelete: "set null" }),
  
  // Registration details
  registrationStatus: registrationStatusEnum("registration_status").default("DRAFT"),
  registrationDate: timestamp("registration_date").defaultNow(),
  approvalDate: timestamp("approval_date"),
  rejectionDate: timestamp("rejection_date"),
  rejectionReason: text("rejection_reason"),
  
  // Tournament-specific team details
  squadSize: integer("squad_size").default(22),
  jerseyColors: text("jersey_colors"), // JSON or text for home/away colors
  captainPlayerId: uuid("captain_player_id"), // References player registry
  coachName: varchar("coach_name", { length: 255 }),
  
  // Administrative fields
  registeredBy: uuid("registered_by"), // User who registered the team
  approvedBy: uuid("approved_by"), // User who approved registration
  notes: text("notes"), // Registration notes
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  teamIdIdx: index("idx_team_tournament_registrations_team_id").on(table.teamId),
  tournamentIdIdx: index("idx_team_tournament_registrations_tournament_id").on(table.tournamentId),
  representingOrgIdx: index("idx_team_tournament_registrations_representing_org").on(table.representingOrgId),
  affiliationIdx: index("idx_team_tournament_registrations_affiliation").on(table.affiliationId),
  statusIdx: index("idx_team_tournament_registrations_status").on(table.registrationStatus),
  
  // BUSINESS RULE CONSTRAINTS
  // 1. Unique constraint: One team can only register once per tournament
  uniqueTeamPerTournament: unique().on(table.teamId, table.tournamentId),
  
  // 2. Compound indexes for sophisticated business rule checking (enforced at application level)
  teamRepresentingOrgIdx: index("idx_team_tournament_reg_team_representing_org").on(table.teamId, table.representingOrgId),
  teamRepresentingOrgTournamentIdx: index("idx_team_tournament_reg_complex").on(table.teamId, table.representingOrgId, table.tournamentId),
}));

// Team Managers table
export const teamManagers = pgTable("team_managers", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id"), // Optional link to system users
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  idNumber: varchar("id_number", { length: 50 }),
  certificationLevel: varchar("certification_level", { length: 50 }),
  certificationExpiry: date("certification_expiry"),
  licenseNumber: varchar("license_number", { length: 50 }),
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  address: text("address"),
  dateOfBirth: date("date_of_birth"),
  status: managerStatusEnum("status").default("ACTIVE"),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  bio: text("bio"),
  experienceYears: integer("experience_years").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  orgIdIdx: index("idx_team_managers_org_id").on(table.orgId),
  emailIdx: index("idx_team_managers_email").on(table.email),
  statusIdx: index("idx_team_managers_status").on(table.status),
}));

// Manager-Team Assignments (many-to-many relationship)
export const managerTeamAssignments = pgTable("manager_team_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  managerId: uuid("manager_id").notNull().references(() => teamManagers.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  role: managerRoleEnum("role").default("HEAD_MANAGER"),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: uuid("assigned_by"),
  status: assignmentStatusEnum("status").default("ACTIVE"),
  startDate: date("start_date").defaultNow(),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  managerIdIdx: index("idx_manager_team_assignments_manager_id").on(table.managerId),
  teamIdIdx: index("idx_manager_team_assignments_team_id").on(table.teamId),
}));

// Team Invitations table
export const teamInvitations = pgTable("team_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  managerId: uuid("manager_id").notNull().references(() => teamManagers.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tournamentId: uuid("tournament_id").references(() => tournaments.id, { onDelete: "set null" }),
  
  // Player Information
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  position: positionEnum("position"),
  jerseyNumber: integer("jersey_number"),
  
  // Invitation Details
  invitationCode: varchar("invitation_code", { length: 32 }).unique().notNull(),
  registrationLink: text("registration_link").notNull(),
  customMessage: text("custom_message"),
  invitedAt: timestamp("invited_at").defaultNow(),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '30 days'`),
  
  // Status Tracking
  status: invitationStatusEnum("status").default("PENDING"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  
  // Communication Tracking
  remindersSent: integer("reminders_sent").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  emailOpens: integer("email_opens").default(0),
  linkClicks: integer("link_clicks").default(0),
  lastActivityAt: timestamp("last_activity_at"),
  
  // Registration Result
  playerRegistryId: uuid("player_registry_id").references(() => playerRegistry.id, { onDelete: "set null" }),
  registrationNotes: text("registration_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  managerIdIdx: index("idx_team_invitations_manager_id").on(table.managerId),
  teamIdIdx: index("idx_team_invitations_team_id").on(table.teamId),
  orgIdIdx: index("idx_team_invitations_org_id").on(table.orgId),
  statusIdx: index("idx_team_invitations_status").on(table.status),
  emailIdx: index("idx_team_invitations_email").on(table.email),
  invitationCodeIdx: index("idx_team_invitations_invitation_code").on(table.invitationCode),
  expiresAtIdx: index("idx_team_invitations_expires_at").on(table.expiresAt),
}));

// Email Delivery Log
export const invitationEmailLog = pgTable("invitation_email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  invitationId: uuid("invitation_id").notNull().references(() => teamInvitations.id, { onDelete: "cascade" }),
  emailType: emailTypeEnum("email_type").notNull(),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }),
  sentAt: timestamp("sent_at").defaultNow(),
  deliveryStatus: emailDeliveryStatusEnum("delivery_status").default("SENT"),
  deliveryMessage: text("delivery_message"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  provider: varchar("provider", { length: 50 }),
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  invitationIdIdx: index("idx_invitation_email_log_invitation_id").on(table.invitationId),
  sentAtIdx: index("idx_invitation_email_log_sent_at").on(table.sentAt),
  deliveryStatusIdx: index("idx_invitation_email_log_delivery_status").on(table.deliveryStatus),
}));

// Manager Permissions
export const managerPermissions = pgTable("manager_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  managerId: uuid("manager_id").notNull().references(() => teamManagers.id, { onDelete: "cascade" }),
  permission: varchar("permission", { length: 100 }).notNull(),
  grantedBy: uuid("granted_by"),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invitation Templates
export const invitationTemplates = pgTable("invitation_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  managerId: uuid("manager_id").references(() => teamManagers.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  templateType: templateTypeEnum("template_type").notNull(),
  subjectTemplate: text("subject_template").notNull(),
  bodyTemplate: text("body_template").notNull(),
  isDefault: boolean("is_default").default(false),
  variables: jsonb("variables"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================================
// Zod Schemas and Types for Manager System
// ========================================

// Team schemas
export const insertTeamSchema = createInsertSchema(teams, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const updateTeamSchema = insertTeamSchema.partial();

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type UpdateTeam = z.infer<typeof updateTeamSchema>;

// Team Affiliations schemas
export const insertTeamAffiliationSchema = createInsertSchema(teamAffiliations, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const updateTeamAffiliationSchema = insertTeamAffiliationSchema.partial();

export type TeamAffiliation = typeof teamAffiliations.$inferSelect;
export type InsertTeamAffiliation = z.infer<typeof insertTeamAffiliationSchema>;
export type UpdateTeamAffiliation = z.infer<typeof updateTeamAffiliationSchema>;

// Team Tournament Registration schemas
export const insertTeamTournamentRegistrationSchema = createInsertSchema(teamTournamentRegistrations, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  registrationDate: undefined,
  approvalDate: undefined,
  rejectionDate: undefined,
});

export const updateTeamTournamentRegistrationSchema = insertTeamTournamentRegistrationSchema.partial();

export type TeamTournamentRegistration = typeof teamTournamentRegistrations.$inferSelect;
export type InsertTeamTournamentRegistration = z.infer<typeof insertTeamTournamentRegistrationSchema>;
export type UpdateTeamTournamentRegistration = z.infer<typeof updateTeamTournamentRegistrationSchema>;

// Team Manager schemas
export const insertTeamManagerSchema = createInsertSchema(teamManagers, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const updateTeamManagerSchema = insertTeamManagerSchema.partial();

export type TeamManager = typeof teamManagers.$inferSelect;
export type InsertTeamManager = z.infer<typeof insertTeamManagerSchema>;
export type UpdateTeamManager = z.infer<typeof updateTeamManagerSchema>;

// Manager Team Assignment schemas
export const insertManagerTeamAssignmentSchema = createInsertSchema(managerTeamAssignments, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const updateManagerTeamAssignmentSchema = insertManagerTeamAssignmentSchema.partial();

export type ManagerTeamAssignment = typeof managerTeamAssignments.$inferSelect;
export type InsertManagerTeamAssignment = z.infer<typeof insertManagerTeamAssignmentSchema>;
export type UpdateManagerTeamAssignment = z.infer<typeof updateManagerTeamAssignmentSchema>;

// Team Invitation schemas
export const insertTeamInvitationSchema = createInsertSchema(teamInvitations, {
  id: undefined,
  invitationCode: undefined, // Auto-generated
  registrationLink: undefined, // Auto-generated
  createdAt: undefined,
  updatedAt: undefined,
});

export const updateTeamInvitationSchema = insertTeamInvitationSchema.partial();

export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamInvitation = z.infer<typeof insertTeamInvitationSchema>;
export type UpdateTeamInvitation = z.infer<typeof updateTeamInvitationSchema>;

// Email Log schemas
export const insertInvitationEmailLogSchema = createInsertSchema(invitationEmailLog, {
  id: undefined,
  createdAt: undefined,
});

export const updateInvitationEmailLogSchema = insertInvitationEmailLogSchema.partial();

export type InvitationEmailLog = typeof invitationEmailLog.$inferSelect;
export type InsertInvitationEmailLog = z.infer<typeof insertInvitationEmailLogSchema>;
export type UpdateInvitationEmailLog = z.infer<typeof updateInvitationEmailLogSchema>;

// Manager Permission schemas
export const insertManagerPermissionSchema = createInsertSchema(managerPermissions, {
  id: undefined,
  createdAt: undefined,
});

export const updateManagerPermissionSchema = insertManagerPermissionSchema.partial();

export type ManagerPermission = typeof managerPermissions.$inferSelect;
export type InsertManagerPermission = z.infer<typeof insertManagerPermissionSchema>;
export type UpdateManagerPermission = z.infer<typeof updateManagerPermissionSchema>;

// Invitation Template schemas
export const insertInvitationTemplateSchema = createInsertSchema(invitationTemplates, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const updateInvitationTemplateSchema = insertInvitationTemplateSchema.partial();

export type InvitationTemplate = typeof invitationTemplates.$inferSelect;
export type InsertInvitationTemplate = z.infer<typeof insertInvitationTemplateSchema>;
export type UpdateInvitationTemplate = z.infer<typeof updateInvitationTemplateSchema>;

// Match Events schemas
export const insertMatchEventSchema = createInsertSchema(matchEvents, {
  id: undefined,
  createdAt: undefined,
});

export const updateMatchEventSchema = insertMatchEventSchema.partial();

export type MatchEvent = typeof matchEvents.$inferSelect;
export type InsertMatchEvent = z.infer<typeof insertMatchEventSchema>;
export type UpdateMatchEvent = z.infer<typeof updateMatchEventSchema>;

// Match Statistics schemas
export const insertMatchStatisticsSchema = createInsertSchema(matchStatistics, {
  id: undefined,
  updatedAt: undefined,
});

export const updateMatchStatisticsSchema = insertMatchStatisticsSchema.partial();

export type MatchStatistics = typeof matchStatistics.$inferSelect;
export type InsertMatchStatistics = z.infer<typeof insertMatchStatisticsSchema>;
export type UpdateMatchStatistics = z.infer<typeof updateMatchStatisticsSchema>;
