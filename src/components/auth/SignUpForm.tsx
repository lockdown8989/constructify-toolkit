
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SignUpFormProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
};

export const SignUpForm = ({ onSignUp }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "hr" | "employee" | "employer">("employee");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log(`Attempting to sign up with role: ${userRole}`);
      
      // First check if an employee with this name already exists
      const fullName = `${firstName} ${lastName}`;
      const { data: existingEmployees, error: checkError } = await supabase
        .from('employees')
        .select('id')
        .eq('name', fullName);
        
      if (checkError) {
        console.error("Error checking existing employees:", checkError);
        throw checkError;
      }
      
      if (existingEmployees && existingEmployees.length > 0) {
        toast({
          title: "Error",
          description: `An employee with the name "${fullName}" already exists.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // If no duplicate, proceed with sign up
      const { error } = await onSignUp(email, password, firstName, lastName);
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log(`Got user with ID: ${user.id}, assigning role: ${userRole}`);
          
          // First delete any existing roles for this user to avoid duplicates
          const { error: deleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', user.id);
            
          if (deleteError) {
            console.error("Error deleting existing roles:", deleteError);
          }
          
          // Now insert the new role
          const { data: insertData, error: insertError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: user.id, 
              role: userRole 
            })
            .select();
              
          if (insertError) {
            console.error("Role insertion error:", insertError);
            toast({
              title: "Error",
              description: "Could not assign user role: " + insertError.message,
              variant: "destructive",
            });
          } else {
            console.log("Role inserted successfully:", insertData);
            
            // Create employee record if it doesn't exist and if the role is employee or employer
            if (userRole === 'employee' || userRole === 'employer') {
              // Check again if an employee record with this name already exists
              // This is a double-check to prevent race conditions
              const { data: checkAgain, error: checkAgainError } = await supabase
                .from('employees')
                .select('id')
                .eq('name', fullName);
                
              if (checkAgainError) {
                console.error("Error double-checking employee existence:", checkAgainError);
              }
              
              // Only create employee if doesn't exist
              if (!checkAgain || checkAgain.length === 0) {
                const { error: employeeError } = await supabase
                  .from('employees')
                  .insert({
                    name: fullName,
                    job_title: userRole === 'employer' ? 'Manager' : 'Employee',
                    department: 'General',
                    site: 'Main Office',
                    salary: 0, // Default salary, to be updated later
                    start_date: new Date().toISOString().split('T')[0],
                    status: 'Active',
                    lifecycle: 'Employed'
                  });
                  
                if (employeeError) {
                  console.error("Error creating employee record:", employeeError);
                  toast({
                    title: "Warning",
                    description: "Account created but failed to create employee record: " + employeeError.message,
                    variant: "destructive",
                  });
                }
              } else {
                toast({
                  title: "Note",
                  description: `Employee record for "${fullName}" already exists. No new record created.`,
                  variant: "default",
                });
              }
            }
            
            toast({
              title: "Success",
              description: `Account created with ${userRole === 'employer' ? 'manager' : userRole} role.`,
            });
          }
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (value: string) => {
    if (value === "admin" || value === "hr" || value === "employee" || value === "manager") {
      // If "manager" is selected, set userRole to "employer" for database compatibility
      setUserRole(value === "manager" ? "employer" : value as "admin" | "hr" | "employee" | "employer");
      console.log("Role selected:", value, "DB role:", value === "manager" ? "employer" : value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email-signup">Email</Label>
            <Input
              id="email-signup"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>
            <Input
              id="password-signup"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
          </div>
          
          <div className="space-y-3">
            <Label>Account Type</Label>
            <div className="flex flex-wrap gap-4">
              <div 
                className={`flex items-center border rounded-md px-4 py-2 cursor-pointer transition-colors ${userRole === "employee" ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-accent hover:text-accent-foreground"}`}
                onClick={() => handleRoleChange("employee")}
              >
                <div className={`h-4 w-4 rounded-full border mr-2 flex items-center justify-center ${userRole === "employee" ? "border-primary-foreground" : "border-primary"}`}>
                  {userRole === "employee" && (
                    <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
                  )}
                </div>
                <Label htmlFor="employee" className="cursor-pointer">Employee</Label>
              </div>
              
              <div 
                className={`flex items-center border rounded-md px-4 py-2 cursor-pointer transition-colors ${userRole === "employer" ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-accent hover:text-accent-foreground"}`}
                onClick={() => handleRoleChange("manager")}
              >
                <div className={`h-4 w-4 rounded-full border mr-2 flex items-center justify-center ${userRole === "employer" ? "border-primary-foreground" : "border-primary"}`}>
                  {userRole === "employer" && (
                    <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
                  )}
                </div>
                <Label htmlFor="manager" className="cursor-pointer">Manager</Label>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
