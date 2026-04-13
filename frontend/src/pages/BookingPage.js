import { useParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { CalendarBlank, MapPin } from "@phosphor-icons/react";
import useBooking from "@/hooks/useBooking";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid";
import BookingSummary from "@/components/booking/BookingSummary";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[hsl(211,100%,50%)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function BookingPage() {
  const { id } = useParams();
  const {
    turf,
    selectedDate, setSelectedDate,
    slots, selectedSlot, toggleSlot,
    loadingSlots, submitting,
    confirmBooking, totalPrice,
  } = useBooking(id);

  if (!turf) return <LoadingSpinner />;

  return (
    <div data-testid="booking-page" className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] uppercase font-bold text-[hsl(211,100%,50%)] mb-2">Book</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tighter uppercase text-white">
          {turf.name}
        </h1>
        <p className="text-white/50 text-sm mt-2 flex items-center gap-1.5">
          <MapPin size={14} /> {turf.location}, {turf.city}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Calendar */}
          <div className="border border-white/10 rounded-lg bg-[hsl(240,5%,6%)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarBlank size={18} className="text-[hsl(211,100%,50%)]" />
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-white">Select Date</h2>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
              data-testid="booking-calendar"
              className="rounded-md text-white"
            />
          </div>

          {/* Time Slots */}
          <TimeSlotGrid
            selectedDate={selectedDate}
            slots={slots}
            selectedSlot={selectedSlot}
            toggleSlot={toggleSlot}
            loadingSlots={loadingSlots}
          />
        </div>

        <div className="lg:col-span-1">
          <BookingSummary
            turf={turf}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            totalPrice={totalPrice}
            submitting={submitting}
            onConfirm={confirmBooking}
          />
        </div>
      </div>
    </div>
  );
}
