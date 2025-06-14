
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-mobile';
import { DollarSign, Users, CheckCircle, Clock, UserMinus } from 'lucide-react';
import { PayrollDetailModal } from '../modals/PayrollDetailModal';

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
  const [selectedModal, setSelectedModal] = useState<string | null>(null);

  const stats = [
    {
      title: "Total Payroll",
      value: formatCurrency(totalPayroll),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      iconColor: "bg-green-100",
      modalType: "total-payroll" as const,
      clickable: true
    },
    {
      title: "Total Employees",
      value: formatNumber(totalEmployees),
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      iconColor: "bg-blue-100",
      modalType: "total-employees" as const,
      clickable: true
    },
    {
      title: "Paid",
      value: formatNumber(paidEmployees),
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
      iconColor: "bg-emerald-100",
      modalType: "paid" as const,
      clickable: true
    },
    {
      title: "Pending",
      value: formatNumber(pendingEmployees),
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      iconColor: "bg-amber-100",
      modalType: "pending" as const,
      clickable: true
    },
    {
      title: "Absent",
      value: formatNumber(absentEmployees),
      icon: UserMinus,
      color: "bg-gray-50 text-gray-600",
      iconColor: "bg-gray-200",
      modalType: "absent" as const,
      clickable: true
    },
  ];

  const handleCardClick = (modalType: string) => {
    setSelectedModal(modalType);
  };

  const handleCloseModal = () => {
    setSelectedModal(null);
  };

  const modalData = {
    totalPayroll,
    totalEmployees,
    paidEmployees,
    pendingEmployees,
    absentEmployees,
  };

  return (
    <>
      <div className={`grid grid-cols-2 ${isMobile ? '' : 'md:grid-cols-5'} gap-4`}>
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`border shadow-sm ${stat.color} border-opacity-50 ${
              stat.clickable ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''
            }`}
            onClick={() => stat.clickable && handleCardClick(stat.modalType)}
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

      {selectedModal && (
        <PayrollDetailModal
          isOpen={!!selectedModal}
          onClose={handleCloseModal}
          type={selectedModal as any}
          data={modalData}
        />
      )}
    </>
  );
};
