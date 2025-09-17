import React, { useState } from 'react';
import { CheckCircle, Calendar, Clock, User, Mail, Phone, DollarSign, ChevronLeft, Users, MapPin, UserCheck } from 'lucide-react';
import { Course, TimeSlot, Customer } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';

interface BookingConfirmationProps {
  course: Course;
  date: Date;
  timeSlot: TimeSlot;
  customer: Customer;
  bookingUser?: { name: string; email: string } | null;
  onConfirm: () => void;
  onBack: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  course,
  date,
  timeSlot,
  customer,
  bookingUser,
  onConfirm,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const isBookingForSomeoneElse = bookingUser && customer.email !== bookingUser.email;

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate booking process
    setTimeout(() => {
      onConfirm();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Confirm Your Booking</h2>
        <p className="text-lg text-gray-600">
          {isBookingForSomeoneElse 
            ? 'Please review the booking details for your guest'
            : 'Please review your booking details'
          }
        </p>
      </div>

      {isBookingForSomeoneElse && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <UserCheck className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Booking for Someone Else</h3>
          </div>
          <p className="text-amber-800 text-sm">
            You ({bookingUser?.name}) are booking this appointment for {customer.name}. 
            The confirmation will be sent to {customer.email}.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="space-y-6">
          {/* Course Details */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-blue-900">{course.title}</h4>
                  <p className="text-blue-700 text-sm mt-1">{course.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-blue-600 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.duration} minutes</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{course.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Max {course.maxParticipants}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    <span>{course.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{formatDate(date)}</p>
                  <p className="text-sm text-gray-600">Date</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{formatTime(timeSlot.startTime)}</p>
                  <p className="text-sm text-gray-600">Time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isBookingForSomeoneElse ? 'Attendee Information' : 'Customer Information'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">
                    {isBookingForSomeoneElse ? 'Attendee Name' : 'Full Name'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{customer.email}</p>
                  <p className="text-sm text-gray-600">Email Address</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{customer.phone}</p>
                  <p className="text-sm text-gray-600">Phone Number</p>
                </div>
              </div>
              {customer.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-1">Special Requests</p>
                  <p className="text-sm text-gray-600">{customer.notes}</p>
                </div>
              )}
              
              {isBookingForSomeoneElse && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Booked by: {bookingUser?.name}</p>
                    <p className="text-sm text-blue-600">{bookingUser?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-green-900">Total Amount</p>
                <p className="text-sm text-green-700">Payment due at appointment</p>
              </div>
              <div className="text-2xl font-bold text-green-600 flex items-center">
                <DollarSign className="h-6 w-6" />
                <span>{course.price}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="text-xs text-gray-500 space-y-2">
            <p>By confirming this booking, you agree to our terms and conditions:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{isBookingForSomeoneElse ? 'The attendee should' : 'Please'} arrive 10 minutes before the scheduled appointment</li>
              <li>Cancellations must be made at least 24 hours in advance</li>
              <li>No-shows or late cancellations may incur a fee</li>
              {isBookingForSomeoneElse && (
                <li>The attendee should bring valid ID and be prepared for the appointment</li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex justify-between pt-8">
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Details</span>
          </button>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-top-transparent" />
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Confirm Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};