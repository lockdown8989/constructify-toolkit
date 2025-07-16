
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, List, Filter, Search, Download, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLeaveCalendar } from '@/hooks/leave/use-leave-requests';
import { useEmployees } from '@/hooks/use-employees';
import LeaveTypeFilter from './calendar/LeaveTypeFilter';
import DateRangeFilter from './calendar/DateRangeFilter';
import LeaveDetailsDrawer from './calendar/LeaveDetailsDrawer';
import { cn } from '@/lib/utils';

const LEAVE_TYPE_COLORS = {
  'Holiday': 'bg-blue-500',
  'Sickness': 'bg-red-500', 
  'Personal': 'bg-purple-500',
  'Parental': 'bg-green-500',
  'Other': 'bg-gray-600',
  'Annual': 'bg-blue-500',
  'Sick': 'bg-red-500'
};

export default function ModernLeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<string[]>([]);
  
  const isMobile = useIsMobile();
  const { data: leaves = [] } = useLeaveCalendar();
  const { data: employees = [] } = useEmployees();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  const getLeavesForDate = (date: Date) => {
    return leaves.filter(leave => {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  const filteredLeaves = leaves.filter(leave => {
    const employeeName = getEmployeeName(leave.employee_id).toLowerCase();
    const matchesSearch = searchTerm === '' || 
      employeeName.includes(searchTerm.toLowerCase()) ||
      leave.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedLeaveTypes.length === 0 || 
      selectedLeaveTypes.includes(leave.type);
    
    return matchesSearch && matchesType;
  });

  const renderCalendarGrid = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const dayLeaves = getLeavesForDate(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isCurrentDay = isToday(day);
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      
      days.push(
        <div
          key={day.toString()}
          className={cn(
            "relative h-16 md:h-20 p-2 cursor-pointer transition-all duration-200 rounded-lg border",
            isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400",
            isCurrentDay && "bg-blue-50 border-blue-200 shadow-sm",
            isSelected && "bg-blue-100 border-blue-300 shadow-md",
            "hover:shadow-sm hover:scale-[1.02]"
          )}
          onClick={() => {
            setSelectedDate(day);
            if (dayLeaves.length > 0) {
              // Open details drawer for mobile or side panel for desktop
            }
          }}
        >
          <div className="text-sm font-medium mb-1">
            {format(day, 'd')}
          </div>
          
          {dayLeaves.length > 0 && (
            <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1">
              {dayLeaves.slice(0, 3).map((leave, index) => (
                <div
                  key={`${leave.id}-${index}`}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other']
                  )}
                />
              ))}
              {dayLeaves.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{dayLeaves.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      );
      
      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-2 p-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="text-center text-sm font-semibold text-gray-600 pb-2">
            {dayName}
          </div>
        ))}
        {days}
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Calendar</h1>
              <p className="text-sm text-gray-600">Color-coded employee leave calendar</p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewType === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('calendar')}
                  className="h-8 px-3"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Calendar
                </Button>
                <Button
                  variant={viewType === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by employee or leave type"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            
            <DateRangeFilter />
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 rounded-xl border-gray-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Leave Type Legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {Object.entries(LEAVE_TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", color)} />
                <span className="text-sm text-gray-600">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="h-8 w-8 p-0 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="h-8 w-8 p-0 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {viewType === 'calendar' ? (
          <Card className="m-4 shadow-sm border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {renderCalendarGrid()}
            </CardContent>
          </Card>
        ) : (
          <div className="p-4">
            {/* List view implementation */}
            <div className="space-y-3">
              {filteredLeaves.map((leave) => (
                <Card key={leave.id} className="p-4 rounded-xl shadow-sm border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full",
                        LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other']
                      )} />
                      <div>
                        <div className="font-medium text-gray-900">
                          {getEmployeeName(leave.employee_id)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {leave.type} • {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={leave.status === 'Approved' ? 'default' : 'secondary'}>
                      {leave.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <LeaveTypeFilter
          selectedTypes={selectedLeaveTypes}
          onTypeChange={setSelectedLeaveTypes}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Leave Details Drawer/Panel */}
      {selectedDate && (
        <LeaveDetailsDrawer
          date={selectedDate}
          leaves={getLeavesForDate(selectedDate)}
          onClose={() => setSelectedDate(null)}
          getEmployeeName={getEmployeeName}
        />
      )}
    </div>
  );
}
