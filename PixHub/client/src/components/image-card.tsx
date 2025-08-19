import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Download, Eye } from "lucide-react";
import { showPremiumRequired, showSuccess } from "@/lib/sweetalert";
import type { Image } from "@shared/schema";

interface ImageCardProps {
  image: Image;
  showCategory?: boolean;
}

export default function ImageCard({ image, showCategory = false }: ImageCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    showSuccess("Image liked!", "Added to your favorites");
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description || image.title,
          url: window.location.origin + `/images/${image.id}`,
        });
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.origin + `/images/${image.id}`);
      showSuccess("Link copied!", "Image link copied to clipboard");
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (image.type === "premium") {
      const result = await showPremiumRequired();
      if (result.isConfirmed) {
        // Redirect to subscription page
        window.location.href = "/subscription";
      }
    } else {
      showSuccess("Download started!", "Your image is being prepared");
      // TODO: Implement actual download logic
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (image.type === "free") {
      showPremiumRequired();
    }
  };

  // Prevent right-click on images
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showSuccess("Protected Content", "Right-click is disabled to protect our content");
  };

  return (
    <Card 
      className="card-3d bg-white rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-image-${image.id}`}
    >
      <Link href={`/images/${image.id}`}>
        <div className="relative">
          <img
            src={image.thumbnailUrl}
            alt={image.title}
            className="w-full h-48 object-cover image-hover-zoom"
            onContextMenu={handleContextMenu}
            data-testid={`img-thumbnail-${image.id}`}
          />
          
          {/* Badge */}
          <Badge 
            className={`absolute top-3 right-3 ${
              image.type === "premium" 
                ? "premium-badge text-white" 
                : "bg-green-500 text-white"
            }`}
            data-testid={`badge-type-${image.id}`}
          >
            {image.type === "premium" ? "PREMIUM" : "FREE"}
          </Badge>
          
          {/* Watermark overlay for free images */}
          {image.type === "free" && (
            <div className="watermark-overlay absolute inset-0 opacity-20" />
          )}
          
          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            <div className="flex space-x-2">
              {image.type === "premium" ? (
                <Button 
                  className="btn-3d text-white px-4 py-2 rounded-lg"
                  onClick={handleDownload}
                  data-testid={`button-download-${image.id}`}
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              ) : (
                <Button 
                  className="btn-3d text-white px-4 py-2 rounded-lg"
                  onClick={handlePreview}
                  data-testid={`button-preview-${image.id}`}
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-gray-900 mb-1" data-testid={`text-title-${image.id}`}>
                {image.title}
              </h4>
              {showCategory && (
                <p className="text-sm text-gray-600" data-testid={`text-category-${image.id}`}>
                  {image.categoryId}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`p-1 transition-colors ${
                  isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`}
                data-testid={`button-like-${image.id}`}
              >
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                data-testid={`button-share-${image.id}`}
              >
                <Share2 size={16} />
              </Button>
            </div>
          </div>
          
          {/* Tags */}
          {image.tags && image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {image.tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-700"
                  data-testid={`badge-tag-${image.id}-${index}`}
                >
                  {tag}
                </Badge>
              ))}
              {image.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                  +{image.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
