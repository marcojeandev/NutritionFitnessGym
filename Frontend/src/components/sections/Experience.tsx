import { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap } from '@/lib/animations';

const Experience = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const capacityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      gsap.from(".exp-reveal", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        x: prefersReducedMotion ? 0 : -50,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
      });

      if (!prefersReducedMotion) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 94,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: capacityRef.current,
            start: "top 90%",
          },
          onUpdate: () => {
            if (capacityRef.current) {
              capacityRef.current.innerText = `${Math.floor(obj.val)}%`;
            }
          }
        });
      } else {
        if (capacityRef.current) capacityRef.current.innerText = "94%";
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="py-24 md:py-32 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-4">The Experience</h2>
          <h3 className="text-4xl md:text-6xl font-black uppercase mb-10 leading-tight text-balance">
            Designed for the <span className="text-white/50">Modern Luxury</span> Fitness Space.
          </h3>
          
          <div className="space-y-8">
            {[
              { title: "Cinematic Interface", desc: "A dark-mode first design that complements high-end gym environments." },
              { title: "Seamless PWA Integration", desc: "No downloads required. Access your performance metrics from any device instantly." },
              { title: "Data-Driven Results", desc: "Real-time analytics that help you push boundaries and break records." },
            ].map((item, i) => (
              <div key={i} className="exp-reveal flex gap-6">
                <div className="flex-shrink-0 size-12 rounded-full border border-white/10 flex items-center justify-center text-xl font-black">
                  0{i + 1}
                </div>
                <div>
                  <h4 className="text-xl font-bold uppercase mb-2">{item.title}</h4>
                  <p className="text-white/40 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="premium" size="lg" className="mt-12 rounded-full h-14 px-10">
            Learn More About Our Philosophy
          </Button>
        </div>
        
        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden glass p-4">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0a0a0a] relative">
              <img 
                src="/hero.png" 
                alt="Cinematic luxury gym interior with dramatic lighting" 
                width={800}
                height={800}
                className="w-full h-full object-cover opacity-50 grayscale hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="size-24 rounded-full glass flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
                   <Zap className="size-10 text-white" aria-hidden="true" />
                 </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 size-48 glass rounded-3xl p-6 hidden md:block cinematic-glow">
             <div className="text-xs font-bold uppercase text-white/40 mb-2">Peak Capacity</div>
             <div ref={capacityRef} className="text-4xl font-black">0%</div>
             <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full w-full bg-white animate-pulse"></div>
             </div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-56 h-40 glass rounded-3xl p-6 hidden md:block cinematic-glow">
             <div className="text-xs font-bold uppercase text-white/40 mb-2">Member Growth</div>
             <div className="flex items-end gap-2">
               <div className="h-12 w-3 bg-white/20 rounded-full"></div>
               <div className="h-20 w-3 bg-white/40 rounded-full"></div>
               <div className="h-16 w-3 bg-white/20 rounded-full"></div>
               <div className="h-24 w-3 bg-white rounded-full"></div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
