
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
          
          // First check if a role already exists for this user
          const { data: existingRoles, error: roleCheckError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', userRole);
            
          if (roleCheckError) {
            console.error("Error checking existing roles:", roleCheckError);
          }
          
          if (!existingRoles || existingRoles.length === 0) {
            // Delete any existing roles for this user to avoid duplicates
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
              
              // Create employee record with manager ID if role is employer
              const managerIdToSave = userRole === 'employer' ? managerId : null;
              
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
                } else {
                  toast({
                    title: "Note",
                    description: `Employee record for "${fullName}" already exists. No new record created.`,
                    variant: "default",
                  });
                }
              }
              
              if (userRole === 'employer') {
                toast({
                  title: "Success",
                  description: `Account created with manager role. Your Manager ID is ${managerId}. Share this with your employees.`,
                });
              } else {
                toast({
                  title: "Success", 
                  description: `Account created with ${userRole} role.`,
                });
              }
            }
          } else {
            console.log("User already has this role, no need to insert:", existingRoles);
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
