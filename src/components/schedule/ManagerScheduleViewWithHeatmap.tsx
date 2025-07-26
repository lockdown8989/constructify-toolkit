
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, DollarSign } from 'lucide-react';
import { useRestaurantScheduleWithHeatmap } from '@/components/restaurant/hooks/useRestaurantScheduleWithHeatmap';
import RestaurantScheduleGridWithHeatmap from '@/components/restaurant/RestaurantScheduleGridWithHeatmap';
import { useIsMobile } from '@/hooks/use-mobile';

const ManagerScheduleViewWithHeatmap: React.FC = () => {
  const {
    finalEmployees,
    shifts,
    openShifts,
    enhancedWeekStats,
    formatCurrency,
    handleAssignOpenShift,
    previousWeek,
    nextWeek,
    addShift,
    updateShift,
    removeShift,
    handleDateClick,
    currentView,
    handleViewChange,
    isLoading
  } = useRestaurantScheduleWithHeatmap();

  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enhancedWeekStats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labor Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(enhancedWeekStats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Total estimated cost
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enhancedWeekStats.openShiftsTotalCount}</div>
            <p className="text-xs text-muted-foreground">
              Need assignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Grid with Heatmap */}
      <RestaurantScheduleGridWithHeatmap
        employees={finalEmployees}
        weekStats={enhancedWeekStats}
        openShifts={openShifts}
        formatCurrency={formatCurrency}
        handleAssignOpenShift={handleAssignOpenShift}
        previousWeek={previousWeek}
        nextWeek={nextWeek}
        isMobile={isMobile}
        addShift={addShift}
        updateShift={updateShift}
        removeShift={removeShift}
        onDateClick={handleDateClick}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
    </div>
  );
};

export default ManagerScheduleViewWithHeatmap;
