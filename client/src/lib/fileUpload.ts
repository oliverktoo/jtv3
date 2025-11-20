import { supabase } from "./supabase";

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage (with fallback to local storage)
 */
export async function uploadFile(
  file: File,
  bucket: string = 'player-photos',
  folder: string = 'selfies'
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    // Check file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomId}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    try {
      // Try Supabase Storage first
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.warn('Supabase upload failed, using fallback:', error.message);
        throw new Error('Storage not available, using fallback');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };

    } catch (storageError) {
      // Fallback: Create a data URL for local use
      console.log('Using fallback file storage (data URL)');
      
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      return {
        success: true,
        url: dataUrl,
        path: `fallback/${fileName}` // Indicate this is a fallback path
      };
    }

  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  filePath: string,
  bucket: string = 'player-photos'
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Capture image from camera using WebRTC (real camera access)
 */
export function captureImageFromCamera(): Promise<File | null> {
  return new Promise(async (resolve) => {
    try {
      // Try to access the camera directly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Front-facing camera for selfies
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Create camera interface
      createCameraInterface(stream, resolve);
      
    } catch (error) {
      console.warn('Camera access failed, falling back to file picker:', error);
      // Fallback to file picker if camera access fails
      fallbackToFilePicker(resolve);
    }
  });
}

/**
 * Create camera interface with video preview and capture button
 */
function createCameraInterface(stream: MediaStream, resolve: (file: File | null) => void) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  // Create video element
  const video = document.createElement('video');
  video.style.cssText = `
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: 12px;
    margin-bottom: 20px;
  `;
  video.autoplay = true;
  video.playsInline = true;
  video.srcObject = stream;
  
  // Create canvas for capture
  const canvas = document.createElement('canvas');
  
  // Create controls container
  const controls = document.createElement('div');
  controls.style.cssText = `
    display: flex;
    gap: 15px;
    align-items: center;
  `;
  
  // Create capture button
  const captureBtn = document.createElement('button');
  captureBtn.textContent = '📷 Take Photo';
  captureBtn.style.cssText = `
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    font-weight: 500;
  `;
  
  // Create cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '❌ Cancel';
  cancelBtn.style.cssText = `
    background: #6b7280;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    font-weight: 500;
  `;
  
  // Add title
  const title = document.createElement('h3');
  title.textContent = 'Take Your Selfie';
  title.style.cssText = `
    color: white;
    margin: 0 0 20px 0;
    font-size: 24px;
    text-align: center;
  `;
  
  // Handle capture
  captureBtn.onclick = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      cleanup();
      if (blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        resolve(file);
      } else {
        resolve(null);
      }
    }, 'image/jpeg', 0.8);
  };
  
  // Handle cancel
  cancelBtn.onclick = () => {
    cleanup();
    resolve(null);
  };
  
  // Handle escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup();
      resolve(null);
    }
  };
  
  const cleanup = () => {
    stream.getTracks().forEach(track => track.stop());
    document.removeEventListener('keydown', handleEscape);
    document.body.removeChild(overlay);
  };
  
  // Assemble interface
  controls.appendChild(captureBtn);
  controls.appendChild(cancelBtn);
  overlay.appendChild(title);
  overlay.appendChild(video);
  overlay.appendChild(controls);
  
  document.addEventListener('keydown', handleEscape);
  document.body.appendChild(overlay);
}

/**
 * Fallback to file picker when camera access fails
 */
function fallbackToFilePicker(resolve: (file: File | null) => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'user';
  
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    resolve(file || null);
  };
  
  input.oncancel = () => resolve(null);
  input.click();
}

/**
 * Resize image to reduce file size
 */
export function resizeImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}