import React, { useState } from 'react';
import { X, UserPlus, User, Mail, Phone, Users } from 'lucide-react';
import { Booking } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';

interface TransferBookingModalProps {
  booking: Booking;
  onTransfer: (newCustomer: any, reason?: string) => void;
  onClose: () => void;
}

export const TransferBookingModal: React.FC<TransferBookingModalProps> = ({
  booking,
  onTransfer,
  onClose
}) => {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: ''
  });
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newCustomer.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!newCustomer.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!newCustomer.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTransfer = () => {
    if (validateForm()) {
      onTransfer(newCustomer, reason || undefined);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserPlus className="h-6 w-6 mr-2 text-purple-600" />
              Transfer Appointment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Current Booking Info */}
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Current Appointment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-purple-600">Service:</span>
                <p className="font-medium">{booking.service.name}</p>
              </div>
              <div>
                <span className="text-purple-600">Date:</span>
                <p className="font-medium">{formatDate(new Date(booking.date))}</p>
              </div>
              <div>
                <span className="text-purple-600">Time:</span>
                <p className="font-medium">{formatTime(booking.timeSlot.startTime)}</p>
              </div>
              <div>
                <span className="text-purple-600">Current Attendee:</span>
                <p className="font-medium">{booking.customerName}</p>
              </div>
            </div>
          </div>

          {/* Transfer Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Transfer Information</h3>
            </div>
            <p className="text-blue-800 text-sm">
              You can transfer this appointment to another person. The new attendee will receive 
              a confirmation email and should bring valid ID to the appointment.
            </p>
          </div>

          {/* New Attendee Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Attendee Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new attendee's full name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new attendee's email address"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  The confirmation email will be sent to this address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new attendee's phone number"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={newCustomer.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Emergency contact phone number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Transfer (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              placeholder="Please let us know why you're transferring this appointment..."
            />
          </div>

          {/* Policy Notice */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2">Transfer Policy</h4>
            <ul className="text-amber-800 text-sm space-y-1">
              <li>• Transfers can be made up to 24 hours before the appointment</li>
              <li>• The new attendee will receive a confirmation email</li>
              <li>• The new attendee should bring valid ID to the appointment</li>
              <li>• You remain responsible for payment and cancellation policies</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Transfer Appointment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};