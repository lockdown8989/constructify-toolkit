
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, List, Filter, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLeaveCalendar } from '@/hooks/leave/use-leave-requests';
import { useEmployees } from '@/hooks/use-employees';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

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
  const { resolvedTheme } = useTheme();
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
            "relative h-16 md:h-20 p-2 cursor-pointer transition-all duration-300 rounded-2xl border backdrop-blur-sm",
            "hover:scale-[1.02] hover:shadow-lg transform-gpu",
            isCurrentMonth 
              ? resolvedTheme === 'dark' 
                ? "bg-card/60 border-border/40 text-card-foreground hover:bg-card/80" 
                : "bg-white/60 border-gray-200/40 hover:bg-white/80"
              : resolvedTheme === 'dark'
                ? "bg-muted/20 border-border/20 text-muted-foreground"
                : "bg-gray-50/40 border-gray-100/40 text-gray-400",
            isCurrentDay && "ring-2 ring-primary/50 bg-primary/10 shadow-md",
            isSelected && "ring-2 ring-primary shadow-xl scale-[1.02]"
          )}
          onClick={() => {
            setSelectedDate(day);
          }}
        >
          <div className={cn(
            "text-sm font-semibold mb-1 transition-colors duration-200",
            isCurrentDay && "text-primary font-bold"
          )}>
            {format(day, 'd')}
          </div>
          
          {dayLeaves.length > 0 && (
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
              {dayLeaves.slice(0, 3).map((leave, index) => (
                <div
                  key={`${leave.id}-${index}`}
                  className={cn(
                    "w-2 h-2 rounded-full shadow-sm transition-transform duration-200 hover:scale-125",
                    LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other']
                  )}
                />
              ))}
              {dayLeaves.length > 3 && (
                <div className="text-xs text-muted-foreground font-medium bg-background/80 rounded px-1">
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
      <div className="grid grid-cols-7 gap-3 p-6">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="text-center text-sm font-bold text-muted-foreground pb-3">
            {dayName}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderListView = () => (
    <div className="p-6 space-y-4">
      {filteredLeaves.map((leave) => (
        <Card key={leave.id} className={cn(
          "transition-all duration-300 hover:shadow-lg hover:scale-[1.01] transform-gpu",
          "backdrop-blur-sm border-border/40",
          resolvedTheme === 'dark' ? "bg-card/60" : "bg-white/60"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-4 h-4 rounded-full shadow-sm",
                  LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other']
                )} />
                <div>
                  <div className="font-semibold text-foreground">
                    {getEmployeeName(leave.employee_id)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {leave.type} • {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')}
                  </div>
                </div>
              </div>
              <Badge variant={leave.status === 'Approved' ? 'default' : 'secondary'} className="rounded-full">
                {leave.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ${isMobile ? 'pb-16' : ''}`}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300",
        resolvedTheme === 'dark' 
          ? "bg-background/80 border-border/40" 
          : "bg-white/80 border-gray-200/40"
      )}>
        <div className={cn("px-4 py-4", isMobile ? "px-3 py-3" : "px-4 py-6")}>
          {/* Top Bar */}
          <div className={cn("flex items-center justify-between", isMobile ? "mb-3" : "mb-6")}>
            <div className="flex items-center gap-3">
              <div>
                <h1 className={cn("font-bold text-foreground", isMobile ? "text-xl" : "text-2xl")}>
                  Leave Calendar
                </h1>
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  {isMobile ? "Team leave" : "Manage team leave requests"}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "rounded-full border-border/40 backdrop-blur-sm transition-all duration-300",
                "hover:shadow-lg hover:scale-105 transform-gpu",
                resolvedTheme === 'dark' ? "bg-card/60" : "bg-white/60"
              )}
            >
              <Filter className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
              {!isMobile && "Filters"}
            </Button>
          </div>

          {/* Month Navigation */}
          <div className={cn("flex items-center justify-between", isMobile ? "mb-3" : "mb-6")}>
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "icon"}
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="rounded-full hover:shadow-md transition-all duration-300 hover:scale-110 transform-gpu"
            >
              <ChevronLeft className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </Button>
            
            <h2 className={cn("font-bold text-foreground", isMobile ? "text-lg" : "text-xl")}>
              {format(currentDate, isMobile ? 'MMM yyyy' : 'MMMM yyyy')}
            </h2>
            
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "icon"}
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="rounded-full hover:shadow-md transition-all duration-300 hover:scale-110 transform-gpu"
            >
              <ChevronRight className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </Button>
          </div>

          {/* View Toggle */}
          <div className={cn("flex justify-center", isMobile ? "mb-3" : "mb-6")}>
            <div className={cn(
              "flex rounded-2xl p-1 transition-all duration-300",
              "backdrop-blur-sm border border-border/40",
              resolvedTheme === 'dark' ? "bg-card/60" : "bg-white/60"
            )}>
              <Button
                variant={viewType === 'month' ? 'default' : 'ghost'}
                size={isMobile ? "sm" : "sm"}
                onClick={() => setViewType('month')}
                className="rounded-xl transition-all duration-300 hover:scale-105 transform-gpu"
              >
                <Calendar className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                Month
              </Button>
              <Button
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size={isMobile ? "sm" : "sm"}
                onClick={() => setViewType('list')}
                className="rounded-xl transition-all duration-300 hover:scale-105 transform-gpu"
              >
                <List className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                List
              </Button>
            </div>
          </div>

          {/* Leave Type Legend */}
          {showFilters && (
            <div className={cn(
              "rounded-2xl p-3 mb-3 backdrop-blur-sm border transition-all duration-500",
              "animate-in slide-in-from-top-2",
              resolvedTheme === 'dark' 
                ? "bg-card/60 border-border/40" 
                : "bg-white/60 border-gray-200/40",
              isMobile ? "p-2" : "p-4"
            )}>
              <div className={cn(
                "flex flex-wrap gap-2",
                isMobile ? "gap-2" : "gap-3"
              )}>
                {Object.entries(LEAVE_TYPE_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-200">
                    <div className={cn("rounded-full shadow-sm", color, isMobile ? "w-2 h-2" : "w-3 h-3")} />
                    <span className={cn("text-foreground", isMobile ? "text-xs" : "text-sm")}>
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1">
        {viewType === 'month' ? (
          <Card className={cn(
            "shadow-xl border-0 rounded-3xl overflow-hidden transition-all duration-500",
            "backdrop-blur-sm border border-border/40",
            resolvedTheme === 'dark' ? "bg-card/60" : "bg-white/60",
            isMobile ? "m-2 rounded-2xl" : "m-4 rounded-3xl"
          )}>
            <CardContent className="p-0">
              <div className={cn("grid grid-cols-7", isMobile ? "gap-1 p-3" : "gap-3 p-6")}>
                {/* Day headers */}
                {(isMobile ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((dayName, index) => (
                  <div key={dayName} className="text-center text-sm font-bold text-muted-foreground pb-2">
                    {dayName}
                  </div>
                ))}
                
                {/* Calendar days */}
                {(() => {
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
                          "relative cursor-pointer transition-all duration-300 rounded-xl border backdrop-blur-sm",
                          "hover:scale-[1.02] hover:shadow-lg transform-gpu",
                          isCurrentMonth 
                            ? resolvedTheme === 'dark' 
                              ? "bg-card/60 border-border/40 text-card-foreground hover:bg-card/80" 
                              : "bg-white/60 border-gray-200/40 hover:bg-white/80"
                            : resolvedTheme === 'dark'
                              ? "bg-muted/20 border-border/20 text-muted-foreground"
                              : "bg-gray-50/40 border-gray-100/40 text-gray-400",
                          isCurrentDay && "ring-2 ring-primary/50 bg-primary/10 shadow-md",
                          isSelected && "ring-2 ring-primary shadow-xl scale-[1.02]",
                          isMobile ? "h-10 p-1" : "h-16 md:h-20 p-2"
                        )}
                        onClick={() => {
                          setSelectedDate(day);
                        }}
                      >
                        <div className={cn(
                          "font-semibold transition-colors duration-200",
                          isCurrentDay && "text-primary font-bold",
                          isMobile ? "text-xs mb-0" : "text-sm mb-1"
                        )}>
                          {format(day, 'd')}
                        </div>
                        
                        {dayLeaves.length > 0 && (
                          <div className={cn(
                            "absolute flex flex-wrap gap-1",
                            isMobile ? "bottom-0 left-0 right-0 justify-center" : "bottom-2 left-2 right-2"
                          )}>
                            {dayLeaves.slice(0, isMobile ? 2 : 3).map((leave, index) => (
                              <div
                                key={`${leave.id}-${index}`}
                                className={cn(
                                  "rounded-full shadow-sm transition-transform duration-200 hover:scale-125",
                                  LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other'],
                                  isMobile ? "w-1 h-1" : "w-2 h-2"
                                )}
                              />
                            ))}
                            {dayLeaves.length > (isMobile ? 2 : 3) && (
                              <div className={cn(
                                "text-muted-foreground font-medium bg-background/80 rounded",
                                isMobile ? "text-[10px] px-0.5" : "text-xs px-1"
                              )}>
                                +{dayLeaves.length - (isMobile ? 2 : 3)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                    
                    day = addDays(day, 1);
                  }

                  return days;
                })()}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={cn(isMobile ? "p-3 space-y-3" : "p-6 space-y-4")}>
            {filteredLeaves.map((leave) => (
              <Card key={leave.id} className={cn(
                "transition-all duration-300 hover:shadow-lg hover:scale-[1.01] transform-gpu",
                "backdrop-blur-sm border-border/40",
                resolvedTheme === 'dark' ? "bg-card/60" : "bg-white/60"
              )}>
                <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-full shadow-sm",
                        LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other'],
                        isMobile ? "w-3 h-3" : "w-4 h-4"
                      )} />
                      <div>
                        <div className={cn("font-semibold text-foreground", isMobile ? "text-sm" : "text-base")}>
                          {getEmployeeName(leave.employee_id)}
                        </div>
                        <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                          {leave.type} • {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={leave.status === 'Approved' ? 'default' : 'secondary'} 
                      className={cn("rounded-full", isMobile ? "text-xs" : "")}
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
      <div className={cn(
        "sticky bottom-0 backdrop-blur-xl border-t transition-all duration-300",
        resolvedTheme === 'dark' 
          ? "bg-background/80 border-border/40" 
          : "bg-white/80 border-gray-200/40"
      )}>
        <div className={cn(isMobile ? "p-3" : "p-4")}>
          <div className={cn(
            "flex items-center",
            isMobile ? "flex-col space-y-2 text-center" : "justify-between"
          )}>
            <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
              {filteredLeaves.length} leave request{filteredLeaves.length !== 1 ? 's' : ''} this month
            </div>
            <div className={cn("text-foreground font-medium", isMobile ? "text-xs" : "text-sm")}>
              Total Days: {filteredLeaves.reduce((acc, leave) => {
                const start = new Date(leave.start_date);
                const end = new Date(leave.end_date);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return acc + days;
              }, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
