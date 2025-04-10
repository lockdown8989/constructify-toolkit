
import { DollarSign, Euro, PoundSterling } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";

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
  const { t } = useLanguage();
  
  return (
    <div className="space-y-3">
      <Label htmlFor="currency" className="text-sm font-medium">{t('preferredCurrency')}</Label>
      <Select 
        value={currency} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-slate-700 h-12 px-4 focus:ring-blue-200 dark:focus:ring-blue-900">
          <SelectValue placeholder={t('selectCurrency')} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-800 border-none shadow-lg rounded-xl p-1 animate-in fade-in-80 zoom-in-95">
          {currencyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="rounded-lg focus:bg-gray-100 dark:focus:bg-slate-700 py-2.5 pl-10 pr-3 text-sm cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="mr-2 h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                    <Icon className="w-3.5 h-3.5" />
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
