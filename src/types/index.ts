// index.ts

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

// NEW: booking flow flag
export type BookingMode = "course" | "consultation";

export interface Booking {
  id: string;
  serviceId: string;
  service: Service;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerEmergencyContact?: string;
  bookedBy?: string;
  bookedByName?: string;
  date: string;
  timeSlot: TimeSlot;
  status: "confirmed" | "pending" | "cancelled";
  paymentStatus: "paid" | "pending" | "refunded" | "store_credit";
  refundAmount?: number;
  storeCreditAmount?: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  cancellationReason?: string;
  rescheduleHistory?: RescheduleRecord[];
  transferHistory?: TransferRecord[];

  /** NEW: differentiate courses vs consultations */
  mode?: "course" | "consultation";
}

export interface RescheduleRecord {
  id: string;
  originalDate: string;
  originalTimeSlot: TimeSlot;
  newDate: string;
  newTimeSlot: TimeSlot;
  reason?: string;
  createdAt: string;
}

export interface TransferRecord {
  id: string;
  originalCustomerName: string;
  originalCustomerEmail: string;
  newCustomerName: string;
  newCustomerEmail: string;
  reason?: string;
  createdAt: string;
}

export interface Attendee {
  id: string;
  parentUserId: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  emergencyContact: string;
  medicalInfo?: string;
  allergies?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  address?: string;
  medicalInfo?: string;
  notes?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in minutes
  price: number;
  maxParticipants: number;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  requirements?: string;
  imageUrl?: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSchedule {
  id: string;
  courseId: string;
  course: Course;
  date: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
  enrolledParticipants: string[]; // customer IDs
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  location?: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  address?: string;
  medicalInfo?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  createdAt: string;
  isActive: boolean;
}

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringSchedule {
  id: string;
  courseId: string;
  course: Course;
  termId: string;
  term: Term;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  revenue: {
    total: number;
    byProgram: Record<string, number>;
    byLocation: Record<string, number>;
    byMonth: Record<string, number>;
  };
  bookings: {
    total: number;
    confirmed: number;
    cancelled: number;
    fillRate: number;
  };
  courses: {
    total: number;
    active: number;
    mostPopular: Course[];
  };
  refunds: {
    total: number;
    amount: number;
  };
  discounts: {
    totalUsed: number;
    totalDiscount: number;
  };
}

export interface BulkOperation {
  id: string;
  type: "roster_update" | "communication" | "status_change";
  targetType: "course" | "term" | "booking";
  targetIds: string[];
  operation: any;
  status: "pending" | "in_progress" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  results?: any;
}
