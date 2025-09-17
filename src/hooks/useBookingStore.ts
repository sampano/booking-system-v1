import { useState } from 'react';
import { Course, TimeSlot, Customer, Booking, User, RescheduleRecord, TransferRecord } from '../types';

interface BookingState {
  selectedService: Course | null;
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  customer: Customer | null;
  bookingUser: User | null;
  currentStep: number;
}

export const useBookingStore = () => {
  const [bookingState, setBookingState] = useState<BookingState>({
    selectedService: null,
    selectedDate: null,
    selectedTimeSlot: null,
    customer: null,
    bookingUser: null,
    currentStep: 1
  });

  const [bookings, setBookings] = useState<Booking[]>([]);

  const updateService = (service: Service) => {
    setBookingState(prev => ({
      ...prev,
      selectedService: service,
      selectedDate: null,
      selectedTimeSlot: null
    }));
  };

  const updateCourse = (course: Course) => {
    setBookingState(prev => ({
      ...prev,
      selectedService: course,
      selectedDate: null,
      selectedTimeSlot: null
    }));
  };

  const updateDate = (date: Date) => {
    setBookingState(prev => ({
      ...prev,
      selectedDate: date,
      selectedTimeSlot: null
    }));
  };

  const updateTimeSlot = (timeSlot: TimeSlot) => {
    setBookingState(prev => ({
      ...prev,
      selectedTimeSlot: timeSlot
    }));
  };

  const updateCustomer = (customer: Customer) => {
    setBookingState(prev => ({
      ...prev,
      customer
    }));
  };

  const updateBookingUser = (user: User) => {
    setBookingState(prev => ({
      ...prev,
      bookingUser: user
    }));
  };

  const setStep = (step: number) => {
    setBookingState(prev => ({
      ...prev,
      currentStep: step
    }));
  };

  const confirmBooking = (): string => {
    if (!bookingState.selectedService || !bookingState.selectedDate || 
        !bookingState.selectedTimeSlot || !bookingState.customer) {
      throw new Error('Missing booking information');
    }

    const bookingId = `booking-${Date.now()}`;
    const isBookingForSomeoneElse = bookingState.bookingUser && 
      (bookingState.customer.email !== bookingState.bookingUser.email);
    
    const newBooking: Booking = {
      id: bookingId,
      serviceId: bookingState.selectedService.id,
      service: {
        id: bookingState.selectedService.id,
        name: bookingState.selectedService.title,
        description: bookingState.selectedService.description,
        duration: bookingState.selectedService.duration,
        price: bookingState.selectedService.price,
        category: bookingState.selectedService.category
      },
      customerName: bookingState.customer.name,
      customerEmail: bookingState.customer.email,
      customerPhone: bookingState.customer.phone,
      customerEmergencyContact: bookingState.customer.emergencyContact,
      ...(isBookingForSomeoneElse && {
        bookedBy: bookingState.bookingUser.id,
        bookedByName: bookingState.bookingUser.name
      }),
      date: bookingState.selectedDate.toISOString().split('T')[0],
      timeSlot: bookingState.selectedTimeSlot,
      status: 'confirmed',
      paymentStatus: 'pending',
      totalPrice: bookingState.selectedService.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: bookingState.customer.notes
    };

    setBookings(prev => [...prev, newBooking]);
    
    // Auto-save attendee data if booking for someone else and not already saved
    if (isBookingForSomeoneElse && bookingState.customer.dateOfBirth) {
      // This would typically integrate with the attendee store
      // For now, we'll just log it - in a real app, you'd call addAttendee here
      console.log('Auto-saving attendee data:', {
        parentUserId: bookingState.bookingUser.id,
        name: bookingState.customer.name,
        email: bookingState.customer.email,
        phone: bookingState.customer.phone,
        dateOfBirth: bookingState.customer.dateOfBirth,
        emergencyContact: bookingState.customer.emergencyContact,
        medicalInfo: bookingState.customer.medicalInfo
      });
    }
    
    // Reset booking state
    setBookingState({
      selectedService: null,
      selectedDate: null,
      selectedTimeSlot: null,
      customer: null,
      bookingUser: null,
      currentStep: 1
    });

    return bookingId;
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
          : booking
      )
    );
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newTimeSlot: TimeSlot, reason?: string) => {
    setBookings(prev => 
      prev.map(booking => {
        if (booking.id === bookingId) {
          const rescheduleRecord: RescheduleRecord = {
            id: `reschedule-${Date.now()}`,
            originalDate: booking.date,
            originalTimeSlot: booking.timeSlot,
            newDate,
            newTimeSlot,
            reason,
            createdAt: new Date().toISOString()
          };
          
          return {
            ...booking,
            date: newDate,
            timeSlot: newTimeSlot,
            rescheduleHistory: [...(booking.rescheduleHistory || []), rescheduleRecord],
            updatedAt: new Date().toISOString()
          };
        }
        return booking;
      })
    );
  };

  const transferBooking = (bookingId: string, newCustomer: any, reason?: string) => {
    setBookings(prev => 
      prev.map(booking => {
        if (booking.id === bookingId) {
          const transferRecord: TransferRecord = {
            id: `transfer-${Date.now()}`,
            originalCustomerName: booking.customerName,
            originalCustomerEmail: booking.customerEmail,
            newCustomerName: newCustomer.name,
            newCustomerEmail: newCustomer.email,
            reason,
            createdAt: new Date().toISOString()
          };
          
          return {
            ...booking,
            customerName: newCustomer.name,
            customerEmail: newCustomer.email,
            customerPhone: newCustomer.phone,
            customerEmergencyContact: newCustomer.emergencyContact,
            transferHistory: [...(booking.transferHistory || []), transferRecord],
            updatedAt: new Date().toISOString()
          };
        }
        return booking;
      })
    );
  };

  const cancelBookingWithRefund = (bookingId: string, reason: string, refundType: 'refund' | 'store_credit') => {
    setBookings(prev => 
      prev.map(booking => {
        if (booking.id === bookingId) {
          const bookingDate = new Date(booking.date);
          const now = new Date();
          const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          
          let refundAmount = 0;
          let storeCreditAmount = 0;
          
          if (refundType === 'refund') {
            if (hoursUntilBooking >= 48) {
              refundAmount = booking.totalPrice;
            } else if (hoursUntilBooking >= 24) {
              refundAmount = booking.totalPrice * 0.8;
            }
          } else {
            storeCreditAmount = booking.totalPrice;
          }
          
          return {
            ...booking,
            status: 'cancelled' as const,
            paymentStatus: refundType === 'refund' ? 'refunded' as const : 'store_credit' as const,
            cancellationReason: reason,
            refundAmount,
            storeCreditAmount,
            updatedAt: new Date().toISOString()
          };
        }
        return booking;
      })
    );
  };
  const resetBooking = () => {
    setBookingState({
      selectedService: null,
      selectedDate: null,
      selectedTimeSlot: null,
      customer: null,
      bookingUser: null,
      currentStep: 1
    });
  };

  return {
    bookingState,
    bookings,
    updateService,
    updateCourse,
    updateDate,
    updateTimeSlot,
    updateCustomer,
    updateBookingUser,
    setStep,
    confirmBooking,
    cancelBooking,
    rescheduleBooking,
    transferBooking,
    cancelBookingWithRefund,
    resetBooking
  };
};