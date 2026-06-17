import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';
import { 
  Dumbbell, 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Camera,
  Upload
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerService } from '@/services/trainer.service';
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
import { Textarea } from '@/components/ui/textarea';

export default function AdminTrainers() {
  const queryClient = useQueryClient();
  
  const { data: trainers = [], isLoading, isError } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => trainerService.getAllTrainers(),
    retry: false
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    contact: '',
    sex: 'male',
    address: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      // If photoFile is present, send as FormData
      if (photoFile) {
        const formDataPayload = new FormData();
        formDataPayload.append('firstname', data.firstname);
        formDataPayload.append('lastname', data.lastname);
        if (data.email) formDataPayload.append('email', data.email);
        if (data.contact) formDataPayload.append('contact', data.contact);
        if (data.sex) formDataPayload.append('sex', data.sex);
        if (data.address) formDataPayload.append('address', data.address);
        formDataPayload.append('profile', photoFile);
        
        // Let Axios handle the content type for FormData
        return await trainerService.createTrainer(formDataPayload as any);
      } else {
        return await trainerService.createTrainer(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer created successfully!');
      setIsCreateOpen(false);
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        contact: '',
        sex: 'male',
        address: '',
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create trainer');
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        e.target.value = '';
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstname || !formData.lastname) {
      toast.error('Please fill in required fields');
      return;
    }
    if (formData.contact && formData.contact.length !== 10) {
      toast.error('Contact number must be exactly 10 digits.');
      return;
    }
    const formattedData = {
      ...formData,
      contact: formData.contact ? `+63${formData.contact.replace(/\D/g, '')}` : undefined,
    };
    registerMutation.mutate(formattedData);
  };

  const deleteTrainerMutation = useMutation({
    mutationFn: (id: number) => trainerService.deleteTrainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete trainer');
    }
  });

  const filteredTrainers = trainers.filter((trainer: any) => 
    `${trainer.firstname} ${trainer.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trainer.email && trainer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Trainers Management</h1>
            <p className="text-muted-foreground mt-1">Manage gym trainers and their details.</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                  <Plus className="size-4" />
                  Add Trainer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] matte-surface border-white/10">
                <DialogHeader>
                  <DialogTitle>Add New Trainer</DialogTitle>
                  <DialogDescription>
                    Register a new trainer in the system.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTrainer} className="grid gap-4 py-4">
                  <div className="flex flex-col items-center gap-3 mb-4">
                    <Avatar className="size-20 border border-white/10 bg-white/5">
                      {photoPreview && <AvatarImage src={photoPreview} alt="Preview" className="object-cover" />}
                      <AvatarFallback className="bg-transparent"><Camera className="size-8 text-muted-foreground opacity-50" /></AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" className="h-8 bg-white/5 border-white/10 rounded-lg text-xs gap-2 hover:bg-white/10" onClick={() => {
                        const input = document.getElementById('trainer-photo-upload') as HTMLInputElement;
                        if (input) {
                          input.capture = "environment";
                          input.click();
                        }
                      }}>
                        <Camera className="size-3" /> Capture
                      </Button>
                      <div>
                        <Input id="trainer-photo-upload" type="file" className="hidden" accept="image/jpeg, image/png" onChange={handlePhotoChange} />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="h-8 bg-white/5 border-white/10 rounded-lg text-xs gap-2 hover:bg-white/10"
                          onClick={() => {
                            const input = document.getElementById('trainer-photo-upload') as HTMLInputElement;
                            if (input) {
                              input.removeAttribute('capture');
                              input.click();
                            }
                          }}
                        >
                          <Upload className="size-3" /> Upload
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                      <Input id="firstName" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} placeholder="John" className="bg-white/5 border-white/10" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                      <Input id="lastName" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} placeholder="Doe" className="bg-white/5 border-white/10" required />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john.doe@irongym.com" className="bg-white/5 border-white/10" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contact">Contact Number</Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground flex items-center gap-2 border-r border-white/10 pr-2">
                          <span className="text-xs">+63</span>
                        </div>
                        <Input 
                          id="contact" 
                          value={formData.contact} 
                          onChange={e => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            let validatedValue = rawValue;
                            if (validatedValue.length > 0 && validatedValue[0] !== '9') {
                              validatedValue = '';
                            }
                            if (validatedValue.length > 10) {
                              validatedValue = validatedValue.slice(0, 10);
                            }
                            setFormData({...formData, contact: validatedValue});
                          }} 
                          placeholder="912 345 6789" 
                          className="pl-14 bg-white/5 border-white/10" 
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Sex</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, sex: 'male'})}
                          className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                            formData.sex === 'male' 
                            ? 'bg-white text-black border-white' 
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, sex: 'female'})}
                          className={`h-10 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                            formData.sex === 'female' 
                            ? 'bg-white text-black border-white' 
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Trainer address..." className="bg-white/5 border-white/10" />
                  </div>

                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={registerMutation.isPending} className="rounded-xl w-full">
                      {registerMutation.isPending ? 'Saving...' : 'Add Trainer'}
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
              <Input 
                placeholder="Search trainers by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 rounded-xl w-full" 
              />
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5 hover:bg-white/5 border-b border-white/5">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Contact Details</TableHead>
                  <TableHead className="font-semibold text-center">Total Trained</TableHead>
                  <TableHead className="font-semibold">Added On</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading trainers...</TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Could not load trainers. The server might be down or configuring the database.
                    </TableCell>
                  </TableRow>
                ) : filteredTrainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No trainers found.</TableCell>
                  </TableRow>
                ) : filteredTrainers.map((trainer: any) => (
                  <TableRow key={trainer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Dumbbell className="size-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-primary transition-colors">{trainer.firstname} {trainer.lastname}</span>
                          <span className="text-xs text-muted-foreground capitalize">{trainer.sex}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        {trainer.email && <span>{trainer.email}</span>}
                        {trainer.contact && <span>{trainer.contact}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-bold text-white text-lg">
                        {trainer.total_trained || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(trainer.created_at).toLocaleDateString()}
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
                            <Edit className="size-4" /> Edit Trainer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem 
                            className="cursor-pointer gap-2 text-destructive hover:bg-destructive/20 focus:bg-destructive/20 focus:text-destructive"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this trainer?')) {
                                deleteTrainerMutation.mutate(trainer.id);
                              }
                            }}
                            disabled={deleteTrainerMutation.isPending}
                          >
                            <Trash2 className="size-4" /> Delete Trainer
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
