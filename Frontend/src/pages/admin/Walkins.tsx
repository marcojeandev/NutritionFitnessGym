import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walkinService } from '@/services/walkin.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';
import { 
  Footprints,
  Search, 
  UserPlus, 
  Banknote,
  Calendar,
  CheckCircle2,
  History,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


function LogVisitDialog({ profile, isMember = false }: { profile: any, isMember?: boolean }) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'waived'>('cash');
  const [refNum, setRefNum] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();

  const recordMutation = useMutation({
    mutationFn: (data: any) => walkinService.recordAttendance(data),
    onSuccess: () => {
      toast.success('Visit logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['walkin-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['walkin-profiles'] });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to log visit.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'gcash' && !refNum.trim()) {
      toast.error('Reference number is required for GCash');
      return;
    }
    recordMutation.mutate({
      walk_in_id: profile.id, // For UI only, members might not have walk_in_id
      fee_paid: paymentMethod === 'waived' ? 0 : 60,
      assisted_by: user?.id
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 hover:bg-orange-500/10 text-orange-500" title="Log New Visit">
          <History className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="matte-surface border-white/10 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Visit & Payment</DialogTitle>
          <DialogDescription>
            Record a new visit and process payment for <strong>{profile.name}</strong>.
          </DialogDescription>
        </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={`amount-${profile.id}`}>Amount</Label>
            <Input id={`amount-${profile.id}`} value={paymentMethod === 'waived' ? "₱0.00" : "₱60.00"} readOnly disabled className="bg-white/5 border-white/10 text-muted-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`method-${profile.id}`}>Payment Method</Label>
            <Select defaultValue="cash" onValueChange={(value) => setPaymentMethod(value as 'cash' | 'gcash' | 'waived')}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="matte-surface border-white/10">
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="waived">Free Pass / Waived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === 'gcash' ? (
            <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
              <Label htmlFor={`ref-num-${profile.id}`}>GCash Transaction ID <span className="text-destructive">*</span></Label>
              <Input id={`ref-num-${profile.id}`} value={refNum} onChange={e => setRefNum(e.target.value)} placeholder="e.g. 10002349012" className="bg-white/5 border-white/10 font-mono tracking-widest" required />
            </div>
          ) : paymentMethod === 'waived' ? (
            <div className="pt-2 animate-in fade-in slide-in-from-top-1">
              <p className="text-sm text-muted-foreground bg-white/5 p-3 rounded-md border border-white/10">
                This visit is completely free. No payment will be collected.
              </p>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pt-2 animate-in fade-in slide-in-from-top-1">
              <Checkbox id={`cash-received-${profile.id}`} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
              <label
                htmlFor={`cash-received-${profile.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
              >
                Did you receive the payment in cash?
              </label>
            </div>
          )}

        </form>
        <DialogFooter>
          <Button disabled={recordMutation.isPending} onClick={handleSubmit} type="submit" className="rounded-xl w-full bg-orange-500 hover:bg-orange-600 text-white">
            {recordMutation.isPending ? 'Processing...' : 'Complete Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminWalkins() {
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'waived'>('cash');
  const [selectedWalkin, setSelectedWalkin] = useState<string>('');
  const [accountCategory, setAccountCategory] = useState<'member' | 'walkin'>('member');
  const [refNum, setRefNum] = useState('');
  
  const [newFirstname, setNewFirstname] = useState('');
  const [newLastname, setNewLastname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const { data: profiles = [] } = useQuery({
    queryKey: ['walkin-profiles'],
    queryFn: walkinService.getWalkins
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['walkin-attendance'],
    queryFn: walkinService.getWalkinAttendance
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers
  });

  const members = users.filter((u: any) => u.role === 'member');

  const recordMutation = useMutation({
    mutationFn: (data: any) => walkinService.recordAttendance(data),
    onSuccess: () => {
      toast.success('Payment logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['walkin-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['walkin-profiles'] });
      setIsPaymentOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to log visit.');
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      // 1. Create Profile
      const formattedPhone = `+63${data.phone.replace(/\s+/g, '')}`;
      const profile = await walkinService.registerWalkin({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        contact: formattedPhone
      });
      return profile;
    },
    onSuccess: () => {
      toast.success('Walk-in profile created!');
      queryClient.invalidateQueries({ queryKey: ['walkin-profiles'] });
      setIsRegisterOpen(false);
      setNewFirstname('');
      setNewLastname('');
      setNewEmail('');
      setNewPhone('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to register walk-in.');
    }
  });

  const deleteWalkinMutation = useMutation({
    mutationFn: (id: number) => walkinService.deleteWalkin(id),
    onSuccess: () => {
      toast.success('Walk-in deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['walkin-profiles'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete walk-in.');
    }
  });

  const deleteAttendanceMutation = useMutation({
    mutationFn: (id: number) => walkinService.deleteWalkinAttendance(id),
    onSuccess: () => {
      toast.success('Attendance record deleted!');
      queryClient.invalidateQueries({ queryKey: ['walkin-attendance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete attendance.');
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      firstname: newFirstname,
      lastname: newLastname,
      email: newEmail,
      phone: newPhone
    });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalkin) {
      toast.error('Select a walk-in.');
      return;
    }
    if (paymentMethod === 'gcash' && !refNum.trim()) {
      toast.error('Reference number required.');
      return;
    }
    const [type, id] = selectedWalkin.split('_');
    const amountDue = accountCategory === 'member' ? 50 : 60;
    recordMutation.mutate({
      walk_in_id: Number(id),
      fee_paid: paymentMethod === 'waived' ? 0 : amountDue,
      assisted_by: user?.id
    });
  };

  const todayAttendance = attendance.filter((a: any) => {
    const d = new Date(a.created_at);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  
  const revenueToday = todayAttendance.reduce((sum: number, a: any) => sum + (Number(a.fee_paid) || 0), 0);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Walk-in Management</h1>
            <p className="text-muted-foreground mt-1">Register non-members and manage walk-in accounts.</p>
          </div>
          <div className="flex items-center gap-3">
            
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl gap-2">
                  <Banknote className="size-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              {/* Payment Modal Content */}
              <DialogContent className="matte-surface border-white/10 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Record Walk-in Payment</DialogTitle>
                  <DialogDescription>
                    Process payment for existing walk-in users.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRecordPayment} className="grid gap-4 py-4">
                  <div className="grid gap-2 mb-4">
                    <Label>Account Category</Label>
                    <Select value={accountCategory} onValueChange={(val: 'member' | 'walkin') => {
                      setAccountCategory(val);
                      setSelectedWalkin('');
                    }}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="matte-surface border-white/10">
                        <SelectItem value="member">Existing Member</SelectItem>
                        <SelectItem value="walkin">Walk-in Profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="walkin-name">Select Account</Label>
                    <Select value={selectedWalkin} onValueChange={setSelectedWalkin}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                      <SelectContent className="matte-surface border-white/10">
                        {accountCategory === 'member' && members.map((m: any) => (
                          <SelectItem key={`member_${m.id}`} value={`member_${m.id}`}>{m.firstname} {m.lastname}</SelectItem>
                        ))}
                        {accountCategory === 'walkin' && profiles.map((p: any) => (
                          <SelectItem key={`profile_${p.id}`} value={`profile_${p.id}`}>{p.firstname} {p.lastname}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" value={paymentMethod === 'waived' ? "₱0.00" : (accountCategory === 'member' ? "₱50.00" : "₱60.00")} readOnly className="bg-white/5 border-white/10 font-medium text-white" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select defaultValue="cash" onValueChange={(value) => setPaymentMethod(value as 'cash' | 'gcash' | 'waived')}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="matte-surface border-white/10">
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="gcash">GCash</SelectItem>
                        <SelectItem value="waived">Free Pass / Waived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === 'gcash' ? (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                      <Label htmlFor="ref-num">GCash Transaction ID <span className="text-destructive">*</span></Label>
                      <Input id="ref-num" value={refNum} onChange={e => setRefNum(e.target.value)} placeholder="e.g. 10002349012" className="bg-white/5 border-white/10 font-mono tracking-widest" required />
                    </div>
                  ) : paymentMethod === 'waived' ? (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                      <p className="text-sm text-muted-foreground bg-white/5 p-3 rounded-md border border-white/10">
                        This visit is completely free. No payment will be collected.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 pt-2 animate-in fade-in slide-in-from-top-1">
                      <Checkbox id="cash-received" className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                      <label
                        htmlFor="cash-received"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
                      >
                        Did you receive the payment in cash?
                      </label>
                    </div>
                  )}
                </form>
                <DialogFooter>
                  <Button disabled={recordMutation.isPending} onClick={handleRecordPayment} type="submit" className="rounded-xl w-full">
                    {recordMutation.isPending ? 'Processing...' : 'Complete Payment'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>



            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20 bg-orange-500 hover:bg-orange-600 text-white">
                  <UserPlus className="size-4" />
                  Register Walk-in
                </Button>
              </DialogTrigger>
              <DialogContent className="matte-surface border-white/10 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Register New Walk-in Profile</DialogTitle>
                  <DialogDescription>
                    Create a new walk-in account to log their future visits.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegister} className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first-name">First Name <span className="text-destructive">*</span></Label>
                      <Input id="first-name" value={newFirstname} onChange={e => setNewFirstname(e.target.value)} placeholder="John" className="bg-white/5 border-white/10" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-name">Last Name <span className="text-destructive">*</span></Label>
                      <Input id="last-name" value={newLastname} onChange={e => setNewLastname(e.target.value)} placeholder="Doe" className="bg-white/5 border-white/10" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-email">Email Address <span className="text-destructive">*</span></Label>
                    <Input id="new-email" value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" placeholder="john@example.com" className="bg-white/5 border-white/10" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-phone">Phone Number <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40 flex items-center gap-2 border-r border-white/10 pr-2">
                        <span className="text-white/30 text-xs">+63</span>
                      </div>
                      <Input
                        id="new-phone"
                        type="tel"
                        maxLength={10}
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                        placeholder="912 345 6789"
                        className="h-10 bg-white/5 border-white/10 rounded-md pl-14 focus:border-white/20 transition-colors tracking-[0.1em] font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Sex</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSex('male')}
                        className={`h-10 rounded-md border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                          sex === 'male' 
                          ? 'bg-white text-black border-white' 
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setSex('female')}
                        className={`h-10 rounded-md border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                          sex === 'female' 
                          ? 'bg-white text-black border-white' 
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                </form>
                <DialogFooter>
                  <Button disabled={registerMutation.isPending} onClick={handleRegister} type="submit" className="rounded-xl w-full bg-orange-500 hover:bg-orange-600 text-white">
                    {registerMutation.isPending ? 'Processing...' : 'Create Profile'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <Footprints className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Walk-ins Today</p>
                <h3 className="text-2xl font-bold">{todayAttendance.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Banknote className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Walk-in Revenue</p>
                <h3 className="text-2xl font-bold">₱{revenueToday.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <Calendar className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Average</p>
                <h3 className="text-2xl font-bold">145</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6 bg-white/5 border border-white/10 rounded-xl p-1">
            <TabsTrigger value="members" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all">
              Members (Existing)
            </TabsTrigger>
            <TabsTrigger value="non_members" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all">
              Non-Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-0 outline-none">
            <Card className="glass border-white/5">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-0">
                <CardTitle>Existing Members</CardTitle>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input placeholder="Search members..." className="pl-10 bg-white/5 border-white/10 rounded-xl h-10" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Name</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Date Joined</TableHead>
                        <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member: any) => (
                        <TableRow key={member.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 border border-white/10">
                                <AvatarFallback className="bg-white/5 text-xs">{(member.firstname || 'U').charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{member.firstname} {member.lastname}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "h-6 text-[10px]",
                              member.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {member.status === 'active' ? 'Active' : 'Expired/Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(member.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <LogVisitDialog profile={member} isMember={true} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="non_members" className="mt-0 outline-none">
            <Card className="glass border-white/5">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-0">
                <CardTitle>Walk-in Profiles</CardTitle>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input placeholder="Search accounts..." className="pl-10 bg-white/5 border-white/10 rounded-xl h-10" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Name</TableHead>
                        <TableHead className="text-muted-foreground">Contact Info</TableHead>
                        <TableHead className="text-muted-foreground">Total Visits</TableHead>
                        <TableHead className="text-muted-foreground">Date Registered</TableHead>
                        <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile: any) => (
                        <TableRow key={profile.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 border border-white/10">
                                <AvatarFallback className="bg-white/5 text-xs text-orange-500">{(profile.firstname || 'U').charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{profile.firstname} {profile.lastname}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{profile.contact}</span>
                              <span className="text-xs text-muted-foreground">{profile.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="h-6 text-[10px] bg-white/5 text-muted-foreground border-white/10">
                              -
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <LogVisitDialog profile={profile} />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this walk-in profile?')) {
                                    deleteWalkinMutation.mutate(profile.id);
                                  }
                                }}
                                disabled={deleteWalkinMutation.isPending}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </AdminLayout>
  );
}
