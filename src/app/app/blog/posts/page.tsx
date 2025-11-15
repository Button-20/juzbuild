"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { BlogImageUpload } from "@/components/blog/BlogImageUpload";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Column, DataTable, SortDirection } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useWebsite } from "@/contexts/website-context";
import { useToast } from "@/hooks/use-toast";
import { Blog } from "@/types/properties";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  FileText,
  MoreVerticalIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Author {
  _id?: string;
  name: string;
  email: string;
  bio: string;
  image: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function BlogsPage() {
  const { currentWebsite } = useWebsite();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    authorId: "",
    tags: "",
    isPublished: false,
  });

  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams();

      if (currentWebsite?._id) {
        params.append("websiteId", currentWebsite._id);
      } else if (currentWebsite?.domainName) {
        params.append("domain", currentWebsite.domainName);
      }

      params.append("page", currentPage.toString());
      params.append("limit", "10");
      params.append("sortBy", sortBy);
      params.append("sortDirection", sortDirection);

      const response = await fetch(`/api/blogs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch blogs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      });
    }
  };

  const fetchAuthors = async () => {
    try {
      const websiteParam = currentWebsite?._id
        ? `?websiteId=${currentWebsite._id}`
        : `?domain=${currentWebsite?.domainName || ""}`;

      const response = await fetch(`/api/authors${websiteParam}`);
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
      } else {
        console.error("Failed to fetch authors");
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchBlogs(), fetchAuthors()]);
    setLoading(false);
  };

  useEffect(() => {
    if (currentWebsite) {
      fetchData();
    }
  }, [currentWebsite, currentPage, sortBy, sortDirection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const websiteParam = currentWebsite?._id
        ? `?websiteId=${currentWebsite._id}`
        : `?domain=${currentWebsite?.domainName || ""}`;

      const blogData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      let response;
      if (editingBlog) {
        response = await fetch(`/api/blogs/${editingBlog._id}${websiteParam}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(blogData),
        });
      } else {
        response = await fetch(`/api/blogs${websiteParam}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(blogData),
        });
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: `Blog ${
            editingBlog ? "updated" : "created"
          } successfully`,
        });
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to save blog",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const websiteParam = currentWebsite?._id
        ? `?websiteId=${currentWebsite._id}`
        : `?domain=${currentWebsite?.domainName || ""}`;

      const response = await fetch(`/api/blogs/${blogId}${websiteParam}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Blog deleted successfully",
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete blog",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage || "",
      authorId: blog.authorId,
      tags: blog.tags.join(", "),
      isPublished: blog.isPublished,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      authorId: "",
      tags: "",
      isPublished: false,
    });
    setEditingBlog(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAuthorName = (authorId: string) => {
    const author = authors.find((a) => a._id === authorId);
    return author ? author.name : "Unknown Author";
  };

  // Pagination and sorting handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: string, direction: SortDirection) => {
    setSortBy(key);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  };

  // DataTable columns configuration
  const columns: Column<Blog>[] = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (value, row) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate" title={value as string}>
            {value as string}
          </div>
          <div
            className="text-sm text-muted-foreground truncate"
            title={`/${row.slug}`}
          >
            /{row.slug}
          </div>
        </div>
      ),
    },
    {
      key: "authorId",
      header: "Author",
      sortable: false,
      render: (value) => (
        <span className="text-sm">{getAuthorName(value as string)}</span>
      ),
    },
    {
      key: "isPublished",
      header: "Status",
      sortable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      sortable: false,
      render: (value, row) => (
        <div className="flex flex-wrap gap-1">
          {(row.tags || []).slice(0, 2).map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {(row.tags || []).length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(row.tags || []).length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "readTime",
      header: "Read Time",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="text-sm">{value || 0} min</span>
        </div>
      ),
    },
    {
      key: "views",
      header: "Views",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span className="text-sm">{value || 0}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="text-sm">{formatDate(value as Date)}</span>
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
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => row._id && handleDelete(row._id)}
              className="text-red-600"
              disabled={!row._id}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
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
        <div className="flex flex-1 flex-col gap-4 p-5 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
              <p className="text-muted-foreground">
                Create and manage your blog posts and content
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Blog Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBlog ? "Edit Blog Post" : "Add New Blog Post"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBlog
                      ? "Update the blog post information."
                      : "Create a new blog post for your website."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            title: e.target.value,
                            slug: generateSlug(e.target.value),
                          });
                        }}
                        placeholder="Enter blog title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        placeholder="blog-post-slug"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                      placeholder="Brief description of the blog post"
                      rows={3}
                      required
                    />
                  </div>

                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) =>
                      setFormData({ ...formData, content })
                    }
                    placeholder="Write your blog content..."
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Select
                        value={formData.authorId}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            authorId: value,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an author" />
                        </SelectTrigger>
                        <SelectContent>
                          {authors.map((author) => (
                            <SelectItem
                              key={author._id}
                              value={author._id || ""}
                            >
                              {author.name}
                            </SelectItem>
                          ))}
                          {authors.length === 0 && (
                            <SelectItem value="no-authors" disabled>
                              No authors available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {authors.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          <a
                            href="/app/blog/authors"
                            className="underline text-primary"
                          >
                            Create authors
                          </a>{" "}
                          to select from this dropdown.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        placeholder="Tag1, Tag2, Tag3"
                      />
                    </div>
                  </div>

                  <BlogImageUpload
                    type="cover"
                    label="Cover Image"
                    value={formData.coverImage}
                    onChange={(coverImage) =>
                      setFormData({ ...formData, coverImage })
                    }
                    placeholder="Or paste cover image URL..."
                  />

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPublished: checked })
                      }
                    />
                    <Label htmlFor="published">Publish immediately</Label>
                  </div>

                  <DialogFooter>
                    <Button type="submit">
                      {editingBlog ? "Update Blog Post" : "Create Blog Post"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[300px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-9" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No blog posts yet
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first blog post
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={blogs}
                  loading={loading}
                  pagination={{
                    page: currentPage,
                    pageSize: 10,
                    total: total,
                    onPageChange: handlePageChange,
                    onPageSizeChange: () => {}, // Not implemented yet
                  }}
                  sorting={{
                    sortBy: sortBy as keyof Blog,
                    sortDirection: sortDirection,
                    onSort: handleSort,
                  }}
                  emptyMessage="No blog posts found. Add your first blog post to get started."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
