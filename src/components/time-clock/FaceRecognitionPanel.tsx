import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FaceRecognitionPanelProps {
  onClose: () => void;
  onSelectEmployee: (id: string) => void;
  onClockAction: (type: 'in' | 'out') => Promise<void> | void;
}

const MAX_WIDTH = 640;
const MAX_HEIGHT = 640;

const FaceRecognitionPanel: React.FC<FaceRecognitionPanelProps> = ({ onClose, onSelectEmployee, onClockAction }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState<'in' | 'out' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const startCamera = async () => {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Camera access error:', error);
        toast({ title: 'Camera error', description: 'Unable to access camera. Check permissions.', variant: 'destructive' });
        onClose();
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [onClose, toast]);

  const captureFrame = (): string | null => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Maintain aspect ratio and constrain size
    let targetW = vw;
    let targetH = vh;
    if (vw > vh && vw > MAX_WIDTH) {
      targetW = MAX_WIDTH;
      targetH = Math.round((vh / vw) * MAX_WIDTH);
    } else if (vh >= vw && vh > MAX_HEIGHT) {
      targetH = MAX_HEIGHT;
      targetW = Math.round((vw / vh) * MAX_HEIGHT);
    }

    canvas.width = targetW;
    canvas.height = targetH;
    ctx.drawImage(video, 0, 0, targetW, targetH);

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handleScan = async (action: 'in' | 'out') => {
    try {
      setIsScanning(action);
      const imageBase64 = captureFrame();
      if (!imageBase64) throw new Error('Failed to capture image');

      const { data, error } = await supabase.functions.invoke('face-verify', {
        body: { imageBase64, action },
      });

      if (error) throw error;

      if (data?.requiresSetup) {
        toast({
          title: 'Face recognition not configured',
          description: 'Add your face API key and enroll employee faces to enable quick clocking.',
        });
        return;
      }

      if (data?.matchedEmployeeId && data?.confidence >= 0.8) {
        onSelectEmployee(data.matchedEmployeeId);
        await onClockAction(action);
        toast({ title: 'Success', description: `Clock ${action === 'in' ? 'in' : 'out'} recorded` });
        onClose();
      } else {
        toast({ title: 'No confident match', description: 'Could not confidently match a face. Try again or use manual mode.', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Face scan error:', err);
      toast({ title: 'Error', description: err?.message || 'Failed to process face scan', variant: 'destructive' });
    } finally {
      setIsScanning(null);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Face Mode</h2>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-full max-w-sm aspect-square rounded-xl overflow-hidden bg-muted">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
          <Button disabled={!!isScanning} onClick={() => handleScan('in')}>
            {isScanning === 'in' ? 'Scanning…' : 'Scan & Clock In'}
          </Button>
          <Button variant="secondary" disabled={!!isScanning} onClick={() => handleScan('out')}>
            {isScanning === 'out' ? 'Scanning…' : 'Scan & Clock Out'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center px-4">
          Lighting matters. Keep the device at eye level. Works best after employees are enrolled with a reference photo.
        </p>
      </div>
    </div>
  );
};

export default FaceRecognitionPanel;
