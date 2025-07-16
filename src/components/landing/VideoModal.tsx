
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-auto p-0 bg-black/95 border border-white/20">
        <DialogHeader className="sr-only">
          <DialogTitle>Product Demo Video</DialogTitle>
          <DialogDescription>
            Watch our product demonstration video
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full aspect-video">
          {/* Video placeholder - replace with actual video URL */}
          <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-0 h-0 border-l-8 border-r-0 border-t-6 border-b-6 border-l-white border-t-transparent border-b-transparent ml-1"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Demo Video</h3>
                <p className="text-gray-300">See how TeamPulse transforms workforce management</p>
              </div>
            </div>
          </div>
          
          {/* You can replace the above div with an actual video element like this:
          <video 
            className="w-full h-full object-cover"
            controls
            autoPlay
            poster="/path/to/poster-image.jpg"
          >
            <source src="/path/to/demo-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          */}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* Video controls/info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <h4 className="text-white font-semibold mb-2">TeamPulse Demo</h4>
          <p className="text-gray-300 text-sm">
            Discover how our platform streamlines employee scheduling, attendance tracking, and workforce management.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
