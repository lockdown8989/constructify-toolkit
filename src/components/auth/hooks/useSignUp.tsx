
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type UseSignUpProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
}

export const useSignUp = ({ onSignUp }: UseSignUpProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "hr" | "employee" | "employer">("employee");
  const [managerId, setManagerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Generate a unique manager ID when the form mounts
  useEffect(() => {
    if (userRole === "employer") {
      generateManagerId();
    }
  }, [userRole]);

  // Generate a unique manager ID (format: MGR-XXXXX)
  const generateManagerId = () => {
    const randomPart = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    setManagerId(`MGR-${randomPart}`);
  };

  const handleRoleChange = (value: string) => {
    if (value === "admin" || value === "hr" || value === "employee" || value === "manager") {
      // If "manager" is selected, set userRole to "employer" for database compatibility
      setUserRole(value === "manager" ? "employer" : value as "admin" | "hr" | "employee" | "employer");
      console.log("Role selected:", value, "DB role:", value === "manager" ? "employer" : value);
      
      // Generate a manager ID if the role is manager
      if (value === "manager") {
        generateManagerId();
      } else {
        setManagerId("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log(`Attempting to sign up with role: ${userRole}`);
      
      // First check if an employee with this name already exists
      const fullName = `${firstName} ${lastName}`;
      
      // If no duplicate, proceed with sign up
      const { error } = await onSignUp(email, password, firstName, lastName);
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log(`Got user with ID: ${user.id}, assigning role: ${userRole}`);
          
          // First check if user already has any roles
          const { data: existingRoles, error: roleCheckError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
            
          if (roleCheckError) {
            console.error("Error checking existing roles:", roleCheckError);
            toast({
              title: "Error",
              description: "Could not check user roles: " + roleCheckError.message,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          
          // Check specifically for the role we're trying to add
          const hasRequestedRole = existingRoles?.some(r => r.role === userRole);
          
          if (!hasRequestedRole) {
            // Add the new role (without removing existing roles)
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: user.id, 
                role: userRole 
              });
                
            if (insertError) {
              console.error("Role insertion error:", insertError);
              toast({
                title: "Error",
                description: "Could not assign user role: " + insertError.message,
                variant: "destructive",
              });
              setIsLoading(false);
              return;
            } 
            
            console.log(`Role ${userRole} inserted successfully`);
          } else {
            console.log(`User already has role: ${userRole}, not adding again`);
          }
          
          // Now check if the user already has an employee record
          const { data: existingEmployee, error: employeeCheckError } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', user.id);
            
          if (employeeCheckError) {
            console.error("Error checking existing employee:", employeeCheckError);
            toast({
              title: "Error",
              description: "Could not check existing employee record: " + employeeCheckError.message,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          
          // Create or update employee record based on whether it exists
          if (!existingEmployee || existingEmployee.length === 0) {
            // No existing record, create a new one
            const managerIdToSave = userRole === 'employer' ? managerId : null;
            
            // Only create employee record if the role is employee or employer
            if (userRole === 'employee' || userRole === 'employer') {
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
                  lifecycle: 'Employed',
                  manager_id: managerIdToSave,
                  user_id: user.id // Link the employee record to the user account
                });
                
              if (employeeError) {
                console.error("Error creating employee record:", employeeError);
                toast({
                  title: "Warning",
                  description: "Account created but failed to create employee record: " + employeeError.message,
                  variant: "default",
                });
              }
            }
          } else {
            // Employee record already exists, update it if necessary
            if (userRole === 'employer' && managerId) {
              // Update existing employee to set manager_id
              const { error: updateError } = await supabase
                .from('employees')
                .update({ 
                  manager_id: managerId,
                  job_title: 'Manager'
                })
                .eq('user_id', user.id);
                
              if (updateError) {
                console.error("Error updating employee record:", updateError);
                toast({
                  title: "Warning",
                  description: "Account role updated but failed to update employee record: " + updateError.message,
                  variant: "default",
                });
              }
            }
          }
          
          // Show appropriate success message
          if (userRole === 'employer') {
            toast({
              title: "Success",
              description: `Account created/updated with manager role. Your Manager ID is ${managerId}. Share this with your employees.`,
            });
          } else {
            toast({
              title: "Success", 
              description: `Account created/updated with ${userRole} role.`,
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    userRole,
    managerId,
    setManagerId,
    isLoading,
    handleSubmit,
    handleRoleChange,
    generateManagerId
  };
};
