import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, ListFilter, LayoutDashboard } from "lucide-react";

type SwimlaneMode = "none" | "assignee" | "priority";

interface SwimlaneToggleProps {
  value: SwimlaneMode;
  onValueChange: (value: SwimlaneMode) => void;
}

const modes: { value: SwimlaneMode; label: string; icon: React.ReactNode }[] = [
  { value: "none", label: "None", icon: <LayoutDashboard className="h-4 w-4" /> },
  { value: "assignee", label: "By Assignee", icon: <Users className="h-4 w-4" /> },
  { value: "priority", label: "By Priority", icon: <ListFilter className="h-4 w-4" /> },
];

export function SwimlaneToggle({ value, onValueChange }: SwimlaneToggleProps) {
  return (
    <Select value={value} onValueChange={onValueChange} data-testid="swimlane-toggle">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Swimlanes" />
      </SelectTrigger>
      <SelectContent>
        {modes.map((mode) => (
          <SelectItem key={mode.value} value={mode.value} className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center">{mode.icon}</span>
            {mode.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}