-- Migration: Implement fully independent teams with organizational affiliations
-- Date: 2024-12-09
-- Description: Enhance teams to support independent operation with flexible organizational relationships

-- 1. Add new enums for affiliation types and enhanced team status
CREATE TYPE "public"."affiliation_type_enum" AS ENUM('PRIMARY', 'SECONDARY', 'SPONSOR', 'PARTNER', 'TEMPORARY');

-- Update team status enum to include DORMANT (if not exists)
-- This is handled as ALTER TYPE to avoid conflicts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DORMANT' AND enumtypid = 'public.team_status_enum'::regtype) THEN
        ALTER TYPE "public"."team_status_enum" ADD VALUE 'DORMANT';
    END IF;
END
$$;

-- 2. Add new fields to teams table for independent operation
ALTER TABLE "teams" 
  ADD COLUMN IF NOT EXISTS "created_by" uuid,
  ADD COLUMN IF NOT EXISTS "primary_contact_email" varchar(255),
  ADD COLUMN IF NOT EXISTS "primary_contact_phone" varchar(20);

-- 3. Modify teams.org_id to be nullable for independent teams
ALTER TABLE "teams" ALTER COLUMN "org_id" DROP NOT NULL;

-- Add foreign key constraint with SET NULL on delete
ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "teams_org_id_organizations_id_fk";
ALTER TABLE "teams" ADD CONSTRAINT "teams_org_id_organizations_id_fk" 
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE SET NULL;

-- 4. Create team_affiliations table for many-to-many relationships
CREATE TABLE IF NOT EXISTS "team_affiliations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "team_id" uuid NOT NULL,
  "org_id" uuid NOT NULL,
  "affiliation_type" "affiliation_type_enum" DEFAULT 'PRIMARY',
  "start_date" date NOT NULL,
  "end_date" date,
  "is_active" boolean DEFAULT true,
  "description" text,
  "sponsorship_value" numeric(10,2),
  "can_represent_in_tournaments" boolean DEFAULT true,
  "can_use_org_facilities" boolean DEFAULT false,
  "can_access_org_resources" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "team_affiliations" 
  ADD CONSTRAINT "team_affiliations_team_id_teams_id_fk" 
  FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;

ALTER TABLE "team_affiliations" 
  ADD CONSTRAINT "team_affiliations_org_id_organizations_id_fk" 
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE;

-- 5. Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS "team_org_affiliation_idx" ON "team_affiliations" ("team_id", "org_id");
CREATE INDEX IF NOT EXISTS "active_affiliations_idx" ON "team_affiliations" ("team_id", "is_active") WHERE "is_active" = true;
CREATE INDEX IF NOT EXISTS "primary_affiliations_idx" ON "team_affiliations" ("team_id", "affiliation_type") WHERE "affiliation_type" = 'PRIMARY';

-- 6. Modify team_tournament_registrations for independent teams
ALTER TABLE "team_tournament_registrations" 
  RENAME COLUMN "org_id" TO "representing_org_id";

ALTER TABLE "team_tournament_registrations" 
  ALTER COLUMN "representing_org_id" DROP NOT NULL;

ALTER TABLE "team_tournament_registrations" 
  ADD COLUMN IF NOT EXISTS "affiliation_id" uuid;

-- Add foreign key for affiliation_id
ALTER TABLE "team_tournament_registrations" 
  ADD CONSTRAINT "team_tournament_registrations_affiliation_id_fk" 
  FOREIGN KEY ("affiliation_id") REFERENCES "team_affiliations"("id") ON DELETE SET NULL;

-- Update index names to match new column names
DROP INDEX IF EXISTS "idx_team_tournament_registrations_org_id";
CREATE INDEX IF NOT EXISTS "idx_team_tournament_registrations_representing_org" 
  ON "team_tournament_registrations" ("representing_org_id");

CREATE INDEX IF NOT EXISTS "idx_team_tournament_registrations_affiliation" 
  ON "team_tournament_registrations" ("affiliation_id");

-- Update compound indexes
DROP INDEX IF EXISTS "idx_team_tournament_registrations_team_org";
DROP INDEX IF EXISTS "idx_team_tournament_reg_complex";

CREATE INDEX IF NOT EXISTS "idx_team_tournament_reg_team_representing_org" 
  ON "team_tournament_registrations" ("team_id", "representing_org_id");

CREATE INDEX IF NOT EXISTS "idx_team_tournament_reg_complex" 
  ON "team_tournament_registrations" ("team_id", "representing_org_id", "tournament_id");

-- 7. Create sample data migration for existing teams
-- Migrate existing team-organization relationships to affiliations
INSERT INTO "team_affiliations" (
  "team_id", 
  "org_id", 
  "affiliation_type", 
  "start_date", 
  "is_active",
  "can_represent_in_tournaments",
  "description"
)
SELECT 
  t."id",
  t."org_id",
  'PRIMARY'::affiliation_type_enum,
  COALESCE(t."created_at"::date, CURRENT_DATE),
  true,
  true,
  'Migrated from legacy team-organization relationship'
FROM "teams" t
WHERE t."org_id" IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "team_affiliations" ta 
  WHERE ta."team_id" = t."id" AND ta."org_id" = t."org_id"
);

-- 8. Create function to maintain team affiliation integrity
CREATE OR REPLACE FUNCTION enforce_single_primary_affiliation()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserting/updating a primary affiliation
  IF NEW.affiliation_type = 'PRIMARY' AND NEW.is_active = true THEN
    -- Deactivate any existing primary affiliations for this team
    UPDATE team_affiliations 
    SET is_active = false, updated_at = NOW()
    WHERE team_id = NEW.team_id 
      AND affiliation_type = 'PRIMARY' 
      AND is_active = true 
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team affiliation integrity
DROP TRIGGER IF EXISTS trigger_enforce_single_primary_affiliation ON team_affiliations;
CREATE TRIGGER trigger_enforce_single_primary_affiliation
  BEFORE INSERT OR UPDATE ON team_affiliations
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_primary_affiliation();

-- 9. Add comments for documentation
COMMENT ON TABLE "team_affiliations" IS 'Many-to-many relationships between teams and organizations with flexible affiliation types';
COMMENT ON COLUMN "team_affiliations"."affiliation_type" IS 'Type of relationship: PRIMARY (main org), SECONDARY (additional), SPONSOR, PARTNER, TEMPORARY';
COMMENT ON COLUMN "team_affiliations"."representing_org_id" IS 'Organization the team represents in tournaments (nullable for independent participation)';
COMMENT ON COLUMN "teams"."org_id" IS 'Legacy organizational reference - use team_affiliations for new relationships';

-- 10. Create view for easy team-organization relationship queries
CREATE OR REPLACE VIEW "team_organization_relationships" AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  o.id as org_id,
  o.name as org_name,
  ta.affiliation_type,
  ta.is_active,
  ta.start_date,
  ta.end_date,
  ta.can_represent_in_tournaments,
  ta.description as affiliation_description
FROM teams t
LEFT JOIN team_affiliations ta ON t.id = ta.team_id AND ta.is_active = true
LEFT JOIN organizations o ON ta.org_id = o.id
ORDER BY t.name, ta.affiliation_type;

COMMENT ON VIEW "team_organization_relationships" IS 'Consolidated view of all active team-organization relationships';