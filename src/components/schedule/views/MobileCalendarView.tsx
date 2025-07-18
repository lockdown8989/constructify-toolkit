
import React, { useState, useEffect } from 'react';
import { format, isToday, isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar, Users, Clock, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSchedules } from '@/hooks/use-schedules';
import { useOpenShifts } from '@/hooks/use-open-shifts';

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
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch data for real-time synchronization
  const { data: schedules = [], refetch: refetchSchedules, isLoading } = useSchedules();
  const { openShifts = [] } = useOpenShifts();
  
  // Auto-refresh every 30 seconds for managers
  useEffect(() => {
    if (isManager || isAdmin || isHR) {
      const interval = setInterval(() => {
        refetchSchedules();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isManager, isAdmin, isHR, refetchSchedules]);

  // Get current week days
  const getCurrentWeekDays = () => {
    const weekStart = startOfWeek(selectedWeekStart, { weekStartsOn: 1 });
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(weekStart, i));
    }
    return weekDays;
  };

  const weekDays = getCurrentWeekDays();

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
    setIsRefreshing(false);
  };

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const weekSchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return weekDays.some(day => isSameDay(scheduleDate, day));
    });

    const totalShifts = weekSchedules.length;
    const rotaShifts = weekSchedules.filter(s => s.shift_type === 'rota' || s.recurring).length;
    const singleShifts = totalShifts - rotaShifts;
    const totalEmployees = new Set(weekSchedules.map(s => s.employee_id)).size;

    return { totalShifts, rotaShifts, singleShifts, totalEmployees };
  };

  const weekStats = getWeeklyStats();
  
  return (
    <div className="safe-area-inset">
      {/* Enhanced mobile header with sync info */}
      <Card className="mx-4 mt-4 mb-3">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedWeekStart(addDays(selectedWeekStart, -7))}
              className="touch-target"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            
            <div className="text-center">
              <h2 className="font-bold text-lg">
                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Last sync: {format(new Date(), 'HH:mm')}
                </Badge>
              </div>
            </div>
            
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedWeekStart(addDays(selectedWeekStart, 7))}
              className="touch-target"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekly Statistics for Managers */}
          {(isManager || isAdmin || isHR) && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-muted/50 p-2 rounded-md text-center">
                <div className="text-sm font-medium">{weekStats.totalShifts}</div>
                <div className="text-xs text-muted-foreground">Total Shifts</div>
              </div>
              <div className="bg-muted/50 p-2 rounded-md text-center">
                <div className="text-sm font-medium">{weekStats.totalEmployees}</div>
                <div className="text-xs text-muted-foreground">Employees</div>
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
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Enhanced Mobile calendar days */}
      <div className="grid grid-cols-7 gap-1 mb-4 px-4">
        {weekDays.map((day, i) => {
          const dayShifts = getShiftsForDay(day);
          const dayOpenShifts = getOpenShiftsForDay(day);
          const hasShifts = dayShifts.length > 0;
          const hasOpenShifts = dayOpenShifts.length > 0;
          
          return (
            <div 
              key={i} 
              className={cn(
                "flex flex-col items-center p-2 text-sm rounded-lg touch-target active-touch-state",
                isToday(day) && "bg-primary/10 border border-primary/20",
                hasShifts && "bg-muted/50",
                !hasShifts && !hasOpenShifts && "bg-background"
              )}
              onClick={() => handleAddShift?.(day)}
            >
              <span className="text-xs text-muted-foreground">{format(day, 'EEE')}</span>
              <span className={cn(
                "font-bold",
                isToday(day) && "text-primary"
              )}>{format(day, 'd')}</span>
              
              {/* Shift indicators */}
              <div className="flex gap-1 mt-1">
                {hasShifts && (
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                )}
                {hasOpenShifts && (
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                )}
              </div>
              
              {/* Shift count */}
              {(hasShifts || hasOpenShifts) && (
                <span className="text-xs text-muted-foreground mt-1">
                  {dayShifts.length + dayOpenShifts.length}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Enhanced Mobile content */}
      <div className="px-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="shifts" className="text-xs">Shifts</TabsTrigger>
            <TabsTrigger value="employees" className="text-xs">Staff</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-3">
            {/* Shift type breakdown */}
            <Card>
              <div className="p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Shift Overview
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <RotateCcw className="h-4 w-4 mr-1 text-blue-500" />
                      <Badge variant="outline">{weekStats.rotaShifts}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Rota Shifts</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 mr-1 text-green-500" />
                      <Badge variant="outline">{weekStats.singleShifts}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Single Shifts</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Open shifts count */}
            {openShifts.length > 0 && (
              <Card>
                <div className="p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-orange-500" />
                    Open Shifts
                  </h3>
                  <Badge variant="destructive">{openShifts.length} positions available</Badge>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="shifts" className="space-y-3">
            {schedules.length > 0 ? (
              schedules.map((schedule: any, i: number) => (
                <Card key={i} className="shift-card">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{schedule.title}</h3>
                      <div className="flex gap-1">
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
                    <div className="text-sm text-muted-foreground">
                      <p>{format(new Date(schedule.start_time), 'EEE, MMM d • h:mm a')} - {format(new Date(schedule.end_time), 'h:mm a')}</p>
                      {schedule.location && <p className="mt-1">📍 {schedule.location}</p>}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <div className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No shifts scheduled</p>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="employees" className="space-y-3">
            {allEmployeeSchedules.length > 0 ? (
              allEmployeeSchedules.map((empSchedule: any, i: number) => (
                <Card key={i}>
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{empSchedule.employeeName || empSchedule.employee?.name || 'Unknown Employee'}</h3>
                    <div className="space-y-1">
                      {(empSchedule.shifts || empSchedule.schedules || []).map((shift: any, j: number) => (
                        <div 
                          key={j} 
                          className="bg-muted/50 p-2 rounded text-sm active-touch-state"
                          onClick={() => handleSubmitters?.handleEmployeeAddShift?.(empSchedule.employeeId || empSchedule.employee?.id, new Date(shift.start_time))}
                        >
                          <div className="flex justify-between items-center">
                            <span>{format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}</span>
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
              ))
            ) : (
              <Card>
                <div className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No staff scheduled</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileCalendarView;
