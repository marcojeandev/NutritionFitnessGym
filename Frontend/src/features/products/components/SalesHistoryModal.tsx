// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { productService, Paycheck } from '@/services/product.service';
// import { toast } from 'sonner';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogTrigger,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { 
//   History, 
//   Search,
//   CreditCard,
//   Banknote,
//   MoreHorizontal,
//   Edit,
//   Trash2
// } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from '@/components/ui/badge';
// import { cn } from '@/lib/utils';

// function SalesHistoryRow({ record }: { record: Paycheck }) {
//   const queryClient = useQueryClient();
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editForm, setEditForm] = useState({
//     payment_status: record.payment_status || 'paid',
//     payment_type: record.payment_type || 'cash',
//     transaction_id: record.transaction_id || ''
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: number) => productService.deletePaycheck(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['sales-history'] });
//       toast.success('Record deleted successfully');
//     },
//     onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to delete record')
//   });

//   const updateMutation = useMutation({
//     mutationFn: (data: Partial<Paycheck>) => productService.updatePaycheck(record.id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['sales-history'] });
//       toast.success('Record updated successfully');
//       setIsEditOpen(false);
//     },
//     onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update record')
//   });

//   const handleDelete = () => {
//     if (window.confirm('Are you sure you want to delete this sales record? This action cannot be undone.')) {
//       deleteMutation.mutate(record.id);
//     }
//   };

//   const handleUpdate = (e: React.FormEvent) => {
//     e.preventDefault();
//     updateMutation.mutate({
//       payment_status: editForm.payment_status,
//       payment_type: editForm.payment_type as 'cash' | 'gcash',
//       transaction_id: editForm.payment_type === 'gcash' ? editForm.transaction_id : null
//     });
//   };

//   return (
//     <>
//       <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
//         <TableCell className="text-muted-foreground text-xs">
//           {new Date(record.created_at).toLocaleString()}
//         </TableCell>
//         <TableCell className="font-mono text-xs text-emerald-500/70">
//           {record.or_number || 'N/A'}
//         </TableCell>
//         <TableCell className="font-medium">{record.product?.name || 'Unknown Product'}</TableCell>
//         <TableCell>{record.quantity}</TableCell>
//         <TableCell className="font-bold">₱{Number(record.total_price).toLocaleString()}</TableCell>
//         <TableCell>
//           <div className="flex flex-col gap-0.5">
//             <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
//               {record.payment_type === 'gcash' ? <CreditCard className="size-3 text-[#007DFE]" /> : <Banknote className="size-3 text-emerald-500" />}
//               <span className="capitalize">{record.payment_type}</span>
//             </span>
//             {record.payment_type === 'gcash' && record.transaction_id && (
//               <span className="text-[10px] text-white/40 font-mono">
//                 Ref: {record.transaction_id}
//               </span>
//             )}
//           </div>
//         </TableCell>
//         <TableCell>
//           <Badge variant="outline" className={cn(
//             "uppercase tracking-wider font-bold text-[9px]",
//             record.payment_status === 'paid' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10" : 
//             record.payment_status === 'failed' ? "border-red-500/20 text-red-500 bg-red-500/10" :
//             "border-yellow-500/20 text-yellow-500 bg-yellow-500/10"
//           )}>
//             {record.payment_status}
//           </Badge>
//         </TableCell>
//         <TableCell>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
//                 <span className="sr-only">Open menu</span>
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="matte-surface border-white/10">
//               <DropdownMenuLabel>Actions</DropdownMenuLabel>
//               <DropdownMenuSeparator className="bg-white/10" />
//               <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer gap-2">
//                 <Edit className="h-4 w-4" /> Edit Record
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:text-destructive gap-2">
//                 <Trash2 className="h-4 w-4" /> Delete Record
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </TableCell>
//       </TableRow>

//       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//         <DialogContent className="sm:max-w-[425px] matte-surface border-white/10">
//           <DialogHeader>
//             <DialogTitle>Edit Sales Record</DialogTitle>
//             <DialogDescription>
//               Update payment status and details for OR {record.or_number}.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleUpdate} className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label>Payment Status</Label>
//               <Select 
//                 value={editForm.payment_status} 
//                 onValueChange={(value) => setEditForm({ ...editForm, payment_status: value })}
//               >
//                 <SelectTrigger className="bg-white/5 border-white/10">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="matte-surface border-white/10">
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="paid">Paid</SelectItem>
//                   <SelectItem value="failed">Failed</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
            
