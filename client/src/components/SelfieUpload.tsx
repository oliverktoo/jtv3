import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Camera, Upload, X, RefreshCw, Check, Crop } from 'lucide-react';
import { uploadFile, captureImageFromCamera, resizeImage, UploadResult } from '../lib/fileUpload';
import { PhotoCropper } from './PhotoCropper';

interface SelfieUploadProps {
  onUploadComplete: (url: string, path: string) => void;
  onUploadStart?: () => void;
  onError?: (error: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

export function SelfieUpload({ 
  onUploadComplete, 
  onUploadStart, 
  onError, 
  currentImageUrl,
  disabled = false 
}: SelfieUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    onError?.(errorMsg);
  };

  const clearError = () => {
    setError(null);
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      handleError('Please select an image file');
      // Reset file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      handleError('File size must be less than 10MB');
      // Reset file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setShowCropper(true);
    clearError();
  };

  const handleCroppedImage = async (croppedFile: File) => {
    setShowCropper(false);
    setSelectedFile(null);
    
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsUploading(true);
    clearError();
    onUploadStart?.();

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(croppedFile);
      setPreview(previewUrl);

      // Upload to Supabase Storage (with fallback)
      const result: UploadResult = await uploadFile(croppedFile, 'player-photos', 'selfies');
      
      if (result.success && result.url && result.path) {
        // Show success message with fallback info if applicable
        if (result.path.startsWith('fallback/')) {
          console.log('Using temporary storage - file will be processed when storage is available');
        }
        onUploadComplete(result.url, result.path);
      } else {
        handleError(result.error || 'Upload failed');
        setPreview(null);
        // Reset file input on upload error
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
      // Reset file input on upload error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropperClose = () => {
    setShowCropper(false);
    setSelectedFile(null);
    // Reset file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = async () => {
    try {
      clearError();
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        handleError('Camera not available on this device');
        return;
      }

      const file = await captureImageFromCamera();
      if (file) {
        handleFileSelect(file);
      }
    } catch (err) {
      console.error('Camera capture error:', err);
      handleError(err instanceof Error ? err.message : 'Camera access failed');
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        preview 
          ? 'border-green-300 bg-green-50' 
          : error 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
      }`}>
        
        {preview ? (
          // Image Preview
          <div className="space-y-4">
            <div className="relative inline-block">
              <img 
                src={preview} 
                alt="Selfie preview" 
                className="w-32 h-32 object-cover rounded-full border-4 border-green-200"
              />
              <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-800">Selfie uploaded successfully!</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={removeImage}
                  disabled={disabled || isUploading}
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCameraCapture}
                  disabled={disabled || isUploading}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retake
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Upload Interface
          <div className="space-y-4">
            <Camera className="h-16 w-16 mx-auto text-gray-400" />
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Upload Your Selfie</h3>
              <p className="text-sm text-gray-600 mb-4">
                Take a clear photo of yourself for identity verification
              </p>
            </div>

            {/* Upload Buttons */}
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={handleCameraCapture}
                disabled={disabled || isUploading}
                className="flex items-center gap-2"
                title="Opens camera for live photo capture"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Open Camera
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="flex items-center gap-2"
                title="Choose existing photo from device"
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="text-xs text-gray-500 space-y-1">
              <p>• <strong>Open Camera:</strong> Live camera preview with capture</p>
              <p>• <strong>Choose File:</strong> Select existing photo from device</p>
              <p>• JPEG, PNG, or WebP format • Max 10MB</p>
              <p>• <strong>Cropping Required:</strong> You'll crop your photo for verification</p>
              <p>• Clear, well-lit photo with visible face recommended</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Photo Cropper Dialog */}
      {selectedFile && (
        <PhotoCropper
          imageFile={selectedFile}
          isOpen={showCropper}
          onClose={handleCropperClose}
          onCropComplete={handleCroppedImage}
          cropAspectRatio={1}
        />
      )}
    </div>
  );
}