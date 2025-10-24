"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PropertyTypeImageUpload } from "@/components/property-types/PropertyTypeImageUpload";
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
import { Switch } from "@/components/ui/switch";
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
import {
  Building,
  Building2,
  Crown,
  Edit,
  Home,
  MapPin,
  MoreHorizontal,
  Plus,
  SearchIcon,
  Store,
  TagIcon,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PropertyType {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const iconOptions = [
  { value: "🏠", label: "House", icon: Home },
  { value: "🏢", label: "Building", icon: Building },
  { value: "🏬", label: "Condo", icon: Building2 },
  { value: "🏘️", label: "Townhouse", icon: MapPin },
  { value: "🌍", label: "Land", icon: MapPin },
  { value: "🏪", label: "Commercial", icon: Store },
  { value: "🏚️", label: "Rental", icon: Home },
  { value: "🏛️", label: "Luxury", icon: Crown },
];

export default function PropertyTypesPage() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<PropertyType | null>(null);

  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPropertyTypes, setTotalPropertyTypes] = useState(0);
  const [sortBy, setSortBy] = useState<keyof PropertyType | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [formData, setFormData] = useState<
    Omit<PropertyType, "_id" | "createdAt" | "updatedAt">
  >({
    name: "",
    slug: "",
    description: "",
    image: "",
    icon: "🏠",
    isActive: true,
  });
  const [stats, setStats] = useState({
    totalTypes: 0,
    activeTypes: 0,
    inactiveTypes: 0,
  });

  const { toast } = useToast();
  const { selectedWebsiteId } = useWebsite();

  // Load property types on component mount
  useEffect(() => {
    loadPropertyTypes();
  }, [
    selectedWebsiteId,
    currentPage,
    pageSize,
    searchTerm,
    sortBy,
    sortDirection,
  ]);

  const loadPropertyTypes = async () => {
    if (!selectedWebsiteId) return;

    try {
      setIsLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        websiteId: selectedWebsiteId,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      // Add filters
      if (searchTerm) params.append("search", searchTerm);
      if (sortBy) {
        params.append("sortBy", sortBy.toString());
        params.append("sortDirection", sortDirection);
      }

      const response = await fetch(`/api/property-types?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const types = data.propertyTypes || [];
        setPropertyTypes(types);
        setTotalPropertyTypes(data.total || 0);

        // Calculate stats
        setStats({
          totalTypes: data.total || 0,
          activeTypes: types.filter((t: PropertyType) => t.isActive).length,
          inactiveTypes: types.filter((t: PropertyType) => !t.isActive).length,
        });
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`;

        console.error("API Error loading property types:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          websiteId: selectedWebsiteId,
        });

        toast({
          title: "Failed to load property types",
          description: `Error: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network/Parse Error loading property types:", error);
      toast({
        title: "Connection Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
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
      const url = editingType
        ? `/api/property-types/${editingType._id}?websiteId=${selectedWebsiteId}`
        : `/api/property-types?websiteId=${selectedWebsiteId}`;
      const method = editingType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingType
            ? "Property type updated successfully"
            : "Property type created successfully",
        });
        setIsDialogOpen(false);
        setEditingType(null);
        resetForm();
        loadPropertyTypes();
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

        console.error("API Error saving property type:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          formData,
          url,
        });

        toast({
          title: editingType
            ? "Failed to update property type"
            : "Failed to create property type",
          description: `Error: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network/Parse Error saving property type:", error);
      toast({
        title: "Connection Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (propertyType: PropertyType) => {
    setEditingType(propertyType);
    setFormData({
      name: propertyType.name,
      slug: propertyType.slug,
      description: propertyType.description,
      image: propertyType.image,
      icon: propertyType.icon,
      isActive: propertyType.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property type?")) {
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
      const response = await fetch(
        `/api/property-types/${id}?websiteId=${selectedWebsiteId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property type deleted successfully",
        });
        loadPropertyTypes();
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

        console.error("API Error deleting property type:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          id,
          websiteId: selectedWebsiteId,
        });

        toast({
          title: "Failed to delete property type",
          description: `Error: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network/Parse Error deleting property type:", error);
      toast({
        title: "Connection Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, isActive: boolean) => {
    if (!selectedWebsiteId) {
      toast({
        title: "Error",
        description: "No website selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/property-types/${id}?websiteId=${selectedWebsiteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: `Property type ${
            isActive ? "activated" : "deactivated"
          } successfully`,
        });
        loadPropertyTypes();
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

        console.error("API Error updating property type status:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          id,
          isActive,
          websiteId: selectedWebsiteId,
        });

        toast({
          title: "Failed to update property type status",
          description: `Error: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(
        "Network/Parse Error updating property type status:",
        error
      );
      toast({
        title: "Connection Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      icon: "🏠",
      isActive: true,
    });
  };

  const openCreateDialog = () => {
    setEditingType(null);
    resetForm();
    setIsDialogOpen(true);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Sorting handlers
  const handleSort = (key: keyof PropertyType, direction: SortDirection) => {
    setSortBy(key);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  // Column configuration for DataTable
  const columns: Column<PropertyType>[] = [
    {
      key: "name",
      header: "Property Type",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
            {row.icon}
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      render: (value) => (
        <div className="max-w-xs truncate text-sm text-muted-foreground">
          {value}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Badge variant={value ? "default" : "secondary"}>
            {value ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </div>
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
            <DropdownMenuItem
              onClick={() => {
                setEditingType(row);
                setFormData({
                  name: row.name,
                  slug: row.slug,
                  description: row.description,
                  image: row.image,
                  icon: row.icon,
                  isActive: row.isActive,
                });
                setIsDialogOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toggleStatus(value!, !row.isActive)}
            >
              {row.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(value!)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Helper function to check if property type is recently added (within last 7 days)
  const isRecentlyAdded = (createdAt?: Date) => {
    if (!createdAt) return false;
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading property types...</p>
            </div>
          </div>
        </SidebarInset>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Property Types
              </h1>
              <p className="text-muted-foreground">
                Manage property types for your real estate website
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property Type
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingType
                      ? "Edit Property Type"
                      : "Create New Property Type"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Houses, Apartments, Condos"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      placeholder="URL-friendly name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of this property type"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <span className="mr-2 text-lg">{formData.icon}</span>
                          Select Icon
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {iconOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                icon: option.value,
                              }))
                            }
                          >
                            <span className="mr-2 text-lg">{option.value}</span>
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <PropertyTypeImageUpload
                    value={formData.image}
                    onChange={(imageUrl) =>
                      setFormData((prev) => ({ ...prev, image: imageUrl }))
                    }
                  />

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isActive: checked }))
                      }
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingType ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Types
                </CardTitle>
                <TagIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTypes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Badge variant="default">{stats.activeTypes}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.activeTypes}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <Badge variant="secondary">{stats.inactiveTypes}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {stats.inactiveTypes}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search property types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Types Table */}
          <Card>
            <CardHeader>
              <CardTitle>Property Types ({totalPropertyTypes})</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={propertyTypes}
                columns={columns}
                loading={isLoading}
                pagination={{
                  page: currentPage,
                  pageSize: pageSize,
                  total: totalPropertyTypes,
                  onPageChange: handlePageChange,
                  onPageSizeChange: handlePageSizeChange,
                }}
                sorting={{
                  sortBy: sortBy,
                  sortDirection: sortDirection,
                  onSort: handleSort,
                }}
                emptyMessage={
                  searchTerm || statusFilter !== "all"
                    ? "No property types match your filters"
                    : "No property types found. Add your first property type to get started."
                }
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyTypes.map((propertyType) => (
                    <TableRow key={propertyType._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {propertyType.image ? (
                            <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={propertyType.image}
                                alt={propertyType.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to icon if image fails
                                  e.currentTarget.style.display = "none";
                                  const nextElement = e.currentTarget
                                    .nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = "block";
                                  }
                                }}
                              />
                              <span className="text-lg hidden">
                                {propertyType.icon}
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl flex-shrink-0">
                              {propertyType.icon}
                            </span>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {propertyType.name}
                              </span>
                              {propertyType.createdAt &&
                                isRecentlyAdded(propertyType.createdAt) && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    New
                                  </Badge>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Slug: {propertyType.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {propertyType.description || "No description provided"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            propertyType.isActive ? "default" : "secondary"
                          }
                        >
                          {propertyType.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {propertyType.createdAt
                          ? new Date(
                              propertyType.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(propertyType)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toggleStatus(
                                  propertyType._id!,
                                  !propertyType.isActive
                                )
                              }
                            >
                              <TagIcon className="mr-2 h-4 w-4" />
                              {propertyType.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(propertyType._id!)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
