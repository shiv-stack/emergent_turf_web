import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { MapPin, Star, Clock, CheckCircle, ArrowLeft } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function TurfImage({ turf }) {
  return (
    <div className="relative rounded-lg overflow-hidden h-64 md:h-96 border border-white/10">
      <img src={turf.image_url} alt={turf.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

function TurfInfo({ turf }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {turf.sport_types?.map(s => (
          <Badge key={s} className="bg-[hsl(211,100%,50%)] text-white text-[10px] tracking-wider uppercase border-0 rounded-sm px-2.5 py-1">
            {s}
          </Badge>
        ))}
      </div>
      <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-white">
        {turf.name}
      </h1>
      <div className="flex items-center gap-4 text-white/50 text-sm">
        <span className="flex items-center gap-1.5"><MapPin size={16} />{turf.location}, {turf.city}</span>
        <span className="flex items-center gap-1.5"><Star size={16} weight="fill" className="text-yellow-400" />{turf.rating}</span>
        <span className="flex items-center gap-1.5"><Clock size={16} />{turf.open_time} - {turf.close_time}</span>
      </div>
      <p className="text-white/60 leading-relaxed">{turf.description}</p>
    </div>
  );
}

function AmenitiesList({ amenities }) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-white">Amenities</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {amenities?.map((amenity) => (
          <div key={amenity} className="flex items-center gap-2 text-sm text-white/70 bg-white/5 border border-white/10 rounded-sm px-3 py-2.5">
            <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
            {amenity}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TurfDetailPage() {
  const { id } = useParams();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTurf = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/turfs/${id}`);
      setTurf(data);
    } catch (error) {
      console.error("Failed to fetch turf:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTurf();
  }, [fetchTurf]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(211,100%,50%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-white/40 text-lg">Turf not found.</p>
        <Link to="/turfs" className="text-[hsl(211,100%,50%)] mt-4 inline-block">Back to Turfs</Link>
      </div>
    );
  }

  return (
    <div data-testid="turf-detail-page" className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      {/* Back Link */}
      <Link
        to="/turfs"
        data-testid="back-to-turfs"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Turfs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <TurfImage turf={turf} />
          <TurfInfo turf={turf} />
          <AmenitiesList amenities={turf.amenities} />
        </div>

        {/* Sidebar - Booking CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-white/10 rounded-lg bg-[hsl(240,5%,6%)] p-6 space-y-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase font-bold text-white/40 mb-1">Price</p>
              <p className="text-3xl font-heading font-black text-[hsl(211,100%,50%)]">
                ₹{turf.price_per_hour}
                <span className="text-sm font-body text-white/40 font-normal">/hour</span>
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Open Hours</span>
                <span className="text-white">{turf.open_time} - {turf.close_time}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Location</span>
                <span className="text-white">{turf.city}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Rating</span>
                <span className="text-white flex items-center gap-1">
                  <Star size={12} weight="fill" className="text-yellow-400" /> {turf.rating}
                </span>
              </div>
            </div>

            <Link to={`/book/${turf.id}`} className="block">
              <Button
                data-testid="book-now-btn"
                className="w-full bg-[hsl(211,100%,50%)] hover:bg-[hsl(211,100%,55%)] text-white font-bold tracking-wide uppercase py-6 rounded-sm text-base"
              >
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
