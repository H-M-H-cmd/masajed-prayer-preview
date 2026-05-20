"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, X, Loader2, Upload, Camera } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/providers/language-provider";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: File[]) => void;
  value: (File | string)[];
  maxFiles?: number;
  maxSize?: number; // in MB
  onDelete?: (url: string) => Promise<void>;
  onRemove?: (url: string) => void;
}

interface UploadingState {
  [key: string]: boolean;
}

interface DeletingState {
  [key: string]: boolean;
}

// Define proper types for motion components
const MotionDiv = motion.div;

export function ImageUpload({
  disabled,
  onChange,
  value,
  maxFiles = 3,
  maxSize = 5,
  onDelete,
  onRemove
}: ImageUploadProps) {
  const { t, language } = useLanguage();
  const [uploadingStates, setUploadingStates] = React.useState<UploadingState>({});
  const [deletingStates, setDeletingStates] = React.useState<DeletingState>({});
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [newUploads, setNewUploads] = React.useState<Set<string>>(new Set());
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Add a ref to store object URLs
  const objectUrls = React.useRef<Map<string, string>>(new Map());

  // Function to get or create object URL
  const getObjectUrl = React.useCallback((file: File) => {
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
    if (!objectUrls.current.has(fileKey)) {
      const url = URL.createObjectURL(file);
      objectUrls.current.set(fileKey, url);
    }
    return objectUrls.current.get(fileKey);
  }, []);

  // Clean up object URLs on unmount
  React.useEffect(() => {
    const currentUrls = new Map(objectUrls.current);
    return () => {
      currentUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const isUploading = React.useMemo(() => 
    Object.values(uploadingStates).some(state => state), 
    [uploadingStates]
  );

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploadProgress(0);

    try {
      // Create unique IDs for new files
      const newFiles = acceptedFiles.map(file => {
        const id = `${file.name}-${Date.now()}`;
        setUploadingStates(prev => ({ ...prev, [id]: true }));
        setNewUploads(prev => new Set(prev).add(id));
        return { file, id };
      });

      // Get existing files from value that are File objects
      const existingFiles = value.filter((item): item is File => item instanceof File);
      
      // Add new files
      onChange([...existingFiles, ...acceptedFiles].slice(0, maxFiles));

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      // Simulate processing delay for large files
      const delay = Math.max(1000, Math.floor(acceptedFiles.reduce((acc, file) => acc + file.size / 1000000, 0) * 500));
      await new Promise(resolve => setTimeout(resolve, delay));

      clearInterval(interval);
      setUploadProgress(100);

      // Clear states after upload completion
      setTimeout(() => {
        newFiles.forEach(({ id }) => {
          setUploadingStates(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
          });
          setNewUploads(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        });
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.uploadError'));
    }
  }, [value, onChange, maxFiles, t]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: maxFiles - value.length,
    disabled: disabled || isUploading || value.length >= maxFiles,
    maxSize: maxSize * 1024 * 1024
  });

  const handleRemove = React.useCallback(async (item: string | File) => {
    const id = item instanceof File ? item.name : item;
    
    setDeletingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      // If it's a string URL
      if (typeof item === 'string') {
      // Call onDelete if provided
      if (onDelete) {
        await onDelete(item);
      }
      // Call onRemove if provided
      onRemove?.(item);
      }

      // Filter out the removed item and only keep File objects for onChange
      const newValue = value.filter(v => v !== item);
      const filesOnly = newValue.filter((item): item is File => item instanceof File);
      onChange(filesOnly);
      
      // Clean up object URL if it's a File
      if (item instanceof File) {
        const fileKey = `${item.name}-${item.size}-${item.lastModified}`;
        const objectUrl = objectUrls.current.get(fileKey);
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrls.current.delete(fileKey);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setDeletingStates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  }, [onChange, value, onDelete, onRemove]);

  // Modified animation variants
  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
    },
    show: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    removing: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    uploading: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Upload Button */}
      {isMobile ? (
        <MotionDiv
          className="w-full"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div
            {...getRootProps()}
            className={cn(
              "w-full h-20 flex flex-col items-center justify-center gap-2",
              "border-2 border-dashed rounded-lg",
              "hover:bg-muted/50",
              isDragActive && !isDragReject && "border-primary/50 bg-muted/50",
              isDragReject && "border-destructive/50 bg-destructive/10",
              error && "border-destructive/50",
              (disabled || value.length >= maxFiles) && "pointer-events-none opacity-60",
              "cursor-pointer"
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <Progress value={uploadProgress} className="h-1 w-24" />
              </div>
            ) : (
              <>
                <Camera className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">
                  {value.length === 0 
                    ? t('common.dragAndDrop')
                    : `${value.length}/${maxFiles} ${t('common.maxFiles').replace('%{count}', maxFiles.toString())}`
                  }
                </span>
              </>
            )}
          </div>
        </MotionDiv>
      ) : (
        // Desktop Drop Zone
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors",
            "hover:border-primary/50 hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragActive && !isDragReject && "border-primary/50 bg-muted/50",
            isDragReject && "border-destructive/50 bg-destructive/10",
            error && "border-destructive/50",
            (disabled || value.length >= maxFiles) && "pointer-events-none opacity-60",
            "cursor-pointer"
          )}
        >
          <input {...getInputProps()} />
          <motion.div 
            className={cn(
              "flex flex-col items-center gap-3 text-muted-foreground",
              // language === 'ar' && "flex-row-reverse"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isUploading ? (
              <motion.div 
                className="w-full space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Upload className="h-8 w-8 mx-auto animate-bounce" />
                <div className="w-full max-w-xs space-y-2 mx-auto">
                  <Progress value={uploadProgress} className="h-1" />
                  <p className="text-sm text-center">{t('common.uploading')}</p>
                </div>
              </motion.div>
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <div className="space-y-1 text-center">
                  <p>{t('common.dragAndDrop')}</p>
                  <p className="text-sm">
                    {t('common.orBrowse')}
                  </p>
                  {maxFiles > 0 && (
                    <p className="text-xs">
                      {t('common.maxFiles').replace('%{count}', maxFiles.toString())}
                    </p>
                  )}
                  <p className="text-xs">
                    Max size: {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {error && (
          <MotionDiv 
            className="text-sm text-destructive text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Preview Grid */}
      <MotionDiv 
        className={cn(
          "grid gap-4",
          value.length === 1 ? "grid-cols-1 md:grid-cols-2" : 
          value.length === 2 ? "grid-cols-2 md:grid-cols-3" : 
          "grid-cols-2 md:grid-cols-4",
          "relative",
          // Add max width for desktop to prevent too large images
          "md:max-w-4xl mx-auto"
        )}
        variants={gridVariants}
        initial={false}
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {value.map((url, index) => {
            const id = typeof url === 'string' ? url : `${url.name}-${index}`;
            const isUploading = uploadingStates[id];
            const isDeleting = deletingStates[id];
            const isNewUpload = newUploads.has(id);

            return (
              <MotionDiv
                key={id}
                className={cn(
                  "group relative aspect-square rounded-lg overflow-hidden",
                  "bg-muted/50",
                  "md:max-h-[200px]", // Limit height on desktop
                  (isUploading || isDeleting) && "pointer-events-none"
                )}
                variants={itemVariants}
                initial={isNewUpload ? "hidden" : false}
                animate={
                  isDeleting 
                    ? "removing" 
                    : isUploading 
                      ? "uploading" 
                      : "show"
                }
                exit="removing"
                layoutId={id}
                layout="position"
              >
                {/* Remove Button */}
                <AnimatePresence>
                  {!isUploading && !isDeleting && (
                    <motion.div 
                      className={cn(
                        "absolute top-1 z-10",
                        language === 'ar' ? "left-1" : "right-1"
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full shadow-lg"
                        onClick={() => handleRemove(url)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Image Preview */}
                <motion.div 
                  className="relative h-full w-full"
                  whileHover={!isMobile && !isUploading && !isDeleting ? {
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  } : undefined}
                >
                  <Image
                    fill
                    className={cn(
                      "object-cover transition-all duration-300",
                      (isUploading || isDeleting) && "scale-105 blur-sm"
                    )}
                    alt={t('common.preview')}
                    src={typeof url === 'string' ? url : getObjectUrl(url) || ''}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    priority={index < 4}
                  />
                  
                  {/* Loading Overlay */}
                  <AnimatePresence>
                    {(isUploading || isDeleting) && (
                      <motion.div
                        className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="w-3/4 space-y-2">
                          {isUploading ? (
                            <>
                              <Progress value={uploadProgress} className="h-1" />
                              <p className="text-xs text-center text-muted-foreground">
                                {uploadProgress}%
                              </p>
                            </>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <p className="text-xs text-muted-foreground">
                                {t('common.remove')}...
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* File Name Overlay */}
                {!isUploading && url instanceof File && !isMobile && (
                  <motion.div 
                    className={cn(
                      "absolute bottom-0 inset-x-0",
                      "bg-background/80 backdrop-blur-sm",
                      "p-2 text-xs truncate text-center"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{
                      y: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                  >
                    {url.name}
                  </motion.div>
                )}
              </MotionDiv>
            );
          })}
        </AnimatePresence>
      </MotionDiv>
    </div>
  );
} 