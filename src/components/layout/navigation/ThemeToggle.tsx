
import { Button } from "@/components/ui/button"
import { Sun } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const ThemeToggle = () => {
  const { t } = useLanguage()
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-9 px-0"
      disabled
      title={t('light')}
    >
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">{t('light')}</span>
    </Button>
  );
};

export default ThemeToggle;
