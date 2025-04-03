
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const useAuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = location.state?.from?.pathname || "/dashboard";
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // Get the tab parameter from URL
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "signup" ? "signup" : "signin");
  
  const isResetMode = searchParams.get("reset") === "true";
  const type = searchParams.get("type");
  const isRecoveryMode = type === "recovery";

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam === "signup") {
      setActiveTab("signup");
    }
  }, [tabParam]);

  const handleShowResetPassword = () => {
    setShowResetPassword(true);
    setActiveTab("reset");
  };

  const handleBackToSignIn = () => {
    setShowResetPassword(false);
    setActiveTab("signin");
  };

  return {
    user,
    from,
    activeTab,
    setActiveTab,
    isResetMode,
    isRecoveryMode,
    showResetPassword,
    handleShowResetPassword,
    handleBackToSignIn
  };
};
