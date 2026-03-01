import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useActiveAuthProvider,
  useLogout,
  useRefineOptions,
  useGetIdentity,
} from "@refinedev/core";
import { LogOutIcon, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { JoinRequestsBadge } from "@/components/notifications/join-requests-badge";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const { isMobile } = useSidebar();

  return <>{isMobile ? <MobileHeader /> : <DesktopHeader />}</>;
};

function DesktopHeader() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    navigate(`/classes?${params.toString()}`);
  };

  return (
    <header
      className={cn(
        "sticky",
        "top-0",
        "flex",
        "min-h-14",
        "sm:h-16",
        "shrink-0",
        "flex-wrap",
        "items-center",
        "gap-2",
        "sm:gap-4",
        "border-b",
        "border-border",
        "bg-sidebar",
        "px-2",
        "pr-3",
        "py-2",
        "z-40"
      )}
    >
      <form onSubmit={handleGlobalSearch} className="flex flex-1 min-w-0 max-w-full sm:max-w-sm flex-wrap items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
        <Input
          type="search"
          placeholder="Search..."
          className="h-9 flex-1 min-w-[120px] sm:min-w-[140px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />
        <Button type="submit" size="sm" variant="secondary" className="shrink-0">Search</Button>
      </form>
      <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
        <JoinRequestsBadgeWrapper />
        <ThemeToggle className="h-9 w-9" />
        <UserDropdown />
      </div>
    </header>
  );
}

function MobileHeader() {
  const { open, isMobile } = useSidebar();
  const { title } = useRefineOptions();

  return (
    <header
      className={cn(
        "sticky",
        "top-0",
        "flex",
        "h-14",
        "shrink-0",
        "items-center",
        "gap-2",
        "border-b",
        "border-border",
        "bg-sidebar",
        "px-2",
        "pr-3",
        "justify-between",
        "z-40",
        "safe-area-inset-top"
      )}
    >
      <SidebarTrigger
        className={cn("text-muted-foreground", "rotate-180", "ml-1", "shrink-0", "touch-manipulation", {
          "opacity-0": open,
          "opacity-100": !open || isMobile,
          "pointer-events-auto": !open || isMobile,
          "pointer-events-none": open && !isMobile,
        })}
      />

      <div
        className={cn(
          "whitespace-nowrap",
          "flex",
          "flex-row",
          "h-full",
          "items-center",
          "justify-start",
          "gap-2",
          "min-w-0",
          "flex-1",
          "transition-discrete",
          "duration-200",
          { "pl-3": !open, "pl-2": open }
        )}
      >
        <div className="shrink-0 flex items-center justify-center [&>svg]:h-6 [&>svg]:w-6">{title.icon}</div>
        <h2
          className={cn(
            "text-sm",
            "font-bold",
            "truncate",
            "transition-opacity",
            "duration-200",
            { "opacity-0": !open, "opacity-100": open }
          )}
        >
          {title.text}
        </h2>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <JoinRequestsBadgeWrapper />
        <ThemeToggle className={cn("h-9", "w-9", "touch-manipulation")} />
        <UserDropdown />
      </div>
    </header>
  );
}

const JoinRequestsBadgeWrapper = () => {
  const { data: identity } = useGetIdentity();
  const userRole = identity?.role;
  
  // Only show for teachers and admins
  if (userRole !== 'teacher' && userRole !== 'admin') {
    return null;
  }

  return <JoinRequestsBadge />;
};

const UserDropdown = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const authProvider = useActiveAuthProvider();

  if (!authProvider?.getIdentity) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            logout();
          }}
        >
          <LogOutIcon
            className={cn("text-destructive", "hover:text-destructive")}
          />
          <span className={cn("text-destructive", "hover:text-destructive")}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Header.displayName = "Header";
MobileHeader.displayName = "MobileHeader";
DesktopHeader.displayName = "DesktopHeader";
