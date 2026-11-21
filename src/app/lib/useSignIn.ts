import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn } from "./authRepository";

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
    },
  });
}
