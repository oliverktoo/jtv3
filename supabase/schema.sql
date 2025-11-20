-- JT3 Player Registration Schema (No Residency Gating)
-- Generated on 2025-10-28
-- This script defines the core data model for a global player registry without residency-based eligibility checks.

create extension if not exists "pgcrypto";

-- Enumerations -----------------------------------------------------------------

do $$ begin
    if not exists (select 1 from pg_type where typname = 'sex_enum') then
        create type sex_enum as enum ('MALE', 'FEMALE', 'OTHER');
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_type where typname = 'player_status_enum') then
        create type player_status_enum as enum ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'RETIRED');
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_type where typname = 'document_type_enum') then
        create type document_type_enum as enum (
            'NATIONAL_ID',
            'PASSPORT',
            'BIRTH_CERTIFICATE',
            'GUARDIAN_ID',
            'PLAYER_PHOTO',
            'MEDICAL_CLEARANCE',
            'TRANSFER_LETTER',
            'OTHER'
        );
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_type where typname = 'document_verification_status_enum') then
        create type document_verification_status_enum as enum ('PENDING', 'VERIFIED', 'REJECTED');
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_type where typname = 'player_registration_status_enum') then
        create type player_registration_status_enum as enum (
            'DRAFT',
            'SUBMITTED',
            'IN_REVIEW',
            'CHANGES_REQUESTED',
            'APPROVED',
            'SUSPENDED',
            'REVOKED'
        );
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_type where typname = 'consent_type_enum') then
        create type consent_type_enum as enum (
            'PLAYER_TERMS',
            'DATA_PROCESSING',
            'MEDIA_RELEASE',
            'GUARDIAN_CONSENT',
            'MEDICAL_TREATMENT'
        );
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_type where typname = 'consent_actor_enum') then
        create type consent_actor_enum as enum ('PLAYER', 'GUARDIAN', 'TEAM_MANAGER', 'ORGANIZER');
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_type where typname = 'medical_clearance_status_enum') then
        create type medical_clearance_status_enum as enum ('PENDING', 'APPROVED', 'EXPIRED', 'REVOKED');
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_type where typname = 'sanction_type_enum') then
        create type sanction_type_enum as enum (
            'SUSPENSION',
            'FINE',
            'WARNING',
            'MISCONDUCT',
            'OTHER'
        );
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_type where typname = 'sanction_status_enum') then
        create type sanction_status_enum as enum ('ACTIVE', 'SERVED', 'OVERTURNED', 'CANCELLED');
    end if;
end $$;

-- Core Reference Tables --------------------------------------------------------

create table if not exists players (
    id uuid primary key default gen_random_uuid(),
    pid text not null unique,
    first_name text not null,
    last_name text not null,
    other_names text,
    date_of_birth date,
    sex sex_enum,
    nationality text,
    email text,
    phone text,
    photo_url text,
    guardian_name text,
    guardian_relationship text,
    guardian_contact text,
    status player_status_enum not null default 'ACTIVE',
    metadata jsonb not null default '{}'::jsonb,
    affinity_tags text[] not null default array[]::text[],
    academy_name text,
    school_name text,
    employer_name text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    unique (first_name, last_name, date_of_birth)
);

comment on table players is 'Global player registry (PID). Residency details are not collected or required.';

