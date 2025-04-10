
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
    <div className="space-y-2">
      <Label htmlFor="country">{t('location')}</Label>
      <div className="flex gap-2">
        <Input 
          id="country"
          name="country"
          value={country}
          onChange={onChange}
          placeholder={t('enterYourCountry')}
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={onDetect}
          disabled={isLocating}
          className="whitespace-nowrap"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {isLocating ? t('detecting') : t('autoDetect')}
        </Button>
      </div>
    </div>
  );
};
