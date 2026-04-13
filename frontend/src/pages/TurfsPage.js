import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TurfCard from "@/components/TurfCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SPORTS = ["all", "football", "cricket", "tennis", "badminton"];
const CITIES = ["all", "Mumbai", "Bangalore", "Delhi"];

export default function TurfsPage() {
  const [searchParams] = useSearchParams();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sport, setSport] = useState("all");
  const [city, setCity] = useState("all");

  useEffect(() => {
    const fetchTurfs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (sport !== "all") params.set("sport", sport);
        if (city !== "all") params.set("city", city);
        const { data } = await axios.get(`${API}/turfs?${params.toString()}`);
        setTurfs(data);
      } catch {
        setTurfs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTurfs();
  }, [search, sport, city]);

  return (
    <div data-testid="turfs-page" className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] uppercase font-bold text-[hsl(211,100%,50%)] mb-2">Browse</p>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-white">
          All Turfs
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8" data-testid="turfs-filters">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            data-testid="turfs-search-input"
            placeholder="Search turfs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-sm text-white text-sm placeholder-white/30 focus:outline-none focus:border-[hsl(211,100%,50%)] transition-colors"
          />
        </div>

        {/* Sport Filter */}
        <Select value={sport} onValueChange={setSport}>
          <SelectTrigger data-testid="sport-filter" className="w-full sm:w-44 bg-white/5 border-white/10 text-white rounded-sm">
            <Funnel size={14} className="mr-2 text-white/40" />
            <SelectValue placeholder="Sport" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(240,5%,6%)] border-white/10">
            {SPORTS.map(s => (
              <SelectItem key={s} value={s} className="text-white/80 focus:bg-white/5 focus:text-white capitalize">
                {s === "all" ? "All Sports" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City Filter */}
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger data-testid="city-filter" className="w-full sm:w-44 bg-white/5 border-white/10 text-white rounded-sm">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(240,5%,6%)] border-white/10">
            {CITIES.map(c => (
              <SelectItem key={c} value={c} className="text-white/80 focus:bg-white/5 focus:text-white">
                {c === "all" ? "All Cities" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="border border-white/10 rounded-lg overflow-hidden bg-[hsl(240,5%,6%)] animate-pulse">
              <div className="h-48 bg-white/5" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-white/5 rounded w-2/3" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-4 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : turfs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">No turfs found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {turfs.map((turf, i) => (
            <TurfCard key={turf.id} turf={turf} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
