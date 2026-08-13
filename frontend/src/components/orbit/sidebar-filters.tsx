import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Clock, AlertTriangle, User } from "lucide-react";

interface SidebarFiltersProps {
  filters: {
    myTasks: boolean;
    overdue: boolean;
    highPriority: boolean;
  };
  onChange: (filters: SidebarFiltersProps["filters"]) => void;
}

const filterOptions = [
  { key: "myTasks", label: "My Tasks", icon: User },
  { key: "overdue", label: "Overdue", icon: Clock },
  { key: "highPriority", label: "High Priority", icon: AlertTriangle },
] as const;

export function SidebarFilters({ filters, onChange }: SidebarFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-2 p-2" data-testid="sidebar-filters">
      <div className="flex items-center justify-between px-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange({ myTasks: false, overdue: false, highPriority: false })}
            className="rounded text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            Clear
          </button>
        )}
      </div>
      {filterOptions.map(({ key, label, icon: Icon }) => (
        <label
          key={key}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
            filters[key as keyof typeof filters] && "bg-primary/10 text-primary",
          )}
        >
          <Checkbox
            checked={filters[key as keyof typeof filters]}
            onCheckedChange={(checked) =>
              onChange({ ...filters, [key]: checked as boolean })
            }
          />
          <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}