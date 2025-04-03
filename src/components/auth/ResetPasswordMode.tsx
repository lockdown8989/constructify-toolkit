
import React from "react";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export const ResetPasswordMode = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">TeamPulse</h1>
          <p className="text-gray-600">HR Management Platform</p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  );
};
