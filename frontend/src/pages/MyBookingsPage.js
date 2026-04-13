import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CalendarCheck, MapPin, Clock, XCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API}/bookings/my`, { withCredentials: true });
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await axios.patch(`${API}/bookings/${cancelId}/cancel`, {}, { withCredentials: true });
      toast.success("Booking cancelled successfully");
      setCancelId(null);
      fetchBookings();
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div data-testid="my-bookings-page" className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] uppercase font-bold text-[hsl(211,100%,50%)] mb-2">Your Activity</p>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-white">
          My Bookings
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="border border-white/10 rounded-lg bg-[hsl(240,5%,6%)] p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-white/5 rounded" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-white/5 rounded w-1/3" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                  <div className="h-4 bg-white/5 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 border border-white/10 rounded-lg bg-[hsl(240,5%,6%)]">
          <CalendarCheck size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No bookings yet.</p>
          <p className="text-white/30 text-sm mt-1">Book a turf to see your bookings here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <div
              key={b.id}
              data-testid={`booking-${b.id}`}
              className="border border-white/10 rounded-lg bg-[hsl(240,5%,6%)] p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-white">
                    {b.turf_name}
                  </h3>
                  <Badge
                    className={`text-[10px] uppercase tracking-wider border-0 rounded-sm ${
                      b.status === "confirmed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {b.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-white/50">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {b.turf_location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarCheck size={14} /> {b.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> {b.time_slot} ({b.duration}hr)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xl font-heading font-black text-[hsl(211,100%,50%)]">
                  ₹{b.total_price}
                </span>
                {b.status === "confirmed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`cancel-booking-${b.id}`}
                    onClick={() => setCancelId(b.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <XCircle size={16} className="mr-1" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogContent className="bg-[hsl(240,5%,6%)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-tight">Cancel Booking</DialogTitle>
            <DialogDescription className="text-white/50">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setCancelId(null)}
              className="text-white/60 hover:text-white hover:bg-white/5"
              data-testid="cancel-dialog-dismiss"
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-500 hover:bg-red-600 text-white"
              data-testid="cancel-dialog-confirm"
            >
              {cancelling ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
