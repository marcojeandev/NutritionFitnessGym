import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserMinus,
  Footprints,
  ShoppingBag,
  ClipboardCheck,
  RefreshCw,
  QrCode,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QRScannerModal } from '@/components/QRScannerModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { attendanceService } from '@/services/attendance.service';
import { contractService } from '@/services/contract.service';
import { walkinService } from '@/services/walkin.service';
import { productService } from '@/services/product.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';

const statsTemplate = [
  { label: 'Total Members', key: 'membersCount', trend: '+12.5%', up: true, icon: Users, color: 'text-blue-500', prefix: '' },
  { label: 'Active Memberships', key: 'activeMemberships', trend: '+5.2%', up: true, icon: UserCheck, color: 'text-emerald-500', prefix: '' },
  { label: 'Expired Memberships', key: 'expiredMemberships', trend: '-2.1%', up: true, icon: UserMinus, color: 'text-red-500', prefix: '' },
  { label: 'Monthly Revenue', key: 'monthlyRevenue', trend: '+8.2%', up: true, icon: CreditCard, color: 'text-emerald-500', prefix: '₱' },
  { label: 'Walk-ins Today', key: 'walkinsToday', trend: '+14.5%', up: true, icon: Footprints, color: 'text-orange-500', prefix: '' },
  { label: 'Product Sales', key: 'productSales', trend: '+3.4%', up: true, icon: ShoppingBag, color: 'text-purple-500', prefix: '₱' },
  { label: 'Attendance Today', key: 'attendanceToday', trend: '+12.1%', up: true, icon: ClipboardCheck, color: 'text-blue-400', prefix: '' },
  { label: 'Renewals (This Month)', key: 'renewalsThisMonth', trend: '+2.4%', up: true, icon: RefreshCw, color: 'text-emerald-400', prefix: '' },
];

export default function AdminOverview() {
  const queryClient = useQueryClient();
  const [scanResult, setScanResult] = React.useState<{ user: any, status: string, message: string } | null>(null);

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
    queryFn: () => productService.getPaychecks()
  });

  const { data: walkinAttendances = [] } = useQuery({
    queryKey: ['walkin-attendance'],
    queryFn: () => walkinService.getWalkinAttendance()
  });

  // Derived Statistics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayStr = now.toDateString();

  const membersCount = users.filter((u: any) => u.role === 'member').length || users.length;
  const activeMemberships = contracts.filter((c: any) => c.status === 'active').length;
  const expiredMemberships = contracts.filter((c: any) => c.status === 'expired').length;
  
  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    // Handle "YYYY-MM-DD HH:mm:ss" format safely
    const parsed = new Date(dateStr.replace(' ', 'T'));
    if (!isNaN(parsed.getTime())) return parsed.toDateString() === todayStr;
    return new Date(dateStr).toDateString() === todayStr;
  };

  const attendanceToday = memberAttendances.filter((a: any) => isToday(a.date) || isToday(a.created_at) || isToday(a.time_in)).length;
  const walkinsToday = walkinAttendances.filter((w: any) => isToday(w.date) || isToday(w.created_at) || isToday(w.time_in)).length;
  
  const productSales = paychecks.reduce((sum: number, p: any) => {
    const total = p.total_price || (p.items || []).reduce((s: number, i: any) => s + (i.price_at_sale * i.quantity), 0);
    return sum + Number(total);
  }, 0);

  const renewalsThisMonth = contracts.filter((c: any) => {
    const d = new Date(c.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const contractRevenueThisMonth = contracts.reduce((sum: number, c: any) => {
    if (c.payment?.payment_amount) {
      const d = new Date(c.payment.created_at || c.created_at);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return sum + Number(c.payment.payment_amount);
      }
    }
    return sum;
  }, 0);

  const walkinRevenueThisMonth = walkinAttendances.reduce((sum: number, w: any) => {
    const d = new Date(w.created_at || w.time_in);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      return sum + Number(w.fee_paid || 0);
    }
    return sum;
  }, 0);

  const productRevenueThisMonth = paychecks.reduce((sum: number, p: any) => {
    const d = new Date(p.created_at);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const total = p.total_price || (p.items || []).reduce((s: number, i: any) => s + (i.price_at_sale * i.quantity), 0);
      return sum + Number(total);
    }
    return sum;
  }, 0);

  const monthlyRevenue = contractRevenueThisMonth + walkinRevenueThisMonth + productRevenueThisMonth;

  const computedStats = {
    membersCount: membersCount.toLocaleString(),
    activeMemberships: activeMemberships.toLocaleString(),
    expiredMemberships: expiredMemberships.toLocaleString(),
    monthlyRevenue: monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    walkinsToday: walkinsToday.toLocaleString(),
    productSales: productSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    attendanceToday: attendanceToday.toLocaleString(),
    renewalsThisMonth: renewalsThisMonth.toLocaleString(),
  };

  // Mocking charts data for now using dynamic trends could be implemented if there is daily historical aggregation
  // For now using static empty/mock trends until daily endpoints exist
  const revenueData = [{ name: 'Today', revenue: monthlyRevenue }];
  const attendanceData = [{ name: 'Today', count: attendanceToday }];
  const growthData = [{ month: 'Current', members: membersCount }];

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
      }
    } else {
      status = 'inactive';
      message = 'Contract is not currently active.';
    }

    setScanResult({ user: matchedUser, status, message });

    if (status === 'active') {
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
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
            <QRScannerModal onScan={handleScan} />
            <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
              <UserPlus className="size-4" />
              Add Member
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statsTemplate.map((stat, i) => {
            const val = computedStats[stat.key as keyof typeof computedStats] || '0';
            return (
            <Card key={i} className="glass border-white/5 overflow-hidden group hover:border-white/10 transition-all">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2.5 rounded-2xl bg-white/5", stat.color)}>
                    <stat.icon className="size-5" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.up ? "text-emerald-500" : "text-destructive"
                  )}>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                  <h3 className="text-xl md:text-2xl font-bold mt-1">{stat.prefix}{val}</h3>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">Weekly gross revenue</p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Analytics */}
          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Attendance Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">Weekly member check-ins</p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff', cursor: 'transparent' }} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Membership Growth */}
          <Card className="glass border-white/5 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Membership Growth</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly active members count</p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }} />
                    <Line type="monotone" dataKey="members" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
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
    </AdminLayout>
  );
}
