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
    console.log("🔄 Fetching roles for user:", userId);
    
    try {
      // Use Promise.allSettled to prevent one failure from breaking everything
      const [rolesResult, employeeResult] = await Promise.allSettled([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId),
        supabase
          .from('employees')
          .select('role, job_title')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      // Handle roles result
      let roles = null;
      if (rolesResult.status === 'fulfilled' && !rolesResult.value.error) {
        roles = rolesResult.value.data;
      } else {
        console.warn('⚠️ Failed to fetch user_roles:', rolesResult.status === 'rejected' ? rolesResult.reason : rolesResult.value.error);
      }

      // Handle employee result
      let employeeData = null;
      if (employeeResult.status === 'fulfilled' && !employeeResult.value.error) {
        employeeData = employeeResult.value.data;
      } else {
        console.warn('⚠️ Failed to fetch employee data:', employeeResult.status === 'rejected' ? employeeResult.reason : employeeResult.value.error);
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
        const hasManagerRole = userRoles.includes('employer') || userRoles.includes('manager');
        const hasPayrollRole = userRoles.includes('payroll');
        const hasEmployeeRole = userRoles.includes('employee');
        
        console.log("✅ Role checks:", {
          admin: hasAdminRole,
          hr: hasHRRole,
          manager: hasManagerRole,
          payroll: hasPayrollRole,
          employee: hasEmployeeRole,
          jobTitle: employeeData?.job_title,
          allRoles: userRoles,
          userEmail: user?.email
        });
        
        setIsAdmin(hasAdminRole);
        setIsHR(hasHRRole);
        setIsManager(hasManagerRole);
        setIsPayroll(hasPayrollRole);
        setIsEmployee(hasEmployeeRole || (!hasAdminRole && !hasHRRole && !hasManagerRole && !hasPayrollRole));
      } else {
        console.log("⚠️ No roles found for user, defaulting to employee");
        setIsAdmin(false);
        setIsHR(false);
        setIsManager(false);
        setIsPayroll(false);
        setIsEmployee(true);
      }
      
    } catch (error) {
      console.error('💥 Critical error in fetchUserRoles:', error);
      // Set safe defaults that won't break auth
      setIsAdmin(false);
      setIsHR(false);
      setIsManager(false);
      setIsPayroll(false);
      setIsEmployee(true);
    } finally {
      // Always mark roles as loaded to prevent auth blocking
      console.log("📝 Marking roles as loaded for user:", userId);
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