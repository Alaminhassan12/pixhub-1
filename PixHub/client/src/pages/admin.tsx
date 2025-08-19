import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { 
  Images, 
  Users, 
  DollarSign, 
  Download, 
  Plus, 
  Edit, 
  Check, 
  X,
  Crown,
  Calendar,
  TrendingUp,
  Eye
} from "lucide-react";
import { showConfirmation, showSuccess, showError } from "@/lib/sweetalert";
import { apiRequest } from "@/lib/queryClient";
import type { Payment, Image, Category, InsertImage, InsertCategory } from "@shared/schema";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: pendingPayments, isLoading: pendingLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments/pending"],
  });

  const { data: images, isLoading: imagesLoading } = useQuery<Image[]>({
    queryKey: ["/api/images"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Mutations
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/payments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      showSuccess("Payment Updated", "Payment status has been updated successfully");
    },
    onError: () => {
      showError("Update Failed", "Failed to update payment status");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (imageData: InsertImage) => {
      return apiRequest("POST", "/api/images", imageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      showSuccess("Image Uploaded", "Image has been uploaded successfully");
      setIsUploadModalOpen(false);
    },
    onError: () => {
      showError("Upload Failed", "Failed to upload image");
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: InsertCategory) => {
      return apiRequest("POST", "/api/categories", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      showSuccess("Category Created", "Category has been created successfully");
      setIsCategoryModalOpen(false);
    },
    onError: () => {
      showError("Creation Failed", "Failed to create category");
    },
  });

  // Handle payment approval/rejection
  const handlePaymentAction = async (paymentId: string, action: "completed" | "rejected") => {
    const actionText = action === "completed" ? "approve" : "reject";
    const result = await showConfirmation(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Payment?`,
      `Are you sure you want to ${actionText} this payment?`
    );

    if (result.isConfirmed) {
      updatePaymentMutation.mutate({ id: paymentId, status: action });
    }
  };

  // Calculate dashboard stats
  const totalImages = images?.length || 0;
  const premiumUsers = payments?.filter(p => p.status === "completed").length || 0;
  const totalRevenue = payments
    ?.filter(p => p.status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.amountUSD), 0) || 0;
  const totalDownloads = images?.reduce((sum, img) => sum + img.downloadCount, 0) || 0;

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      {/* Admin Header */}
      <section className="py-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2" data-testid="text-admin-title">
              Admin Dashboard
            </h1>
            <p className="text-blue-100" data-testid="text-admin-description">
              Manage your platform content and payments
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="images" data-testid="tab-images">Images</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100" data-testid="text-stat-images-label">Total Images</p>
                      <p className="text-3xl font-bold" data-testid="text-stat-images-value">
                        {totalImages.toLocaleString()}
                      </p>
                    </div>
                    <Images className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100" data-testid="text-stat-users-label">Premium Users</p>
                      <p className="text-3xl font-bold" data-testid="text-stat-users-value">
                        {premiumUsers.toLocaleString()}
                      </p>
                    </div>
                    <Crown className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent-500 to-accent-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100" data-testid="text-stat-revenue-label">Revenue</p>
                      <p className="text-3xl font-bold" data-testid="text-stat-revenue-value">
                        ${totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100" data-testid="text-stat-downloads-label">Downloads</p>
                      <p className="text-3xl font-bold" data-testid="text-stat-downloads-value">
                        {totalDownloads.toLocaleString()}
                      </p>
                    </div>
                    <Download className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span data-testid="text-pending-payments-title">Pending Payments</span>
                  <Badge variant="secondary" data-testid="badge-pending-count">
                    {pendingPayments?.length || 0} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : pendingPayments && pendingPayments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-user">User</TableHead>
                          <TableHead data-testid="header-plan">Plan</TableHead>
                          <TableHead data-testid="header-amount">Amount</TableHead>
                          <TableHead data-testid="header-network">Network</TableHead>
                          <TableHead data-testid="header-txid">TxID</TableHead>
                          <TableHead data-testid="header-actions">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium" data-testid={`cell-user-${payment.id}`}>
                              {payment.userId}
                            </TableCell>
                            <TableCell data-testid={`cell-plan-${payment.id}`}>
                              <Badge variant="outline">{payment.plan}</Badge>
                            </TableCell>
                            <TableCell data-testid={`cell-amount-${payment.id}`}>
                              ${payment.amountUSD}
                            </TableCell>
                            <TableCell data-testid={`cell-network-${payment.id}`}>
                              {payment.network}
                            </TableCell>
                            <TableCell className="font-mono text-sm" data-testid={`cell-txid-${payment.id}`}>
                              {payment.txid.substring(0, 12)}...
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => handlePaymentAction(payment.id, "completed")}
                                  disabled={updatePaymentMutation.isPending}
                                  data-testid={`button-approve-${payment.id}`}
                                >
                                  <Check size={14} className="mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handlePaymentAction(payment.id, "rejected")}
                                  disabled={updatePaymentMutation.isPending}
                                  data-testid={`button-reject-${payment.id}`}
                                >
                                  <X size={14} className="mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8" data-testid="text-no-pending-payments">
                    No pending payments
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span data-testid="text-images-title">Manage Images</span>
                  <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-3d text-white" data-testid="button-upload-image">
                        <Plus size={16} className="mr-2" />
                        Upload Image
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle data-testid="text-upload-modal-title">Upload New Image</DialogTitle>
                      </DialogHeader>
                      <ImageUploadForm 
                        categories={categories || []}
                        onSubmit={(data) => uploadImageMutation.mutate(data)}
                        isLoading={uploadImageMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i}>
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="p-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images?.map((image) => (
                      <Card key={image.id} className="overflow-hidden" data-testid={`card-admin-image-${image.id}`}>
                        <div className="relative">
                          <img
                            src={image.thumbnailUrl}
                            alt={image.title}
                            className="w-full h-48 object-cover"
                          />
                          <Badge
                            className={`absolute top-2 right-2 ${
                              image.type === "premium" ? "premium-badge text-white" : "bg-green-500 text-white"
                            }`}
                          >
                            {image.type.toUpperCase()}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold truncate" data-testid={`text-admin-image-title-${image.id}`}>
                            {image.title}
                          </h3>
                          <p className="text-sm text-gray-600" data-testid={`text-admin-image-downloads-${image.id}`}>
                            {image.downloadCount} downloads
                          </p>
                          <Button size="sm" variant="outline" className="mt-2 w-full" data-testid={`button-edit-image-${image.id}`}>
                            <Edit size={14} className="mr-2" />
                            Edit
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span data-testid="text-categories-title">Manage Categories</span>
                  <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-3d text-white" data-testid="button-create-category">
                        <Plus size={16} className="mr-2" />
                        Create Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle data-testid="text-category-modal-title">Create New Category</DialogTitle>
                      </DialogHeader>
                      <CategoryForm
                        onSubmit={(data) => createCategoryMutation.mutate(data)}
                        isLoading={createCategoryMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="w-12 h-12 rounded-full mb-3" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories?.map((category) => (
                      <Card key={category.id} className="p-6 text-center" data-testid={`card-admin-category-${category.slug}`}>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className={`${category.icon} text-white`}></i>
                        </div>
                        <h3 className="font-bold mb-1" data-testid={`text-admin-category-name-${category.slug}`}>
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-testid={`text-admin-category-count-${category.slug}`}>
                          {category.imageCount} images
                        </p>
                        <Button size="sm" variant="outline" className="w-full" data-testid={`button-edit-category-${category.slug}`}>
                          <Edit size={14} className="mr-2" />
                          Edit
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-all-payments-title">All Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-date">Date</TableHead>
                          <TableHead data-testid="header-user">User</TableHead>
                          <TableHead data-testid="header-plan">Plan</TableHead>
                          <TableHead data-testid="header-amount">Amount</TableHead>
                          <TableHead data-testid="header-network">Network</TableHead>
                          <TableHead data-testid="header-status">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell data-testid={`cell-date-${payment.id}`}>
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium" data-testid={`cell-user-${payment.id}`}>
                              {payment.userId}
                            </TableCell>
                            <TableCell data-testid={`cell-plan-${payment.id}`}>
                              <Badge variant="outline">{payment.plan}</Badge>
                            </TableCell>
                            <TableCell data-testid={`cell-amount-${payment.id}`}>
                              ${payment.amountUSD}
                            </TableCell>
                            <TableCell data-testid={`cell-network-${payment.id}`}>
                              {payment.network}
                            </TableCell>
                            <TableCell data-testid={`cell-status-${payment.id}`}>
                              <Badge
                                className={
                                  payment.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : payment.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8" data-testid="text-no-payments">
                    No payments found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center" data-testid="text-analytics-overview-title">
                    <TrendingUp size={20} className="mr-2" />
                    Platform Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center" data-testid="metric-total-images">
                    <span>Total Images</span>
                    <span className="font-bold">{totalImages}</span>
                  </div>
                  <div className="flex justify-between items-center" data-testid="metric-premium-images">
                    <span>Premium Images</span>
                    <span className="font-bold">
                      {images?.filter(img => img.type === "premium").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center" data-testid="metric-free-images">
                    <span>Free Images</span>
                    <span className="font-bold">
                      {images?.filter(img => img.type === "free").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center" data-testid="metric-total-categories">
                    <span>Total Categories</span>
                    <span className="font-bold">{categories?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center" data-testid="text-analytics-revenue-title">
                    <DollarSign size={20} className="mr-2" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center" data-testid="metric-total-revenue">
                    <span>Total Revenue</span>
                    <span className="font-bold">${totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center" data-testid="metric-monthly-revenue">
                    <span>Monthly Plans</span>
                    <span className="font-bold">
                      {payments?.filter(p => p.plan === "monthly" && p.status === "completed").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center" data-testid="metric-yearly-revenue">
                    <span>Yearly Plans</span>
                    <span className="font-bold">
                      {payments?.filter(p => p.plan === "yearly" && p.status === "completed").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center" data-testid="metric-lifetime-revenue">
                    <span>Lifetime Plans</span>
                    <span className="font-bold">
                      {payments?.filter(p => p.plan === "lifetime" && p.status === "completed").length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

// Image Upload Form Component
function ImageUploadForm({ 
  categories, 
  onSubmit, 
  isLoading 
}: { 
  categories: Category[]; 
  onSubmit: (data: InsertImage) => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    tags: "",
    type: "free" as "free" | "premium",
    postimageUrl: "",
    thumbnailUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          data-testid="input-image-title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          data-testid="textarea-image-description"
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
          <SelectTrigger data-testid="select-image-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} data-testid={`option-category-${category.slug}`}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="landscape, nature, outdoor"
          data-testid="input-image-tags"
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value: "free" | "premium") => setFormData({ ...formData, type: value })}>
          <SelectTrigger data-testid="select-image-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free" data-testid="option-type-free">Free</SelectItem>
            <SelectItem value="premium" data-testid="option-type-premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="postimageUrl">Image URL</Label>
        <Input
          id="postimageUrl"
          value={formData.postimageUrl}
          onChange={(e) => setFormData({ ...formData, postimageUrl: e.target.value })}
          placeholder="https://postimg.cc/..."
          required
          data-testid="input-image-url"
        />
      </div>

      <div>
        <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
        <Input
          id="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
          placeholder="https://postimg.cc/..."
          required
          data-testid="input-thumbnail-url"
        />
      </div>

      <Button type="submit" className="btn-3d w-full text-white" disabled={isLoading} data-testid="button-submit-image">
        {isLoading ? "Uploading..." : "Upload Image"}
      </Button>
    </form>
  );
}

// Category Form Component
function CategoryForm({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (data: InsertCategory) => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "fas fa-folder",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          data-testid="input-category-name"
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          data-testid="input-category-slug"
        />
      </div>

      <div>
        <Label htmlFor="icon">Icon Class</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="fas fa-mountain"
          required
          data-testid="input-category-icon"
        />
      </div>

      <Button type="submit" className="btn-3d w-full text-white" disabled={isLoading} data-testid="button-submit-category">
        {isLoading ? "Creating..." : "Create Category"}
      </Button>
    </form>
  );
}
