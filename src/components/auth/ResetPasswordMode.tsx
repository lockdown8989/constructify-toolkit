
import React from "react";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { useSearchParams } from "react-router-dom";

export const ResetPasswordMode = () => {
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get("reset") === "true";
  const type = searchParams.get("type");
  const isRecoveryMode = type === "recovery";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">TeamPulse</h1>
          <p className="text-gray-600">HR Management Platform</p>
          <p className="text-sm text-gray-500 mt-4">
            {isResetMode || isRecoveryMode ? 
              "Enter your new password below to complete the reset process" : 
              "Enter your email to receive a password reset link"}
          </p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  );
};
