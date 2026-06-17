import { useEffect, useRef } from 'react';
import { Users, QrCode, Dumbbell, Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { gsap } from '@/lib/animations';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      mm.add({
        reduceMotion: "(prefers-reduced-motion: reduce)",
        standardMotion: "(prefers-reduced-motion: no-preference)"
      }, (context) => {
        const { reduceMotion } = context.conditions!;
        const tl = gsap.timeline();
        
        tl.from(titleRef.current, {
          y: reduceMotion ? 0 : 100,
          autoAlpha: 0,
          duration: 1.2,
          ease: "power4.out",
        })
        .from(subRef.current, {
          y: reduceMotion ? 0 : 40,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
        }, "-=0.8")
        .from(".hero-cta", {
          y: reduceMotion ? 0 : 20,
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: "power2.out",
        }, "-=0.4")
        .from(".stat-card", {
          scale: reduceMotion ? 1 : 0.8,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
        }, "-=0.4");

        if (!reduceMotion) {
          gsap.to(".hero-bg", {
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
            y: 200,
            scale: 1.1,
          });
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={heroRef} className="relative min-h-screen flex flex-col items-center overflow-hidden px-6 text-center pt-24 md:pt-32 pb-20">
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero.png" 
          alt="Modern high-end gym interior with matte black equipment" 
          width={1920}
          height={1080}
          className="hero-bg w-full h-full object-cover grayscale-[0.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
      </div>

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center gap-6 md:gap-8">
        {/* Main Content Group */}
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/10 text-[10px] md:text-xs font-semibold tracking-widest uppercase text-white/60 animate-in fade-in slide-in-from-top duration-1000">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true"></span>
            Experience the Future of Fitness
          </div>
          
          <h1 ref={titleRef} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1] md:leading-[0.95] uppercase text-balance">
            Train <span className="text-gradient">Smarter.</span><br />
            Track Better.<br />
            Perform Stronger.
          </h1>
          
          <p ref={subRef} className="text-sm md:text-base text-white/50 max-w-2xl mx-auto font-medium leading-relaxed px-4 md:px-0">
            The ultimate gym management system designed for elite athletes and luxury fitness spaces. Precision tracking meets cinematic experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto px-4 md:px-0 mt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="premium" size="lg" className="hero-cta h-12 md:h-14 px-8 md:px-10 rounded-full text-base md:text-lg w-full sm:w-auto">
                Get Started Today
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="hero-cta h-12 md:h-14 px-8 md:px-10 rounded-full text-base md:text-lg w-full sm:w-auto group">
              Explore Features
              <ChevronRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Stats Group - Responsive Grid for Mobile */}
        <div ref={statsRef} className="w-full max-w-4xl mx-auto px-2 md:px-0 md:-mt-8">
          <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-3 md:gap-4 lg:gap-6">
            {[
              { label: "Active Members", value: "2,450+", icon: Users },
              { label: "Live Gym Load", value: "42%", icon: Activity },
              { label: "Check-ins Today", value: "892", icon: QrCode },
              { label: "Workouts Logged", value: "15.2k", icon: Dumbbell },
            ].map((stat, i) => (
              <StatCard key={i} stat={stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ stat }: { stat: { label: string; value: string; icon: any } }) => {
  const numberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Parse value
      const match = stat.value.match(/([\d,.]+)([^\d,.]*)/);
      if (!match) return;
      
      const targetValue = parseFloat(match[1].replace(/,/g, ''));
      const suffix = match[2];
      const isFloat = match[1].includes('.');
      const hasCommas = match[1].includes(',');

      const obj = { val: 0 };
      
      gsap.to(obj, {
        val: targetValue,
        duration: 3,
        delay: 0.5, // Slight delay after hero title reveals
        ease: "power3.out",
        onUpdate: () => {
          if (numberRef.current) {
            let current = isFloat ? obj.val.toFixed(1) : Math.floor(obj.val).toString();
            if (hasCommas) {
              current = current.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            numberRef.current.innerText = current + suffix;
          }
        }
      });
    }, numberRef);
    return () => ctx.revert();
  }, [stat.value]);

  return (
    <div className="stat-card flex-1 min-w-0 glass p-4 md:p-6 rounded-2xl border-white/5 flex flex-col gap-3 md:gap-4 text-left">
      <div className="size-8 md:size-10 rounded-xl bg-white/5 flex items-center justify-center">
        <stat.icon className="size-4 md:size-5 text-white/80" aria-hidden="true" />
      </div>
      <div>
        <div ref={numberRef} className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-none mb-1">0</div>
        <div className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold leading-tight">{stat.label}</div>
      </div>
    </div>
  );
};

export default Hero;
