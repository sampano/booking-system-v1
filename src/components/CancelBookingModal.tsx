import React, { useState } from 'react';
import { X, AlertTriangle, CreditCard, Gift, DollarSign } from 'lucide-react';
import { Booking } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';

interface CancelBookingModalProps {
  booking: Booking;
  onCancel: (reason: string, refundType: 'refund' | 'store_credit') => void;
  onClose: () => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  booking,
  onCancel,
  onClose
}) => {
  const [reason, setReason] = useState('');
  const [refundType, setRefundType] = useState<'refund' | 'store_credit'>('refund');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleCancel = () => {
    if (reason.trim()) {
      onCancel(reason, refundType);
    }
  };

  const calculateRefund = () => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilBooking >= 48) {
      return booking.totalPrice; // Full refund
    } else if (hoursUntilBooking >= 24) {
      return booking.totalPrice * 0.8; // 80% refund
    } else {
      return 0; // No refund
    }
  };

  const refundAmount = calculateRefund();
  const storeCreditAmount = booking.totalPrice; // Store credit always full amount

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              Cancel Appointment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Booking Info */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2">Appointment to Cancel</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-red-600">Service:</span>
                <p className="font-medium">{booking.service.name}</p>
              </div>
              <div>
                <span className="text-red-600">Date:</span>
                <p className="font-medium">{formatDate(new Date(booking.date))}</p>
              </div>
              <div>
                <span className="text-red-600">Time:</span>
                <p className="font-medium">{formatTime(booking.timeSlot.startTime)}</p>
              </div>
              <div>
                <span className="text-red-600">Amount:</span>
                <p className="font-medium">${booking.totalPrice}</p>
              </div>
            </div>
          </div>

          {/* Refund Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  refundType === 'refund'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setRefundType('refund')}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="radio"
                    checked={refundType === 'refund'}
                    onChange={() => setRefundType('refund')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Refund to Payment Method</span>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Refund ${refundAmount.toFixed(2)} to your original payment method
                </p>
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  Processing time: 3-5 business days
                </p>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  refundType === 'store_credit'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setRefundType('store_credit')}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="radio"
                    checked={refundType === 'store_credit'}
                    onChange={() => setRefundType('store_credit')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <Gift className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Store Credit</span>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Receive ${storeCreditAmount.toFixed(2)} in store credit
                </p>
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  Available immediately, never expires
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
              placeholder="Please let us know why you need to cancel..."
              required
            />
          </div>

          {/* Policy Notice */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2">Cancellation Policy</h4>
            <ul className="text-amber-800 text-sm space-y-1">
              <li>• 48+ hours: Full refund available</li>
              <li>• 24-48 hours: 80% refund available</li>
              <li>• Less than 24 hours: No refund, store credit only</li>
              <li>• Store credit option always provides full amount</li>
            </ul>
          </div>

          {/* Confirmation Step */}
          {!isConfirming ? (
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => setIsConfirming(true)}
                disabled={!reason.trim()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Cancel
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Confirm Cancellation</h4>
                <p className="text-red-800 text-sm mb-2">
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </p>
                <div className="flex items-center space-x-2 text-red-700">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {refundType === 'refund' 
                      ? `$${refundAmount.toFixed(2)} will be refunded to your payment method`
                      : `$${storeCreditAmount.toFixed(2)} will be added as store credit`
                    }
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};