
import { DollarSign, Euro, PoundSterling } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const currencyOptions = [
  { value: "USD", label: "US Dollar ($)", icon: DollarSign },
  { value: "GBP", label: "British Pound (£)", icon: PoundSterling },
  { value: "EUR", label: "Euro (€)", icon: Euro },
];

interface CurrencySelectorProps {
  currency: string;
  onChange: (value: string) => void;
}

export const CurrencySelector = ({ currency, onChange }: CurrencySelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="currency">Preferred Currency</Label>
      <Select 
        value={currency} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
