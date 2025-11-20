# Document Upload State Management Fix

## Problem
After uploading a document in the deployed app, it would show "Document uploaded" briefly, then immediately revert to showing "Upload document" again, even though the document was successfully stored.

## Root Cause Analysis
The issue was in the state synchronization between the upload process and the UI state in `PlayerRegistration.tsx`. Several mismatches were found:

### 1. **Database Field Mismatch**
- **Database schema**: Uses `doc_type` field
- **Sync logic**: Was looking for `document_type` field  
- **Result**: Documents were uploaded but not reflected in UI state

### 2. **Parameter Name Mismatch**  
- **Mutation expects**: `docType` parameter
- **Component was passing**: `documentType` parameter
- **Result**: Upload mutation calls were failing

### 3. **Document Type Value Mismatch**
- **Components were passing**: `"identification"`, `"medical_clearance"`, `"guardian_identification"`
- **Mutation expects**: `"ID_CARD"`, `"MEDICAL_CERTIFICATE"`, `"BIRTH_CERTIFICATE"`, etc.
- **Result**: Document type mapping was broken

## Fixes Applied

### 1. **Fixed Database Field Sync Logic**
```typescript
// BEFORE: Looking for wrong field
switch (doc.document_type) { // ❌ Wrong field name

// AFTER: Using correct database field  
switch (doc.doc_type) { // ✅ Matches database schema
```

### 2. **Fixed Parameter Names**
```typescript  
// BEFORE: Wrong parameter name
await uploadMutation.mutateAsync({
  documentType: docType, // ❌ Wrong parameter name

// AFTER: Correct parameter name
await uploadMutation.mutateAsync({
  docType: docType, // ✅ Matches mutation interface
```

### 3. **Fixed Document Type Values**
```typescript
// BEFORE: Invalid document types
docType="identification"          // ❌ Not in enum
docType="medical_clearance"       // ❌ Not in enum  
docType="guardian_identification" // ❌ Not in enum

// AFTER: Valid document types matching mutation enum
docType="ID_CARD"                 // ✅ Valid enum value
docType="MEDICAL_CERTIFICATE"     // ✅ Valid enum value
docType="ID_CARD"                 // ✅ For guardian documents
```

### 4. **Improved Document State Mapping**
```typescript
// Enhanced mapping for database values to UI state
switch (doc.doc_type) {
  case 'NATIONAL_ID':
  case 'PASSPORT':
    docTypes.push('id');
    break;
  case 'BIRTH_CERTIFICATE':
    docTypes.push('id'); // Birth certificate serves as ID for minors
    break;
  case 'OTHER':
    docTypes.push('medical'); // Medical certificates stored as OTHER
    break;
}
```

## Result
✅ **Document uploads now work correctly:**
- Upload shows success message
- UI state properly reflects uploaded documents  
- "Uploaded" badge stays visible after successful upload
- No more flickering between upload/uploaded states
- Storage backend and UI state remain synchronized

## Test Status
- ✅ **Production deployed**: https://jamiisportske.netlify.app  
- ✅ **Storage functionality**: Working with proper Supabase storage
- ✅ **State persistence**: Upload state properly maintained
- ✅ **No console warnings**: Storage upload working directly (no fallback)