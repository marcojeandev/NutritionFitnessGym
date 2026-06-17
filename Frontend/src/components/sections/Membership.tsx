import { Check, ShieldCheck, Zap, Star, Trophy, Users, Dumbbell, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Membership = () => {
  return (
    <section id="membership" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-4">Pricing Plans</h2>
        <h3 className="text-4xl md:text-7xl font-black uppercase mb-6 text-balance">
          Choose Your <span className="text-gradient">Grind.</span>
        </h3>
        <p className="text-white/50 max-w-2xl mx-auto text-base md:text-lg font-medium px-4">
          From daily walk-ins to comprehensive trainer packages, we have the right plan to help you achieve your goals. All memberships require a one-time registration fee of <span className="text-white font-bold">₱150.00</span>.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Regular Membership */}
        <div className="relative group flex flex-col h-full">
          <div className="absolute -inset-1 bg-white/5 rounded-3xl blur-md transition duration-500 group-hover:bg-white/10"></div>
          <div className="relative glass border border-white/10 rounded-3xl p-8 flex flex-col h-full hover:border-white/20 transition duration-300">
            <div className="mb-8">
              <Users className="size-8 text-white/40 mb-4" />
              <h4 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Regular Member</h4>
              <p className="text-white/50 text-sm mb-6">Standard monthly access for all individuals.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">₱</span>
                <span className="text-5xl font-black leading-none text-white">550</span>
                <span className="text-sm font-bold uppercase text-white/40">/ mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Full gym equipment access', 'Smart QR check-in', 'Locker room access', '₱50.00 Walk-in Member rate'].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="size-4 text-white/70 mt-0.5" />
                  <span className="text-sm text-white/70">{feat}</span>
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button variant="outline" className="w-full rounded-full border-white/20 text-white hover:bg-white hover:text-black">
                Select Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Student Membership */}
        <div className="relative group flex flex-col h-full">
          <div className="absolute -inset-1 bg-white/5 rounded-3xl blur-md transition duration-500 group-hover:bg-white/10"></div>
          <div className="relative glass border border-white/10 rounded-3xl p-8 flex flex-col h-full hover:border-white/20 transition duration-300">
            <div className="mb-8">
              <Dumbbell className="size-8 text-white/40 mb-4" />
              <h4 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Student Member</h4>
              <p className="text-white/50 text-sm mb-6">Discounted rate for students (Valid ID required).</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">₱</span>
                <span className="text-5xl font-black leading-none text-white">480</span>
                <span className="text-sm font-bold uppercase text-white/40">/ mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['All regular member benefits', 'Special student discount', 'Smart QR check-in', 'Requires valid Student ID upon payment'].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="size-4 text-white/70 mt-0.5" />
                  <span className="text-sm text-white/70">{feat}</span>
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button variant="outline" className="w-full rounded-full border-white/20 text-white hover:bg-white hover:text-black">
                Select Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Highlighted Trainer Package */}
        <div className="relative group flex flex-col h-full md:transform md:-translate-y-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-[#1a1a1a] border border-primary/50 rounded-3xl p-8 flex flex-col h-full shadow-2xl">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full flex items-center gap-1">
                <Star className="size-3 fill-current" /> Recommended
              </span>
            </div>
            <div className="mb-8">
              <Trophy className="size-8 text-primary mb-4" />
              <h4 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Trainer Package</h4>
              <p className="text-white/50 text-sm mb-6">Ultimate guidance for serious transformations.</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-black text-white">₱</span>
                <span className="text-4xl font-black leading-none text-white">850</span>
                <span className="text-sm font-bold uppercase text-white/40">/ 15 days</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">₱</span>
                <span className="text-4xl font-black leading-none text-white">1,500</span>
                <span className="text-sm font-bold uppercase text-white/40">/ 1 month</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Personalized workout routine', 'One-on-one expert guidance', 'Form correction & safety', 'Dietary & supplement advice'].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="size-4 text-primary mt-0.5" />
                  <span className="text-sm font-medium text-white/90">{feat}</span>
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button variant="premium" className="w-full rounded-full h-12 font-bold uppercase tracking-widest">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Services (Walk-ins & Court Rent) */}
      <div className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Walk-in Rates */}
        <div className="glass border border-white/5 rounded-3xl p-8 flex items-center gap-6">
          <div className="size-16 rounded-2xl bg-white/5 flex flex-shrink-0 items-center justify-center">
            <Activity className="size-8 text-white/60" />
          </div>
          <div>
            <h4 className="text-lg font-black uppercase tracking-tight mb-2">Daily Walk-ins</h4>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div>
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1">Non-Member</span>
                <span className="text-2xl font-black">₱60.00</span>
              </div>
              <div>
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1">Active Member</span>
                <span className="text-2xl font-black text-primary">₱50.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Basketball Court Rent */}
        <div className="glass border border-white/5 rounded-3xl p-8 flex items-center gap-6">
          <div className="size-16 rounded-2xl bg-white/5 flex flex-shrink-0 items-center justify-center">
            <Clock className="size-8 text-white/60" />
          </div>
          <div>
            <h4 className="text-lg font-black uppercase tracking-tight mb-2">Basketball Court Rent</h4>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div>
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1">7AM - 6PM</span>
                <span className="text-2xl font-black">₱150<span className="text-sm text-white/40">/hr</span></span>
              </div>
              <div>
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1">6PM - 10PM</span>
                <span className="text-2xl font-black text-primary">₱200<span className="text-sm text-white/40">/hr</span></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Membership;

