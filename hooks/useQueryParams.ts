import { useEffect, useState, useCallback } from 'react';

export const useQueryParams = () => {
  const [queryParams, setQueryParams] = useState<URLSearchParams>(() => {
    return new URLSearchParams(window.location.search);
  });

  useEffect(() => {
    const updateQueryParams = () => {
      setQueryParams(new URLSearchParams(window.location.search));
    };

    // Listen for URL changes
    window.addEventListener('popstate', updateQueryParams);
    
    return () => {
      window.removeEventListener('popstate', updateQueryParams);
    };
  }, []);

  const getParam = useCallback((key: string): string | null => {
    return queryParams.get(key);
  }, [queryParams]);

  const getNumericParam = useCallback((key: string): number | null => {
    const value = queryParams.get(key);
    if (!value) return null;
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(numericValue) ? null : numericValue;
  }, [queryParams]);

  const hasParam = useCallback((key: string): boolean => {
    return queryParams.has(key);
  }, [queryParams]);

  return { getParam, getNumericParam, hasParam, queryParams };
};
