import { useQuery } from '@tanstack/react-query';
import { fetchAchievements } from '../api/achievements';
import type { AchievementsResponse } from '../types';

export function useAchievements(userId: number | string) {
  const { data, isLoading, isError, refetch } = useQuery<AchievementsResponse>({
    queryKey: ['achievements', userId],
    queryFn: () => fetchAchievements(userId),
    staleTime: 30_000,
    enabled: !!userId,
    retry: 2,
  });

  return { data, isLoading, isError, refetch };
}
