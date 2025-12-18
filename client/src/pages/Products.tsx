import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProducts, getCategories, getSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 12;
  const { toast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
    loadData();
  }, [selectedCategories, searchQuery]);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsResult, categoriesData, settingsData] = await Promise.all([
        getProducts(selectedCategories.length > 0 ? selectedCategories : undefined, searchQuery, currentPage, itemsPerPage),
        getCategories(),
        getSettings(),
      ]);
      
      setProducts(productsResult.data);
      setTotalCount(productsResult.count);
      setCategories(categoriesData);
      if (settingsData) {
        setWhatsappNumber(settingsData.whatsapp_number);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gradient-to-b from-hero-from/20 to-background">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Our Products</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our complete collection of premium paints and coatings
            </p>
          </div>

          {/* Filters */}
          <div className="max-w-6xl mx-auto mb-12">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, codes, or brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative inline-block w-full sm:w-auto" ref={dropdownRef}>
              <Button
                variant="outline"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-2"
              >
                <span>
                  {selectedCategories.length === 0
                    ? "All Categories"
                    : `${selectedCategories.length} categor${selectedCategories.length === 1 ? "y" : "ies"} selected`}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </Button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-3 w-full sm:w-80">
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-sm cursor-pointer font-normal flex-1"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="border-t mt-3 pt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCategories([])}
                        className="flex-1 text-xs"
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex-1 text-xs"
                      >
                        Done
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-8">
                {products.map((product) => {
                  const images = product.images ? JSON.parse(product.images) : [];
                  const imageUrl = images.length > 0 ? images[0] : undefined;

                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      description={product.description || ""}
                      price={product.price}
                      imageUrl={imageUrl}
                      imageUrls={images}
                      stockQuantity={product.stock_quantity}
                      category={undefined}
                      code={product.code}
                      color={product.color}
                      whatsappNumber={whatsappNumber}
                    />
                  );
                })}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevPage}
                  className="px-4 py-2 border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                </div>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!hasNextPage}
                  className="px-4 py-2 border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>

              {/* Results info */}
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} products
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
