import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Eye, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import AddToCartDialog from "./AddToCartDialog";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price?: number;
  imageUrl?: string;
  imageUrls?: string[];
  stockQuantity: number;
  category?: { name: string };
  code?: string;
  color?: string;
  whatsappNumber?: string;
}

const ProductCard = ({ id, name, description, price, imageUrl, imageUrls, stockQuantity, category, code, color, whatsappNumber }: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const inStock = stockQuantity > 0;

  // Get images array - prioritize imageUrls over imageUrl
  const images = (imageUrls && imageUrls.length > 0) ? imageUrls : (imageUrl ? [imageUrl] : []);
  const hasMultipleImages = images.length > 1;
  const displayImage = images[currentImageIndex] || images[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) return;
    const productLink = `${window.location.origin}/products/${id}`;
    const link = generateWhatsAppLink(whatsappNumber, name, code, color, productLink);
    
    // Mobile/iOS Safari compatibility
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.location.href = link;
    } else {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };
  
  return (
    <>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 h-full flex flex-col">
        <div className="relative overflow-hidden aspect-square bg-muted">
          {displayImage ? (
            <img
              src={displayImage}
              alt={name}
              className="object-center object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hero-from to-hero-to">
              <span className="text-4xl text-muted-foreground/20">🎨</span>
            </div>
          )}

          {/* Image Carousel Controls */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
          {category && (
            <Badge variant="secondary" className="text-xs w-fit">
              {category.name}
            </Badge>
          )}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{description}</p>
          <div className="space-y-1">
            {price ? (
              <p className="text-xl font-bold text-primary">RS. {!isNaN(Number(price)) ? Number(price).toFixed(2) : "N/A"}</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">Price on inquiry</p>
            )}
            {inStock ? (
              <p className="text-xs text-muted-foreground">{stockQuantity} in stock</p>
            ) : (
              <p className="text-xs text-destructive">Out of stock</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2 grid grid-cols-2 w-full">
          <Link to={`/products/${id}`} className="w-full">
            <Button variant="outline" className="w-full group/btn">
              <Eye className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </Link>
          <Button 
            onClick={() => setIsAddToCartOpen(true)}
            disabled={!inStock}
            className="w-full bg-primary hover:bg-primary/90 group/btn"
          >
            <ShoppingCart className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </CardFooter>
      </Card>

      <AddToCartDialog
        open={isAddToCartOpen}
        onOpenChange={setIsAddToCartOpen}
        product={{
          id,
          name,
          code,
          price: price || 0,
          image_url: displayImage,
          stock_quantity: stockQuantity,
        }}
      />
    </>
  );
};

export default ProductCard;
