import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, ShieldCheck, KeyRound, Clock } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/user.service';

export default function AdminProfile() {
  const { user, setAuth, token } = useAuthStore();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstname: '',
    lastname: '',
    email: '',
    contact: ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        contact: user.contact || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      setIsUpdatingProfile(true);
      const updatedUser = await userService.updateUser(user.id, formData);
      if (token) {
        setAuth(updatedUser, token);
      }
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await authService.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account details and security settings.</p>
          </div>
          <Button 
            className="rounded-xl gap-2 shadow-lg shadow-primary/20"
            onClick={handleUpdateProfile}
            disabled={isUpdatingProfile}
          >
            <Save className="size-4" />
            {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
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
                    <AvatarImage src={user?.profile ? `http://127.0.0.1:8000/storage/${user.profile}` : "https://github.com/shadcn.png"} />
                    <AvatarFallback>{user?.firstname?.[0] || 'A'}{user?.lastname?.[0] || 'D'}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl disabled:opacity-50">
                    Change Photo
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} className="bg-white/5 border-white/10" />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="bg-white/5 border-white/10 max-w-[50%]" />
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
                  <Input id="current-pass" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 max-w-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-pass">New Password</Label>
                    <Input id="new-pass" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-pass">Confirm New Password</Label>
                    <Input id="confirm-pass" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10" />
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="rounded-xl mt-2 w-full sm:w-auto"
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
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
                    <h3 className="font-bold text-lg capitalize">{user?.role}</h3>
                    <p className="text-sm text-muted-foreground mt-1">You have full access to all system modules and configuration settings.</p>
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
    </AdminLayout>
  );
}
