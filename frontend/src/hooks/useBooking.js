import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authAxios } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function useBooking(turfId) {
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${API}/turfs/${turfId}`)
      .then(res => setTurf(res.data))
      .catch((error) => console.error("Failed to fetch turf:", error));
  }, [turfId]);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setLoadingSlots(true);
    setSelectedSlot(null);
    axios.get(`${API}/turfs/${turfId}/slots?date=${dateStr}`)
      .then(res => setSlots(res.data.slots || []))
      .catch((error) => {
        console.error("Failed to fetch slots:", error);
        setSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [turfId, selectedDate]);

  const toggleSlot = useCallback((time) => {
    setSelectedSlot(prev => prev === time ? null : time);
  }, []);

  const confirmBooking = useCallback(async () => {
    if (!selectedSlot || !selectedDate) return;
    setSubmitting(true);
    try {
      await authAxios.post(`${API}/bookings`, {
        turf_id: turfId,
        date: format(selectedDate, "yyyy-MM-dd"),
        time_slot: selectedSlot,
        duration: 1,
      });
      toast.success("Booking confirmed! Redirecting to your bookings...");
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (e) {
      const msg = e.response?.data?.detail || "Failed to book. Please try again.";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  }, [selectedSlot, selectedDate, turfId, navigate]);

  return {
    turf,
    selectedDate,
    setSelectedDate,
    slots,
    selectedSlot,
    toggleSlot,
    loadingSlots,
    submitting,
    confirmBooking,
    totalPrice: turf ? turf.price_per_hour : 0,
  };
}
