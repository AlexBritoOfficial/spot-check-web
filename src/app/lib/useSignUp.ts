import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signUp } from "./authRepository";

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
    },
  });
}
