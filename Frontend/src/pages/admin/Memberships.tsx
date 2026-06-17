import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { contractService } from '@/services/contract.service';
import { trainerService } from '@/services/trainer.service';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';
import { 
  CreditCard,
  Search, 
  Plus, 
  RefreshCw,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  History,
  QrCode,
  User,
  Ban,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



export default function AdminMemberships() {
  const [filter, setFilter] = useState('all');
  const [regPaymentMode, setRegPaymentMode] = useState('cash');
  const [regTransactionId, setRegTransactionId] = useState('');
  const [renewPaymentMode, setRenewPaymentMode] = useState('cash');
  const [renewTransactionId, setRenewTransactionId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.getAllUsers({ role: 'member' })
  });

  const { data: contracts = [], isLoading: isLoadingContracts } = useQuery({
    queryKey: ['admin-contracts'],
    queryFn: () => contractService.getAllContracts()
  });

  const { data: trainers = [] } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: () => trainerService.getAllTrainers()
  });

  const pendingUsers = users.filter((u: any) => u.status === 'pending');
  const activeUsers = users.filter((u: any) => u.status === 'active');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayString = now.toDateString();

  const renewalsThisMonth = contracts.filter((c: any) => {
    if (!c.created_at) return false;
    const d = new Date(c.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const newMembersToday = users.filter((u: any) => {
    if (!u.created_at) return false;
    return new Date(u.created_at).toDateString() === todayString;
  }).length;

  const approveMutation = useMutation({
    mutationFn: (data: { id: number, paymentDetails?: any }) => userService.approveUser(data.id, data.paymentDetails),
    onSuccess: () => {
      toast.success('Member successfully registered and approved!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUserId('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to register member.');
    }
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user to register.');
      return;
    }
    if (regPaymentMode === 'gcash' && !regTransactionId.trim()) {
      toast.error('GCash Transaction ID is required.');
      return;
    }
    approveMutation.mutate({
      id: Number(selectedUserId),
      paymentDetails: {
        payment_type: regPaymentMode,
        transaction_id: regPaymentMode === 'gcash' ? regTransactionId : null,
        or_number: `OR-${Date.now()}`,
        payment_amount: 150
      }
    });
  };

  const renewMutation = useMutation({
    mutationFn: (data: any) => contractService.createContract(data),
    onSuccess: () => {
      toast.success('Contract processed successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process contract.');
    }
  });

  const terminateMutation = useMutation({
    mutationFn: (id: number) => contractService.deleteContract(id),
    onSuccess: () => {
      toast.success('Contract terminated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
    },
    onError: (error: any) => {
      toast.error('Failed to terminate contract.');
    }
  });

  const [renewUserId, setRenewUserId] = useState<string>('');
  const [renewPlan, setRenewPlan] = useState<string>('regular_1_month');
  const [hasTrainer, setHasTrainer] = useState<boolean>(false);
  const [trainerPlan, setTrainerPlan] = useState<string>('trainer_15_days');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [openRenewDialogId, setOpenRenewDialogId] = useState<number | null>(null);

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewUserId) {
      toast.error('Please select a member.');
      return;
    }
    
    // Determine amount based on plan
    let amount = 550;
    let months = 1;
    let days = 0;
    
    if (renewPlan === 'student_1_month') {
      amount = 480;
    }

    if (hasTrainer) {
      if (trainerPlan === 'trainer_15_days') {
        amount += 850;
      } else if (trainerPlan === 'trainer_1_month') {
        amount += 1500;
      }
    }

    const startDate = new Date();
    const endDate = new Date();
    if (months > 0) {
      endDate.setMonth(endDate.getMonth() + months);
    } else if (days > 0) {
      endDate.setDate(endDate.getDate() + days);
    }

    renewMutation.mutate({
      user_id: Number(renewUserId),
      contract_type: renewPlan,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      payment_type: renewPaymentMode,
      or_number: `OR-${Date.now()}`,
      transaction_id: renewPaymentMode === 'gcash' ? renewTransactionId : null,
      contract_amount: amount,
      payment_amount: amount,
      trainer_id: hasTrainer && selectedTrainer ? Number(selectedTrainer) : null,
      trainer_package: hasTrainer ? trainerPlan : null,
    });
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesFilter = filter === 'all' || (filter === 'active' && u.status === 'active') || (filter === 'pending' && u.status === 'pending');
    const matchesSearch = 
      !searchQuery || 
      `${u.firstname} ${u.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if contract OR number or membership fee OR number matches
    const contract = contracts.find((c: any) => c.user?.id === u.id || c.user_id === u.id || c.member === `${u.firstname} ${u.lastname}`.trim());
    const orMatch = contract?.payment?.or_number?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    u.membership_fee?.or_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = contract?.id?.toString().includes(searchQuery);

    return matchesFilter && (matchesSearch || orMatch || idMatch);
  });

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Contracts & Members</h1>
            <p className="text-muted-foreground mt-1">Manage gym registrations and active contracts.</p>
          </div>
          <div className="flex items-center gap-3">
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl gap-2">
                  <RefreshCw className="size-4" />
                  Renew Contract
                </Button>
              </DialogTrigger>
              <DialogContent className="matte-surface border-white/10 sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Renew Contract</DialogTitle>
                  <DialogDescription>
                    Select an existing member and renew their gym access.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRenewSubmit} className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="member">Select Member</Label>
                      <Select value={renewUserId} onValueChange={setRenewUserId}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Search member..." />
                        </SelectTrigger>
                        <SelectContent className="matte-surface border-white/10">
                          {activeUsers.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.firstname} {user.lastname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="plan">New Contract Plan</Label>
                      <Select value={renewPlan} onValueChange={setRenewPlan}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select contract duration" />
                        </SelectTrigger>
                        <SelectContent className="matte-surface border-white/10">
                          <SelectItem value="regular_1_month">Regular Member (₱550/mo)</SelectItem>
                          <SelectItem value="student_1_month">Student Member (₱480/mo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div 
                    className={cn(
                      "flex flex-col gap-3 p-4 rounded-xl border transition-colors duration-200",
                      hasTrainer 
                        ? "border-emerald-500/50 bg-emerald-500/5" 
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <label 
                      htmlFor="has-trainer" 
                      className="flex items-center space-x-3 cursor-pointer select-none"
                    >
                      <Checkbox 
                        id="has-trainer" 
                        checked={hasTrainer} 
                        onCheckedChange={(checked) => setHasTrainer(checked as boolean)}
                        className={cn(
                          "border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black data-[state=checked]:border-emerald-500"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-none">Add Trainer Package</span>
                        <span className="text-xs text-muted-foreground mt-1">Get personalized 1-on-1 coaching</span>
                      </div>
                    </label>
                    
                    {hasTrainer && (
                      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 pt-3 border-t border-emerald-500/20 mt-1">
                        <div className="grid gap-2">
                          <Label htmlFor="trainerPlan" className="text-xs text-emerald-500/80 font-medium">Select Trainer Package</Label>
                          <Select value={trainerPlan} onValueChange={setTrainerPlan}>
                            <SelectTrigger className="bg-black/20 border-emerald-500/30 h-10 hover:border-emerald-500/50 focus:ring-emerald-500/50">
                              <SelectValue placeholder="Select trainer package" />
                            </SelectTrigger>
                            <SelectContent className="matte-surface border-emerald-500/20">
                              <SelectItem value="trainer_15_days" className="focus:bg-emerald-500/10 focus:text-emerald-500">15 Days Package (₱850)</SelectItem>
                              <SelectItem value="trainer_1_month" className="focus:bg-emerald-500/10 focus:text-emerald-500">1 Month Package (₱1,500)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="trainerId" className="text-xs text-emerald-500/80 font-medium">Select Assigned Trainer</Label>
                          <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                            <SelectTrigger className="bg-black/20 border-emerald-500/30 h-10 hover:border-emerald-500/50 focus:ring-emerald-500/50">
                              <SelectValue placeholder="Select trainer" />
                            </SelectTrigger>
                            <SelectContent className="matte-surface border-emerald-500/20">
                              {trainers.map((t: any) => (
                                <SelectItem key={t.id} value={t.id.toString()} className="focus:bg-emerald-500/10 focus:text-emerald-500">
                                  {t.firstname} {t.lastname}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>



                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select defaultValue="cash" onValueChange={setRenewPaymentMode}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="matte-surface border-white/10">
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="gcash">GCash (Face-to-Face)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {renewPaymentMode === 'gcash' ? (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 mt-2">
                      <Label htmlFor="renew-ref">GCash Transaction ID <span className="text-destructive">*</span></Label>
                      <Input id="renew-ref" placeholder="e.g. 10023456789" value={renewTransactionId} onChange={(e) => setRenewTransactionId(e.target.value)} className="bg-white/5 border-white/10 font-mono tracking-widest" required />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-1 mt-2">
                      <Checkbox id="renew-cash-confirm" className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black data-[state=checked]:border-emerald-500" required />
                      <Label htmlFor="renew-cash-confirm" className="text-xs font-medium leading-tight cursor-pointer">
                        Did you receive the exact payment in cash?
                      </Label>
                    </div>
                  )}

                  {/* Total Amount Display */}
                  <div className="flex items-center justify-between p-4 mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-semibold text-emerald-500/80">Total Amount to Pay:</span>
                    <span className="text-xl font-bold text-emerald-400">
                      ₱{(renewPlan === 'student_1_month' ? 480 : 550) + (hasTrainer ? (trainerPlan === 'trainer_15_days' ? 850 : 1500) : 0)}
                    </span>
                  </div>

                <DialogFooter>
                  <Button type="submit" disabled={renewMutation.isPending} className="rounded-xl w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                    {renewMutation.isPending ? 'Processing...' : 'Process Renewal'}
                  </Button>
                </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                  <Plus className="size-4" />
                  Register New Member
                </Button>
              </DialogTrigger>
              <DialogContent className="matte-surface border-white/10 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Register New Member</DialogTitle>
                  <DialogDescription>
                    Create account and charge the 1-time membership registration fee.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegisterSubmit} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="registered-user">Select Pre-Registered User</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Search pending user..."} />
                      </SelectTrigger>
                      <SelectContent className="matte-surface border-white/10">
                        {pendingUsers.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">No pending users found</div>
                        ) : (
                          pendingUsers.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.firstname} {user.lastname} ({user.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Users must register an account first before paying.</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-500" />
                        <span className="text-sm font-medium">One-Time Membership Fee</span>
                      </div>
                      <span className="font-bold">₱150</span>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label>Payment Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegPaymentMode('cash')}
                        className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                          regPaymentMode === 'cash' 
                          ? 'bg-white text-black border-white' 
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                        }`}
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegPaymentMode('gcash')}
                        className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                          regPaymentMode === 'gcash' 
                          ? 'bg-[#007DFE] text-white border-[#007DFE]' 
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                        }`}
                      >
                        GCash
                      </button>
                    </div>
                  </div>

                  {regPaymentMode === 'gcash' ? (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 mt-2">
                      <Label htmlFor="ref-new">GCash Transaction ID <span className="text-destructive">*</span></Label>
                      <Input id="ref-new" placeholder="e.g. 10023456789" value={regTransactionId} onChange={(e) => setRegTransactionId(e.target.value)} className="bg-white/5 border-white/10" required />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-2 mt-2">
                      <Checkbox id="cash-confirm" className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                      <Label htmlFor="cash-confirm" className="text-xs font-medium leading-tight cursor-pointer">
                        Did you receive the exact payment in cash?
                      </Label>
                    </div>
                  )}

                </form>
                <DialogFooter>
                  <Button disabled={approveMutation.isPending} type="submit" onClick={handleRegisterSubmit} className="rounded-xl w-full">
                    {approveMutation.isPending ? 'Processing...' : 'Complete Registration'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <h3 className="text-2xl font-bold">{contracts.filter((c: any) => c.status === 'active').length || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                <XCircle className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired Contracts</p>
                <h3 className="text-2xl font-bold">{contracts.filter((c: any) => c.status === 'expired').length || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <History className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renewals This Month</p>
                <h3 className="text-2xl font-bold">{renewalsThisMonth}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                <User className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Members Today</p>
                <h3 className="text-2xl font-bold">{newMembersToday}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-white/5">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-0">
            <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg px-6">All Members</TabsTrigger>
                <TabsTrigger value="active" className="rounded-lg px-6">Active</TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg px-6">Pending</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search member, OR Number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white/5 border-white/10 rounded-xl h-10" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Member</TableHead>
                    <TableHead className="text-muted-foreground">Contract / OR Number</TableHead>
                    <TableHead className="text-muted-foreground">Contract Type</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Expiry Date</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading members...</TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No members found</TableCell>
                    </TableRow>
                  ) : filteredUsers.map((user: any) => {
                    const record = user;
                    const userFullName = `${record.firstname} ${record.lastname}`.trim();
                    const contract = contracts.find((c: any) => c.user?.id === user.id || c.user_id === user.id || c.member === userFullName);
                    
                    let contractTypeDisplay = 'N/A';
                    if (contract?.start_date && contract?.end_date) {
                      const start = new Date(contract.start_date);
                      const end = new Date(contract.end_date);
                      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                      if (diffMonths === 1) contractTypeDisplay = '1 Month';
                      else if (diffMonths === 3) contractTypeDisplay = '3 Months';
                      else if (diffMonths === 6) contractTypeDisplay = '6 Months';
                      else if (diffMonths === 12) contractTypeDisplay = '1 Year';
                      else contractTypeDisplay = `${diffMonths} Months`;
                    }
                    
                    return (
                    <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border border-white/10">
                            {record.profile ? (
                              <img 
                                src={(() => {
                                  let url = record.profile;
                                  if (url.includes('localhost')) url = url.replace('localhost', '127.0.0.1:8000');
                                  if (!url.startsWith('http')) url = `http://127.0.0.1:8000/storage/${url}`;
                                  if (url.includes('http://127.0.0.1:8000/storage/http')) url = url.replace('http://127.0.0.1:8000/storage/http', 'http');
                                  return url;
                                })()} 
                                alt={record.full_name || record.firstname} 
                                className="object-cover w-full h-full" 
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.full_name || record.firstname || 'U')}&background=random`;
                                }}
                              />
                            ) : (
                              <AvatarFallback className="bg-white/5 text-xs">{(record.firstname || record.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                            )}
                          </Avatar>
                          <span className="font-medium">{record.full_name || `${record.firstname} ${record.lastname}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {contract?.payment?.or_number ? (
                            <span className="font-mono text-sm text-white">
                              {contract.payment.or_number}
                            </span>
                          ) : record.membership_fee?.or_number ? (
                            <span className="font-mono text-sm text-white">
                              Reg Fee: {record.membership_fee.or_number}
                            </span>
                          ) : (
                            <span className="font-mono text-sm text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground capitalize">{contractTypeDisplay}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "h-6 text-[10px] uppercase",
                          record.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                          record.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                          "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                        "text-sm font-medium",
                        contract?.status === 'expired' ? "text-red-400" : "text-muted-foreground"
                      )}>{contract?.end_date ? new Date(contract.end_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 hover:bg-white/10">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="matte-surface border-white/10 w-48">
                            <DropdownMenuLabel>Contract Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2">
                                  <User className="size-4" /> View Profile
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0a0a0a]">
                                <DialogHeader>
                                  <DialogTitle>Member Profile</DialogTitle>
                                  <DialogDescription>Read-only view of {record.full_name || record.firstname}'s details.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="size-16 border border-white/10">
                                      {record.profile ? (
                                        <img 
                                          src={(() => {
                                            let url = record.profile;
                                            if (url.includes('localhost')) url = url.replace('localhost', '127.0.0.1:8000');
                                            if (!url.startsWith('http')) url = `http://127.0.0.1:8000/storage/${url}`;
                                            if (url.includes('http://127.0.0.1:8000/storage/http')) url = url.replace('http://127.0.0.1:8000/storage/http', 'http');
                                            return url;
                                          })()} 
                                          alt={record.full_name} 
                                          className="object-cover w-full h-full" 
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.full_name || 'U')}&background=random`;
                                          }}
                                        />
                                      ) : (
                                        <AvatarFallback className="bg-white/5 text-xl">{(record.firstname || record.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-bold text-white">{record.full_name || `${record.firstname} ${record.lastname}`}</h3>
                                      <p className="text-sm text-muted-foreground">USR-{record.id.toString().padStart(4, '0')}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                      <p className="text-xs text-muted-foreground">Contract Type</p>
                                      <p className="font-medium text-white capitalize">{contract?.contract_type || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                      <p className="text-xs text-muted-foreground">Status</p>
                                      <p className={cn("font-medium uppercase", record.status === 'active' ? "text-emerald-500" : "text-amber-500")}>{record.status}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 col-span-2">
                                      <p className="text-xs text-muted-foreground">Joined Date</p>
                                      <p className="font-medium text-white">{record.joined || 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {record.status === 'pending' ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2 text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10">
                                    <ShieldCheck className="size-4" /> Register Member
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="matte-surface border-white/10 sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Register Member</DialogTitle>
                                    <DialogDescription>
                                      Create account and charge the 1-time membership registration fee for {record.full_name || record.firstname}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    
                                    const txInput = document.getElementById(`ref-row-${record.id}`) as HTMLInputElement;
                                    
                                    const txId = txInput ? txInput.value : undefined;

                                    if (regPaymentMode === 'gcash' && !txId?.trim()) {
                                      toast.error('GCash Transaction ID is required.');
                                      return;
                                    }
                                    approveMutation.mutate({
                                      id: record.id,
                                      paymentDetails: {
                                        payment_type: regPaymentMode,
                                        transaction_id: regPaymentMode === 'gcash' ? txId : null,
                                        or_number: `OR-${Date.now()}`,
                                        payment_amount: 150
                                      }
                                    });
                                  }} className="grid gap-4 py-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <ShieldCheck className="size-4 text-emerald-500" />
                                          <span className="text-sm font-medium">One-Time Membership Fee</span>
                                        </div>
                                        <span className="font-bold">₱150</span>
                                      </div>
                                    </div>

                                    <div className="grid gap-3 mt-2">
                                      <Label>Payment Mode</Label>
                                      <div className="grid grid-cols-2 gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setRegPaymentMode('cash')}
                                          className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                                            regPaymentMode === 'cash' 
                                            ? 'bg-white text-black border-white' 
                                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                          }`}
                                        >
                                          Cash
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setRegPaymentMode('gcash')}
                                          className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                                            regPaymentMode === 'gcash' 
                                            ? 'bg-[#007DFE] text-white border-[#007DFE]' 
                                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                          }`}
                                        >
                                          GCash
                                        </button>
                                      </div>
                                    </div>

                                    {regPaymentMode === 'gcash' ? (
                                      <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 mt-2">
                                        <Label htmlFor={`ref-row-${record.id}`}>GCash Transaction ID <span className="text-destructive">*</span></Label>
                                        <Input id={`ref-row-${record.id}`} placeholder="e.g. 10023456789" className="bg-white/5 border-white/10" required />
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-2 mt-2">
                                        <Checkbox id={`cash-confirm-${record.id}`} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" required />
                                        <Label htmlFor={`cash-confirm-${record.id}`} className="text-xs font-medium leading-tight cursor-pointer">
                                          Did you receive the exact payment in cash?
                                        </Label>
                                      </div>
                                    )}

                                    <DialogFooter className="mt-4">
                                      <Button type="submit" className="rounded-xl w-full" disabled={approveMutation.isPending}>
                                        {approveMutation.isPending ? 'Processing...' : 'Complete Registration'}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <>
                                <Dialog open={openRenewDialogId === record.id} onOpenChange={(isOpen) => setOpenRenewDialogId(isOpen ? record.id : null)}>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2">
                                  <RefreshCw className="size-4" /> Renew Contract
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="matte-surface border-white/10 sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Renew Contract</DialogTitle>
                                  <DialogDescription>
                                    Renew {record.full_name || record.firstname}'s gym access.
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  let amount = 550;
                                  let months = 1;
                                  let days = 0;
                                  
                                  if (renewPlan === 'student_1_month') {
                                    amount = 480;
                                  }
                                  
                                  if (hasTrainer) {
                                    if (trainerPlan === 'trainer_15_days') {
                                      amount += 850;
                                    } else if (trainerPlan === 'trainer_1_month') {
                                      amount += 1500;
                                    }
                                  }
                                  
                                  const txInput = document.getElementById(`renew-tx-${record.id}`) as HTMLInputElement;

                                  const txId = txInput ? txInput.value : undefined;

                                  if (renewPaymentMode === 'gcash' && !txId?.trim()) {
                                    toast.error('GCash Transaction ID is required.');
                                    return;
                                  }

                                  const startDate = new Date();
                                  const endDate = new Date();
                                  if (months > 0) {
                                    endDate.setMonth(endDate.getMonth() + months);
                                  } else if (days > 0) {
                                    endDate.setDate(endDate.getDate() + days);
                                  }

                                  renewMutation.mutate({
                                    user_id: record.id,
                                    contract_type: renewPlan,
                                    start_date: startDate.toISOString().split('T')[0],
                                    end_date: endDate.toISOString().split('T')[0],
                                    payment_type: renewPaymentMode,
                                    or_number: `OR-${Date.now()}`,
                                    transaction_id: renewPaymentMode === 'gcash' ? txId : undefined,
                                    contract_amount: amount,
                                    payment_amount: amount,
                                    trainer_id: hasTrainer && selectedTrainer ? Number(selectedTrainer) : null,
                                    trainer_package: hasTrainer ? trainerPlan : null,
                                  }, {
                                    onSuccess: () => {
                                      setOpenRenewDialogId(null);
                                    }
                                  });
                                }}>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <Label>Member</Label>
                                        <Input value={record.full_name || record.firstname} disabled className="bg-white/5 border-white/10 text-muted-foreground" />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor={`plan-${record.id}`}>New Contract Plan</Label>
                                        <Select value={renewPlan} onValueChange={setRenewPlan}>
                                          <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select contract duration" />
                                          </SelectTrigger>
                                          <SelectContent className="matte-surface border-white/10">
                                            <SelectItem value="regular_1_month">Regular Member (₱550/mo)</SelectItem>
                                            <SelectItem value="student_1_month">Student Member (₱480/mo)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div 
                                      className={cn(
                                        "flex flex-col gap-3 p-4 rounded-xl border transition-colors duration-200",
                                        hasTrainer 
                                          ? "border-emerald-500/50 bg-emerald-500/5" 
                                          : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                      )}
                                    >
                                      <label 
                                        htmlFor={`has-trainer-${record.id}`} 
                                        className="flex items-center space-x-3 cursor-pointer select-none"
                                      >
                                        <Checkbox 
                                          id={`has-trainer-${record.id}`} 
                                          checked={hasTrainer} 
                                          onCheckedChange={(checked) => setHasTrainer(checked as boolean)}
                                          className={cn(
                                            "border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black data-[state=checked]:border-emerald-500"
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span className="text-sm font-semibold leading-none">Add Trainer Package</span>
                                          <span className="text-xs text-muted-foreground mt-1">Get personalized 1-on-1 coaching</span>
                                        </div>
                                      </label>
                                      
                                      {hasTrainer && (
                                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 pt-3 border-t border-emerald-500/20 mt-1">
                                          <div className="grid gap-2">
                                            <Label htmlFor={`trainerPlan-${record.id}`} className="text-xs text-emerald-500/80 font-medium">Select Trainer Package</Label>
                                            <Select value={trainerPlan} onValueChange={setTrainerPlan}>
                                              <SelectTrigger className="bg-black/20 border-emerald-500/30 h-10 hover:border-emerald-500/50 focus:ring-emerald-500/50">
                                                <SelectValue placeholder="Select trainer package" />
                                              </SelectTrigger>
                                              <SelectContent className="matte-surface border-emerald-500/20">
                                                <SelectItem value="trainer_15_days" className="focus:bg-emerald-500/10 focus:text-emerald-500">15 Days Package (₱850)</SelectItem>
                                                <SelectItem value="trainer_1_month" className="focus:bg-emerald-500/10 focus:text-emerald-500">1 Month Package (₱1,500)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div className="grid gap-2">
                                            <Label htmlFor={`trainerId-${record.id}`} className="text-xs text-emerald-500/80 font-medium">Select Assigned Trainer</Label>
                                            <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                                              <SelectTrigger className="bg-black/20 border-emerald-500/30 h-10 hover:border-emerald-500/50 focus:ring-emerald-500/50">
                                                <SelectValue placeholder="Select trainer" />
                                              </SelectTrigger>
                                              <SelectContent className="matte-surface border-emerald-500/20">
                                                {trainers.map((t: any) => (
                                                  <SelectItem key={t.id} value={t.id.toString()} className="focus:bg-emerald-500/10 focus:text-emerald-500">
                                                    {t.firstname} {t.lastname}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                      )}
                                    </div>



                                    <div className="grid gap-2">
                                      <Label>Payment Method</Label>
                                      <Select value={renewPaymentMode} onValueChange={setRenewPaymentMode}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                          <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent className="matte-surface border-white/10">
                                          <SelectItem value="cash">Cash</SelectItem>
                                          <SelectItem value="gcash">GCash (Face-to-Face)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {renewPaymentMode === 'gcash' ? (
                                      <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 mt-2">
                                        <Label htmlFor={`renew-tx-${record.id}`}>GCash Transaction ID <span className="text-destructive">*</span></Label>
                                        <Input id={`renew-tx-${record.id}`} placeholder="e.g. 10023456789" className="bg-white/5 border-white/10 font-mono tracking-widest" required />
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-1 mt-2">
                                        <Checkbox id={`renew-cash-${record.id}`} className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black data-[state=checked]:border-emerald-500" required />
                                        <Label htmlFor={`renew-cash-${record.id}`} className="text-xs font-medium leading-tight cursor-pointer">
                                          Did you receive the exact payment in cash?
                                        </Label>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between p-4 mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                      <span className="font-semibold text-emerald-500/80">Total Amount to Pay:</span>
                                      <span className="text-xl font-bold text-emerald-400">
                                        ₱{(renewPlan === 'student_1_month' ? 480 : 550) + (hasTrainer ? (trainerPlan === 'trainer_15_days' ? 850 : 1500) : 0)}
                                      </span>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit" className="rounded-xl w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold" disabled={renewMutation.isPending}>
                                      {renewMutation.isPending ? 'Processing...' : 'Process Renewal'}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>


                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                                      <Ban className="size-4" /> Terminate Contract
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0a0a0a]">
                                    <DialogHeader>
                                      <DialogTitle className="text-destructive flex items-center gap-2">
                                        <Ban className="size-5" /> Terminate Contract
                                      </DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to terminate {record.full_name || record.firstname}'s active contract? This action cannot be undone and will revoke their gym access immediately.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                                      <Button variant="outline" className="bg-white/5 border-white/10">Cancel</Button>
                                      <Button 
                                        variant="destructive" 
                                        disabled={terminateMutation.isPending || !contract?.id}
                                        onClick={() => contract?.id && terminateMutation.mutate(contract.id)}
                                      >
                                        {terminateMutation.isPending ? 'Terminating...' : 'Terminate Access'}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
