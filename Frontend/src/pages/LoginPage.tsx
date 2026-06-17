import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, ArrowLeft, Dumbbell, ShieldCheck, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { gsap } from '@/lib/animations';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/useAuthStore';

const LoginPage = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !password) {
      toast.error('Please enter your email/username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({
        login: loginIdentifier,
        password: password
      });

      setAuth(response.data.user, response.data.token);
      toast.success('Login successful!');

      const role = response.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'cashier') navigate('/cashier');
      else navigate('/member');

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance Animations
      gsap.from(".reveal-item", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });

      gsap.from(leftContentRef.current, {
        scale: 1.05,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] flex flex-col md:flex-row overflow-hidden selection:bg-white selection:text-black">
      {/* Left Column: Immersive Brand Side */}
      <div className="relative w-full md:w-[40%] lg:w-[45%] h-[25vh] md:h-screen overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
        <div ref={leftContentRef} className="absolute inset-0">
          <img
            src="/login-bg.png"
            alt="Gym Access"
            className="w-full h-full object-cover grayscale-[0.2] opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
        </div>

        <div className="relative z-10 h-full p-6 md:p-12 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <img src="/logo_gym.png" alt="Gym Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter text-white">NFH</span>
          </Link>

          <div className="hidden md:block space-y-4">
            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tight leading-[0.9]">
              Welcome <span className="text-gradient">Back.</span>
            </h1>
            <p className="text-white/40 max-w-sm font-medium text-lg leading-relaxed">
              Access your personalized performance metrics and elite training data instantly.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>System Online</span>
            </div>
            <span>Encrypted Session</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 lg:p-12 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-sm">
          {/* Mobile Only Header */}
          <div className="md:hidden mb-6 space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Sign In.</h2>
            <p className="text-white/40 font-medium text-[10px]">Secure member portal.</p>
          </div>

          <div className="space-y-6">
            <header className="reveal-item">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 mb-3">
                <Fingerprint className="size-3" />
                Identity Verification
              </div>
              <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">Member Access</h3>
              <p className="text-white/40 text-[10px] md:text-sm font-medium mt-1 leading-relaxed">
                Log in to generate your QR ID and track your active progress.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div className="space-y-1 reveal-item">
                <Label htmlFor="email" className="text-[9px] uppercase tracking-widest font-bold text-white/40 ml-1">Email or Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Juan.Delacruz@gmail.com"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  autoComplete="off"
                  className="h-11 md:h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-colors autofill-dark text-white px-5 font-bold text-sm"
                />
              </div>

              <div className="space-y-1 reveal-item">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[9px] uppercase tracking-widest font-bold text-white/40">Password</Label>
                  <a href="#" className="text-[9px] uppercase tracking-widest font-black text-white/20 hover:text-white transition-colors">Forgot?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    className="h-11 md:h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-colors autofill-dark text-white px-5 pr-12 font-bold text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 reveal-item">
                <Button disabled={isLoading} type="submit" variant="premium" className="w-full h-12 md:h-13 rounded-xl text-base font-black uppercase tracking-tight shadow-2xl shadow-white/5 hover:scale-[1.01] active:scale-[0.99] transition-all">
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </Button>
                <div className="mt-6 text-center">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    Not a member yet? <Link to="/register" className="text-white hover:underline underline-offset-4 ml-1">Apply Now</Link>
                  </p>
                </div>
              </div>
            </form>

            <div className="pt-4 mt-6 border-t border-white/5 reveal-item">
              <div className="flex items-center gap-4 text-white/20">
                <ShieldCheck className="size-5" />
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] leading-tight">
                  256-bit AES Encryption active. <br />
                  Secure PWA Portal Protocol.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
