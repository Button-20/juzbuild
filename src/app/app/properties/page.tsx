"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { SiteHeader } from "@/components/site-header";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  CalendarIcon,
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

      const [propertiesRes, typesRes, statsRes] = await Promise.all([
        fetch(`/api/properties?websiteId=${selectedWebsiteId}`),
        fetch(`/api/property-types?websiteId=${selectedWebsiteId}`),
        fetch(`/api/properties/stats?websiteId=${selectedWebsiteId}`),
      ]);

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData.properties || []);
      }

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setPropertyTypes(typesData || []);
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
  }, [selectedWebsiteId]);

  // Filter properties based on search and filters
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      (property.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (property.location?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (property.description?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      );

    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;
    const matchesType =
      typeFilter === "all" || property.propertyType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

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

  // Get property type badge
  const getPropertyTypeBadge = (propertyTypeId: string) => {
    const typeName = getPropertyTypeName(propertyTypeId);
    return (
      <Badge variant="info" className="font-medium">
        {typeName}
      </Badge>
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
              <CardTitle>Properties ({filteredProperties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProperties.length === 0 ? (
                <div className="text-center py-8">
                  <HomeIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">No properties found</p>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first property"}
                  </p>
                  {!searchTerm &&
                    statusFilter === "all" &&
                    typeFilter === "all" && (
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Your First Property
                      </Button>
                    )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property._id}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {property.name || "Unnamed Property"}
                              </span>
                              <div className="flex gap-1">
                                {property.isFeatured && (
                                  <Badge variant="success" className="text-xs">
                                    Featured
                                  </Badge>
                                )}
                                {property.createdAt &&
                                  isRecentlyAdded(property.createdAt) && (
                                    <Badge
                                      variant="warning"
                                      className="text-xs"
                                    >
                                      New
                                    </Badge>
                                  )}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <MapPinIcon className="mr-1 h-3 w-3" />
                              {property.location || "No location specified"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPropertyTypeBadge(property.propertyType)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(property.status)}
                            {!property.isActive && (
                              <Badge variant="destructive" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(property.price, property.currency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <BedIcon className="mr-1 h-3 w-3" />
                              {property.beds}
                            </span>
                            <span className="flex items-center">
                              <BathIcon className="mr-1 h-3 w-3" />
                              {property.baths}
                            </span>
                            <span className="flex items-center">
                              <RulerIcon className="mr-1 h-3 w-3" />
                              {property.area} sq ft
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {new Date(property.createdAt!).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(property)}
                              >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingProperty(property);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(property._id!)}
                                className="text-destructive"
                              >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
