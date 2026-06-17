import React, { useState } from 'react';
import { CashierLayout } from '@/components/layout/CashierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Calendar, Clock, Banknote, User, Minus } from 'lucide-react';

export default function CashierCourtRentals() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [duration, setDuration] = useState<number | string>(1);
  const [paymentType, setPaymentType] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [paymentReceived, setPaymentReceived] = useState(false);
  
  // Dummy data for UI demonstration
  const [rentals, setRentals] = useState([
    { id: 1, name: 'John Doe', date: '2023-11-01', time: '14:00 - 15:00', duration: 1, type: 'Day (7am-6pm)', total: 150, status: 'Completed' },
    { id: 2, name: 'Jane Smith', date: '2023-11-02', time: '19:00 - 21:00', duration: 2, type: 'Night (6pm-10pm)', total: 400, status: 'Upcoming' },
  ]);

  return (
    <CashierLayout>
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
            <DialogContent className="matte-surface border-white/10 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Book Basketball Court</DialogTitle>
                <DialogDescription>
                  Reserve the court and process payment. (UI Only)
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Renter Name</Label>
                  <Input placeholder="Enter full name" className="bg-white/5 border-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <Input type="date" className="bg-white/5 border-white/10" />
                  </div>
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
                        onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                        className="bg-white/5 border-white/10 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none appearance-none" 
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
                </div>
                <div className="grid gap-2">
                  <Label>Time Slot Type</Label>
                  <Select defaultValue="day">
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="matte-surface border-white/10">
                      <SelectItem value="day">Day Time (7am-6pm) - ₱150/hr</SelectItem>
                      <SelectItem value="night">Night Time (6pm-10pm) - ₱200/hr</SelectItem>
                    </SelectContent>
                  </Select>
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
                      id="payment-received-cashier" 
                      checked={paymentReceived} 
                      onCheckedChange={(checked) => setPaymentReceived(checked as boolean)} 
                      className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                    />
                    <label
                      htmlFor="payment-received-cashier"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white"
                    >
                      I confirm that the exact cash amount has been received.
                    </label>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span className="text-xl font-bold text-emerald-500">₱0.00</span>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsOpen(false)} className="rounded-xl w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Confirm Booking
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <Calendar className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bookings Today</p>
                <h3 className="text-2xl font-bold">3</h3>
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
                <h3 className="text-2xl font-bold">₱850.00</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <Clock className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours Booked</p>
                <h3 className="text-2xl font-bold">5 hrs</h3>
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
                    <TableHead className="text-muted-foreground">Rate Type</TableHead>
                    <TableHead className="text-right text-muted-foreground">Total</TableHead>
                    <TableHead className="text-right text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentals.map((rental) => (
                    <TableRow key={rental.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <span className="font-medium">{rental.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{rental.date}</TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{rental.time}</span>
                        <span className="text-xs text-muted-foreground block">({rental.duration} hrs)</span>
                      </TableCell>
                      <TableCell><span className="text-sm text-muted-foreground">{rental.type}</span></TableCell>
                      <TableCell className="text-right font-medium">₱{rental.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-md ${rental.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                          {rental.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </CashierLayout>
  );
}
