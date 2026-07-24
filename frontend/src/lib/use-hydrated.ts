import { useEffect, useState } from "react";
import { useAuth } from "@/auth";

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useAuthUser() {
  const { user, loading } = useAuth();
  return { user: loading ? null : user, hydrated: !loading };
}
