
import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarUrl,
  firstName,
  lastName,
  size = 'md',
  onClick,
  className
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm', 
    lg: 'h-12 w-12 text-base'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return '';
  };

  const isGradientClass = avatarUrl && (
    avatarUrl.startsWith('bg-gradient-') || 
    avatarUrl.includes('gradient')
  );

  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center font-semibold transition-all",
        sizeClasses[size],
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      onClick={onClick}
    >
      {avatarUrl && !isGradientClass ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="h-full w-full rounded-full object-cover"
        />
      ) : isGradientClass ? (
        <div className={cn("h-full w-full rounded-full flex items-center justify-center", avatarUrl)}>
          <span className="text-white font-semibold text-shadow">
            {getInitials() || <User className={cn("text-white", iconSizes[size])} />}
          </span>
        </div>
      ) : (
        <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
          {getInitials() ? (
            <span className="text-muted-foreground font-semibold">
              {getInitials()}
            </span>
          ) : (
            <User className={cn("text-muted-foreground", iconSizes[size])} />
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;
