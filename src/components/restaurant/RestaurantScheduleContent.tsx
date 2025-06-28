
import { useRestaurantScheduleLogic } from './hooks/useRestaurantScheduleLogic';
import RestaurantScheduleGrid from './RestaurantScheduleGrid';
import RestaurantScheduleRoles from './RestaurantScheduleRoles';
import RestaurantScheduleLoading from './RestaurantScheduleLoading';
import RestaurantScheduleError from './RestaurantScheduleError';
import DateDetailsDialog from './components/DateDetailsDialog';

const RestaurantScheduleContent = () => {
  console.log('RestaurantScheduleContent component rendering...');
  
  const {
    selectedDate,
    isDateDialogOpen,
    setIsDateDialogOpen,
    finalEmployees,
    shifts,
    openShifts,
    enhancedWeekStats,
    organizedShifts,
    isLoading,
    error,
    formatCurrency,
    isMobile,
    handleAssignOpenShift,
    handleAddOpenShift,
    handleDateClick,
    previousWeek,
    nextWeek,
    addShift,
    updateShift,
    removeShift,
    handleAddNote,
    handleAddBreak
  } = useRestaurantScheduleLogic();
  
  if (isLoading) {
    console.log('Loading data...');
    return <RestaurantScheduleLoading />;
  }

  if (error) {
    console.error('Error loading employee data:', error);
    return <RestaurantScheduleError />;
  }
  
  console.log('RestaurantScheduleContent rendering main content');
  
  return (
    <div className="container py-6 sm:py-8 max-w-[1400px] px-3 md:px-6 mx-auto">        
      <RestaurantScheduleGrid
        employees={finalEmployees}
        weekStats={enhancedWeekStats}
        openShifts={openShifts}
        formatCurrency={formatCurrency}
        handleAssignOpenShift={handleAssignOpenShift}
        previousWeek={previousWeek}
        nextWeek={nextWeek}
        isMobile={isMobile}
        addOpenShift={handleAddOpenShift}
        addShift={addShift}
        updateShift={updateShift}
        removeShift={removeShift}
        onDateClick={handleDateClick}
      />
      
      <RestaurantScheduleRoles
        weekStats={enhancedWeekStats}
        organizedShifts={organizedShifts}
        removeShift={removeShift}
        handleAddNote={handleAddNote}
        handleAddBreak={handleAddBreak}
        isMobile={isMobile}
        addShift={addShift}
        updateShift={updateShift}
      />

      <DateDetailsDialog
        isOpen={isDateDialogOpen}
        onOpenChange={setIsDateDialogOpen}
        selectedDate={selectedDate}
        shifts={shifts}
        openShifts={openShifts}
        employees={finalEmployees}
      />
    </div>
  );
};

export default RestaurantScheduleContent;
