
import React from "react";
import { Link } from "react-router-dom";

export const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2">
        <Link
          to="/"
          aria-label="Go to landing page"
          className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          TeamPulse
        </Link>
      </h1>
      <p className="text-gray-600">HR Management Platform</p>
      <p className="text-sm text-gray-500 mt-2">
        Join as an employee or manager to get started
      </p>
    </div>
  );
};
