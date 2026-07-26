// Generate a consistent color from a string (e.g., name, email, ID)
const MEMBER_COLORS = [
  '#ff5a4e', // coral (primary)
  '#f59e0b', // amber
  '#10b981', // emerald
  '#6366f1', // indigo
  '#ec4899', // pink
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#84cc16', // lime
  '#f97316', // orange
  '#06b6d4', // cyan
];

export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

export function getMemberColor(member: { color?: string | null; name: string }): string {
  return member.color || generateColorFromString(member.name);
}
