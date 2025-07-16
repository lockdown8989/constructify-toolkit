
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Users } from 'lucide-react';
import { useGeminiShiftAssistant } from '@/hooks/use-gemini-shift-assistant';
import { useCreateShiftPattern } from '@/hooks/use-shift-patterns';
import { useEmployees } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';

const AIPatternGenerator = () => {
  const [businessType, setBusinessType] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [requirements, setRequirements] = useState('');
  
  const { generatePattern, isLoading } = useGeminiShiftAssistant();
  const createPattern = useCreateShiftPattern();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
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
      // Prepare employee data for Gemini
      const employeeData = employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        job_title: emp.job_title,
        department: emp.department,
        status: emp.status,
        availability: {
          monday: emp.monday_available ? `${emp.monday_start_time}-${emp.monday_end_time}` : 'Not available',
          tuesday: emp.tuesday_available ? `${emp.tuesday_start_time}-${emp.tuesday_end_time}` : 'Not available',
          wednesday: emp.wednesday_available ? `${emp.wednesday_start_time}-${emp.wednesday_end_time}` : 'Not available',
          thursday: emp.thursday_available ? `${emp.thursday_start_time}-${emp.thursday_end_time}` : 'Not available',
          friday: emp.friday_available ? `${emp.friday_start_time}-${emp.friday_end_time}` : 'Not available',
          saturday: emp.saturday_available ? `${emp.saturday_start_time}-${emp.saturday_end_time}` : 'Not available',
          sunday: emp.sunday_available ? `${emp.sunday_start_time}-${emp.sunday_end_time}` : 'Not available'
        }
      }));

      console.log('Sending employee data to Gemini:', employeeData);

      const response = await generatePattern({
        businessType,
        operatingHours,
        teamSize,
        requirements,
        employees: employeeData,
        totalEmployees: employees.length,
        activeDepartments: [...new Set(employees.map(emp => emp.department))],
        activeEmployees: employees.filter(emp => emp.status === 'Active').length
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
            days_of_week: aiSuggestion.days_of_week || [1, 2, 3, 4, 5], // Monday to Friday by default
            requirements: aiSuggestion.requirements || {},
            role: aiSuggestion.role || null,
            location: aiSuggestion.location || null
          });

          toast({
            title: "AI Pattern Generated",
            description: "A new shift pattern has been created based on AI recommendations using current employee data.",
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
          <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
            <Users className="h-4 w-4" />
            {employeesLoading ? 'Loading...' : `${employees.length} employees`}
          </div>
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
            placeholder={`e.g., ${employees.length} employees (current team size)`}
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

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            AI will consider your current team:
          </p>
          <ul className="mt-2 space-y-1">
            <li>• {employees.filter(emp => emp.status === 'Active').length} active employees</li>
            <li>• {[...new Set(employees.map(emp => emp.department))].length} departments</li>
            <li>• Individual availability patterns</li>
          </ul>
        </div>

        <Button 
          onClick={handleGeneratePattern} 
          disabled={isLoading || createPattern.isPending || employeesLoading}
          className="w-full"
        >
          {isLoading || createPattern.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating AI Pattern with Employee Data...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Pattern with Current Team
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIPatternGenerator;
