import { cn } from "@/lib/utils";

export interface Member {
  id: string;
  name: string;
  email: string;
  role?: "owner" | "admin" | "member";
  color: string;
}

export function MemberAvatar({
  member,
  size = 28,
  className,
}: {
  member: Member;
  size?: number;
  className?: string;
}) {
  const initials = member.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2 border-background font-semibold text-white",
        className,
      )}
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
    <div className="flex -space-x-2">
      {shown.map((m) => (
        <MemberAvatar key={m.id} member={m} size={size} />
      ))}
      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full border-2 border-background bg-muted text-[11px] font-semibold text-muted-foreground"
          style={{ width: size, height: size }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}