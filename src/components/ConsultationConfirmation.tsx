import React from "react";
import { Calendar, Clock, User, CheckCircle, ChevronLeft } from "lucide-react";
import { Course, TimeSlot, Customer, User as UserType } from "../types";
import { formatDate, formatTime } from "../utils/dateUtils";

interface ConsultationConfirmationProps {
  course: Course;
  date: Date;
  timeSlot: TimeSlot;
  customer: Customer;
  bookingUser: UserType | null;
  onConfirm: () => void;
  onBack: () => void;
}

export const ConsultationConfirmation: React.FC<
  ConsultationConfirmationProps
> = ({ course, date, timeSlot, customer, bookingUser, onConfirm, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center mb-6">
        <CheckCircle className="h-6 w-6 text-amber-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">
          Confirm Consultation
        </h2>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-amber-900 font-medium">
            This is a consultation appointment.{" "}
            <strong>No payment is required.</strong>
          </p>
          <p className="text-amber-800 text-sm mt-1">
            You’ll receive an email with the consultation details and any next
            steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Consultation About
            </h3>
            <p className="text-gray-900">{course.title}</p>
            <p className="text-gray-500 text-sm mt-1">
              Instructor: {course.instructor}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">When</h3>
            <div className="flex items-center text-gray-900">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center text-gray-900 mt-1">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                {formatTime(timeSlot.startTime)} ({course.duration} min)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Attendee
            </h3>
            <div className="flex items-center text-gray-900">
              <User className="h-4 w-4 mr-2" />
              <span>{customer.name}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {customer.email} • {customer.phone || "No phone provided"}
            </p>
            {bookingUser && bookingUser.email !== customer.email && (
              <p className="text-gray-500 text-xs mt-1">
                Booked by: {bookingUser.name} ({bookingUser.email})
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <button
          onClick={onConfirm}
          className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors duration-200"
        >
          Confirm Consultation
        </button>
      </div>
    </div>
  );
};
