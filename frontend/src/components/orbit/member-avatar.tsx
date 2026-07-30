import { cn } from "@/lib/utils";
import type { Member } from "@/types";

interface MemberAvatarProps {
  member: Pick<Member, "id" | "name" | "color">;
  size?: number;
  className?: string;
}

// Shared class string: avatar circle styling (used in MemberAvatar + overflow count)
const avatarRing = "inline-flex items-center justify-center rounded-full border-2 border-background font-semibold text-white";

export function MemberAvatar({
  member,
  size = 28,
  className,
}: MemberAvatarProps) {
  const initials = member.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      data-testid="member-avatar"
      className={cn(avatarRing, className)}
      style={{
        width: size,
        height: size,
        backgroundColor: member.color,
        fontSize: size * 0.4,
      }}
      title={member.name}
    >
      {initials}
    </span>
  );
}

export function MemberStack({
  members,
  max = 4,
  size = 28,
}: {
  members: Member[];
  max?: number;
  size?: number;
}) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <div data-testid="member-stack" className="flex -space-x-2">
      {shown.map((m) => (
        <MemberAvatar key={m.id} member={m} size={size} />
      ))}
      {extra > 0 && (
        <span
          data-testid="member-overflow-count"
          className="inline-flex items-center justify-center rounded-full border-2 border-background bg-muted text-[11px] font-semibold text-muted-foreground"
          style={{ width: size, height: size }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}