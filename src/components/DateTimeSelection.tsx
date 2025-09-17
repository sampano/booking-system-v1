import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Course, TimeSlot } from "../types";
import {
  generateTimeSlots,
  isDateAvailable,
  formatTime,
  formatDate,
} from "../utils/dateUtils";

type BookingMode = "course" | "consultation";

interface DateTimeSelectionProps {
  /** Course context is still required; for consultation we can show which course/expert it’s about */
  selectedCourse: Course;
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;

  /** NEW: switch the component to consultation flow */
  mode?: "course" | "consultation"; // defaults to 'course'

  /** NEW: consultation slot length (minutes); used when mode === 'consultation' */
  consultationDurationMinutes?: number; // default 30

  /** NEW: header label override for consultation (e.g. "Parent Consultation") */
  consultationTitle?: string; // default "Consultation"

  onDateSelect: (date: Date) => void;
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedCourse,
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  onNext,
  onBack,
  mode = "course",
  consultationDurationMinutes = 30,
  consultationTitle = "Consultation",
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isConsultation = mode === "consultation";
  const effectiveDuration = isConsultation
    ? consultationDurationMinutes
    : selectedCourse.duration;

  const headerLeftLabel = isConsultation ? consultationTitle : "Booking";
  const headerRightLabel = `${effectiveDuration} min`;

  const subjectLabel = isConsultation
    ? // show what the consult is about (course/instructor)
      selectedCourse?.title
      ? `${selectedCourse.title}`
      : consultationTitle
    : selectedCourse.title;

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    // Move back to the previous Sunday for a full calendar grid (6 weeks)
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentMonth]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    // IMPORTANT: use the effective duration so consultation has its own slot length
    return generateTimeSlots(selectedDate, effectiveDuration);
  }, [selectedDate, effectiveDuration]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Select Date & Time
        </h2>

        {/* Subheader shows Booking vs Consultation */}
        <p className="text-lg text-gray-600">
          {headerLeftLabel}:{" "}
          <span
            className={`font-semibold ${
              isConsultation ? "text-amber-600" : "text-blue-600"
            }`}
          >
            {subjectLabel}
          </span>
          <span className="mx-2">•</span>
          <span className="text-gray-500">{headerRightLabel}</span>
        </p>

        {/* Optional chip to make mode extra clear */}
        <div className="mt-3">
          <span
            className={`inline-block text-xs px-2 py-1 rounded-full ${
              isConsultation
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {isConsultation ? "Consultation" : "Course Booking"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Select Date
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h4 className="text-lg font-semibold text-gray-900 min-w-48 text-center">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-500"
              >
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
                  onClick={() => available && onDateSelect(date)}
                  disabled={!available}
                  className={`p-3 text-sm rounded-lg transition-all duration-200 ${
                    selected
                      ? "bg-blue-600 text-white shadow-md"
                      : today && currentMonthDay
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : available && currentMonthDay
                      ? "hover:bg-gray-100 text-gray-900"
                      : "text-gray-400 cursor-not-allowed"
                  } ${!currentMonthDay ? "opacity-40" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Select Time
          </h3>

          {!selectedDate ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Select a date first to see available time slots
              </p>
            </div>
          ) : (
            <div>
              <div
                className={`mb-4 p-4 rounded-lg border ${
                  isConsultation
                    ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <p
                  className={`${
                    isConsultation ? "text-amber-900" : "text-blue-800"
                  } font-medium`}
                >
                  {formatDate(selectedDate)}
                </p>
                <p
                  className={`${
                    isConsultation ? "text-amber-700" : "text-blue-600"
                  } text-sm`}
                >
                  Available time slots
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {availableTimeSlots.map((timeSlot) => (
                  <button
                    key={timeSlot.id}
                    onClick={() =>
                      timeSlot.available && onTimeSlotSelect(timeSlot)
                    }
                    disabled={!timeSlot.available}
                    className={`p-3 rounded-lg border transition-all duration-200 text-sm ${
                      selectedTimeSlot?.id === timeSlot.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : timeSlot.available
                        ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <div className="font-medium">
                      {formatTime(timeSlot.startTime)}
                    </div>
                    <div className="text-xs opacity-75">
                      {timeSlot.available ? "Available" : "Booked"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>{isConsultation ? "Back to Courses" : "Back to Services"}</span>
        </button>

        {selectedDate && selectedTimeSlot && (
          <button
            onClick={onNext}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 ${
              isConsultation
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <span>Continue to Details</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
