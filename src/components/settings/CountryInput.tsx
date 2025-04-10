
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CountryInputProps {
  country: string;
  isLocating: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDetect: () => void;
}

export const CountryInput = ({ 
  country, 
  isLocating, 
  onChange, 
  onDetect 
}: CountryInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="country">Country</Label>
      <div className="flex">
        <Input
          id="country"
          name="country"
          value={country}
          onChange={onChange}
          placeholder={isLocating ? "Detecting location..." : "e.g. United Kingdom"}
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          className="ml-2" 
          onClick={onDetect}
          disabled={isLocating}
        >
          Detect
        </Button>
      </div>
    </div>
  );
};
