import React from 'react';
import { CashierLayout } from '@/components/layout/CashierLayout';
import { cn } from '@/lib/utils';
import { 
  ClipboardCheck, 
  Search, 
  QrCode, 
  History,
  Clock,
  UserCheck,
  UserMinus,
  Calendar,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walkinService } from '@/services/walkin.service';
import { attendanceService } from '@/services/attendance.service';
import { userService } from '@/services/user.service';
import { contractService } from '@/services/contract.service';
import { QRScannerModal } from '@/components/QRScannerModal';
import { toast } from 'sonner';

export default function CashierAttendance() {
  const queryClient = useQueryClient();
  const [scanResult, setScanResult] = React.useState<{ user: any, status: string, message: string } | null>(null);

  const { data: walkinAttendances = [], isLoading: isWalkinLoading } = useQuery({
    queryKey: ['walkin-attendance'],
    queryFn: () => walkinService.getWalkinAttendance()
  });

  const { data: walkins = [] } = useQuery({
    queryKey: ['walkins'],
    queryFn: () => walkinService.getWalkins()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers({ per_page: 1000 })
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractService.getAllContracts({ per_page: 1000 })
  });

  const { data: memberAttendances = [], isLoading: isMemberLoading } = useQuery({
    queryKey: ['member-attendance'],
    queryFn: () => attendanceService.getAllAttendance()
  });

  const recordAttendanceMutation = useMutation({
    mutationFn: (data: any) => attendanceService.recordAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-attendance'] });
      toast.success("Attendance logged successfully!");
    },
    onError: (error: any) => {
      const data = error.response?.data;
      const errorMsg = data?.errors?.user_id?.[0] || data?.errors?.qr_code?.[0] || data?.errors?.time_in?.[0] || data?.errors?.time_out?.[0] || data?.message || "Failed to log attendance";
      toast.error(errorMsg);
    }
  });

  const isLoading = isWalkinLoading || isMemberLoading;

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

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const todayDate = `${year}-${month}-${day}`;
    const hasScannedToday = memberAttendances.some((att: any) => att.user_id === matchedUser.id && att.date === todayDate);

    if (hasScannedToday) {
      toast.info("Member has already scanned today.");
      return;
    }

    if (status === 'active') {
      recordAttendanceMutation.mutate({
        user_id: matchedUser.id,
        qr_code: scanId,
        time_in: formattedDateTime,
      });
    }
  };

  const walkinLogs = walkinAttendances.map((att: any) => {
    const walkin = walkins.find((w: any) => w.id === att.walk_in_id);
    return {
      id: `w-${att.id}`,
      name: walkin ? `${walkin.firstname} ${walkin.lastname}` : 'Unknown Walk-in',
      type: 'Walk-in',
      timeIn: new Date(att.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeOut: '-', 
      status: 'In Gym'
    };
  });

  const memberLogs = memberAttendances.map((att: any) => {
    const userName = att.user ? `${att.user.firstname} ${att.user.lastname}` : 'Unknown Member';
    return {
      id: `m-${att.id}`,
      name: userName,
      type: 'Member',
      timeIn: new Date(att.created_at || att.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeOut: att.time_out || '-',
      status: 'In Gym'
    };
  });

  const attendanceLogs = [...memberLogs, ...walkinLogs];

  return (
    <CashierLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Attendance Monitoring</h1>
            <p className="text-muted-foreground mt-1">Track real-time entry and exit logs.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl gap-2">
              <Calendar className="size-4" />
              History
            </Button>
            <QRScannerModal onScan={handleScan} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-white/5 bg-emerald-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <UserCheck className="size-6" />
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">LIVE</Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Currently In Gym</p>
                <h3 className="text-3xl font-bold mt-1">42</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                  <Clock className="size-6" />
                </div>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Average Duration</p>
                <h3 className="text-3xl font-bold mt-1">1h 45m</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                  <UserMinus className="size-6" />
                </div>
                <span className="text-xs text-muted-foreground">Peak Time</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Busiest Hour</p>
                <h3 className="text-3xl font-bold mt-1">5:00 PM</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-white/5">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
            <CardTitle>Attendance Log</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-10 bg-white/5 border-white/10 rounded-xl" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="px-6 text-muted-foreground">Person</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Time In</TableHead>
                  <TableHead className="text-muted-foreground">Time Out</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right px-6 text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading attendance logs...</TableCell>
                  </TableRow>
                ) : attendanceLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No attendance logs found for today.</TableCell>
                  </TableRow>
                ) : attendanceLogs.map((log: any) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 border border-white/10">
                          <AvatarFallback className="bg-white/5 text-[10px]">{log.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{log.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10">
                        {log.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.timeIn}</TableCell>
                    <TableCell className="text-sm">{log.timeOut}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "size-1.5 rounded-full",
                          log.status === 'In Gym' ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          log.status === 'In Gym' ? "text-emerald-500" : "text-muted-foreground"
                        )}>
                          {log.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 hover:bg-white/10">
                            <ArrowRight className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0a0a0a]">
                          <DialogHeader>
                            <DialogTitle>Attendance Details</DialogTitle>
                            <DialogDescription>Read-only view of {log.name}'s attendance.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="size-16 border border-white/10">
                                <AvatarFallback className="bg-white/5 text-xl">{log.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-bold text-white">{log.name}</h3>
                                <p className="text-sm text-muted-foreground">{log.type}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-xs text-muted-foreground">Time In</p>
                                <p className="font-medium text-white">{log.timeIn}</p>
                              </div>
                              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-xs text-muted-foreground">Time Out</p>
                                <p className="font-medium text-white">{log.timeOut}</p>
                              </div>
                              <div className="p-3 bg-white/5 rounded-xl border border-white/10 col-span-2">
                                <p className="text-xs text-muted-foreground">Status</p>
                                <p className={cn("font-medium", log.status === 'In Gym' ? "text-emerald-500" : "text-white")}>{log.status}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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

