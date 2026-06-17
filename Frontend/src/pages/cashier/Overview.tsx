import React, { useState, useMemo } from 'react';
import { CashierLayout } from '@/components/layout/CashierLayout';
import { cn } from '@/lib/utils';
import { 
  Users, 
  CreditCard, 
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Footprints,
  RefreshCw,
  QrCode,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QRScannerModal } from '@/components/QRScannerModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { attendanceService } from '@/services/attendance.service';
import { contractService } from '@/services/contract.service';
import { productService } from '@/services/product.service';
import { walkinService } from '@/services/walkin.service';
import { reservationService } from '@/services/reservation.service';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function CashierOverview() {
  const queryClient = useQueryClient();
  const [scanResult, setScanResult] = useState<{ user: any, status: string, message: string } | null>(null);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers({ per_page: 1000 })
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractService.getAllContracts({ per_page: 1000 })
  });

  const { data: memberAttendances = [] } = useQuery({
    queryKey: ['member-attendance'],
    queryFn: () => attendanceService.getAllAttendance()
  });

  const { data: paychecks = [] } = useQuery({
    queryKey: ['paychecks'],
    queryFn: productService.getPaychecks
  });

  const { data: walkins = [] } = useQuery({
    queryKey: ['walkins'],
    queryFn: walkinService.getWalkins
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationService.getReservations
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const isToday = (dateStr: string | Date | undefined) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.toDateString() === now.toDateString();
    };

    // 1. Active Members
    const activeMembers = users.filter((u: any) => u.status === 'active').length;

    // 2. Today's Walk-ins
    const todaysWalkins = walkins.filter((w: any) => isToday(w.created_at));

    // 3. Membership Renewals (Today)
    const todaysContracts = contracts.filter((c: any) => isToday(c.created_at));
    const todaysRenewals = todaysContracts.filter((c: any) => c.type === 'Renewal' || c.type === 'Membership').length;

    // 4. Today's Revenue
    let todaysRev = 0;
    
    // Contracts Revenue
    todaysContracts.forEach((c: any) => {
      if (c.payment?.payment_status === 'paid' && isToday(c.payment?.paid_at || c.created_at)) {
        todaysRev += Number(c.payment.payment_amount || 0);
      }
    });

    // POS Sales Revenue
    const todaysPaychecks = paychecks.filter((p: any) => p.payment_status === 'paid' && isToday(p.created_at));
    todaysPaychecks.forEach((p: any) => { todaysRev += Number(p.total_price || 0); });

    // Walkins Revenue
    todaysWalkins.forEach((w: any) => { todaysRev += Number(w.fee_paid || 0); });

    // Reservations Revenue
    reservations.filter((r: any) => r.payment_status === 'paid' && isToday(r.created_at)).forEach((r: any) => {
      todaysRev += Number(r.payment_amount || 0);
    });

    // Registration Fees Revenue
    users.filter((u: any) => u.membership_fee?.payment_status === 'paid' && isToday(u.membership_fee.paid_at || u.membership_fee.created_at)).forEach((u: any) => {
      todaysRev += Number(u.membership_fee.payment_amount || 0);
    });

    // 5. Recent Transactions (Top 10 All Time)
    const allTransactions: any[] = [];
    
    contracts.forEach((c: any) => {
      if (c.payment) {
        allTransactions.push({
          id: `CTR-${c.id}`,
          member: c.user ? `${c.user.firstname} ${c.user.lastname}` : 'Unknown',
          type: c.type || 'Membership',
          amount: `₱${Number(c.payment.payment_amount || 0).toLocaleString()}`,
          date: new Date(c.payment.paid_at || c.created_at),
          status: c.payment.payment_status === 'paid' ? 'Completed' : 'Pending'
        });
      }
    });

    paychecks.forEach((p: any) => {
      allTransactions.push({
        id: `POS-${p.id}`,
        member: p.paid_by_name || 'Walk-in Customer',
        type: 'Product Purchase',
        amount: `₱${Number(p.total_price || 0).toLocaleString()}`,
        date: new Date(p.created_at),
        status: p.payment_status === 'paid' ? 'Completed' : 'Pending'
      });
    });

    walkins.forEach((w: any) => {
      const profile = w.walk_in_info ? `${w.walk_in_info.firstname} ${w.walk_in_info.lastname}` : 'Walk-in User';
      allTransactions.push({
        id: `WLK-${w.id}`,
        member: profile,
        type: 'Daily Pass',
        amount: `₱${Number(w.fee_paid || 0).toLocaleString()}`,
        date: new Date(w.created_at),
        status: 'Completed'
      });
    });

    reservations.forEach((r: any) => {
      allTransactions.push({
        id: `RES-${r.id}`,
        member: r.fullname,
        type: 'Court Rental',
        amount: `₱${Number(r.payment_amount || 0).toLocaleString()}`,
        date: new Date(r.created_at),
        status: r.payment_status === 'paid' ? 'Completed' : 'Pending'
      });
    });

    // Sort descending by date
    allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    const recentTransactions = allTransactions.slice(0, 10).map(t => ({
      ...t,
      time: t.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    // 6. Charts Data (Hourly for Today)
    const hourlyRevenue: Record<number, number> = { 6:0, 8:0, 10:0, 12:0, 14:0, 16:0, 18:0, 20:0 };
    const hourlyWalkins: Record<number, number> = { 6:0, 8:0, 10:0, 12:0, 14:0, 16:0, 18:0, 20:0 };

    const getHourBucket = (d: Date) => {
      const hour = d.getHours();
      if (hour < 8) return 6;
      if (hour < 10) return 8;
      if (hour < 12) return 10;
      if (hour < 14) return 12;
      if (hour < 16) return 14;
      if (hour < 18) return 16;
      if (hour < 20) return 18;
      return 20;
    };

    // Process all transactions for today to put into hourlyRevenue
    allTransactions.filter(t => isToday(t.date)).forEach(t => {
      if (t.status === 'Completed') {
        const bucket = getHourBucket(t.date);
        const val = Number(t.amount.replace(/[^0-9.-]+/g,""));
        if (hourlyRevenue[bucket] !== undefined) {
          hourlyRevenue[bucket] += val;
        }
      }
    });

    todaysWalkins.forEach((w: any) => {
      const bucket = getHourBucket(new Date(w.created_at));
      if (hourlyWalkins[bucket] !== undefined) {
        hourlyWalkins[bucket] += 1;
      }
    });

    const revenueData = [
      { name: '6am', revenue: hourlyRevenue[6] },
      { name: '8am', revenue: hourlyRevenue[8] },
      { name: '10am', revenue: hourlyRevenue[10] },
      { name: '12pm', revenue: hourlyRevenue[12] },
      { name: '2pm', revenue: hourlyRevenue[14] },
      { name: '4pm', revenue: hourlyRevenue[16] },
      { name: '6pm', revenue: hourlyRevenue[18] },
      { name: '8pm', revenue: hourlyRevenue[20] },
    ];

    const walkinsData = [
      { time: '6am', count: hourlyWalkins[6] },
      { time: '8am', count: hourlyWalkins[8] },
      { time: '10am', count: hourlyWalkins[10] },
      { time: '12pm', count: hourlyWalkins[12] },
      { time: '2pm', count: hourlyWalkins[14] },
      { time: '4pm', count: hourlyWalkins[16] },
      { time: '6pm', count: hourlyWalkins[18] },
      { time: '8pm', count: hourlyWalkins[20] },
    ];

    return {
      activeMembers,
      todaysWalkinsCount: todaysWalkins.length,
      todaysRenewals,
      todaysRev,
      recentTransactions,
      revenueData,
      walkinsData
    };

  }, [contracts, paychecks, walkins, users, reservations]);

  const stats = [
    { label: "Today's Revenue", value: `₱${metrics.todaysRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, trend: '+0.0%', up: true, icon: CreditCard, color: 'text-emerald-500' },
    { label: "Today's Walk-ins", value: metrics.todaysWalkinsCount.toString(), trend: '+0.0%', up: true, icon: Footprints, color: 'text-orange-500' },
    { label: 'Membership Renewals', value: metrics.todaysRenewals.toString(), trend: '+0.0%', up: true, icon: RefreshCw, color: 'text-blue-500' },
    { label: 'Active Members', value: metrics.activeMembers.toLocaleString(), trend: '+0.0%', up: true, icon: UserCheck, color: 'text-purple-500' },
  ];

  const recordAttendanceMutation = useMutation({
    mutationFn: (data: any) => attendanceService.recordAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-attendance'] });
      toast.success("Attendance logged successfully!");
    },
    onError: () => toast.error("Failed to log attendance")
  });

  const handleScan = (result: string) => {
    const extractBase = (qrString: string) => {
      if (!qrString) return '';
      return qrString.split('/').pop() || qrString;
    };
    
    const scanId = extractBase(result);
    const matchedUser = users.find((u: any) => extractBase(u.qr_code) === scanId);
    
    if (!matchedUser) {
      toast.error("Invalid QR Code: Member not found.");
      return;
    }

    let status = 'active';
    let message = '';
    const userContracts = contracts.filter((c: any) => c.user_id === matchedUser.id);
    const latestContract = [...userContracts].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const contract = matchedUser.contract || latestContract;

    if (!contract) {
      status = 'newbie';
      message = 'No active contract yet. Newbie member.';
    } else if (contract.status === 'expired') {
      status = 'expired';
      message = `Contract expired on ${new Date(contract.end_date as string).toLocaleDateString()}.`;
    } else if (contract.status === 'active') {
      const isExpired = new Date(contract.end_date as string) < new Date();
      if (isExpired) {
        status = 'expired';
        message = `Contract is overdue since ${new Date(contract.end_date as string).toLocaleDateString()}.`;
      } else {
        status = 'active';
        message = `Contract is active until ${new Date(contract.end_date as string).toLocaleDateString()}.`;
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const time_in = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const todayDate = `${year}-${month}-${day}`;
        const hasScannedToday = memberAttendances.some((att: any) => att.user_id === matchedUser.id && att.date === todayDate);

        if (hasScannedToday) {
          toast.info("Member has already scanned today.");
          return;
        }

        recordAttendanceMutation.mutate({
          user_id: matchedUser.id,
          time_in: time_in,
        });
      }
    } else {
      status = 'inactive';
      message = 'Contract is not currently active.';
    }

    setScanResult({ user: matchedUser, status, message });
  };

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentType, setPaymentType] = useState('walkin');

  return (
    <CashierLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Cashier Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage today's transactions, walk-ins, and renewals.</p>
          </div>
          <div className="flex items-center gap-3">
            <QRScannerModal onScan={handleScan} />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                  <UserPlus className="size-4" />
                  Process Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0a0a0a]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Process Payment</DialogTitle>
                  <DialogDescription>Record a face-to-face transaction</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Transaction Type</Label>
                    <Select value={paymentType} onValueChange={setPaymentType}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walkin">Walk-in Fee</SelectItem>
                        <SelectItem value="new">New Membership</SelectItem>
                        <SelectItem value="renewal">Membership Renewal</SelectItem>
                        <SelectItem value="product">Product Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {paymentType !== 'product' && (
                    <div className="grid gap-2 animate-in fade-in zoom-in-95 duration-200">
                      <Label htmlFor="client">Client / Member Name</Label>
                      <Select>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select a member or client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john_doe">John Doe</SelectItem>
                          <SelectItem value="jane_smith">Jane Smith</SelectItem>
                          <SelectItem value="mike_johnson">Mike Johnson</SelectItem>
                          <SelectItem value="walkin_user">Walk-in Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (₱)</Label>
                    <Input id="amount" type="number" placeholder="0.00" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="gcash">GCash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {paymentMethod !== 'cash' && (
                    <div className="grid gap-2 animate-in fade-in zoom-in-95 duration-200">
                      <Label htmlFor="reference">Reference Code</Label>
                      <Input id="reference" placeholder="Enter reference number" className="bg-white/5 border-white/10" />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full rounded-xl">Complete Payment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="glass border-white/5 overflow-hidden group hover:border-white/10 transition-all">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2.5 rounded-2xl bg-white/5", stat.color)}>
                    <stat.icon className="size-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                  <h3 className="text-xl md:text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Revenue Analytics */}
          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Today's Revenue Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Hourly gross revenue for today</p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.revenueData}>
                    <defs>
                      <linearGradient id="colorRevenueCashier" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(val) => `₱${val >= 1000 ? val/1000 + 'k' : val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }} formatter={(val: number) => `₱${val.toLocaleString()}`} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueCashier)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Walk-ins Trend */}
          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Walk-ins Today</CardTitle>
              <p className="text-sm text-muted-foreground">Hourly distribution of walk-in customers</p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.walkinsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }} />
                    <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="glass border-white/5 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <p className="text-sm text-muted-foreground">Latest payments processed system-wide</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg font-medium">Transaction ID</th>
                      <th className="px-4 py-3 font-medium">Member/Client</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Date & Time</th>
                      <th className="px-4 py-3 rounded-r-lg font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentTransactions.length > 0 ? metrics.recentTransactions.map((trx, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4 font-medium text-white">{trx.id}</td>
                        <td className="px-4 py-4">{trx.member}</td>
                        <td className="px-4 py-4 text-muted-foreground">{trx.type}</td>
                        <td className="px-4 py-4 font-medium text-emerald-400">{trx.amount}</td>
                        <td className="px-4 py-4 text-muted-foreground">{trx.date.toLocaleDateString()} {trx.time}</td>
                        <td className="px-4 py-4 text-right">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            trx.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          )}>
                            {trx.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-muted-foreground">
                          No recent transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Shared Scan Result Dialog */}
      <Dialog open={!!scanResult} onOpenChange={(open) => !open && setScanResult(null)}>
        <DialogContent className="sm:max-w-md border-white/10 bg-[#0a0a0a]">
          <DialogHeader>
            <DialogTitle>Member Scan Result</DialogTitle>
          </DialogHeader>
          {scanResult && (
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
              <Avatar className="size-24 border border-white/10 mb-2">
                <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                  {scanResult.user.firstname.charAt(0)}{scanResult.user.lastname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-bold text-white">{scanResult.user.firstname} {scanResult.user.lastname}</h3>
              
              <Badge variant="outline" className={cn(
                "px-4 py-1 text-sm border",
                scanResult.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                scanResult.status === 'expired' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                "bg-orange-500/10 text-orange-500 border-orange-500/20"
              )}>
                {scanResult.status.toUpperCase()}
              </Badge>
              
              <p className={cn(
                "text-sm font-medium",
                scanResult.status === 'active' ? "text-emerald-500/80" : 
                scanResult.status === 'expired' ? "text-rose-500/80" : "text-orange-500/80"
              )}>
                {scanResult.message}
              </p>

              <Button onClick={() => setScanResult(null)} variant="outline" className="mt-4 w-full rounded-xl border-white/10 hover:bg-white/5">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CashierLayout>
  );
}
