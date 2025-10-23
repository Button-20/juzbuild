"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { BlogImageUpload } from "@/components/blog/BlogImageUpload";
import { SiteHeader } from "@/components/site-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Edit, Plus, Trash2, User } from "lucide-react";
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

export default function AuthorsPage() {
  const { selectedWebsite } = useWebsite();
  const { toast } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    image: "",
    slug: "",
  });

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const websiteParam = selectedWebsite?.id
        ? `?websiteId=${selectedWebsite.id}`
        : `?domain=${selectedWebsite?.domain || ""}`;

      const response = await fetch(`/api/authors${websiteParam}`);
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch authors",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch authors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWebsite) {
      fetchAuthors();
    }
  }, [selectedWebsite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const websiteParam = selectedWebsite?.id
        ? `?websiteId=${selectedWebsite.id}`
        : `?domain=${selectedWebsite?.domain || ""}`;

      if (editingAuthor) {
        // Update existing author
        const response = await fetch(
          `/api/authors/${editingAuthor._id}${websiteParam}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (response.ok) {
          toast({
            title: "Success",
            description: "Author updated successfully",
          });
          await fetchAuthors();
          setIsDialogOpen(false);
          resetForm();
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.message || "Failed to update author",
            variant: "destructive",
          });
        }
      } else {
        // Create new author
        const response = await fetch(`/api/authors${websiteParam}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Author created successfully",
          });
          await fetchAuthors();
          setIsDialogOpen(false);
          resetForm();
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.message || "Failed to create author",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting author:", error);
      toast({
        title: "Error",
        description: "Failed to save author",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      email: author.email,
      bio: author.bio,
      image: author.image,
      slug: author.slug,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (authorId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this author? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const websiteParam = selectedWebsite?.id
        ? `?websiteId=${selectedWebsite.id}`
        : `?domain=${selectedWebsite?.domain || ""}`;

      const response = await fetch(`/api/authors/${authorId}${websiteParam}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Author deleted successfully",
        });
        await fetchAuthors();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete author",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting author:", error);
      toast({
        title: "Error",
        description: "Failed to delete author",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      bio: "",
      image: "",
      slug: "",
    });
    setEditingAuthor(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-5 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Blog Authors
              </h1>
              <p className="text-muted-foreground">
                Manage blog authors and their profiles
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Author
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingAuthor ? "Edit Author" : "Add New Author"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAuthor
                      ? "Edit author information and profile details."
                      : "Create a new author profile for blog posts."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        });
                      }}
                      placeholder="Author name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="author@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Author bio"
                      rows={3}
                      required
                    />
                  </div>

                  <BlogImageUpload
                    type="author"
                    label="Profile Image"
                    value={formData.image}
                    onChange={(image) => setFormData({ ...formData, image })}
                    placeholder="Or paste profile image URL..."
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting
                        ? "Saving..."
                        : editingAuthor
                        ? "Update Author"
                        : "Create Author"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Authors ({authors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : authors.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No authors yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create author profiles to manage blog post authors.
                  </p>
                  <Button
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Author
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Author</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authors.map((author) => (
                      <TableRow key={author._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={author.image}
                                alt={author.name}
                              />
                              <AvatarFallback>
                                {author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{author.name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{author.slug}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{author.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(author.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(author)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                author._id && handleDelete(author._id)
                              }
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
