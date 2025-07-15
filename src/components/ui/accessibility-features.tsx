import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { 
  Eye, 
  Keyboard, 
  Volume2, 
  MousePointer, 
  Contrast,
  Focus,
  ChevronDown
} from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  focusIndicators: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

export const AccessibilityFeatures = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    focusIndicators: true,
    reducedMotion: false,
    largeText: false,
    screenReaderMode: false,
    keyboardNavigation: true,
  });

  // Load accessibility settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage and apply CSS classes
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    const root = document.documentElement;
    
    // Apply accessibility classes
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('focus-indicators', settings.focusIndicators);
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    root.classList.toggle('large-text', settings.largeText);
    root.classList.toggle('screen-reader-mode', settings.screenReaderMode);
    
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const accessibilityOptions = [
    {
      id: 'highContrast',
      label: t('high_contrast'),
      description: 'Increase color contrast for better visibility',
      icon: Contrast,
      value: settings.highContrast,
    },
    {
      id: 'focusIndicators',
      label: t('focus_indicators'),
      description: 'Show visible focus indicators for keyboard navigation',
      icon: Focus,
      value: settings.focusIndicators,
    },
    {
      id: 'reducedMotion',
      label: 'Reduced Motion',
      description: 'Reduce animations and transitions',
      icon: MousePointer,
      value: settings.reducedMotion,
    },
    {
      id: 'largeText',
      label: 'Large Text',
      description: 'Increase text size throughout the application',
      icon: Eye,
      value: settings.largeText,
    },
    {
      id: 'screenReaderMode',
      label: t('screen_reader'),
      description: 'Optimize interface for screen readers',
      icon: Volume2,
      value: settings.screenReaderMode,
    },
    {
      id: 'keyboardNavigation',
      label: t('keyboard_shortcuts'),
      description: 'Enable enhanced keyboard navigation',
      icon: Keyboard,
      value: settings.keyboardNavigation,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          {t('accessibility')}
        </CardTitle>
        <CardDescription>
          Configure accessibility features to improve your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Accessibility Options */}
        <div className="space-y-4">
          {accessibilityOptions.map((option) => (
            <div key={option.id} className="flex items-start justify-between space-x-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <option.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label 
                    htmlFor={option.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
              <Switch
                id={option.id}
                checked={option.value}
                onCheckedChange={(checked) => 
                  updateSetting(option.id as keyof AccessibilitySettings, checked)
                }
                aria-describedby={`${option.id}-description`}
              />
            </div>
          ))}
        </div>

        {/* Keyboard Shortcuts Info */}
        {settings.keyboardNavigation && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              {t('keyboard_shortcuts')}
            </h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Navigate:</span>
                <code className="bg-background px-1 rounded">Tab / Shift + Tab</code>
              </div>
              <div className="flex justify-between">
                <span>Activate:</span>
                <code className="bg-background px-1 rounded">Enter / Space</code>
              </div>
              <div className="flex justify-between">
                <span>Close Modal:</span>
                <code className="bg-background px-1 rounded">Escape</code>
              </div>
              <div className="flex justify-between">
                <span>Search:</span>
                <code className="bg-background px-1 rounded">Ctrl / Cmd + K</code>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};