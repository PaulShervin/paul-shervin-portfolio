import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { File, Copy, Trash2, ExternalLink, UploadCloud, Search } from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

const MediaManager: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'media'), orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: MediaFile[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as MediaFile);
      });
      setFiles(list);
    } catch (e) {
      console.error("Error fetching media list:", e);
      toast.error("Failed to load uploaded files list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size allowed is 10MB.");
      return;
    }

    setUploadProgress(15);

    try {
      let finalUrl = '';

      if (storage) {
        try {
          const fileRef = ref(storage, `portfolio/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
          const uploadTask = uploadBytesResumable(fileRef, file);

          const storagePromise = new Promise<string>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                if (snapshot.totalBytes > 0) {
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  setUploadProgress(Math.min(95, Math.max(20, Math.round(progress))));
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

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => {
              try {
                uploadTask.cancel();
              } catch {}
              reject(new Error('Upload timed out'));
            }, 4000)
          );

          finalUrl = await Promise.race([storagePromise, timeoutPromise]);
        } catch (storageErr) {
          console.warn('Storage failed or timed out, reading local file as data URL:', storageErr);
        }
      }

      // If cloud storage was not available or timed out, read as Data URL
      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file locally'));
          reader.readAsDataURL(file);
        });
      }

      // Save record to firestore
      const newMedia = {
        name: file.name,
        url: finalUrl,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'media'), newMedia);
      toast.success("File added successfully!");
      fetchFiles();
    } catch (e: any) {
      console.error("Error saving document:", e);
      toast.error(`Upload error: ${e.message || e}`);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleDelete = async (fileItem: MediaFile) => {
    if (!window.confirm(`Are you sure you want to delete ${fileItem.name}?`)) return;

    try {
      // 1. Delete from Firebase Storage
      const fileRef = ref(storage, fileItem.url);
      await deleteObject(fileRef).catch(err => {
        console.warn("Storage deletion warning/error:", err);
      });

      // 2. Delete reference from Firestore
      await deleteDoc(doc(db, 'media', fileItem.id));
      toast.success("File deleted successfully.");
      fetchFiles();
    } catch (e) {
      console.error("Delete error:", e);
      toast.error("Failed to delete file.");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Media & Asset Manager</h2>
        <CardDescription>Upload image and PDF files to use in projects, certificates, resume, and profile.</CardDescription>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <Card className="border-border/70 shadow-sm h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Upload Assets</CardTitle>
              <CardDescription>Drag & drop or select files (Max 10MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-center pb-6">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors flex flex-col items-center justify-center min-h-[220px] ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 bg-muted/20'
                }`}
              >
                <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">Drag and drop file here</p>
                <p className="text-xs text-muted-foreground mb-4">or</p>
                
                <input
                  type="file"
                  id="media-file-input"
                  className="hidden"
                  onChange={handleFileInput}
                  accept="image/*,application/pdf"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('media-file-input')?.click()}
                  className="border-border/60 hover:bg-muted/40 font-semibold text-xs rounded-xl"
                >
                  Choose File
                </Button>
              </div>

              {/* Progress Bar */}
              {uploadProgress !== null && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2 animate-pulse" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Files Gallery Panel */}
        <div className="lg:col-span-2">
          <Card className="border-border/70 shadow-sm min-h-[400px]">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/40">
              <div>
                <CardTitle className="text-lg font-bold">File Library</CardTitle>
                <CardDescription>Total: {files.length} assets available</CardDescription>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">Loading asset library...</div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <File className="w-10 h-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium">No media assets found</p>
                  <p className="text-xs">Upload some files to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredFiles.map((file) => {
                    const isImage = file.type.startsWith('image/');
                    return (
                      <div 
                        key={file.id} 
                        className="flex flex-col justify-between border border-border/60 rounded-xl p-3 bg-muted/10 hover:bg-muted/20 transition-colors"
                      >
                        {/* File preview */}
                        <div className="flex gap-3">
                          <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-muted/60 flex items-center justify-center border border-border/40">
                            {isImage ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <File className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatBytes(file.size)}
                            </p>
                            <p className="text-[9px] text-muted-foreground/80 mt-1">
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* File actions */}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/40">
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </a>
                          
                          <div className="flex gap-1.5">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              onClick={() => copyToClipboard(file.url)}
                              className="w-7 h-7 rounded-lg border-border/60 hover:bg-muted/40"
                              title="Copy URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDelete(file)}
                              className="w-7 h-7 rounded-lg text-destructive hover:bg-destructive/10"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MediaManager;
