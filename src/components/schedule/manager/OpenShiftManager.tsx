
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

interface OpenShift {
  id: string;
  title: string;
  role: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: 'draft' | 'published' | 'assigned';
  applications_count?: number;
  requirements?: string[];
  priority?: string;
  department?: string;
}

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

  // Mock data - replace with actual data from your API
  const openShifts: OpenShift[] = [
    {
      id: '1',
      title: 'Morning Shift',
      role: 'Server',
      start_time: '2025-05-26T09:00:00Z',
      end_time: '2025-05-26T17:00:00Z',
      location: 'Main Floor',
      status: 'published',
      applications_count: 3,
      requirements: ['Customer Service', 'Cash Handling'],
      priority: 'high',
      department: 'Restaurant'
    },
    {
      id: '2',
      title: 'Evening Shift',
      role: 'Kitchen Staff',
      start_time: '2025-05-26T17:00:00Z',
      end_time: '2025-05-27T01:00:00Z',
      location: 'Kitchen',
      status: 'published',
      applications_count: 1,
      requirements: ['Food Safety', 'Team Work'],
      priority: 'normal',
      department: 'Kitchen'
    },
    {
      id: '3',
      title: 'Weekend Cover',
      role: 'Manager',
      start_time: '2025-05-31T08:00:00Z',
      end_time: '2025-05-31T18:00:00Z',
      location: 'All Areas',
      status: 'draft',
      applications_count: 0,
      requirements: ['Leadership', 'Problem Solving'],
      priority: 'high',
      department: 'Management'
    }
  ];

  const publishedShifts = openShifts.filter(shift => shift.status === 'published');
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

  const ShiftCard = ({ shift }: { shift: OpenShift }) => (
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
            variant={shift.status === 'published' ? 'default' : 
                    shift.status === 'assigned' ? 'secondary' : 'outline'}
          >
            {shift.status}
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

        {shift.requirements && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {shift.requirements.map((req, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {shift.status === 'draft' && (
            <Button 
              size="sm" 
              onClick={() => onPublishShift(shift.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-3 w-3 mr-1" />
              Publish
            </Button>
          )}
          
          {shift.status === 'published' && (shift.applications_count || 0) > 0 && (
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
          
          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
