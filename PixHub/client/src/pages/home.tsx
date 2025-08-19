import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ImageCard from "@/components/image-card";
import PaymentModal from "@/components/payment-modal";
import { Search, ArrowRight } from "lucide-react";
import type { Image, Category } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "lifetime" | null>(null);

  // Fetch featured images
  const { data: featuredImages, isLoading: featuredLoading } = useQuery<Image[]>({
    queryKey: ["/api/images/featured"],
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch latest images
  const { data: latestImages, isLoading: latestLoading } = useQuery<Image[]>({
    queryKey: ["/api/images"],
  });

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = document.querySelector('.parallax-bg') as HTMLElement;
      if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleUpgradeClick = (plan: "monthly" | "yearly" | "lifetime") => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      {/* Hero Section with Parallax */}
      <section 
        className="parallax-bg min-h-screen flex items-center relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
        data-testid="section-hero"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-primary-500/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-white animate-fade-in-up">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
              Share Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-accent-600">
                Creative Vision
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-gray-200" data-testid="text-hero-description">
              Discover millions of high-quality images, join our premium community, and unlock unlimited downloads.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex max-w-2xl mb-8">
              <Input
                type="text"
                placeholder="Search images, categories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-4 rounded-l-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                data-testid="input-hero-search"
              />
              <Button type="submit" className="btn-3d px-8 py-4 rounded-r-xl" data-testid="button-hero-search">
                <Search size={20} />
              </Button>
            </form>
            
            <div className="flex space-x-4">
              <Link href="/categories">
                <Button className="btn-3d text-white px-8 py-4 rounded-xl font-semibold text-lg" data-testid="button-explore-gallery">
                  Explore Gallery
                </Button>
              </Link>
              <Button
                onClick={() => handleUpgradeClick("yearly")}
                className="glass-effect text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
                data-testid="button-go-premium"
              >
                Go Premium
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-accent-500/20 rounded-full animate-bounce-gentle"></div>
      </section>

      {/* Featured Images Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-featured-title">
              Featured Collections
            </h3>
            <p className="text-gray-600 text-lg" data-testid="text-featured-description">
              Discover trending and premium content from our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="rounded-2xl overflow-hidden">
                  <Skeleton className="w-full h-64" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredImages?.map((image) => (
                <ImageCard key={image.id} image={image} showCategory />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-categories-title">
              Browse Categories
            </h3>
            <p className="text-gray-600 text-lg" data-testid="text-categories-description">
              Find exactly what you're looking for
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="card-3d rounded-xl p-6 text-center">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-5 w-20 mx-auto mb-1" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </Card>
              ))
            ) : (
              categories?.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="card-3d bg-white rounded-xl p-6 text-center cursor-pointer group" data-testid={`card-category-${category.slug}`}>
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <i className={`${category.icon} text-white text-2xl`}></i>
                    </div>
                    <h4 className="font-bold text-gray-900" data-testid={`text-category-name-${category.slug}`}>
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600" data-testid={`text-category-count-${category.slug}`}>
                      {category.imageCount.toLocaleString()} images
                    </p>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Images Gallery */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900" data-testid="text-latest-title">
              Latest Uploads
            </h3>
            <div className="flex space-x-4">
              <Button variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-200" data-testid="button-filter-all">
                All
              </Button>
              <Button className="bg-primary-500 text-white" data-testid="button-filter-free">
                Free
              </Button>
              <Button variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-200" data-testid="button-filter-premium">
                Premium
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {latestLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="rounded-2xl overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              latestImages?.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))
            )}
          </div>

          {/* Load More Button */}
          <div className="text-center">
            <Link href="/categories">
              <Button className="btn-3d text-white px-8 py-3 rounded-xl font-semibold" data-testid="button-load-more">
                Load More Images
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription Preview */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <h3 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-upgrade-title">
              Ready to Go Premium?
            </h3>
            <p className="text-xl text-blue-100 mb-8" data-testid="text-upgrade-description">
              Unlock unlimited downloads, exclusive content, and premium features
            </p>
            <Link href="/subscription">
              <Button className="glass-effect text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors" data-testid="button-view-plans">
                View Plans
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
}
