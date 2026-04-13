import { format } from "date-fns";
import { Clock } from "@phosphor-icons/react";

function SlotSkeleton() {
  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={`skeleton-slot-${i}`} className="h-12 bg-white/5 rounded-sm animate-pulse" />
      ))}
    </div>
  );
}

function SlotButton({ slot, isSelected, onToggle }) {
  const className = !slot.available
    ? "slot-booked text-white/30"
    : isSelected
    ? "slot-selected text-white"
    : "slot-available text-white/80";

  return (
    <button
      data-testid={`slot-${slot.time}`}
      disabled={!slot.available}
      onClick={() => onToggle(slot.time)}
      className={`h-12 flex items-center justify-center text-sm font-medium rounded-sm transition-colors duration-200 ${className}`}
    >
      {slot.time}
    </button>
  );
}

function SlotLegend() {
  return (
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
  );
}

export default function TimeSlotGrid({ selectedDate, slots, selectedSlot, toggleSlot, loadingSlots }) {
  return (
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
        <SlotSkeleton />
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-7 gap-3" data-testid="time-slots-grid">
          {slots.map((slot) => (
            <SlotButton
              key={slot.time}
              slot={slot}
              isSelected={slot.time === selectedSlot}
              onToggle={toggleSlot}
            />
          ))}
        </div>
      )}

      <SlotLegend />
    </div>
  );
}
