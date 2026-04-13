import { format } from "date-fns";
import { CurrencyInr } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function BookingSummary({ turf, selectedDate, selectedSlot, totalPrice, submitting, onConfirm }) {
  return (
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
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : "\u2014"}
          </span>
        </div>
        <div className="flex justify-between text-white/50">
          <span>Time</span>
          <span className="text-white font-medium">{selectedSlot || "\u2014"}</span>
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
        onClick={onConfirm}
        disabled={!selectedSlot || submitting}
        className="w-full bg-[hsl(211,100%,50%)] hover:bg-[hsl(211,100%,55%)] text-white font-bold tracking-wide uppercase py-6 rounded-sm text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Confirming..." : "Confirm Booking"}
      </Button>
    </div>
  );
}
