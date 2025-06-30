
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-mobile';
import { DollarSign, Users, CheckCircle, Clock, UserMinus } from 'lucide-react';
import { PayrollStatsModal } from './PayrollStatsModal';

interface PayrollStatsGridProps {
  totalPayroll: number;
  totalEmployees: number;
  paidEmployees: number;
  pendingEmployees: number;
  absentEmployees: number;
}

export const PayrollStatsGrid: React.FC<PayrollStatsGridProps> = ({
  totalPayroll,
  totalEmployees,
  paidEmployees,
  pendingEmployees,
  absentEmployees,
}) => {
  const isMobile = useIsMobile();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    statType: 'total' | 'employees' | 'paid' | 'pending' | 'absent';
    statValue: number | string;
  }>({
    isOpen: false,
    statType: 'total',
    statValue: 0,
  });

  const handleCardClick = (statType: 'total' | 'employees' | 'paid' | 'pending' | 'absent', value: number) => {
    setModalState({
      isOpen: true,
      statType,
      statValue: value,
    });
  };

  // Ensure we're displaying the actual employee count
  const displayedEmployeeCount = totalEmployees || 0;
  console.log('PayrollStatsGrid - Employee count:', displayedEmployeeCount);

  const stats = [
    {
      title: "Total Payroll",
      value: formatCurrency(totalPayroll),
      rawValue: totalPayroll,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      iconColor: "bg-green-100",
      statType: 'total' as const,
    },
    {
      title: "Total Employees",
      value: formatNumber(displayedEmployeeCount),
      rawValue: displayedEmployeeCount,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      iconColor: "bg-blue-100",
      statType: 'employees' as const,
    },
    {
      title: "Paid",
      value: formatNumber(paidEmployees),
      rawValue: paidEmployees,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
      iconColor: "bg-emerald-100",
      statType: 'paid' as const,
    },
    {
      title: "Pending",
      value: formatNumber(pendingEmployees),
      rawValue: pendingEmployees,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      iconColor: "bg-amber-100",
      statType: 'pending' as const,
    },
    {
      title: "Absent",
      value: formatNumber(absentEmployees),
      rawValue: absentEmployees,
      icon: UserMinus,
      color: "bg-gray-50 text-gray-600",
      iconColor: "bg-gray-200",
      statType: 'absent' as const,
    },
  ];

  return (
    <>
      <div className={`grid grid-cols-2 ${isMobile ? '' : 'md:grid-cols-5'} gap-4`}>
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`border shadow-sm ${stat.color} border-opacity-50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
            onClick={() => handleCardClick(stat.statType, stat.rawValue)}
          >
            <CardContent className="p-4 flex flex-col">
              <div className={`w-10 h-10 rounded-lg ${stat.iconColor} flex items-center justify-center mb-3`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <PayrollStatsModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        statType={modalState.statType}
        statValue={modalState.statValue}
      />
    </>
  );
};
