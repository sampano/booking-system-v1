import React, { useMemo, useState } from "react";
import {
  User,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Settings,
  RefreshCw,
  UserPlus,
  AlertCircle,
  CheckCircle,
  X,
  MessageSquare,
} from "lucide-react";
import { Booking, User as UserType, Attendee } from "../types";
import { formatDate, formatTime } from "../utils/dateUtils";
import { RescheduleModal } from "./RescheduleModal";
import { CancelBookingModal } from "./CancelBookingModal";
import { TransferBookingModal } from "./TransferBookingModal";
import { AttendeeManagement } from "./AttendeeManagement";
import { ProfileSettings } from "./ProfileSettings";

interface CustomerPortalProps {
  user: UserType;
  bookings: Booking[];
  attendees: Attendee[];
  onRescheduleBooking: (
    bookingId: string,
    newDate: string,
    newTimeSlot: any,
    reason?: string
  ) => void;
  onCancelBooking: (
    bookingId: string,
    reason: string,
    refundType: "refund" | "store_credit"
  ) => void;
  onTransferBooking: (
    bookingId: string,
    newCustomer: any,
    reason?: string
  ) => void;
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
  onUpdateProfile,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "bookings" | "attendees" | "profile"
  >("bookings");
  const [scopeFilter, setScopeFilter] = useState<"all" | "mine" | "attendees">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<"all" | "booking" | "consult">(
    "all"
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  // --- helpers -------------------------------------------------------------
  const txt = (v: unknown) => (typeof v === "string" ? v.toLowerCase() : "");
  const anyTxtIncludes = (vals: unknown[], needle: string) =>
    vals.some((v) => txt(v).includes(needle));

  // Lookups for attendee identification
  const attendeeIds = useMemo(
    () => new Set(attendees.map((a) => a.id)),
    [attendees]
  );
  const attendeeEmails = useMemo(
    () =>
      new Set(
        attendees
          .map((a) => (a.email ? a.email.toLowerCase() : ""))
          .filter(Boolean)
      ),
    [attendees]
  );

  // ---- Classifiers ---------------------------------------------------------
  const isMine = (b: Booking) =>
    (b as any).customerId === user.id ||
    (b.customerEmail &&
      b.customerEmail.toLowerCase() === user.email.toLowerCase());

  const isAttendeeBooking = (b: Booking) => {
    const byId = Boolean(
      (b as any).attendeeId && attendeeIds.has((b as any).attendeeId)
    );
    const byEmail =
      Boolean(b.customerEmail) &&
      attendeeEmails.has((b.customerEmail as string).toLowerCase());
    const byNameDob = attendees.some(
      (a) =>
        a.name?.toLowerCase() === (b.customerName || "").toLowerCase() &&
        a.dateOfBirth &&
        (b as any).customerDateOfBirth &&
        a.dateOfBirth === (b as any).customerDateOfBirth
    );
    return byId || byEmail || byNameDob;
  };

  /**
   * Consultation detector:
   * 1) Prefer explicit mode
   * 2) Fall back to robust heuristics for older data
   */
  const isConsultation = (b: Booking) => {
    // ✅ Prefer explicit flag when present (best for new data)
    if (b.mode === "consultation") return true;

    // ---- heuristics for old data without `mode` ----
    const svc: any = (b as any).service ?? {};
    const directFlags = [
      (b as any).isConsultation,
      (b as any).consultation,
      (b as any).metadata?.consultation,
      svc?.isConsultation,
    ];
    if (directFlags.some(Boolean)) return true;

    const modeCandidates = [
      (b as any).mode,
      (b as any).bookingMode,
      (b as any).type,
      (b as any).kind,
      svc?.type,
    ];
    if (
      modeCandidates.some((v) =>
        ["consult", "consultation"].includes(String(v).toLowerCase())
      )
    ) {
      return true;
    }

    const textCandidates = [
      svc?.category,
      svc?.name,
      svc?.title,
      svc?.description,
      (b as any).category,
      (b as any).title,
    ];
    const hasConsultText = textCandidates.some((v) =>
      String(v || "")
        .toLowerCase()
        .includes("consult")
    );
    if (hasConsultText) return true;

    const price = Number((b as any).totalPrice ?? svc?.price ?? 0);
    const paymentRequired = (b as any).paymentRequired;
    if ((price === 0 || paymentRequired === false) && hasConsultText)
      return true;

    return false;
  };

  const belongsToParentScope = (b: Booking) => {
    const bookedByParent = b.bookedBy === user.id;
    const customerIsParent =
      (b as any).parentUserId === user.id ||
      (b as any).customerId === user.id ||
      (b.customerEmail &&
        b.customerEmail.toLowerCase() === user.email.toLowerCase());
    return bookedByParent || customerIsParent || isAttendeeBooking(b);
  };

  // ---- Data slicing --------------------------------------------------------
  const parentScopeBookings = useMemo(
    () => bookings.filter((b) => belongsToParentScope(b)),
    [bookings, attendees, user]
  );

  // Counts for scope chips (before type filter)
  const mineCount = useMemo(
    () => parentScopeBookings.filter((b) => isMine(b)).length,
    [parentScopeBookings, user]
  );
  const attendeeCount = useMemo(
    () =>
      parentScopeBookings.filter((b) => isAttendeeBooking(b) && !isMine(b))
        .length,
    [parentScopeBookings, user]
  );

  // Apply both filters: scope + type
  const visibleBookings = useMemo(() => {
    const scoped = parentScopeBookings.filter((b) => {
      if (scopeFilter === "mine") return isMine(b);
      if (scopeFilter === "attendees")
        return isAttendeeBooking(b) && !isMine(b);
      return true;
    });
    return scoped.filter((b) => {
      if (typeFilter === "consult") return isConsultation(b);
      if (typeFilter === "booking") return !isConsultation(b);
      return true;
    });
  }, [parentScopeBookings, scopeFilter, typeFilter, user]);

  // Buckets (respecting filters)
  const upcomingBookings = useMemo(
    () =>
      visibleBookings.filter(
        (b) => b.status === "confirmed" && new Date(b.date) >= new Date()
      ),
    [visibleBookings]
  );
  const pastBookings = useMemo(
    () =>
      visibleBookings.filter(
        (b) => b.status === "confirmed" && new Date(b.date) < new Date()
      ),
    [visibleBookings]
  );
  const cancelledBookings = useMemo(
    () => visibleBookings.filter((b) => b.status === "cancelled"),
    [visibleBookings]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "store_credit":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canReschedule = (booking: Booking) => {
    const hoursUntilBooking =
      (new Date(booking.date).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilBooking >= 24 && booking.status === "confirmed";
  };

  const canCancel = (booking: Booking) => {
    const hoursUntilBooking =
      (new Date(booking.date).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilBooking >= 24 && booking.status === "confirmed";
  };

  const handleBookingAction = (
    booking: Booking,
    action: "reschedule" | "cancel" | "transfer"
  ) => {
    setSelectedBooking(booking);
    if (action === "reschedule") setShowReschedule(true);
    if (action === "cancel") setShowCancel(true);
    if (action === "transfer") setShowTransfer(true);
  };

  const closeModals = () => {
    setShowReschedule(false);
    setShowCancel(false);
    setShowTransfer(false);
    setSelectedBooking(null);
  };

  // Chips
  const CustomerChip: React.FC<{ booking: Booking }> = ({ booking }) => {
    const me =
      booking.customerEmail &&
      booking.customerEmail.toLowerCase() === user.email.toLowerCase();
    const attendee =
      booking.customerEmail &&
      attendeeEmails.has(booking.customerEmail.toLowerCase());

    if (me)
      return (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          Me
        </span>
      );
    if (attendee)
      return (
        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
          Attendee
        </span>
      );
    return null;
  };

  const TypeChip: React.FC<{ booking: Booking }> = ({ booking }) =>
    isConsultation(booking) ? (
      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
        <MessageSquare className="h-3.5 w-3.5" />
        <span>Consultation</span>
      </span>
    ) : (
      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
        Course
      </span>
    );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* PANEL: fixed height; columns handle their own scroll */}
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex">
        {/* SIDEBAR (scrollable) */}
        <aside className="w-64 shrink-0 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto overscroll-contain">
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
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === "bookings"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>My Bookings</span>
            </button>

            <button
              onClick={() => setActiveTab("attendees")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === "attendees"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
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
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === "profile"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Profile Settings</span>
            </button>
          </nav>

          {/* Quick Stats (reflect current filters) */}
          <div className="mt-8 space-y-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Upcoming</span>
                <span className="font-semibold text-green-600">
                  {upcomingBookings.length}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold text-blue-600">
                  {pastBookings.length}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendees</span>
                <span className="font-semibold text-purple-600">
                  {attendees.length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN COLUMN (scrolls) */}
        <section className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {activeTab === "bookings" && (
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    My Bookings
                  </h3>

                  <div className="flex items-center gap-3">
                    {/* Scope filter */}
                    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setScopeFilter("all")}
                        className={`px-3 py-2 text-sm font-medium ${
                          scopeFilter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setScopeFilter("mine")}
                        className={`px-3 py-2 text-sm font-medium border-l border-gray-200 ${
                          scopeFilter === "mine"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Mine
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {mineCount}
                        </span>
                      </button>
                      <button
                        onClick={() => setScopeFilter("attendees")}
                        className={`px-3 py-2 text-sm font-medium border-l border-gray-200 ${
                          scopeFilter === "attendees"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Attendees
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {attendeeCount}
                        </span>
                      </button>
                    </div>

                    {/* Type filter */}
                    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setTypeFilter("all")}
                        className={`px-3 py-2 text-sm font-medium ${
                          typeFilter === "all"
                            ? "bg-amber-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        All Types
                      </button>
                      <button
                        onClick={() => setTypeFilter("booking")}
                        className={`px-3 py-2 text-sm font-medium border-l border-gray-200 ${
                          typeFilter === "booking"
                            ? "bg-amber-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Bookings
                      </button>
                      <button
                        onClick={() => setTypeFilter("consult")}
                        className={`px-3 py-2 text-sm font-medium border-l border-gray-200 ${
                          typeFilter === "consult"
                            ? "bg-amber-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Consultations
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upcoming */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Upcoming
                  </h4>
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No upcoming items</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-white border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="text-lg font-semibold text-gray-900">
                                  {booking.service.name}
                                </h5>
                                <TypeChip booking={booking} />
                              </div>
                              <p className="text-gray-600">
                                {booking.service.description}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(
                                  booking.paymentStatus
                                )}`}
                              >
                                {booking.paymentStatus.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {formatDate(new Date(booking.date))}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {formatTime(booking.timeSlot.startTime)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {booking.customerName}
                              </span>
                              <CustomerChip booking={booking} />
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {Number(booking.totalPrice) > 0
                                  ? `$${booking.totalPrice}`
                                  : "—"}
                              </span>
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <button
                              onClick={() =>
                                handleBookingAction(booking, "reschedule")
                              }
                              disabled={!canReschedule(booking)}
                              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>Reschedule</span>
                            </button>

                            <button
                              onClick={() =>
                                handleBookingAction(booking, "transfer")
                              }
                              className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                            >
                              <UserPlus className="h-4 w-4" />
                              <span>Transfer</span>
                            </button>

                            <button
                              onClick={() =>
                                handleBookingAction(booking, "cancel")
                              }
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
                                  Changes must be made at least 24 hours before
                                  the appointment
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Past */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Past
                  </h4>
                  {pastBookings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No past items</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastBookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-gray-900">
                                  {booking.service.name}
                                </h5>
                                <TypeChip booking={booking} />
                              </div>
                              <p className="text-sm text-gray-600">
                                {formatDate(new Date(booking.date))} at{" "}
                                {formatTime(booking.timeSlot.startTime)}
                              </p>
                              <div className="mt-1 flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  {booking.customerName}
                                </span>
                                <CustomerChip booking={booking} />
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                Completed
                              </span>
                              <p className="text-sm text-gray-600 mt-1">
                                {Number(booking.totalPrice) > 0
                                  ? `$${booking.totalPrice}`
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cancelled */}
                {cancelledBookings.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Cancelled
                    </h4>
                    <div className="space-y-4">
                      {cancelledBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-red-50 border border-red-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-gray-900">
                                  {booking.service.name}
                                </h5>
                                <TypeChip booking={booking} />
                              </div>
                              <p className="text-sm text-gray-600">
                                {formatDate(new Date(booking.date))} at{" "}
                                {formatTime(booking.timeSlot.startTime)}
                              </p>
                              <div className="mt-1 flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  {booking.customerName}
                                </span>
                                <CustomerChip booking={booking} />
                              </div>
                              {booking.cancellationReason && (
                                <p className="text-sm text-red-600 mt-1">
                                  Reason: {booking.cancellationReason}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                Cancelled
                              </span>
                              {booking.refundAmount && (
                                <p className="text-sm text-green-600 mt-1">
                                  Refunded: ${booking.refundAmount}
                                </p>
                              )}
                              {booking.storeCreditAmount && (
                                <p className="text-sm text-purple-600 mt-1">
                                  Store Credit: ${booking.storeCreditAmount}
                                </p>
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

            {activeTab === "attendees" && (
              <AttendeeManagement currentUserId={user.id} />
            )}

            {activeTab === "profile" && (
              <ProfileSettings user={user} onUpdateProfile={onUpdateProfile} />
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      {showReschedule && selectedBooking && (
        <RescheduleModal
          booking={selectedBooking}
          onReschedule={(newDate, newTimeSlot, reason) => {
            onRescheduleBooking(
              selectedBooking.id,
              newDate,
              newTimeSlot,
              reason
            );
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
