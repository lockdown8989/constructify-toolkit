
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useRoles = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isPayroll, setIsPayroll] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  // Automatically fetch roles when user changes
  useEffect(() => {
    if (user) {
      fetchUserRoles(user.id);
    } else {
      resetRoles();
    }
  }, [user?.id]);

  const fetchUserRoles = async (userId: string) => {
    try {
      console.log("🔄 Fetching roles for user:", userId);
      
      // First check user_roles table
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('❌ Error fetching user roles:', rolesError);
      }

      // Also check employee record for role backup
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('role, job_title')
        .eq('user_id', userId)
        .maybeSingle();

      if (employeeError) {
        console.error('❌ Error fetching employee data:', employeeError);
      }

      console.log("📊 Role data:", { roles, employeeData });

      // Combine roles from both sources
      const userRoles = roles ? roles.map(r => r.role) : [];
      const employeeRole = employeeData?.role;

      // Add employee role if it exists and isn't already in user roles
      if (employeeRole && !userRoles.includes(employeeRole)) {
        userRoles.push(employeeRole);
      }

      console.log("🎭 Combined user roles:", userRoles);
      
      if (userRoles.length > 0) {
        // Check each role with explicit logging
        const hasAdminRole = userRoles.includes('admin');
        const hasHRRole = userRoles.includes('hr');
        const hasEmployerRole = userRoles.includes('employer');
        const hasPayrollRole = userRoles.includes('payroll');
        const hasEmployeeRole = userRoles.includes('employee');
        
        console.log("✅ Role checks:", {
          admin: hasAdminRole,
          hr: hasHRRole,
          manager: hasEmployerRole,
          payroll: hasPayrollRole,
          employee: hasEmployeeRole,
          jobTitle: employeeData?.job_title
        });
        
        setIsAdmin(hasAdminRole);
        setIsHR(hasHRRole);
        setIsManager(hasEmployerRole);
        setIsPayroll(hasPayrollRole);
        // Set isEmployee to true if they have employee role OR if they have no management roles
        setIsEmployee(hasEmployeeRole || (!hasAdminRole && !hasHRRole && !hasEmployerRole && !hasPayrollRole));
      } else {
        console.log("⚠️ No roles found for user, defaulting to employee");
        setIsAdmin(false);
        setIsHR(false);
        setIsManager(false);
        setIsPayroll(false);
        setIsEmployee(true);
      }
      
      setRolesLoaded(true);
    } catch (error) {
      console.error('💥 Error in fetchUserRoles:', error);
      // Set defaults on error
      setIsAdmin(false);
      setIsHR(false);
      setIsManager(false);
      setIsPayroll(false);
      setIsEmployee(true);
      setRolesLoaded(true);
    }
  };

  const resetRoles = () => {
    setIsAdmin(false);
    setIsHR(false);
    setIsManager(false);
    setIsPayroll(false);
    setIsEmployee(false);
    setRolesLoaded(false);
  };

  return {
    isAdmin,
    isHR,
    isManager,
    isPayroll,
    isEmployee,
    fetchUserRoles,
    resetRoles,
    rolesLoaded
  };
};
