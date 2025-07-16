
import React from 'react';
import { Users, CalendarDays, Building2, Clock, Timer } from 'lucide-react';
import MobileNavLink from './MobileNavLink';

export const ManagerSection = () => {
  return (
    <>
      <MobileNavLink to="/people" icon={Users} label="People" />
      <MobileNavLink to="/shift-calendar" icon={CalendarDays} label="Shift Calendar" />
      <MobileNavLink to="/rota-employee" icon={Timer} label="Employee Rotas" />
      
      <MobileNavLink to="/manager-time-clock" icon={Clock} label="Manager Time Clock" />
    </>
  );
};
