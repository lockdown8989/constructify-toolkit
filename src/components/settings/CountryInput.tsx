
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

interface CountryInputProps {
  country: string;
  isLocating: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDetect: () => void;
}

export const CountryInput = ({ country, isLocating, onChange, onDetect }: CountryInputProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const handleDetect = () => {
    toast({
      title: "Detecting location",
      description: "Attempting to detect your location...",
    });
    onDetect();
  };
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input 
          id="country"
          name="country"
          value={country}
          onChange={onChange}
          placeholder="Enter your country"
          className="flex-1 rounded-xl border-input bg-background h-12"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleDetect}
          disabled={isLocating}
          className="whitespace-nowrap rounded-xl border-input h-12"
          size="sm"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {isLocating ? t('detecting') : t('autoDetect')}
        </Button>
      </div>
    </div>
  );
};
