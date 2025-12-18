import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, PaintBucket, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import CartDrawer from "./CartDrawer";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}

            <Link to="/" className="flex items-center space-x-2 group">
              <img
                src="/logo.png"
                alt="Colour House Logo"
                className="h-8 w-8 object-contain group-hover:rotate-12 transition-transform"
              />
              <span
                className="text-3xl font-bold  bg-clip-text "
                style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.04em", fontWeight: "bold" , color: "rgba(15, 71, 158)" }}
              >
                COLOUR HOU<span className="text-red-700">S</span>E
              </span>

              {/* <span className="text-3xl font-bold text-blue-600">
                COLOUR HOU<span className="text-red-600"></span>e
              </span> */}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  <Button variant="ghost" className="text-base">
                    {link.label}
                  </Button>
                </Link>
              ))}
              {/* <Link to="/admin">
                <Button variant="outline" className="ml-4">
                  Admin
                </Button>
              </Link> */}

              {/* Cart Icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative ml-2 hover:bg-primary/10"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile Menu Button and Cart Button */}
            <div className="md:hidden flex items-center gap-2">
              {/* Cart Icon Mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative hover:bg-primary/10"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-border">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {/* <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Admin
              </Link> */}
            </div>
          )}
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};

export default Navbar;
