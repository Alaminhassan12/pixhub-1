import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ImageCard from "@/components/image-card";
import { Grid, List } from "lucide-react";
import type { Category, Image } from "@shared/schema";

export default function Categories() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch images by category
  const { data: categoryImages, isLoading: imagesLoading } = useQuery<Image[]>({
    queryKey: ["/api/images/category", selectedCategory],
    enabled: !!selectedCategory,
  });

  // Fetch all images when no category is selected
  const { data: allImages, isLoading: allImagesLoading } = useQuery<Image[]>({
    queryKey: ["/api/images"],
    enabled: !selectedCategory,
  });

  const currentImages = selectedCategory ? categoryImages : allImages;
  const currentLoading = selectedCategory ? imagesLoading : allImagesLoading;

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      {/* Page Header */}
      <section className="py-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-page-title">
              Browse Categories
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto" data-testid="text-page-description">
              Explore our curated collection of high-quality images organized by category
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" data-testid="text-categories-title">
              All Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categoriesLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="rounded-xl p-4 text-center">
                    <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-4 w-20 mx-auto mb-1" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </Card>
                ))
              ) : (
                categories?.map((category) => (
                  <Card
                    key={category.id}
                    className={`card-3d rounded-xl p-4 text-center cursor-pointer transition-all ${
                      selectedCategory === category.id
                        ? "bg-primary-50 border-primary-500"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                    data-testid={`card-category-${category.slug}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary-500 text-white"
                        : "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                    }`}>
                      <i className={`${category.icon} text-lg`}></i>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm" data-testid={`text-category-name-${category.slug}`}>
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-600" data-testid={`text-category-count-${category.slug}`}>
                      {category.imageCount.toLocaleString()}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Images Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" data-testid="text-images-title">
                {selectedCategory 
                  ? `Images in ${categories?.find(c => c.id === selectedCategory)?.name}`
                  : "All Images"
                }
              </h2>
              <p className="text-gray-600" data-testid="text-images-count">
                {currentImages?.length || 0} images available
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
              >
                <List size={16} />
              </Button>
            </div>
          </div>

          {/* Images Grid/List */}
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "grid grid-cols-1 md:grid-cols-2 gap-6"
          }>
            {currentLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="rounded-2xl overflow-hidden">
                  <Skeleton className={`w-full ${viewMode === "grid" ? "h-48" : "h-64"}`} />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : currentImages && currentImages.length > 0 ? (
              currentImages.map((image) => (
                <ImageCard key={image.id} image={image} showCategory />
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-images">
                <p className="text-gray-600 text-lg">No images found in this category</p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4"
                  data-testid="button-show-all"
                >
                  Show All Images
                </Button>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {currentImages && currentImages.length > 0 && (
            <div className="text-center mt-12">
              <Button className="btn-3d text-white px-8 py-3 rounded-xl font-semibold" data-testid="button-load-more">
                Load More Images
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
