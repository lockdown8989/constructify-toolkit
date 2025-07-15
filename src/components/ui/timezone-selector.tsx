import { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Globe } from 'lucide-react';
import { 
  getTimezoneOptions, 
  getCurrentTimezoneInfo, 
  detectUserTimezone,
  formatTimeInTimezone,
  TimezoneInfo
} from '@/utils/enhanced-timezone-utils';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

interface TimezoneSelectorProps {
  value?: string;
  onChange?: (timezone: string) => void;
  showCurrentTime?: boolean;
  showDetectButton?: boolean;
}

export const TimezoneSelector = ({ 
  value, 
  onChange, 
  showCurrentTime = true,
  showDetectButton = true 
}: TimezoneSelectorProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedTimezone, setSelectedTimezone] = useState<string>(value || '');
  const [currentTimezoneInfo, setCurrentTimezoneInfo] = useState<TimezoneInfo | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  const timezoneOptions = getTimezoneOptions();

  useEffect(() => {
    const info = getCurrentTimezoneInfo();
    setCurrentTimezoneInfo(info);
    if (!value) {
      setSelectedTimezone(info.timezone);
    }
  }, [value]);

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      if (selectedTimezone) {
        const time = formatTimeInTimezone(new Date(), selectedTimezone, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setCurrentTime(time);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [selectedTimezone]);

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    onChange?.(timezone);
  };

  const handleAutoDetect = () => {
    const detected = detectUserTimezone();
    setSelectedTimezone(detected.timezone);
    onChange?.(detected.timezone);
    
    toast({
      title: "Timezone Detected",
      description: `Set to ${detected.name}`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('timezone')} Settings
        </CardTitle>
        <CardDescription>
          Configure your timezone for accurate time display
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Timezone Info */}
        {currentTimezoneInfo && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Current Timezone</p>
                <p className="text-xs text-muted-foreground">
                  {currentTimezoneInfo.name} ({currentTimezoneInfo.offsetString})
                </p>
              </div>
            </div>
            <Badge variant="outline">{currentTimezoneInfo.timezone}</Badge>
          </div>
        )}

        {/* Timezone Selector */}
        <div className="space-y-2">
          <Label htmlFor="timezone-select">Select Timezone</Label>
          <div className="flex gap-2">
            <Select 
              value={selectedTimezone} 
              onValueChange={handleTimezoneChange}
            >
              <SelectTrigger id="timezone-select" className="flex-1">
                <SelectValue placeholder="Choose timezone..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timezoneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {showDetectButton && (
              <Button 
                variant="outline" 
                size="default"
                onClick={handleAutoDetect}
                className="whitespace-nowrap"
              >
                {t('autoDetect')}
              </Button>
            )}
          </div>
        </div>

        {/* Current Time Display */}
        {showCurrentTime && selectedTimezone && (
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Current Time</p>
                <p className="text-xs text-muted-foreground">
                  {timezoneOptions.find(opt => opt.value === selectedTimezone)?.label.split(' (')[0]}
                </p>
              </div>
            </div>
            <Badge variant="default" className="text-lg font-mono">
              {currentTime}
            </Badge>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground">
          <p>
            The selected timezone will be used for displaying all times throughout the application.
            This affects attendance records, schedules, and other time-sensitive data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};