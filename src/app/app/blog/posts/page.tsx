"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { BlogImageUpload } from "@/components/blog/BlogImageUpload";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Blog } from "@/types/properties";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  FileText,
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
  const { selectedWebsite } = useWebsite();
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

  const fetchBlogs = async () => {
    try {
      const websiteParam = selectedWebsite?.id
        ? `?websiteId=${selectedWebsite.id}`
        : `?domain=${selectedWebsite?.domain || ""}`;

      const response = await fetch(`/api/blogs${websiteParam}`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
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
      const websiteParam = selectedWebsite?.id
        ? `?websiteId=${selectedWebsite.id}`
        : `?domain=${selectedWebsite?.domain || ""}`;

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
    if (selectedWebsite) {
      fetchData();
    }
  }, [selectedWebsite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const websiteParam = selectedWebsite?.id
        ? `?websiteId=${selectedWebsite.id}`
        : `?domain=${selectedWebsite?.domain || ""}`;

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
      const websiteParam = selectedWebsite?.id
        ? `?websiteId=${selectedWebsite.id}`
        : `?domain=${selectedWebsite?.domain || ""}`;

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Read Time</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.map((blog) => (
                      <TableRow key={blog._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{blog.title}</div>
                            <div className="text-sm text-muted-foreground">
                              /{blog.slug}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {getAuthorName(blog.authorId)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={blog.isPublished ? "default" : "secondary"}
                          >
                            {blog.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.slice(0, 2).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {blog.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{blog.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{blog.readTime} min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span className="text-sm">{blog.views}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">
                              {formatDate(blog.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(blog)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => blog._id && handleDelete(blog._id)}
                              disabled={!blog._id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
