
import { Button } from "@/components/ui/button"
import { Sun } from "lucide-react"

const ThemeToggle = () => {
  return (
    <Button
      variant="ghost"
      size="sm"
    >
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Light mode</span>
    </Button>
  );
};

export default ThemeToggle;
