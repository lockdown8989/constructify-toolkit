
import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfYear, endOfYear } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, List, Filter, Menu, User, Clock, MapPin, Phone, Mail, Briefcase, TrendingUp, AlertCircle, X, Eye, Users, BarChart3, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLeaveCalendar } from '@/hooks/leave/use-leave-requests';
import { useEmployees } from '@/hooks/use-employees';
import { useAuth } from '@/hooks/use-auth';
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

const LEAVE_TYPE_ICONS = {
  'Holiday': '🏖️',
  'Sickness': '🤒',
  'Personal': '👤',
  'Parental': '👶',
  'Other': '📄',
  'Annual': '🏖️'
};

type ViewType = 'month' | 'week' | 'list';

export default function ModernLeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  const { data: leaves = [] } = useLeaveCalendar();
  const { data: employees = [] } = useEmployees();
  const { user } = useAuth();

  // Check if user is manager/admin
  const isManager = useMemo(() => {
    // This would typically check user roles
    return true; // For demo purposes, assume all users are managers
  }, [user]);

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

  const getEmployeeLeaveHistory = (employeeId: string) => {
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    
    return leaves.filter(leave => {
      const leaveStart = new Date(leave.start_date);
      return leave.employee_id === employeeId && 
             leaveStart >= yearStart && 
             leaveStart <= yearEnd;
    }).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  };

  const getEmployeeDaysUsed = (employeeId: string, leaveType?: string) => {
    const employeeLeaves = getEmployeeLeaveHistory(employeeId);
    const filteredLeaves = leaveType 
      ? employeeLeaves.filter(leave => leave.type === leaveType && leave.status === 'Approved')
      : employeeLeaves.filter(leave => leave.status === 'Approved');
    
    return filteredLeaves.reduce((total, leave) => {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDetailsModal(true);
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
                          "hover:scale-[1.02] hover:shadow-lg transform-gpu active:scale-95",
                          isCurrentMonth 
                            ? resolvedTheme === 'dark' 
                              ? "bg-card/60 border-border/40 text-card-foreground hover:bg-card/80" 
                              : "bg-white/60 border-gray-200/40 hover:bg-white/80"
                            : resolvedTheme === 'dark'
                              ? "bg-muted/20 border-border/20 text-muted-foreground"
                              : "bg-gray-50/40 border-gray-100/40 text-gray-400",
                          isCurrentDay && "ring-2 ring-primary/50 bg-primary/10 shadow-md",
                          isSelected && "ring-2 ring-primary shadow-xl scale-[1.02]",
                          dayLeaves.length > 0 && "ring-1 ring-blue-200 bg-blue-50/30",
                          isMobile ? "h-10 p-1" : "h-16 md:h-20 p-2"
                        )}
                        onClick={() => handleDateClick(day)}
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

      {/* Stats Bar */}
      <div className={cn(
        "sticky bottom-0 backdrop-blur-xl border-t transition-all duration-300",
        "bg-background/80 border-border/40 p-4",
        isMobile ? "p-3" : "p-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={cn("font-bold text-foreground", isMobile ? "text-sm" : "text-lg")}>
                {filteredLeaves.length}
              </div>
              <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                {isMobile ? "Requests" : "Leave Requests"}
              </div>
            </div>
            <div className="text-center">
              <div className={cn("font-bold text-foreground", isMobile ? "text-sm" : "text-lg")}>
                {filteredLeaves.reduce((total, leave) => {
                  const start = new Date(leave.start_date);
                  const end = new Date(leave.end_date);
                  return total + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                }, 0)}
              </div>
              <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                {isMobile ? "Days" : "Total Days"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Manager Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className={cn(
          "max-w-6xl max-h-[95vh] overflow-hidden animate-scale-in",
          isMobile ? "w-[98vw] h-[90vh] rounded-2xl p-2" : "rounded-3xl"
        )}>
          <DialogHeader className={cn(isMobile ? "pb-2" : "pb-4")}>
            <div className="flex items-center justify-between">
              <DialogTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-base" : "text-xl"
              )}>
                <Calendar className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                {selectedDate && format(selectedDate, isMobile ? 'MMM d, yyyy' : 'EEEE, MMMM d, yyyy')}
              </DialogTitle>
              {isManager && (
                <Badge variant="secondary" className={cn(
                  "flex items-center gap-1",
                  isMobile ? "text-xs px-2 py-1" : "text-sm"
                )}>
                  <Eye className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  Manager View
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          {selectedDate && (
            <ScrollArea className={cn(
              "pr-4",
              isMobile ? "h-[75vh]" : "h-[70vh]"
            )}>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className={cn(
                  "grid w-full mb-4",
                  isMobile ? "grid-cols-3 h-8" : "grid-cols-4 h-10"
                )}>
                  <TabsTrigger value="overview" className={cn(
                    "transition-all duration-200",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {isMobile ? "Today" : "Overview"}
                  </TabsTrigger>
                  <TabsTrigger value="details" className={cn(
                    "transition-all duration-200",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {isMobile ? "Details" : "Detailed View"}
                  </TabsTrigger>
                  <TabsTrigger value="history" className={cn(
                    "transition-all duration-200",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {isMobile ? "History" : "Employee History"}
                  </TabsTrigger>
                  {!isMobile && (
                    <TabsTrigger value="analytics" className="transition-all duration-200 text-sm">
                      Analytics
                    </TabsTrigger>
                  )}
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0 space-y-4">
                  {/* Quick Stats */}
                  <div className={cn(
                    "grid gap-3",
                    isMobile ? "grid-cols-2 gap-2" : "grid-cols-4 gap-4"
                  )}>
                    <Card className={cn(
                      "p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
                      isMobile ? "p-2" : "p-4"
                    )}>
                      <div className="flex items-center gap-2">
                        <Users className={cn(
                          "text-blue-600",
                          isMobile ? "h-4 w-4" : "h-5 w-5"
                        )} />
                        <div>
                          <div className={cn(
                            "font-bold text-blue-700",
                            isMobile ? "text-lg" : "text-xl"
                          )}>
                            {getLeavesForDate(selectedDate).length}
                          </div>
                          <div className={cn(
                            "text-blue-600",
                            isMobile ? "text-xs" : "text-sm"
                          )}>
                            {isMobile ? "On Leave" : "Employees on Leave"}
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className={cn(
                      "p-3 bg-gradient-to-br from-green-50 to-green-100 border-green-200",
                      isMobile ? "p-2" : "p-4"
                    )}>
                      <div className="flex items-center gap-2">
                        <Activity className={cn(
                          "text-green-600",
                          isMobile ? "h-4 w-4" : "h-5 w-5"
                        )} />
                        <div>
                          <div className={cn(
                            "font-bold text-green-700",
                            isMobile ? "text-lg" : "text-xl"
                          )}>
                            {employees.length - getLeavesForDate(selectedDate).length}
                          </div>
                          <div className={cn(
                            "text-green-600",
                            isMobile ? "text-xs" : "text-sm"
                          )}>
                            {isMobile ? "Available" : "Available Staff"}
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    {!isMobile && (
                      <>
                        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                            <div>
                              <div className="text-xl font-bold text-purple-700">
                                {Math.round((getLeavesForDate(selectedDate).length / employees.length) * 100)}%
                              </div>
                              <div className="text-sm text-purple-600">Coverage Impact</div>
                            </div>
                          </div>
                        </Card>
                        
                        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <div>
                              <div className="text-xl font-bold text-orange-700">
                                {getLeavesForDate(selectedDate).filter(l => l.type === 'Sickness').length}
                              </div>
                              <div className="text-sm text-orange-600">Sick Leaves</div>
                            </div>
                          </div>
                        </Card>
                      </>
                    )}
                  </div>
                  
                  {/* Today's Leave Requests */}
                  <div className="space-y-3">
                    <h3 className={cn(
                      "font-semibold flex items-center gap-2",
                      isMobile ? "text-sm" : "text-lg"
                    )}>
                      <Calendar className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                      {isMobile ? "Today's Leaves" : "Leave Requests for Today"}
                    </h3>
                    
                    {getLeavesForDate(selectedDate).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className={cn(
                          "mx-auto mb-4 opacity-50",
                          isMobile ? "h-8 w-8" : "h-12 w-12"
                        )} />
                        <p className={cn(isMobile ? "text-sm" : "text-base")}>
                          No leave requests for this date
                        </p>
                        <p className={cn(
                          "text-muted-foreground mt-2",
                          isMobile ? "text-xs" : "text-sm"
                        )}>
                          Full team availability
                        </p>
                      </div>
                    ) : (
                      <div className={cn(
                        "grid gap-3",
                        isMobile ? "grid-cols-1 gap-2" : "grid-cols-1 md:grid-cols-2 gap-4"
                      )}>
                        {getLeavesForDate(selectedDate).map((leave, index) => {
                          const employee = employees.find(emp => emp.id === leave.employee_id);
                          const daysDuration = Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          
                          return (
                            <Card key={leave.id} className={cn(
                              "p-3 border-l-4 transition-all duration-300 hover:shadow-lg cursor-pointer",
                              isMobile ? "p-3" : "p-4"
                            )} 
                            style={{
                              borderLeftColor: leave.type === 'Holiday' ? '#3b82f6' : 
                                             leave.type === 'Sickness' ? '#ef4444' :
                                             leave.type === 'Personal' ? '#a855f7' :
                                             leave.type === 'Parental' ? '#22c55e' : '#6b7280'
                            }}
                            onClick={() => setSelectedEmployee(employee?.id || null)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex items-center gap-2">
                                  <span className={cn(isMobile ? "text-lg" : "text-xl")}>
                                    {LEAVE_TYPE_ICONS[leave.type] || '📄'}
                                  </span>
                                  <div className={cn(
                                    "rounded-full",
                                    LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other'],
                                    isMobile ? "w-3 h-3" : "w-4 h-4"
                                  )} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className={cn(
                                      "font-semibold text-foreground",
                                      isMobile ? "text-sm" : "text-base"
                                    )}>
                                      {getEmployeeName(leave.employee_id)}
                                    </h4>
                                    <Badge variant={leave.status === 'Approved' ? 'default' : 
                                                  leave.status === 'Pending' ? 'secondary' : 'destructive'} 
                                           className={cn(isMobile ? "text-xs" : "text-sm")}>
                                      {leave.status}
                                    </Badge>
                                  </div>
                                  
                                  <div className={cn(
                                    "grid gap-2 text-muted-foreground",
                                    isMobile ? "grid-cols-1 gap-1 text-xs" : "grid-cols-2 gap-2 text-sm"
                                  )}>
                                    <div className="flex items-center gap-2">
                                      <Clock className={cn(isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                      <span>{leave.type} ({daysDuration} {daysDuration === 1 ? 'day' : 'days'})</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Calendar className={cn(isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                      <span>
                                        {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')}
                                      </span>
                                    </div>
                                    
                                    {employee && (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <Briefcase className={cn(isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                          <span>{employee.job_title}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          <MapPin className={cn(isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                          <span>{employee.department}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  
                                  {leave.notes && (
                                    <div className={cn(
                                      "mt-3 p-2 bg-muted/50 rounded-lg",
                                      isMobile ? "text-xs" : "text-sm"
                                    )}>
                                      <span className="font-medium">Notes: </span>
                                      {leave.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Details Tab */}
                <TabsContent value="details" className="mt-0 space-y-4">
                  <div className="space-y-4">
                    <h3 className={cn(
                      "font-semibold",
                      isMobile ? "text-sm" : "text-lg"
                    )}>
                      Detailed Leave Information
                    </h3>
                    
                    {getLeavesForDate(selectedDate).map((leave, index) => {
                      const employee = employees.find(emp => emp.id === leave.employee_id);
                      const employeeHistory = getEmployeeLeaveHistory(leave.employee_id);
                      const totalDaysThisYear = getEmployeeDaysUsed(leave.employee_id);
                      
                      return (
                        <Card key={leave.id} className={cn(
                          "p-4 space-y-4",
                          isMobile ? "p-3" : "p-6"
                        )}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={cn(
                                "font-semibold text-foreground",
                                isMobile ? "text-base" : "text-lg"
                              )}>
                                {getEmployeeName(leave.employee_id)}
                              </h4>
                              <p className={cn(
                                "text-muted-foreground",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                                {employee?.job_title} • {employee?.department}
                              </p>
                            </div>
                            <Badge variant={leave.status === 'Approved' ? 'default' : 'secondary'}>
                              {leave.status}
                            </Badge>
                          </div>
                          
                          <Separator />
                          
                          <div className={cn(
                            "grid gap-4",
                            isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-6"
                          )}>
                            <div className="space-y-3">
                              <h5 className={cn(
                                "font-medium",
                                isMobile ? "text-sm" : "text-base"
                              )}>
                                Leave Details
                              </h5>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{LEAVE_TYPE_ICONS[leave.type] || '📄'}</span>
                                  <span className={cn(isMobile ? "text-sm" : "text-base")}>
                                    {leave.type} Leave
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                  <span className={cn(isMobile ? "text-xs" : "text-sm")}>
                                    {format(new Date(leave.start_date), 'EEEE, MMMM d, yyyy')} - {format(new Date(leave.end_date), 'EEEE, MMMM d, yyyy')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                  <span className={cn(isMobile ? "text-xs" : "text-sm")}>
                                    Duration: {Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h5 className={cn(
                                "font-medium",
                                isMobile ? "text-sm" : "text-base"
                              )}>
                                Year Summary
                              </h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className={cn(
                                    "text-muted-foreground",
                                    isMobile ? "text-xs" : "text-sm"
                                  )}>
                                    Total Days Used:
                                  </span>
                                  <span className={cn(
                                    "font-medium",
                                    isMobile ? "text-sm" : "text-base"
                                  )}>
                                    {totalDaysThisYear}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={cn(
                                    "text-muted-foreground",
                                    isMobile ? "text-xs" : "text-sm"
                                  )}>
                                    Holiday Days:
                                  </span>
                                  <span className={cn(
                                    "font-medium",
                                    isMobile ? "text-sm" : "text-base"
                                  )}>
                                    {getEmployeeDaysUsed(leave.employee_id, 'Holiday')} / {employee?.annual_leave_days || 25}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={cn(
                                    "text-muted-foreground",
                                    isMobile ? "text-xs" : "text-sm"
                                  )}>
                                    Sick Days:
                                  </span>
                                  <span className={cn(
                                    "font-medium",
                                    isMobile ? "text-sm" : "text-base"
                                  )}>
                                    {getEmployeeDaysUsed(leave.employee_id, 'Sickness')} / {employee?.sick_leave_days || 10}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={cn(
                                    "text-muted-foreground",
                                    isMobile ? "text-xs" : "text-sm"
                                  )}>
                                    Total Requests:
                                  </span>
                                  <span className={cn(
                                    "font-medium",
                                    isMobile ? "text-sm" : "text-base"
                                  )}>
                                    {employeeHistory.length}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {leave.notes && (
                            <>
                              <Separator />
                              <div>
                                <h5 className={cn(
                                  "font-medium mb-2",
                                  isMobile ? "text-sm" : "text-base"
                                )}>
                                  Notes
                                </h5>
                                <p className={cn(
                                  "text-muted-foreground bg-muted/50 p-3 rounded-lg",
                                  isMobile ? "text-xs" : "text-sm"
                                )}>
                                  {leave.notes}
                                </p>
                              </div>
                            </>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
                
                {/* Employee History Tab */}
                <TabsContent value="history" className="mt-0">
                  <div className={cn("space-y-3", isMobile ? "space-y-2" : "space-y-4")}>
                    {employees.filter(emp => getEmployeeLeaveHistory(emp.id).length > 0).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <User className={cn(
                          "mx-auto mb-4 opacity-50",
                          isMobile ? "h-8 w-8" : "h-12 w-12"
                        )} />
                        <p className={cn(isMobile ? "text-sm" : "text-base")}>
                          No employee leave history found
                        </p>
                      </div>
                    ) : (
                      employees.filter(emp => getEmployeeLeaveHistory(emp.id).length > 0).map((employee, index) => {
                        const employeeLeaves = getEmployeeLeaveHistory(employee.id);
                        const totalDaysUsed = getEmployeeDaysUsed(employee.id);
                        const sickDaysUsed = getEmployeeDaysUsed(employee.id, 'Sickness');
                        const holidayDaysUsed = getEmployeeDaysUsed(employee.id, 'Holiday');
                        
                        return (
                          <Card key={employee.id} className={cn(
                            "p-3 transition-all duration-300 hover:shadow-lg",
                            isMobile ? "p-3" : "p-4"
                          )}>
                            <div className={cn(
                              "flex items-start justify-between mb-4",
                              isMobile ? "flex-col gap-2" : "flex-row"
                            )}>
                              <div className="flex-1">
                                <h3 className={cn(
                                  "font-semibold text-foreground",
                                  isMobile ? "text-base" : "text-lg"
                                )}>
                                  {employee.name}
                                </h3>
                                <div className={cn(
                                  "flex items-center gap-4 text-muted-foreground mt-1",
                                  isMobile ? "flex-col items-start gap-1 text-xs" : "text-sm"
                                )}>
                                  <span className="flex items-center gap-1">
                                    <Briefcase className={cn(isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                    {employee.job_title}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className={cn(isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                    {employee.department}
                                  </span>
                                </div>
                              </div>
                              
                              <div className={cn(
                                "text-center",
                                isMobile ? "self-end" : "text-right"
                              )}>
                                <div className={cn(
                                  "font-bold text-primary",
                                  isMobile ? "text-xl" : "text-2xl"
                                )}>
                                  {totalDaysUsed}
                                </div>
                                <div className={cn(
                                  "text-muted-foreground",
                                  isMobile ? "text-xs" : "text-xs"
                                )}>
                                  Total Days Used
                                </div>
                              </div>
                            </div>
                            
                            <div className={cn(
                              "grid gap-3 mb-4",
                              isMobile ? "grid-cols-2 gap-2" : "grid-cols-2 md:grid-cols-4 gap-4"
                            )}>
                              <div className={cn(
                                "text-center p-2 bg-blue-50 rounded-lg",
                                isMobile ? "p-2" : "p-2"
                              )}>
                                <div className={cn(
                                  "font-semibold text-blue-600",
                                  isMobile ? "text-base" : "text-lg"
                                )}>
                                  {holidayDaysUsed}
                                </div>
                                <div className={cn(
                                  "text-blue-600",
                                  isMobile ? "text-xs" : "text-xs"
                                )}>
                                  Holiday Days
                                </div>
                                <div className={cn(
                                  "text-muted-foreground",
                                  isMobile ? "text-[10px]" : "text-xs"
                                )}>
                                  of {employee.annual_leave_days || 25} available
                                </div>
                              </div>
                              
                              <div className={cn(
                                "text-center p-2 bg-red-50 rounded-lg",
                                isMobile ? "p-2" : "p-2"
                              )}>
                                <div className={cn(
                                  "font-semibold text-red-600",
                                  isMobile ? "text-base" : "text-lg"
                                )}>
                                  {sickDaysUsed}
                                </div>
                                <div className={cn(
                                  "text-red-600",
                                  isMobile ? "text-xs" : "text-xs"
                                )}>
                                  Sick Days
                                </div>
                                <div className={cn(
                                  "text-muted-foreground",
                                  isMobile ? "text-[10px]" : "text-xs"
                                )}>
                                  of {employee.sick_leave_days || 10} available
                                </div>
                              </div>
                              
                              {!isMobile && (
                                <>
                                  <div className="text-center p-2 bg-green-50 rounded-lg">
                                    <div className="text-lg font-semibold text-green-600">
                                      {employeeLeaves.filter(l => l.status === 'Approved').length}
                                    </div>
                                    <div className="text-xs text-green-600">Approved</div>
                                  </div>
                                  
                                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                                    <div className="text-lg font-semibold text-yellow-600">
                                      {employeeLeaves.filter(l => l.status === 'Pending').length}
                                    </div>
                                    <div className="text-xs text-yellow-600">Pending</div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className={cn(
                                "font-medium flex items-center gap-2 mb-2",
                                isMobile ? "text-sm" : "text-sm"
                              )}>
                                <TrendingUp className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                Recent Leave History ({new Date().getFullYear()})
                              </h4>
                              {employeeLeaves.slice(0, isMobile ? 3 : 5).map((leave, leaveIndex) => (
                                <div key={leave.id} className={cn(
                                  "flex items-center gap-3 p-2 bg-muted/30 rounded-lg",
                                  isMobile ? "p-2" : "p-2"
                                )}>
                                  <div className={cn(
                                    "rounded-full",
                                    LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other'],
                                    isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                                  )} />
                                  <div className={cn(
                                    "flex-1 flex items-center justify-between",
                                    isMobile ? "text-xs flex-col items-start gap-1" : "text-sm"
                                  )}>
                                    <span className="font-medium">{leave.type}</span>
                                    <span className="text-muted-foreground">
                                      {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')}
                                    </span>
                                    <Badge variant={leave.status === 'Approved' ? 'default' : 'secondary'} 
                                           className={cn(
                                             isMobile ? "text-[10px] px-1.5 py-0.5" : "text-xs"
                                           )}>
                                      {leave.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              {employeeLeaves.length > (isMobile ? 3 : 5) && (
                                <div className={cn(
                                  "text-center text-muted-foreground",
                                  isMobile ? "text-xs" : "text-sm"
                                )}>
                                  +{employeeLeaves.length - (isMobile ? 3 : 5)} more leave requests this year
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </TabsContent>
                
                {/* Analytics Tab (Desktop Only) */}
                {!isMobile && (
                  <TabsContent value="analytics" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Leave Type Distribution</h3>
                        <div className="space-y-3">
                          {Object.entries(LEAVE_TYPE_COLORS).map(([type, color]) => {
                            const count = leaves.filter(leave => leave.type === type && leave.status === 'Approved').length;
                            const percentage = leaves.length ? (count / leaves.length) * 100 : 0;
                            
                            return (
                              <div key={type} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-4 h-4 rounded-full", color)} />
                                  <span className="text-sm">{type}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {count} ({percentage.toFixed(1)}%)
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                      
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Department Impact</h3>
                        <div className="space-y-3">
                          {[...new Set(employees.map(emp => emp.department))].map(department => {
                            const deptEmployees = employees.filter(emp => emp.department === department);
                            const deptOnLeave = getLeavesForDate(selectedDate).filter(leave => {
                              const employee = employees.find(emp => emp.id === leave.employee_id);
                              return employee?.department === department;
                            });
                            const impactPercentage = deptEmployees.length ? (deptOnLeave.length / deptEmployees.length) * 100 : 0;
                            
                            return (
                              <div key={department} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>{department}</span>
                                  <span className="text-muted-foreground">
                                    {deptOnLeave.length}/{deptEmployees.length} ({impactPercentage.toFixed(0)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${impactPercentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
