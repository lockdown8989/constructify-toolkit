
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SignInFormProps = {
  onSignIn: (email: string, password: string) => Promise<any>;
  onForgotPassword: () => void;
};

export const SignInForm = ({ onSignIn, onForgotPassword }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await onSignIn(email, password);
      if (!error) {
        // Get the user's role
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Fetching role for user:", user.id);
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
            
          if (roleError) {
            console.error("Error fetching role:", roleError);
            toast({
              title: "Success",
              description: "Signed in successfully",
            });
          } else if (roleData && roleData.length > 0) {
            console.log("Role data:", roleData);
            const userRole = roleData[0].role.toString().toLowerCase();
            toast({
              title: "Success",
              description: `Signed in as ${userRole}`,
            });
          } else {
            console.log("No role data found");
            toast({
              title: "Success",
              description: "Signed in successfully",
            });
          }
        }
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="text-right">
            <button 
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
