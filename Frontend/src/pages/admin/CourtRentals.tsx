import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Calendar as CalendarIcon, Clock, Banknote, User, Minus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationService, Reservation } from '@/services/reservation.service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function AdminCourtRentals() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [fullname, setFullname] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');
  const [duration, setDuration] = useState<number | string>(1);
  const [rateType, setRateType] = useState('day');
  const [paymentType, setPaymentType] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [paymentReceived, setPaymentReceived] = useState(false);

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationService.getReservations
  });

  const createMutation = useMutation({
    mutationFn: reservationService.createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Court reservation created successfully!');
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    }
  });

  const resetForm = () => {
    setFullname('');
    setDate(new Date());
    setHour('07');
    setMinute('00');
    setAmpm('AM');
    setDuration(1);
    setRateType('day');
    setPaymentType('cash');
    setTransactionId('');
    setPaymentReceived(false);
  };

  // Compute Total
  const rate = rateType === 'day' ? 150 : 200;
  const totalAmount = rate * (Number(duration) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (paymentType === 'cash' && !paymentReceived) {
      toast.error('Please confirm that the cash payment has been received.');
      return;
    }
    
    // Convert 12-hour AM/PM to 24-hour time string
    let h24 = parseInt(hour, 10);
    if (ampm === 'PM' && h24 !== 12) h24 += 12;
    if (ampm === 'AM' && h24 === 12) h24 = 0;
    const timeStart24 = `${h24.toString().padStart(2, '0')}:${minute}`;

    // Compute time_end based on time_start and duration
    const durationHours = Number(duration) || 1;
    const endDate = new Date();
    endDate.setHours(h24 + durationHours, parseInt(minute, 10));
    const timeEnd24 = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    createMutation.mutate({
      fullname,
      date: format(date, 'yyyy-MM-dd'),
      time_start: timeStart24,
      time_end: timeEnd24,
      payment_type: paymentType as 'cash' | 'gcash',
      reservation_amount: totalAmount,
      payment_amount: totalAmount,
      transaction_id: paymentType === 'gcash' ? transactionId : undefined,
      or_number: paymentType === 'cash' ? `OR-${Date.now()}` : undefined,
      payment_status: 'paid', // assume paid upfront
      reservation_status: 'active',
    });
  };

  const filteredReservations = reservations.filter((r: Reservation) => 
    r.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter((r: Reservation) => r.date === today);
  const bookingsToday = todayReservations.length;
  const revenueToday = todayReservations.reduce((sum: number, r: Reservation) => sum + Number(r.payment_amount), 0);
  
  // Hours Booked Today
  const hoursToday = todayReservations.reduce((sum: number, r: Reservation) => {
    const start = new Date(`1970-01-01T${r.time_start}Z`);
    const end = new Date(`1970-01-01T${r.time_end}Z`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + diffHours;
  }, 0);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Basketball Court Rentals</h1>
            <p className="text-muted-foreground mt-1">Manage court bookings and payments.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20 bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="size-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="matte-surface border-white/10 sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Book Basketball Court</DialogTitle>
                <DialogDescription>
                  Reserve the court and process payment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Renter Name <span className="text-destructive">*</span></Label>
                  <Input value={fullname} onChange={e => setFullname(e.target.value)} placeholder="Enter full name" className="bg-white/5 border-white/10" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Date <span className="text-destructive">*</span></Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 text-white",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 matte-surface border-white/10 min-w-[280px] z-50"
                        onInteractOutside={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate);
                            if (newDate) {
                              setIsCalendarOpen(false);
                            }
                          }}
                          className="bg-background text-foreground"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>Start Time <span className="text-destructive">*</span></Label>
                    <div className="flex items-center space-x-2">
                      <Select value={hour} onValueChange={setHour}>
                        <SelectTrigger className="bg-white/5 border-white/10 w-20">
                          <SelectValue placeholder="HH" />
                        </SelectTrigger>
                        <SelectContent className="matte-surface border-white/10 h-48">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                            const val = h.toString().padStart(2, '0');
                            return <SelectItem key={val} value={val}>{val}</SelectItem>;
                          })}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">:</span>
                      <Select value={minute} onValueChange={setMinute}>
                        <SelectTrigger className="bg-white/5 border-white/10 w-20">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent className="matte-surface border-white/10 h-32">
                          {['00', '15', '30', '45'].map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={ampm} onValueChange={setAmpm}>
                        <SelectTrigger className="bg-white/5 border-white/10 w-24">
                          <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent className="matte-surface border-white/10">
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Duration (Hours)</Label>
                    <div className="flex items-center space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white shrink-0"
                        onClick={() => setDuration(Math.max(1, (Number(duration) || 1) - 1))}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <Input 
                        type="number" 
                        min="1" 
                        value={duration} 
                        onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))} 
                        className="bg-white/5 border-white/10 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none appearance-none" 
                        required 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white shrink-0"
                        onClick={() => setDuration((Number(duration) || 0) + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Time Slot Type</Label>
                    <Select value={rateType} onValueChange={setRateType}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="matte-surface border-white/10">
                        <SelectItem value="day">Day Time (7am-6pm) - ₱150/hr</SelectItem>
                        <SelectItem value="night">Night Time (6pm-10pm) - ₱200/hr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="matte-surface border-white/10">
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="gcash">GCash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentType === 'gcash' && (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                    <Label>GCash Transaction ID <span className="text-destructive">*</span></Label>
                    <Input value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="e.g. 10023456789" className="bg-white/5 border-white/10" required />
                  </div>
                )}

                {paymentType === 'cash' && (
                  <div className="flex items-center space-x-2 p-4 rounded-xl border border-white/10 bg-white/5 animate-in fade-in slide-in-from-top-2">
                    <Checkbox 
                      id="payment-received" 
                      checked={paymentReceived} 
                      onCheckedChange={(checked) => setPaymentReceived(checked as boolean)} 
                      className="border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                    />
                    <label
                      htmlFor="payment-received"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white"
                    >
                      I confirm that the exact cash amount has been received.
                    </label>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex justify-between items-center mt-2">
                  <span className="text-sm font-semibold text-orange-500/80">Total Amount:</span>
                  <span className="text-xl font-bold text-orange-400">₱{totalAmount.toFixed(2)}</span>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={createMutation.isPending} className="rounded-xl w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                    {createMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <CalendarIcon className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bookings Today</p>
                <h3 className="text-2xl font-bold">{bookingsToday}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Banknote className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Court Revenue Today</p>
                <h3 className="text-2xl font-bold">₱{revenueToday.toFixed(2)}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <Clock className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours Booked Today</p>
                <h3 className="text-2xl font-bold">{hoursToday} hrs</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-white/5">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-0">
            <CardTitle>Booking Log</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search rentals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 rounded-xl h-10" 
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Renter Name</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Time Slot</TableHead>
                    <TableHead className="text-right text-muted-foreground">Total</TableHead>
                    <TableHead className="text-right text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading reservations...</TableCell>
                    </TableRow>
                  ) : filteredReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No reservations found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredReservations.map((rental: Reservation) => (
                      <TableRow key={rental.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <span className="font-medium">{rental.fullname}</span>
                          </div>
                        </TableCell>
                        <TableCell>{rental.date}</TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{rental.time_start} - {rental.time_end}</span>
                        </TableCell>
                        <TableCell className="text-right font-medium">₱{Number(rental.payment_amount).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-md ${rental.reservation_status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                            {rental.reservation_status.charAt(0).toUpperCase() + rental.reservation_status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
