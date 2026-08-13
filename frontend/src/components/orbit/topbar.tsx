import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/auth";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/api";
import { useToast } from "@/components/ui/toast";
import { useEffect, useRef, useState } from "react";

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
  const { state: sidebarState } = useSidebar();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [headerHidden, setHeaderHidden] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const getScrollPosition = (event?: Event) => {
      const target = event?.target;
      if (target instanceof HTMLElement) return target.scrollTop;
      return window.scrollY;
    };

    if (sidebarState !== "collapsed") {
      setHeaderHidden(false);
      setHeaderHovered(false);
      lastScrollY.current = getScrollPosition();
      return;
    }

    lastScrollY.current = getScrollPosition();
    const handleScroll = (event: Event) => {
      const currentScrollY = getScrollPosition(event);
      const hasMovedMeaningfully = Math.abs(currentScrollY - lastScrollY.current) > 8;

      if (hasMovedMeaningfully) {
        setHeaderHidden(currentScrollY > 24);
        lastScrollY.current = currentScrollY;
      }
    };

    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, [sidebarState]);

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
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-x-0 top-0 z-50 h-3 ${
          sidebarState === "collapsed" && headerHidden && !headerHovered ? "pointer-events-auto" : "pointer-events-none"
        }`}
        onMouseEnter={() => setHeaderHovered(true)}
      />
      <header
        data-testid="topbar"
        className={`sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 shadow-[0_2px_0_hsl(var(--foreground)/0.04)] transition-transform duration-300 ease-in-out sm:h-16 sm:px-4 md:px-6 ${
          sidebarState === "collapsed" && headerHidden && !headerHovered ? "-translate-y-full" : "translate-y-0"
        }`}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
      >
        <SidebarTrigger
          data-testid="sidebar-trigger"
          aria-label={sidebarState === "collapsed" ? "Expand navigation sidebar" : "Collapse navigation sidebar"}
          title={sidebarState === "collapsed" ? "Expand sidebar" : "Collapse sidebar"}
          className="mr-1 border border-border bg-card shadow-[1px_1px_0_hsl(var(--foreground)/0.08)] hover:bg-secondary"
          onFocus={() => setHeaderHovered(true)}
          onBlur={() => setHeaderHovered(false)}
        />

      <div data-testid="topbar-actions" className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open account menu" className="h-9 w-9 rounded-full border border-border bg-card hover:bg-secondary">
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
    </>
  );
}