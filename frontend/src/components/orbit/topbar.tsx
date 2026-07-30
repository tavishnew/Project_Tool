import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/auth";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/api";
import { useToast } from "@/components/ui/toast";

// Extracted: avatar + initials fallback, used in trigger and dropdown
function UserAvatar({ avatarUrl, initials, size = 36 }: { avatarUrl?: string | null; initials: string; size?: number }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={initials}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

// Extracted: user info block in dropdown label (name + email)
function UserInfo({ name, email }: { name: string; email: string }) {
  return (
    <div>
      <p className="text-sm font-semibold">{name}</p>
      <p className="text-xs text-muted-foreground">{email}</p>
    </div>
  );
}

export function Topbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();

  const initials = user?.name?.[0]?.toUpperCase() ?? "U";
  const avatarUrl = user?.avatar_url;

  const handleSignOut = async () => {
    try {
      await api.logout();
      setUser(null);
      notify("Signed out successfully");
    } catch (err) {
      console.error("Logout failed", err);
      notify("Failed to sign out", "error");
    }
    navigate({ to: "/", replace: true });
  };

  const handleSettings = () => {
    navigate({ to: "/app/settings" });
  };

  return (
    <header data-testid="topbar" className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      {/* Left: Sidebar trigger */}
      <SidebarTrigger data-testid="sidebar-trigger" className="mr-4" />

      {/* Center: Global search (decorative) */}
      <div data-testid="global-search" className="hidden max-w-xl flex-1 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects, tasks..."
            className="bg-transparent pl-10"
            disabled
          />
        </div>
      </div>

      {/* Right: Notifications + User avatar dropdown */}
      <div data-testid="topbar-actions" className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <UserAvatar avatarUrl={avatarUrl} initials={initials} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="flex items-center gap-2">
              <UserAvatar avatarUrl={avatarUrl} initials={initials} size={36} />
              <UserInfo name={user?.name ?? "User"} email={user?.email ?? ""} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettings} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}