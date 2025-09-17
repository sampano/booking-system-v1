import { useState, useMemo } from 'react';
import { Analytics, Booking, Course } from '../types';

export const useAnalyticsStore = (bookings: Booking[], courses: Course[]) => {
  const analytics = useMemo((): Analytics => {
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    
    // Revenue calculations
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    const revenueByProgram = confirmedBookings.reduce((acc, booking) => {
      const category = booking.service.category;
      acc[category] = (acc[category] || 0) + booking.totalPrice;
      return acc;
    }, {} as Record<string, number>);
    
    const revenueByLocation = confirmedBookings.reduce((acc, booking) => {
      // Extract location from course data if available
      const location = 'Main Location'; // Simplified for demo
      acc[location] = (acc[location] || 0) + booking.totalPrice;
      return acc;
    }, {} as Record<string, number>);
    
    const revenueByMonth = confirmedBookings.reduce((acc, booking) => {
      const month = new Date(booking.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + booking.totalPrice;
      return acc;
    }, {} as Record<string, number>);
    
    // Course popularity
    const courseBookingCounts = confirmedBookings.reduce((acc, booking) => {
      acc[booking.serviceId] = (acc[booking.serviceId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostPopular = courses
      .map(course => ({
        ...course,
        bookingCount: courseBookingCounts[course.id] || 0
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);
    
    // Fill rate calculation (simplified)
    const totalCapacity = courses.reduce((sum, course) => sum + course.maxParticipants, 0) * 30; // Assume 30 days
    const fillRate = totalCapacity > 0 ? (confirmedBookings.length / totalCapacity) * 100 : 0;
    
    return {
      revenue: {
        total: totalRevenue,
        byProgram: revenueByProgram,
        byLocation: revenueByLocation,
        byMonth: revenueByMonth
      },
      bookings: {
        total: bookings.length,
        confirmed: confirmedBookings.length,
        cancelled: cancelledBookings.length,
        fillRate: Math.round(fillRate * 100) / 100
      },
      courses: {
        total: courses.length,
        active: courses.filter(c => c.isActive).length,
        mostPopular
      },
      refunds: {
        total: cancelledBookings.length,
        amount: cancelledBookings.reduce((sum, b) => sum + b.totalPrice, 0)
      },
      discounts: {
        totalUsed: 0, // Simplified for demo
        totalDiscount: 0
      }
    };
  }, [bookings, courses]);
  
  return { analytics };
};