create table if not exists player_registrations (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references players(id) on delete cascade,
    tournament_id uuid,
    team_id uuid,
    status player_registration_status_enum not null default 'DRAFT',
    submitted_at timestamptz,
    in_review_at timestamptz,
    approved_at timestamptz,
    reviewed_by uuid,
    change_request_reason text,
    change_request_payload jsonb,
    approval_notes text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

comment on table player_registrations is 'Tracks tournament-specific player registration states without residency gating.';

create unique index if not exists player_registrations_player_tournament_idx
    on player_registrations (player_id, tournament_id);

create table if not exists tournament_player_ids (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references players(id) on delete cascade,
    tournament_id uuid not null,
    tpid text not null unique,
    jersey_number integer,
    position text,
    roster_status text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

comment on table tournament_player_ids is 'Tournament-scoped player identifiers (TPID) for rosters and match sheets.';

create unique index if not exists tournament_player_ids_player_tournament_idx
    on tournament_player_ids (player_id, tournament_id);

-- Documents & Consents ---------------------------------------------------------

create table if not exists player_documents (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references players(id) on delete cascade,
    document_type document_type_enum not null,
    version integer not null default 1,
    storage_path text not null,
    metadata jsonb not null default '{}'::jsonb,
    verification_status document_verification_status_enum not null default 'PENDING',
    verified_by uuid,
    verified_at timestamptz,
    rejection_reason text,
    uploaded_by uuid,
    uploaded_at timestamptz not null default timezone('utc', now())
);

create index if not exists player_documents_player_idx on player_documents (player_id);
create index if not exists player_documents_type_idx on player_documents (player_id, document_type);

comment on table player_documents is 'Versioned document vault for identity, medical, and transfer paperwork.';

create table if not exists player_consents (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references players(id) on delete cascade,
    consent_type consent_type_enum not null,
    actor_type consent_actor_enum not null,
    actor_name text,
    actor_relationship text,
    actor_contact text,
    consent_document_id uuid references player_documents(id) on delete set null,
    granted_at timestamptz not null default timezone('utc', now()),
    expires_at timestamptz,
    revoked_at timestamptz,
    metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists player_consents_unique_idx
    on player_consents (player_id, consent_type, actor_type)
    where revoked_at is null;

comment on table player_consents is 'Consent ledger (player, guardian, or manager) - never tied to residency.';

-- Medical & Eligibility --------------------------------------------------------

create table if not exists player_medical_clearances (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references players(id) on delete cascade,
    clearance_type text not null,
    clearance_document_id uuid references player_documents(id) on delete set null,
    issued_by text,
    issuer_license text,
    issued_at date not null,
    expires_at date,
    status medical_clearance_status_enum not null default 'PENDING',
    notes text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists player_medical_clearances_player_idx
    on player_medical_clearances (player_id, status);

comment on table player_medical_clearances is 'Medical fitness records with expiry tracking; mandatory for eligibility.';

create table if not exists player_sanctions (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references players(id) on delete cascade,
    tournament_id uuid,
    team_id uuid,
    sanction_type sanction_type_enum not null,
    status sanction_status_enum not null default 'ACTIVE',
    issued_at date not null,
    effective_from date,
    effective_to date,
    matches_suspended integer,
    financial_penalty numeric,
    details jsonb not null default '{}'::jsonb,
    issued_by text,
    appeal_notes text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists player_sanctions_player_idx
    on player_sanctions (player_id, status);

comment on table player_sanctions is 'Disciplinary actions and sanctions applied to players; replaces residency checks as gating inputs.';

-- Optional Affinity Tracking (Non-Gating) -------------------------------------

create table if not exists player_affinities (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references players(id) on delete cascade,
    affinity_type text not null,
    affinity_value text not null,
    is_primary boolean not null default false,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists player_affinities_player_idx
    on player_affinities (player_id, affinity_type);

comment on table player_affinities is 'Schools, employers, academies, or other affiliations captured for analytics only (never gating).';

-- Audit & Anti-Fraud -----------------------------------------------------------

create table if not exists player_audit_logs (
    id uuid primary key default gen_random_uuid(),
    player_id uuid references players(id) on delete cascade,
    actor_id uuid,
    action text not null,
    payload jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists player_duplicate_checks (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references players(id) on delete cascade,
    match_hash text not null,
    match_confidence numeric(5,2) not null,
    match_payload jsonb not null,
    resolved boolean not null default false,
    resolved_at timestamptz,
    resolver_id uuid,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists player_duplicate_checks_hash_idx
    on player_duplicate_checks (match_hash, resolved);

comment on table player_duplicate_checks is 'Fuzzy/duplicate detection ledger to prevent multiple PID creation.';

-- Residency Proofs (Optional / Deprecated) ------------------------------------

create table if not exists player_residency_attestations (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references players(id) on delete cascade,
    provided_at timestamptz not null default timezone('utc', now()),
    residency_notes text,
    supporting_document_id uuid references player_documents(id) on delete set null,
    metadata jsonb not null default '{}'::jsonb
);

comment on table player_residency_attestations is 'Optional residency data for analytics; never used in eligibility decisions.';
