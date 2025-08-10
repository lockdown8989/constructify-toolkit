import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Loader2, PoundSterling } from 'lucide-react';
import { useCurrencyPreference } from '@/hooks/use-currency-preference';

interface PaymentData {
  amount: number;
  description: string;
  employeeId?: string;
  type: 'payroll' | 'reimbursement' | 'bonus';
}

export const PaymentIntegration: React.FC = () => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    description: '',
    type: 'payroll'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { currency } = useCurrencyPreference();

  const handleCreatePayment = async () => {
    if (!paymentData.amount || !paymentData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: paymentData.amount,
          description: paymentData.description,
          currency: currency.toLowerCase(),
          type: paymentData.type
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Payment Created",
          description: "Redirecting to secure payment page...",
        });
        
        // Reset form
        setPaymentData({
          amount: 0,
          description: '',
          type: 'payroll'
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to create payment session",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <CardTitle>Create Payment</CardTitle>
        </div>
        <CardDescription>
          Process payments securely through Stripe
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Payment Type</Label>
          <Select
            value={paymentData.type}
            onValueChange={(value: PaymentData['type']) => 
              setPaymentData(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payroll">Payroll Payment</SelectItem>
              <SelectItem value="reimbursement">Expense Reimbursement</SelectItem>
              <SelectItem value="bonus">Bonus Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount ({currency})</Label>
          <div className="relative">
            <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              className="pl-10"
              value={paymentData.amount || ''}
              onChange={(e) => 
                setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>
          {paymentData.amount > 0 && (
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(paymentData.amount)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Payment description..."
            value={paymentData.description}
            onChange={(e) => 
              setPaymentData(prev => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <Button 
          onClick={handleCreatePayment} 
          disabled={isProcessing || !paymentData.amount}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Create Payment
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Payments are processed securely through Stripe
        </div>
      </CardContent>
    </Card>
  );
};