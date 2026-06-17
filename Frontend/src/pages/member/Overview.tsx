import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CreditCard, 
  Dumbbell, 
  CalendarCheck, 
  QrCode, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance.service';

export default function MemberOverview() {
  const { user } = useAuthStore();
  
  // A user must have an active contract to access their QR code and facility
  const hasActiveContract = user?.contract?.status === 'active';

  // Fetch Member Attendance
  const { data: attendanceData = [] } = useQuery({
    queryKey: ['member-attendance'],
    queryFn: () => attendanceService.getMemberAttendance(),
    retry: false, // In case backend endpoint is not yet available, avoid retrying
  });

  // Calculate top 3 recent attendance
  const recentAttendance = useMemo(() => {
    return attendanceData.slice(0, 3).map((record: any) => ({
      id: record.id,
      date: new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeIn: new Date(record.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: 'Check In',
    }));
  }, [attendanceData]);

  // Aggregate user payments (Membership fee & Contract payment)
  const recentPayments = useMemo(() => {
    const payments = [];
    
    if (user?.contract?.payment) {
      const p = user.contract.payment;
      const contractTypeStr = user.contract.contract_type 
        ? user.contract.contract_type.replace(/_/g, ' ') 
        : 'Contract';
      const trainerPkgStr = p.trainer_package 
        ? ` + Trainer (${p.trainer_package.replace(/_/g, ' ')})` 
        : '';

      payments.push({
        id: `contract-${p.id}`,
        date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        amount: `₱${Number(p.payment_amount || 0).toFixed(2)}`,
        type: `${contractTypeStr}${trainerPkgStr}`,
        status: p.payment_status || 'Paid',
      });
    }

    if (user?.membership_fee) {
      const m = user.membership_fee;
      payments.push({
        id: `fee-${m.id}`,
        date: m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        amount: `₱${Number(m.payment_amount || 0).toFixed(2)}`,
        type: 'Membership Fee',
        status: m.payment_status || 'Paid',
      });
    }
    
    return payments;
  }, [user]);

  const totalVisits = attendanceData.length;

  return (
    <MemberLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, {user?.firstname || 'Member'}!</h1>
          <p className="text-muted-foreground mt-1">Here is what's happening with your membership today.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6">
              <QrCode className="size-5" />
              <span className="font-semibold text-base">Show QR Code</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="matte-surface border-white/10 sm:max-w-md text-center">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Your Access QR Code</DialogTitle>
              <DialogDescription className="text-center">
                Scan this at the front desk to log your attendance.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              {user?.qr_code ? (
                <>
                  <div className="bg-white p-4 rounded-2xl w-48 h-48 flex items-center justify-center overflow-hidden">
                    <QRCodeSVG 
                      value={user.qr_code} 
                      size={160} 
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1 text-sm">
                    {hasActiveContract ? 'Active Contract' : 'Approved Member'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code at the front desk.
                  </p>
                </>
              ) : (
                <>
                  <div className="relative bg-white/5 p-4 rounded-2xl w-48 h-48 flex items-center justify-center overflow-hidden">
                    <QrCode className="size-32 text-white/10 blur-sm" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <Lock className="size-8 text-rose-500 mb-2" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Locked</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-4 py-1 text-sm">
                    Pending Approval
                  </Badge>
                  <p className="text-sm text-rose-500/80">
                    Your QR code has not been generated yet. Please visit the front desk to complete your membership.
                  </p>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contract Status */}
        {hasActiveContract ? (
          <div className="glass-card rounded-2xl p-6 border-l-4 border-l-emerald-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CreditCard className="size-24 -mr-6 -mt-6 transform rotate-12" />
            </div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-medium text-white">Contract Status</h3>
                <p className="text-emerald-500 text-sm font-semibold capitalize">
                  Active - {user?.contract?.contract_type?.replace(/_/g, ' ') || 'Plan'}
                </p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-2xl font-bold text-white tracking-tight mb-1">
                {user?.contract?.end_date ? (
                  `${Math.ceil((new Date(user.contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days`
                ) : 'Active'}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                remaining until renewal on {user?.contract?.end_date ? new Date(user.contract.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </p>
              
              {user?.contract?.payment?.trainer_package && (
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/10">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize px-2 py-0.5">
                    Trainer: {user.contract.payment.trainer_package.replace(/_/g, ' ')}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 border-l-4 border-l-rose-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CreditCard className="size-24 -mr-6 -mt-6 transform rotate-12" />
            </div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="size-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Lock className="size-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-medium text-white">Contract Status</h3>
                <p className="text-rose-500 text-sm font-semibold">No Active Plan</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-bold text-white tracking-tight mb-1">
                Inactive
              </div>
              <p className="text-sm text-muted-foreground">
                Please purchase a plan to use the gym facilities.
              </p>
            </div>
          </div>
        )}

        {/* Workout Plan */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Dumbbell className="size-24 -mr-6 -mt-6 transform -rotate-12" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calendar className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-white">Today's Workout</h3>
              <p className="text-primary text-sm font-semibold">Leg Day Focus</p>
            </div>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-white tracking-tight mb-1">
                4 Exercises
              </div>
              <p className="text-sm text-muted-foreground">
                Squats, Leg Press, Lunges...
              </p>
            </div>
            <Button variant="ghost" size="icon" className="size-8 rounded-full bg-white/5 hover:bg-white/10" asChild>
              <Link to="/member/planner">
                <ArrowRight className="size-4 text-white" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="size-24 -mr-6 -mt-6 transform rotate-6" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="size-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-white">Attendance Summary</h3>
              <p className="text-blue-500 text-sm font-semibold">Overall Visits</p>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-bold text-white tracking-tight mb-1">
              {totalVisits} Visits
            </div>
            <p className="text-sm text-muted-foreground">
              {totalVisits > 0 ? "You're doing great! Keep it up!" : "No attendance recorded yet."}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Attendance */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" />
              <h2 className="font-semibold text-lg text-white">Recent Attendance</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground hover:text-white" asChild>
              <Link to="/member/attendance">View All</Link>
            </Button>
          </div>
          <div className="p-0">
            <Table>
              <TableHeader className="bg-white/5 border-b-0">
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Time In</TableHead>
                  <TableHead className="text-right text-muted-foreground">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((record: any) => (
                    <TableRow key={record.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{record.date}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="size-3 text-muted-foreground/70" />
                          {record.timeIn}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-white/5 border-white/10 font-normal">
                          {record.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No recent attendance found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-emerald-500" />
              <h2 className="font-semibold text-lg text-white">Recent Payments</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground hover:text-white" asChild>
              <Link to="/member/payments">View All</Link>
            </Button>
          </div>
          <div className="p-0">
            <Table>
              <TableHeader className="bg-white/5 border-b-0">
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.length > 0 ? (
                  recentPayments.map((payment: any) => (
                    <TableRow key={payment.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{payment.date}</TableCell>
                      <TableCell className="text-muted-foreground">{payment.type}</TableCell>
                      <TableCell className="text-right text-white font-medium">
                        {payment.amount}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No recent payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
      </div>
    </MemberLayout>
  );
}
