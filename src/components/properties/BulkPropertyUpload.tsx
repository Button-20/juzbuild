"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; errors: string[] }>;
}

interface BulkUploadProps {
  websiteId: string;
  onUploadComplete: () => void;
}

export function BulkPropertyUpload({
  websiteId,
  onUploadComplete,
}: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState<BulkUploadResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        setFile(selectedFile);
        setResults(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a valid Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        name: "Example Property",
        slug: "example-property", // Optional: Auto-generated from name if not provided
        description: "A beautiful 3-bedroom house with modern amenities",
        location: "123 Main Street, City, State",
        price: 250000,
        currency: "USD",
        propertyType: "House", // Must match existing property type names
        status: "for-sale",
        beds: 3,
        baths: 2,
        area: 1500,
        amenities: "Swimming Pool, Garage, Garden", // Comma-separated
        features: "Modern Kitchen, Hardwood Floors, Central AC", // Comma-separated
        images:
          "https://example.com/image1.jpg, https://example.com/image2.jpg", // Comma-separated URLs
        isActive: true,
        isFeatured: false,
        lat: 40.7128, // Optional coordinates
        lng: -74.006,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Properties");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // name
      { wch: 20 }, // slug
      { wch: 40 }, // description
      { wch: 30 }, // location
      { wch: 10 }, // price
      { wch: 8 }, // currency
      { wch: 15 }, // propertyType
      { wch: 10 }, // status
      { wch: 8 }, // beds
      { wch: 8 }, // baths
      { wch: 10 }, // area
      { wch: 30 }, // amenities
      { wch: 30 }, // features
      { wch: 40 }, // images
      { wch: 10 }, // isActive
      { wch: 10 }, // isFeatured
      { wch: 10 }, // lat
      { wch: 10 }, // lng
    ];

    XLSX.writeFile(workbook, "property-template.xlsx");
  };

  const handleUpload = async () => {
    if (!file || !websiteId) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("websiteId", websiteId);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/properties/bulk-upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setResults(data.results);

      if (data.results.success > 0) {
        toast({
          title: "Upload completed",
          description: `Successfully imported ${
            data.results.success
          } properties${
            data.results.failed > 0
              ? ` with ${data.results.failed} failures`
              : ""
          }`,
        });
        onUploadComplete();
      } else {
        toast({
          title: "Upload failed",
          description: "No properties were imported successfully",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResults(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Property Upload
          </DialogTitle>
          <DialogDescription>
            Upload multiple properties at once using an Excel file. Download the
            template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Download Template</h4>
              <p className="text-sm text-muted-foreground">
                Get the Excel template with the required columns and example
                data
              </p>
            </div>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="excel-file">Select Excel File</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="mt-2"
              />
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  onClick={resetUpload}
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">
                  {uploadProgress}%
                </span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {results.success}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-400">
                    Properties imported
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {results.failed}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400">
                    Failed imports
                  </div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Import Errors
                  </h4>
                  <ScrollArea className="max-h-60 w-full border rounded-md p-4">
                    <div className="space-y-3">
                      {results.errors.map((error, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-red-600">
                            Row {error.row}:
                          </div>
                          <ul className="ml-4 list-disc text-muted-foreground">
                            {error.errors.map((err, errIndex) => (
                              <li key={errIndex}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Close
            </Button>
            {file && !uploading && (
              <Button onClick={handleUpload} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Properties
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
