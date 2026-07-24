import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/auth";

export function Topbar() {
  const { user } = useAuth();

  const initials = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="ml-auto flex items-center gap-1">
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-4 w-4" />
      </Button>
      <div className="relative">
        <button
          className="btn btn-ghost btn-icon rounded-full h-9 w-9"
          aria-label="User menu"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </div>
        </button>
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-border bg-background p-1 shadow-lg z-50">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <hr className="border-border my-1" />
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent">
            Profile
          </button>
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent">
            Preferences
          </button>
          <hr className="border-border my-1" />
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}