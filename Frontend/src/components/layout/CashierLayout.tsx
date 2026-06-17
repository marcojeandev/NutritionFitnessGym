import React from 'react';
import { CashierSidebar } from './CashierSidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface CashierLayoutProps {
  children: React.ReactNode;
}

export function CashierLayout({ children }: CashierLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <CashierSidebar className="hidden lg:flex" />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 matte-surface flex items-center justify-between px-4 md:px-8 z-10 gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r border-white/10 bg-transparent">
                <SheetHeader className="sr-only">
                  <SheetTitle>Cashier Navigation</SheetTitle>
                  <SheetDescription>Access cashier sections of the gym management system.</SheetDescription>
                </SheetHeader>
                <CashierSidebar className="w-full border-r-0" />
              </SheetContent>
            </Sheet>

            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-white transition-colors" />
              <Input 
                placeholder="Search members, transactions..." 
                className="pl-10 bg-white/5 border-white/10 focus:border-white/20 transition-all rounded-xl h-10 w-full text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group">
              <Bell className="size-5 text-muted-foreground group-hover:text-white transition-colors" />
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-background" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto slim-scrollbar p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
