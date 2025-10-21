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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const matchStatusEnum = pgEnum("match_status_enum", [
  "SCHEDULED",
  "LIVE",
  "COMPLETED",
  "POSTPONED",
  "CANCELLED",
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
  "AGE_RANGE",
  "GEOGRAPHIC",
  "PLAYER_STATUS",
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

export const playerRegistry = pgTable("player_registry", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  hashedIdentityKeys: text("hashed_identity_keys").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob"),
  sex: sexEnum("sex"),
  nationality: varchar("nationality", { length: 100 }),
  photoPath: text("photo_path"),
  wardId: uuid("ward_id").references(() => wards.id),
  status: playerStatusEnum("status").notNull().default("ACTIVE"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const tournaments = pgTable("tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  sportId: uuid("sport_id").notNull().references(() => sports.id),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  season: varchar("season", { length: 50 }).notNull(),
  tournamentModel: tournamentModelEnum("tournament_model").notNull(),
  status: tournamentStatusEnum("status").notNull().default("DRAFT"),
  federationType: federationTypeEnum("federation_type"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  countyId: uuid("county_id").references(() => counties.id),
  subCountyId: uuid("sub_county_id").references(() => subCounties.id),
  wardId: uuid("ward_id").references(() => wards.id),
  customRules: jsonb("custom_rules"),
  leagueStructure: jsonb("league_structure"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  code: varchar("code", { length: 10 }),
  countyId: uuid("county_id").references(() => counties.id),
  subCountyId: uuid("sub_county_id").references(() => subCounties.id),
  wardId: uuid("ward_id").references(() => wards.id),
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
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSportSchema = createInsertSchema(sports).omit({
  id: true,
  createdAt: true,
});

export const insertCountySchema = createInsertSchema(counties).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerRegistrySchema = createInsertSchema(playerRegistry).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlayerDocumentSchema = createInsertSchema(playerDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentPlayerSchema = createInsertSchema(tournamentPlayers).omit({
  id: true,
  registeredAt: true,
  createdAt: true,
});

export const insertRosterMemberSchema = createInsertSchema(rosterMembers).omit({
  id: true,
  joinedAt: true,
  createdAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStageSchema = createInsertSchema(stages).omit({
  id: true,
  createdAt: true,
});

export const insertLeagueDivisionSchema = createInsertSchema(leagueDivisions).omit({
  id: true,
  createdAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

export const insertRoundSchema = createInsertSchema(rounds).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEligibilityRuleSchema = createInsertSchema(eligibilityRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEligibilityRuleSchema = createInsertSchema(eligibilityRules).omit({
  id: true,
  tournamentId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Types
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

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

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
