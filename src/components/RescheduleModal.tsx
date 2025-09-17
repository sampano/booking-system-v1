import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking, TimeSlot } from '../types';
import { generateTimeSlots, isDateAvailable, formatTime, formatDate } from '../utils/dateUtils';

interface RescheduleModalProps {
  booking: Booking;
  onReschedule: (newDate: string, newTimeSlot: TimeSlot, reason?: string) => void;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  booking,
  onReschedule,
  onClose
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentMonth]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateTimeSlots(selectedDate, booking.service.duration);
  }, [selectedDate, booking.service.duration]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const handleReschedule = () => {
    if (selectedDate && selectedTimeSlot) {
      onReschedule(
        selectedDate.toISOString().split('T')[0],
        selectedTimeSlot,
        reason || undefined
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <RefreshCw className="h-6 w-6 mr-2" />
              Reschedule Appointment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Current Booking Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Current Appointment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Service:</span>
                <p className="font-medium">{booking.service.name}</p>
              </div>
              <div>
                <span className="text-blue-600">Date:</span>
                <p className="font-medium">{formatDate(new Date(booking.date))}</p>
              </div>
              <div>
                <span className="text-blue-600">Time:</span>
                <p className="font-medium">{formatTime(booking.timeSlot.startTime)}</p>
              </div>
              <div>
                <span className="text-blue-600">Attendee:</span>
                <p className="font-medium">{booking.customerName}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select New Date</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h4 className="text-lg font-semibold text-gray-900 min-w-48 text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date, index) => {
                  const available = isDateAvailable(date);
                  const today = isToday(date);
                  const selected = isSelected(date);
                  const currentMonthDay = isCurrentMonth(date);

                  return (
                    <button
                      key={index}
                      onClick={() => available && setSelectedDate(date)}
                      disabled={!available}
                      className={`p-3 text-sm rounded-lg transition-all duration-200 ${
                        selected
                          ? 'bg-blue-600 text-white shadow-md'
                          : today && currentMonthDay
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : available && currentMonthDay
                          ? 'hover:bg-gray-100 text-gray-900'
                          : 'text-gray-400 cursor-not-allowed'
                      } ${!currentMonthDay ? 'opacity-40' : ''}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select New Time</h3>

              {!selectedDate ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a date first to see available time slots</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 font-medium">{formatDate(selectedDate)}</p>
                    <p className="text-green-600 text-sm">Available time slots</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                    {availableTimeSlots.map((timeSlot) => (
                      <button
                        key={timeSlot.id}
                        onClick={() => timeSlot.available && setSelectedTimeSlot(timeSlot)}
                        disabled={!timeSlot.available}
                        className={`p-3 rounded-lg border transition-all duration-200 text-sm ${
                          selectedTimeSlot?.id === timeSlot.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : timeSlot.available
                            ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-medium">{formatTime(timeSlot.startTime)}</div>
                        <div className="text-xs opacity-75">
                          {timeSlot.available ? 'Available' : 'Booked'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rescheduling (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Please let us know why you need to reschedule..."
            />
          </div>

          {/* Policy Notice */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              <strong>Reschedule Policy:</strong> You can reschedule your appointment up to 24 hours before the scheduled time. 
              No fees apply for the first reschedule. Additional reschedules may incur a small fee.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              disabled={!selectedDate || !selectedTimeSlot}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Reschedule Appointment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};