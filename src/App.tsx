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
    setMode,
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

  // Start generic booking flow from CTA (course mode)
  const handleStartBooking = () => {
    setMode("course"); // <<< important
    setCurrentView("booking");
    setStep(1);
    if (user) updateBookingUser(user);
  };

  // Clicked "Book Now" on a course card or detail page
  const handleCourseSelectFromHome = (course: Course) => {
    setMode("course"); // <<< important
    updateBookingSelectedCourse(course);
    setCurrentView("booking");
    setStep(2); // Skip to date selection since course is already selected
    if (user) updateBookingUser(user);
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
    setMode("course"); // <<< important
    updateBookingSelectedCourse(course);
    setCurrentView("booking");
    setStep(2);
    if (user) updateBookingUser(user);
  };

  // Clicked "Consult" on a course card
  const handleConsultFromHome = (course: Course) => {
    setMode("consultation"); // <<< important
    updateBookingSelectedCourse(course);
    setCurrentView("booking");
    setStep(2); // go straight to calendar
    if (user) updateBookingUser(user);
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
          onViewChange={() => {}}
          user={null}
          admin={admin}
          onShowUserAuth={() => {}}
          onShowAdminAuth={() => setShowAdminLogin(true)}
          onLogoutUser={() => {}}
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
            // Consultation jumps straight to confirmation (step 4)
            onNext={() => {
              if (bookingState.mode === "consultation") {
                // Prefill customer from signed-in user if empty
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
                    setShowUserAuth(true);
                    return;
                  }
                }
                setStep(4); // skip CustomerForm
              } else {
                setStep(3);
              }
            }}
            onBack={() => setStep(1)}
            // Tell DateTimeSelection which flow
            mode={bookingState.mode}
            // (optional) tweak consult slot length
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

        if (bookingState.mode === "consultation") {
          return (
            <ConsultationConfirmation
              course={bookingState.selectedService}
              date={bookingState.selectedDate}
              timeSlot={bookingState.selectedTimeSlot}
              customer={bookingState.customer}
              bookingUser={bookingState.bookingUser}
              onConfirm={() => {
                const bookingId = confirmBooking();

                // Optional: auto-save attendee same as course
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
                setStep(5);
              }}
              onBack={() => setStep(2)} // consult flow skipped step 3
            />
          );
        }

        // Course confirmation (with payment UI if you show it there)
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
        admin={null}
        onShowUserAuth={() => setShowUserAuth(true)}
        onShowAdminAuth={() => setShowAdminLogin(true)}
        onLogoutUser={logoutUser}
        onLogoutAdmin={() => {}}
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
            onConsult={handleConsultFromHome} // consult entry point
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
          onUpdateProfile={updateUserProfile}
          onClose={() => setShowCustomerPortal(false)}
        />
      )}
    </div>
  );
}

export default App;
