
import { useState } from "react";
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
import { Loader2, UserMinus, AlertTriangle, Shield } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useDeleteAccount } from "@/hooks/auth/actions/useDeleteAccount";

export const DeleteAccountSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { deleteAccount } = useDeleteAccount();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const { success, error } = await deleteAccount();
      
      if (success) {
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted.",
        });
        
        // Redirection is now handled directly in the useDeleteAccount hook
      } else {
        console.error("Account deletion failed:", error);
        toast({
          title: "Error deleting account",
          description: error || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error in deletion process:", err);
      toast({
        title: "Unexpected error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
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
                onClick={() => setIsDialogOpen(true)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-xl text-destructive">Delete Account</DialogTitle>
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
            
            <div className="rounded-lg bg-muted/50 border p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Before you continue:</strong> Make sure you've downloaded any important data 
                you want to keep, as this information cannot be recovered after deletion.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
              className="flex-1 sm:flex-initial"
            >
              Keep My Account
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
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
                  Yes, Delete My Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
