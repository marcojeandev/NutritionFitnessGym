import React from 'react';
import { CashierLayout } from '@/components/layout/CashierLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, ShieldCheck, KeyRound, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CashierProfile() {
  return (
    <CashierLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account details and security settings.</p>
          </div>
          <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
            <Save className="size-4" />
            Save Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Forms */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6 mb-2">
                  <Avatar className="size-24 border-2 border-primary/20 shadow-xl">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl">
                    Change Photo
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue="Alex" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue="Rivera" className="bg-white/5 border-white/10" />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="admin@irongym.com" className="bg-white/5 border-white/10" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+63 912 345 6789" className="bg-white/5 border-white/10 max-w-[50%]" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="size-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your password and security preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-pass">Current Password</Label>
                  <Input id="current-pass" type="password" placeholder="••••••••" className="bg-white/5 border-white/10 max-w-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-pass">New Password</Label>
                    <Input id="new-pass" type="password" placeholder="••••••••" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-pass">Confirm New Password</Label>
                    <Input id="confirm-pass" type="password" placeholder="••••••••" className="bg-white/5 border-white/10" />
                  </div>
                </div>
                <Button variant="secondary" className="rounded-xl mt-2 w-full sm:w-auto">Update Password</Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="glass border-white/5 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <ShieldCheck className="size-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Cashier</h3>
                    <p className="text-sm text-muted-foreground mt-1">You have access to process memberships, handle POS, and monitor attendance.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { action: 'Updated Settings', target: 'Membership Pricing', time: '10 mins ago' },
                    { action: 'Created Account', target: 'Staff Member (Sarah)', time: '2 hours ago' },
                    { action: 'Processed Sale', target: 'Whey Protein', time: '1 day ago' },
                    { action: 'Logged In', target: 'System', time: '1 day ago' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="size-2 rounded-full bg-primary mt-1.5" />
                        {i !== 3 && <div className="w-[1px] h-full bg-white/10 my-1" />}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.target}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CashierLayout>
  );
}
