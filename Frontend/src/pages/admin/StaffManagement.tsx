import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';
import { 
  UserCog, 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Ban,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminStaff() {
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers()
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    contact: '',
    sex: 'male',
    password: '',
    role: 'cashier',
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response: any = await userService.createSystemAccount(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Account created successfully!');
      setIsCreateOpen(false);
      setFormData({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        contact: '',
        sex: 'male',
        password: '',
        role: 'cashier',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create account');
    }
  });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    const formattedData = {
      ...formData,
      contact: formData.contact ? `+63${formData.contact.replace(/\D/g, '')}` : undefined,
      password_confirmation: formData.password
    };
    registerMutation.mutate(formattedData);
  };

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number, role: string }) => userService.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  const staffMembers = users.filter((user: any) => user.role === 'admin' || user.role === 'cashier' || user.role === 'staff');

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Staff Management</h1>
            <p className="text-muted-foreground mt-1">Manage administrative and cashier accounts.</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                  <Plus className="size-4" />
                  Create Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] matte-surface border-white/10">
                <DialogHeader>
                  <DialogTitle>Create Staff Account</DialogTitle>
                  <DialogDescription>
                    Add a new administrator or cashier to the system.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAccount} className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} placeholder="Jane" className="bg-white/5 border-white/10" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} placeholder="Smith" className="bg-white/5 border-white/10" required />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="janesmith" className="bg-white/5 border-white/10" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane.smith@irongym.com" className="bg-white/5 border-white/10" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contact">Contact Number</Label>
                      <Input id="contact" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="912 345 6789" className="bg-white/5 border-white/10" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sex">Sex</Label>
                      <Select value={formData.sex} onValueChange={v => setFormData({...formData, sex: v})}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent className="matte-surface border-white/10">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••" 
                        className="bg-white/5 border-white/10 pr-10" 
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role">System Role</Label>
                    <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                      <SelectContent className="matte-surface border-white/10">
                        <SelectItem value="cashier">Cashier</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={registerMutation.isPending} className="rounded-xl w-full">
                      {registerMutation.isPending ? 'Creating...' : 'Create Account'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="glass border-white/5 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search staff by name or email..." className="pl-10 bg-white/5 border-white/10 rounded-xl w-full" />
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5 hover:bg-white/5 border-b border-white/5">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Last Login</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading staff members...</TableCell>
                  </TableRow>
                ) : staffMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No staff members found.</TableCell>
                  </TableRow>
                ) : staffMembers.map((staff: any) => (
                  <TableRow key={staff.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-primary transition-colors">{staff.firstname} {staff.lastname}</span>
                        <span className="text-xs text-muted-foreground">{staff.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {staff.role === 'admin' ? (
                          <ShieldCheck className="size-4 text-primary" />
                        ) : staff.role === 'staff' ? (
                          <ShieldCheck className="size-4 text-blue-500" />
                        ) : (
                          <UserCog className="size-4 text-emerald-500" />
                        )}
                        <span className="font-medium text-sm capitalize">{staff.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-full font-bold capitalize",
                        staff.status === 'active' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                      )}>
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {/* Last login not available in User model, showing updated_at for now */}
                      {new Date(staff.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="size-8 p-0 rounded-lg hover:bg-white/10">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] matte-surface border-white/10">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/10">
                            <Edit className="size-4" /> Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer gap-2 hover:bg-white/10 focus:bg-white/10"
                            onClick={() => updateRoleMutation.mutate({ id: staff.id, role: staff.role === 'admin' ? 'cashier' : 'admin' })}
                            disabled={updateRoleMutation.isPending}
                          >
                            <UserCog className="size-4" /> Make {staff.role === 'admin' ? 'Cashier' : 'Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="cursor-pointer gap-2 text-destructive hover:bg-destructive/20 focus:bg-destructive/20 focus:text-destructive">
                            <Ban className="size-4" /> {staff.status === 'active' ? 'Suspend' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer gap-2 text-destructive hover:bg-destructive/20 focus:bg-destructive/20 focus:text-destructive"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this user?')) {
                                deleteUserMutation.mutate(staff.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="size-4" /> Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
