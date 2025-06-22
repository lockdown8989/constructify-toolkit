
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
  onUploadClick: () => void;
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
  onUploadClick,
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

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

  // Mobile-friendly touch handlers
  const handleTouchStart = () => {
    if (!disabled && !isUploading) {
      setIsTouched(true);
    }
  };

  const handleTouchEnd = () => {
    setIsTouched(false);
  };

  // Handle single tap/click for mobile
  const handleClick = (e: React.MouseEvent) => {
    // Prevent the context menu trigger on mobile single tap
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) {
        onUploadClick();
      }
    }
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full border-2 border-dashed transition-all duration-200 touch-target ${
        isDragOver 
          ? 'border-primary bg-primary/5 scale-105' 
          : isTouched 
          ? 'border-primary/50 bg-primary/5 scale-98' 
          : 'border-gray-300'
      } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <Avatar className={`${sizeClasses[size]} transition-transform duration-200 ${isTouched ? 'scale-95' : ''}`}>
        <AvatarImage 
          src={currentAvatarUrl || undefined} 
          alt="Profile" 
          className="object-cover"
        />
        <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
          {userInitials}
        </AvatarFallback>
      </Avatar>
      
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      )}
      
      {!disabled && !isUploading && (
        <div className={`absolute inset-0 bg-black/0 hover:bg-black/20 rounded-full flex items-center justify-center transition-all duration-200 group ${
          window.innerWidth <= 768 ? 'md:hidden' : ''
        }`}>
          <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      )}

      {/* Mobile upload indicator */}
      {!disabled && !isUploading && window.innerWidth <= 768 && (
        <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-lg md:hidden">
          <Camera className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {children}
    </div>
  );
};
