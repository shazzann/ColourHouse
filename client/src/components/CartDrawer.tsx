import { useState } from "react";
import { ShoppingCart, Trash2, X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { generateCartWhatsAppMessage } from "@/lib/whatsapp";
import { getSettings } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnquire = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before enquiring.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const settings = await getSettings();
      if (!settings?.whatsapp_number) {
        toast({
          title: "Error",
          description: "WhatsApp number not configured. Please contact support.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Generate WhatsApp message with cart items
      const message = generateCartWhatsAppMessage(items);
      const encodedMessage = encodeURIComponent(message);
      const cleanedPhone = settings.whatsapp_number.replace(/[\s\-\(\)]/g, "");
      const formattedPhone = cleanedPhone.startsWith("+")
        ? cleanedPhone
        : `+${cleanedPhone}`;

      // Build WhatsApp link
      const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

      // For mobile/iOS Safari compatibility, try multiple methods
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        // For iOS, use direct window.location for better compatibility
        window.location.href = whatsappLink;
      } else {
        // For other browsers, use window.open
        window.open(whatsappLink, "_blank", "noopener,noreferrer");
      }

      // Clear cart after successful enquiry
      clearCart();
      onOpenChange(false);

      toast({
        title: "Success",
        description: "Enquiry sent via WhatsApp! Cart cleared.",
      });
    } catch (error) {
      console.error("Error sending enquiry:", error);
      toast({
        title: "Error",
        description: "Failed to send enquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
            </SheetTitle>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add products to get started!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  {/* Product Image */}
                  {item.image_url && (
                    <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                      {(() => {
                        let imageUrl = item.image_url;
                        try {
                          if (!item.image_url.startsWith("http")) {
                            const { data } = supabase.storage
                              .from("product-images")
                              .getPublicUrl(item.image_url);
                            imageUrl = data.publicUrl;
                          }
                        } catch (e) {
                          // ignore
                        }
                        return (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        );
                      })()}
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-1">
                      {item.name}
                    </h3>
                    {item.code && (
                      <p className="text-xs text-muted-foreground">
                        Code: {item.code}
                      </p>
                    )}
                    {item.price > 0 && (
                      <p className="text-sm font-bold text-primary">
                        Rs. {!isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : "N/A"}
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Cart Summary and Actions */}
            <div className="border-t border-border pt-4 space-y-3 mt-auto">
              <div className="flex justify-between items-center px-1">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold text-primary">
                  Rs. {getTotalPrice().toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleEnquire}
                  disabled={isSubmitting || items.length === 0}
                  className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground"
                >
                  {isSubmitting ? "Sending..." : "Enquire via WhatsApp"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Clear Cart
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
