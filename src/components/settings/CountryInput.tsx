
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { getCountryOptions } from "@/utils/country-utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface CountryInputProps {
  country: string;
  isLocating: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDetect: () => Promise<void>;
}

export const CountryInput = ({
  country,
  isLocating,
  onChange,
  onDetect
}: CountryInputProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const countryOptions = getCountryOptions();
  
  const handleCountryChange = (value: string) => {
    const event = {
      target: {
        name: 'country',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(event);
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Select value={country} onValueChange={handleCountryChange}>
          <SelectTrigger className="h-12 rounded-xl bg-background">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border shadow-lg">
            {countryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {user && (
        <Button
          type="button"
          variant="outline"
          disabled={isLocating}
          className="h-12 shrink-0 rounded-xl bg-background"
          onClick={onDetect}
        >
          {isLocating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('detecting')}
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {t('autoDetect')}
            </>
          )}
        </Button>
      )}
    </div>
  );
};
