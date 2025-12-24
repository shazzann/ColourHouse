import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getProducts } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string;
  stock_quantity: number;
  code?: string;
  color?: string;
}

const NewProductsCarousel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSlide, setAutoSlide] = useState(true);

  const itemsPerView = 4; // Show 4 products at a time on desktop

  // Adjust items per view based on screen size
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [itemsToShow, setItemsToShow] = useState(itemsPerView);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth < 640) {
        setItemsToShow(2);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else if (window.innerWidth < 1536) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await getProducts(undefined, undefined, 1, 12);
        // Get the most recent products (first 12)
        if (result.data) {
          setProducts(result.data.slice(0, 12));
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Auto-slide every 5 seconds - only if there are more than 3 products
  useEffect(() => {
    if (!autoSlide || products.length === 0 || products.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (products.length - itemsToShow + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoSlide, products.length, itemsToShow]);

  const goToPrevious = () => {
    setAutoSlide(false);
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, products.length - itemsToShow) : prev - 1));
    setTimeout(() => setAutoSlide(true), 2000);
  };

  const goToNext = () => {
    setAutoSlide(false);
    setCurrentIndex((prev) => (prev >= products.length - itemsToShow ? 0 : prev + 1));
    setTimeout(() => setAutoSlide(true), 2000);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Latest Products</h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const displayedProducts = products.slice(currentIndex, currentIndex + itemsToShow);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Latest Products</h2>
          <Link to="/products">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group px-8 sm:px-0">
          {/* Left Arrow */}
          {products.length > 3 && (
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-primary/80 hover:bg-primary text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Products Grid */}
          <div className="overflow-hidden">
            <div className="flex gap-2 sm:gap-4 transition-transform duration-500 ease-out">
              {displayedProducts.map((product) => {
                let imageUrl = "";
                try {
                  if (product.images) {
                    const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
                    imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : "";
                  }
                } catch (e) {
                  // ignore
                }

                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="flex-shrink-0 w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/4 group/card"
                  >
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-border/50 h-full flex flex-col">
                      {/* Image Container */}
                      <div className="relative w-full aspect-square bg-muted overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hero-from to-hero-to">
                            <span className="text-4xl text-white/20">🎨</span>
                          </div>
                        )}
                        {product.stock_quantity <= 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-semibold">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col">
                        <h3 className="font-semibold text-sm sm:text-lg line-clamp-2 group-hover/card:text-primary transition-colors flex-shrink-0">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 flex-1">{product.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-2 flex-shrink-0">
                          {product.price ? (
                            <p className="text-xl font-bold text-primary">RS. {!isNaN(Number(product.price)) ? Number(product.price).toFixed(2) : "N/A"}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">Price on inquiry</p>
                          )}
                          {product.stock_quantity > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Arrow */}
          {products.length > 3 && (
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-primary/80 hover:bg-primary text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next products"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Carousel Indicators */}
        {products.length > 3 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(products.length - itemsToShow + 1) || 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setAutoSlide(false);
                  setTimeout(() => setAutoSlide(true), 2000);
                }}
                className={`h-2 rounded-full transition-all ${index === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewProductsCarousel;
