import React, { useState, useEffect } from 'react';
import { format, isToday, isSameDay, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, addWeeks, addMonths, subMonths, subWeeks, isSameMonth, getDate, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar, Users, Clock, RotateCcw, ChevronLeft, ChevronRight, CalendarDays, Grid3x3, CalendarRange, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSchedules } from '@/hooks/use-schedules';
import { useOpenShifts } from '@/hooks/use-open-shifts';
import { useEmployees } from '@/hooks/use-employees';

// The proper handler interface 
interface ShiftSubmitters {
  handleAddShiftSubmit: (formData: any) => void;
  handleEmployeeShiftSubmit: (formData: any) => void;
  handleSwapShiftSubmit: (formData: any) => void;
  handleAddShiftClose: () => void;
  handleEmployeeShiftClose: () => void;
  handleSwapShiftClose: () => void;
  handleEmployeeAddShift: (employeeId: string, date: Date) => void;
}

// Update the component props to match
interface MobileCalendarViewProps {
  shiftState: any;
  handleSubmitters: ShiftSubmitters;
}

const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({ shiftState, handleSubmitters }) => {
  const { visibleDays = [], allEmployeeSchedules = [], handleNextPeriod, handlePreviousPeriod, handleAddShift, isManager, isAdmin, isHR } = shiftState;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [lastSync, setLastSync] = useState(new Date());
  
  // Fetch data for real-time synchronization
  const { data: schedules = [], refetch: refetchSchedules, isLoading } = useSchedules();
  const { openShifts = [] } = useOpenShifts();
  const { data: employees = [] } = useEmployees();
  
  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      await refetchSchedules();
      setLastSync(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchSchedules]);

  // Get current period days based on view mode
  const getCurrentPeriodDays = () => {
    if (viewMode === 'daily') {
      return [selectedDate];
    } else if (viewMode === 'weekly') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        weekDays.push(addDays(weekStart, i));
      }
      return weekDays;
    } else { // monthly
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const days = [];
      
      // Add days from previous month to fill first week
      const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      for (let day = firstWeekStart; day < monthStart; day = addDays(day, 1)) {
        days.push(day);
      }
      
      // Add all days of current month
      for (let day = monthStart; day <= monthEnd; day = addDays(day, 1)) {
        days.push(day);
      }
      
      // Add days from next month to fill last week
      const lastWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      for (let day = addDays(monthEnd, 1); day <= lastWeekEnd; day = addDays(day, 1)) {
        days.push(day);
      }
      
      return days;
    }
  };

  const currentPeriodDays = getCurrentPeriodDays();

  // Navigation functions
  const handlePrevious = () => {
    if (viewMode === 'daily') {
      setSelectedDate(subDays(selectedDate, 1));
    } else if (viewMode === 'weekly') {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'daily') {
      setSelectedDate(addDays(selectedDate, 1));
    } else if (viewMode === 'weekly') {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  // Get shifts for a specific day
  const getShiftsForDay = (day: Date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.start_time), day)
    );
  };

  // Get open shifts for a specific day
  const getOpenShiftsForDay = (day: Date) => {
    return openShifts.filter(shift => 
      isSameDay(new Date(shift.start_time), day)
    );
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetchSchedules();
    setLastSync(new Date());
    setIsRefreshing(false);
  };

  // Calculate current period stats
  const getCurrentPeriodStats = () => {
    const periodSchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return currentPeriodDays.some(day => isSameDay(scheduleDate, day));
    });

    const totalShifts = periodSchedules.length;
    // Check multiple ways to identify rota shifts: recurring flag, rota shift_type, or template_id
    const rotaShifts = periodSchedules.filter(s => 
      s.recurring === true || 
      s.shift_type === 'rota' || 
      s.shift_type === 'recurring' ||
      s.template_id !== null
    ).length;
    const singleShifts = totalShifts - rotaShifts;
    const totalEmployees = new Set(periodSchedules.map(s => s.employee_id).filter(Boolean)).size;
    const totalOpenShifts = openShifts.filter(shift => {
      const shiftDate = new Date(shift.start_time);
      return currentPeriodDays.some(day => isSameDay(shiftDate, day));
    }).length;

    return { totalShifts, rotaShifts, singleShifts, totalEmployees, totalOpenShifts };
  };

  const periodStats = getCurrentPeriodStats();

  // Get period header text
  const getPeriodHeaderText = () => {
    if (viewMode === 'daily') {
      return format(selectedDate, 'EEEE, MMM d, yyyy');
    } else if (viewMode === 'weekly') {
      const weekStart = currentPeriodDays[0];
      const weekEnd = currentPeriodDays[6];
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(selectedDate, 'MMMM yyyy');
    }
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    if (viewMode === 'daily') {
      const dayShifts = getShiftsForDay(selectedDate);
      const dayOpenShifts = getOpenShiftsForDay(selectedDate);
      
      return (
        <Card className="mx-4 mb-4">
          <div className="p-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg">{format(selectedDate, 'EEEE')}</h3>
              <p className="text-2xl font-bold">{format(selectedDate, 'd')}</p>
              <p className="text-sm text-muted-foreground">{format(selectedDate, 'MMMM yyyy')}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scheduled Shifts:</span>
                <Badge variant="outline">{dayShifts.length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Open Shifts:</span>
                <Badge variant={dayOpenShifts.length > 0 ? "destructive" : "outline"}>
                  {dayOpenShifts.length}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      );
    } else if (viewMode === 'weekly') {
      return (
        <div className="grid grid-cols-7 gap-1 mb-4 px-4">
          {currentPeriodDays.map((day, i) => {
            const dayShifts = getShiftsForDay(day);
            const dayOpenShifts = getOpenShiftsForDay(day);
            const hasShifts = dayShifts.length > 0;
            const hasOpenShifts = dayOpenShifts.length > 0;
            
            return (
              <div 
                key={i} 
                className={cn(
                  "flex flex-col items-center p-2 text-sm rounded-lg touch-target transition-all duration-200",
                  "active:scale-95 active:bg-primary/20",
                  isToday(day) && "bg-primary/10 border border-primary/20",
                  hasShifts && "bg-green-50 border border-green-200",
                  hasOpenShifts && !hasShifts && "bg-orange-50 border border-orange-200",
                  !hasShifts && !hasOpenShifts && "bg-muted/30 hover:bg-muted/50",
                  selectedDay && isSameDay(day, selectedDay) && "ring-2 ring-primary"
                )}
                onClick={() => {
                  setSelectedDay(day);
                  handleAddShift?.(day);
                }}
              >
                <span className="text-xs text-muted-foreground font-medium">
                  {format(day, 'EEE')}
                </span>
                <span className={cn(
                  "font-bold text-base",
                  isToday(day) && "text-primary"
                )}>{format(day, 'd')}</span>
                
                {/* Enhanced shift indicators */}
                <div className="flex gap-1 mt-1">
                  {hasShifts && (
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm" />
                  )}
                  {hasOpenShifts && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-sm" />
                  )}
                </div>
                
                {/* Shift count with better styling */}
                {(hasShifts || hasOpenShifts) && (
                  <span className="text-xs bg-white/80 px-1.5 py-0.5 rounded-full font-medium mt-1">
                    {dayShifts.length + dayOpenShifts.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    } else { // monthly view
      const weeksCount = Math.ceil(currentPeriodDays.length / 7);
      
      return (
        <div className="px-4 mb-4">
          <Card>
            <div className="p-3">
              {/* Month calendar header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Month calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {currentPeriodDays.map((day, i) => {
                  const dayShifts = getShiftsForDay(day);
                  const dayOpenShifts = getOpenShiftsForDay(day);
                  const hasShifts = dayShifts.length > 0;
                  const hasOpenShifts = dayOpenShifts.length > 0;
                  const isCurrentMonth = isSameMonth(day, selectedDate);
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "flex flex-col items-center p-1.5 text-xs rounded-md touch-target transition-all",
                        "active:scale-95",
                        !isCurrentMonth && "text-muted-foreground/50",
                        isToday(day) && "bg-primary text-primary-foreground font-bold",
                        hasShifts && isCurrentMonth && !isToday(day) && "bg-green-100 text-green-800",
                        hasOpenShifts && !hasShifts && isCurrentMonth && !isToday(day) && "bg-orange-100 text-orange-800",
                        selectedDay && isSameDay(day, selectedDay) && "ring-1 ring-primary"
                      )}
                      onClick={() => {
                        if (isCurrentMonth) {
                          setSelectedDay(day);
                          handleAddShift?.(day);
                        }
                      }}
                    >
                      <span className="font-medium">{getDate(day)}</span>
                      
                      {/* Compact indicators for monthly view */}
                      {isCurrentMonth && (hasShifts || hasOpenShifts) && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasShifts && <div className="w-1 h-1 bg-green-500 rounded-full" />}
                          {hasOpenShifts && <div className="w-1 h-1 bg-orange-500 rounded-full" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      );
    }
  };
  
  return (
    <div className="safe-area-inset min-h-screen bg-background">
      {/* Enhanced mobile header */}
      <Card className="mx-4 mt-4 mb-3 shadow-sm">
        <div className="p-4">
          {/* View mode selector */}
          <div className="flex justify-center mb-4">
            <div className="flex bg-muted rounded-lg p-1">
              {['daily', 'weekly', 'monthly'].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode as 'daily' | 'weekly' | 'monthly')}
                  className={cn(
                    "text-xs px-3 py-1.5 transition-all",
                    viewMode === mode && "shadow-sm"
                  )}
                >
                  {mode === 'daily' && <CalendarDays className="h-3 w-3 mr-1" />}
                  {mode === 'weekly' && <CalendarRange className="h-3 w-3 mr-1" />}
                  {mode === 'monthly' && <Grid3x3 className="h-3 w-3 mr-1" />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Navigation and period info */}
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost" 
              size="sm"
              onClick={handlePrevious}
              className="touch-target"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            
            <div className="text-center flex-1">
              <h2 className="font-bold text-lg">{getPeriodHeaderText()}</h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Synced: {format(lastSync, 'HH:mm')}
                </Badge>
                {isLoading && (
                  <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Loading
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost" 
              size="sm"
              onClick={handleNext}
              className="touch-target"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Enhanced Statistics */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-700">{periodStats.totalShifts}</div>
              <div className="text-xs text-blue-600 font-medium">Total Shifts</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-700">{periodStats.totalEmployees}</div>
              <div className="text-xs text-green-600 font-medium">Employees</div>
            </div>
          </div>

          {/* Additional stats for managers */}
          {(isManager || isAdmin || isHR) && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded-md text-center">
                <div className="text-sm font-bold text-purple-700">{periodStats.rotaShifts}</div>
                <div className="text-xs text-purple-600">Rota</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 rounded-md text-center">
                <div className="text-sm font-bold text-indigo-700">{periodStats.singleShifts}</div>
                <div className="text-xs text-indigo-600">Single</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-md text-center">
                <div className="text-sm font-bold text-orange-700">{periodStats.totalOpenShifts}</div>
                <div className="text-xs text-orange-600">Open</div>
              </div>
            </div>
          )}

          {/* Refresh button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="touch-target"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar grid */}
      {renderCalendarGrid()}
      
      {/* Enhanced content tabs */}
      <div className="px-4 pb-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4 bg-muted">
            <TabsTrigger value="overview" className="text-xs font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="shifts" className="text-xs font-medium">
              <Calendar className="h-3 w-3 mr-1" />
              Shifts
            </TabsTrigger>
            <TabsTrigger value="employees" className="text-xs font-medium">
              <Users className="h-3 w-3 mr-1" />
              Staff
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-3">
            {/* Enhanced overview cards */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <h3 className="font-semibold mb-3 flex items-center text-blue-900">
                  <Calendar className="h-5 w-5 mr-2" />
                  {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-white/50 p-3 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <RotateCcw className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="text-xl font-bold text-blue-800">{periodStats.rotaShifts}</span>
                    </div>
                    <p className="text-xs text-blue-600 font-medium">Rota Shifts</p>
                    <p className="text-xs text-blue-500 mt-1">Recurring schedules</p>
                  </div>
                  <div className="text-center bg-white/50 p-3 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 mr-2 text-green-600" />
                      <span className="text-xl font-bold text-green-800">{periodStats.singleShifts}</span>
                    </div>
                    <p className="text-xs text-green-600 font-medium">Single Shifts</p>
                    <p className="text-xs text-green-500 mt-1">One-time assignments</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Open shifts alert */}
            {periodStats.totalOpenShifts > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 mr-2 text-orange-600" />
                    <h3 className="font-semibold text-orange-800">Attention Required</h3>
                  </div>
                  <p className="text-sm text-orange-700 mb-2">
                    {periodStats.totalOpenShifts} open shift{periodStats.totalOpenShifts > 1 ? 's' : ''} need{periodStats.totalOpenShifts === 1 ? 's' : ''} to be filled
                  </p>
                  <Badge variant="destructive" className="text-xs">
                    {periodStats.totalOpenShifts} position{periodStats.totalOpenShifts > 1 ? 's' : ''} available
                  </Badge>
                </div>
              </Card>
            )}

            {/* Live data indicator */}
            <Card className="bg-green-50 border-green-200">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                    <span className="text-sm font-medium text-green-800">Live Data</span>
                  </div>
                  <span className="text-xs text-green-600">Auto-sync every 30s</span>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="shifts" className="space-y-3">
            {schedules.length > 0 ? (
              schedules
                .filter(schedule => {
                  const scheduleDate = new Date(schedule.start_time);
                  return currentPeriodDays.some(day => isSameDay(scheduleDate, day));
                })
                .map((schedule: any, i: number) => (
                <Card key={i} className="shift-card transition-all duration-200 hover:shadow-md">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{schedule.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(schedule.start_time), 'EEE, MMM d')} • 
                          {format(new Date(schedule.start_time), 'h:mm a')} - {format(new Date(schedule.end_time), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {schedule.recurring && (
                          <Badge variant="secondary" className="text-xs">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Rota
                          </Badge>
                        )}
                        {!schedule.recurring && (
                          <Badge variant="outline" className="text-xs">Single</Badge>
                        )}
                      </div>
                    </div>
                    
                    {schedule.location && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <span className="mr-1">📍</span>
                        {schedule.location}
                      </div>
                    )}
                    
                    {schedule.employee_id && (
                      <div className="mt-2 pt-2 border-t border-muted">
                        <p className="text-xs text-muted-foreground">
                          Assigned Employee: {employees.find(emp => emp.id === schedule.employee_id)?.name || 'Unknown'}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center p-8">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-medium text-muted-foreground mb-1">No shifts scheduled</h3>
                <p className="text-sm text-muted-foreground/70">
                  No shifts found for the selected {viewMode} period
                </p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="employees" className="space-y-3">
            {employees.length > 0 ? (
              employees.map((employee: any, i: number) => {
                const employeeShifts = schedules.filter(schedule => 
                  schedule.employee_id === employee.id &&
                  currentPeriodDays.some(day => isSameDay(new Date(schedule.start_time), day))
                );
                
                if (employeeShifts.length === 0) return null;
                
                return (
                  <Card key={i} className="transition-all duration-200 hover:shadow-md">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.job_title} • {employee.department}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {employeeShifts.length} shift{employeeShifts.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {employeeShifts.map((shift: any, j: number) => (
                          <div 
                            key={j} 
                            className="bg-muted/30 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50 active:scale-98"
                            onClick={() => handleSubmitters?.handleEmployeeAddShift?.(employee.id, new Date(shift.start_time))}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm">{shift.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(shift.start_time), 'EEE, MMM d')} • 
                                  {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                                </p>
                              </div>
                              {shift.recurring && (
                                <Badge variant="secondary" className="text-xs">
                                  <RotateCcw className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="text-center p-8">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-medium text-muted-foreground mb-1">No staff scheduled</h3>
                <p className="text-sm text-muted-foreground/70">
                  No employees have shifts in the selected {viewMode} period
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileCalendarView;