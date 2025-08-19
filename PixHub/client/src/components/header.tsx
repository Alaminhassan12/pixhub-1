import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Camera } from "lucide-react";

export default function Header() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const socialLinks = [
    { icon: "fab fa-facebook", href: "#", label: "Facebook" },
    { icon: "fab fa-instagram", href: "#", label: "Instagram" },
    { icon: "fab fa-twitter", href: "#", label: "Twitter" },
    { icon: "fab fa-pinterest", href: "#", label: "Pinterest" },
    { icon: "fab fa-youtube", href: "#", label: "YouTube" },
  ];

  const navigationItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: "Premium", href: "/premium" },
    { label: "Subscription", href: "/subscription" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="bg-gray-900 text-white text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <Link href="/about" className="hover:text-primary-500 transition-colors" data-testid="link-about">
              About
            </Link>
            <Link href="/terms" className="hover:text-primary-500 transition-colors" data-testid="link-terms">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-primary-500 transition-colors" data-testid="link-privacy">
              Privacy
            </Link>
          </div>
          <div className="flex space-x-3">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="hover:text-primary-500 transition-colors"
                aria-label={social.label}
                data-testid={`link-social-${social.label.toLowerCase()}`}
              >
                <i className={social.icon}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2" data-testid="link-logo">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Camera className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PixelShare</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium transition-colors hover:text-primary-500 ${
                    location === item.href ? "text-primary-500" : "text-gray-700"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex max-w-md">
              <Input
                type="text"
                placeholder="Search images, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none"
                data-testid="input-search"
              />
              <Button type="submit" className="btn-3d rounded-l-none" data-testid="button-search">
                <Search size={16} />
              </Button>
            </form>

            {/* CTA Buttons - Desktop */}
            <div className="hidden md:flex space-x-3">
              <Button className="btn-3d text-white" data-testid="button-signup">
                Sign Up
              </Button>
              <Button variant="outline" className="border-primary-500 text-primary-500 hover:bg-primary-50" data-testid="button-login">
                Login
              </Button>
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="flex">
                    <Input
                      type="text"
                      placeholder="Search images, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-r-none"
                      data-testid="input-search-mobile"
                    />
                    <Button type="submit" className="btn-3d rounded-l-none" data-testid="button-search-mobile">
                      <Search size={16} />
                    </Button>
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`font-medium py-2 px-3 rounded transition-colors hover:text-primary-500 hover:bg-primary-50 ${
                          location === item.href ? "text-primary-500 bg-primary-50" : "text-gray-700"
                        }`}
                        data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile CTA Buttons */}
                  <div className="flex flex-col space-y-3">
                    <Button className="btn-3d text-white" data-testid="button-signup-mobile">
                      Sign Up
                    </Button>
                    <Button variant="outline" className="border-primary-500 text-primary-500" data-testid="button-login-mobile">
                      Login
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
