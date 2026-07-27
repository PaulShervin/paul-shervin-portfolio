import React, { useState, useRef } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { UploadCloud, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  folder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label,
  folder = 'portfolio'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const uploadFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max size allowed is 5MB.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      if (!storage) {
        throw new Error("Firebase storage service is not initialized. Please check connection config.");
      }

      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error("Firebase Storage Upload Task Error:", error);
          toast.error(`Upload failed: ${error.message || error.code || error}`);
          setIsUploading(false);
          setUploadProgress(null);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onChange(downloadUrl);
            toast.success("Image uploaded successfully!");
          } catch (e: any) {
            console.error("Error retrieving download URL:", e);
            toast.error(`Failed to retrieve image URL: ${e.message || e}`);
          } finally {
            setIsUploading(false);
            setUploadProgress(null);
          }
        }
      );
    } catch (e: any) {
      console.error("Synchronous upload exception:", e);
      toast.error(`Upload initialization failed: ${e.message || e}`);
      setIsUploading(false);
      setUploadProgress(null);
    }
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
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      
      {value ? (
        // Preview State
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
                <p className="text-[10px] font-semibold">Uploading image...</p>
                <Progress value={uploadProgress || 0} className="h-1.5" />
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
              <p className="text-xs font-medium text-foreground">
                Drag & drop or <span className="text-primary hover:underline font-semibold">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Supports JPG, PNG, GIF up to 5MB</p>
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
