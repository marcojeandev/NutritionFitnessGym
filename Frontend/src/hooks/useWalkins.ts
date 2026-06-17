import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walkinService } from '../services/walkin.service';
import { WalkInInfo } from '../types/models';

export const useWalkins = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['walkins'],
    queryFn: walkinService.getWalkins,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<WalkInInfo>) => walkinService.registerWalkin(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['walkins'] });
    },
  });

  return {
    walkins: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createWalkin: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};
