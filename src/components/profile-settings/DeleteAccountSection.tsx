
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
import { Loader2, UserMinus } from "lucide-react";
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
        
        // Redirect to landing page after a short delay
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast({
          title: "Error deleting account",
          description: error || "An error occurred. Please try again.",
          variant: "destructive",
        });
        setIsDialogOpen(false);
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
            <DialogTitle className="text-destructive">Delete account?</DialogTitle>
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
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
