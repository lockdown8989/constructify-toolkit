
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const AuthButtons = () => {
  return (
    <>
      <Link to="/auth">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
      <Link to="/auth?tab=signup">
        <Button variant="ghost" size="sm">
          Sign Up
        </Button>
      </Link>
    </>
  );
};

export default AuthButtons;
