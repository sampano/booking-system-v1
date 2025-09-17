import React, { useState } from "react";
import { Header } from "./components/Header";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { ServiceSelection } from "./components/ServiceSelection";
import { DateTimeSelection } from "./components/DateTimeSelection";
import { CustomerForm } from "./components/CustomerForm";
import { BookingConfirmation } from "./components/BookingConfirmation";
import { BookingSuccess } from "./components/BookingSuccess";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserAuth } from "./components/UserAuth";
import { AdminAuth } from "./components/AdminAuth";
import { HomePage } from "./components/HomePage";
import { CourseDetailPage } from "./components/CourseDetailPage";
import { CustomerPortal } from "./components/CustomerPortal";
import { useBookingStore } from "./hooks/useBookingStore";
import { useCourseStore } from "./hooks/useCourseStore";
import { useAuthStore } from "./hooks/useAuthStore";
import { useAttendeeStore } from "./hooks/useAttendeeStore";
import { Course } from "./types";
import { ConsultationConfirmation } from "./components/ConsultationConfirmation";

function App() {
  const [bookingMode, setBookingMode] = useState<"course" | "consultation">(
    "course"
  );
  const [currentView, setCurrentView] = useState<
    "home" | "booking" | "course-detail"
  >("home");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [selectedCourseForDetail, setSelectedCourseForDetail] =
    useState<Course | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>("");
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [showCustomerPortal, setShowCustomerPortal] = useState(false);

  const {
    bookingState,
    bookings,
    updateCourse: updateBookingSelectedCourse,
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
    resetBooking,
  } = useBookingStore();

  const { courses, addCourse, updateCourse, deleteCourse, toggleCourseStatus } =
    useCourseStore();

  const {
    user,
    admin,
    isAuthenticated,
    isAdminAuthenticated,
    registerUser,
    loginUser,
    loginAdmin,
    logoutUser,
    logoutAdmin,
    updateUserProfile,
  } = useAuthStore();

  const {
    attendees,
    addAttendee,
    addAttendeeFromBooking,
    updateAttendee,
    deleteAttendee,
    getAttendeesByParent,
  } = useAttendeeStore();

  const handleUserLogin = async (email: string, password: string) => {
    try {
      await loginUser(email, password);
      setShowUserAuth(false);
      setAuthError("");
    } catch (error) {
      setAuthError((error as Error).message);
    }
  };

  const handleUserRegister = async (userData: {
    email: string;
    name: string;
    phone: string;
    password: string;
  }) => {
    try {
      await registerUser(userData);
      setShowUserAuth(false);
      setAuthError("");
    } catch (error) {
      setAuthError((error as Error).message);
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      await loginAdmin(email, password);
      setAuthError("");
    } catch (error) {
      setAuthError((error as Error).message);
    }
  };

  const handleViewChange = (view: "home" | "booking" | "course-detail") => {
    setCurrentView(view);
  };

  const handleStartBooking = () => {
    setCurrentView("booking");
    setStep(1);
    setBookingMode("course"); // NEW
    if (user) {
      updateBookingUser(user);
    }
  };

  const handleCourseSelectFromHome = (course: Course) => {
    updateBookingSelectedCourse(course);
    setCurrentView("booking");
    setStep(2); // Skip to date selection since course is already selected
    setBookingMode("course"); // NEW
    if (user) {
      updateBookingUser(user);
    }
  };
  const handleViewCourse = (course: Course) => {
    setSelectedCourseForDetail(course);
    setCurrentView("course-detail");
  };

  const handleBackFromCourseDetail = () => {
    setSelectedCourseForDetail(null);
    setCurrentView("home");
  };

  const handleBookFromCourseDetail = (course: Course) => {
    updateBookingSelectedCourse(course);
    setCurrentView("booking");
    setStep(2); // Skip to date selection since course is already selected
    setBookingMode("course"); // NEW
    if (user) {
      updateBookingUser(user);
    }
  };

  // NEW: when user clicks "Consult" on a course card
  const handleConsultFromHome = (course: Course) => {
    updateBookingSelectedCourse(course);
    setBookingMode("consultation"); // key difference
    setCurrentView("booking");
    setStep(2); // go straight to calendar
    if (user) {
      updateBookingUser(user);
    }
  };

  const handleConfirmBooking = () => {
    try {
      const bookingId = confirmBooking();

      // Auto-save attendee if booking for someone else and has required data
      if (
        bookingState.bookingUser &&
        bookingState.customer &&
        bookingState.customer.email !== bookingState.bookingUser.email &&
        bookingState.customer.dateOfBirth
      ) {
        addAttendeeFromBooking(
          bookingState.customer,
          bookingState.bookingUser.id
        );
      }

      setConfirmedBookingId(bookingId);
      setStep(5); // Move to success step
    } catch (error) {
      console.error("Failed to confirm booking:", error);
    }
  };

  const handleNewBooking = () => {
    resetBooking();
    setConfirmedBookingId("");
    setCurrentView("home");
  };

  // If admin is authenticated, show admin interface only
  if (isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          currentView="admin"
          onViewChange={() => {}} // Admin can't change views
          user={null} // Don't show user info in admin interface
          admin={admin}
          onShowUserAuth={() => {}} // Not available in admin interface
          onShowAdminAuth={() => setShowAdminLogin(true)}
          onLogoutUser={() => {}} // Not available in admin interface
          onLogoutAdmin={() => {
            logoutAdmin();
            setShowAdminLogin(false);
          }}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminDashboard
            bookings={bookings}
            onCancelBooking={cancelBooking}
            courses={courses}
            onAddCourse={addCourse}
            onUpdateCourse={updateCourse}
            onDeleteCourse={deleteCourse}
            onToggleCourseStatus={toggleCourseStatus}
          />
        </main>
      </div>
    );
  }

  const renderBookingStep = () => {
    switch (bookingState.currentStep) {
      case 1:
        return (
          <ServiceSelection
            courses={courses.filter((c) => c.isActive)}
            selectedCourse={bookingState.selectedService}
            user={user}
            onCourseSelect={updateBookingSelectedCourse}
            onNext={() => setStep(2)}
            onShowAuth={() => setShowUserAuth(true)}
          />
        );

      case 2:
        return bookingState.selectedService ? (
          <DateTimeSelection
            selectedCourse={bookingState.selectedService}
            selectedDate={bookingState.selectedDate}
            selectedTimeSlot={bookingState.selectedTimeSlot}
            onDateSelect={updateDate}
            onTimeSlotSelect={updateTimeSlot}
            // 👇 Branch here: consultation jumps straight to confirmation (step 4)
            onNext={() => {
              if (bookingMode === "consultation") {
                // If customer info is missing, prefill it from the signed-in user
                if (!bookingState.customer) {
                  if (user) {
                    updateCustomer({
                      name: user.name || "",
                      email: user.email,
                      phone: user.phone || "",
                      emergencyContact: (user as any).emergencyContact || "",
                      dateOfBirth: (user as any).dateOfBirth || "",
                      medicalInfo: (user as any).medicalInfo || "",
                      notes: "",
                    });
                  } else {
                    // no user yet? require auth before confirmation
                    setShowUserAuth(true);
                    return; // stop advancing until they sign in
                  }
                }
                setStep(4); // ➜ skip CustomerForm, go to confirmation
              } else {
                setStep(3); // normal course flow
              }
            }}
            onBack={() => setStep(1)}
            // NEW: tell the component which flow we’re in
            mode={bookingMode}
            // OPTIONAL: customize consultation slot length (defaults to 30 in my DateTimeSelection)
            consultationDurationMinutes={45}
          />
        ) : null;

      case 3:
        return (
          <CustomerForm
            customer={bookingState.customer}
            user={user}
            availableAttendees={getAttendeesByParent(user?.id || "")}
            onCustomerUpdate={updateCustomer}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        );

      case 4:
        if (
          !bookingState.selectedService ||
          !bookingState.selectedDate ||
          !bookingState.selectedTimeSlot ||
          !bookingState.customer
        ) {
          return null;
        }

        if (bookingMode === "consultation") {
          return (
            <ConsultationConfirmation
              course={bookingState.selectedService}
              date={bookingState.selectedDate}
              timeSlot={bookingState.selectedTimeSlot}
              customer={bookingState.customer}
              bookingUser={bookingState.bookingUser}
              onConfirm={() => {
                // Reuse your existing confirm logic but no payment UI is shown here.
                const bookingId = confirmBooking();

                // (Optional) Auto-save attendee if different from booking user, same as courses:
                if (
                  bookingState.bookingUser &&
                  bookingState.customer &&
                  bookingState.customer.email !==
                    bookingState.bookingUser.email &&
                  bookingState.customer.dateOfBirth
                ) {
                  addAttendeeFromBooking(
                    bookingState.customer,
                    bookingState.bookingUser.id
                  );
                }

                setConfirmedBookingId(bookingId);
                setStep(5); // proceed to success screen
              }}
              onBack={() => setStep(2)} // since consultation skipped Step 3
            />
          );
        }
        // Default: course booking confirmation (your existing component)
        return (
          <BookingConfirmation
            course={bookingState.selectedService}
            date={bookingState.selectedDate}
            timeSlot={bookingState.selectedTimeSlot}
            customer={bookingState.customer}
            bookingUser={bookingState.bookingUser}
            onConfirm={handleConfirmBooking}
            onBack={() => setStep(3)}
          />
        );

      case 5:
        return bookingState.customer ? (
          <BookingSuccess
            bookingId={confirmedBookingId}
            customerEmail={bookingState.customer.email}
            onNewBooking={handleNewBooking}
          />
        ) : null;

      default:
        return null;
    }
  };

  // Customer interface
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        user={user}
        admin={null} // Don't show admin info in customer interface
        onShowUserAuth={() => setShowUserAuth(true)}
        onShowAdminAuth={() => setShowAdminLogin(true)}
        onLogoutUser={logoutUser}
        onLogoutAdmin={() => {}} // Not available in customer interface
        onShowCustomerPortal={() => setShowCustomerPortal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "home" ? (
          <HomePage
            courses={courses.filter((c) => c.isActive)}
            user={user}
            onCourseSelect={handleCourseSelectFromHome}
            onViewCourse={handleViewCourse}
            onShowAuth={() => setShowUserAuth(true)}
            onStartBooking={handleStartBooking}
            onConsult={handleConsultFromHome} // NEW
          />
        ) : currentView === "course-detail" && selectedCourseForDetail ? (
          <CourseDetailPage
            course={selectedCourseForDetail}
            user={user}
            onBack={handleBackFromCourseDetail}
            onBookCourse={handleBookFromCourseDetail}
            onShowAuth={() => setShowUserAuth(true)}
          />
        ) : currentView === "booking" ? (
          <div>
            {bookingState.currentStep < 5 && (
              <ProgressIndicator
                currentStep={bookingState.currentStep}
                totalSteps={4}
              />
            )}
            {renderBookingStep()}
          </div>
        ) : (
          <HomePage
            courses={courses.filter((c) => c.isActive)}
            user={user}
            onCourseSelect={handleCourseSelectFromHome}
            onViewCourse={handleViewCourse}
            onShowAuth={() => setShowUserAuth(true)}
            onStartBooking={handleStartBooking}
            onConsult={handleConsultFromHome}
          />
        )}
      </main>

      {/* Authentication Modals */}
      {showUserAuth && (
        <UserAuth
          onLogin={handleUserLogin}
          onRegister={handleUserRegister}
          onClose={() => {
            setShowUserAuth(false);
            setAuthError("");
          }}
          error={authError}
        />
      )}

      {/* Admin Authentication Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <AdminAuth
            onLogin={handleAdminLogin}
            onClose={() => {
              setShowAdminLogin(false);
              setAuthError("");
            }}
            error={authError}
          />
        </div>
      )}

      {/* Customer Portal */}
      {showCustomerPortal && user && (
        <CustomerPortal
          user={user}
          bookings={bookings}
          attendees={getAttendeesByParent(user.id)}
          onRescheduleBooking={rescheduleBooking}
          onCancelBooking={cancelBookingWithRefund}
          onTransferBooking={transferBooking}
          onAddAttendee={addAttendee}
          onUpdateAttendee={updateAttendee}
          onDeleteAttendee={deleteAttendee}
          onUpdateProfile={updateUserProfile}
          onClose={() => setShowCustomerPortal(false)}
        />
      )}
    </div>
  );
}

export default App;
