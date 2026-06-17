import React from 'react';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { User, Lock, Mail, Phone, MapPin, ShieldAlert, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';

export default function MemberProfile() {
  const { user } = useAuthStore();
  
  return (
    <MemberLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information and security.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Info Card */}
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="size-5 text-primary" /> Personal Information
                </CardTitle>
                <CardDescription>Update your basic profile details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user?.firstname || ''} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user?.lastname || ''} className="bg-white/5 border-white/10" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="size-3" /> Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ''} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="size-3" /> Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue={user?.contact || ''} className="bg-white/5 border-white/10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="size-3" /> Address</Label>
                  <Input id="address" defaultValue={user?.address || ''} className="bg-white/5 border-white/10" />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldAlert className="size-5 text-orange-500" /> Emergency Contact
                </CardTitle>
                <CardDescription>Who should we call in an emergency?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ecName">Contact Name</Label>
                    <Input id="ecName" defaultValue="Sarah Mercer" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ecPhone">Contact Phone</Label>
                    <Input id="ecPhone" type="tel" defaultValue="0998 765 4321" className="bg-white/5 border-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ecRelation">Relationship</Label>
                  <Input id="ecRelation" defaultValue="Spouse" className="bg-white/5 border-white/10" />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Security Column */}
          <div className="space-y-6">
            
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lock className="size-5 text-blue-500" /> Security
                </CardTitle>
                <CardDescription>Update your password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="••••••••" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="••••••••" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" className="bg-white/5 border-white/10" />
                </div>
                <Button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white">Update Password</Button>
              </CardContent>
            </Card>

          </div>

        </div>

      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-white/5 z-20 flex justify-end gap-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        <Button variant="ghost" className="hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl">
          Discard Changes
        </Button>
        <Button className="rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-8">
          <Save className="size-4" />
          Save Profile
        </Button>
      </div>

    </MemberLayout>
  );
}
