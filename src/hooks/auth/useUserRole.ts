
import { useAuth } from '@/hooks/use-auth';

export const useUserRole = () => {
  const { isAdmin, isManager } = useAuth();

  return {
    isAdmin,
    isManager,
  };
};
