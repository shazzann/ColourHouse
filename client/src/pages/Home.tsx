import { Link } from "react-router-dom";
import { ArrowRight, Palette, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  const features = [
    {
      icon: Palette,
      title: "Wide Selection",
      description: "Explore our extensive range of premium paints and coatings for every project.",
    },
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "All products backed by our quality guarantee and expert support.",
    },
    {
      icon: Sparkles,
      title: "Expert Advice",
      description: "Get professional color consultation and application guidance.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-hero-from to-hero-to py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Colour Your World With
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Quality Paints
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our premium collection of interior and exterior paints. 
              Professional quality, vibrant colors, lasting finish.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/products">
                <Button size="lg" className="text-lg group">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Colour House Paints?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center space-y-4 p-6 rounded-xl hover:bg-muted/50 transition-colors"
                style={{
                  animation: `fade-in 0.5s ease-out ${index * 0.1}s backwards`,
                }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Start Your Project?
            </h2>
            <p className="text-lg text-muted-foreground">
              Browse our products and contact us on WhatsApp to place your order.
            </p>
            <Link to="/products">
              <Button size="lg" className="text-lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
