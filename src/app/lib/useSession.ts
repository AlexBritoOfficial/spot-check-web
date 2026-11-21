import { useQuery } from "@tanstack/react-query";
import { getSession } from "./authRepository";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
  });
}
