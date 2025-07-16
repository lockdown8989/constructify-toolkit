
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import type { ConsentRecord, DataProcessingLog, UserDataExport } from '@/types/gdpr';

export const useGDPR = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [processingLogs, setProcessingLogs] = useState<DataProcessingLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user consent records
  const fetchConsents = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_consent')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setConsents(data || []);
    } catch (error) {
      console.error('Error fetching consents:', error);
    }
  };

  // Fetch data processing logs
  const fetchProcessingLogs = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('data_processing_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProcessingLogs(data || []);
    } catch (error) {
      console.error('Error fetching processing logs:', error);
    }
  };

  // Update consent
  const updateConsent = async (consentType: ConsentRecord['consent_type'], consentGiven: boolean) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('user_consent')
        .upsert({
          user_id: user.id,
          consent_type: consentType,
          consent_given: consentGiven,
          consent_date: new Date().toISOString(),
          consent_withdrawn_date: consentGiven ? null : new Date().toISOString(),
          privacy_policy_version: '1.0'
        });

      if (error) throw error;

      toast({
        title: "Consent Updated",
        description: `Your ${consentType} consent has been ${consentGiven ? 'granted' : 'withdrawn'}.`,
      });

      await fetchConsents();
    } catch (error) {
      console.error('Error updating consent:', error);
      toast({
        title: "Error",
        description: "Failed to update consent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export user data
  const exportUserData = async (): Promise<UserDataExport | null> => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('export_user_data', {
        target_user_id: user.id
      });

      if (error) throw error;

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Export Complete",
        description: "Your data has been downloaded as a JSON file.",
      });

      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Anonymize user data
  const anonymizeUserData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('anonymize_user_data', {
        target_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Data Anonymized",
        description: "Your personal data has been anonymized while preserving necessary business records.",
      });

      return data;
    } catch (error) {
      console.error('Error anonymizing data:', error);
      toast({
        title: "Anonymization Failed",
        description: "Failed to anonymize your data. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchConsents();
      fetchProcessingLogs();
    }
  }, [user?.id]);

  return {
    consents,
    processingLogs,
    isLoading,
    updateConsent,
    exportUserData,
    anonymizeUserData,
    refreshData: () => {
      fetchConsents();
      fetchProcessingLogs();
    }
  };
};
