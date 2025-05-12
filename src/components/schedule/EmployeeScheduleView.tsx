
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import WeeklyCalendarView from '@/components/schedule/WeeklyCalendarView';
import { ScheduleDialogs } from './components/ScheduleDialogs';
import { ScheduleTabs } from './components/ScheduleTabs';
import { useShiftDragDrop } from '@/hooks/schedule/use-shift-drag-drop';
import { useOpenShifts } from '@/hooks/schedule/use-open-shifts';
import OpenShiftsList from './components/OpenShiftsList';
import ScheduleHeader from './components/ScheduleHeader';
import { format } from 'date-fns';

const EmployeeScheduleView: React.FC = () => {
  const location = useLocation();
  const {
    currentDate,
    setCurrentDate,
    selectedScheduleId,
    setSelectedScheduleId,
    isInfoDialogOpen,
    setIsInfoDialogOpen,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    activeTab,
    setActiveTab,
    newSchedules,
    schedules,
    isLoading,
    refreshSchedules
  } = useEmployeeSchedule();
  
  const { openShifts, refetchOpenShifts } = useOpenShifts();
  const { droppedShiftId, handleShiftDragStart, handleShiftDragEnd, handleShiftDrop } = useShiftDragDrop(refreshSchedules);

  const handleEmailClick = (schedule: any) => {
    const subject = `Regarding shift on ${format(new Date(schedule.start_time), 'MMMM d, yyyy')}`;
    const body = `Hello,\n\nI would like to discuss my shift scheduled for ${format(new Date(schedule.start_time), 'MMMM d, yyyy')} from ${format(new Date(schedule.start_time), 'h:mm a')} to ${format(new Date(schedule.end_time), 'h:mm a')}.`;
    window.location.href = `mailto:manager@workplace.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleResponseComplete = () => {
    // Refresh schedules data after a response
    refreshSchedules();
    
    // If we were in the pending tab and there are no more pending shifts,
    // switch to the my-shifts tab
    if (activeTab === 'pending') {
      const pendingShifts = schedules.filter(s => s.status === 'pending');
      if (pendingShifts.length <= 1) { // Using <= 1 because the current item is still in the array
        setActiveTab('my-shifts');
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading schedule...</div>;
  }

  const selectedSchedule = selectedScheduleId 
    ? schedules.find(s => s.id === selectedScheduleId) 
    : null;

  return (
    <div className="pb-6 max-w-4xl mx-auto">
      <ScheduleHeader onRefresh={refreshSchedules} />
      
      <WeeklyCalendarView
        startDate={currentDate}
        onDateChange={setCurrentDate}
        schedules={schedules}
        onShiftDrop={handleShiftDrop}
        highlightedShiftId={droppedShiftId}
      />
      
      <div className="border-t border-gray-200 my-2" />

      <ScheduleTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        schedules={schedules}
        newSchedules={newSchedules}
        onInfoClick={setSelectedScheduleId}
        onEmailClick={handleEmailClick}
        onCancelClick={(id) => {
          setSelectedScheduleId(id);
          setIsCancelDialogOpen(true);
        }}
        onResponseComplete={handleResponseComplete}
      />

      {openShifts.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="font-medium text-lg mb-2 px-4">Available Open Shifts</h3>
          <OpenShiftsList 
            openShifts={openShifts} 
            onShiftDragStart={handleShiftDragStart}
            onShiftDragEnd={handleShiftDragEnd}
          />
        </div>
      )}

      <ScheduleDialogs
        selectedSchedule={selectedSchedule}
        isInfoDialogOpen={isInfoDialogOpen}
        setIsInfoDialogOpen={setIsInfoDialogOpen}
        isCancelDialogOpen={isCancelDialogOpen}
        setIsCancelDialogOpen={setIsCancelDialogOpen}
      />
    </div>
  );
};

export default EmployeeScheduleView;
