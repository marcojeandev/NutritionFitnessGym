import React from 'react';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CreditCard,
  Dumbbell,
  ClipboardCheck, 
  Wallet,
  UserCircle,
  LogOut,
  ChevronLeft,
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogoutModal } from '@/components/shared/LogoutModal';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/member' },
  { icon: CreditCard, label: 'Contracts', path: '/member/membership' },
  { icon: Dumbbell, label: 'Workout Planner', path: '/member/planner' },
  { icon: ClipboardCheck, label: 'Attendance', path: '/member/attendance' },
  { icon: Wallet, label: 'Payments', path: '/member/payments' },
];

export function MemberSidebar({ className }: { className?: string }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('member_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => {
    setCollapsed((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('member_sidebar_collapsed', JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen shrink-0 z-20 transition-all duration-300 ease-in-out border-r border-white/5 matte-surface",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-5 h-16">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg flex items-center justify-center">
              <img src="/logo_gym.png" alt="Gym Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gradient">NFH MEMBER</span>
          </div>
        )}
        {collapsed && (
          <div className="size-8 rounded-lg mx-auto flex items-center justify-center">
            <img src="/logo_gym.png" alt="Gym Logo" className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3.5 top-16 size-7 rounded-full border border-white/10 bg-[#1a1a1a] text-white hover:bg-[#252525] hover:scale-110 transition-all z-30 shadow-xl hidden lg:flex"
        onClick={toggleSidebar}
      >
        <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
      </Button>

      <Separator className="bg-white/5 mx-4 w-auto" />

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto slim-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/member' && location.pathname.startsWith(`${item.path}/`));
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "size-5 transition-colors",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-white"
                )} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
                
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-primary rounded-full" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 space-y-2">
        <Separator className="bg-white/5" />
        <Link to="/member/profile">
          <div className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-white/5 hover:text-white",
            location.pathname === '/member/profile' && "bg-white/10 text-white"
          )}>
            <UserCircle className="size-5" />
            {!collapsed && <span className="font-medium">My Profile</span>}
          </div>
        </Link>
        <LogoutModal>
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-start gap-3 px-3 py-5 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-5" />
            {!collapsed && <span className="font-medium">Sign Out</span>}
          </Button>
        </LogoutModal>
      </div>
    </div>
  );
}
