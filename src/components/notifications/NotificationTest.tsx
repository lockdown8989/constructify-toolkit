
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { sendTestNotification, verifyNotificationsTable } from '@/services/notifications';

const NotificationTest: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [tableStatus, setTableStatus] = useState<any | null>(null);
  const [testStatus, setTestStatus] = useState<any | null>(null);

  const handleVerifyTable = async () => {
    setLoading(true);
    try {
      const status = await verifyNotificationsTable();
      setTableStatus(status);
    } catch (error) {
      console.error('Error verifying table:', error);
      setTableStatus({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const result = await sendTestNotification(userId);
      setTestStatus(result);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestStatus({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Notification System Test</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleVerifyTable}
          disabled={loading}
        >
          Verify Database
        </Button>
      </div>
      
      {tableStatus && (
        <div className={`p-3 rounded-md ${tableStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-start">
            {tableStatus.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <div>
              <p className="font-medium">
                {tableStatus.success ? 'Database verified!' : 'Database check failed!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {tableStatus.success 
                  ? tableStatus.tableExists 
                    ? `Table exists with ${tableStatus.recordCount} records.` 
                    : 'Table structure exists but no records found.'
                  : tableStatus.error || 'Unknown error occurred.'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <Input
          placeholder="Enter user ID to test"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleSendTest} 
          disabled={!userId || loading}
        >
          Send Test
        </Button>
      </div>
      
      {testStatus && (
        <div className={`p-3 rounded-md ${testStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-start">
            {testStatus.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <div>
              <p className="font-medium">
                {testStatus.success ? 'Test notification sent!' : 'Failed to send test notification!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {testStatus.success 
                  ? 'The notification was successfully sent to the specified user.'
                  : testStatus.error || 'Unknown error occurred.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTest;
