import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SoccerBall, User, EnvelopeSimple, Lock } from "@phosphor-icons/react";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const result = await register(name, email, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div data-testid="register-page" className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <SoccerBall size={40} weight="fill" className="text-[hsl(211,100%,50%)] mx-auto" />
          <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tighter uppercase text-white">
            Create Account
          </h1>
          <p className="text-white/50 text-sm">Join TurfBook to start booking turfs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
          {error && (
            <div data-testid="register-error" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs tracking-[0.15em] uppercase font-bold text-white/50">Full Name</Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                id="name"
                type="text"
                data-testid="register-name-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-[hsl(211,100%,50%)] rounded-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs tracking-[0.15em] uppercase font-bold text-white/50">Email</Label>
            <div className="relative">
              <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                id="email"
                type="email"
                data-testid="register-email-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-[hsl(211,100%,50%)] rounded-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs tracking-[0.15em] uppercase font-bold text-white/50">Password</Label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                id="password"
                type="password"
                data-testid="register-password-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-[hsl(211,100%,50%)] rounded-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            data-testid="register-submit-btn"
            disabled={loading}
            className="w-full bg-[hsl(211,100%,50%)] hover:bg-[hsl(211,100%,55%)] text-white font-bold tracking-wide uppercase py-5 rounded-sm disabled:opacity-40"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link to="/login" data-testid="goto-login-link" className="text-[hsl(211,100%,50%)] hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
