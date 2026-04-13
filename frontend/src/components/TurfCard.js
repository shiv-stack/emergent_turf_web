import { Link } from "react-router-dom";
import { MapPin, Star, Clock } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

export default function TurfCard({ turf, index = 0 }) {
  return (
    <Link
      to={`/turfs/${turf.id}`}
      data-testid={`turf-card-${turf.id}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      <div className="border border-white/10 rounded-lg overflow-hidden bg-[hsl(240,5%,6%)] transition-colors duration-200 hover:border-[hsl(211,100%,50%)]/40">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={turf.image_url}
            alt={turf.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
            {turf.sport_types?.map((sport) => (
              <Badge key={sport} className="bg-[hsl(211,100%,50%)] text-white text-[10px] tracking-wider uppercase border-0 rounded-sm px-2 py-0.5">
                {sport}
              </Badge>
            ))}
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-sm">
            <Star size={12} weight="fill" className="text-yellow-400" />
            <span className="text-xs font-semibold text-white">{turf.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-white group-hover:text-[hsl(211,100%,50%)] transition-colors duration-200">
            {turf.name}
          </h3>
          <div className="flex items-center gap-1.5 text-white/50 text-sm">
            <MapPin size={14} />
            <span>{turf.location}, {turf.city}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <Clock size={12} />
              <span>{turf.open_time} - {turf.close_time}</span>
            </div>
            <span className="text-[hsl(211,100%,50%)] font-bold text-lg font-heading">
              ₹{turf.price_per_hour}<span className="text-xs text-white/40 font-body font-normal">/hr</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
