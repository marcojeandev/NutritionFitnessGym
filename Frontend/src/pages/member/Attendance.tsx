import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { QrCode, Clock, CalendarCheck, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance.service';

export default function MemberAttendance() {
  const { user } = useAuthStore();
  const hasActiveContract = user?.contract?.status === 'active';

  // Fetch Member Attendance
  const { data: attendanceData = [], isLoading } = useQuery({
    queryKey: ['member-attendance'],
    queryFn: () => attendanceService.getMemberAttendance(),
    retry: false, // In case backend endpoint is not yet available, avoid retrying
  });

  const attendanceHistory = useMemo(() => {
    return attendanceData.map((record: any) => {
      const d = new Date(record.created_at);
      return {
        id: record.id,
        date: d.toLocaleDateString('en-US', { weekday: 'long' }),
        exactDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timeIn: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'Check In'
      };
    });
  }, [attendanceData]);

  const totalVisits = attendanceHistory.length;

  return (
    <MemberLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Attendance</h1>
          <p className="text-muted-foreground mt-1">Access your QR code and view your visit history.</p>
        </div>

        {/* Top Section: QR Code & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* QR Code Card */}
          <Card className="glass border-white/5 md:col-span-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
            
            <h3 className="font-medium text-white mb-6 z-10 text-lg">Your Access Pass</h3>
            
            {hasActiveContract ? (
              <>
                <div className="bg-white p-4 rounded-2xl w-48 h-48 flex items-center justify-center mb-6 z-10 shadow-2xl shadow-primary/20 overflow-hidden">
                  {user?.qr_code ? (
                    <QRCodeSVG 
                      value={user.qr_code.split('/').pop() || user.qr_code} 
                      size={160} 
                      level="H"
                      includeMargin={false}
                    />
                  ) : (
                    <QrCode className="size-full text-black" />
                  )}
                </div>
                
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1.5 text-sm z-10">
                  Active Contract
                </Badge>
                <p className="text-xs text-muted-foreground mt-4 z-10 text-center">
                  Scans automatically at the turnstile
                </p>
              </>
            ) : (
              <>
                <div className="relative bg-white/5 p-4 rounded-2xl w-48 h-48 flex items-center justify-center mb-6 z-10 shadow-2xl shadow-primary/20 overflow-hidden">
                  <QrCode className="size-full text-white/10 blur-sm" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <Lock className="size-8 text-rose-500 mb-2" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Locked</span>
                  </div>
                </div>
                
                <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-4 py-1.5 text-sm z-10">
                  No Active Contract
                </Badge>
                <p className="text-xs text-rose-500/80 mt-4 z-10 text-center">
                  Purchase a plan at front desk.
                </p>
              </>
            )}
          </Card>

          {/* Quick Stats */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-center">
              <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <CalendarCheck className="size-6 text-primary" />
              </div>
              <h3 className="text-muted-foreground text-sm mb-1">Total Visits Record</h3>
              <p className="text-4xl font-bold text-white">{totalVisits}</p>
            </div>
            <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-center">
              <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Clock className="size-6 text-blue-500" />
              </div>
              <h3 className="text-muted-foreground text-sm mb-1">Average Time In</h3>
              <p className="text-4xl font-bold text-white">N/A</p>
            </div>
          </div>

        </div>

        {/* History Table */}
        <Card className="glass border-white/5">
          <CardHeader>
            <CardTitle className="text-xl">Check-in History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5 border-b-0">
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Day</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Time In</TableHead>
                  <TableHead className="text-right text-muted-foreground">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Loading attendance history...
                    </TableCell>
                  </TableRow>
                ) : attendanceHistory.length > 0 ? (
                  attendanceHistory.map((record: any) => (
                    <TableRow key={record.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{record.date}</TableCell>
                      <TableCell className="text-muted-foreground">{record.exactDate}</TableCell>
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
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No attendance history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </MemberLayout>
  );
}
