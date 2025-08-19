import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PaymentModal from "@/components/payment-modal";
import { 
  Download, 
  Heart, 
  Share2, 
  Eye, 
  Calendar, 
  Tag, 
  Info,
  Facebook,
  Twitter,
  BookmarkPlus as Pinterest,
  Linkedin
} from "lucide-react";
import { showPremiumRequired, showSuccess, showError } from "@/lib/sweetalert";
import type { Image } from "@shared/schema";

export default function ImageDetail() {
  const [match, params] = useRoute("/images/:id");
  const [isLiked, setIsLiked] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "lifetime" | null>(null);

  const imageId = params?.id;

  const { data: image, isLoading, error } = useQuery<Image>({
    queryKey: ["/api/images", imageId],
    enabled: !!imageId,
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    showSuccess("Image liked!", "Added to your favorites");
  };

  const handleDownload = async () => {
    if (!image) return;

    if (image.type === "premium") {
      const result = await showPremiumRequired();
      if (result.isConfirmed) {
        setSelectedPlan("yearly");
        setIsPaymentModalOpen(true);
      }
    } else {
      showSuccess("Download started!", "Your image is being prepared");
      // TODO: Implement actual download logic
    }
  };

  const handleShare = async (platform?: string) => {
    if (!image) return;

    const shareData = {
      title: image.title,
      text: image.description || image.title,
      url: window.location.href,
    };

    if (platform) {
      let shareUrl = "";
      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
          break;
        case "pinterest":
          shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareData.url)}&description=${encodeURIComponent(shareData.text)}`;
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, "_blank", "width=600,height=400");
      }
    } else if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      showSuccess("Link copied!", "Image link copied to clipboard");
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showError("Protected Content", "Right-click is disabled to protect our content");
  };

  if (!match) {
    return <div>Image not found</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-96 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Image Not Found</h1>
          <p className="text-gray-600 mb-8">The image you're looking for doesn't exist or has been removed.</p>
          <Link href="/categories">
            <Button className="btn-3d text-white">Browse Gallery</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Image */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden" data-testid="card-image-main">
              <div className="relative">
                <img
                  src={image.postimageUrl}
                  alt={image.title}
                  className="w-full h-auto max-h-96 object-contain bg-gray-100"
                  onContextMenu={handleContextMenu}
                  data-testid="img-main"
                />
                
                {/* Badge */}
                <Badge 
                  className={`absolute top-4 right-4 ${
                    image.type === "premium" 
                      ? "premium-badge text-white" 
                      : "bg-green-500 text-white"
                  }`}
                  data-testid="badge-type"
                >
                  {image.type === "premium" ? "PREMIUM" : "FREE"}
                </Badge>
                
                {/* Watermark overlay for free images */}
                {image.type === "free" && (
                  <div className="watermark-overlay absolute inset-0 opacity-30" />
                )}
              </div>
            </Card>

            {/* Image Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900" data-testid="text-image-title">
                      {image.title}
                    </h1>
                    {image.description && (
                      <p className="text-gray-600 mt-2" data-testid="text-image-description">
                        {image.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={`transition-colors ${
                        isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                      }`}
                      data-testid="button-like"
                    >
                      <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare()}
                      className="text-gray-400 hover:text-primary-500 transition-colors"
                      data-testid="button-share"
                    >
                      <Share2 size={20} />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Tags */}
                {image.tags && image.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Tag size={16} className="text-gray-500 mr-2" />
                      <span className="font-medium text-gray-700">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {image.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                          data-testid={`badge-tag-${index}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span data-testid="text-upload-date">
                      Uploaded {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Eye size={16} className="mr-2" />
                    <span data-testid="text-download-count">
                      {image.downloadCount.toLocaleString()} downloads
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="text-download-title">
                  <Download size={20} className="mr-2" />
                  Download Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="btn-3d w-full text-white py-3 font-semibold"
                  onClick={handleDownload}
                  data-testid="button-download"
                >
                  {image.type === "premium" ? "Download HD" : "Download (Watermarked)"}
                </Button>
                
                {image.type === "free" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <Info size={16} className="text-amber-600 mr-2 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-amber-800 font-medium" data-testid="text-watermark-notice">
                          Free Download Notice
                        </p>
                        <p className="text-amber-700">
                          Free downloads include watermark. Upgrade to premium for high-resolution, watermark-free images.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Share */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-share-title">Share This Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleShare("facebook")}
                    className="flex items-center justify-center"
                    data-testid="button-share-facebook"
                  >
                    <Facebook size={16} className="mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare("twitter")}
                    className="flex items-center justify-center"
                    data-testid="button-share-twitter"
                  >
                    <Twitter size={16} className="mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare("pinterest")}
                    className="flex items-center justify-center"
                    data-testid="button-share-pinterest"
                  >
                    <Pinterest size={16} className="mr-2" />
                    Pinterest
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare("linkedin")}
                    className="flex items-center justify-center"
                    data-testid="button-share-linkedin"
                  >
                    <Linkedin size={16} className="mr-2" />
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade to Premium */}
            {image.type === "free" && (
              <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <CardHeader>
                  <CardTitle data-testid="text-premium-title">Go Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 mb-4" data-testid="text-premium-description">
                    Get unlimited access to high-resolution images without watermarks
                  </p>
                  <Button
                    className="glass-effect w-full text-white hover:bg-white/20 border-white/30"
                    onClick={() => {
                      setSelectedPlan("yearly");
                      setIsPaymentModalOpen(true);
                    }}
                    data-testid="button-upgrade-premium"
                  >
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
}
