import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "destructive" | "success" | "warning" | "outline";
}

export function Badge({ className = "", variant = "primary", children, ...props }: BadgeProps) {
  const variantClasses = {
    primary: "badge-primary",
    secondary: "badge-secondary",
    destructive: "badge-destructive",
    success: "badge-success",
    warning: "badge-warning",
    outline: "badge-outline",
  };

  return (
    <span className={cn("badge", variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
}