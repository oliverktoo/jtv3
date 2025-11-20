-- Migration 0001: Tournament Organization Architecture Refactor  
-- Add participation model support and make team organization optional

-- Add the new participation model enum
CREATE TYPE "public"."participation_model_enum" AS ENUM('ORGANIZATIONAL', 'GEOGRAPHIC', 'OPEN');

-- Add participation_model column to tournaments table
ALTER TABLE "tournaments" ADD COLUMN "participation_model" "participation_model_enum" DEFAULT 'ORGANIZATIONAL' NOT NULL;

-- Make team organization optional (allow independent teams)  
ALTER TABLE "teams" ALTER COLUMN "org_id" DROP NOT NULL;

-- Add indexes for new query patterns
CREATE INDEX IF NOT EXISTS "idx_tournaments_participation_model" ON "tournaments" ("participation_model");
CREATE INDEX IF NOT EXISTS "idx_teams_geographic_eligibility" ON "teams" ("county_id", "sub_county_id", "ward_id") WHERE "org_id" IS NULL;

-- Update existing tournaments with appropriate participation models based on tournament type
UPDATE "tournaments" 
SET "participation_model" = CASE 
  WHEN "tournament_model" = 'LEAGUE' THEN 'ORGANIZATIONAL'
  WHEN "tournament_model" IN ('ADMINISTRATIVE_WARD', 'ADMINISTRATIVE_SUB_COUNTY', 'ADMINISTRATIVE_COUNTY', 'ADMINISTRATIVE_NATIONAL') THEN 'GEOGRAPHIC'  
  WHEN "tournament_model" IN ('INTER_COUNTY', 'INDEPENDENT') THEN 'OPEN'
  ELSE 'ORGANIZATIONAL'
END;

-- Add comments for clarity
COMMENT ON COLUMN "tournaments"."participation_model" IS 'ORGANIZATIONAL: teams must be from organizing org (leagues), GEOGRAPHIC: geographic eligibility (admin tournaments), OPEN: any team can participate (independent tournaments)';
COMMENT ON COLUMN "teams"."org_id" IS 'Organization membership - required for league participation, optional for geographic/open tournaments';