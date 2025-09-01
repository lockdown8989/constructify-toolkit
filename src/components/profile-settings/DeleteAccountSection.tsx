
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserMinus, AlertTriangle, Shield, Lock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useDeleteAccount } from "@/hooks/auth/actions/useDeleteAccount";
import { useEnhancedSecurity } from "@/hooks/profile/useEnhancedSecurity";

export const DeleteAccountSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [step, setStep] = useState<'warning' | 'confirmation' | 'processing'>('warning');
  const [countdown, setCountdown] = useState(10);
  
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { deleteAccount } = useDeleteAccount();
  
  const { 
    validateOperation, 
    recordFailedAttempt, 
    recordSuccess, 
    isLocked,
    getSecuritySummary 
  } = useEnhancedSecurity({
    maxFailedAttempts: 3,
    lockoutDuration: 30,
    enableAuditLog: true
  });

  const securitySummary = getSecuritySummary();
  const isConfirmationValid = confirmationText.toLowerCase() === "delete my account";

  // Security countdown for warning step
  useEffect(() => {
    if (step === 'warning' && isDialogOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, isDialogOpen, countdown]);

  const handleOpenDialog = () => {
    if (!validateOperation('delete_account_dialog')) {
      return;
    }
    
    setIsDialogOpen(true);
    setStep('warning');
    setCountdown(10);
    setConfirmationText("");
  };

  const handleProceedToConfirmation = () => {
    if (countdown > 0) {
      toast({
        title: "Please wait",
        description: `You must wait ${countdown} more seconds before proceeding.`,
        variant: "destructive",
      });
      return;
    }
    
    setStep('confirmation');
  };

  const handleDeleteAccount = async () => {
    if (!isConfirmationValid) {
      recordFailedAttempt("Invalid confirmation text");
      toast({
        title: "Confirmation required",
        description: "Please type exactly: delete my account",
        variant: "destructive",
      });
      return;
    }

    if (!validateOperation('delete_account')) {
      return;
    }

    setStep('processing');
    setIsDeleting(true);
    
    try {
      const { success, error } = await deleteAccount();
      
      if (success) {
        recordSuccess('account_deletion');
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted.",
        });
        
        // Redirection is now handled directly in the useDeleteAccount hook
      } else {
        recordFailedAttempt(`Account deletion failed: ${error}`);
        console.error("Account deletion failed:", error);
        toast({
          title: "Error deleting account",
          description: error || "An error occurred. Please try again.",
          variant: "destructive",
        });
        setStep('confirmation');
      }
    } catch (err) {
      recordFailedAttempt(`Unexpected error: ${err}`);
      console.error("Error in deletion process:", err);
      toast({
        title: "Unexpected error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
      setStep('confirmation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setStep('warning');
    setCountdown(10);
    setConfirmationText("");
  };
  
  return (
    <>
      <Separator className="my-8" />
      
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
          </div>
        </div>

        <div className="rounded-lg border border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10 p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
                <UserMinus className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground">Delete My Account</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Permanently delete your account and all associated data including profile information, 
                  attendance records, and personal settings. This action cannot be undone.
                </p>
                <div className="flex items-center gap-2 text-xs text-destructive/80 bg-destructive/10 px-3 py-2 rounded-md mt-3">
                  <Shield className="h-3 w-3" />
                  <span>This will permanently remove all your data from our systems</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="destructive" 
                size="lg"
                className="shadow-sm hover:shadow-md transition-shadow"
                onClick={handleOpenDialog}
                disabled={isLocked}
              >
                {isLocked ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Account Locked
                  </>
                ) : (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Delete My Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          {step === 'warning' && (
            <>
              <DialogHeader className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <DialogTitle className="text-xl text-destructive">Delete Account - Warning</DialogTitle>
                </div>
                <DialogDescription className="text-base">
                  This action cannot be undone and will permanently delete your account.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
                  <h4 className="font-medium text-sm mb-2 text-destructive">What will be deleted:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your profile and personal information</li>
                    <li>• All attendance and time records</li>
                    <li>• Leave requests and availability settings</li>
                    <li>• All associated account data</li>
                  </ul>
                </div>
                
                {securitySummary.riskLevel !== 'low' && (
                  <div className="rounded-lg bg-warning/5 border border-warning/20 p-4">
                    <h4 className="font-medium text-sm mb-2 text-warning flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Notice
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Recent security activity detected. Failed attempts: {securitySummary.failedAttempts}
                    </p>
                  </div>
                )}
                
                <div className="rounded-lg bg-muted/50 border p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Before you continue:</strong> Make sure you've downloaded any important data 
                    you want to keep, as this information cannot be recovered after deletion.
                  </p>
                </div>

                {countdown > 0 && (
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium">
                      Please wait {countdown} seconds before you can proceed
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCloseDialog}
                  className="flex-1 sm:flex-initial"
                >
                  Keep My Account
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleProceedToConfirmation}
                  disabled={countdown > 0}
                  className="flex-1 sm:flex-initial"
                  size="lg"
                >
                  Continue to Confirmation
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 'confirmation' && (
            <>
              <DialogHeader className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <DialogTitle className="text-xl text-destructive">Confirm Account Deletion</DialogTitle>
                </div>
                <DialogDescription className="text-base">
                  Type "delete my account" exactly to confirm permanent deletion.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmation" className="text-sm font-medium">
                    Confirmation Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmation"
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Type: delete my account"
                    className={`${!isConfirmationValid && confirmationText ? 'border-destructive' : ''}`}
                    autoComplete="off"
                  />
                  {confirmationText && !isConfirmationValid && (
                    <p className="text-sm text-destructive">
                      Must type exactly: "delete my account"
                    </p>
                  )}
                  {isConfirmationValid && (
                    <p className="text-sm text-success flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Confirmation text is correct
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCloseDialog}
                  disabled={isDeleting}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={!isConfirmationValid || isDeleting}
                  className="flex-1 sm:flex-initial"
                  size="lg"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Delete My Account
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 'processing' && (
            <>
              <DialogHeader className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                  <DialogTitle className="text-xl">Deleting Account</DialogTitle>
                </div>
                <DialogDescription className="text-base">
                  Please wait while we securely delete your account and all associated data.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  This may take a few moments...
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
