import React, { useState } from 'react';
import { format, addDays, subDays, isToday, isSameMonth, parseISO, isSameDay } from 'date-fns';
import { Clock, User, MapPin, Info, Mail, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSchedules } from '@/hooks/use-schedules';
import { useAuth } from '@/hooks/auth';
import { useEmployees } from '@/hooks/use-employees';
import WeeklyCalendarView from './WeeklyCalendarView';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ShiftStatus = 'confirmed' | 'pending' | 'completed';

const EmployeeScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<string>("my-shifts");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  const { data: schedules = [], isLoading: isLoadingSchedules } = useSchedules();
  const { data: employees = [] } = useEmployees();
  const { user } = useAuth();
  
  // Get employee ID for the current user
  const currentEmployee = employees.find(emp => emp.user_id === user?.id);
  
  // Filter schedules for the current employee
  const mySchedules = schedules.filter(schedule => 
    schedule.employee_id === currentEmployee?.id
  );
  
  // Function to determine status based on schedule data
  const getShiftStatus = (schedule: any): ShiftStatus => {
    const scheduleDate = parseISO(schedule.start_time);
    const today = new Date();
    
    if (scheduleDate < today) {
      return 'completed';
    }
    
    return schedule.status === 'pending' ? 'pending' : 'confirmed';
  };
  
  // Function to generate days of week header
  const renderDaysOfWeek = () => {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    return (
      <div className="grid grid-cols-7 text-center my-4">
        {days.map(day => (
          <div key={day} className="text-gray-600 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
    );
  };
  
  // Function to generate the calendar grid for the month
  const renderCalendarDays = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Get the day of the week for the first day (0 is Sunday, 1 is Monday, etc.)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    // Adjust for Monday as first day of week
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    
    const days = [];
    
    // Add days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - firstDayOfWeek + i + 1);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Calculate remaining days to fill out the grid (adding days from next month)
    const remainingDays = 42 - days.length; // 6 rows x 7 columns = 42 cells
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Group days into rows
    const rows = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    
    return rows.map((row, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid grid-cols-7 gap-1 mb-1">
        {row.map(({ date, isCurrentMonth }, dayIndex) => {
          const daySchedules = mySchedules.filter(schedule => 
            isSameDay(parseISO(schedule.start_time), date)
          );
          
          const hasCompletedShift = daySchedules.some(schedule => 
            getShiftStatus(schedule) === 'completed'
          );
          
          const hasPendingShift = daySchedules.some(schedule => 
            getShiftStatus(schedule) === 'pending'
          );
          
          const hasConfirmedShift = daySchedules.some(schedule => 
            getShiftStatus(schedule) === 'confirmed'
          );
          
          return (
            <div 
              key={`day-${rowIndex}-${dayIndex}`}
              className={`
                p-2 aspect-square flex flex-col items-center justify-center relative
                ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'} 
                ${isToday(date) ? 'border-2 border-blue-500 rounded-lg' : ''} 
                hover:bg-gray-100 transition-colors cursor-pointer
              `}
              onClick={() => {
                if (daySchedules.length > 0) {
                  setSelectedScheduleId(daySchedules[0].id);
                  setIsInfoDialogOpen(true);
                }
              }}
            >
              <span className={`text-lg font-semibold ${hasCompletedShift ? 'text-gray-500' : ''}`}>
                {date.getDate()}
              </span>
              
              {/* Status indicators */}
              {hasCompletedShift && (
                <div className="absolute bottom-1 right-1">
                  <Check className="h-4 w-4 text-blue-500" />
                </div>
              )}
              
              {hasPendingShift && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 rounded-b-lg" />
              )}
              
              {hasConfirmedShift && !hasPendingShift && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-b-lg" />
              )}
            </div>
          );
        })}
      </div>
    ));
  };
  
  // Helper to handle email click
  const handleEmailClick = (schedule: any) => {
    // Email setup logic
    const subject = `Regarding shift on ${format(parseISO(schedule.start_time), 'MMMM d, yyyy')}`;
    const body = `Hello,\n\nI would like to discuss my shift scheduled for ${format(parseISO(schedule.start_time), 'MMMM d, yyyy')} from ${format(parseISO(schedule.start_time), 'h:mm a')} to ${format(parseISO(schedule.end_time), 'h:mm a')}.`;
    
    window.location.href = `mailto:manager@workplace.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  // Helper to handle shift cancellation
  const handleCancelShift = (scheduleId: string) => {
    // In a real app, this would call an API to cancel the shift
    toast.success("Shift cancellation request sent.");
    setIsCancelDialogOpen(false);
  };
  
  // Get selected schedule
  const selectedSchedule = selectedScheduleId 
    ? schedules.find(s => s.id === selectedScheduleId) 
    : null;
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Render shift details
  const renderShiftDetails = (schedule: any) => {
    const startTime = parseISO(schedule.start_time);
    const endTime = parseISO(schedule.end_time);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
    const status = getShiftStatus(schedule);
    
    return (
      <div className="p-4 bg-white rounded-xl shadow-md mb-3" key={schedule.id}>
        <div className="flex items-start">
          {/* Date box */}
          <div className="bg-blue-500 text-white p-2 rounded-lg text-center w-20 mr-3">
            <div className="text-lg font-bold">{format(startTime, 'EEE').toUpperCase()}</div>
            <div className="text-2xl font-bold">{format(startTime, 'd')}</div>
            <div className="text-sm">{format(startTime, 'MMM').toUpperCase()}</div>
          </div>
          
          {/* Shift details */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>
            
            <div className="text-2xl font-bold mb-1">
              {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                <span>{duration} hours</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1.5 text-gray-500" />
                <span>Williams</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
                <span>{schedule.location || 'Kings Cross'}</span>
              </div>
            </div>
            
            <div className="flex mt-3 space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        setSelectedScheduleId(schedule.id);
                        setIsInfoDialogOpen(true);
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Shift details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleEmailClick(schedule)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Contact manager</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {status !== 'completed' && (
                <Button 
                  variant="outline" 
                  className="h-8 px-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setSelectedScheduleId(schedule.id);
                    setIsCancelDialogOpen(true);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoadingSchedules) {
    return <div className="p-4 text-center">Loading schedule...</div>;
  }
  
  return (
    <div className="pb-6 max-w-4xl mx-auto">
      <WeeklyCalendarView
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        schedules={schedules}
      />
      
      {/* Calendar Navigation */}
      <div className="flex justify-between items-center p-4 bg-white">
        <button onClick={prevMonth} className="p-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} className="p-2">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
      <div className="border-t border-gray-200 my-2" />
      
      {/* Days of week and calendar */}
      <div className="px-4">
        {renderDaysOfWeek()}
        {renderCalendarDays()}
      </div>
      
      {/* Schedule Tabs */}
      <div className="px-4 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="my-shifts">My Shifts</TabsTrigger>
            <TabsTrigger value="open-shifts">Open Shifts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-shifts" className="mt-4">
            {mySchedules.length > 0 ? (
              mySchedules
                .filter(schedule => getShiftStatus(schedule) === 'confirmed')
                .map(schedule => renderShiftDetails(schedule))
            ) : (
              <p className="text-center text-gray-500 py-4">No upcoming shifts</p>
            )}
          </TabsContent>
          
          <TabsContent value="open-shifts" className="mt-4">
            <p className="text-center text-gray-500 py-4">No open shifts available</p>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4">
            {mySchedules
              .filter(schedule => getShiftStatus(schedule) === 'pending')
              .map(schedule => renderShiftDetails(schedule))
            }
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {mySchedules
              .filter(schedule => getShiftStatus(schedule) === 'completed')
              .map(schedule => renderShiftDetails(schedule))
            }
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Shift Info Dialog */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Date</h4>
                  <p>{format(parseISO(selectedSchedule.start_time), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Time</h4>
                  <p>{format(parseISO(selectedSchedule.start_time), 'h:mm a')} - {format(parseISO(selectedSchedule.end_time), 'h:mm a')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Location</h4>
                  <p>{selectedSchedule.location || 'Kings Cross'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Break</h4>
                  <p>30 minutes (unpaid)</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Staff working</h4>
                <ul className="list-disc list-inside">
                  <li>Williams</li>
                  <li>Thompson</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Managers on duty</h4>
                <ul className="list-disc list-inside">
                  <li>Jane Cooper</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Notes</h4>
                <p>{selectedSchedule.notes || 'No additional notes'}</p>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInfoDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Shift Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              No, keep shift
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => selectedScheduleId && handleCancelShift(selectedScheduleId)}
            >
              Yes, cancel shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeScheduleView;
