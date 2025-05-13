
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "../useUserRole";

export const useEmployeeCreator = () => {
  const createEmployeeRecord = async (
    userId: string,
    fullName: string,
    userRole: UserRole,
    managerId: string | null
  ) => {
    try {
      // Determine appropriate job title based on role
      let jobTitle = "Employee";
      if (userRole === "manager") {
        jobTitle = "Manager";
      } else if (userRole === "hr") {
        jobTitle = "HR Specialist";
      } else if (userRole === "admin") {
        jobTitle = "Administrator";
      }
      
      // For managers, ensure their own manager ID is set to themselves
      // This is critical for identifying them as managers throughout the system
      const effectiveManagerId = userRole === "manager" ? managerId : managerId;
      
      console.log(`Creating employee record for ${fullName} with role ${userRole}, job title ${jobTitle}, and manager ID ${effectiveManagerId || 'none'}`);

      const { error: insertError } = await supabase.from("employees").insert({
        user_id: userId,
        name: fullName,
        job_title: jobTitle,
        department: userRole === "manager" ? "Management" : "General",
        salary: 0, // Default salary
        manager_id: effectiveManagerId
      });

      if (insertError) {
        console.error("Error creating employee record:", insertError);
        return false;
      }

      console.log(`Successfully created employee record for ${fullName}`);
      return true;
    } catch (error) {
      console.error("Error in createEmployeeRecord:", error);
      return false;
    }
  };

  return { createEmployeeRecord };
};
