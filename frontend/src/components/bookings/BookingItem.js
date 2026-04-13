import { CalendarCheck, MapPin, Clock, XCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function BookingItemSkeleton({ index }) {
  return (
    <div key={`skeleton-booking-${index}`} className="border border-white/10 rounded-lg bg-[hsl(240,5%,6%)] p-6 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-white/5 rounded" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-1/2" />
          <div className="h-4 bg-white/5 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function EmptyBookings() {
  return (
    <div className="text-center py-20 border border-white/10 rounded-lg bg-[hsl(240,5%,6%)]">
      <CalendarCheck size={48} className="text-white/20 mx-auto mb-4" />
      <p className="text-white/40 text-lg">No bookings yet.</p>
      <p className="text-white/30 text-sm mt-1">Book a turf to see your bookings here.</p>
    </div>
  );
}

export function BookingItem({ booking, index, onCancel }) {
  const statusClass = booking.status === "confirmed"
    ? "bg-green-500/20 text-green-400"
    : "bg-red-500/20 text-red-400";

  return (
    <div
      data-testid={`booking-${booking.id}`}
      className="border border-white/10 rounded-lg bg-[hsl(240,5%,6%)] p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-white">
            {booking.turf_name}
          </h3>
          <Badge className={`text-[10px] uppercase tracking-wider border-0 rounded-sm ${statusClass}`}>
            {booking.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-white/50">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {booking.turf_location}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarCheck size={14} /> {booking.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {booking.time_slot} ({booking.duration}hr)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xl font-heading font-black text-[hsl(211,100%,50%)]">
          ₹{booking.total_price}
        </span>
        {booking.status === "confirmed" && (
          <Button
            variant="ghost"
            size="sm"
            data-testid={`cancel-booking-${booking.id}`}
            onClick={() => onCancel(booking.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <XCircle size={16} className="mr-1" /> Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
