
import { useCallback } from 'react';

export const useNavigationTouch = () => {
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  return {
    handleTouchStart,
    handleTouchMove
  };
};
