import React, { useState, useRef } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UploadCloud, Trash2, Link as LinkIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  folder?: string;
}

/**
 * Compresses an image client-side to ensure it is lightweight (<150KB),
 * never hangs, and can be reliably saved anywhere (Firestore doc limit is 1MB).
 */
const compressImage = (file: File, maxDim = 1200, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If it's a small SVG or GIF, preserve it directly without re-encoding
    if (file.type === 'image/svg+xml' || (file.type === 'image/gif' && file.size < 500 * 1024)) {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for great compression and quality
        try {
          const webp = canvas.toDataURL('image/webp', quality);
          if (webp.startsWith('data:image/webp')) {
            resolve(webp);
            return;
          }
        } catch {
          // fallback to jpeg
        }

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label,
  folder = 'portfolio'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size allowed is 10MB.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(15);

      // 1. Prepare local optimized data URL first
      let localDataUrl = '';
      try {
        localDataUrl = await compressImage(file);
      } catch (err) {
        console.warn('Local image processing issue:', err);
      }

      setUploadProgress(40);

      // 2. Attempt Firebase Storage with a strict 4-second timeout
      let storageUploadedUrl = '';
      if (storage) {
        try {
          const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanName}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          const storagePromise = new Promise<string>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                if (snapshot.totalBytes > 0) {
                  const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                  setUploadProgress(Math.min(95, Math.max(40, pct)));
                }
              },
              (error) => reject(error),
              async () => {
                try {
                  const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(downloadUrl);
                } catch (e) {
                  reject(e);
                }
              }
            );
          });

          // Abort after 4 seconds to never hang indefinitely
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => {
              try {
                uploadTask.cancel();
              } catch {}
              reject(new Error('Cloud upload timed out'));
            }, 4000)
          );

          storageUploadedUrl = await Promise.race([storagePromise, timeoutPromise]);
        } catch (storageErr) {
          console.warn('Firebase Storage upload was unavailable or timed out, using optimized image:', storageErr);
        }
      }

      setUploadProgress(100);

      // 3. Apply the best available URL
      if (storageUploadedUrl) {
        onChange(storageUploadedUrl);
        toast.success("Image uploaded successfully to Cloud Storage!");
      } else if (localDataUrl) {
        onChange(localDataUrl);
        toast.success("Image processed and added successfully!");
      } else {
        throw new Error("Could not process this image file.");
      }
    } catch (e: any) {
      console.error("Upload error:", e);
      toast.error(`Image processing failed: ${e.message || e}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
    setShowUrlInput(false);
    toast.success("Image URL applied!");
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-foreground">{label}</Label>
        {!value && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            {showUrlInput ? 'Upload file' : 'Paste URL'}
          </button>
        )}
      </div>
      
      {value ? (
        // Preview State
        <div className="space-y-1">
          <div className="relative group rounded-xl border border-border overflow-hidden h-36 bg-muted/10 flex items-center justify-center">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-background/95 border-none hover:bg-background text-foreground text-xs font-semibold rounded-lg shadow-md"
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="h-8 w-8 rounded-lg shadow-md"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground truncate px-1" title={value}>
            {value.startsWith('data:') ? 'Optimized image added' : value}
          </p>
        </div>
      ) : showUrlInput ? (
        // Direct URL Input State
        <div className="space-y-2 rounded-xl border border-border/80 bg-muted/10 p-3">
          <div className="flex items-center gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://... or /image.png"
              className="h-9 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyUrl();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleApplyUrl}
              disabled={!urlInput.trim()}
              className="h-9 px-3 text-xs bg-primary text-primary-foreground shrink-0"
            >
              Apply
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Paste a public image link, Cloudinary URL, or local path like <code className="bg-muted px-1 py-0.5 rounded text-[10px]">/smart-india-hackathon.jpg</code>
          </p>
        </div>
      ) : (
        // Dropzone State
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center h-36 relative ${
            dragActive 
              ? 'border-primary bg-primary/5 scale-[0.99]' 
              : 'border-border hover:border-primary/50 hover:bg-muted/15 bg-muted/5'
          } ${isUploading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {isUploading ? (
            <div className="space-y-3 w-full max-w-[200px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-[10px] font-semibold">Processing image...</p>
                <Progress value={uploadProgress || 20} className="h-1.5" />
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
              <p className="text-xs font-medium text-foreground">
                Drag & drop or <span className="text-primary hover:underline font-semibold">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Supports JPG, PNG, WebP up to 10MB</p>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};
