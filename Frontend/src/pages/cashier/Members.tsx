import React, { useState, useMemo } from 'react';
import { CashierLayout } from '@/components/layout/CashierLayout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { useQuery } from '@tanstack/react-query';
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
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function CashierMembers() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers({ per_page: 5000 })
  });

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
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append('sex', sex);
    formData.append('role', 'Member');
    
    // Add default values required by backend for new users
    formData.append('password_confirmation', formData.get('password') as string);
    formData.append('payment_amount', '0');
    formData.append('or_number', 'CASHIER-ADDED');
    formData.append('payment_type', 'cash');

    const fileInput = document.getElementById('photo-upload-cashier') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append('profile', fileInput.files[0]);
    } else {
      toast.error("Please upload a profile photo.");
      setIsSubmitting(false);
      return;
    }

    try {
      await userService.createUser(formData as any);
      toast.success("Member account created successfully!");
      setIsDialogOpen(false);
      // Reset form
      setSex(null);
      setPhone("");
      setPhotoPreview(null);
      e.currentTarget.reset();
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0] as string[];
        toast.error(firstError?.[0] || "Validation failed.");
      } else {
        toast.error(error.response?.data?.message || "Failed to create member");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived state calculations
  const metrics = useMemo(() => {
    const activeCount = users.filter((u: any) => u.status === 'active').length;
    const adminStaffCount = users.filter((u: any) => u.role === 'admin' || u.role === 'staff').length;

    return {
      total: users.length,
      active: activeCount,
      adminStaff: adminStaffCount
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user: any) => {
      const matchesFilter = filter === 'all' || user.status?.toLowerCase() === filter.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${user.firstname || ''} ${user.lastname || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchLower) || (user.email && user.email.toLowerCase().includes(searchLower));
      
      return matchesFilter && matchesSearch;
    });
  }, [users, filter, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getInitials = (first: string = '', last: string = '') => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';
  };

  return (
    <CashierLayout>
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
                  <DialogTitle>Create Member Account</DialogTitle>
                  <DialogDescription>
                    Add a new member manually.
                  </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
                  <div className="flex flex-col items-center gap-3 mb-2">
                    <Avatar className="size-20 border border-white/10 bg-white/5">
                      {photoPreview && <AvatarImage src={photoPreview} alt="Preview" className="object-cover" />}
                      <AvatarFallback className="bg-transparent"><Camera className="size-8 text-muted-foreground opacity-50" /></AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" className="h-8 bg-white/5 border-white/10 rounded-lg text-xs gap-2 hover:bg-white/10">
                        <Camera className="size-3" /> Capture
                      </Button>
                      <div>
                        <Input id="photo-upload-cashier" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="h-8 bg-white/5 border-white/10 rounded-lg text-xs gap-2 hover:bg-white/10"
                          onClick={() => document.getElementById('photo-upload-cashier')?.click()}
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

                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={isSubmitting} className="rounded-xl w-full">
                      {isSubmitting ? "Creating..." : "Create Account"}
                    </Button>
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
                <p className="text-sm text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{metrics.total.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <BadgeCheck className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Now</p>
                <h3 className="text-2xl font-bold">{metrics.active.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <Shield className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins/Staff</p>
                <h3 className="text-2xl font-bold">{metrics.adminStaff.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-white/5">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-0">
            <Tabs defaultValue="all" onValueChange={(v) => { setFilter(v); setPage(1); }} className="w-full md:w-auto">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg px-6">All</TabsTrigger>
                <TabsTrigger value="active" className="rounded-lg px-6">Active</TabsTrigger>
                <TabsTrigger value="inactive" className="rounded-lg px-6">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-10 bg-white/5 border-white/10 rounded-xl h-10" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Joined Date</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user: any) => (
                      <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 border border-white/10">
                              <AvatarFallback className="bg-white/5 text-xs">{getInitials(user.firstname, user.lastname)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.firstname} {user.lastname}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "h-6 text-[10px] capitalize",
                            user.role === 'Member' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-white/5 text-muted-foreground border-white/10"
                          )}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "h-6 text-[10px] capitalize",
                            user.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-muted-foreground border-white/10"
                          )}>
                            {user.status || 'inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8 hover:bg-white/10 text-muted-foreground hover:text-white" title="View Details">
                                <User className="size-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0a0a0a]">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                                <DialogDescription>Read-only view of {user.firstname}'s profile.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                  <Avatar className="size-16 border border-white/10">
                                    <AvatarFallback className="bg-white/5 text-xl">{getInitials(user.firstname, user.lastname)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-xl font-bold text-white">{user.firstname} {user.lastname}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-xs text-muted-foreground">Role</p>
                                    <p className="font-medium text-white capitalize">{user.role}</p>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <p className={cn("font-medium capitalize", user.status === 'active' ? "text-emerald-500" : "text-muted-foreground")}>{user.status || 'inactive'}</p>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 col-span-2">
                                    <p className="text-xs text-muted-foreground">Joined Date</p>
                                    <p className="font-medium text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No users found matching your search or filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-muted-foreground">
                Showing {Math.min(filteredUsers.length, (page - 1) * itemsPerPage + 1)} to {Math.min(filteredUsers.length, page * itemsPerPage)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/5 border-white/10 rounded-lg h-8 px-4" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/5 border-white/10 rounded-lg h-8 px-4"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </CashierLayout>
  );
}
