"use client";

import { Button } from "@/components/ui/button";
import { WizardStepProps } from "@/types/onboarding";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import React, { useRef } from "react";

const SAMPLE_FIELDS = [
  "Title",
  "Location",
  "Price",
  "Bedrooms",
  "Bathrooms",
  "Size (sq ft)",
  "Status",
  "Description",
  "Photos",
];

export default function PropertyUploadStep({
  data,
  updateData,
  onNext,
  onBack,
  isSubmitting,
}: WizardStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({ propertyFile: file });
    }
  };

  const downloadSampleFile = () => {
    // Create a sample CSV content
    const csvContent = [
      SAMPLE_FIELDS.join(","),
      "Beautiful Family Home,New York NY,450000,4,3,2500,For Sale,Spacious family home with modern amenities,image1.jpg;image2.jpg",
      "Downtown Apartment,Manhattan NY,750000,2,2,1200,For Sale,Luxury apartment in prime location,image3.jpg;image4.jpg",
      "Commercial Space,Brooklyn NY,320000,0,1,3000,For Rent,Perfect for retail or office space,image5.jpg",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "property_upload_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Property Import</h3>
          <p className="text-sm text-muted-foreground">
            Upload your existing properties to get started quickly (Optional)
          </p>
        </div>

        <div className="bg-muted/50 p-6 rounded-lg border">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                Skip for Now or Upload Properties
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                You can add properties manually later, or upload a CSV/Excel
                file to import them all at once.
              </p>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              {data.propertyFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium">{data.propertyFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(data.propertyFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium mb-1">Upload Property File</p>
                    <p className="text-sm text-muted-foreground">
                      Support for CSV and Excel files
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Template Section */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">File Format Guide</h3>
          <p className="text-sm text-muted-foreground">
            Download our template to ensure your data is formatted correctly
          </p>
        </div>

        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Download className="w-6 h-6 text-foreground mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">
                Download Template File
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use our pre-formatted template to ensure your property data
                uploads correctly. The template includes all required fields and
                example data.
              </p>

              <div className="mb-4">
                <h5 className="font-medium text-foreground mb-2">
                  Required Fields:
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  {SAMPLE_FIELDS.map((field, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                      {field}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={downloadSampleFile}
                className="border-border text-foreground hover:bg-muted/50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Need Help?</h3>
          <p className="text-sm text-muted-foreground">
            Common questions about property uploads
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">📊 Supported Formats</h4>
            <p className="text-sm text-muted-foreground">
              We support CSV (.csv) and Excel files (.xlsx, .xls). Use the
              template for best results.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">📸 Photo Handling</h4>
            <p className="text-sm text-muted-foreground">
              List photo filenames separated by semicolons. Upload photos
              separately after import.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">🔄 Updates Later</h4>
            <p className="text-sm text-muted-foreground">
              Don't worry if your data isn't perfect. You can edit and update
              properties anytime.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">⏭️ Skip This Step</h4>
            <p className="text-sm text-muted-foreground">
              You can always add properties manually later through your
              dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
          className="px-8"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="px-8"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Creating Website...
            </>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </div>
    </div>
  );
}
