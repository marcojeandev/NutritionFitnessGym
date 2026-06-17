import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { User as UserType } from '@/types/models';
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Filter,
  Shield,
  User,
  BadgeCheck,
  Ban,
  Archive,
  Camera,
  Upload,
  Eye,
  EyeOff,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Stepper state
  const [step, setStep] = useState(1);
  const [regPaymentMode, setRegPaymentMode] = useState('cash');
  const [regTransactionId, setRegTransactionId] = useState('');
  const [cashConfirm, setCashConfirm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      toast.success("User deleted successfully!");
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > 0 && val[0] !== '9') return;
    if (val.length > 10) return;
    setPhone(val);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        e.target.value = ''; // Reset the input
        return;
      }
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sex) {
      toast.error("Please select a sex.");
      return;
    }
    
    if (regPaymentMode === 'gcash' && !regTransactionId.trim()) {
      toast.error('GCash Transaction ID is required.');
      return;
    }

    if (regPaymentMode === 'cash' && !cashConfirm) {
      toast.error('Please confirm you received the exact payment.');
      return;
    }

    const generateStrongPassword = () => {
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const num = "0123456789";
      const sym = "!@#$%^&*()_+";
      const all = upper + lower + num + sym;
      let pass = "";
      pass += upper[Math.floor(Math.random() * upper.length)];
      pass += lower[Math.floor(Math.random() * lower.length)];
      pass += num[Math.floor(Math.random() * num.length)];
      pass += sym[Math.floor(Math.random() * sym.length)];
      for(let i=0; i<6; i++) {
        pass += all[Math.floor(Math.random() * all.length)];
      }
      return pass;
    };

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append('sex', sex);
    formData.append('role', 'Member');
    
    // Ensure password meets Laravel's strict requirements
    const currentPass = formData.get('password') as string;
    // Check if the provided password is strong enough, otherwise force a strong one
    const hasUpper = /[A-Z]/.test(currentPass);
    const hasLower = /[a-z]/.test(currentPass);
    const hasNum = /[0-9]/.test(currentPass);
    const hasSym = /[^A-Za-z0-9]/.test(currentPass);
    const isValid = currentPass.length >= 8 && hasUpper && hasLower && hasNum && hasSym;
    
    const finalPass = isValid ? currentPass : generateStrongPassword();
    formData.set('password', finalPass);
    formData.set('password_confirmation', finalPass);

    // Payment details
    formData.append('payment_amount', '150');
    formData.append('or_number', `OR-${Date.now()}`);
    formData.append('payment_type', regPaymentMode);
    if (regPaymentMode === 'gcash') {
      formData.append('transaction_id', regTransactionId);
    }

    const fileInput = document.getElementById('photo-upload-admin') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append('profile', fileInput.files[0]);
    } else {
      toast.error("Please upload a profile photo.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response: any = await userService.createUser(formData as any);
      
      // Immediately approve to activate the user
      const userId = response?.data?.user?.id || response?.user?.id;
      if (userId) {
        const paymentDetails: any = {
          payment_type: regPaymentMode,
          or_number: `OR-${Date.now()}`,
          payment_amount: 150,
        };
        if (regPaymentMode === 'gcash') {
          paymentDetails.transaction_id = regTransactionId;
        }
        await userService.approveUser(userId, paymentDetails);
      }
      
      toast.success("Member account created and registered successfully!");
      setIsDialogOpen(false);
      // Reset form
      setSex(null);
      setPhone("");
      setPhotoPreview(null);
      setStep(1);
      setRegPaymentMode('cash');
      setRegTransactionId('');
      setCashConfirm(false);
      e.currentTarget.reset();
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        console.error("Validation Errors 422:", errors);
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMsg = errors[firstErrorKey][0];
        toast.error(`Validation failed (${firstErrorKey}): ${firstErrorMsg}`);
      } else {
        console.error("Server Error:", error.response?.data);
        toast.error(error.response?.data?.message || "Failed to create member");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayUsers = users.filter(u => u.role?.toLowerCase() === 'member');
  const filteredUsers = displayUsers.filter(u => filter === 'all' || u.status.toLowerCase() === filter);

  const getFullName = (u: UserType) => `${u.firstname} ${u.lastname}`;
  const getStatus = (u: UserType) => u.status === 'active' ? 'Active' : u.status === 'inactive' ? 'Inactive' : 'Pending';
  const getFormattedDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Registered Users</h1>
            <p className="text-muted-foreground mt-1">Manage all registered user accounts (including non-members).</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl gap-2">
              <Filter className="size-4" />
              Filter
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                  <UserPlus className="size-4" />
                  Create Account
                </Button>
              </DialogTrigger>
              <DialogContent className="matte-surface border-white/10 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{step === 1 ? 'Create Member Account' : 'Register New Member'}</DialogTitle>
                  <DialogDescription>
                    {step === 1 ? 'Step 1: Add a new member manually.' : 'Step 2: Charge the 1-time membership registration fee.'}
                  </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
                  <div className={step === 1 ? 'block' : 'hidden'}>
                    <div className="flex flex-col items-center gap-3 mb-4">
                        <Avatar className="size-20 border border-white/10 bg-white/5">
                          {photoPreview && <AvatarImage src={photoPreview} alt="Preview" className="object-cover" />}
                          <AvatarFallback className="bg-transparent"><Camera className="size-8 text-muted-foreground opacity-50" /></AvatarFallback>
                        </Avatar>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" className="h-8 bg-white/5 border-white/10 rounded-lg text-xs gap-2 hover:bg-white/10">
                            <Camera className="size-3" /> Capture
                          </Button>
                          <div>
                            <Input id="photo-upload-admin" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="h-8 bg-white/5 border-white/10 rounded-lg text-xs gap-2 hover:bg-white/10"
                              onClick={() => document.getElementById('photo-upload-admin')?.click()}
                            >
                              <Upload className="size-3" /> Upload
                            </Button>
                          </div>
                        </div>
                      </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                      <Input id="firstName" name="firstname" placeholder="John" className="bg-white/5 border-white/10" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                      <Input id="lastName" name="lastname" placeholder="Doe" className="bg-white/5 border-white/10" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                    <Input id="username" name="username" placeholder="johndoe123" className="bg-white/5 border-white/10" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                    <Input id="email" name="email" type="email" placeholder="email@example.com" className="bg-white/5 border-white/10" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Temporary Password <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="bg-white/5 border-white/10 pr-10" required />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground flex items-center gap-2 border-r border-white/10 pr-2">
                          <span className="text-xs">+63</span>
                        </div>
                        <Input
                          id="phone"
                          name="contact"
                          type="tel"
                          value={phone}
                          onChange={handlePhoneChange}
                          autoComplete="off"
                          placeholder="912 345 6789"
                          className="pl-14 bg-white/5 border-white/10"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Sex</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSex('male')}
                          className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                            sex === 'male' 
                            ? 'bg-white text-black border-white' 
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setSex('female')}
                          className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                            sex === 'female' 
                            ? 'bg-white text-black border-white' 
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>

                  <div className={step === 2 ? 'block' : 'hidden'}>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="size-4 text-emerald-500" />
                          <span className="text-sm font-medium">One-Time Membership Fee</span>
                        </div>
                        <span className="font-bold">₱150</span>
                      </div>
                    </div>

                    <div className="grid gap-3 mt-6">
                      <Label>Payment Mode</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegPaymentMode('cash')}
                          className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                            regPaymentMode === 'cash' 
                            ? 'bg-white text-black border-white' 
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                          }`}
                        >
                          Cash
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegPaymentMode('gcash')}
                          className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                            regPaymentMode === 'gcash' 
                            ? 'bg-[#007DFE] text-white border-[#007DFE]' 
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                          }`}
                        >
                          GCash
                        </button>
                      </div>
                    </div>

                    {regPaymentMode === 'gcash' ? (
                      <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 mt-4">
                        <Label htmlFor="ref-new">GCash Transaction ID <span className="text-destructive">*</span></Label>
                        <Input id="ref-new" value={regTransactionId} onChange={(e) => setRegTransactionId(e.target.value)} placeholder="e.g. 10023456789" className="bg-white/5 border-white/10" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-2 mt-4">
                        <Checkbox id="cash-confirm-admin" checked={cashConfirm} onCheckedChange={(c) => setCashConfirm(c as boolean)} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                        <Label htmlFor="cash-confirm-admin" className="text-xs font-medium leading-tight cursor-pointer">
                          Did you receive the exact payment in cash?
                        </Label>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="mt-4 gap-2 flex-col sm:flex-row">
                    {step === 2 && (
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-xl w-full sm:w-auto bg-white/5 border-white/10">
                        Back
                      </Button>
                    )}
                    {step === 1 ? (
                      <Button type="button" onClick={() => {
                        // We could add manual validation here for step 1 fields if needed
                        setStep(2);
                      }} className="rounded-xl w-full">
                        Next: Registration Fee
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting} className="rounded-xl w-full">
                        {isSubmitting ? "Processing..." : "Complete Registration"}
                      </Button>
                    )}
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <Users className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <h3 className="text-2xl font-bold">{displayUsers.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <BadgeCheck className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <h3 className="text-2xl font-bold">{displayUsers.filter(u => u.status === 'active').length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <Ban className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive Members</p>
                <h3 className="text-2xl font-bold">{displayUsers.filter(u => u.status === 'inactive').length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-white/5">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-0">
            <Tabs defaultValue="all" onValueChange={setFilter} className="w-full md:w-auto">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg px-6">All</TabsTrigger>
                <TabsTrigger value="active" className="rounded-lg px-6">Active</TabsTrigger>
                <TabsTrigger value="inactive" className="rounded-lg px-6">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-10 bg-white/5 border-white/10 rounded-xl h-10" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Joined Date</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border border-white/10">
                            {user.profile && <AvatarImage src={user.profile} alt={getFullName(user)} />}
                            <AvatarFallback className="bg-white/5 text-xs">{user.firstname.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{getFullName(user)}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "h-6 text-[10px]",
                          user.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                          user.status === 'inactive' ? "bg-white/5 text-muted-foreground border-white/10" :
                          "bg-orange-500/10 text-orange-500 border-orange-500/20"
                        )}>
                          {getStatus(user)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{getFormattedDate(user.created_at)}</TableCell>
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2">
                                  <User className="size-4" /> View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0a0a0a]">
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                  <DialogDescription>Read-only view of {getFullName(user)}'s details.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="size-16 border border-white/10">
                                      {user.profile && <AvatarImage src={user.profile} alt={getFullName(user)} />}
                                      <AvatarFallback className="bg-white/5 text-xl">{user.firstname.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-bold text-white">{getFullName(user)}</h3>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                      <p className="text-xs text-muted-foreground">System Role</p>
                                      <p className="font-medium text-white capitalize">{user.role}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                      <p className="text-xs text-muted-foreground">Status</p>
                                      <p className={cn("font-medium", user.status === 'active' ? "text-emerald-500" : "text-muted-foreground")}>{getStatus(user)}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 col-span-2">
                                      <p className="text-xs text-muted-foreground">Joined Date</p>
                                      <p className="font-medium text-white">{getFormattedDate(user.created_at)}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2">
                                  <Shield className="size-4" /> Update Role
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0a0a0a]">
                                <DialogHeader>
                                  <DialogTitle>Update Role</DialogTitle>
                                  <DialogDescription>Change system access level for {getFullName(user)}.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label>Select Role</Label>
                                    <Select defaultValue={user.role.toLowerCase()}>
                                      <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                      <SelectContent className="matte-surface border-white/10">
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="cashier">Cashier</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button className="rounded-xl">Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <DropdownMenuSeparator className="bg-white/5" />
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2 text-orange-500 focus:text-orange-500">
                                  <Ban className="size-4" /> Deactivate
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0a0a0a]">
                                <DialogHeader>
                                  <DialogTitle className="text-orange-500 flex items-center gap-2">
                                    <Ban className="size-5" /> Deactivate User
                                  </DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to deactivate {getFullName(user)}? They will temporarily lose access to the system.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                                  <Button variant="outline" className="bg-white/5 border-white/10">Cancel</Button>
                                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">Deactivate</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                                  <Trash2 className="size-4" /> Delete
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0a0a0a]">
                                <DialogHeader>
                                  <DialogTitle className="text-destructive flex items-center gap-2">
                                    <Trash2 className="size-5" /> Delete User
                                  </DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to permanently delete {getFullName(user)}? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                                  <DialogTrigger asChild>
                                    <Button variant="outline" className="bg-white/5 border-white/10">Cancel</Button>
                                  </DialogTrigger>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete User
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-muted-foreground">Showing {filteredUsers.length} of {displayUsers.length} users</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 rounded-lg h-8 px-4" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 rounded-lg h-8 px-4">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

