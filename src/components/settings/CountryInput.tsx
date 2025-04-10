
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface CountryInputProps {
  country: string;
  isLocating: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDetect: () => void;
}

export const CountryInput = ({ country, isLocating, onChange, onDetect }: CountryInputProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-3">
      <Label htmlFor="country" className="text-sm font-medium">{t('location')}</Label>
      <div className="flex gap-2">
        <Input 
          id="country"
          name="country"
          value={country}
          onChange={onChange}
          placeholder={t('enterYourCountry')}
          className="flex-1 rounded-xl border-gray-200 dark:border-slate-700 h-12 focus:ring-blue-200 dark:focus:ring-blue-900"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={onDetect}
          disabled={isLocating}
          className="rounded-xl border-gray-200 dark:border-slate-700 h-12 hover:bg-gray-50 dark:hover:bg-slate-700"
        >
          <MapPin className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
          {isLocating ? t('detecting') : t('autoDetect')}
        </Button>
      </div>
    </div>
  );
};
