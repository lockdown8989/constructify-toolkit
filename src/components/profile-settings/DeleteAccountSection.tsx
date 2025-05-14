
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
import { Loader2, UserMinus } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useDeleteAccount } from "@/hooks/auth/actions/useDeleteAccount";

export const DeleteAccountSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useLanguage();
  const { deleteAccount } = useDeleteAccount();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const { success } = await deleteAccount();
      
      if (!success) {
        // Error is already handled in the hook with toast notifications
        setIsDialogOpen(false);
      }
      // If successful, the hook will handle redirects and notifications
    } catch (err) {
      console.error("Unexpected error in deletion process:", err);
      setIsDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <div className="mt-8 border-t pt-8">
        <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
            <div>
              <h3 className="font-medium">Delete My Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button 
              variant="destructive" 
              className="mt-2 sm:mt-0"
              onClick={() => setIsDialogOpen(true)}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete my account?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account and all associated data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Please confirm that you want to delete your account. All your data, including profile information, 
              leave requests, and attendance records will be permanently removed.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
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
