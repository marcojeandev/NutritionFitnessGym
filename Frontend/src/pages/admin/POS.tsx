import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Product } from '@/types/models';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { userService } from '@/services/user.service';
import { SalesHistoryModal } from '@/features/products/components/SalesHistoryModal';
import { cn } from '@/lib/utils';
import { 
  ShoppingCart, 
  History,
  CreditCard,
  Banknote,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper function to get image URL
const getImageUrl = (profile: string | undefined | null): string | null => {
  if (!profile) return null;
  if (profile.startsWith('http')) return profile;
  if (profile.startsWith('/storage')) return `http://localhost:8000${profile}`;
  if (profile.startsWith('products/')) return `http://localhost:8000/storage/${profile}`;
  return `http://localhost:8000/storage/${profile}`;
};

export default function AdminPOS() {
  const [paymentMode, setPaymentMode] = useState<'cash' | 'gcash'>('cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [refNum, setRefNum] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [walkInName, setWalkInName] = useState('Walk-in');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const { data: users = [] } = useQuery({
    queryKey: ['users', 'member'],
    queryFn: () => userService.getAllUsers({ role: 'member' })
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts
  });

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const change = amountTendered ? Math.max(0, parseInt(amountTendered) - cartTotal) : 0;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQ = item.quantity + delta;
          return { ...item, quantity: Math.max(0, newQ) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const orNumber = `OR-${new Date().getTime()}`;
      
      const paidById = isWalkIn ? user!.id : Number(selectedMemberId);
      const paidByName = isWalkIn 
        ? walkInName 
        : users.find((u: any) => u.id === Number(selectedMemberId))?.firstname + ' ' + users.find((u: any) => u.id === Number(selectedMemberId))?.lastname;

      const payload = {
        sold_by: user!.id,
        paid_by: paidById,
        paid_by_name: paidByName,
        payment_type: paymentMode,
        or_number: orNumber,
        transaction_id: paymentMode === 'gcash' ? refNum : null,
        payment_status: 'paid',
        products: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_sale: Number(item.product.price)
        }))
      };

      const response = await productService.submitPaycheck(payload as any);
      return { orNumber, response };
    },
    onSuccess: (data) => {
      toast.success('Transaction completed successfully!');
      
      setReceiptData({
        orNumber: data.orNumber,
        items: [...cart],
        total: cartTotal,
        paymentMode,
        amountTendered: paymentMode === 'cash' ? amountTendered : null,
        change: paymentMode === 'cash' ? change : 0,
        refNum: paymentMode === 'gcash' ? refNum : null,
        customerName: isWalkIn ? walkInName : users.find((u: any) => u.id === Number(selectedMemberId))?.firstname + ' ' + users.find((u: any) => u.id === Number(selectedMemberId))?.lastname,
        date: new Date()
      });
      setShowReceipt(true);

      setCart([]);
      setAmountTendered('');
      setRefNum('');
      setIsCheckoutOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process checkout.');
    }
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Cart is empty.');
      return;
    }
    if (!isWalkIn && !selectedMemberId) {
      toast.error('Please select a member.');
      return;
    }
    if (paymentMode === 'gcash' && !refNum.trim()) {
      toast.error('GCash reference number required.');
      return;
    }
    if (paymentMode === 'cash' && Number(amountTendered) < cartTotal) {
      toast.error('Insufficient amount tendered.');
      return;
    }
    checkoutMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Point of Sale (POS)</h1>
            <p className="text-muted-foreground mt-1">Process direct sales and manage customer cart.</p>
          </div>
          <div className="flex items-center gap-3">
            <SalesHistoryModal />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle>Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map((product: Product) => {
                    const imageUrl = getImageUrl(product.profile);
                    const currentStock = (product.quantity || 0) - (product.sold || 0);
                    
                    return (
                      <div 
                        key={product.id} 
                        onClick={() => addToCart(product)}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all cursor-pointer text-center group"
                      >
                        {/* Product Image - show image if exists, otherwise show tag icon */}
                        <div className="w-full h-24 mb-3 flex items-center justify-center">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={product.name}
                              className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.querySelector('.tag-icon')?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span className={`tag-icon text-5xl ${imageUrl ? 'hidden' : ''}`}>🏷️</span>
                        </div>
                        
                        <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">₱{Number(product.price).toLocaleString()}</p>
                        <p className="text-[10px] text-white/30 mt-1">{currentStock} in stock</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass border-white/5 flex flex-col h-full sticky top-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="size-5" />
                  Current Cart
                </CardTitle>
                <Badge className="bg-primary/20 text-primary">{cart.length} items</Badge>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Cart is empty</div>
                  ) : (
                    cart.map((item) => {
                      const imageUrl = getImageUrl(item.product.profile);
                      return (
                        <div key={item.product.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center">
                              {imageUrl ? (
                                <img 
                                  src={imageUrl} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">🏷️</span>';
                                  }}
                                />
                              ) : (
                                <span className="text-xl">🏷️</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium line-clamp-1 max-w-[120px]">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">₱{Number(item.product.price).toLocaleString()} x {item.quantity}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                              <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-white/10 rounded-l-lg"><Minus className="size-3"/></button>
                              <span className="text-xs px-2 min-w-[20px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-white/10 rounded-r-lg"><Plus className="size-3"/></button>
                            </div>
                            <p className="text-sm font-bold min-w-[60px] text-right">₱{(Number(item.product.price) * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <Separator className="bg-white/5" />
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₱{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-emerald-500">-₱0</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/5 mt-4">
                    <span>Total</span>
                    <span className="text-primary text-xl tracking-tight">₱{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0 space-y-3">
                <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={cart.length === 0} className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                      Process Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] matte-surface border-white/10">
                    <DialogHeader>
                      <DialogTitle>Complete Checkout</DialogTitle>
                      <DialogDescription>
                        Process the payment for the current cart items.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="size-4 text-emerald-500" />
                          <span className="text-sm font-medium">Total Amount Due</span>
                        </div>
                        <span className="text-2xl font-black text-primary">₱{cartTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <form onSubmit={handleCheckout} className="grid gap-4 py-4">
                      
                      <div className="grid gap-3">
                        <div className="flex items-center space-x-2 pb-2">
                          <Checkbox 
                            id="is-walkin" 
                            checked={isWalkIn} 
                            onCheckedChange={(checked) => setIsWalkIn(checked as boolean)}
                            className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                          <label
                            htmlFor="is-walkin"
                            className="text-sm font-medium leading-none cursor-pointer text-muted-foreground"
                          >
                            Walk-in Customer
                          </label>
                        </div>

                        {isWalkIn ? (
                          <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                            <Label htmlFor="walkin-name">Customer Name</Label>
                            <Input
                              id="walkin-name"
                              value={walkInName}
                              onChange={(e) => setWalkInName(e.target.value)}
                              placeholder="Enter name (or leave as Walk-in)"
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                        ) : (
                          <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                            <Label>Select Member</Label>
                            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                              <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Search active member..." />
                              </SelectTrigger>
                              <SelectContent className="matte-surface border-white/10 max-h-[200px]">
                                {users.filter((u: any) => u.status === 'active').map((u: any) => (
                                  <SelectItem key={u.id} value={u.id.toString()}>
                                    {u.firstname} {u.lastname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-3">
                        <Label>Payment Mode</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMode('cash')}
                            className={`h-12 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm font-bold ${
                              paymentMode === 'cash' 
                              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                            }`}
                          >
                            <Banknote className="size-4" />
                            Cash
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMode('gcash')}
                            className={`h-12 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm font-bold ${
                              paymentMode === 'gcash' 
                              ? 'bg-[#007DFE] text-white border-[#007DFE] shadow-[0_0_20px_rgba(0,125,254,0.3)]' 
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                            }`}
                          >
                            <CreditCard className="size-4" />
                            GCash
                          </button>
                        </div>
                      </div>

                      {paymentMode === 'cash' ? (
                        <div className="grid gap-4 animate-in fade-in slide-in-from-top-2">
                          <div className="grid gap-2">
                            <Label htmlFor="tendered">Amount Tendered (₱)</Label>
                            <Input 
                              id="tendered" 
                              type="number"
                              value={amountTendered}
                              onChange={(e) => setAmountTendered(e.target.value)}
                              placeholder="e.g. 4000" 
                              className="bg-white/5 border-white/10 text-lg font-bold h-12" 
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                            <span className="text-sm text-muted-foreground font-medium">Change Due:</span>
                            <span className={cn(
                              "text-xl font-bold",
                              change > 0 ? "text-emerald-500" : "text-white/40"
                            )}>
                              ₱{change.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                          <Label htmlFor="ref">GCash Transaction ID <span className="text-destructive">*</span></Label>
                          <Input id="ref" value={refNum} onChange={e => setRefNum(e.target.value)} placeholder="e.g. 10023456789" className="bg-white/5 border-white/10 h-12" required />
                        </div>
                      )}

                    </form>
                    <DialogFooter>
                      <Button disabled={checkoutMutation.isPending} onClick={handleCheckout} type="submit" className="rounded-xl w-full h-12 text-md font-bold">
                        {checkoutMutation.isPending ? 'Processing...' : 'Confirm Transaction'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                  <DialogContent className="sm:max-w-[425px] matte-surface border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Receipt</DialogTitle>
                    </DialogHeader>
                    {receiptData && (
                      <div className="space-y-4 py-4">
                        <div className="text-center space-y-1">
                          <p className="text-xs text-muted-foreground font-mono">{receiptData.orNumber}</p>
                          <p className="text-xs text-muted-foreground">{receiptData.date.toLocaleString()}</p>
                          <p className="text-sm font-medium pt-2">Customer: {receiptData.customerName}</p>
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                          {receiptData.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.product.name}</span>
                              <span>₱{(Number(item.product.price) * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm font-bold">
                            <span>Total</span>
                            <span>₱{receiptData.total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Payment Method</span>
                            <span className="uppercase">{receiptData.paymentMode}</span>
                          </div>
                          {receiptData.paymentMode === 'cash' ? (
                            <>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Amount Tendered</span>
                                <span>₱{Number(receiptData.amountTendered).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Change</span>
                                <span>₱{receiptData.change.toLocaleString()}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Ref No.</span>
                              <span>{receiptData.refNum}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button onClick={() => setShowReceipt(false)} className="w-full rounded-xl">
                        Done
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button onClick={() => setCart([])} variant="ghost" className="w-full text-muted-foreground hover:bg-white/5 rounded-xl">
                  Clear Cart
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}