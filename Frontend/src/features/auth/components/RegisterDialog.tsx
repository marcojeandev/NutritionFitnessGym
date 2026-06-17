import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, UserPlus, Phone } from 'lucide-react';

interface RegisterDialogProps {
  trigger: React.ReactNode;
}

export const RegisterDialog = ({ trigger }: RegisterDialogProps) => {
  const [phone, setPhone] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only numbers
    
    // Logic: Must start with 9, max 10 digits
    if (val.length > 0 && val[0] !== '9') return;
    if (val.length > 10) return;
    
    setPhone(val);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[500px] bg-background border-white/5 p-0 overflow-hidden rounded-3xl max-h-[95vh] flex flex-col">
        <div className="relative overflow-y-auto no-scrollbar flex-1">
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-white/5 to-transparent -z-10" />
          
          <div className="p-6 md:p-10">
            <DialogHeader className="mb-6 md:mb-8 space-y-2 md:space-y-3 text-left">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center mb-2">
                <UserPlus className="text-black size-5 md:size-6" />
              </div>
              <DialogTitle className="text-xl md:text-3xl font-black uppercase tracking-tight">Apply for Membership</DialogTitle>
              <DialogDescription className="text-white/40 font-medium text-xs md:text-sm">
                Complete your elite registration. Your application will be processed by our front-desk staff.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4 md:space-y-6" autoComplete="off">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-white/40 ml-1">First Name</Label>
                  <Input 
                    id="first-name" 
                    placeholder="John" 
                    autoComplete="off"
                    className="h-11 md:h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-colors autofill-dark" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-white/40 ml-1">Last Name</Label>
                  <Input 
                    id="last-name" 
                    placeholder="Doe" 
                    autoComplete="off"
                    className="h-11 md:h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-colors autofill-dark" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-white/40 ml-1">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  autoComplete="off"
                  className="h-11 md:h-12 bg-white/5 border-white/5 rounded-xl focus:border-white/20 transition-colors autofill-dark" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-white/40 ml-1">Phone Number</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40 flex items-center gap-2 border-r border-white/10 pr-3">
                    <span className="text-white/20">+63</span>
                  </div>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={phone}
                    onChange={handlePhoneChange}
                    autoComplete="off"
                    placeholder="9123456789" 
                    className="h-11 md:h-12 bg-white/5 border-white/5 rounded-xl pl-16 focus:border-white/20 transition-colors tracking-[0.2em] font-mono autofill-dark" 
                  />
                </div>
                <p className="text-[9px] md:text-[10px] text-white/20 font-bold uppercase tracking-wider ml-1">Enter 10 digits starting with 9</p>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox id="terms" className="mt-1 border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-[10px] md:text-xs text-white/40 font-medium leading-normal cursor-pointer select-none"
                  >
                    I agree to the <span className="text-white hover:underline">Membership Agreement</span> and consent to automated contract renewals.
                  </label>
                </div>
              </div>

              <Button type="submit" variant="premium" className="w-full h-12 md:h-14 rounded-2xl text-base md:text-lg font-black uppercase mt-4">
                Submit Application
              </Button>
            </form>

            <div className="mt-6 md:mt-8 flex items-center justify-center gap-2 text-[9px] md:text-[10px] uppercase tracking-widest font-black text-white/20">
              <ShieldCheck className="size-3" />
              Secure Staff-Verified Registration
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
