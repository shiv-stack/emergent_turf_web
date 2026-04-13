import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { authAxios } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarBlank, Clock, CurrencyInr, MapPin } from "@phosphor-icons/react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  // Fetch turf details
  useEffect(() => {
    axios.get(`${API}/turfs/${id}`).then(res => setTurf(res.data)).catch(() => {});
  }, [id]);

  // Fetch slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setLoadingSlots(true);
    setSelectedSlot(null);
    axios.get(`${API}/turfs/${id}/slots?date=${dateStr}`)
      .then(res => setSlots(res.data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot || !selectedDate) return;
    setBooking(true);
    try {
      await authAxios.post(`${API}/bookings`, {
        turf_id: id,
        date: format(selectedDate, "yyyy-MM-dd"),
        time_slot: selectedSlot,
        duration: 1
      }, {});
      toast.success("Booking confirmed! Redirecting to your bookings...");
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (e) {
      const msg = e.response?.data?.detail || "Failed to book. Please try again.";
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setBooking(false);
    }
  };

  if (!turf) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(211,100%,50%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPrice = turf.price_per_hour;

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
        {/* Calendar + Slots */}
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
          <div className="border border-white/10 rounded-lg bg-[hsl(240,5%,6%)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-[hsl(211,100%,50%)]" />
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-white">Select Time Slot</h2>
            </div>

            {selectedDate && (
              <p className="text-xs text-white/40 mb-4 tracking-wide">
                Showing slots for {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            )}

            {loadingSlots ? (
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {Array.from({length: 14}).map((_, i) => (
                  <div key={i} className="h-12 bg-white/5 rounded-sm animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3" data-testid="time-slots-grid">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    data-testid={`slot-${slot.time}`}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time === selectedSlot ? null : slot.time)}
                    className={`h-12 flex items-center justify-center text-sm font-medium rounded-sm transition-colors duration-200 ${
                      !slot.available
                        ? "slot-booked text-white/30"
                        : slot.time === selectedSlot
                        ? "slot-selected text-white"
                        : "slot-available text-white/80"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="flex gap-6 mt-6 text-xs text-white/40">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-white/20 rounded-sm" /> Available
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[hsl(211,100%,50%)]/20 border-2 border-[hsl(211,100%,50%)] rounded-sm" /> Selected
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-white/5 border border-white/5 rounded-sm opacity-40" /> Booked
              </span>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-white/10 rounded-lg bg-[hsl(240,5%,6%)] p-6 space-y-6">
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-white">Booking Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Turf</span>
                <span className="text-white font-medium">{turf.name}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Date</span>
                <span className="text-white font-medium">
                  {selectedDate ? format(selectedDate, "MMM d, yyyy") : "—"}
                </span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Time</span>
                <span className="text-white font-medium">{selectedSlot || "—"}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Duration</span>
                <span className="text-white font-medium">1 hour</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Total</span>
                <span className="text-2xl font-heading font-black text-[hsl(211,100%,50%)] flex items-center">
                  <CurrencyInr size={20} weight="bold" />
                  {selectedSlot ? totalPrice : 0}
                </span>
              </div>
            </div>

            <Button
              data-testid="confirm-booking-btn"
              onClick={handleBook}
              disabled={!selectedSlot || booking}
              className="w-full bg-[hsl(211,100%,50%)] hover:bg-[hsl(211,100%,55%)] text-white font-bold tracking-wide uppercase py-6 rounded-sm text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {booking ? "Confirming..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
