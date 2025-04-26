
import { Card } from "@/components/ui/card";
import { Palette } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ThemeSelector } from "@/components/settings/ThemeSelector";

export const AppearanceSection = () => {
  const { t } = useLanguage();
  
  return (
    <Card className="border rounded-xl shadow-sm overflow-hidden">
      <div className="bg-muted/30 p-6 pb-4">
        <h2 className="text-xl font-medium flex items-center">
          <Palette className="mr-3 h-5 w-5 text-primary" />
          {t('appearance')}
        </h2>
      </div>
      <div className="py-4 px-6">
        <ThemeSelector />
      </div>
    </Card>
  );
};
