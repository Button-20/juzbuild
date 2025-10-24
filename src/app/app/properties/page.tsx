"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { BulkPropertyUpload } from "@/components/properties/BulkPropertyUpload";
import { PropertyForm } from "@/components/properties/PropertyForm";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarInset } from "@/components/ui/sidebar";
import { useWebsite } from "@/contexts/website-context";
import { useToast } from "@/hooks/use-toast";
import {
  CURRENCY_OPTIONS,
  Property,
  PROPERTY_STATUSES,
  PropertyType,
} from "@/types/properties";
import {
  BathIcon,
  BedIcon,
  EditIcon,
  EyeIcon,
  HomeIcon,
  MapPinIcon,
  MoreVerticalIcon,
  PlusIcon,
  RulerIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalProperties, setTotalProperties] = useState(0);
  const [sortBy, setSortBy] = useState<keyof Property | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [stats, setStats] = useState({
    totalProperties: 0,
    forSale: 0,
    forRent: 0,
    sold: 0,
    rented: 0,
    featured: 0,
  });

  const { toast } = useToast();
  const { selectedWebsiteId, selectedWebsite } = useWebsite();

  // Fetch properties and property types
  const fetchData = async () => {
    if (!selectedWebsiteId) return;

    try {
      setLoading(true);

      // Build query parameters for properties
      const propertiesParams = new URLSearchParams({
        websiteId: selectedWebsiteId,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      // Add filters
      if (searchTerm) propertiesParams.append("search", searchTerm);
      if (statusFilter !== "all")
        propertiesParams.append("status", statusFilter);
      if (typeFilter !== "all") propertiesParams.append("type", typeFilter);
      if (sortBy) {
        propertiesParams.append("sortBy", sortBy.toString());
        propertiesParams.append("sortDirection", sortDirection);
      }

      const [propertiesRes, typesRes, statsRes] = await Promise.all([
        fetch(`/api/properties?${propertiesParams.toString()}`),
        fetch(`/api/property-types?websiteId=${selectedWebsiteId}`),
        fetch(`/api/properties/stats?websiteId=${selectedWebsiteId}`),
      ]);

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData.properties || []);
        setTotalProperties(propertiesData.total || 0);
      }

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setPropertyTypes(typesData.propertyTypes || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch properties data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    selectedWebsiteId,
    currentPage,
    pageSize,
    searchTerm,
    statusFilter,
    typeFilter,
    sortBy,
    sortDirection,
  ]);

  // Helper functions (keeping these for the DataTable)
  const getPropertyTypeBadge = (propertyTypeId: string) => {
    const type = propertyTypes.find((t) => t._id === propertyTypeId);
    return type ? type.name : "Unknown";
  };

  const renderPropertyTypeBadge = (propertyTypeId: string) => {
    const typeName = getPropertyTypeBadge(propertyTypeId);
    return (
      <Badge variant="secondary" className="text-xs">
        {typeName}
      </Badge>
    );
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "for-sale":
        return "default";
      case "for-rent":
        return "secondary";
      case "sold":
        return "destructive";
      case "rented":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Handle property deletion
  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) {
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
        `/api/properties/${propertyId}?websiteId=${selectedWebsiteId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property deleted successfully",
        });
        fetchData(); // Refresh the list
      } else {
        throw new Error("Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  // Handle property creation/update success
  const handlePropertySaved = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingProperty(null);
    fetchData(); // Refresh the list
    toast({
      title: "Success",
      description: editingProperty
        ? "Property updated successfully"
        : "Property created successfully",
    });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  // Sorting handlers
  const handleSort = (key: keyof Property, direction: SortDirection) => {
    setSortBy(key);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Column configuration for DataTable
  const columns: Column<Property>[] = [
    {
      key: "name",
      header: "Property",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <HomeIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPinIcon className="h-3 w-3" />
              {row.location}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "propertyType",
      header: "Type",
      sortable: true,
      render: (value) => renderPropertyTypeBadge(value),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {PROPERTY_STATUSES.find((s) => s.value === value)?.label || value}
        </Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (value, row) => (
        <div className="text-right font-medium">
          {formatPrice(value, row.currency)}
        </div>
      ),
    },
    {
      key: "beds",
      header: "Details",
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BedIcon className="h-4 w-4" />
            {value}
          </div>
          <div className="flex items-center gap-1">
            <BathIcon className="h-4 w-4" />
            {row.baths}
          </div>
          <div className="flex items-center gap-1">
            <RulerIcon className="h-4 w-4" />
            {row.area} sqft
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
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
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(row)}>
              <EyeIcon className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingProperty(row);
                setIsEditDialogOpen(true);
              }}
            >
              <EditIcon className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(value)}
              className="text-red-600"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Get property type name helper
  const getPropertyTypeName = (typeId: string) => {
    const type = propertyTypes.find((t) => t._id === typeId);
    return type?.name || "Unknown Type";
  };

  // Get property type slug helper
  const getPropertyTypeSlug = (typeId: string) => {
    const type = propertyTypes.find((t) => t._id === typeId);
    return type?.slug || typeId;
  };

  // Handle view details - opens property on the generated website
  const handleViewDetails = (property: Property) => {
    if (!selectedWebsite || !selectedWebsite.domain) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Website domain not available",
      });
      return;
    }

    const propertyTypeSlug = getPropertyTypeSlug(property.propertyType);
    const propertyUrl = `https://${selectedWebsite.domain}/properties/${propertyTypeSlug}/${property.slug}`;

    // Open in new tab
    window.open(propertyUrl, "_blank");
  };

  // Get status badge with proper variant
  const getStatusBadge = (status: string) => {
    const statusConfig = PROPERTY_STATUSES.find((s) => s.value === status);
    return statusConfig ? (
      <Badge variant={status as "for-sale" | "for-rent" | "sold" | "rented"}>
        {statusConfig.label}
      </Badge>
    ) : (
      <Badge variant="outline">{status}</Badge>
    );
  };

  // Helper function to check if property is recently added (within last 7 days)
  const isRecentlyAdded = (createdAt: string | Date) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Format price
  const formatPrice = (price: number, currency: string) => {
    const currencyConfig = CURRENCY_OPTIONS.find((c) => c.value === currency);
    const symbol = currencyConfig?.symbol || "$";
    return `${symbol}${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading properties...</p>
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
              <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
              <p className="text-muted-foreground">
                Manage your property listings and inventory
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BulkPropertyUpload
                websiteId={selectedWebsiteId || ""}
                onUploadComplete={fetchData}
              />
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Property</DialogTitle>
                  </DialogHeader>
                  <PropertyForm
                    propertyTypes={propertyTypes}
                    websiteId={selectedWebsiteId || undefined}
                    onSuccess={handlePropertySaved}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Properties
                </CardTitle>
                <HomeIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalProperties}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">For Sale</CardTitle>
                <Badge variant="for-sale">{stats.forSale}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.forSale}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">For Rent</CardTitle>
                <Badge variant="for-rent">{stats.forRent}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.forRent}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Featured</CardTitle>
                <Badge variant="success">{stats.featured}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.featured}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
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
                {PROPERTY_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type._id} value={type._id!}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle>Properties ({totalProperties})</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={properties}
                columns={columns}
                loading={loading}
                pagination={{
                  page: currentPage,
                  pageSize: pageSize,
                  total: totalProperties,
                  onPageChange: handlePageChange,
                  onPageSizeChange: handlePageSizeChange,
                }}
                sorting={{
                  sortBy: sortBy,
                  sortDirection: sortDirection,
                  onSort: handleSort,
                }}
                emptyMessage={
                  searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "No properties match your filters"
                    : "No properties found. Add your first property to get started."
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Edit Property Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Property</DialogTitle>
            </DialogHeader>
            {editingProperty && (
              <PropertyForm
                property={editingProperty}
                propertyTypes={propertyTypes}
                websiteId={selectedWebsiteId || undefined}
                onSuccess={handlePropertySaved}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingProperty(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </ProtectedRoute>
  );
}
