import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminIdInputProps {
  userRole: string;
  managerId: string;
  setManagerId: (value: string) => void;
  showGenerateButton?: boolean;
}

export const AdminIdInput = ({ 
  userRole, 
  managerId, 
  setManagerId, 
  showGenerateButton = false 
}: AdminIdInputProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [justCopied, setJustCopied] = useState(false);

  // Validate the Administrator ID format and existence
  useEffect(() => {
    const validateId = async () => {
      if (!managerId || managerId.length < 8) {
        setIsValid(null);
        return;
      }

      setIsValidating(true);
      try {
        const { data: isValid, error } = await supabase.rpc('validate_admin_id', { 
          p_admin_id: managerId 
        });
        
        if (error) {
          setIsValid(false);
        } else {
          setIsValid(isValid);
        }
      } catch (error) {
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    const debounceTimer = setTimeout(validateId, 500);
    return () => clearTimeout(debounceTimer);
  }, [managerId]);

  const generateAdminId = async () => {
    setIsGenerating(true);
    try {
      const { data: newId, error } = await supabase.rpc('generate_admin_id');
      
      if (error) {
        throw new Error("Failed to generate Administrator ID");
      }

      setManagerId(newId);
      setIsValid(true);
      
      // Auto-copy the generated ID
      await copyToClipboard(newId);
      
      toast({
        title: "Success!",
        description: `Administrator ID ${newId} generated and copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate Administrator ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      console.error("Copy failed:", error);
    }
  };

  const isAdmin = userRole === 'admin';
  const needsManagerId = userRole === 'employee' || userRole === 'payroll';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="managerId">
          {isAdmin ? "Your Administrator ID" : "Administrator's ID"}
          {needsManagerId && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="flex items-center gap-2">
          <Input
            id="managerId"
            type="text"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value.toUpperCase())}
            placeholder={isAdmin ? "Generate your Administrator ID" : "Enter ADM-#### or MGR-####"}
            className={`font-mono ${
              isValid === false ? 'border-red-500 focus:border-red-500' : 
              isValid === true ? 'border-green-500 focus:border-green-500' : ''
            }`}
            disabled={isAdmin && !managerId}
          />
          
          {managerId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(managerId)}
              disabled={justCopied}
              className="px-3"
            >
              {justCopied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Validation feedback */}
        <div className="flex items-center gap-1 text-xs">
          {isValidating && (
            <span className="text-muted-foreground">Validating...</span>
          )}
          {!isValidating && isValid === true && (
            <>
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Valid Administrator ID</span>
            </>
          )}
          {!isValidating && isValid === false && managerId && (
            <>
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-red-500">Invalid format (use ADM-#### or MGR-####)</span>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {isAdmin 
            ? "Generate your unique Administrator ID that employees will use to connect to your account" 
            : "Get this ID from your administrator to link your account to their organization"}
        </p>
      </div>

      {/* Generate button for admins */}
      {isAdmin && showGenerateButton && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Generate Administrator ID</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              type="button"
              onClick={generateAdminId}
              disabled={isGenerating}
              className="w-full"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate My Administrator ID
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will create a unique ID that your employees can use during signup or in their profile settings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};