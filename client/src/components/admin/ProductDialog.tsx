import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { uploadMultipleImages, deleteImage } from "@/lib/imageUpload";
import { 
  getCategories, 
  createProduct, 
  updateProduct,
  getProductCategories,
  updateProductCategories,
} from "@/lib/api";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  onSuccess: () => void;
}

const ProductDialog = ({ open, onOpenChange, product, onSuccess }: ProductDialogProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    brand: "",
    color: "",
    size: "",
    price: "",
    description: "",
    stock_quantity: "0",
    status: "active",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        code: product.code || "",
        brand: product.brand || "",
        color: product.color || "",
        size: product.size || "",
        price: product.price?.toString() || "",
        description: product.description || "",
        stock_quantity: product.stock_quantity?.toString() || "0",
        status: product.status || "active",
      });
      // Set existing image URLs
      const images = product.images ? JSON.parse(product.images) : [];
      setImageUrls(images);
      setImagePreviews([]);
      setNewImages([]);
      
      // Load product categories
      loadProductCategories(product.id);
    } else {
      setFormData({
        name: "",
        code: "",
        brand: "",
        color: "",
        size: "",
        price: "",
        description: "",
        stock_quantity: "0",
        status: "active",
      });
      setSelectedCategories([]);
      setImageUrls([]);
      setImagePreviews([]);
      setNewImages([]);
    }
  }, [product, open]);

  const loadProductCategories = async (productId: string) => {
    const categoryIds = await getProductCategories(productId);
    setSelectedCategories(categoryIds);
  };

  const getDisplayUrl = (pathOrUrl: string) => {
    if (!pathOrUrl) return "";
    // If it's already a full URL, return as-is
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    // If it's a relative path, convert to full URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    return pathOrUrl.startsWith('/') ? `${baseUrl}${pathOrUrl}` : `${baseUrl}/${pathOrUrl}`;
  };

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data || []);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select image files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = imageFiles.filter((file) => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Some images exceed 5MB limit. Please compress them.",
        variant: "destructive",
      });
      return;
    }

    setNewImages((prev) => [...prev, ...imageFiles]);
    
    // Create previews
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      // Check user authentication before attempting uploads (helps surface RLS/auth errors early)
      // Upload new images first
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        uploadedUrls = await uploadMultipleImages(newImages);
        
        if (uploadedUrls.length !== newImages.length) {
          toast({
            title: "Warning",
            description: "Some images failed to upload. Please try again.",
            variant: "destructive",
          });
        }
      }

      // Combine existing and new image URLs
      const allImageUrls = [...imageUrls, ...uploadedUrls];

      const payload = {
        name: formData.name,
        code: formData.code || null,
        brand: formData.brand || null,
        color: formData.color || null,
        size: formData.size || null,
        price: formData.price ? parseFloat(formData.price) : null,
        description: formData.description || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        status: formData.status,
        images: allImageUrls,
      };

      let result;
      let productId: string;
      if (product) {
        result = await updateProduct(product.id, payload);
        productId = product.id;
      } else {
        result = await createProduct(payload);
        productId = result?.id;
      }

      if (!result) {
        toast({
          title: "Error",
          description: "Failed to save product",
          variant: "destructive",
        });
      } else {
        // Update product categories
        if (selectedCategories.length > 0) {
          const categoriesUpdated = await updateProductCategories(productId, selectedCategories);
          if (!categoriesUpdated) {
            toast({
              title: "Warning",
              description: "Product saved but categories could not be updated.",
              variant: "destructive",
            });
          }
        } else {
          // Clear categories if none selected
          await updateProductCategories(productId, []);
        }

        toast({
          title: "Success",
          description: `Product ${product ? "updated" : "created"} successfully.`,
        });
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      // Surface clearer messages for common issues
      const msg = (error && (error.message || (error as any).msg)) || String(error);
      toast({
        title: "Error",
        description: msg || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Product Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Categories</Label>
              <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => handleCategoryToggle(cat.id)}
                      />
                      <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer font-normal">
                        {cat.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2">No categories available</p>
                )}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., 1L, 4L, 20L"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Product Images</Label>
              
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop images here, or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports multiple images (max 5MB each)
                </p>
              </div>

              {/* Image Previews */}
              {(imageUrls.length > 0 || imagePreviews.length > 0) && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {/* Existing Images */}
                  {imageUrls.map((url, index) => {
                    const display = getDisplayUrl(url);
                    if (!display) return null;
                    return (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={display}
                          alt={`Product ${index + 1}`}
                          className="object-center object-cover w-full h-24 rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, false)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                  
                  {/* New Image Previews */}
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="object-center object-cover w-full h-24 rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {uploading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading || uploading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
