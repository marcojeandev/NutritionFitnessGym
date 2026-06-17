import { useEffect, useRef } from 'react';
import { QrCode, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap } from '@/lib/animations';

const MobileShowcase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (!prefersReducedMotion) {
        gsap.to(".phone-mockup", {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
          rotateY: 15,
          rotateX: -5,
          y: -50,
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="app" ref={sectionRef} className="py-24 md:py-48 px-6 bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <div className="order-2 lg:order-1 flex justify-center w-full px-4 md:px-0">
          <div className="phone-mockup relative w-full max-w-[300px] md:max-w-[380px] [perspective:1000px]">
             <div className="relative rounded-[50px] border-[12px] border-[#1a1a1a] bg-[#000] overflow-hidden shadow-2xl cinematic-glow">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-20"></div>
                <img 
                  src="/mobile-showcase.png" 
                  alt="Iron Mobile App UI showing check-in QR code and activity stats" 
                  width={380}
                  height={800}
                  className="w-full h-full object-cover opacity-90 scale-105"
                />
             </div>
             {/* Floating UI elements */}
             <div className="absolute -right-20 top-1/4 glass p-6 rounded-[24px] w-48 hidden md:block cinematic-glow">
                <QrCode className="size-8 mb-4 text-white" aria-hidden="true" />
                <div className="text-sm font-bold uppercase mb-1">Instant Scan</div>
                <div className="text-[10px] text-white/40 leading-tight">Fastest entry system in the industry.</div>
             </div>
             <div className="absolute -left-16 bottom-1/4 glass p-6 rounded-[24px] w-48 hidden md:block cinematic-glow">
                <Activity className="size-8 mb-4 text-white" aria-hidden="true" />
                <div className="text-sm font-bold uppercase mb-1">Real-time</div>
                <div className="text-[10px] text-white/40 leading-tight">Your metrics, synced across all devices.</div>
             </div>
          </div>
        </div>
        
        <div className="order-1 lg:order-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-4">Mobile Experience</h2>
          <h3 className="text-4xl md:text-7xl font-black uppercase mb-10 leading-[0.9] text-balance">
            The Gym In <br /><span className="text-gradient">Your Pocket.</span>
          </h3>
          <p className="text-xl text-white/50 mb-12 max-w-lg leading-relaxed font-medium">
            Fully compatible with <span className="text-white">iOS & Android</span>. Install the Iron PWA directly from your browser—no app store required. High-speed internet recommended for real-time biometric syncing.
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-3xl font-black mb-2 text-white">0.5s</div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/40">Check-in Time</div>
            </div>
            <div>
              <div className="text-3xl font-black mb-2 text-white">Internet</div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/40">Required for Sync</div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center">
            <Button variant="premium" size="lg" className="rounded-full h-14 px-10 w-full sm:w-auto text-lg">
              Download Now
            </Button>
            <div className="flex items-center gap-4 text-white/40">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest">iOS</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest">Android</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileShowcase;
