import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SoccerBall, List, X, CalendarCheck, SignOut, User } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/turfs", label: "Turfs" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav data-testid="navbar" className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="navbar-logo">
            <SoccerBall size={28} weight="fill" className="text-[hsl(211,100%,50%)]" />
            <span className="font-heading text-xl font-bold tracking-tight uppercase text-white">
              TurfBook
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                  isActive(link.to)
                    ? "text-[hsl(211,100%,50%)]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    data-testid="user-menu-trigger"
                    className="text-white/70 hover:text-white hover:bg-white/5 gap-2"
                  >
                    <User size={18} />
                    <span className="text-sm">{user.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[hsl(240,5%,6%)] border-white/10">
                  <DropdownMenuItem
                    data-testid="nav-my-bookings"
                    onClick={() => navigate("/my-bookings")}
                    className="cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/5"
                  >
                    <CalendarCheck size={16} className="mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    data-testid="nav-logout"
                    onClick={logout}
                    className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-white/5"
                  >
                    <SignOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    data-testid="nav-login"
                    className="text-white/70 hover:text-white hover:bg-white/5"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    data-testid="nav-register"
                    className="bg-[hsl(211,100%,50%)] hover:bg-[hsl(211,100%,55%)] text-white rounded-sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-white/10 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded ${
                  isActive(link.to)
                    ? "text-[hsl(211,100%,50%)] bg-white/5"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded"
                >
                  My Bookings
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="ghost" className="w-full text-white/70 hover:text-white border border-white/10">Log In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button className="w-full bg-[hsl(211,100%,50%)] hover:bg-[hsl(211,100%,55%)] text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