//             <div className="space-y-2">
//               <Label>Payment Type</Label>
//               <Select 
//                 value={editForm.payment_type} 
//                 onValueChange={(value) => setEditForm({ ...editForm, payment_type: value as 'cash' | 'gcash' })}
//               >
//                 <SelectTrigger className="bg-white/5 border-white/10">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="matte-surface border-white/10">
//                   <SelectItem value="cash">Cash</SelectItem>
//                   <SelectItem value="gcash">GCash</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {editForm.payment_type === 'gcash' && (
//               <div className="space-y-2">
//                 <Label>Transaction / Reference ID</Label>
//                 <Input 
//                   value={editForm.transaction_id} 
//                   onChange={(e) => setEditForm({ ...editForm, transaction_id: e.target.value })}
//                   placeholder="e.g. 10023456789"
//                   className="bg-white/5 border-white/10"
//                 />
//               </div>
//             )}
            
//             <DialogFooter>
//               <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
//               <Button type="submit" disabled={updateMutation.isPending}>
//                 {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// export function SalesHistoryModal() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   const { data: paychecks = [], isLoading } = useQuery({
//     queryKey: ['sales-history'],
//     queryFn: productService.getPaychecks,
//     enabled: isOpen
//   });

//   const filteredHistory = paychecks.filter(p => 
//     p.or_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     p.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
//   ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl gap-2">
//           <History className="size-4" />
//           Sales History
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-5xl matte-surface border-white/10 max-h-[85vh] flex flex-col">
//         <DialogHeader>
//           <DialogTitle>Sales History</DialogTitle>
//           <DialogDescription>
//             View and manage past product transactions and POS records.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="flex-1 overflow-auto mt-4 pr-2 flex flex-col gap-4">
//           <div className="relative w-full max-w-sm">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
//             <Input 
//               placeholder="Search OR Number, Product, Ref..." 
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9 bg-white/5 border-white/10 rounded-xl"
//             />
//           </div>

