
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarDisplayProps {
  currentAvatarUrl?: string | null;
  userInitials: string;
  size: 'sm' | 'md' | 'lg';
  disabled: boolean;
  isUploading: boolean;
  onFileSelect: (file: File) => void;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32'
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  currentAvatarUrl,
  userInitials,
  size,
  disabled,
  isUploading,
  onFileSelect,
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full border-2 border-dashed ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
      } transition-colors cursor-pointer`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Avatar className={`${sizeClasses[size]} cursor-pointer`}>
        <AvatarImage src={currentAvatarUrl || undefined} alt="Profile" />
        <AvatarFallback className="text-lg font-semibold">
          {userInitials}
        </AvatarFallback>
      </Avatar>
      
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      )}
      
      {!disabled && !isUploading && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors group">
          <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {children}
    </div>
  );
};
