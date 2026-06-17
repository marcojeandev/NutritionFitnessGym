import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterDialog } from '@/features/auth/components/RegisterDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, UserPlus, ArrowLeft, Dumbbell, Camera, Upload, Eye, EyeOff } from 'lucide-react';
import { gsap } from '@/lib/animations';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
  });
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Password validation
  const hasMinLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\\/]/.test(formData.password);
  const isPasswordValid = hasMinLength && hasUpper && hasSymbol;

  // Form validity
  const isFormValid = Boolean(
    formData.firstname && 
    formData.lastname && 
    formData.username && 
    formData.email && 
    isPasswordValid && 
    phone && 
    sex && 
    profileImage && 
    termsAccepted
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        e.target.value = ''; // Reset the input
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileImage) {
      toast.error("Please upload a profile picture.");
      return;
    }
    if (!formData.firstname || !formData.lastname || !formData.username || !formData.email || !formData.password || !phone || !sex) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!isPasswordValid) {
      toast.error("Please meet all password requirements.");
      return;
    }
    if (!termsAccepted) {
      toast.error("You must agree to the Membership Agreement.");
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append('firstname', formData.firstname);
      payload.append('lastname', formData.lastname);
      payload.append('username', formData.username);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('password_confirmation', formData.password); // Required by backend
      payload.append('payment_amount', '150'); // Set registration fee amount
      payload.append('or_number', `OR-${Date.now()}`); // Auto-generate real OR number
      payload.append('payment_type', 'cash'); // Default payment type
      payload.append('contact', phone);
      if (sex) payload.append('sex', sex);
      if (profileImage) payload.append('profile', profileImage);

      await authService.register(payload);
      toast.success("Account created successfully! Please visit the front desk to complete your registration and receive your QR code.");
      navigate('/login');
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0] as string[];
        toast.error(firstError?.[0] || "Validation failed. Check your inputs.");
        console.error("Validation errors:", errors);
      } else {
        toast.error(error.response?.data?.message || "Registration failed. Please try again.");
      }
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
        scale: 1.1,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > 0 && val[0] !== '9') return;
    if (val.length > 10) return;
    setPhone(val);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] flex flex-col md:flex-row overflow-hidden selection:bg-white selection:text-black">
      {/* Left Column: Immersive Brand Side */}
      <div className="relative w-full md:w-[40%] lg:w-[45%] h-[30vh] md:h-screen overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
        <div ref={leftContentRef} className="absolute inset-0">
          <img
            src="/hero.png"
            alt="Gym Interior"
            className="w-full h-full object-cover grayscale-[0.4] opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        </div>

        <div className="relative z-10 h-full p-8 md:p-12 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <img src="/logo_gym.png" alt="Gym Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter text-white">NFH</span>
          </Link>

          <div className="hidden md:block space-y-4">
            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tight leading-[0.9]">
              The <span className="text-gradient">Elite</span><br />Standard.
            </h1>
            <p className="text-white/40 max-w-sm font-medium text-lg leading-relaxed">
              Your journey to the absolute peak of performance begins with a single application.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            <span>© 2026 NFH ELITE</span>
            <div className="flex gap-4">
              <span>Verified Space</span>
              <span>PWA Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 lg:p-12 overflow-y-auto custom-scrollbar">
        <div ref={formRef} className="w-full max-w-md">
          {/* Mobile Only Header */}
          <div className="md:hidden mb-4 space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Join Now.</h2>
            <p className="text-white/40 font-medium text-[10px]">Become part of the 1%.</p>
          </div>

          <div className="space-y-4">
            <header className="reveal-item">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 mb-2">
                <UserPlus className="size-3" />
                Membership Application
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white leading-tight">Profile Details</h3>
              <p className="text-white/40 text-[10px] md:text-xs font-medium mt-1 leading-relaxed">
                Enter your information to secure your spot in our elite system.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
              <div className="flex flex-col items-center gap-2 mb-2 reveal-item">
                <Avatar className="size-14 border border-white/10 bg-white/5">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-transparent"><Camera className="size-6 text-white/20" /></AvatarFallback>
                  )}
                </Avatar>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="h-7 bg-white/5 border-white/10 rounded-lg text-[10px] gap-1.5 text-white/60 hover:text-white px-3">
                    <Camera className="size-3" /> Capture
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="h-7 bg-white/5 border-white/10 rounded-lg text-[10px] gap-1.5 text-white/60 hover:text-white px-3">
                    <Upload className="size-3" /> Upload
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 reveal-item">
                <div className="space-y-1.5">
                  <Input
                    id="first-name"
                    placeholder="First Name"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    autoComplete="off"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-all autofill-dark text-white px-4 font-semibold text-sm hover:bg-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Input
                    id="last-name"
                    placeholder="Last Name"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    autoComplete="off"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-all autofill-dark text-white px-4 font-semibold text-sm hover:bg-white/10"
                  />
                </div>
              </div>

              <div className="reveal-item pt-1">
                <Input
                  id="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  autoComplete="off"
                  className="h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-all autofill-dark text-white px-4 font-semibold text-sm hover:bg-white/10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 reveal-item">
                <div className="space-y-1.5">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="off"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-all autofill-dark text-white px-4 font-semibold text-sm hover:bg-white/10"
                  />
                </div>
                <div className="relative space-y-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="off"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-all autofill-dark text-white px-4 font-semibold text-sm pr-11 hover:bg-white/10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-[24px] -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <div className="text-[9px] font-semibold text-white/40 flex justify-between px-1 mt-2 uppercase tracking-wider">
                    <span className={`transition-colors ${hasMinLength ? "text-emerald-500" : ""}`}>8+ chars</span>
                    <span className={`transition-colors ${hasUpper ? "text-emerald-500" : ""}`}>1+ upper</span>
                    <span className={`transition-colors ${hasSymbol ? "text-emerald-500" : ""}`}>1+ symbol</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 reveal-item">
                <div className="relative flex">
                  <div className="flex items-center justify-center bg-white/5 border-y border-l border-white/5 rounded-l-xl px-4 text-xs font-bold text-white/40 border-r border-r-white/10">
                    +63
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    autoComplete="off"
                    placeholder="Phone Number"
                    className="h-12 bg-white/5 border-white/5 rounded-none rounded-r-xl focus:border-white/20 transition-all tracking-[0.15em] font-mono autofill-dark text-white font-semibold text-sm hover:bg-white/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSex('male')}
                    className={`h-12 rounded-xl border transition-all flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest ${
                      sex === 'male' 
                      ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                      : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex('female')}
                    className={`h-12 rounded-xl border transition-all flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest ${
                      sex === 'female' 
                      ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                      : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-3 reveal-item">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-0.5 border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black rounded-md size-4" 
                />
                <div className="grid gap-1 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-[11px] text-white/50 font-medium leading-tight cursor-pointer select-none"
                  >
                    I agree to the <span className="text-white font-bold hover:underline underline-offset-4">Membership Agreement</span> and consent to renewals.
                  </label>
                </div>
              </div>

              <div className="pt-6 reveal-item">
                <Button disabled={isLoading} type="submit" variant="premium" className="w-full h-14 rounded-xl text-[13px] font-black uppercase tracking-widest shadow-2xl shadow-white/5 hover:bg-white hover:text-black hover:scale-[1.01] active:scale-[0.99] transition-all">
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
                <div className="mt-5 text-center">
                   <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
                     Already a member? <Link to="/login" className="text-white hover:underline underline-offset-4 ml-1">Sign In</Link>
                   </p>
                </div>
              </div>
            </form>

            <div className="pt-4 mt-4 border-t border-white/5 reveal-item">
              <div className="flex items-center gap-4 text-white/20">
                <ShieldCheck className="size-5" />
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] leading-tight">
                  Processed by front-desk cashier. <br />
                  Verified PWA Protocol active.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