//           <div className="rounded-xl border border-white/5 overflow-hidden">
//             <Table>
//               <TableHeader className="bg-white/5 hover:bg-white/5">
//                 <TableRow className="border-white/5">
//                   <TableHead>Date</TableHead>
//                   <TableHead>OR Number</TableHead>
//                   <TableHead>Product</TableHead>
//                   <TableHead>Qty</TableHead>
//                   <TableHead>Total Amount</TableHead>
//                   <TableHead>Payment</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="w-[80px]">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoading ? (
//                   <TableRow>
//                     <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading sales history...</TableCell>
//                   </TableRow>
//                 ) : filteredHistory.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No sales history found.</TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredHistory.map((record) => (
//                     <SalesHistoryRow key={record.id} record={record} />
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, Paycheck } from '@/services/product.service';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  History, 
  Search,
  CreditCard,
  Banknote,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Receipt
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Receipt View Component
function ReceiptView({ record, onClose }: { record: Paycheck; onClose: () => void }) {
  // Calculate total from items if available
  const totalAmount = record.items 
    ? record.items.reduce((sum, item) => sum + (item.price_at_sale * item.quantity), 0)
    : record.total_price;

  return (
    <DialogContent className="sm:max-w-[500px] matte-surface border-white/10 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-2">
          <Receipt className="size-5" />
          Receipt
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground font-mono">{record.or_number}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(record.created_at).toLocaleString()}
          </p>
          <p className="text-sm font-medium pt-2">
            Customer: {record.paid_by_name || 'Walk-in Customer'}
          </p>
          <p className="text-xs text-muted-foreground">
            Cashier ID: #{record.sold_by}
          </p>
        </div>
        
        <Separator className="bg-white/10" />
        
        {/* Products List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {record.items && record.items.length > 0 ? (
            record.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1">
                <div className="flex-1">
                  <span className="font-medium">{item.quantity}x</span>{' '}
                  <span className="text-muted-foreground">{item.product?.name || `Product #${item.product_id}`}</span>
                </div>
                <div className="text-right font-bold">
                  ₱{(item.price_at_sale * item.quantity).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-between text-sm">
              <span>1x {record.product?.name || 'Product'}</span>
              <span className="font-bold">₱{Number(totalAmount).toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <Separator className="bg-white/10" />
        
        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">₱{Number(totalAmount).toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Payment Method</span>
            <span className="uppercase flex items-center gap-1">
              {record.payment_type === 'gcash' ? <CreditCard className="size-3" /> : <Banknote className="size-3" />}
              {record.payment_type}
            </span>
          </div>
          
          {record.payment_type === 'gcash' && record.transaction_id && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Reference No.</span>
              <span className="font-mono">{record.transaction_id}</span>
            </div>
          )}
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Status</span>
            <Badge variant="outline" className={cn(
              "text-[10px]",
              record.payment_status === 'paid' ? "border-emerald-500/20 text-emerald-500" : 
              record.payment_status === 'failed' ? "border-red-500/20 text-red-500" :
              "border-yellow-500/20 text-yellow-500"
            )}>
              {record.payment_status?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button onClick={onClose} className="w-full rounded-xl">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Individual Row Component
// function SalesHistoryRow({ record }: { record: Paycheck }) {
//   const queryClient = useQueryClient();
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [editForm, setEditForm] = useState({
//     payment_status: record.payment_status || 'paid',
//     payment_type: record.payment_type || 'cash',
//     transaction_id: record.transaction_id || ''
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: number) => productService.deletePaycheck(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['sales-history'] });
//       toast.success('Record deleted successfully');
//     },
//     onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to delete record')
//   });

//   const updateMutation = useMutation({
//     mutationFn: (data: Partial<Paycheck>) => productService.updatePaycheck(record.id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['sales-history'] });
//       toast.success('Record updated successfully');
//       setIsEditOpen(false);
//     },
//     onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update record')
//   });

//   const handleDelete = () => {
//     if (window.confirm('Are you sure you want to delete this sales record? This action cannot be undone.')) {
//       deleteMutation.mutate(record.id);
//     }
//   };

//   const handleUpdate = (e: React.FormEvent) => {
//     e.preventDefault();
//     updateMutation.mutate({
//       payment_status: editForm.payment_status,
//       payment_type: editForm.payment_type as 'cash' | 'gcash',
//       transaction_id: editForm.payment_type === 'gcash' ? editForm.transaction_id : null
//     });
//   };

//   // Calculate total from items or use total_price
//   const totalAmount = record.items 
//     ? record.items.reduce((sum, item) => sum + (item.price_at_sale * item.quantity), 0)
//     : record.total_price;

//   return (
//     <>
//       <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
//         <TableCell className="text-muted-foreground text-xs">
//           {new Date(record.created_at).toLocaleString()}
//         </TableCell>
//         <TableCell className="font-mono text-xs text-emerald-500/70">
//           {record.or_number || 'N/A'}
//         </TableCell>
//         <TableCell className="text-muted-foreground">
//           {record.items?.length || 1} item(s)
//         </TableCell>
//         <TableCell className="font-bold">₱{Number(totalAmount).toLocaleString()}</TableCell>
//         <TableCell>
//           <div className="flex flex-col gap-0.5">
//             <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
//               {record.payment_type === 'gcash' ? <CreditCard className="size-3 text-[#007DFE]" /> : <Banknote className="size-3 text-emerald-500" />}
//               <span className="capitalize">{record.payment_type}</span>
//             </span>
//             {record.payment_type === 'gcash' && record.transaction_id && (
//               <span className="text-[10px] text-white/40 font-mono">
//                 Ref: {record.transaction_id}
//               </span>
//             )}
//           </div>
//         </TableCell>
//         <TableCell>
//           <Badge variant="outline" className={cn(
//             "uppercase tracking-wider font-bold text-[9px]",
//             record.payment_status === 'paid' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10" : 
//             record.payment_status === 'failed' ? "border-red-500/20 text-red-500 bg-red-500/10" :
//             "border-yellow-500/20 text-yellow-500 bg-yellow-500/10"
//           )}>
//             {record.payment_status}
//           </Badge>
//         </TableCell>
//         <TableCell>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
//                 <span className="sr-only">Open menu</span>
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="matte-surface border-white/10">
//               <DropdownMenuLabel>Actions</DropdownMenuLabel>
//               <DropdownMenuSeparator className="bg-white/10" />
//               <DropdownMenuItem onClick={() => setShowReceipt(true)} className="cursor-pointer gap-2">
//                 <Eye className="h-4 w-4" /> View Receipt
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer gap-2">
//                 <Edit className="h-4 w-4" /> Edit Status
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:text-destructive gap-2">
//                 <Trash2 className="h-4 w-4" /> Delete Record
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </TableCell>
//       </TableRow>

//       {/* Edit Dialog */}
//       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//         <DialogContent className="sm:max-w-[425px] matte-surface border-white/10">
//           <DialogHeader>
//             <DialogTitle>Edit Sales Record</DialogTitle>
//             <DialogDescription>
//               Update payment status and details for OR {record.or_number}.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleUpdate} className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label>Payment Status</Label>
//               <Select 
//                 value={editForm.payment_status} 
//                 onValueChange={(value) => setEditForm({ ...editForm, payment_status: value })}
//               >
//                 <SelectTrigger className="bg-white/5 border-white/10">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="matte-surface border-white/10">
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="paid">Paid</SelectItem>
//                   <SelectItem value="failed">Failed</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
            
//             <div className="space-y-2">
//               <Label>Payment Type</Label>
//               <Select 
//                 value={editForm.payment_type} 
//                 onValueChange={(value) => setEditForm({ ...editForm, payment_type: value as 'cash' | 'gcash' })}
//               >
//                 <SelectTrigger className="bg-white/5 border-white/10">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="matte-surface border-white/10">
//                   <SelectItem value="cash">Cash</SelectItem>
//                   <SelectItem value="gcash">GCash</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {editForm.payment_type === 'gcash' && (
//               <div className="space-y-2">
//                 <Label>Transaction / Reference ID</Label>
//                 <Input 
//                   value={editForm.transaction_id} 
//                   onChange={(e) => setEditForm({ ...editForm, transaction_id: e.target.value })}
//                   placeholder="e.g. 10023456789"
//                   className="bg-white/5 border-white/10"
//                 />
//               </div>
//             )}
            
//             <DialogFooter>
//               <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
//               <Button type="submit" disabled={updateMutation.isPending}>
//                 {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Receipt View Dialog */}
//       <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
//         <ReceiptView record={record} onClose={() => setShowReceipt(false)} />
//       </Dialog>
//     </>
//   );
// }
// Individual Row Component
// function SalesHistoryRow({ record }: { record: Paycheck }) {
//   const queryClient = useQueryClient();
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [editForm, setEditForm] = useState<{
//     payment_status: string;
//     payment_type: string;
//     transaction_id: string;
//   }>({
//     payment_status: record.payment_status || 'paid',
//     payment_type: record.payment_type || 'cash',
//     transaction_id: record.transaction_id || ''
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: number) => productService.deletePaycheck(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['sales-history'] });
//       toast.success('Record deleted successfully');
//     },
//     onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to delete record')
//   });

//   const updateMutation = useMutation({
//     mutationFn: (data: Partial<Paycheck>) => productService.updatePaycheck(record.id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['sales-history'] });
//       toast.success('Record updated successfully');
//       setIsEditOpen(false);
//     },
//     onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update record')
//   });

//   const handleDelete = () => {
//     if (window.confirm('Are you sure you want to delete this sales record? This action cannot be undone.')) {
//       deleteMutation.mutate(record.id);
//     }
//   };

//   const handleUpdate = (e: React.FormEvent) => {
//     e.preventDefault();
//     updateMutation.mutate({
//       payment_status: editForm.payment_status as 'pending' | 'paid' | 'failed',
//       payment_type: editForm.payment_type as 'cash' | 'gcash',
//       transaction_id: editForm.payment_type === 'gcash' ? editForm.transaction_id : null
//     });
//   };

//   // Calculate total from items or use total_price
//   let totalAmount = 0;
//   if (record.items && record.items.length > 0) {
//     totalAmount = record.items.reduce((sum, item) => sum + (item.price_at_sale * item.quantity), 0);
//   } else if (record.total_price) {
//     totalAmount = record.total_price;
//   }

//   return (
//     <>
//       <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
//         <TableCell className="text-muted-foreground text-xs">
//           {new Date(record.created_at).toLocaleString()}
//         </TableCell>
//         <TableCell className="font-mono text-xs text-emerald-500/70">
//           {record.or_number || 'N/A'}
//         </TableCell>
//         <TableCell className="text-muted-foreground">
//           {record.items?.length || 1} item(s)
//         </TableCell>
//         <TableCell className="font-bold">₱{Number(totalAmount).toLocaleString()}</TableCell>
//         <TableCell>
//           <div className="flex flex-col gap-0.5">
//             <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
//               {record.payment_type === 'gcash' ? <CreditCard className="size-3 text-[#007DFE]" /> : <Banknote className="size-3 text-emerald-500" />}
//               <span className="capitalize">{record.payment_type}</span>
//             </span>
//             {record.payment_type === 'gcash' && record.transaction_id && (
//               <span className="text-[10px] text-white/40 font-mono">
//                 Ref: {record.transaction_id}
//               </span>
//             )}
//           </div>
//         </TableCell>
//         <TableCell>
//           <Badge variant="outline" className={cn(
//             "uppercase tracking-wider font-bold text-[9px]",
//             record.payment_status === 'paid' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10" : 
//             record.payment_status === 'failed' ? "border-red-500/20 text-red-500 bg-red-500/10" :
//             "border-yellow-500/20 text-yellow-500 bg-yellow-500/10"
//           )}>
//             {record.payment_status}
//           </Badge>
//         </TableCell>
//         <TableCell>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
//                 <span className="sr-only">Open menu</span>
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="matte-surface border-white/10">
//               <DropdownMenuLabel>Actions</DropdownMenuLabel>
//               <DropdownMenuSeparator className="bg-white/10" />
//               <DropdownMenuItem onClick={() => setShowReceipt(true)} className="cursor-pointer gap-2">
//                 <Eye className="h-4 w-4" /> View Receipt
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer gap-2">
//                 <Edit className="h-4 w-4" /> Edit Status
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:text-destructive gap-2">
//                 <Trash2 className="h-4 w-4" /> Delete Record
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </TableCell>
//       </TableRow>

//       {/* Edit Dialog */}
//       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//         <DialogContent className="sm:max-w-[425px] matte-surface border-white/10">
//           <DialogHeader>
//             <DialogTitle>Edit Sales Record</DialogTitle>
//             <DialogDescription>
//               Update payment status and details for OR {record.or_number}.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleUpdate} className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label>Payment Status</Label>
//               <Select 
//                 value={editForm.payment_status} 
//                 onValueChange={(value) => setEditForm({ ...editForm, payment_status: value })}
//               >
//                 <SelectTrigger className="bg-white/5 border-white/10">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="matte-surface border-white/10">
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="paid">Paid</SelectItem>
//                   <SelectItem value="failed">Failed</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
            
//             <div className="space-y-2">
//               <Label>Payment Type</Label>
//               <Select 
//                 value={editForm.payment_type} 
//                 onValueChange={(value) => setEditForm({ ...editForm, payment_type: value })}
//               >
//                 <SelectTrigger className="bg-white/5 border-white/10">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="matte-surface border-white/10">
//                   <SelectItem value="cash">Cash</SelectItem>
//                   <SelectItem value="gcash">GCash</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {editForm.payment_type === 'gcash' && (
//               <div className="space-y-2">
//                 <Label>Transaction / Reference ID</Label>
//                 <Input 
//                   value={editForm.transaction_id} 
//                   onChange={(e) => setEditForm({ ...editForm, transaction_id: e.target.value })}
//                   placeholder="e.g. 10023456789"
//                   className="bg-white/5 border-white/10"
//                 />
//               </div>
//             )}
            
//             <DialogFooter>
//               <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
//               <Button type="submit" disabled={updateMutation.isPending}>
//                 {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Receipt View Dialog */}
//       <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
//         <ReceiptView record={record} onClose={() => setShowReceipt(false)} />
//       </Dialog>
//     </>
//   );
// }
// Individual Row Component
function SalesHistoryRow({ record }: { record: Paycheck }) {
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [editForm, setEditForm] = useState<{
    payment_status: string;
    payment_type: string;
    transaction_id: string;
    products: Array<{
      product_id: number;
      quantity: number;
      price_at_sale: number;
      product_name?: string;
    }>;
  }>({
    payment_status: record.payment_status || 'paid',
    payment_type: record.payment_type || 'cash',
    transaction_id: record.transaction_id || '',
    products: record.items?.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_sale: item.price_at_sale,
      product_name: item.product?.name
    })) || []
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-for-edit'],
    queryFn: productService.getAllProducts
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deletePaycheck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
      toast.success('Record deleted successfully');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to delete record')
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Paycheck>) => productService.updatePaycheck(record.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
      toast.success('Record updated successfully');
      setIsEditOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update record')
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this sales record? This action cannot be undone.')) {
      deleteMutation.mutate(record.id);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: any = {
      payment_status: editForm.payment_status,
      payment_type: editForm.payment_type,
    };
    
    if (editForm.payment_type === 'gcash') {
      updateData.transaction_id = editForm.transaction_id;
    } else {
      updateData.transaction_id = null;
    }
    
    updateData.products = editForm.products;
    
    updateMutation.mutate(updateData);
  };

  const addProductToEdit = () => {
    setEditForm(prev => ({
      ...prev,
      products: [...prev.products, { product_id: 0, quantity: 1, price_at_sale: 0 }]
    }));
  };

  const removeProductFromEdit = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const updateProductInEdit = (index: number, field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      products: prev.products.map((p, i) => {
        if (i === index) {
          const updated = { ...p, [field]: value };
          
          // Auto-compute: when product_id changes, auto-fill price_at_sale
          if (field === 'product_id') {
            const selectedProduct = products.find((prod: any) => prod.id === value);
            if (selectedProduct) {
              updated.price_at_sale = selectedProduct.price;
              updated.product_name = selectedProduct.name;
            }
          }
          
          return updated;
        }
        return p;
      })
    }));
  };

  // Get product price helper
  const getProductPrice = (productId: number) => {
    const product = products.find((p: any) => p.id === productId);
    return product?.price || 0;
  };

  // Calculate total amount for display
  const calculateItemTotal = (productId: number, quantity: number) => {
    const price = getProductPrice(productId);
    return price * quantity;
  };

  // Calculate total amount from edit form
  const calculateEditTotal = () => {
    return editForm.products.reduce((sum, p) => {
      const price = getProductPrice(p.product_id);
      return sum + (price * p.quantity);
    }, 0);
  };

  // Calculate original total amount for display
  let originalTotalAmount = 0;
  if (record.items && record.items.length > 0) {
    originalTotalAmount = record.items.reduce((sum, item) => sum + (item.price_at_sale * item.quantity), 0);
  } else if (record.total_price) {
    originalTotalAmount = record.total_price;
  }

  return (
    <>
      <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
        <TableCell className="text-muted-foreground text-xs">
          {new Date(record.created_at).toLocaleString()}
        </TableCell>
        <TableCell className="font-mono text-xs text-emerald-500/70">
          {record.or_number || 'N/A'}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {record.items?.length || 1} item(s)
        </TableCell>
        <TableCell className="font-bold">₱{Number(originalTotalAmount).toLocaleString()}</TableCell>
        <TableCell>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {record.payment_type === 'gcash' ? <CreditCard className="size-3 text-[#007DFE]" /> : <Banknote className="size-3 text-emerald-500" />}
              <span className="capitalize">{record.payment_type}</span>
            </span>
            {record.payment_type === 'gcash' && record.transaction_id && (
              <span className="text-[10px] text-white/40 font-mono">
                Ref: {record.transaction_id}
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn(
            "uppercase tracking-wider font-bold text-[9px]",
            record.payment_status === 'paid' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10" : 
            record.payment_status === 'failed' ? "border-red-500/20 text-red-500 bg-red-500/10" :
            "border-yellow-500/20 text-yellow-500 bg-yellow-500/10"
          )}>
            {record.payment_status}
          </Badge>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="matte-surface border-white/10">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => setShowReceipt(true)} className="cursor-pointer gap-2">
                <Eye className="h-4 w-4" /> View Receipt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer gap-2">
                <Edit className="h-4 w-4" /> Edit Record
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:text-destructive gap-2">
                <Trash2 className="h-4 w-4" /> Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Edit Dialog with Auto-Compute */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[650px] matte-surface border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sales Record</DialogTitle>
            <DialogDescription>
              Update payment status, products, and details for OR {record.or_number}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            {/* Products Section */}
            <div className="space-y-3">
              <Label>Products</Label>
              <div className="space-y-2">
                {editForm.products.map((product, idx) => {
                  const productPrice = getProductPrice(product.product_id);
                  const itemTotal = productPrice * product.quantity;
                  
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Select 
                          value={product.product_id.toString()} 
                          onValueChange={(value) => updateProductInEdit(idx, 'product_id', parseInt(value))}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent className="matte-surface border-white/10">
                            {products.map((p: any) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name} - ₱{p.price.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          value={product.quantity}
                          onChange={(e) => updateProductInEdit(idx, 'quantity', parseInt(e.target.value))}
                          placeholder="Qty"
                          className="bg-white/5 border-white/10"
                          min="1"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input 
                          type="number" 
                          value={productPrice}
                          readOnly
                          disabled
                          className="bg-white/10 border-white/10 text-muted-foreground"
                          placeholder="Price"
                        />
                      </div>
                      <div className="col-span-1 text-right font-bold text-emerald-500">
                        ₱{itemTotal.toLocaleString()}
                      </div>
                      <div className="col-span-1">
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeProductFromEdit(idx)}
                          className="w-full"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addProductToEdit} className="w-full">
                + Add Product
              </Button>
              
              {/* New Total Display */}
              <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-2">
                <span className="text-sm font-medium text-muted-foreground">New Total:</span>
                <span className="text-xl font-bold text-primary">₱{calculateEditTotal().toLocaleString()}</span>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Payment Status */}
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select 
                value={editForm.payment_status} 
                onValueChange={(value) => setEditForm({ ...editForm, payment_status: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="matte-surface border-white/10">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Payment Type */}
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select 
                value={editForm.payment_type} 
                onValueChange={(value) => setEditForm({ ...editForm, payment_type: value, transaction_id: value === 'cash' ? '' : editForm.transaction_id })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="matte-surface border-white/10">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* GCash Transaction ID */}
            {editForm.payment_type === 'gcash' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Transaction / Reference ID <span className="text-destructive">*</span></Label>
                <Input 
                  value={editForm.transaction_id} 
                  onChange={(e) => setEditForm({ ...editForm, transaction_id: e.target.value })}
                  placeholder="e.g. 10023456789"
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt View Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <ReceiptView record={record} onClose={() => setShowReceipt(false)} />
      </Dialog>
    </>
  );
}


// Main Modal Component
export function SalesHistoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: paychecks = [], isLoading } = useQuery({
    queryKey: ['sales-history'],
    queryFn: () => productService.getPaychecks(),
    enabled: isOpen
  });

  const filteredHistory = paychecks.filter((p: Paycheck) => 
    p.or_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.paid_by_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a: Paycheck, b: Paycheck) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl gap-2">
          <History className="size-4" />
          Sales History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl matte-surface border-white/10 max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sales History</DialogTitle>
          <DialogDescription>
            View and manage past product transactions and POS records.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4 pr-2 flex flex-col gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search OR Number, Customer, Ref..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 rounded-xl"
            />
          </div>

          <div className="rounded-xl border border-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5 hover:bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead>Date</TableHead>
                  <TableHead>OR Number</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading sales history...
                    </TableCell>
                  </TableRow>
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No sales history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((record: Paycheck) => (
                    <SalesHistoryRow key={record.id} record={record} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}