-- Migration: Tournament Organization Architecture Refactor
-- Add participation model support and make team organization optional

-- Add the new participation model enum
create type "public"."participation_model_enum" as enum ('ORGANIZATIONAL', 'GEOGRAPHIC', 'OPEN');

-- Add participation_model column to tournaments table
alter table "public"."tournaments" add column "participation_model" participation_model_enum default 'ORGANIZATIONAL'::participation_model_enum not null;

-- Make team organization optional (allow independent teams)  
alter table "public"."teams" alter column "org_id" drop not null;

-- Add indexes for new query patterns
create index if not exists "idx_tournaments_participation_model" on "public"."tournaments" using btree ("participation_model");
create index if not exists "idx_teams_geographic_eligibility" on "public"."teams" using btree ("county_id", "sub_county_id", "ward_id") where "org_id" is null;

-- Update existing tournaments with appropriate participation models based on tournament type
update "public"."tournaments" 
set "participation_model" = case 
  when "tournament_model" = 'LEAGUE' then 'ORGANIZATIONAL'::participation_model_enum
  when "tournament_model" in ('ADMINISTRATIVE_WARD', 'ADMINISTRATIVE_SUB_COUNTY', 'ADMINISTRATIVE_COUNTY', 'ADMINISTRATIVE_NATIONAL') then 'GEOGRAPHIC'::participation_model_enum
  when "tournament_model" in ('INTER_COUNTY', 'INDEPENDENT') then 'OPEN'::participation_model_enum
  else 'ORGANIZATIONAL'::participation_model_enum
end;

-- Add comments for clarity
comment on column "public"."tournaments"."participation_model" is 'ORGANIZATIONAL: teams must be from organizing org (leagues), GEOGRAPHIC: geographic eligibility (admin tournaments), OPEN: any team can participate (independent tournaments)';
comment on column "public"."teams"."org_id" is 'Organization membership - required for league participation, optional for geographic/open tournaments';