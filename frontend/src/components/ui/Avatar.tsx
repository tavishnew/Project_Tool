import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  name: string;
  color: string;
}

export function Avatar({ className = "", size = 28, name, color, children, ...props }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <span
      className={cn(
        "avatar",
        className,
      )}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
      {...props}
    >
      {children ?? initials}
    </span>
  );
}

interface AvatarStackProps {
  members: { id: string; name: string; color: string }[];
  max?: number;
  size?: number;
}

export function AvatarStack({ members, max = 4, size = 28 }: AvatarStackProps) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;

  return (
    <div className="avatar-stack">
      {shown.map((m) => (
        <Avatar key={m.id} name={m.name} color={m.color} size={size} />
      ))}
      {extra > 0 && (
        <span
          className="avatar"
          style={{ width: size, height: size, backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", fontSize: size * 0.35 }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}