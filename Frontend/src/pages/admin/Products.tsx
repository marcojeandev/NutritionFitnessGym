import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { productService } from '@/services/product.service';
import { Product } from '@/types/models';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Edit,
  Trash2,
  Package,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";

// ✅ FIXED: Properly handles 'products/filename.png' format
const getImageUrl = (profile: string | undefined | null): string | null => {
  if (!profile) return null;
  
  // If it's already a full URL, return it
  if (profile.startsWith('http')) return profile;
  
  // If it already has 'storage/' prefix, add base URL
  if (profile.startsWith('storage/')) {
    return `http://localhost:8000/${profile}`;
  }
  
  // If it starts with 'products/' (your case)
  if (profile.startsWith('products/')) {
    return `http://localhost:8000/storage/${profile}`;
  }
  
  // Default fallback
  return `http://localhost:8000/storage/${profile}`;
};

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: ''
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts
  });

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB.');
        return;
      }
      setProfileImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      if (profileImage) {
        const formData = new FormData();
        formData.append('name', data.name || '');
        formData.append('price', data.price?.toString() || '');
        formData.append('quantity', data.quantity?.toString() || '');
        formData.append('sold', '0');
        if (data.description) formData.append('description', data.description);
        if (profileImage) formData.append('profile', profileImage);
        return productService.createProductWithImage(formData);
      } else {
        return productService.createProduct(data);
      }
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; payload: Partial<Product> }) => {
      if (profileImage) {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        if (data.payload.name) formData.append('name', data.payload.name);
        if (data.payload.description) formData.append('description', data.payload.description);
        if (data.payload.price) formData.append('price', data.payload.price.toString());
        if (data.payload.quantity) formData.append('quantity', data.payload.quantity.toString());
        if (profileImage) formData.append('profile', profileImage);
        return productService.updateProductWithImage(data.id, formData);
      } else {
        return productService.updateProduct(data.id, data.payload);
      }
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', quantity: '' });
    setEditingId(null);
    setProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      quantity: product.quantity?.toString() || ''
    });
    const url = getImageUrl(product.profile);
    setPreviewUrl(url);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.description && formData.description.length < 20) {
      toast.error('Description must be at least 20 characters long.');
      return;
    }

    const payload: any = {
      name: formData.name,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      sold: editingId ? undefined : 0
    };

    if (formData.description) {
      payload.description = formData.description;
    }

    if (editingId) {
      delete payload.sold;
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Products</h1>
            <p className="text-muted-foreground mt-1">Manage product inventory and stock levels.</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                  <Plus className="size-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] matte-surface border-white/10">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the product in the inventory.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Product Image</Label>
                    <div className="flex items-center gap-4">
                      {previewUrl ? (
                        <div className="relative">
                          <img 
                            src={previewUrl} 
                            alt="Product preview" 
                            className="w-20 h-20 rounded-lg object-cover border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 p-0.5 rounded-full bg-red-500 text-white hover:bg-red-600"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <ImageIcon className="size-8 text-white/20" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full gap-2 bg-white/5 border-white/10"
                        >
                          <Upload className="size-4" />
                          {previewUrl ? 'Change Image' : 'Upload Image'}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Max 2MB. JPG, PNG, GIF
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input 
                      id="name" 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. Whey Protein" 
                      className="bg-white/5 border-white/10" 
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Min 20 characters)</Label>
                    <Input 
                      id="description" 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="e.g. Premium 2kg vanilla flavor whey isolate" 
                      className="bg-white/5 border-white/10" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price (₱) *</Label>
                      <Input 
                        id="price" 
                        required 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                        placeholder="e.g. 1500" 
                        className="bg-white/5 border-white/10" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Stock Quantity *</Label>
                      <Input 
                        id="quantity" 
                        required 
                        type="number" 
                        min="0" 
                        value={formData.quantity} 
                        onChange={e => setFormData({...formData, quantity: e.target.value})} 
                        placeholder="e.g. 20" 
                        className="bg-white/5 border-white/10" 
                      />
                    </div>
                  </div>

                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl w-full">
                      {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Product'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 bg-white/5 border-white/10 rounded-xl" 
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No products found. Add one to get started!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const currentStock = (product.quantity || 0) - (product.sold || 0);
              const imageUrl = getImageUrl(product.profile);
              
              return (
                <Card key={product.id} className="glass border-white/5 overflow-hidden group hover:border-white/20 transition-all relative">
                  <div className="relative h-40 bg-white/5 flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Package className={`size-12 text-white/20 fallback-icon ${imageUrl ? 'hidden' : ''}`} />
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(product)} 
                        className="size-8 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }} 
                        className="size-8 rounded-full bg-black/60 backdrop-blur-sm hover:bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-lg leading-tight line-clamp-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xl font-black text-white">₱{Number(product.price).toLocaleString()}</p>
                      <Badge className={cn(
                        "rounded-full px-2.5",
                        currentStock < 10 ? "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30" : "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                      )}>
                        {currentStock} in stock
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>  // ← MAKE SURE THIS CLOSING TAG EXISTS
  );
}