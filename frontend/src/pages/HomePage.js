import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, MagnifyingGlass, MapPin, Trophy, Lightning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import TurfCard from "@/components/TurfCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const HERO_BG = "https://images.unsplash.com/photo-1671209151455-86980f5bf293?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxmb290YmFsbCUyMHR1cmYlMjBuaWdodHxlbnwwfHx8fDE3NzYwNjEwOTZ8MA&ixlib=rb-4.1.0&q=85";

export default function HomePage() {
  const [turfs, setTurfs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFeaturedTurfs = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/turfs`);
      setTurfs(data);
    } catch (error) {
      console.error("Failed to fetch featured turfs:", error);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedTurfs();
  }, [fetchFeaturedTurfs]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/turfs?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const stats = [
    { icon: MapPin, label: "LOCATIONS", value: "6+" },
    { icon: Trophy, label: "BOOKINGS", value: "10K+" },
    { icon: Lightning, label: "SPORTS", value: "5+" },
  ];

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Turf" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-12 w-full">
          <div className="max-w-2xl space-y-8">
            <div className="space-y-4 animate-fade-in-up" style={{ opacity: 0, animationDelay: '100ms' }}>
              <p className="text-xs tracking-[0.3em] uppercase font-bold text-[hsl(211,100%,50%)]">
                Book Your Game
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-white leading-[0.95]">
                Find & Book<br />
                <span className="text-[hsl(211,100%,50%)]">Premium Turfs</span><br />
                Near You
              </h1>
              <p className="text-base text-white/60 max-w-lg tracking-wide">
                Discover the best sports turfs in your city. Book instantly for football, cricket, tennis and more.
              </p>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex gap-0 animate-fade-in-up"
              style={{ opacity: 0, animationDelay: '300ms' }}
              data-testid="hero-search-form"
            >
              <div className="flex-1 relative">
                <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  data-testid="hero-search-input"
                  placeholder="Search by city, turf name, or sport..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[hsl(211,100%,50%)] transition-colors"
                />
              </div>
              <Button
                type="submit"
                data-testid="hero-search-btn"
                className="bg-[hsl(211,100%,50%)] hover:bg-[hsl(211,100%,55%)] text-white px-8 rounded-none font-semibold tracking-wide"
              >
                Search
              </Button>
            </form>

            {/* Stats */}
            <div className="flex gap-8 animate-fade-in-up" style={{ opacity: 0, animationDelay: '400ms' }}>
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <stat.icon size={20} weight="bold" className="text-[hsl(211,100%,50%)]" />
                  <div>
                    <p className="text-white font-bold text-lg font-heading">{stat.value}</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-bold">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Turfs */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-24" data-testid="featured-turfs-section">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-[hsl(211,100%,50%)] mb-2">Featured</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight uppercase text-white">
              Top Turfs
            </h2>
          </div>
          <Link
            to="/turfs"
            data-testid="view-all-turfs-link"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-[hsl(211,100%,50%)] transition-colors duration-200"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {turfs.slice(0, 3).map((turf, i) => (
            <TurfCard key={turf.id} turf={turf} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
