
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
          <SheetTitle className="font-semibold text-lg">TeamPulse</SheetTitle>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavHeader;
