import React, { useState } from 'react';
import { User, Calendar, Clock, DollarSign, Users, Settings, CreditCard, RefreshCw, UserPlus, Edit, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Booking, User as UserType, Attendee } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';
import { RescheduleModal } from './RescheduleModal';
import { CancelBookingModal } from './CancelBookingModal';
import { TransferBookingModal } from './TransferBookingModal';
import { AttendeeManagement } from './AttendeeManagement';
import { ProfileSettings } from './ProfileSettings';

interface CustomerPortalProps {
  user: UserType;
  bookings: Booking[];
  attendees: Attendee[];
  onRescheduleBooking: (bookingId: string, newDate: string, newTimeSlot: any, reason?: string) => void;
  onCancelBooking: (bookingId: string, reason: string, refundType: 'refund' | 'store_credit') => void;
  onTransferBooking: (bookingId: string, newCustomer: any, reason?: string) => void;
  onAddAttendee: (attendeeData: Omit<Attendee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateAttendee: (attendeeId: string, updates: Partial<Attendee>) => void;
  onDeleteAttendee: (attendeeId: string) => void;
  onUpdateProfile: (updates: Partial<UserType>) => void;
  onClose: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  user,
  bookings,
  attendees,
  onRescheduleBooking,
  onCancelBooking,
  onTransferBooking,
  onAddAttendee,
  onUpdateAttendee,
  onDeleteAttendee,
  onUpdateProfile,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'attendees' | 'profile'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const userBookings = bookings.filter(booking => 
    booking.bookedBy === user.id || booking.customerEmail === user.email
  );

  const upcomingBookings = userBookings.filter(booking => 
    booking.status === 'confirmed' && new Date(booking.date) >= new Date()
  );

  const pastBookings = userBookings.filter(booking => 
    booking.status === 'confirmed' && new Date(booking.date) < new Date()
  );

  const cancelledBookings = userBookings.filter(booking => 
    booking.status === 'cancelled'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      case 'store_credit': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canReschedule = (booking: Booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilBooking >= 24 && booking.status === 'confirmed';
  };

  const canCancel = (booking: Booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilBooking >= 24 && booking.status === 'confirmed';
  };

  const handleBookingAction = (booking: Booking, action: 'reschedule' | 'cancel' | 'transfer') => {
    setSelectedBooking(booking);
    switch (action) {
      case 'reschedule':
        setShowReschedule(true);
        break;
      case 'cancel':
        setShowCancel(true);
        break;
      case 'transfer':
        setShowTransfer(true);
        break;
    }
  };

  const closeModals = () => {
    setShowReschedule(false);
    setShowCancel(false);
    setShowTransfer(false);
    setSelectedBooking(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Account</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'bookings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>My Bookings</span>
              </button>

              <button
                onClick={() => setActiveTab('attendees')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'attendees'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Attendees</span>
                {attendees.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {attendees.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Profile Settings</span>
              </button>
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 space-y-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <span className="font-semibold text-green-600">{upcomingBookings.length}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-blue-600">{pastBookings.length}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Attendees</span>
                  <span className="font-semibold text-purple-600">{attendees.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'bookings' && (
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h3>

                {/* Upcoming Bookings */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h4>
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No upcoming bookings</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900">{booking.service.name}</h5>
                              <p className="text-gray-600">{booking.service.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatDate(new Date(booking.date))}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatTime(booking.timeSlot.startTime)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{booking.customerName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">${booking.totalPrice}</span>
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleBookingAction(booking, 'reschedule')}
                              disabled={!canReschedule(booking)}
                              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>Reschedule</span>
                            </button>

                            <button
                              onClick={() => handleBookingAction(booking, 'transfer')}
                              className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                            >
                              <UserPlus className="h-4 w-4" />
                              <span>Transfer</span>
                            </button>

                            <button
                              onClick={() => handleBookingAction(booking, 'cancel')}
                              disabled={!canCancel(booking)}
                              className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              <X className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                          </div>

                          {(!canReschedule(booking) || !canCancel(booking)) && (
                            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <p className="text-amber-800 text-sm">
                                  Changes must be made at least 24 hours before the appointment
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Past Bookings */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Past Appointments</h4>
                  {pastBookings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No past bookings</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastBookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium text-gray-900">{booking.service.name}</h5>
                              <p className="text-sm text-gray-600">
                                {formatDate(new Date(booking.date))} at {formatTime(booking.timeSlot.startTime)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                                Completed
                              </span>
                              <p className="text-sm text-gray-600 mt-1">${booking.totalPrice}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cancelled Bookings */}
                {cancelledBookings.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Cancelled Appointments</h4>
                    <div className="space-y-4">
                      {cancelledBookings.map((booking) => (
                        <div key={booking.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium text-gray-900">{booking.service.name}</h5>
                              <p className="text-sm text-gray-600">
                                {formatDate(new Date(booking.date))} at {formatTime(booking.timeSlot.startTime)}
                              </p>
                              {booking.cancellationReason && (
                                <p className="text-sm text-red-600 mt-1">Reason: {booking.cancellationReason}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                                Cancelled
                              </span>
                              {booking.refundAmount && (
                                <p className="text-sm text-green-600 mt-1">Refunded: ${booking.refundAmount}</p>
                              )}
                              {booking.storeCreditAmount && (
                                <p className="text-sm text-purple-600 mt-1">Store Credit: ${booking.storeCreditAmount}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attendees' && (
              <AttendeeManagement
                attendees={attendees}
                currentUserId={user.id}
                onAddAttendee={onAddAttendee}
                onUpdateAttendee={onUpdateAttendee}
                onDeleteAttendee={onDeleteAttendee}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileSettings
                user={user}
                onUpdateProfile={onUpdateProfile}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReschedule && selectedBooking && (
        <RescheduleModal
          booking={selectedBooking}
          onReschedule={(newDate, newTimeSlot, reason) => {
            onRescheduleBooking(selectedBooking.id, newDate, newTimeSlot, reason);
            closeModals();
          }}
          onClose={closeModals}
        />
      )}

      {showCancel && selectedBooking && (
        <CancelBookingModal
          booking={selectedBooking}
          onCancel={(reason, refundType) => {
            onCancelBooking(selectedBooking.id, reason, refundType);
            closeModals();
          }}
          onClose={closeModals}
        />
      )}

      {showTransfer && selectedBooking && (
        <TransferBookingModal
          booking={selectedBooking}
          onTransfer={(newCustomer, reason) => {
            onTransferBooking(selectedBooking.id, newCustomer, reason);
            closeModals();
          }}
          onClose={closeModals}
        />
      )}
    </div>
  );
};