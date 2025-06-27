
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

// Generic hook for optimized queries with consistent error handling
export const useOptimizedQuery = <TData, TError = Error>(
  options: UseQueryOptions<TData, TError>
) => {
  const memoizedOptions = useMemo(() => options, [
    options.queryKey,
    options.queryFn,
    options.enabled
  ]);

  return useQuery(memoizedOptions);
};
