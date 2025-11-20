-- Migration to add MEDIA_CONSENT to consent_type_enum
-- This fixes the issue where MEDIA_CONSENT was defined in schema.ts but not in the actual database

-- Add MEDIA_CONSENT to the consent_type_enum if it doesn't exist
DO $$
BEGIN
    -- Check if MEDIA_CONSENT already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'MEDIA_CONSENT' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'consent_type_enum'
        )
    ) THEN
        -- Add MEDIA_CONSENT to the enum
        ALTER TYPE consent_type_enum ADD VALUE 'MEDIA_CONSENT';
        RAISE NOTICE 'Added MEDIA_CONSENT to consent_type_enum';
    ELSE
        RAISE NOTICE 'MEDIA_CONSENT already exists in consent_type_enum';
    END IF;
END $$;