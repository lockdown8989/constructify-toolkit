
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, List, Filter, Search, Download, Bell, Grid3X3, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLeaveCalendar } from '@/hooks/leave/use-leave-requests';
import { useEmployees } from '@/hooks/use-employees';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const LEAVE_TYPE_COLORS = {
  'Holiday': 'bg-blue-500',
  'Sickness': 'bg-red-500', 
  'Personal': 'bg-purple-500',
  'Parental': 'bg-green-500',
  'Other': 'bg-gray-600',
  'Annual': 'bg-blue-500'
};

type ViewType = 'month' | 'week' | 'list';

export default function ModernLeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<string[]>([]);
  
  const isMobile = useIsMobile();
  const { theme, resolvedTheme } = useTheme();
  const { data: leaves = [] } = useLeaveCalendar();
  const { data: employees = [] } = useEmployees();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

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

  const calculateTotalLeave = () => {
    const monthLeaves = leaves.filter(leave => {
      const leaveDate = new Date(leave.start_date);
      return isSameMonth(leaveDate, currentDate);
    });
    return monthLeaves.length;
  };

  const renderCalendarGrid = () => {
    const days = [];
    let day = startDate;
    const rows = [];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayLeaves = getLeavesForDate(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isCurrentDay = isToday(day);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative h-16 md:h-20 p-2 cursor-pointer transition-all duration-300 ease-out",
              "rounded-2xl border backdrop-blur-xl",
              isCurrentMonth 
                ? "bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-900/90" 
                : "bg-gray-50/50 dark:bg-gray-800/30 text-gray-400 border-gray-100/30 dark:border-gray-800/30",
              isCurrentDay && "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-300/50 shadow-lg",
              isSelected && "bg-blue-100/80 dark:bg-blue-900/40 border-blue-400/60 shadow-xl scale-105",
              "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5"
            )}
            onClick={() => {
              setSelectedDate(day);
            }}
          >
            <div className={cn(
              "text-sm font-semibold mb-1",
              isCurrentDay && "text-blue-600 dark:text-blue-400 font-bold text-base",
              isSelected && "text-blue-700 dark:text-blue-300"
            )}>
              {format(day, 'd')}
            </div>
            
            {dayLeaves.length > 0 && (
              <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1">
                {dayLeaves.slice(0, 2).map((leave, index) => (
                  <div
                    key={`${leave.id}-${index}`}
                    className={cn(
                      "w-2 h-2 rounded-full shadow-sm",
                      LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other']
                    )}
                  />
                ))}
                {dayLeaves.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    +{dayLeaves.length - 2}
                  </div>
                )}
              </div>
            )}
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      if (days.length === 7) {
        rows.push(
          <div key={rows.length} className="grid grid-cols-7 gap-2 mb-2">
            {days}
          </div>
        );
        days.length = 0;
      }
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Leave Calendar
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Color-coded employee leave management
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl p-1 shadow-inner backdrop-blur-sm">
                <Button
                  variant={viewType === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('month')}
                  className={cn(
                    "h-10 px-4 rounded-xl transition-all duration-300",
                    viewType === 'month' 
                      ? "bg-white dark:bg-gray-700 shadow-lg" 
                      : "hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  )}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Month
                </Button>
                <Button
                  variant={viewType === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('week')}
                  className={cn(
                    "h-10 px-4 rounded-xl transition-all duration-300",
                    viewType === 'week' 
                      ? "bg-white dark:bg-gray-700 shadow-lg" 
                      : "hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  )}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Week
                </Button>
                <Button
                  variant={viewType === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('list')}
                  className={cn(
                    "h-10 px-4 rounded-xl transition-all duration-300",
                    viewType === 'list' 
                      ? "bg-white dark:bg-gray-700 shadow-lg" 
                      : "hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  )}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by employee or leave type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-200 shadow-sm"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-14 px-6 rounded-2xl border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 shadow-sm"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Leave Type Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            {Object.entries(LEAVE_TYPE_COLORS).filter(([type]) => type !== 'Sickness').map(([type, color]) => (
              <div key={type} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm">
                <div className={cn("w-3 h-3 rounded-full shadow-sm", color)} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200/30 dark:border-gray-700/30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="h-12 w-12 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="h-12 w-12 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 px-4 pb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <div key={dayName} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
              {dayName}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewType === 'month' ? (
          <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              {renderCalendarGrid()}
            </CardContent>
          </Card>
        ) : viewType === 'week' ? (
          <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Week view coming soon</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => (
              <Card key={leave.id} className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-5 h-5 rounded-full shadow-sm",
                        LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other']
                      )} />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {getEmployeeName(leave.employee_id)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {leave.type} • {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={leave.status === 'Approved' ? 'default' : 'secondary'}
                      className="rounded-full px-3 py-1"
                    >
                      {leave.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Stats Bar */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-t border-gray-200/50 dark:border-gray-700/50 p-4">
        <Card className="backdrop-blur-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200/50 dark:border-blue-800/50 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Monthly Summary
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(currentDate, 'MMMM yyyy')}
                </p>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {calculateTotalLeave()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Leaves
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {leaves.filter(l => l.status === 'Approved').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Approved
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
