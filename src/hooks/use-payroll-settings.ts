import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export type PayrollSettingsValues = {
  payPeriod: 'weekly' | 'bi-weekly' | 'monthly';
  overtimeRate: number;
  defaultWorkingHours: number;
  autoApprovePayroll: boolean;
  emailNotifications: boolean;
  taxRate: number;
  niRate: number;
  pensionRate: number;
  companyName: string;
  payrollCurrency: 'GBP' | 'USD' | 'EUR';
  paymentMethod: 'bank_transfer' | 'check' | 'cash';
  processingDelay: number;
};

const defaultSettings: PayrollSettingsValues = {
  payPeriod: 'monthly',
  overtimeRate: 1.5,
  defaultWorkingHours: 40,
  autoApprovePayroll: false,
  emailNotifications: true,
  taxRate: 20,
  niRate: 12,
  pensionRate: 5,
  companyName: 'Your Company Ltd',
  payrollCurrency: 'GBP',
  paymentMethod: 'bank_transfer',
  processingDelay: 2,
};

export function usePayrollSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PayrollSettingsValues>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('payroll_settings')
          .select('settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data && data.settings) {
          setSettings({ ...defaultSettings, ...(data.settings as PayrollSettingsValues) });
        } else {
          // create a row for this user lazily
          await supabase
            .from('payroll_settings')
            .upsert({ user_id: user.id, settings: defaultSettings }, { onConflict: 'user_id' });
          setSettings(defaultSettings);
        }
      } catch (err: any) {
        console.error('Failed to load payroll settings', err);
        setLoadError(err?.message ?? 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user]);

  const save = async (values?: PayrollSettingsValues) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    setIsSaving(true);
    try {
      const payload = values ?? settings;
      const { error } = await supabase
        .from('payroll_settings')
        .upsert({ user_id: user.id, settings: payload }, { onConflict: 'user_id' });
      if (error) throw error;
      setSettings(payload);
      return { success: true as const };
    } catch (err: any) {
      console.error('Failed to save payroll settings', err);
      return { success: false as const, error: err?.message ?? 'Failed to save settings' };
    } finally {
      setIsSaving(false);
    }
  };

  return { settings, setSettings, isLoading, isSaving, loadError, save };
}

export default usePayrollSettings;
