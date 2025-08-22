
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserMinus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSecureDeleteAccount } from "@/hooks/auth/actions/useSecureDeleteAccount";

export const DeleteAccountSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const { toast } = useToast();
  const { deleteAccount, isDeleting } = useSecureDeleteAccount();

  const handleDeleteAccount = async () => {
    if (confirmationText.toLowerCase() !== "delete") {
      toast({
        title: "Confirmation required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🗑️ User confirmed deletion, proceeding...');
      await deleteAccount();
    } catch (error) {
      console.error("Error in deletion process:", error);
      toast({
        title: "Unexpected error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setConfirmationText("");
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setConfirmationText("");
  };
  
  return (
    <>
      <div className="mt-8 border-t pt-8">
        <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-base sm:text-lg">Delete My Account</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Permanently delete your account and all associated data. This action cannot be undone.
                All your attendance records, documents, and personal information will be removed.
              </p>
            </div>
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto sm:min-w-[160px] h-10"
              onClick={() => setIsDialogOpen(true)}
              disabled={isDeleting}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] mx-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-lg sm:text-xl text-destructive">
                Delete my account?
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm sm:text-base leading-relaxed">
              This action cannot be undone. Your account and all associated data will be permanently deleted, including:
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <ul className="text-sm text-muted-foreground space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Profile information and personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Attendance records and clock-in history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Documents and file attachments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Schedule assignments and availability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>All chat messages and notifications</span>
              </li>
            </ul>
            
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="confirmation" className="text-sm font-medium">
                Type <span className="font-bold text-destructive">DELETE</span> to confirm:
              </Label>
              <Input
                id="confirmation"
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full"
                disabled={isDeleting}
                autoComplete="off"
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmationText.toLowerCase() !== "delete"}
              className="w-full sm:w-auto"
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
        </DialogContent>
      </Dialog>
    </>
  );
};
