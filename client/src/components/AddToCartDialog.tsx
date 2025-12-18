import { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    code?: string;
    price: number;
    image_url?: string;
    stock_quantity: number;
  };
}

const AddToCartDialog = ({
  open,
  onOpenChange,
  product,
}: AddToCartDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (quantity <= 0 || quantity > product.stock_quantity) {
      toast({
        title: "Invalid Quantity",
        description: `Please enter a quantity between 1 and ${product.stock_quantity}`,
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      addToCart({
        id: product.id,
        name: product.name,
        code: product.code,
        price: product.price,
        quantity,
        image_url: product.image_url,
      });

      toast({
        title: "Success",
        description: `${product.name} added to cart!`,
      });

      setQuantity(1);
      onOpenChange(false);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Cart</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            {product.code && (
              <p className="text-sm text-muted-foreground">
                Code: {product.code}
              </p>
            )}
            <p className="text-2xl font-bold text-primary">
              Rs. {!isNaN(Number(product.price)) ? Number(product.price).toFixed(2) : "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">
              {product.stock_quantity} available
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <input
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(
                    Math.min(Math.max(1, val), product.stock_quantity)
                  );
                }}
                className="w-16 text-center border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setQuantity(
                    Math.min(product.stock_quantity, quantity + 1)
                  )
                }
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Total: Rs.{" "}
              {(product.price * quantity).toFixed(2)}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock_quantity === 0}
            className="bg-primary hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAdding ? "Adding..." : "Add to Cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartDialog;
