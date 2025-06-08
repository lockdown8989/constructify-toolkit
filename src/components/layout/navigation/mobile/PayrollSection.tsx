
import React from 'react';
import { Calculator, DollarSign, Wallet } from 'lucide-react';
import MobileNavLink from './MobileNavLink';

interface PayrollSectionProps {
  onClose: () => void;
}

const PayrollSection: React.FC<PayrollSectionProps> = ({ onClose }) => {
  return (
    <>
      <MobileNavLink 
        to="/payroll" 
        icon={Calculator} 
        label="Payroll" 
        onClick={onClose} 
        className="salary-nav-button"
      />

      <MobileNavLink 
        to="/salary" 
        icon={DollarSign} 
        label="Salary" 
        onClick={onClose} 
        className="salary-nav-button"
      />

      <MobileNavLink 
        to="/payslips" 
        icon={Wallet} 
        label="Payslips" 
        onClick={onClose} 
        className="salary-nav-button"
      />
    </>
  );
};

export default PayrollSection;
