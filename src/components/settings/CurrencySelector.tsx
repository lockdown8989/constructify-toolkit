
import { DollarSign, Euro, PoundSterling } from "lucide-react";
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
      <Select 
        value={currency} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full rounded-lg border-input bg-background h-10">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent className="rounded-lg border shadow-lg">
          {currencyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value} className="cursor-pointer py-2.5">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mr-2">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
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
