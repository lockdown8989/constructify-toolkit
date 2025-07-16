
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuthButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" onClick={() => navigate('/auth')}>
        Sign In
      </Button>
      <Button onClick={() => navigate('/auth')}>
        Get Started
      </Button>
    </div>
  );
};

export default AuthButtons;
