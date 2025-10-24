"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { TestimonialImageUpload } from "@/components/testimonials/TestimonialImageUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Column, DataTable, SortDirection } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useWebsite } from "@/contexts/website-context";
import { useToast } from "@/hooks/use-toast";
import { CreateTestimonialRequest, Testimonial } from "@/types/properties";
import {
  ClipboardListIcon,
  Edit,
  Loader2,
  MoreHorizontal,
  PlusIcon,
  SearchIcon,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function TestimonialsPage() {
  const { selectedWebsiteId } = useWebsite();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<
    Testimonial[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);

  const [formData, setFormData] = useState<CreateTestimonialRequest>({
    name: "",
    role: "",
    company: "",
    message: "",
    image: "",
    rating: 5,
    order: 0,
    isActive: true,
  });

  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>("order");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const fetchTestimonials = useCallback(async () => {
    if (!selectedWebsiteId) {
      toast({
        title: "Error",
        description: "No website selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        websiteId: selectedWebsiteId,
        page: currentPage.toString(),
        limit: "10",
        sortBy: sortBy,
        sortDirection: sortDirection,
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (statusFilter !== "all") {
        params.append("isActive", statusFilter === "active" ? "true" : "false");
      }

      const response = await fetch(`/api/testimonials?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch testimonials");
      }

      const data = await response.json();
      console.log("Received testimonials data:", data);
      setTestimonials(data.testimonials || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast({
        title: "Error",
        description: `Failed to load testimonials: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    selectedWebsiteId,
    toast,
    currentPage,
    sortBy,
    sortDirection,
    searchTerm,
    statusFilter,
  ]);

  // Pagination and sorting handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: string, direction: SortDirection) => {
    setSortBy(key);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  };

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Since we're doing server-side filtering, we don't need client-side filtering
  useEffect(() => {
    setFilteredTestimonials(testimonials);
  }, [testimonials]);

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      company: "",
      message: "",
      image: "",
      rating: 5,
      order: 0,
      isActive: true,
    });
    setEditingTestimonial(null);
  };

  const openDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        company: testimonial.company,
        message: testimonial.message,
        image: testimonial.image || "",
        rating: testimonial.rating,
        order: testimonial.order,
        isActive: testimonial.isActive,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWebsiteId) {
      toast({
        title: "Error",
        description: "No website selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const url = editingTestimonial
        ? `/api/testimonials/${editingTestimonial._id}?websiteId=${selectedWebsiteId}`
        : `/api/testimonials?websiteId=${selectedWebsiteId}`;

      const method = editingTestimonial ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${editingTestimonial ? "update" : "create"} testimonial`
        );
      }

      toast({
        title: "Success",
        description: `Testimonial ${
          editingTestimonial ? "updated" : "created"
        } successfully`,
      });
      closeDialog();
      fetchTestimonials();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast({
        title: "Error",
        description: `Failed to save testimonial: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    if (!selectedWebsiteId) {
      toast({
        title: "Error",
        description: "No website selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(
        `/api/testimonials/${id}?websiteId=${selectedWebsiteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete testimonial");
      }

      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "Error",
        description: `Failed to delete testimonial: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: testimonials.length,
    active: testimonials.filter((t) => t.isActive).length,
    inactive: testimonials.filter((t) => !t.isActive).length,
    averageRating:
      testimonials.length > 0
        ? (
            testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) /
            testimonials.length
          ).toFixed(1)
        : "0",
  };

  // DataTable columns configuration
  const columns: Column<Testimonial>[] = [
    {
      key: "name",
      header: "Testimonial",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.image || ""} alt={value as string} />
            <AvatarFallback>
              {(value as string)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{value as string}</div>
            <div className="text-sm text-muted-foreground">{row.role}</div>
            {row.company && (
              <div className="text-xs text-muted-foreground">
                at {row.company}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      sortable: false,
      render: (value) => (
        <div className="max-w-xs truncate text-sm">{value as string}</div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          {"★".repeat((value as number) || 5)}
          <span className="ml-1 text-sm text-muted-foreground">
            {value || 5}/5
          </span>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "order",
      header: "Order",
      sortable: true,
      render: (value) => (
        <div className="text-sm font-mono">{value as number}</div>
      ),
    },
    {
      key: "_id",
      header: "Actions",
      sortable: false,
      render: (value, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDialog(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => row._id && handleDelete(row._id)}
              className="text-red-600"
              disabled={!row._id || deletingId === row._id}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deletingId === row._id ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Testimonials
              </h1>
              <p className="text-muted-foreground">
                Manage customer testimonials for your real estate website
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Testimonial
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTestimonial
                      ? "Edit Testimonial"
                      : "Add New Testimonial"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Customer name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        placeholder="Job title"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="Company name"
                      required
                    />
                  </div>

                  <TestimonialImageUpload
                    value={formData.image || ""}
                    onChange={(imageUrl) =>
                      setFormData({ ...formData, image: imageUrl })
                    }
                    disabled={submitting}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="message">Testimonial Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Customer testimonial..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Select
                        value={(formData.rating || 5).toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, rating: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="order">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={formData.order || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isActive">Status</Label>
                      <Select
                        value={(formData.isActive !== undefined
                          ? formData.isActive
                          : true
                        ).toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            isActive: value === "true",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingTestimonial ? "Updating..." : "Creating..."}
                        </>
                      ) : editingTestimonial ? (
                        "Update"
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              // Loading skeletons for stats cards
              <>
                {[...Array(4)].map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Testimonials
                    </CardTitle>
                    <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active
                    </CardTitle>
                    <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.active}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Inactive
                    </CardTitle>
                    <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inactive}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Rating
                    </CardTitle>
                    <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.averageRating}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search testimonials..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading testimonials...
                  </>
                ) : (
                  `Testimonials (${filteredTestimonials.length})`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={testimonials}
                loading={loading}
                pagination={{
                  page: currentPage,
                  pageSize: 10,
                  total: total,
                  onPageChange: handlePageChange,
                  onPageSizeChange: () => {}, // Not implemented yet
                }}
                sorting={{
                  sortBy: sortBy as keyof Testimonial,
                  sortDirection: sortDirection,
                  onSort: handleSort,
                }}
                emptyMessage={
                  searchTerm || statusFilter !== "all"
                    ? "No testimonials match your filters"
                    : "No testimonials found. Add your first testimonial to get started."
                }
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
