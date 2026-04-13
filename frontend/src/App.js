import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import TurfsPage from "@/pages/TurfsPage";
import TurfDetailPage from "@/pages/TurfDetailPage";
import BookingPage from "@/pages/BookingPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-8 h-8 border-2 border-[hsl(211,100%,50%)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/turfs" element={<TurfsPage />} />
        <Route path="/turfs/:id" element={<TurfDetailPage />} />
        <Route path="/book/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster theme="dark" position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
