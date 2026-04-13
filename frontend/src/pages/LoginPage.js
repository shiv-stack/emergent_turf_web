import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SoccerBall, EnvelopeSimple, Lock } from "@phosphor-icons/react";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div data-testid="login-page" className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <SoccerBall size={40} weight="fill" className="text-[hsl(211,100%,50%)] mx-auto" />
          <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tighter uppercase text-white">
            Welcome Back
          </h1>
          <p className="text-white/50 text-sm">Sign in to your TurfBook account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
          {error && (
            <div data-testid="login-error" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs tracking-[0.15em] uppercase font-bold text-white/50">Email</Label>
            <div className="relative">
              <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                id="email"
                type="email"
                data-testid="login-email-input"
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
                data-testid="login-password-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-[hsl(211,100%,50%)] rounded-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            data-testid="login-submit-btn"
            disabled={loading}
            className="w-full bg-[hsl(211,100%,50%)] hover:bg-[hsl(211,100%,55%)] text-white font-bold tracking-wide uppercase py-5 rounded-sm disabled:opacity-40"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-white/40">
          Don't have an account?{" "}
          <Link to="/register" data-testid="goto-register-link" className="text-[hsl(211,100%,50%)] hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
