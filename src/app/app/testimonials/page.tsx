"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { TestimonialImageUpload } from "@/components/testimonials/TestimonialImageUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      const response = await fetch(
        `/api/testimonials?websiteId=${selectedWebsiteId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch testimonials");
      }

      const data = await response.json();
      console.log("Received testimonials data:", data);
      setTestimonials(data.testimonials || []);
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
  }, [selectedWebsiteId, toast]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  useEffect(() => {
    let filtered = testimonials;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (testimonial) =>
          testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testimonial.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testimonial.company
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          testimonial.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    filtered = filtered.filter(
      (testimonial) =>
        statusFilter === "all" ||
        (statusFilter === "active" && testimonial.isActive) ||
        (statusFilter === "inactive" && !testimonial.isActive)
    );

    setFilteredTestimonials(filtered);
  }, [searchTerm, statusFilter, testimonials]);

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
              {!loading && filteredTestimonials.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardListIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">No testimonials found</p>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first testimonial"}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button onClick={() => openDialog()}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Your First Testimonial
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeleton rows
                      <>
                        {[...Array(5)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-10 w-10 rounded-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-28" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, starIndex) => (
                                  <Skeleton
                                    key={starIndex}
                                    className="h-4 w-4"
                                  />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-12 rounded-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-16 rounded-full" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-8 w-8 rounded ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : filteredTestimonials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10">
                          No testimonials found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTestimonials.map((testimonial) => (
                        <TableRow key={testimonial._id}>
                          <TableCell>
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={testimonial.image}
                                alt={testimonial.name}
                              />
                              <AvatarFallback>
                                {testimonial.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">
                            {testimonial.name}
                          </TableCell>
                          <TableCell>{testimonial.role}</TableCell>
                          <TableCell>{testimonial.company || "-"}</TableCell>
                          <TableCell>
                            <div
                              className="max-w-xs truncate"
                              title={testimonial.message}
                            >
                              {testimonial.message}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <span
                                  key={i}
                                  className={
                                    i < (testimonial.rating || 0)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{testimonial.order}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                testimonial.isActive ? "default" : "secondary"
                              }
                            >
                              {testimonial.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  disabled={deletingId === testimonial._id}
                                >
                                  {deletingId === testimonial._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openDialog(testimonial)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    testimonial._id &&
                                    handleDelete(testimonial._id)
                                  }
                                  disabled={deletingId === testimonial._id}
                                >
                                  {deletingId === testimonial._id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                  )}
                                  {deletingId === testimonial._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
