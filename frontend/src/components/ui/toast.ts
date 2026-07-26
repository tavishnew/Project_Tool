"use client";

import { toast as sonnerToast } from "sonner";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

export function useToast() {
  return {
    toast: sonnerToast,
    notify: (message: string, type?: "error" | "success" | "info") => {
      if (type === "error") {
        sonnerToast.error(message);
      } else if (type === "success") {
        sonnerToast.success(message);
      } else {
        sonnerToast(message);
      }
    },
  };
}
