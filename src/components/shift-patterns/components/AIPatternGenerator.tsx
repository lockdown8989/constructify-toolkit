
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { useGeminiShiftAssistant } from '@/hooks/use-gemini-shift-assistant';
import { useCreateShiftPattern } from '@/hooks/use-shift-patterns';
import { useToast } from '@/hooks/use-toast';

const AIPatternGenerator = () => {
  const [businessType, setBusinessType] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [requirements, setRequirements] = useState('');
  
  const { generatePattern, isLoading } = useGeminiShiftAssistant();
  const createPattern = useCreateShiftPattern();
  const { toast } = useToast();

  const handleGeneratePattern = async () => {
    if (!businessType || !operatingHours) {
      toast({
        title: "Missing Information",
        description: "Please fill in business type and operating hours.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await generatePattern({
        businessType,
        operatingHours,
        teamSize,
        requirements
      });

      if (response.success && response.result) {
        try {
          // Try to parse JSON response from Gemini
          const aiSuggestion = JSON.parse(response.result);
          
          // Create the pattern using the AI suggestion
          await createPattern.mutateAsync({
            name: aiSuggestion.name || `AI Generated - ${businessType}`,
            start_time: aiSuggestion.start_time || '09:00:00',
            end_time: aiSuggestion.end_time || '17:00:00',
            break_duration: aiSuggestion.break_duration || 30,
            grace_period_minutes: aiSuggestion.grace_period_minutes || 5,
            overtime_threshold_minutes: aiSuggestion.overtime_threshold_minutes || 480
          });

          toast({
            title: "AI Pattern Generated",
            description: "A new shift pattern has been created based on AI recommendations.",
          });

          // Clear form
          setBusinessType('');
          setOperatingHours('');
          setTeamSize('');
          setRequirements('');
          
        } catch (parseError) {
          // If JSON parsing fails, show the AI response as text
          toast({
            title: "AI Recommendation",
            description: response.result,
          });
        }
      }
    } catch (error) {
      console.error('Error generating AI pattern:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Pattern Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="business-type">Business Type</Label>
          <Select value={businessType} onValueChange={setBusinessType}>
            <SelectTrigger>
              <SelectValue placeholder="Select your business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="retail">Retail Store</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="office">Office/Corporate</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="operating-hours">Operating Hours</Label>
          <Input
            id="operating-hours"
            placeholder="e.g., 8:00 AM - 10:00 PM"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="team-size">Team Size (optional)</Label>
          <Input
            id="team-size"
            placeholder="e.g., 15 employees"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="requirements">Special Requirements (optional)</Label>
          <Textarea
            id="requirements"
            placeholder="e.g., need coverage during lunch hours, peak times are 12-2 PM..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleGeneratePattern} 
          disabled={isLoading || createPattern.isPending}
          className="w-full"
        >
          {isLoading || createPattern.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating AI Pattern...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Pattern
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIPatternGenerator;
