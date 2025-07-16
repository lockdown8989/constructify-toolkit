
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationBell = () => {
  return (
    <Button variant="ghost" size="icon" className="touch-target">
      <Bell className="h-5 w-5" />
      <span className="sr-only">Notifications</span>
    </Button>
  );
};

export default NotificationBell;
