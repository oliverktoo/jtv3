import { useState, useEffect } from 'react';
import { getPlayerImageProps, getEnhancedPlayerImageProps } from '../lib/imageUtils';

/**
 * Custom hook to load enhanced player image with fallback to documents
 */
export function useEnhancedPlayerImage(
  playerId: string, 
  photoPath: string | null | undefined, 
  firstName: string, 
  lastName: string
) {
  console.log('🎯 useEnhancedPlayerImage called with:', { playerId, photoPath, firstName, lastName });
  
  const [imageProps, setImageProps] = useState(() => 
    getPlayerImageProps(photoPath, firstName, lastName)
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Always check for enhanced images if we have a player ID
    // This ensures we look in the documents table for actual uploaded images
    if (playerId) {
      setIsLoading(true);
      getEnhancedPlayerImageProps(playerId, photoPath, firstName, lastName)
        .then((enhancedProps) => {
          console.log('✨ Enhanced image props loaded:', enhancedProps);
          setImageProps(enhancedProps);
        })
        .catch((error) => {
          console.error('Error loading enhanced player image:', error);
          // Fallback to basic props on error
          setImageProps(getPlayerImageProps(photoPath, firstName, lastName));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [playerId, photoPath, firstName, lastName]);

  return { ...imageProps, isLoading };
}