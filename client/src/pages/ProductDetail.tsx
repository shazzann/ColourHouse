import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Package, Palette, ChevronLeft, ChevronRight, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AddToCartDialog from "@/components/AddToCartDialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProduct, getSettings, getCategories } from "@/lib/api";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    setSelectedImageIndex(0);
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [productData, settingsData, categoriesData] = await Promise.all([
        getProduct(id),
        getSettings(),
        getCategories(),
      ]);
      
      setProduct(productData);
      setAllCategories(categoriesData);
      
      if (settingsData) {
        setWhatsappNumber(settingsData.whatsapp_number);
      }
    } catch (error) {
      console.error("Error loading product details:", error);
      toast({
        title: "Error",
        description: "Failed to load product details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    try {
      const productLink = `${window.location.origin}/products/${id}`;
      const link = generateWhatsAppLink(
        whatsappNumber,
        product.name,
        product.code,
        product.color,
        productLink
      );
      // Mobile/iOS Safari compatibility
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        window.location.href = link;
      } else {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate WhatsApp link.",
        variant: "destructive",
      });
    }
  };

  // Zoom / lightbox handlers
  const [zoomOpen, setZoomOpen] = useState(false);
  const openZoomAt = (index: number) => {
    setSelectedImageIndex(index);
    setZoomOpen(true);
  };
  const closeZoom = () => setZoomOpen(false);
  const getDisplayImages = () => {
    const imgs = product?.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
    return (imgs || []).filter((u: string) => !!u);
  };

  const showPrev = () => {
    const imgs = getDisplayImages();
    if (imgs.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + imgs.length) % imgs.length);
  };

  const showNext = () => {
    const imgs = getDisplayImages();
    if (imgs.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % imgs.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">Product not found</p>
            <Link to="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inStock = product.stock_quantity > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gradient-to-b from-hero-from/20 to-background">
        <div className="container mx-auto px-4 py-12">
          {/* Back Button */}
          <Link to="/products">
            <Button variant="ghost" className="mb-6 group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Products
            </Button>
          </Link>

          {/* Product Content */}
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Images Gallery */}
            {(() => {
              const displayImages = getDisplayImages()
                .filter((u: string) => !!u);

              // Ensure selected index is within bounds
              const safeIndex = selectedImageIndex >= 0 && selectedImageIndex < displayImages.length ? selectedImageIndex : 0;
              const mainImage = displayImages[safeIndex] || displayImages[0];

              return (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="object-cover w-full h-full cursor-zoom-in"
                        onClick={() => openZoomAt(safeIndex)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hero-from to-hero-to">
                        <span className="text-9xl text-muted-foreground/20">🎨</span>
                      </div>
                    )}
                    {!inStock && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg px-6 py-2">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {displayImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {displayImages.map((img: string, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            safeIndex === index
                              ? "border-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="object-center object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Details */}
            <div className="space-y-6">
              {allCategories && allCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category: any) => (
                    <Badge key={category.id} variant="secondary" className="text-sm">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}
              
              <h1 className="text-4xl font-bold">{product.name}</h1>
              
              {product.price && (
                <p className="text-3xl font-bold text-primary">
                  Rs. {!isNaN(Number(product.price)) ? Number(product.price).toFixed(2) : "N/A"}
                </p>
              )}

              <div className="space-y-4 py-4 border-y border-border">
                {product.code && (
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Product Code</p>
                      <p className="font-medium">{product.code}</p>
                    </div>
                  </div>
                )}

                {product.brand && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🏢</span>
                    <div>
                      <p className="text-sm text-muted-foreground">Brand</p>
                      <p className="font-medium">{product.brand}</p>
                    </div>
                  </div>
                )}

                {product.color && (
                  <div className="flex items-center space-x-3">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-medium">{product.color}</p>
                    </div>
                  </div>
                )}

                {product.size && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📏</span>
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-medium">{product.size}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Status</p>
                    <p className={`font-medium ${inStock ? "text-green-600" : "text-destructive"}`}>
                      {inStock ? `${product.stock_quantity} in stock` : "Out of stock"}
                    </p>
                  </div>
                </div>
              </div>

              {product.description && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={() => setIsAddToCartOpen(true)}
                  disabled={!inStock}
                  className="w-full text-lg py-6 bg-primary hover:bg-primary/90 group"
                >
                  <ShoppingCart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Add to Cart
                </Button>

                <Button
                  size="lg"
                  className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground text-lg py-6 group"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Buy on WhatsApp
                </Button>
              </div>

              {!inStock && (
                <p className="text-sm text-muted-foreground text-center">
                  This product is currently out of stock, but you can still inquire about availability via WhatsApp.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Add to Cart Dialog */}
      <AddToCartDialog
        open={isAddToCartOpen}
        onOpenChange={setIsAddToCartOpen}
        product={{
          id: product.id,
          name: product.name,
          code: product.code,
          price: product.price || 0,
          image_url: product.image_url || product.image_urls?.[0],
          stock_quantity: product.stock_quantity,
        }}
      />

      {/* Image Zoom Lightbox */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-6xl w-full p-0">
          <DialogHeader>
            <DialogTitle />
          </DialogHeader>
          <div className="relative bg-white/90 flex items-center justify-center p-6">
            {/* <button
              type="button"
              onClick={closeZoom}
              className="absolute top-4 right-4 z-20 bg-background/80 rounded-full p-2 hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button> */}

            <button
              type="button"
              onClick={showPrev}
              className="absolute left-4 z-20 bg-background/80 rounded-full p-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="max-h-[80vh] max-w-full flex items-center justify-center">
              {(() => {
                const imgs = getDisplayImages();
                const idx = selectedImageIndex >= 0 && selectedImageIndex < imgs.length ? selectedImageIndex : 0;
                const src = imgs[idx];
                return src ? (
                  <img src={src} alt={product.name} className="object-contain max-h-[80vh] max-w-full" />
                ) : (
                  <div className="text-white">No image</div>
                );
              })()}
            </div>

            <button
              type="button"
              onClick={showNext}
              className="absolute right-4 z-20 bg-background/80 rounded-full p-2"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
