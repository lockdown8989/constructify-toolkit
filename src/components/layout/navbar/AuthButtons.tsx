
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AuthButtons = () => {
  return (
    <>
      <Link to="/sign-in">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
      <Link to="/sign-up">
        <Button variant="ghost" size="sm">
          Sign Up
        </Button>
      </Link>
    </>
  );
};

export default AuthButtons;
