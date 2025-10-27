"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  DropdownMenuSeparator,
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
import { Textarea } from "@/components/ui/textarea";
import { useWebsite } from "@/contexts/website-context";
import {
  CreateLeadData,
  Lead,
  LeadPriority,
  LeadSource,
  LeadStats,
  LeadStatus,
} from "@/types/leads";
import {
  Check,
  Contact,
  Edit,
  Eye,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Lead Details Form Component
interface LeadDetailsFormProps {
  lead: Lead;
  isEditing: boolean;
  onClose: () => void;
  onSave: (updatedLead: Partial<Lead>) => Promise<void>;
  onCancelEdit: () => void;
  onEdit: () => void;
}

function LeadDetailsForm({
  lead,
  isEditing,
  onClose,
  onSave,
  onCancelEdit,
  onEdit,
}: LeadDetailsFormProps) {
  const [editFormData, setEditFormData] = useState<Partial<Lead>>(lead);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form data when lead changes or editing starts
  useEffect(() => {
    setEditFormData(lead);
  }, [lead, isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(editFormData);
    } catch (error) {
      // Error is handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Lead Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Contact className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{lead.name}</h3>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(lead.status)}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </Badge>
          <Badge className={getPriorityColor(lead.priority)}>
            {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          {isEditing ? (
            <Input
              id="name"
              name="name"
              value={editFormData.name || ""}
              onChange={handleInputChange}
              required
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted rounded-md">{lead.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          {isEditing ? (
            <Input
              id="email"
              name="email"
              type="email"
              value={editFormData.email || ""}
              onChange={handleInputChange}
              required
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted rounded-md">
              {lead.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          {isEditing ? (
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={editFormData.phone || ""}
              onChange={handleInputChange}
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted rounded-md">
              {lead.phone || "Not provided"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          {isEditing ? (
            <Input
              id="company"
              name="company"
              value={editFormData.company || ""}
              onChange={handleInputChange}
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted rounded-md">
              {lead.company || "Not provided"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Lead Source</Label>
          {isEditing ? (
            <Select
              value={editFormData.source || ""}
              onValueChange={(value) => handleSelectChange("source", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LeadSource.CONTACT_FORM}>
                  Contact Form
                </SelectItem>
                <SelectItem value={LeadSource.PROPERTY_INQUIRY}>
                  Property Inquiry
                </SelectItem>
                <SelectItem value={LeadSource.PHONE_CALL}>
                  Phone Call
                </SelectItem>
                <SelectItem value={LeadSource.EMAIL}>Email</SelectItem>
                <SelectItem value={LeadSource.SOCIAL_MEDIA}>
                  Social Media
                </SelectItem>
                <SelectItem value={LeadSource.REFERRAL}>Referral</SelectItem>
                <SelectItem value={LeadSource.WEBSITE}>Website</SelectItem>
                <SelectItem value={LeadSource.ADVERTISEMENT}>
                  Advertisement
                </SelectItem>
                <SelectItem value={LeadSource.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm py-2 px-3 bg-muted rounded-md">
              {lead.source
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          {isEditing ? (
            <Select
              value={editFormData.priority || ""}
              onValueChange={(value) => handleSelectChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LeadPriority.LOW}>Low</SelectItem>
                <SelectItem value={LeadPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={LeadPriority.HIGH}>High</SelectItem>
                <SelectItem value={LeadPriority.URGENT}>Urgent</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm py-2 px-3 bg-muted rounded-md">
              {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
            </p>
          )}
        </div>
      </div>

      {/* Subject and Message */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        {isEditing ? (
          <Input
            id="subject"
            name="subject"
            value={editFormData.subject || ""}
            onChange={handleInputChange}
          />
        ) : (
          <p className="text-sm py-2 px-3 bg-muted rounded-md">
            {lead.subject || "No subject"}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        {isEditing ? (
          <Textarea
            id="message"
            name="message"
            value={editFormData.message || ""}
            onChange={handleInputChange}
            rows={4}
          />
        ) : (
          <p className="text-sm py-2 px-3 bg-muted rounded-md whitespace-pre-wrap">
            {lead.message}
          </p>
        )}
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          {isEditing ? (
            <Input
              id="budget"
              name="budget"
              value={editFormData.budget || ""}
              onChange={handleInputChange}
              placeholder="e.g., $100k - $200k"
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted rounded-md">
              {lead.budget || "Not specified"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline</Label>
          {isEditing ? (
            <Input
              id="timeline"
              name="timeline"
              value={editFormData.timeline || ""}
              onChange={handleInputChange}
              placeholder="e.g., 3-6 months"
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted rounded-md">
              {lead.timeline || "Not specified"}
            </p>
          )}
        </div>
      </div>

      {/* Property Information (if applicable) */}
      {lead.propertyInterest && (
        <div className="space-y-2">
          <Label>Property Interest</Label>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm">
              <span className="font-medium">Interested in:</span>{" "}
              {lead.propertyInterest}
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Internal Notes</Label>
        {isEditing ? (
          <Textarea
            id="notes"
            name="notes"
            value={editFormData.notes || ""}
            onChange={handleInputChange}
            placeholder="Add internal notes about this lead"
            rows={3}
          />
        ) : (
          <p className="text-sm py-2 px-3 bg-muted rounded-md whitespace-pre-wrap">
            {lead.notes || "No notes"}
          </p>
        )}
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
        <div>
          <span className="font-medium">Created:</span>{" "}
          {formatDate(lead.createdAt)}
        </div>
        <div>
          <span className="font-medium">Last Updated:</span>{" "}
          {formatDate(lead.updatedAt)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditFormData(lead);
                onCancelEdit();
              }}
            >
              Cancel Edit
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </>
        ) : (
          <Button type="button" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Lead
          </Button>
        )}
      </div>
    </form>
  );
}

// Helper function to format dates
const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Helper function to get status color
const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case LeadStatus.NEW:
      return "bg-blue-100 text-blue-800";
    case LeadStatus.CONTACTED:
      return "bg-yellow-100 text-yellow-800";
    case LeadStatus.QUALIFIED:
      return "bg-purple-100 text-purple-800";
    case LeadStatus.CONVERTED:
      return "bg-green-100 text-green-800";
    case LeadStatus.CLOSED:
      return "bg-gray-100 text-gray-800";
    case LeadStatus.LOST:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get priority color
const getPriorityColor = (priority: LeadPriority) => {
  switch (priority) {
    case LeadPriority.URGENT:
      return "bg-red-100 text-red-800";
    case LeadPriority.HIGH:
      return "bg-orange-100 text-orange-800";
    case LeadPriority.MEDIUM:
      return "bg-blue-100 text-blue-800";
    case LeadPriority.LOW:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    selectedWebsite,
    selectedWebsiteId,
    loading: websiteLoading,
  } = useWebsite();

  const [formData, setFormData] = useState<CreateLeadData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: LeadSource.CONTACT_FORM,
    status: LeadStatus.NEW,
    priority: LeadPriority.MEDIUM,
    subject: "",
    message: "",
    budget: "",
    timeline: "",
    tags: [],
    notes: "",
  });

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortDirection,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(sourceFilter !== "all" && { source: sourceFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
        ...(selectedWebsite?.domain && { domain: selectedWebsite.domain }),
      });

      const response = await fetch(`/api/leads?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data.leads);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    searchTerm,
    statusFilter,
    sourceFilter,
    priorityFilter,
    sortBy,
    sortDirection,
    selectedWebsite,
  ]);

  // Fetch lead stats
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWebsite?.domain) {
        params.append("domain", selectedWebsite.domain);
      }
      const response = await fetch(`/api/leads/stats?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching lead stats:", error);
    }
  };

  useEffect(() => {
    if (!websiteLoading) {
      fetchLeads();
      fetchStats();
    }
  }, [fetchLeads, websiteLoading]);

  const handleSort = (column: string, direction: SortDirection) => {
    setSortBy(column);
    setSortDirection(direction);
    setPage(1); // Reset to first page when sorting
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
  };

  // Reset page when database changes
  useEffect(() => {
    setPage(1);
  }, [selectedWebsite]);

  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const params = new URLSearchParams();
      if (selectedWebsite?.domain) {
        params.append("domain", selectedWebsite.domain);
      }
      const response = await fetch(`/api/leads/${leadId}?${params}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          lastContactDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update lead status");
      }

      const updatedLead = await response.json();

      // Update leads list
      setLeads((prev) =>
        prev.map((lead) => (lead._id === leadId ? updatedLead : lead))
      );

      // Update selected lead if it's the same
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead(updatedLead);
      }

      toast.success("Lead status updated successfully");
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status");
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      const params = new URLSearchParams();
      if (selectedWebsite?.domain) {
        params.append("domain", selectedWebsite.domain);
      }
      const response = await fetch(`/api/leads/${leadId}?${params}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete lead");
      }

      setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
      setSelectedLead(null);
      setShowDetails(false);

      toast.success("Lead deleted successfully");
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditing(false);
    setShowDetails(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditing(true);
    setShowDetails(true);
  };

  // Form handlers for adding new leads
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const params = new URLSearchParams();
      if (selectedWebsite?.domain) {
        params.append("domain", selectedWebsite.domain);
      }
      const response = await fetch(`/api/leads?${params}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create lead");
      }

      const newLead = await response.json();

      // Add to leads list
      setLeads((prev) => [newLead, ...prev]);

      // Reset form and close dialog
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: LeadSource.CONTACT_FORM,
        status: LeadStatus.NEW,
        priority: LeadPriority.MEDIUM,
        subject: "",
        message: "",
        budget: "",
        timeline: "",
        tags: [],
        notes: "",
      });
      setIsAddDialogOpen(false);

      toast.success("Lead created successfully");
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error creating lead:", error);
      toast.error("Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Column configuration for DataTable
  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (value, lead) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Contact className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{lead.name}</div>
            <div className="text-sm text-muted-foreground">{lead.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      sortable: true,
      render: (value, lead) => (
        <Badge variant="outline">{lead.source.replace(/_/g, " ")}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value, lead) => (
        <Badge className={getStatusColor(lead.status)}>
          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (value, lead) => (
        <Badge className={getPriorityColor(lead.priority)}>
          {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
        </Badge>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      sortable: false,
      render: (value, lead) => (
        <div className="max-w-xs truncate" title={lead.subject}>
          {lead.subject || "No subject"}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (value, lead) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(lead.createdAt)}
        </div>
      ),
    },
    {
      key: "_id" as keyof Lead,
      header: "Actions",
      sortable: false,
      render: (value, lead) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(lead)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(lead)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Lead
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                handleStatusUpdate(lead._id!, LeadStatus.CONTACTED)
              }
              disabled={lead.status === LeadStatus.CONTACTED}
            >
              <Phone className="mr-2 h-4 w-4" />
              Mark as Contacted
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleStatusUpdate(lead._id!, LeadStatus.QUALIFIED)
              }
              disabled={lead.status === LeadStatus.QUALIFIED}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark as Qualified
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleStatusUpdate(lead._id!, LeadStatus.CONVERTED)
              }
              disabled={lead.status === LeadStatus.CONVERTED}
            >
              <Star className="mr-2 h-4 w-4" />
              Mark as Converted
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(lead._id!)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Lead
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
                Lead Management
              </h1>
              <p className="text-muted-foreground">
                Manage and track your sales leads
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddLead} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter lead name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter email address"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Company name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="source">Lead Source *</Label>
                        <Select
                          value={formData.source}
                          onValueChange={(value) =>
                            handleSelectChange("source", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={LeadSource.CONTACT_FORM}>
                              Contact Form
                            </SelectItem>
                            <SelectItem value={LeadSource.PROPERTY_INQUIRY}>
                              Property Inquiry
                            </SelectItem>
                            <SelectItem value={LeadSource.PHONE_CALL}>
                              Phone Call
                            </SelectItem>
                            <SelectItem value={LeadSource.EMAIL}>
                              Email
                            </SelectItem>
                            <SelectItem value={LeadSource.SOCIAL_MEDIA}>
                              Social Media
                            </SelectItem>
                            <SelectItem value={LeadSource.REFERRAL}>
                              Referral
                            </SelectItem>
                            <SelectItem value={LeadSource.WEBSITE}>
                              Website
                            </SelectItem>
                            <SelectItem value={LeadSource.ADVERTISEMENT}>
                              Advertisement
                            </SelectItem>
                            <SelectItem value={LeadSource.OTHER}>
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) =>
                            handleSelectChange("priority", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={LeadPriority.LOW}>
                              Low
                            </SelectItem>
                            <SelectItem value={LeadPriority.MEDIUM}>
                              Medium
                            </SelectItem>
                            <SelectItem value={LeadPriority.HIGH}>
                              High
                            </SelectItem>
                            <SelectItem value={LeadPriority.URGENT}>
                              Urgent
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Lead subject or inquiry type"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          placeholder="e.g., $100k - $200k"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeline">Timeline</Label>
                        <Input
                          id="timeline"
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleInputChange}
                          placeholder="e.g., 3-6 months"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Enter lead message or inquiry details"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Internal notes about this lead"
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Lead"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Lead Details/Edit Dialog */}
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Lead" : "Lead Details"}
                </DialogTitle>
              </DialogHeader>

              {selectedLead && (
                <LeadDetailsForm
                  lead={selectedLead}
                  isEditing={isEditing}
                  onClose={() => {
                    setShowDetails(false);
                    setSelectedLead(null);
                    setIsEditing(false);
                  }}
                  onSave={async (updatedLead: Partial<Lead>) => {
                    try {
                      const params = new URLSearchParams();
                      if (selectedWebsite?.domain) {
                        params.append("domain", selectedWebsite.domain);
                      }
                      const response = await fetch(
                        `/api/leads/${selectedLead._id}?${params}`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(updatedLead),
                        }
                      );

                      if (!response.ok) {
                        throw new Error("Failed to update lead");
                      }

                      const savedLead = await response.json();

                      // Update leads list
                      setLeads((prev) =>
                        prev.map((lead) =>
                          lead._id === selectedLead._id ? savedLead : lead
                        )
                      );

                      setSelectedLead(savedLead);
                      setIsEditing(false);

                      toast.success("Lead updated successfully");
                      fetchStats(); // Refresh stats
                    } catch (error) {
                      console.error("Error updating lead:", error);
                      toast.error("Failed to update lead");
                    }
                  }}
                  onCancelEdit={() => setIsEditing(false)}
                  onEdit={() => setIsEditing(true)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium">Total Leads</div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.monthlyGrowth >= 0 ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />+{stats.monthlyGrowth}
                        % from last month
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {stats.monthlyGrowth}% from last month
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium">New Leads</div>
                  <Contact className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.new}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting first contact
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium">Qualified</div>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.qualified}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready for conversion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium">Conversion Rate</div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.conversionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.converted} converted
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search leads by name, email, company..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Source</Label>
                    <Select
                      value={sourceFilter}
                      onValueChange={setSourceFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="contact_form">
                          Contact Form
                        </SelectItem>
                        <SelectItem value="property_inquiry">
                          Property Inquiry
                        </SelectItem>
                        <SelectItem value="phone_call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="social_media">
                          Social Media
                        </SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="advertisement">
                          Advertisement
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={priorityFilter}
                      onValueChange={setPriorityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardContent className="p-6">
              <DataTable
                data={leads}
                columns={columns}
                loading={loading}
                pagination={{
                  page,
                  pageSize: limit,
                  total,
                  onPageChange: setPage,
                  onPageSizeChange: () => {}, // Not implemented for now
                }}
                sorting={{
                  sortBy: sortBy as keyof Lead,
                  sortDirection,
                  onSort: (key, direction) =>
                    handleSort(key as string, direction),
                }}
                emptyMessage={
                  searchTerm ||
                  statusFilter !== "all" ||
                  sourceFilter !== "all" ||
                  priorityFilter !== "all" ? (
                    "No leads match your filters"
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No leads found. Leads will appear here when contact
                        forms are submitted.
                      </p>
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
