import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage gym information and system configurations.</p>
          </div>
          <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
            <Save className="size-4" />
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle>Gym Information</CardTitle>
              <CardDescription>Update the primary contact details and location of the gym.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="gym-name">Gym Name</Label>
                <Input id="gym-name" defaultValue="Iron Admin Fitness" className="bg-white/5 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" defaultValue="hello@ironfitness.com" className="bg-white/5 border-white/10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input id="phone" type="tel" defaultValue="+63 912 345 6789" className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Fitness Ave, Metro City" className="bg-white/5 border-white/10" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle>Membership Pricing</CardTitle>
              <CardDescription>Configure standard fees and default contract durations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="one-time">One-time Membership Fee (₱)</Label>
                  <Input id="one-time" type="number" defaultValue="150" className="bg-white/5 border-white/10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="renewal">Monthly Renewal Fee (₱)</Label>
                  <Input id="renewal" type="number" defaultValue="1500" className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walkin">Walk-in Daily Rate (₱)</Label>
                <Input id="walkin" type="number" defaultValue="200" className="bg-white/5 border-white/10 max-w-[50%]" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Enable or disable specific modules within the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Walk-in Registration</h4>
                  <p className="text-sm text-muted-foreground">Allow cashiers to process walk-in customers.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">POS Module</h4>
                  <p className="text-sm text-muted-foreground">Enable the point of sale system for products.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Automated Renewal Reminders</h4>
                  <p className="text-sm text-muted-foreground">Automatically display members whose contracts expire in 3 days.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
