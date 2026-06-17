import { useEffect, useRef } from 'react';
import { QrCode, Users, Dumbbell, Bell, BarChart3, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { gsap } from '@/lib/animations';

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

      cards.forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 90%", // Trigger each card individually
            toggleActions: "play none none none"
          },
          y: prefersReducedMotion ? 0 : 30,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const features = [
    {
      title: "Contactless QR Entry",
      desc: "Members check-in instantly via dynamic, secure QR passes generated on their dashboard.",
      icon: QrCode,
    },
    {
      title: "Streamlined POS",
      desc: "Cashiers can effortlessly register walk-ins, log daily visits, and record payments in seconds.",
      icon: Users,
    },
    {
      title: "Interactive Planner",
      desc: "A highly satisfying, interactive checklist for members to plan routines and cross off sets.",
      icon: Dumbbell,
    },
    {
      title: "Automated Memberships",
      desc: "Easily track active subscriptions, renewals, and expiration dates across your entire client base.",
      icon: Bell,
    },
    {
      title: "Real-time Analytics",
      desc: "High-level insights on daily revenue, attendance volume, and gym capacity for admins.",
      icon: BarChart3,
    },
    {
      title: "Comprehensive Logs",
      desc: "Auditable, tamper-proof tracking for every transaction, check-in, and profile update.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="features" ref={sectionRef} className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-20">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-4">Precision Tools</h2>
          <h3 className="text-3xl md:text-6xl font-black uppercase max-w-2xl text-balance">
            Everything you need for <span className="text-white/50">Elite Performance.</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="feature-card bg-white/[0.03] border-white/5 group hover:border-white/20 transition-all duration-500 overflow-hidden">
              <CardContent className="p-8">
                <div className="mb-8 md:mb-12 size-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                  <f.icon className="size-7 text-white" aria-hidden="true" />
                </div>
                <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">{f.title}</h4>
                <p className="text-white/50 leading-relaxed font-medium">
                  {f.desc}
                </p>
              </CardContent>
              <div className="h-1 w-0 bg-white group-hover:w-full transition-all duration-700"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
