import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Clock, PlayCircle, StopCircle, PauseCircle, Timer } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTimeClock } from '@/hooks/time-clock';

type TimelogEntry = {
  type: 'clock-in' | 'break-start' | 'break-end' | 'clock-out';
  timestamp: Date;
};

type TimelogStatus = 'clocked-out' | 'clocked-in' | 'on-break';

const TimeClockWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { status, setStatus, timelog, setTimelog, currentTime, setCurrentTime, elapsedTime, setElapsedTime, breakTime, setBreakTime } = useTimeClock();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (status === 'clocked-in' || status === 'on-break') {
      const clockInEntry = timelog.find(entry => entry.type === 'clock-in');
      if (clockInEntry) {
        let totalElapsed = differenceInSeconds(currentTime, clockInEntry.timestamp);
        let totalBreak = 0;
        
        for (let i = 0; i < timelog.length; i++) {
          if (timelog[i].type === 'break-start') {
            const breakEndIndex = timelog.findIndex((entry, idx) => idx > i && entry.type === 'break-end');
            if (breakEndIndex !== -1) {
              totalBreak += differenceInSeconds(timelog[breakEndIndex].timestamp, timelog[i].timestamp);
            } else if (status === 'on-break') {
              totalBreak += differenceInSeconds(currentTime, timelog[i].timestamp);
            }
          }
        }
        
        setElapsedTime(totalElapsed - totalBreak);
        setBreakTime(totalBreak);
      }
    }
  }, [status, currentTime, timelog]);
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (status !== 'clocked-out' && timelog.length > 0) {
        const autoClockOutEvent = {
          type: 'auto-clock-out',
          timestamp: new Date(),
          status: status
        };
        localStorage.setItem('pending_clock_out', JSON.stringify(autoClockOutEvent));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [status, timelog]);
  
  useEffect(() => {
    const pendingClockOut = localStorage.getItem('pending_clock_out');
    if (pendingClockOut) {
      try {
        const event = JSON.parse(pendingClockOut);
        if (event.type === 'auto-clock-out' && event.timestamp) {
          const newEntry: TimelogEntry = { 
            type: 'clock-out', 
            timestamp: new Date(event.timestamp) 
          };
          
          if (event.status === 'on-break') {
            setTimelog(prev => [...prev, 
              { type: 'break-end', timestamp: new Date(event.timestamp) },
              newEntry
            ]);
          } else {
            setTimelog(prev => [...prev, newEntry]);
          }
          
          setStatus('clocked-out');
          
          toast({
            title: "Auto Clock-Out",
            description: `You were automatically clocked out at ${format(new Date(event.timestamp), 'h:mm a')} due to session end`,
          });
        }
      } catch (e) {
        console.error('Error processing pending clock out:', e);
      }
      
      localStorage.removeItem('pending_clock_out');
    }
  }, [toast]);
  
  const handleClockIn = async () => {
    if (!user) return;
    
    const newEntry: TimelogEntry = { type: 'clock-in', timestamp: new Date() };
    setTimelog([...timelog, newEntry]);
    setStatus('clocked-in');
    
    toast({
      title: "Clocked In",
      description: `You clocked in at ${format(new Date(), 'h:mm a')}`,
    });
  };
  
  const handleClockOut = async () => {
    if (!user) return;
    
    const newEntry: TimelogEntry = { type: 'clock-out', timestamp: new Date() };
    setTimelog([...timelog, newEntry]);
    setStatus('clocked-out');
    
    toast({
      title: "Clocked Out",
      description: `You clocked out at ${format(new Date(), 'h:mm a')}`,
    });
  };
  
  const handleBreakStart = () => {
    if (!user) return;
    
    setTimelog([...timelog, { type: 'break-start', timestamp: new Date() }]);
    setStatus('on-break');
    
    toast({
      title: "Break Started",
      description: `Your break started at ${format(new Date(), 'h:mm a')}`,
    });
  };
  
  const handleBreakEnd = () => {
    if (!user) return;
    
    setTimelog([...timelog, { type: 'break-end', timestamp: new Date() }]);
    setStatus('clocked-in');
    
    toast({
      title: "Break Ended",
      description: `Your break ended at ${format(new Date(), 'h:mm a')}`,
    });
  };
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-3xl font-mono font-bold">
            {formatDuration(elapsedTime)}
          </div>
          <div className="text-sm text-gray-500">
            Hours Worked
          </div>
          
          {breakTime > 0 && (
            <div className="mt-2 text-sm">
              <span className="text-gray-500">Break time: </span>
              <span className="font-mono">{formatDuration(breakTime)}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-2 mb-4">
          {status === 'clocked-out' && (
            <Button 
              onClick={handleClockIn} 
              className="bg-green-600 hover:bg-green-700"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          )}
          
          {status === 'clocked-in' && (
            <>
              <Button 
                onClick={handleBreakStart} 
                variant="outline"
              >
                <PauseCircle className="h-4 w-4 mr-2" />
                Start Break
              </Button>
              
              <Button 
                onClick={handleClockOut} 
                className="bg-red-600 hover:bg-red-700"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            </>
          )}
          
          {status === 'on-break' && (
            <Button 
              onClick={handleBreakEnd} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Timer className="h-4 w-4 mr-2" />
              End Break
            </Button>
          )}
        </div>
        
        <div className="text-sm text-center text-gray-500">
          {status === 'clocked-in' && 'You are currently clocked in'}
          {status === 'on-break' && 'You are currently on break'}
          {status === 'clocked-out' && 'You are currently clocked out'}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeClockWidget;
