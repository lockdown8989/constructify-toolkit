
import { DollarSign, Euro, PoundSterling } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const currencyOptions = [
  { value: "GBP", label: "British Pound (£)", icon: PoundSterling },
  { value: "EUR", label: "Euro (€)", icon: Euro },
  { value: "USD", label: "US Dollar ($)", icon: DollarSign },
];

interface CurrencySelectorProps {
  currency: string;
  onChange: (value: string) => void;
}

export const CurrencySelector = ({ currency, onChange }: CurrencySelectorProps) => {
  const { toast } = useToast();
  
  const handleCurrencyChange = (value: string) => {
    onChange(value);
    
    // Get currency label for toast
    const selectedCurrency = currencyOptions.find(option => option.value === value);
    
    toast({
      title: "Currency updated",
      description: `Currency has been changed to ${selectedCurrency?.label || value}`,
    });
  };
  
  return (
    <div className="space-y-2">
      <Select 
        value={currency} 
        onValueChange={handleCurrencyChange}
      >
        <SelectTrigger className="w-full rounded-xl border-input bg-background h-12">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border shadow-lg">
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
