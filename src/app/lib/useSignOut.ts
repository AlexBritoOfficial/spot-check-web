import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "./authRepository";

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
    },
  });
}
