import { MapPin } from 'lucide-react';

const Location = () => {
  const address = "GVS-002 /B, Green Valley Subd, Pasay Rd, San Roque (Behind Yuscom Contractors warehouse), Zamboanga City, Philippines, 7000";
  const mapQuery = "NFH Gym, San Roque, Zamboanga City, Philippines";

  return (
    <section id="location" className="py-24 md:py-32 px-6 bg-black relative">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-4">Location</h2>
        <h3 className="text-4xl md:text-6xl font-black uppercase mb-6 text-balance">
          Find <span className="text-gradient">NFH.</span>
        </h3>
        <p className="text-white/50 max-w-2xl mx-auto text-base md:text-lg font-medium px-4 flex flex-col md:flex-row items-center justify-center gap-2">
          <MapPin className="size-5 text-primary flex-shrink-0" />
          <span>{address}</span>
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="relative group rounded-3xl overflow-hidden glass border border-white/10 aspect-video md:aspect-[21/9]">
          {/* Animated Background Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-[40px] blur-xl opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          
          <iframe
            title="NFH Gym Location"
            className="relative w-full h-full z-10 rounded-3xl"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=near&output=embed`}
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Location;
