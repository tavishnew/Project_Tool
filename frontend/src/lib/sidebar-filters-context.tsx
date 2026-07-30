"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface SidebarFilters {
  myTasks: boolean;
  overdue: boolean;
  highPriority: boolean;
}

interface SidebarFiltersContextType {
  filters: SidebarFilters;
  setFilters: React.Dispatch<React.SetStateAction<SidebarFilters>>;
}

const SidebarFiltersContext = createContext<SidebarFiltersContextType | null>(null);

export function SidebarFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<SidebarFilters>({
    myTasks: false,
    overdue: false,
    highPriority: false,
  });

  // Persist filters in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar-filters");
      if (stored) {
        setFilters(JSON.parse(stored));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-filters", JSON.stringify(filters));
    } catch {}
  }, [filters]);

  return (
    <SidebarFiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </SidebarFiltersContext.Provider>
  );
}

export function useSidebarFilters() {
  const context = useContext(SidebarFiltersContext);
  if (!context) {
    throw new Error("useSidebarFilters must be used within a SidebarFiltersProvider");
  }
  return context;
}