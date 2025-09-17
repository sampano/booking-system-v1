import React from 'react';
import { CheckCircle, Calendar, Mail, Home } from 'lucide-react';

interface BookingSuccessProps {
  bookingId: string;
  customerEmail: string;
  onNewBooking: () => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({
  bookingId,
  customerEmail,
  onNewBooking
}) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            Your appointment has been successfully booked and confirmed.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-green-800">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Booking Reference: {bookingId}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <Mail className="h-5 w-5" />
                <span>Confirmation email sent to {customerEmail}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start space-x-2">
                <span className="font-medium">1.</span>
                <span>Check your email for booking confirmation and details</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-medium">2.</span>
                <span>Add the appointment to your calendar</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-medium">3.</span>
                <span>Arrive 10 minutes before your scheduled time</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-medium">4.</span>
                <span>Bring a valid ID and payment method</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={onNewBooking}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Calendar className="h-5 w-5" />
              <span>Book Another Appointment</span>
            </button>

            <p className="text-sm text-gray-500">
              Need to reschedule or cancel? Contact us at{' '}
              <a href="mailto:support@bookease.com" className="text-blue-600 hover:underline">
                support@bookease.com
              </a>{' '}
              or call{' '}
              <a href="tel:+1234567890" className="text-blue-600 hover:underline">
                (123) 456-7890
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};