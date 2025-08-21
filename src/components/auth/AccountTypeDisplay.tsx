
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Calculator, Users } from 'lucide-react';

const AccountTypeDisplay = () => {
  const { isAdmin, isHR, isManager, isPayroll, isEmployee, rolesLoaded } = useAuth();

  // Don't show anything until roles are loaded
  if (!rolesLoaded) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-gray-100 text-gray-600">
          Loading...
        </Badge>
      </div>
    );
  }

  const getAccountTypeInfo = () => {
    console.log("🏷️ AccountTypeDisplay - Role check:", { isAdmin, isHR, isManager, isPayroll, isEmployee });
    
    // Show roles in priority order to avoid conflicts
    // Administrator has highest priority
    if (isAdmin) {
      return {
        type: 'Administrator',
        icon: Shield,
        color: 'bg-red-100 text-red-800',
        description: 'Full system access'
      };
    }
    
    // HR Manager has second priority  
    if (isHR) {
      return {
        type: 'HR Manager',
        icon: Users,
        color: 'bg-purple-100 text-purple-800',
        description: 'HR and employee management'
      };
    }
    
    // Manager has third priority
    if (isManager) {
      return {
        type: 'Manager',
        icon: Users,
        color: 'bg-blue-100 text-blue-800',
        description: 'Team and schedule management'
      };
    }
    
    // Payroll Administrator has fourth priority
    if (isPayroll) {
      return {
        type: 'Payroll Administrator',
        icon: Calculator,
        color: 'bg-green-100 text-green-800',
        description: 'Payroll and salary management'
      };
    }
    
    // Employee is the default/lowest priority role
    return {
      type: 'Employee',
      icon: User,
      color: 'bg-gray-100 text-gray-800',
      description: 'Standard employee access'
    };
  };

  const accountInfo = getAccountTypeInfo();
  const IconComponent = accountInfo.icon;

  console.log("🏷️ AccountTypeDisplay - showing:", accountInfo.type, { isAdmin, isHR, isManager, isPayroll, isEmployee });

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${accountInfo.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {accountInfo.type}
      </Badge>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {accountInfo.description}
      </span>
    </div>
  );
};

export default AccountTypeDisplay;
