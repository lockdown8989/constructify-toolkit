
import { Link } from "react-router-dom";
import { SheetTitle } from "@/components/sheet";

interface MobileNavHeaderProps {
  onClose: () => void;
}

const MobileNavHeader = ({ onClose }: MobileNavHeaderProps) => {
  return (
    <div className="flex items-center px-6 pt-8 pb-4">
      <div className="flex-1 text-center">
        <Link to="/" onClick={onClose}>
          <img 
            src="/lovable-uploads/2fa83748-5338-4dcb-9c43-f84070f43aec.png" 
            alt="TeamPulse" 
            className="h-8 w-auto animate-pulse hover:animate-bounce transition-all duration-300"
          />
        </Link>
      </div>
    </div>
  );
};

export default MobileNavHeader;
