import React, { useState, useEffect } from "react";
import { useAppearanceSettings } from "@/hooks/use-appearance-settings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, Type, Eye, Zap, Monitor, Moon, Sun } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AppearanceSettings = () => {
  const { settings, updateSettings, isLoading } = useAppearanceSettings();
  const isMobile = useIsMobile();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local settings when settings from hook change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSelectChange = (key: keyof typeof localSettings, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSwitchChange = (key: keyof typeof localSettings) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings(localSettings);
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${isMobile ? 'py-8' : 'py-12'}`}>
        <div className="animate-pulse text-muted-foreground">Loading appearance settings...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className={`space-y-4 ${isMobile ? 'px-4 pt-4' : 'pt-2'}`}>
        {/* Theme Selection */}
        <Card className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-background/40 border shadow-sm`}>
          <div className="space-y-3">
            <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <div className={`flex ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full bg-primary/10`}>
                <Monitor className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              </div>
              <div className="flex-1">
                <Label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Theme
                </Label>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Choose your app theme
                </p>
              </div>
            </div>
            <Select value={localSettings.theme} onValueChange={(value) => handleSelectChange('theme', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
                <SelectItem value="light">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Color Scheme */}
        <Card className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-background/40 border shadow-sm`}>
          <div className="space-y-3">
            <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <div className={`flex ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full bg-primary/10`}>
                <Palette className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              </div>
              <div className="flex-1">
                <Label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Color Scheme
                </Label>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Choose your accent color
                </p>
              </div>
            </div>
            <Select value={localSettings.color_scheme} onValueChange={(value) => handleSelectChange('color_scheme', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Font Size */}
        <Card className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-background/40 border shadow-sm`}>
          <div className="space-y-3">
            <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <div className={`flex ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full bg-primary/10`}>
                <Type className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              </div>
              <div className="flex-1">
                <Label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Font Size
                </Label>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Adjust text size for better readability
                </p>
              </div>
            </div>
            <Select value={localSettings.font_size} onValueChange={(value) => handleSelectChange('font_size', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* High Contrast */}
        <Card className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-background/40 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <div className={`flex ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full bg-primary/10`}>
                <Eye className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              </div>
              <div>
                <Label htmlFor="high_contrast" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  High Contrast
                </Label>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Increase contrast for better visibility
                </p>
              </div>
            </div>
            <Switch
              id="high_contrast"
              checked={localSettings.high_contrast}
              onCheckedChange={() => handleSwitchChange('high_contrast')}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </Card>

        {/* Reduced Motion */}
        <Card className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-background/40 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <div className={`flex ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full bg-primary/10`}>
                <Zap className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              </div>
              <div>
                <Label htmlFor="reduced_motion" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Reduced Motion
                </Label>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Minimize animations and transitions
                </p>
              </div>
            </div>
            <Switch
              id="reduced_motion"
              checked={localSettings.reduced_motion}
              onCheckedChange={() => handleSwitchChange('reduced_motion')}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </Card>

        {/* Compact Mode */}
        <Card className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-background/40 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <div className={`flex ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full bg-primary/10`}>
                <Monitor className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              </div>
              <div>
                <Label htmlFor="compact_mode" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Compact Mode
                </Label>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Use more space-efficient layouts
                </p>
              </div>
            </div>
            <Switch
              id="compact_mode"
              checked={localSettings.compact_mode}
              onCheckedChange={() => handleSwitchChange('compact_mode')}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </Card>
      </CardContent>
      
      <CardFooter className={`${isMobile ? 'px-4 pb-4' : 'pb-6'}`}>
        <Button 
          type="submit" 
          disabled={isSaving} 
          className={`w-full rounded-xl ${isMobile ? 'py-4' : 'py-6'}`}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </form>
  );
};