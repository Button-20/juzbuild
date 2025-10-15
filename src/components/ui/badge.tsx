import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/index";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Property status variants
        "for-sale":
          "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200/80",
        "for-rent":
          "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200/80",
        sold: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80",
        rented:
          "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200/80",
        // Additional utility variants
        success:
          "bg-green-100 text-green-800 border-green-200 hover:bg-green-200/80",
        warning:
          "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200/80",
        info: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
