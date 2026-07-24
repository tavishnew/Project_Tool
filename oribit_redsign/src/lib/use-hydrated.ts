import { useEffect, useState } from "react";
import { useStore } from "./mock-store";

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useAuthUser() {
  const hydrated = useHydrated();
  const user = useStore((s) => s.user);
  return { user: hydrated ? user : null, hydrated };
}
