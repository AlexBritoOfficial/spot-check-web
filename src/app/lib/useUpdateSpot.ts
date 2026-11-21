import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSpot } from "./spotRepository";
import { NewSpot } from "./spotSchema";

export function useUpdateSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, spot }: { id: string; spot: NewSpot }) =>
      updateSpot(id, spot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spots"] });
    },
  });
}
