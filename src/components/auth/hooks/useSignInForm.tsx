
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SignInFormProps = {
  onSignIn: (email: string, password: string) => Promise<any>;
};

export const useSignInForm = ({ onSignIn }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { error } = await onSignIn(email, password);
      
      if (error) {
        console.error("Sign in error:", error);
        setErrorMessage(error.message || "Invalid login credentials");
        return;
      }
      
      // If no error, get the user's role
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
          
          // Check if user has manager/employer role
          const isManager = roleData.some(r => r.role === 'employer');
          const roles = roleData.map(r => r.role).join(', ');
          
          if (isManager) {
            // Fetch manager ID 
            const { data: employeeData, error: employeeError } = await supabase
              .from('employees')
              .select('manager_id')
              .eq('user_id', user.id)
              .single();
              
            if (employeeError && employeeError.code !== 'PGRST116') {
              console.error("Error fetching manager ID:", employeeError);
              toast({
                title: "Success",
                description: `Signed in with roles: ${roles}`,
              });
            } else if (employeeData && employeeData.manager_id) {
              toast({
                title: "Success",
                description: `Signed in with roles: ${roles}. Your Manager ID is ${employeeData.manager_id}`,
              });
            } else {
              toast({
                title: "Success",
                description: `Signed in with roles: ${roles}`,
              });
            }
          } else {
            toast({
              title: "Success",
              description: `Signed in with roles: ${roles}`,
            });
          }
        } else {
          console.log("No role data found");
          toast({
            title: "Success",
            description: "Signed in successfully",
          });
        }
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMessage("An unexpected error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    errorMessage,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  };
};
