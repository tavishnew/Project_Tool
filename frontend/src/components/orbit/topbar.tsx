import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, User, Settings, Search, Menu, LayoutDashboard, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/auth";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/api";
import { useToast } from "@/components/ui/toast";

export function Topbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();

  const initials = user?.name?.[0]?.toUpperCase() ?? "U";

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

  const handleProfile = () => {
    // Navigate to user profile - for now show toast since route doesn't exist
    notify("Profile page coming soon");
    // TODO: navigate({ to: "/app/profile" }) when route exists
  };

  const handlePreferences = () => {
    // Navigate to preferences - for now show toast since route doesn't exist
    notify("Preferences page coming soon");
    // TODO: navigate({ to: "/app/preferences" }) when route exists
  };

  const handleSettings = () => {
    // Navigate to settings - could be project settings if in project context
    // For now, go to the first project's settings or show toast
    notify("Settings page coming soon");
    // TODO: navigate({ to: "/app/settings" }) when route exists
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      {/* Left: Sidebar trigger */}
      <SidebarTrigger className="mr-4" />

      {/* Center: Global search (decorative) */}
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects, tasks..."
            className="pl-10 bg-transparent"
            disabled
          />
        </div>
      </div>

      {/* Right: Notifications, User avatar dropdown */}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initials}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={handleProfile}
            >
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={handlePreferences}
            >
              <UserCog className="h-4 w-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={handleSettings}
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}