
import React, { useState } from 'react';
import { format, isToday, isTomorrow, isYesterday, isAfter, isBefore } from 'date-fns';
import { MapPin, Clock, User, Building, MessageCircle, CheckCircle, X, Edit, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Schedule } from '@/hooks/use-schedules';
import ShiftResponseActions from './ShiftResponseActions';
import { useToast } from '@/hooks/use-toast';
import { useUpdateSchedule, useCanEditShift } from '@/hooks/use-schedules';
import DraftShiftIndicator from './components/DraftShiftIndicator';

interface ShiftDetailCardProps {
  schedule: Schedule;
  onInfoClick: () => void;
  onEmailClick: () => void;
  onCancelClick: () => void;
  onResponseComplete?: () => void;
}

const ShiftDetailCard: React.FC<ShiftDetailCardProps> = ({ 
  schedule, 
  onInfoClick, 
  onEmailClick, 
  onCancelClick,
  onResponseComplete 
}) => {
  const { toast } = useToast();
  const { updateSchedule, isUpdating } = useUpdateSchedule();
  const { mutate: checkCanEdit } = useCanEditShift();
  const [isEditing, setIsEditing] = useState(false);
  
  const startTime = new Date(schedule.start_time);
  const endTime = new Date(schedule.end_time);
  const now = new Date();
  const hours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) * 10) / 10;
  
  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEE, MMM d');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-orange-500';
      case 'completed': return 'bg-blue-500';
      case 'rejected': 
      case 'employee_rejected': return 'bg-red-500';
      case 'employee_accepted': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getDepartmentColor = (department?: string) => {
    switch (department?.toLowerCase()) {
      case 'sales': return 'bg-blue-500';
      case 'customer service': return 'bg-orange-400';
      case 'marketing': return 'bg-purple-500';
      case 'operations': return 'bg-green-500';
      case 'hr': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const handleEdit = () => {
    checkCanEdit(schedule.id, {
      onSuccess: (canEdit) => {
        if (canEdit) {
          setIsEditing(true);
        } else {
          toast({
            title: "Cannot Edit",
            description: "This shift cannot be edited at this time.",
            variant: "destructive"
          });
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to check edit permissions.",
          variant: "destructive"
        });
      }
    });
  };

  const handlePublish = () => {
    if (schedule.is_draft) {
      updateSchedule({
        ...schedule,
        is_draft: false,
        published: true,
        published_at: new Date().toISOString()
      });
      
      toast({
        title: "Shift Published",
        description: "The shift has been published and is now visible to employees.",
      });
    }
  };

  const isExpired = isBefore(endTime, now);
  const canShowActions = schedule.status === 'pending' && !isExpired;

  return (
    <Card className={cn(
      "p-4 border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow",
      schedule.is_draft ? "border-l-orange-500 bg-orange-50" : "border-l-green-500"
    )}>
      {/* Header with date and status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">
            {formatDateLabel(startTime)}
          </div>
          <DraftShiftIndicator 
            isDraft={schedule.is_draft}
            canBeEdited={schedule.can_be_edited}
          />
        </div>
        <div className="flex items-center gap-2">
          {schedule.can_be_edited && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              disabled={isUpdating}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {schedule.is_draft && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublish}
              disabled={isUpdating}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <FileText className="h-4 w-4 mr-1" />
              Publish
            </Button>
          )}
          <Badge className={cn("text-white", getStatusColor(schedule.status))}>
            {schedule.status || 'confirmed'}
          </Badge>
        </div>
      </div>

      {/* Time and Hours */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <div className="text-sm text-gray-500">Start</div>
          <div className="text-lg font-semibold">
            {format(startTime, 'hh:mm a')}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">End</div>
          <div className="text-lg font-semibold">
            {format(endTime, 'hh:mm a')}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Hours</div>
          <div className="text-lg font-semibold">{hours}</div>
        </div>
      </div>

      {/* Shift Details */}
      <div className="space-y-2 mb-3">
        <div className="text-lg font-medium">{schedule.title}</div>
        
        {schedule.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{schedule.location}</span>
          </div>
        )}

        {schedule.notes && (
          <div className="flex items-start gap-2 text-gray-600">
            <MessageCircle className="h-4 w-4 mt-0.5" />
            <span className="text-sm">{schedule.notes}</span>
          </div>
        )}

        {schedule.draft_notes && schedule.is_draft && (
          <div className="flex items-start gap-2 text-orange-600">
            <FileText className="h-4 w-4 mt-0.5" />
            <span className="text-sm italic">Draft notes: {schedule.draft_notes}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canShowActions && (
        <ShiftResponseActions
          schedule={schedule}
          onResponseComplete={onResponseComplete}
        />
      )}

      {/* Info and Actions */}
      <div className="flex gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onInfoClick}
          className="flex-1"
        >
          View Details
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEmailClick}
          className="flex-1"
        >
          Contact Manager
        </Button>
        {(schedule.status === 'pending' || schedule.is_draft) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancelClick}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ShiftDetailCard;
