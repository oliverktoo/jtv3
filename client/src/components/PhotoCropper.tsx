import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { 
  centerCrop, 
  makeAspectCrop, 
  Crop, 
  PixelCrop,
  convertToPixelCrop 
} from 'react-image-crop';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Crop as CropIcon, Check, X } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface PhotoCropperProps {
  imageFile: File;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  cropAspectRatio?: number; // 1 for square, 4/3 for passport, etc.
  title?: string;
}

// Helper function to create cropped image
function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string
): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Canvas is empty');
      }
      const file = new File([blob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      resolve(file);
    }, 'image/jpeg', 0.9);
  });
}

export function PhotoCropper({ 
  imageFile, 
  isOpen, 
  onClose, 
  onCropComplete,
  cropAspectRatio = 1, // Default to square crop
  title = "Crop Your Photo"
}: PhotoCropperProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Load image when file changes
  React.useEffect(() => {
    if (imageFile && isOpen) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const result = reader.result?.toString();
        if (result) {
          setImgSrc(result);
          setError(null);
        } else {
          setError('Failed to load image');
        }
        setIsLoading(false);
      });
      reader.addEventListener('error', () => {
        setError('Failed to read image file');
        setIsLoading(false);
      });
      reader.readAsDataURL(imageFile);
    }
    
    // Reset state when dialog closes
    if (!isOpen) {
      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
      setError(null);
      setIsProcessing(false);
      setIsLoading(false);
    }
  }, [imageFile, isOpen]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create centered crop
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80, // Start with 80% of image
        },
        cropAspectRatio,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }, [cropAspectRatio]);

  const handleCropComplete = useCallback((crop: PixelCrop) => {
    setCompletedCrop(crop);
  }, []);

  const handleSaveCrop = async () => {
    if (!imgRef.current || !completedCrop) {
      setError('Please select a crop area');
      return;
    }

    if (completedCrop.width < 50 || completedCrop.height < 50) {
      setError('Crop area is too small. Please select a larger area.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        imageFile.name
      );
      
      onCropComplete(croppedFile);
      onClose();
    } catch (err) {
      console.error('Crop error:', err);
      setError(err instanceof Error ? err.message : 'Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Instructions - Fixed height */}
          <div className="px-6 py-4 bg-blue-50 border-b">
            <div className="text-sm">
              <strong>Photo Verification Requirements:</strong>
              <div className="mt-1 text-xs text-gray-600">
                Crop to show your face clearly • Well-lit, not blurry • Face should occupy most of the crop area
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-6 py-2">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Crop Interface - Flex-1 to take remaining space */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading image...</span>
              </div>
            ) : imgSrc ? (
              <div className="w-full h-full flex items-center justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => handleCropComplete(convertToPixelCrop(c, imgRef.current?.width || 0, imgRef.current?.height || 0))}
                  aspect={cropAspectRatio}
                  minWidth={100}
                  minHeight={100}
                  keepSelection
                  className="max-w-full max-h-full"
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    style={{
                      maxWidth: 'calc(95vw - 120px)',
                      maxHeight: 'calc(95vh - 250px)',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </ReactCrop>
              </div>
            ) : (
              <div className="text-gray-500">
                No image selected
              </div>
            )}
          </div>

          {/* Crop Info */}
          {completedCrop && (
            <div className="px-6 py-2 text-sm text-gray-600 text-center border-t bg-gray-50">
              Crop Area: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} pixels
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSaveCrop}
            disabled={!completedCrop || isProcessing}
          >
            <Check className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Use Cropped Photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}