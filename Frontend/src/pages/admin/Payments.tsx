import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';
import { 
  Wallet,
  Search, 
  Plus, 
  CreditCard,
  Banknote,
  MoreHorizontal,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ShieldCheck,
  Dumbbell,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contractService } from '@/services/contract.service';
import { walkinService } from '@/services/walkin.service';
import { productService } from '@/services/product.service';
import { userService } from '@/services/user.service';
import { reservationService } from '@/services/reservation.service';

export default function AdminPayments() {
  const [filter, setFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionType, setTransactionType] = useState('misc');
  const [transactionId, setTransactionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const itemsPerPage = 4;
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (data: { id: number, type: string }) => {
      if (data.type === 'Renewal' || data.type === 'Membership') {
        return contractService.updateContract(data.id, {
          status: 'active',
          payment_status: 'paid'
        } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
      toast.success('Payment approved and contract activated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    }
  });

  // Fetch all related data
  const { data: contracts = [] } = useQuery({ queryKey: ['admin-contracts'], queryFn: contractService.getAllContracts });
  const { data: walkins = [] } = useQuery({ queryKey: ['admin-walkin-attendance'], queryFn: walkinService.getWalkinAttendance });
  const { data: paychecks = [] } = useQuery({ queryKey: ['admin-paychecks'], queryFn: productService.getPaychecks });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: () => userService.getAllUsers({ role: 'member' }) });
  const { data: walkinProfiles = [] } = useQuery({ queryKey: ['admin-walkin-profiles'], queryFn: walkinService.getWalkins });
  const { data: reservations = [] } = useQuery({ queryKey: ['admin-reservations'], queryFn: reservationService.getReservations });

  // Map contracts
  const contractPayments = contracts.filter((c: any) => c.payment).flatMap((c: any) => {
    const totalAmount = Number(c.payment?.payment_amount || 0);
    const baseType = c.contract_type === 'renewal' ? 'Renewal' : 'Membership';
    const payments = [];

    // If there's a trainer package or amount is greater than base membership
    const hasTrainer = c.payment?.trainer_id || c.payment?.trainer_package || totalAmount > 150;
    
    if (hasTrainer && totalAmount > 150) {
      const baseMembership = 150;
      let trainerFee = 0;
      
      const packageStr = String(c.payment?.trainer_package || '').toLowerCase();
      if (packageStr.includes('850') || totalAmount === 1000) {
        trainerFee = 850;
      } else if (packageStr.includes('1500') || totalAmount >= 1650) {
        trainerFee = 1500;
      } else {
        trainerFee = totalAmount - baseMembership; // fallback
      }

      const otherFees = totalAmount - baseMembership - trainerFee;

      // Base Membership
      payments.push({
        id: `CTR-${c.id}-M`,
        rawId: c.id,
        rawData: c,
        or_number: c.payment?.or_number || 'N/A',
        name: c.user ? `${c.user.firstname} ${c.user.lastname}` : 'Unknown Member',
        type: baseType,
        rawAmount: baseMembership,
        amount: `₱${baseMembership.toLocaleString()}`,
        status: c.payment?.payment_status === 'paid' ? 'Completed' : 'Pending',
        date: c.payment?.paid_at ? new Date(c.payment.paid_at) : new Date(c.created_at),
        method: c.payment?.payment_type === 'gcash' ? 'GCash' : 'Cash'
      });

      // Trainer Package
      if (trainerFee > 0) {
        payments.push({
          id: `CTR-${c.id}-T`,
          rawId: c.id,
          rawData: c,
          or_number: c.payment?.or_number || 'N/A',
          name: c.user ? `${c.user.firstname} ${c.user.lastname}` : 'Unknown Member',
          type: 'Trainer Package',
          rawAmount: trainerFee,
          amount: `₱${trainerFee.toLocaleString()}`,
          status: c.payment?.payment_status === 'paid' ? 'Completed' : 'Pending',
          date: c.payment?.paid_at ? new Date(c.payment.paid_at) : new Date(c.created_at),
          method: c.payment?.payment_type === 'gcash' ? 'GCash' : 'Cash'
        });
      }

      // Other Fees
      if (otherFees > 0) {
        payments.push({
          id: `CTR-${c.id}-O`,
          rawId: c.id,
          rawData: c,
          or_number: c.payment?.or_number || 'N/A',
          name: c.user ? `${c.user.firstname} ${c.user.lastname}` : 'Unknown Member',
          type: 'Other Fees',
          rawAmount: otherFees,
          amount: `₱${otherFees.toLocaleString()}`,
          status: c.payment?.payment_status === 'paid' ? 'Completed' : 'Pending',
          date: c.payment?.paid_at ? new Date(c.payment.paid_at) : new Date(c.created_at),
          method: c.payment?.payment_type === 'gcash' ? 'GCash' : 'Cash'
        });
      }
    } else {
      // Standard Membership Only
      payments.push({
        id: `CTR-${c.id}`,
        rawId: c.id,
        rawData: c,
        or_number: c.payment?.or_number || 'N/A',
        name: c.user ? `${c.user.firstname} ${c.user.lastname}` : 'Unknown Member',
        type: baseType,
        rawAmount: totalAmount,
        amount: `₱${totalAmount.toLocaleString()}`,
        status: c.payment?.payment_status === 'paid' ? 'Completed' : 'Pending',
        date: c.payment?.paid_at ? new Date(c.payment.paid_at) : new Date(c.created_at),
        method: c.payment?.payment_type === 'gcash' ? 'GCash' : 'Cash'
      });
    }

    return payments;
  });

  // Map walkins
  const walkinPayments = walkins.map((w: any) => {
    const profile = walkinProfiles.find((p: any) => p.id === w.walk_in_id);
    return {
      id: `WLK-${w.id}`,
      rawId: w.id,
      rawData: w,
      or_number: 'N/A',
      name: profile ? `${profile.firstname} ${profile.lastname}` : (w.walk_in_info ? `${w.walk_in_info.firstname} ${w.walk_in_info.lastname}` : 'Walk-in User'),
      type: 'Walk-in',
      rawAmount: Number(w.fee_paid || 0),
      amount: `₱${Number(w.fee_paid || 0).toLocaleString()}`,
      status: 'Completed',
      date: new Date(w.created_at),
      method: 'Cash'
    };
  });

  // Map products
  const productPayments = paychecks.map((p: any) => ({
    id: `POS-${p.id}`,
    rawId: p.id,
    rawData: p,
    or_number: p.or_number || 'N/A',
    name: p.paid_by_name || 'Walk-in Customer',
    type: 'Product',
    rawAmount: Number(p.total_price || 0),
    amount: `₱${Number(p.total_price || 0).toLocaleString()}`,
    status: p.payment_status === 'paid' ? 'Completed' : 'Pending',
    date: new Date(p.created_at),
    method: p.payment_type === 'gcash' ? 'GCash' : 'Cash'
  }));

  // Map registration fees
  const regFees = users.filter((u: any) => u.membership_fee).map((u: any) => ({
    id: `REG-${u.membership_fee.id}`,
    rawId: u.membership_fee.id,
    rawData: u,
    or_number: u.membership_fee.or_number || 'N/A',
    name: `${u.firstname} ${u.lastname}`,
    type: 'Registration',
    rawAmount: Number(u.membership_fee.payment_amount || 0),
    amount: `₱${Number(u.membership_fee.payment_amount || 0).toLocaleString()}`,
    status: u.membership_fee.payment_status === 'paid' ? 'Completed' : 'Pending',
    date: u.membership_fee.paid_at ? new Date(u.membership_fee.paid_at) : new Date(u.membership_fee.created_at),
    method: u.membership_fee.payment_type === 'gcash' ? 'GCash' : 'Cash'
  }));

  // Map reservations
  const reservationPayments = reservations.map((r: any) => ({
    id: `RES-${r.id}`,
    rawId: r.id,
    rawData: r,
    or_number: r.or_number || 'N/A',
    name: r.fullname,
    type: 'Court Rental',
    rawAmount: Number(r.payment_amount || 0),
    amount: `₱${Number(r.payment_amount || 0).toLocaleString()}`,
    status: r.payment_status === 'paid' ? 'Completed' : 'Pending',
    date: new Date(r.created_at),
    method: r.payment_type === 'gcash' ? 'GCash' : 'Cash'
  }));

  // Combine and sort
  const allPayments = [...contractPayments, ...walkinPayments, ...productPayments, ...regFees, ...reservationPayments].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate summaries for today
  const now = new Date();
  
  const isDateInPeriod = (d: Date, period: string) => {
    if (period === 'all') return true;
    
    if (period === 'today') {
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    
    if (period === 'this-week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return d >= startOfWeek;
    }
    
    if (period === 'this-month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    
    return true;
  };
  
  const periodPayments = allPayments.filter(p => isDateInPeriod(p.date, timeFilter) && p.status === 'Completed');
  const periodRevenue = periodPayments.reduce((sum, p) => sum + p.rawAmount, 0);
  const periodMemberships = periodPayments.filter(p => p.type === 'Membership' || p.type === 'Renewal' || p.type === 'Registration').reduce((sum, p) => sum + p.rawAmount, 0);
  const periodWalkins = periodPayments.filter(p => p.type === 'Walk-in').reduce((sum, p) => sum + p.rawAmount, 0);
  const periodProducts = periodPayments.filter(p => p.type === 'Product').reduce((sum, p) => sum + p.rawAmount, 0);
  const periodTrainerPackages = periodPayments.filter(p => p.type === 'Trainer Package').reduce((sum, p) => sum + p.rawAmount, 0);
  const periodCourtRentals = periodPayments.filter(p => p.type === 'Court Rental').reduce((sum, p) => sum + p.rawAmount, 0);

  const filteredData = allPayments.filter(p => {
    const matchesTime = isDateInPeriod(p.date, timeFilter);
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'memberships' && (p.type === 'Membership' || p.type === 'Renewal' || p.type === 'Registration')) ||
      (filter === 'walkins' && p.type === 'Walk-in') ||
      (filter === 'products' && p.type === 'Product') ||
      (filter === 'trainers' && p.type === 'Trainer Package') ||
      (filter === 'court_rentals' && p.type === 'Court Rental');

    const matchesSearch = 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.or_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTime && matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getTypeIcon = (type: string) => {
    if (type === 'Membership' || type === 'Renewal' || type === 'Registration') return <CreditCard className="size-3.5" />;
    if (type === 'Walk-in') return <Banknote className="size-3.5" />;
    if (type === 'Product') return <Package className="size-3.5" />;
    if (type === 'Trainer Package') return <Dumbbell className="size-3.5" />;
    if (type === 'Court Rental') return <Clock className="size-3.5" />;
    if (type === 'Other Fees') return <MoreHorizontal className="size-3.5" />;
    return <Wallet className="size-3.5" />;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Payments</h1>
            <p className="text-muted-foreground mt-1">Master ledger for all gym transactions.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 rounded-xl">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="matte-surface border-white/10">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                  <Plus className="size-4" />
                  Create Payment Record
                </Button>
              </DialogTrigger>
              <DialogContent className="matte-surface border-white/10 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Manual Payment Entry</DialogTitle>
                  <DialogDescription>
                    Record a standalone transaction, miscellaneous fee, or manual override directly into the ledger.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tx-type">Transaction Type</Label>
                    <Select defaultValue="misc" onValueChange={setTransactionType}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="matte-surface border-white/10">
                        <SelectItem value="membership">Membership</SelectItem>
                        <SelectItem value="walkin">Walk-in</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="misc">Miscellaneous / Penalty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                    <Label htmlFor="client-name">Client Name</Label>
                    {transactionType === 'membership' || transactionType === 'walkin' ? (
                      <Select>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select registered user..." />
                        </SelectTrigger>
                        <SelectContent className="matte-surface border-white/10">
                          {users.filter((u: any) => u.status === 'active').map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.firstname} {user.lastname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input id="client-name" placeholder="e.g. John Doe (or leave blank)" className="bg-white/5 border-white/10" />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (₱)</Label>
                    <Input id="amount" type="number" placeholder="0.00" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select defaultValue="cash" onValueChange={setPaymentMethod}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="matte-surface border-white/10">
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="gcash">GCash (Face-to-Face)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {paymentMethod === 'gcash' ? (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 mt-2">
                      <Label htmlFor="ref">GCash Transaction ID <span className="text-destructive">*</span></Label>
                      <Input id="ref" placeholder="e.g. 10023456789" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="bg-white/5 border-white/10 font-mono tracking-widest" required />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-1 mt-1">
                      <Checkbox id="cash-confirm" className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                      <Label htmlFor="cash-confirm" className="text-xs font-medium leading-tight cursor-pointer">
                        Did you receive the exact payment in cash?
                      </Label>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" className="rounded-xl w-full">Record Transaction</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Wallet className="size-4" />
                <span className="text-sm">
                  Total Revenue 
                  {timeFilter === 'today' && ' (Today)'}
                  {timeFilter === 'this-week' && ' (This Week)'}
                  {timeFilter === 'this-month' && ' (This Month)'}
                  {timeFilter === 'all' && ' (All Time)'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-emerald-500">₱{periodRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CreditCard className="size-4" />
                <span className="text-sm">Memberships</span>
              </div>
              <h3 className="text-xl font-bold">₱{periodMemberships.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Banknote className="size-4" />
                <span className="text-sm">Walk-ins</span>
              </div>
              <h3 className="text-xl font-bold">₱{periodWalkins.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Package className="size-4" />
                <span className="text-sm">Products</span>
              </div>
              <h3 className="text-xl font-bold">₱{periodProducts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Dumbbell className="size-4" />
                <span className="text-sm">Trainer Packages</span>
              </div>
              <h3 className="text-xl font-bold">₱{periodTrainerPackages.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="size-4" />
                <span className="text-sm">Court Rentals</span>
              </div>
              <h3 className="text-xl font-bold">₱{periodCourtRentals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-white/5">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-0">
            <Tabs value={filter} onValueChange={(val) => { setFilter(val); setCurrentPage(1); }} className="w-full md:w-auto">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl flex-wrap h-auto">
                <TabsTrigger value="all" className="rounded-lg px-6">All</TabsTrigger>
                <TabsTrigger value="memberships" className="rounded-lg px-6">Memberships</TabsTrigger>
                <TabsTrigger value="walkins" className="rounded-lg px-6">Walk-ins</TabsTrigger>
                <TabsTrigger value="products" className="rounded-lg px-6">Products</TabsTrigger>
                <TabsTrigger value="trainers" className="rounded-lg px-6">Trainer Packages</TabsTrigger>
                <TabsTrigger value="court_rentals" className="rounded-lg px-6">Court Rentals</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search OR Number, TRX ID..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10 bg-white/5 border-white/10 rounded-xl h-10" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Transaction ID / OR Number</TableHead>
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Method</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((record) => (
                    <TableRow key={record.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-muted-foreground">{record.id}</span>
                          <span className="font-mono text-xs text-emerald-500/70">{record.or_number}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{record.name}</span>
                          <span className="text-xs text-muted-foreground">{record.date.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(record.type)}
                          <span className="text-sm">{record.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-bold">{record.amount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{record.method}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "h-6 text-[10px] gap-1",
                          record.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                        )}>
                          {record.status === 'Completed' ? <CheckCircle2 className="size-3" /> : <ArrowUpRight className="size-3" />}
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 hover:bg-white/10">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="matte-surface border-white/10 w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem 
                              onClick={() => setSelectedTransaction(record)} 
                              className="cursor-pointer gap-2 hover:bg-white/5"
                            >
                              <Eye className="size-4 text-muted-foreground" /> View Details
                            </DropdownMenuItem>
                            {record.status === 'Pending' && (record.type === 'Renewal' || record.type === 'Membership') && (
                              <DropdownMenuItem 
                                onSelect={(e) => {
                                  e.preventDefault();
                                  approveMutation.mutate({ id: record.rawId, type: record.type });
                                }} 
                                className="cursor-pointer gap-2 text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10"
                                disabled={approveMutation.isPending}
                              >
                                <ShieldCheck className="size-4" /> {approveMutation.isPending ? 'Processing...' : 'Approve Payment'}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="text-white font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-white font-medium">{filteredData.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? 'default' : 'outline'}
                      className={cn(
                        "size-8 p-0 border-white/10",
                        currentPage !== i + 1 && "bg-white/5 hover:bg-white/10"
                      )}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="matte-surface border-white/10 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete details for this payment record.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                  <p className="font-mono text-white font-medium">{selectedTransaction.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">O.R. Number</p>
                  <p className="font-mono text-emerald-500 font-medium">{selectedTransaction.or_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Client Name</p>
                  <p className="font-medium text-white">{selectedTransaction.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transaction Type</p>
                  <div className="flex items-center gap-2 text-white">
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="font-medium">{selectedTransaction.type}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                  <p className="text-white text-sm">{selectedTransaction.date.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                  <p className="text-white">{selectedTransaction.method}</p>
                </div>
                {selectedTransaction.method === 'GCash' && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">GCash Reference No.</p>
                    <p className="font-mono text-white text-sm">
                      {selectedTransaction.rawData?.payment?.transaction_id || 
                       selectedTransaction.rawData?.membership_fee?.transaction_id || 
                       selectedTransaction.rawData?.transaction_id || 
                       'N/A'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={cn(
                    "h-6 text-[10px] gap-1 w-max",
                    selectedTransaction.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                  )}>
                    {selectedTransaction.status === 'Completed' ? <CheckCircle2 className="size-3" /> : <ArrowUpRight className="size-3" />}
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-xl font-bold text-emerald-500">{selectedTransaction.amount}</p>
                </div>
              </div>

              {/* Dynamic Sections Based on Type */}
              {selectedTransaction.type === 'Product' && selectedTransaction.rawData.items && selectedTransaction.rawData.items.length > 0 && (
                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Items Purchased</p>
                  <div className="space-y-2">
                    {selectedTransaction.rawData.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{item.product?.name || 'Unknown Product'}</span>
                          <span className="text-muted-foreground text-xs">{item.quantity}x @ ₱{Number(item.price_at_sale).toLocaleString()}</span>
                        </div>
                        <span className="text-emerald-500 font-medium">₱{(item.quantity * Number(item.price_at_sale)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTransaction.type === 'Court Rental' && (
                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Reservation Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Rental Date</p>
                      <p className="text-sm text-white">{selectedTransaction.rawData.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time Block</p>
                      <p className="text-sm text-white">
                        {selectedTransaction.rawData.time_start} - {selectedTransaction.rawData.time_end}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(selectedTransaction.type === 'Membership' || selectedTransaction.type === 'Renewal' || selectedTransaction.type === 'Registration') && selectedTransaction.rawData.plan && (
                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Membership Plan</p>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-sm font-medium text-white">{selectedTransaction.rawData.plan.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Duration: {selectedTransaction.rawData.plan.duration_months} Months</p>
                  </div>
                </div>
              )}

            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransaction(null)} className="w-full rounded-xl border-white/10 hover:bg-white/5">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
