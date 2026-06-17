import { Menu, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-6 md:px-12 flex items-center h-20">
      {/* Logo Section - Left Balanced */}
      <Link to="/" className="flex-1 flex items-center justify-start gap-2 group">
        <div className="w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform">
          <img src="/logo_gym.png" alt="Gym Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-sm md:text-base font-bold tracking-tighter uppercase whitespace-nowrap">Nutrition and Fitness Hub</span>
      </Link>
      
      {/* Links Section - Perfectly Centered */}
      <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
        <a href="/#home" className="hover:text-white transition-all duration-300">Home</a>
        <a href="/#location" className="hover:text-white transition-all duration-300">Location</a>
        <a href="/#membership" className="hover:text-white transition-all duration-300">Membership</a>
        <a href="/#features" className="hover:text-white transition-all duration-300">Features</a>
        <a href="/#experience" className="hover:text-white transition-all duration-300">Experience</a>
        <a href="/#app" className="hover:text-white transition-all duration-300">PWA</a>
      </div>

      {/* Actions Section - Right Balanced */}
      <div className="flex-1 flex items-center justify-end gap-6">
        <Link to="/login">
          <Button variant="ghost" className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all">
            Member Login
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="premium" size="lg" className="rounded-full h-11 px-8 hidden sm:inline-flex text-xs font-black uppercase tracking-widest">
            Join Now
          </Button>
        </Link>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden text-white">
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#0a0a0a] border-white/5 text-white">
            <div className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Access gym features, membership options, and member login portal.</SheetDescription>
            </div>
            <div className="flex flex-col gap-8 mt-12">
              <a href="/#home" className="text-2xl font-black uppercase tracking-tighter hover:text-white/60">Home</a>
              <a href="/#location" className="text-2xl font-black uppercase tracking-tighter hover:text-white/60">Location</a>
              <a href="/#membership" className="text-2xl font-black uppercase tracking-tighter hover:text-white/60">Membership</a>
              <a href="/#features" className="text-2xl font-black uppercase tracking-tighter hover:text-white/60">Features</a>
              <a href="/#experience" className="text-2xl font-black uppercase tracking-tighter hover:text-white/60">Experience</a>
              <a href="/#app" className="text-2xl font-black uppercase tracking-tighter hover:text-white/60">PWA</a>
              <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                <Link to="/register">
                  <Button variant="premium" size="lg" className="w-full h-14 rounded-full text-lg font-black uppercase tracking-widest">
                    Join Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="w-full h-14 justify-center text-lg font-black uppercase tracking-widest text-white/40">
                    Member Login
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
