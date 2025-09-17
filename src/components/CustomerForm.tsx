import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  Users,
  UserCheck,
} from "lucide-react";
import { Customer, User as UserType, Attendee } from "../types";
import { useAttendeeStore } from "../hooks/useAttendeeStore";

interface CustomerFormProps {
  customer: Customer | null;
  user: UserType | null;
  availableAttendees?: Attendee[];
  onCustomerUpdate: (customer: Customer) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Uses the global attendee store to:
 * - show saved attendees when booking for someone else
 * - persist new attendee data when booking for someone else
 */
export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  user,
  availableAttendees = [],
  onCustomerUpdate,
  onNext,
  onBack,
}) => {
  const { getAttendeesByParent, addAttendeeFromBooking } = useAttendeeStore();

  const savedAttendees = user?.id ? getAttendeesByParent(user.id) : [];

  const [bookingForSomeoneElse, setBookingForSomeoneElse] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
  const [showAttendeeSelection, setShowAttendeeSelection] = useState(false);

  const [formData, setFormData] = useState<Customer>({
    name: customer?.name || (bookingForSomeoneElse ? "" : user?.name || ""),
    email: customer?.email || (bookingForSomeoneElse ? "" : user?.email || ""),
    phone: customer?.phone || (bookingForSomeoneElse ? "" : user?.phone || ""),
    emergencyContact: customer?.emergencyContact || "",
    dateOfBirth: customer?.dateOfBirth || "",
    medicalInfo: customer?.medicalInfo || "",
    notes: customer?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle attendee selection
  const handleAttendeeSelect = (attendee: any) => {
    setSelectedAttendee(attendee);
    setFormData({
      name: attendee.name,
      email: attendee.email || "",
      phone: attendee.phone || "",
      emergencyContact: attendee.emergencyContact || "",
      dateOfBirth: attendee.dateOfBirth || "",
      medicalInfo: attendee.medicalInfo || "",
      notes: attendee.notes || "",
    });
    setShowAttendeeSelection(false);
  };

  // Update form data when booking type changes or when user/customer updates
  useEffect(() => {
    if (bookingForSomeoneElse) {
      if (savedAttendees.length > 0) {
        setShowAttendeeSelection(true);
      } else {
        setSelectedAttendee(null);
        setFormData({
          name: customer?.name || "",
          email: customer?.email || "",
          phone: customer?.phone || "",
          emergencyContact: customer?.emergencyContact || "",
          dateOfBirth: customer?.dateOfBirth || "",
          medicalInfo: customer?.medicalInfo || "",
          notes: customer?.notes || "",
        });
      }
    } else {
      setSelectedAttendee(null);
      setShowAttendeeSelection(false);
      setFormData({
        name: customer?.name || user?.name || "",
        email: customer?.email || user?.email || "",
        phone: customer?.phone || user?.phone || "",
        emergencyContact:
          customer?.emergencyContact || user?.emergencyContact || "",
        dateOfBirth: customer?.dateOfBirth || user?.dateOfBirth || "",
        medicalInfo: customer?.medicalInfo || user?.medicalInfo || "",
        notes: customer?.notes || "",
      });
    }
  }, [bookingForSomeoneElse, user, customer, savedAttendees.length]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onCustomerUpdate(formData);

    // Persist attendee if booking for someone else
    if (bookingForSomeoneElse && user?.id) {
      addAttendeeFromBooking(formData, user.id);
    }

    onNext();
  };

  const handleInputChange = (field: keyof Customer, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Helper (same logic as in AttendeeManagement for consistency)
  const calcAge = (dob?: string) => {
    if (!dob) return "—";
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Information
        </h2>
        <p className="text-lg text-gray-600">
          {bookingForSomeoneElse
            ? "Enter the details for the person you're booking for"
            : user
            ? "Confirm your details for this booking"
            : "We need a few details to confirm your booking"}
        </p>
      </div>

      {user && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Signed in as:</strong> {user.name} ({user.email})
          </p>

          {/* Booking Type Toggle */}
          <div className="mt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bookingForSomeoneElse}
                onChange={(e) => {
                  setBookingForSomeoneElse(e.target.checked);
                  setSelectedAttendee(null);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  I'm booking this appointment for someone else
                </span>
              </div>
            </label>
          </div>

          {!bookingForSomeoneElse && (
            <p className="text-blue-600 text-xs mt-2">
              Your information has been pre-filled. You can modify it if needed.
            </p>
          )}
        </div>
      )}

      {/* Attendee Selection */}
      {bookingForSomeoneElse &&
        showAttendeeSelection &&
        savedAttendees.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">
                  Select from Saved Attendees
                </h3>
              </div>
              <button
                onClick={() => setShowAttendeeSelection(false)}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                Enter new attendee instead
              </button>
            </div>
            <p className="text-green-800 text-sm mb-4">
              We found {savedAttendees.length} saved attendee(s) in your
              account. Select one or enter new details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedAttendees.map((attendee) => (
                <button
                  key={attendee.id}
                  type="button"
                  onClick={() => handleAttendeeSelect(attendee)}
                  className="p-3 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">
                        {attendee.name}
                      </p>
                      <p className="text-sm text-green-700">
                        Age: {calcAge(attendee.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Selected Attendee Notice */}
      {selectedAttendee && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Using Saved Attendee: {selectedAttendee.name}
                </h3>
                <p className="text-blue-700 text-sm">
                  Information has been pre-filled from your saved attendees
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedAttendee(null);
                setShowAttendeeSelection(true);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {bookingForSomeoneElse && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">
              Booking for Someone Else
            </h3>
          </div>
          <p className="text-amber-800 text-sm">
            {selectedAttendee
              ? `You're booking for ${selectedAttendee.name}. You can modify the details below if needed.`
              : "Please enter the details of the person who will be attending this appointment."}{" "}
            They will receive the confirmation email and should bring valid ID.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {bookingForSomeoneElse ? "Attendee's Full Name *" : "Full Name *"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  bookingForSomeoneElse
                    ? "Enter attendee's full name"
                    : "Enter your full name"
                }
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {bookingForSomeoneElse
                ? "Attendee's Email Address *"
                : "Email Address *"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  bookingForSomeoneElse
                    ? "Enter attendee's email address"
                    : "Enter your email address"
                }
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
            {bookingForSomeoneElse && (
              <p className="mt-1 text-xs text-gray-500">
                The confirmation email will be sent to this address
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {bookingForSomeoneElse
                ? "Attendee's Phone Number *"
                : "Phone Number *"}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  bookingForSomeoneElse
                    ? "Enter attendee's phone number"
                    : "Enter your phone number"
                }
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Additional fields for attendees */}
          {bookingForSomeoneElse && (
            <>
              <div>
                <label
                  htmlFor="emergencyContact"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Emergency Contact
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="emergencyContact"
                    value={formData.emergencyContact || ""}
                    onChange={(e) =>
                      handleInputChange("emergencyContact", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Emergency contact phone number"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="medicalInfo"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Medical Information
                </label>
                <textarea
                  id="medicalInfo"
                  value={formData.medicalInfo || ""}
                  onChange={(e) =>
                    handleInputChange("medicalInfo", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={3}
                  placeholder="Any medical conditions, allergies, or important health information"
                />
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Special Requests (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                id="notes"
                rows={4}
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder={
                  bookingForSomeoneElse
                    ? "Any special requests or notes for the attendee's appointment..."
                    : "Any special requests or notes for your appointment..."
                }
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Booking Policy</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • {bookingForSomeoneElse ? "The attendee should" : "Please"}{" "}
                arrive 10 minutes before the scheduled appointment
              </li>
              <li>• Cancellations must be made at least 24 hours in advance</li>
              <li>
                • A confirmation email will be sent to the provided email
                address
              </li>
              {bookingForSomeoneElse && (
                <li>
                  • The attendee should bring valid ID and be prepared for the
                  appointment
                </li>
              )}
            </ul>
          </div>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Date/Time</span>
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Review Booking</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
