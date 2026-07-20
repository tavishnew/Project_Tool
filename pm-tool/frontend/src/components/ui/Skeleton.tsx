function Bar({ w }: { w: string }) {
  return <div className={`animate-pulse rounded-sm bg-line/60 ${w}`} />;
}

export function Skeleton() {
  return null;
}

Skeleton.Row = function Row() {
  return (
    <div className="flex items-center gap-4 border-b border-line py-5">
      <Bar w="w-8 h-3" />
      <Bar w="w-2.5 h-2.5 rounded-full" />
      <div className="flex-1 space-y-2">
        <Bar w="w-48 h-3" />
        <Bar w="w-32 h-2.5" />
      </div>
      <Bar w="w-40 h-2.5" />
    </div>
  );
};

Skeleton.Card = function Card() {
  return (
    <div className="tick-frame space-y-2 rounded-sm border border-line bg-surface p-3 shadow-card">
      <Bar w="w-3/4 h-3" />
      <Bar w="w-full h-2.5" />
      <Bar w="w-1/2 h-2.5" />
    </div>
  );
};
