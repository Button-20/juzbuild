import { COLOR_PALETTES, ColorPalette } from "@/constants/color-palettes";
import React from "react";

interface ColorPalettePreviewProps {
  paletteId: string;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Preview component to visualize how a color palette will look
 * Can be used in onboarding, settings, or documentation
 */
export const ColorPalettePreview: React.FC<ColorPalettePreviewProps> = ({
  paletteId,
  showLabels = false,
  size = "md",
}) => {
  const palette = COLOR_PALETTES.find((p) => p.id === paletteId);

  if (!palette) return null;

  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className="space-y-3">
      {showLabels && <h3 className="font-semibold text-sm">{palette.name}</h3>}
      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1">
          <div
            className={`${sizeClasses[size]} rounded border border-border`}
            style={{ backgroundColor: palette.colors.primary }}
          />
          {showLabels && (
            <p className="text-xs text-muted-foreground text-center">Primary</p>
          )}
        </div>
        <div className="space-y-1">
          <div
            className={`${sizeClasses[size]} rounded border border-border`}
            style={{ backgroundColor: palette.colors.skyblue }}
          />
          {showLabels && (
            <p className="text-xs text-muted-foreground text-center">
              Accent 1
            </p>
          )}
        </div>
        <div className="space-y-1">
          <div
            className={`${sizeClasses[size]} rounded border border-border`}
            style={{ backgroundColor: palette.colors.lightskyblue }}
          />
          {showLabels && (
            <p className="text-xs text-muted-foreground text-center">
              Accent 2
            </p>
          )}
        </div>
        <div className="space-y-1">
          <div
            className={`${sizeClasses[size]} rounded border border-border`}
            style={{ backgroundColor: palette.colors.dark }}
          />
          {showLabels && (
            <p className="text-xs text-muted-foreground text-center">Dark</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface ColorPaletteShowcaseProps {
  selectedPaletteId?: string;
}

/**
 * Showcase all available color palettes
 * Useful for documentation or settings pages
 */
export const ColorPaletteShowcase: React.FC<ColorPaletteShowcaseProps> = ({
  selectedPaletteId,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {COLOR_PALETTES.map((palette) => (
        <div
          key={palette.id}
          className={`p-4 rounded-lg border-2 ${
            selectedPaletteId === palette.id
              ? "border-primary bg-primary/5"
              : "border-border"
          }`}
        >
          <ColorPalettePreview
            paletteId={palette.id}
            showLabels={true}
            size="md"
          />
        </div>
      ))}
    </div>
  );
};

interface UseCasePreviewProps {
  palette: ColorPalette;
}

/**
 * Preview how colors will be used in a real website context
 * Shows buttons, headings, and other UI elements
 */
export const UseCasePreview: React.FC<UseCasePreviewProps> = ({ palette }) => {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border">
      {/* Header */}
      <div
        className="h-16 rounded flex items-center px-4"
        style={{ backgroundColor: palette.colors.primary }}
      >
        <h2 className="text-white font-bold">Your Website Header</h2>
      </div>

      {/* Content Area */}
      <div className="space-y-3">
        <h3
          className="text-2xl font-bold"
          style={{ color: palette.colors.dark }}
        >
          Welcome to Your Real Estate Site
        </h3>
        <p className="text-gray-600">
          This is how your content will look with the selected color palette.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            className="px-6 py-2 rounded text-white font-semibold"
            style={{ backgroundColor: palette.colors.primary }}
          >
            Primary Button
          </button>
          <button
            className="px-6 py-2 rounded text-white font-semibold"
            style={{ backgroundColor: palette.colors.skyblue }}
          >
            Secondary Button
          </button>
        </div>

        {/* Feature Box */}
        <div
          className="p-4 rounded"
          style={{ backgroundColor: palette.colors.lightskyblue + "40" }}
        >
          <h4
            className="font-semibold mb-2"
            style={{ color: palette.colors.dark }}
          >
            Featured Property
          </h4>
          <p className="text-sm text-gray-600">
            This is how highlighted content will appear.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorPalettePreview;
