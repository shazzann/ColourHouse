import { Award, Users, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gradient-to-b from-hero-from/20 to-background">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">About Colour House</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your trusted partner in quality paints and coatings since 2010
            </p>
          </div>

          {/* Story */}
          <div className="max-w-3xl mx-auto mb-16 space-y-6 text-lg leading-relaxed">
            <p>
    Established in 2001, <strong>Colour House</strong> has grown into one of Batticaloa’s most trusted destinations
    for quality brand paints and hardware items. What began as a small local shop has expanded into a reliable
    source for homeowners, vehicle owners, and professional contractors alike.
  </p>

  <p>
    We take pride in offering a wide range of premium products from leading global brands such as
    <strong>Dulux, Debeer, Asian Paints Causeway, 3M, Nippon Paint, JAT Paints, Multilac, Robbialac,</strong>
    and <strong>Wanda</strong>. Our mission is to provide top-quality materials along with expert guidance to help
    you complete any project with confidence.
  </p>

  <p>
    As specialists in <strong>car colour mixing</strong>, we deliver precise and durable colour matches to restore
    or enhance your vehicle’s finish. Whether you're undertaking a small touch-up, painting your home, or managing
    a large-scale project, our team is dedicated to helping bring your vision to life.
  </p>

  <p>
    At <strong>Colour House</strong>, we believe that the right products and the right advice make all the difference.
    That’s why we are committed to excellent customer service and dependable solutions for all your paint and
    hardware needs.
  </p>

  <p>
    <strong>Visit us at:</strong> No. 54, Bazar Street, Batticaloa <br />
    <strong>Contact:</strong> 065 2227097 / 077 3418669 <br />
    <strong>We Accept:</strong> VISA, MasterCard
  </p>
    </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4 p-8 rounded-2xl bg-muted/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Quality First</h3>
              <p className="text-muted-foreground">
                We source only the finest paints and coatings, ensuring lasting results and customer satisfaction.
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-2xl bg-muted/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Expert Service</h3>
              <p className="text-muted-foreground">
                Our knowledgeable team provides personalized advice and support for every project.
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-2xl bg-muted/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Your Vision</h3>
              <p className="text-muted-foreground">
                We're dedicated to helping you achieve the exact look and feel you envision.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
