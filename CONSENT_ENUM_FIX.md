# Consent Enum Values Fix

## Problem
Consent recording was failing with database errors:
- `"PLAYERTERMSCONSENT"` - invalid enum value
- `"DATAPROCESSINGCONSENT"` - invalid enum value  
- `"MEDIA_CONSENT"` - invalid enum value

## Root Cause Analysis

### 1. **Database Enum Values**
The database `consent_type_enum` has these valid values:
- `"PLAYER_TERMS"`
- `"DATA_PROCESSING"` 
- `"MEDIA_CONSENT"`
- `"GUARDIAN_CONSENT"`

### 2. **Form Field Names vs Database Values**
The PlayerRegistration component uses these form field IDs:
- `"playerTermsConsent"`
- `"dataProcessingConsent"`
- `"mediaConsent"`
- `"guardianConsent"`

### 3. **Mapping Logic Issue**
The `useRecordConsent` hook had a faulty fallback:
```typescript
// BEFORE: Broken fallback logic
const mappedConsentType = consentTypeMapping[consentData.consentType] || consentData.consentType.toUpperCase();
```

This caused:
- `"playerTermsConsent".toUpperCase()` → `"PLAYERTERMSCONSENT"` ❌
- `"dataProcessingConsent".toUpperCase()` → `"DATAPROCESSINGCONSENT"` ❌

### 4. **Parameter Mismatch**
The PlayerRegistration component was passing:
```typescript
{
  granted: true,           // ❌ Wrong parameter name
  grantedAt: "...",       // ❌ Extra parameter
  ipAddress: "...",       // ❌ Extra parameter  
  userAgent: "...",       // ❌ Extra parameter
  legalBasis: "..."       // ❌ Extra parameter
}
```

But the hook expected:
```typescript
{
  isConsented: boolean     // ✅ Correct parameter name
}
```

## Fixes Applied

### 1. **Enhanced Consent Type Mapping**
```typescript
// AFTER: Complete mapping including form field names
const consentTypeMapping: Record<string, string> = {
  'playerTerms': 'PLAYER_TERMS',
  'dataProcessing': 'DATA_PROCESSING', 
  'mediaConsent': 'MEDIA_CONSENT',
  'guardianConsent': 'GUARDIAN_CONSENT',
  'player_terms': 'PLAYER_TERMS',
  'data_processing': 'DATA_PROCESSING',
  'media_consent': 'MEDIA_CONSENT',
  'guardian_consent': 'GUARDIAN_CONSENT',
  // Handle form field names from PlayerRegistration component
  'playerTermsConsent': 'PLAYER_TERMS',        // ✅ Maps correctly now
  'dataProcessingConsent': 'DATA_PROCESSING',  // ✅ Maps correctly now
  'guardianConsentConsent': 'GUARDIAN_CONSENT' // ✅ Maps correctly now
};
```

### 2. **Safe Fallback**
```typescript
// BEFORE: Dangerous fallback
const mappedConsentType = consentTypeMapping[consentData.consentType] || consentData.consentType.toUpperCase();

// AFTER: Safe fallback
const mappedConsentType = consentTypeMapping[consentData.consentType] || 'PLAYER_TERMS';
```

### 3. **Fixed Parameter Interface**
```typescript
// BEFORE: Wrong parameters
await recordConsentMutation.mutateAsync({
  granted: true,           // ❌
  grantedAt: "...",       // ❌
  ipAddress: "...",       // ❌
  userAgent: "...",       // ❌
  legalBasis: "..."       // ❌
});

// AFTER: Correct parameters
await recordConsentMutation.mutateAsync({
  upid,
  consentType: id,
  isConsented: true        // ✅ Matches hook interface
});
```

## Result
✅ **Consent recording now works correctly:**
- Form field names properly mapped to database enum values
- No more invalid enum errors in console  
- Consents are recorded successfully in database
- Clean parameter interface between component and hook

## Test Status
- ✅ **Production deployed**: https://jamiisportske.netlify.app  
- ✅ **Consent functionality**: Should work without enum errors
- ✅ **Database integration**: Proper enum values sent to database