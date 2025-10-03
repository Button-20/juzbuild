"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  showUpload?: boolean;
  className?: string;
}

export default function UserAvatar({
  size = "md",
  showUpload = false,
  className = "",
}: UserAvatarProps) {
  const { user, refreshAuth } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20",
    xl: "h-32 w-32",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const generateDefaultAvatar = (name: string) => {
    // Generate a consistent color based on the user's name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=${hue.toString(16).padStart(2, "0")}${((hue + 100) % 255)
      .toString(16)
      .padStart(2, "0")}${((hue + 200) % 255)
      .toString(16)
      .padStart(2, "0")}&color=fff&size=400`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please select a JPEG, PNG, or WebP image."
      );
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Avatar updated successfully!");
        await refreshAuth(); // Refresh user data
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        if (response.status === 503) {
          toast.error(
            "Avatar upload is currently unavailable. Contact support to enable this feature."
          );
        } else {
          toast.error(error.message || "Failed to upload avatar");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);

    try {
      const response = await fetch("/api/upload/avatar", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Avatar removed successfully!");
        await refreshAuth(); // Refresh user data
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to remove avatar");
      }
    } catch (error) {
      console.error("Remove avatar error:", error);
      toast.error("Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  const avatarContent = (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage
        src={user.avatar || generateDefaultAvatar(user.fullName)}
        alt={user.fullName}
      />
      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
    </Avatar>
  );

  if (!showUpload) {
    return avatarContent;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer w-fit mx-auto">
          {avatarContent}
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Avatar</DialogTitle>
          <DialogDescription>
            Upload a new profile picture or remove your current one.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage
              src={user.avatar || generateDefaultAvatar(user.fullName)}
              alt={user.fullName}
            />
            <AvatarFallback className="text-2xl">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex space-x-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload New"}
            </Button>

            {user.avatar && (
              <Button
                variant="outline"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground text-center">
            Supports JPEG, PNG, and WebP formats. Maximum file size: 5MB.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
