import { useState, useEffect, useCallback } from "react";
import { authAxios } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookingItem, BookingItemSkeleton, EmptyBookings } from "@/components/bookings/BookingItem";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await authAxios.get(`${API}/bookings/my`);
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = useCallback(async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await authAxios.patch(`${API}/bookings/${cancelId}/cancel`);
      toast.success("Booking cancelled successfully");
      setCancelId(null);
      fetchBookings();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  }, [cancelId, fetchBookings]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <BookingItemSkeleton key={`skeleton-booking-${i}`} index={i} />
          ))}
        </div>
      );
    }
    if (bookings.length === 0) {
      return <EmptyBookings />;
    }
    return (
      <div className="space-y-4">
        {bookings.map((b, i) => (
          <BookingItem key={b.id} booking={b} index={i} onCancel={setCancelId} />
        ))}
      </div>
    );
  };

  return (
    <div data-testid="my-bookings-page" className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] uppercase font-bold text-[hsl(211,100%,50%)] mb-2">Your Activity</p>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-white">
          My Bookings
        </h1>
      </div>

      {renderContent()}

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
