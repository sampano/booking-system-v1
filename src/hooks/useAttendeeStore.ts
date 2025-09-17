// attendeeStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Attendee } from "../types";

type State = {
  attendees: Attendee[];
};

type Actions = {
  addAttendee: (
    data: Omit<Attendee, "id" | "createdAt" | "updatedAt">
  ) => string;
  addAttendeeFromBooking: (bookingData: any, parentUserId: string) => string;
  updateAttendee: (id: string, updates: Partial<Attendee>) => void;
  deleteAttendee: (id: string) => void;
  getAttendeesByParent: (parentUserId: string) => Attendee[];
};

export const useAttendeeStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      attendees: [],

      addAttendee: (attendeeData) => {
        const { attendees } = get();

        const existing = attendees.find(
          (a) =>
            a.name.toLowerCase() === attendeeData.name.toLowerCase() &&
            a.parentUserId === attendeeData.parentUserId
        );
        if (existing) {
          // merge + update timestamp
          const updates = {
            ...attendeeData,
            updatedAt: new Date().toISOString(),
          };
          set({
            attendees: attendees.map((a) =>
              a.id === existing.id ? { ...a, ...updates } : a
            ),
          });
          return existing.id;
        }

        const newAttendee: Attendee = {
          ...attendeeData,
          id: `attendee-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ attendees: [...attendees, newAttendee] });
        return newAttendee.id;
      },

      addAttendeeFromBooking: (bookingData, parentUserId) => {
        const attendeeData = {
          parentUserId,
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          dateOfBirth:
            bookingData.dateOfBirth || new Date().toISOString().split("T")[0],
          emergencyContact: bookingData.emergencyContact || "",
          medicalInfo: bookingData.medicalInfo || "",
          allergies: "",
          notes: bookingData.notes || "",
        };
        return get().addAttendee(attendeeData);
      },

      updateAttendee: (id, updates) => {
        set((state) => ({
          attendees: state.attendees.map((a) =>
            a.id === id
              ? { ...a, ...updates, updatedAt: new Date().toISOString() }
              : a
          ),
        }));
      },

      deleteAttendee: (id) => {
        set((state) => ({
          attendees: state.attendees.filter((a) => a.id !== id),
        }));
      },

      getAttendeesByParent: (parentUserId) => {
        return get().attendees.filter((a) => a.parentUserId === parentUserId);
      },
    }),
    {
      name: "attendees-store",
      storage: createJSONStorage(() => localStorage),
      // optional: version/migrate if schema changes
    }
  )
);
