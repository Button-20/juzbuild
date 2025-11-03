"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
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
import { CreateFaqRequest, Faq } from "@/types/properties";
import {
  Edit,
  HelpCircle,
  Loader2,
  MoreHorizontal,
  PlusIcon,
  SearchIcon,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function FaqsPage() {
  const { selectedWebsiteId } = useWebsite();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

  const [formData, setFormData] = useState<CreateFaqRequest>({
    question: "",
    answer: "",
    category: "",
    order: 0,
    isActive: true,
  });

  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>("order");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const fetchFaqs = useCallback(async () => {
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

      const response = await fetch(`/api/faqs?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch FAQs");
      }

      const data = await response.json();
      console.log("Received FAQs data:", data);
      setFaqs(data.faqs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast({
        title: "Error",
        description: `Failed to load FAQs: ${
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
    fetchFaqs();
  }, [fetchFaqs]);

  // Since we're doing server-side filtering, we don't need client-side filtering
  useEffect(() => {
    setFilteredFaqs(faqs);
  }, [faqs]);

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "",
      order: 0,
      isActive: true,
    });
    setEditingFaq(null);
  };

  const openDialog = (faq?: Faq) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || "",
        order: faq.order,
        isActive: faq.isActive,
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
      const url = editingFaq
        ? `/api/faqs/${editingFaq._id}?websiteId=${selectedWebsiteId}`
        : `/api/faqs?websiteId=${selectedWebsiteId}`;

      const method = editingFaq ? "PUT" : "POST";

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
          errorData.error || `Failed to ${editingFaq ? "update" : "create"} FAQ`
        );
      }

      toast({
        title: "Success",
        description: `FAQ ${editingFaq ? "updated" : "created"} successfully`,
      });
      closeDialog();
      fetchFaqs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast({
        title: "Error",
        description: `Failed to save FAQ: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) {
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
        `/api/faqs/${id}?websiteId=${selectedWebsiteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete FAQ");
      }

      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });
      fetchFaqs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast({
        title: "Error",
        description: `Failed to delete FAQ: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: faqs.length,
    active: faqs.filter((f) => f.isActive).length,
    inactive: faqs.filter((f) => !f.isActive).length,
    categories: new Set(faqs.map((f) => f.category).filter(Boolean)).size,
  };

  // DataTable columns configuration
  const columns: Column<Faq>[] = [
    {
      key: "question",
      header: "Question",
      sortable: true,
      render: (value, row) => (
        <div className="max-w-md">
          <div className="font-medium">{value as string}</div>
          {row.category && (
            <Badge variant="outline" className="mt-1 text-xs">
              {row.category}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "answer",
      header: "Answer",
      sortable: false,
      render: (value) => (
        <div className="max-w-xs truncate text-sm">{value as string}</div>
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
              <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
              <p className="text-muted-foreground">
                Manage frequently asked questions for your website
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add FAQ
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingFaq ? "Edit FAQ" : "Add New FAQ"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Question *</Label>
                    <Input
                      id="question"
                      value={formData.question}
                      onChange={(e) =>
                        setFormData({ ...formData, question: e.target.value })
                      }
                      placeholder="What is your question?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="answer">Answer *</Label>
                    <Textarea
                      id="answer"
                      value={formData.answer}
                      onChange={(e) =>
                        setFormData({ ...formData, answer: e.target.value })
                      }
                      placeholder="Provide a detailed answer..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value,
                          })
                        }
                        placeholder="General"
                      />
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
                          {editingFaq ? "Updating..." : "Creating..."}
                        </>
                      ) : editingFaq ? (
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
                      Total FAQs
                    </CardTitle>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
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
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
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
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inactive}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Categories
                    </CardTitle>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.categories}</div>
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
                  placeholder="Search FAQs..."
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
                    Loading FAQs...
                  </>
                ) : (
                  `FAQs (${filteredFaqs.length})`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={faqs}
                loading={loading}
                pagination={{
                  page: currentPage,
                  pageSize: 10,
                  total: total,
                  onPageChange: handlePageChange,
                  onPageSizeChange: () => {}, // Not implemented yet
                }}
                sorting={{
                  sortBy: sortBy as keyof Faq,
                  sortDirection: sortDirection,
                  onSort: handleSort,
                }}
                emptyMessage={
                  searchTerm || statusFilter !== "all" ? (
                    "No FAQs match your filters"
                  ) : (
                    <div className="flex flex-col items-center">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p>No FAQs found. Add your first FAQ to get started.</p>
                    </div>
                  )
                }
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
