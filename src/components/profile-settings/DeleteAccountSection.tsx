
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Trash2, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteAccount } from '@/hooks/auth/actions/useDeleteAccount';
import { useGDPR } from '@/hooks/use-gdpr';

export const DeleteAccountSection = () => {
  const { deleteAccount, isDeleting } = useDeleteAccount();
  const { anonymizeUserData, isLoading: isAnonymizing } = useGDPR();
  const [confirmText, setConfirmText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    
    const result = await deleteAccount();
    if (result.success) {
      setShowDeleteDialog(false);
    }
  };

  const handleAnonymizeData = async () => {
    await anonymizeUserData();
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Data Management & Account Deletion
        </CardTitle>
        <CardDescription className="text-red-700">
          Manage your data retention and account deletion preferences in compliance with GDPR.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Data Anonymization Option */}
        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-orange-900">Anonymize My Data</h4>
              <p className="text-sm text-orange-800 mt-1">
                Remove your personal identifiers while keeping necessary business records for legal compliance. 
                This action cannot be undone.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={handleAnonymizeData}
                disabled={isAnonymizing}
              >
                {isAnonymizing ? 'Anonymizing...' : 'Anonymize My Data'}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Account Deletion */}
        <div className="space-y-3">
          <h4 className="font-medium text-red-900">Delete Account Permanently</h4>
          <p className="text-sm text-red-700">
            This will permanently delete your account and all associated data. Some business records 
            may be retained for legal compliance as outlined in our privacy policy.
          </p>
          
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Confirm Account Deletion
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This action cannot be undone. This will permanently delete your account and 
                    remove all your personal data from our servers.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Some business records may be retained for legal compliance (payroll, attendance records) 
                    but will be anonymized to remove personal identifiers.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-delete">Type "DELETE" to confirm:</Label>
                    <Input
                      id="confirm-delete"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== 'DELETE' || isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account Permanently'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="text-xs text-red-600">
          <p>
            <strong>Important:</strong> Before deleting your account, you may want to export your data using 
            the privacy dashboard. Account deletion is irreversible and will log you out immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
