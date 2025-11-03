/**
 * Predefined color palettes for real estate websites
 * Each palette contains 4 colors: primary, skyblue, lightskyblue, and dark
 */

export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    primary: string; // Main brand color
    skyblue: string; // Accent color 1
    lightskyblue: string; // Accent color 2
    dark: string; // Dark/text color
  };
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    colors: {
      primary: "#07be8a", // Teal green
      skyblue: "#79adff", // Bright blue
      lightskyblue: "#9cc2dd", // Light blue
      dark: "#172023", // Dark blue-gray
    },
  },
  {
    id: "sunset-villa",
    name: "Sunset Villa",
    colors: {
      primary: "#ff6b6b", // Coral red
      skyblue: "#ffa07a", // Light salmon
      lightskyblue: "#ffd1a3", // Peach
      dark: "#2c1810", // Dark brown
    },
  },
  {
    id: "forest-estate",
    name: "Forest Estate",
    colors: {
      primary: "#2ecc71", // Emerald green
      skyblue: "#3498db", // Dodger blue
      lightskyblue: "#95d5b2", // Sage green
      dark: "#1a2f23", // Forest green
    },
  },
  {
    id: "royal-luxury",
    name: "Royal Luxury",
    colors: {
      primary: "#9b59b6", // Purple
      skyblue: "#e74c3c", // Red
      lightskyblue: "#c39bd3", // Lavender
      dark: "#1c1427", // Deep purple
    },
  },
  {
    id: "golden-sands",
    name: "Golden Sands",
    colors: {
      primary: "#f39c12", // Orange
      skyblue: "#f9ca24", // Yellow
      lightskyblue: "#f8e5a9", // Light yellow
      dark: "#2c2416", // Dark brown
    },
  },
  {
    id: "midnight-modern",
    name: "Midnight Modern",
    colors: {
      primary: "#3498db", // Blue
      skyblue: "#5dade2", // Light blue
      lightskyblue: "#aed6f1", // Sky blue
      dark: "#0f1419", // Almost black
    },
  },
  {
    id: "rose-garden",
    name: "Rose Garden",
    colors: {
      primary: "#e91e63", // Pink
      skyblue: "#ff4081", // Hot pink
      lightskyblue: "#f8bbd0", // Light pink
      dark: "#2b1520", // Dark purple
    },
  },
  {
    id: "corporate-elite",
    name: "Corporate Elite",
    colors: {
      primary: "#34495e", // Dark slate
      skyblue: "#3498db", // Blue
      lightskyblue: "#7fb3d5", // Light blue
      dark: "#1a1f2e", // Navy
    },
  },
  {
    id: "autumn-harvest",
    name: "Autumn Harvest",
    colors: {
      primary: "#d35400", // Pumpkin
      skyblue: "#e67e22", // Carrot orange
      lightskyblue: "#f4d03f", // Golden yellow
      dark: "#221408", // Dark chocolate
    },
  },
  {
    id: "arctic-white",
    name: "Arctic White",
    colors: {
      primary: "#16a085", // Turquoise
      skyblue: "#1abc9c", // Aqua
      lightskyblue: "#a3e4d7", // Mint
      dark: "#0e2327", // Deep teal
    },
  },
];
