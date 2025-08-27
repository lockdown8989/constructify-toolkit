
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthActions } from './useAuthActions';

export const useAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signIn: authSignIn, signUp: authSignUp } = useAuthActions();

  const [activeTab, setActiveTab] = useState('signin');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  // Check for recovery parameters
  useEffect(() => {
    const hasAccessToken = searchParams.has('access_token') || window.location.hash.includes('access_token=');
    const hasRecoveryToken = searchParams.has('token') || searchParams.get('type') === 'recovery';
    const mode = searchParams.get('mode');
    
    console.log('🔐 Auth page URL check:', {
      hasAccessToken,
      hasRecoveryToken,
      mode,
      searchParams: Object.fromEntries(searchParams.entries()),
      hash: window.location.hash,
      url: window.location.href
    });

    if (hasRecoveryToken || mode === 'recovery' || hasAccessToken) {
      console.log('🔑 Password recovery detected, switching to recovery mode');
      setIsRecoveryMode(true);
      setIsResetMode(true);
    }
  }, [searchParams]);

  const handleShowResetPassword = () => {
    console.log('🔄 Showing reset password form');
    setIsResetMode(true);
    setActiveTab('reset');
  };

  const handleBackToSignIn = () => {
    console.log('🔄 Returning to sign in form');
    setIsResetMode(false);
    setIsRecoveryMode(false);
    setActiveTab('signin');
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Auth page sign in attempt');
      const result = await authSignIn(email, password);
      
      if (result?.error) {
        console.error('❌ Sign in error in auth page:', result.error);
        toast({
          title: "Sign In Failed",
          description: result.error.message || "Failed to sign in. Please try again.",
          variant: "destructive",
        });
        return result;
      }

      console.log('✅ Sign in successful, navigating to:', from);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      
      navigate(from, { replace: true });
      return result;
    } catch (error) {
      console.error('💥 Sign in exception in auth page:', error);
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: { message: "An unexpected error occurred" } };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('📝 Auth page sign up attempt');
      const result = await authSignUp(email, password, { first_name: firstName, last_name: lastName });
      
      if (result?.error) {
        console.error('❌ Sign up error in auth page:', result.error);
        toast({
          title: "Sign Up Failed",
          description: result.error.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
        return result;
      }

      console.log('✅ Sign up successful');
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
      setActiveTab('signin');
      return result;
    } catch (error) {
      console.error('💥 Sign up exception in auth page:', error);
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: { message: "An unexpected error occurred" } };
    }
  };

  return {
    from,
    activeTab,
    setActiveTab,
    isResetMode,
    isRecoveryMode,
    handleShowResetPassword,
    handleBackToSignIn,
    signIn,
    signUp
  };
};
