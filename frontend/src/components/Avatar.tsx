interface AvatarStackProps {
  members: { id: string; name: string }[];
  max?: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AvatarStack({ members, max = 4 }: AvatarStackProps) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <span className="avatar-stack" title={members.map((m) => m.name).join(', ')}>
      {shown.map((m) => (
        <span key={m.id} className="avatar">
          {initials(m.name)}
        </span>
      ))}
      {extra > 0 && <span className="avatar avatar-more">+{extra}</span>}
    </span>
  );
}
