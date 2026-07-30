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
  return (
    <div className="space-y-2 p-2" data-testid="sidebar-filters">
      <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Filters
      </p>
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