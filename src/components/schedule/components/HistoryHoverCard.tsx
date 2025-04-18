
import React from 'react';
import { format } from 'date-fns';
import { History } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AvailabilityRequest } from '@/types/availability';

interface HistoryHoverCardProps {
  request: AvailabilityRequest;
}

const HistoryHoverCard = ({ request }: HistoryHoverCardProps) => {
  if (!request.audit_log?.length) return null;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="text-xs text-gray-500 flex items-center hover:text-gray-700 transition-colors">
          <History className="h-3.5 w-3.5 mr-1" />
          View History
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Request History</h4>
          {request.audit_log.map((log, index) => (
            <div key={index} className="text-xs border-l-2 border-gray-200 pl-2">
              <p className="text-gray-600">
                Status changed from {log.old_status} to {log.new_status}
              </p>
              <p className="text-gray-400">
                {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default HistoryHoverCard;
