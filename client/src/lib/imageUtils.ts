import { supabase } from "./supabase";

/**
 * Test function to verify frontend can access player documents
 * Call this from browser console: window.testImageAccess()
 */
export async function testImageAccess() {
  console.log('🧪 Testing frontend image access...');
  
  const testPlayerId = 'd2556605-1f87-44e1-bdf0-fa157b4a7e23'; // VVVV VVVV
  console.log('🎯 Testing with player:', testPlayerId);
  
  const result = await getPlayerImageFromDocuments(testPlayerId);
  
  if (result) {
    console.log('✅ SUCCESS! Frontend can access images');
    console.log('📸 Image length:', result.length, 'characters');
    console.log('📸 Image type:', result.substring(0, 20));
  } else {
    console.log('❌ FAILED! Frontend cannot access images');
  }
  
  return result;
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testImageAccess = testImageAccess;
}

/**
 * Get a player's image from documents table
 * Checks for SELFIE first, then OTHER document types with image data
 */
async function getPlayerImageFromDocuments(playerId: string): Promise<string | undefined> {
  try {
    console.log('🔍 [Frontend] Looking for documents for player:', playerId);
    
    // Look for image documents for this player, prioritizing SELFIE
    const { data: documents, error } = await supabase
      .from('player_documents')
      .select('doc_type, document_path')
      .eq('upid', playerId)
      .like('document_path', 'data:image/%')
      .order('doc_type', { ascending: true }); // This will put NATIONAL_ID before SELFIE, but we'll sort manually

    console.log('📄 [Frontend] Query result:');
    console.log('   Error:', error?.message || 'None');
    console.log('   Documents found:', documents?.length || 0);

    if (error) {
      console.error('❌ [Frontend] Database error:', error);
      return undefined;
    }
    
    if (!documents || documents.length === 0) {
      console.log('📄 [Frontend] No image documents found for player:', playerId);
      return undefined;
    }

    console.log('📄 [Frontend] Documents details:');
    documents.forEach((doc, index) => {
      const preview = doc.document_path ? doc.document_path.substring(0, 30) + '...' : 'null';
      console.log(`   ${index + 1}. ${doc.doc_type}: ${preview}`);
    });

    // Prioritize document types for profile pictures
    const priorityOrder = ['SELFIE', 'OTHER', 'NATIONAL_ID'];
    
    for (const docType of priorityOrder) {
      const doc = documents.find(d => d.doc_type === docType);
      if (doc && doc.document_path) {
        console.log(`✨ [Frontend] Using ${docType} document as profile picture for player ${playerId}`);
        console.log('📸 [Frontend] Image starts with:', doc.document_path.substring(0, 50));
        return doc.document_path;
      }
    }

    // If no priority match, use the first available image
    if (documents[0]?.document_path) {
      console.log(`✨ [Frontend] Using ${documents[0].doc_type} document as profile picture for player ${playerId}`);
      return documents[0].document_path;
    }

    return undefined;
  } catch (error) {
    console.error('💥 [Frontend] Error fetching player image from documents:', error);
    return undefined;
  }
}

/**
 * Resolve a stored photo path to a displayable URL
 * Handles both Supabase storage paths and fallback data URLs
 */
export function resolvePhotoUrl(photoPath: string | null | undefined): string | undefined {
  if (!photoPath) {
    return undefined;
  }

  // If it's already a data URL, return as-is
  if (photoPath.startsWith('data:image/')) {
    return photoPath;
  }

  // If it's a fallback path, it might be incomplete
  // For now, return undefined for fallback paths since they're incomplete
  // TODO: Implement a way to recover original data URLs or re-upload fallback images
  if (photoPath.startsWith('fallback/')) {
    console.warn('Fallback image path detected, but data URL not available:', photoPath);
    return undefined;
  }

  // If it's a Supabase storage path, construct the public URL
  try {
    const { data } = supabase.storage
      .from('player-photos')
      .getPublicUrl(photoPath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error resolving photo URL:', error);
    return undefined;
  }
}

/**
 * Get a player's profile image URL with fallback to initials
 */
export function getPlayerImageProps(photoPath: string | null | undefined, firstName: string, lastName: string) {
  const imageUrl = resolvePhotoUrl(photoPath);
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  
  return {
    src: imageUrl,
    alt: `${firstName} ${lastName}`,
    fallbackText: initials || '??'
  };
}

/**
 * Enhanced player image props that checks documents table for actual images
 * Use this when you have the player ID available
 */
export async function getEnhancedPlayerImageProps(
  playerId: string,
  photoPath: string | null | undefined, 
  firstName: string, 
  lastName: string
) {
  console.log(`🔍 Getting enhanced image props for player ${playerId} (${firstName} ${lastName})`);
  console.log(`📸 Photo path from profile: ${photoPath}`);
  
  // First try the standard photo_path
  let imageUrl = resolvePhotoUrl(photoPath);
  console.log(`📸 Resolved photo URL: ${imageUrl}`);
  
  // If no image from photo_path, try to get from documents
  if (!imageUrl) {
    console.log(`🔍 No image from photo_path, checking documents table...`);
    imageUrl = await getPlayerImageFromDocuments(playerId);
    console.log(`📸 Image from documents: ${imageUrl ? 'Found!' : 'Not found'}`);
  }
  
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  
  const result = {
    src: imageUrl,
    alt: `${firstName} ${lastName}`,
    fallbackText: initials || '??'
  };
  
  console.log(`✨ Final image props:`, result);
  return result;
}

/**
 * Generate a color for the avatar fallback based on the player's name
 */
export function getAvatarColor(firstName: string, lastName: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500'
  ];
  
  const nameString = `${firstName}${lastName}`.toLowerCase();
  const hash = nameString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}