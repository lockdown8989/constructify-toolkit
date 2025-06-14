
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  MapPin, 
  Users, 
  Send, 
  Edit, 
  Trash2,
  Plus,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { useOpenShifts } from '@/hooks/use-open-shifts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OpenShiftManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOpenShift: () => void;
  onPublishShift: (shiftId: string) => void;
  onAssignShift: (shiftId: string) => void;
}

const OpenShiftManager: React.FC<OpenShiftManagerProps> = ({
  isOpen,
  onClose,
  onCreateOpenShift,
  onPublishShift,
  onAssignShift
}) => {
  const [activeTab, setActiveTab] = useState('published');
  const { openShifts, isLoading } = useOpenShifts();
  const { toast } = useToast();

  // Filter shifts by status
  const publishedShifts = openShifts.filter(shift => shift.status === 'open' || shift.status === 'published');
  const draftShifts = openShifts.filter(shift => shift.status === 'draft');
  const assignedShifts = openShifts.filter(shift => shift.status === 'assigned');

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePublishShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('open_shifts')
        .update({ status: 'open' })
        .eq('id', shiftId);

      if (error) throw error;

      toast({
        title: "Shift Published",
        description: "The shift has been published and is now available to employees.",
      });

      onPublishShift(shiftId);
    } catch (error) {
      console.error('Error publishing shift:', error);
      toast({
        title: "Error",
        description: "Failed to publish shift. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('open_shifts')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;

      toast({
        title: "Shift Deleted",
        description: "The shift has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift. Please try again.",
        variant: "destructive"
      });
    }
  };

  const ShiftCard = ({ shift }: { shift: any }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{shift.title}</h4>
              {shift.priority && (
                <Badge className={getPriorityColor(shift.priority)} variant="secondary">
                  {shift.priority}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{shift.role}</p>
            {shift.department && (
              <p className="text-xs text-gray-500">{shift.department}</p>
            )}
          </div>
          <Badge 
            variant={shift.status === 'open' || shift.status === 'published' ? 'default' : 
                    shift.status === 'assigned' ? 'secondary' : 'outline'}
          >
            {shift.status === 'open' ? 'published' : shift.status}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {format(new Date(shift.start_time), 'MMM d, h:mm a')} - 
            {format(new Date(shift.end_time), 'h:mm a')}
          </div>
          
          {shift.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {shift.location}
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {shift.applications_count || 0} applications
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {shift.status === 'draft' && (
            <Button 
              size="sm" 
              onClick={() => handlePublishShift(shift.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-3 w-3 mr-1" />
              Publish
            </Button>
          )}
          
          {(shift.status === 'open' || shift.status === 'published') && (shift.applications_count || 0) > 0 && (
            <Button 
              size="sm" 
              onClick={() => onAssignShift(shift.id)}
              variant="outline"
            >
              <Eye className="h-3 w-3 mr-1" />
              View Applications ({shift.applications_count})
            </Button>
          )}
          
          <Button size="sm" variant="outline">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-600 hover:text-red-700"
            onClick={() => handleDeleteShift(shift.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading open shifts...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Open Shift Management</span>
            <Button onClick={onCreateOpenShift}>
              <Plus className="h-4 w-4 mr-2" />
              Create Open Shift
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="published">
              Published ({publishedShifts.length})
            </TabsTrigger>
            <TabsTrigger value="drafts">
              Drafts ({draftShifts.length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned ({assignedShifts.length})
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="published" className="space-y-4">
              {publishedShifts.length > 0 ? (
                publishedShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No published open shifts
                </div>
              )}
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4">
              {draftShifts.length > 0 ? (
                draftShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No draft shifts
                </div>
              )}
            </TabsContent>

            <TabsContent value="assigned" className="space-y-4">
              {assignedShifts.length > 0 ? (
                assignedShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No assigned shifts
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default OpenShiftManager;
