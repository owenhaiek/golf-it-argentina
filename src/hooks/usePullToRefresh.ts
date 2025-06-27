
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UsePullToRefreshOptions {
  onRefresh?: () => void;
  refreshThreshold?: number;
  disabled?: boolean;
}

export const usePullToRefresh = ({ 
  onRefresh = () => window.location.reload(), 
  refreshThreshold = 100,
  disabled = false 
}: UsePullToRefreshOptions = {}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const location = useLocation();

  const handleTouchStart = (e: TouchEvent, scrollElement: Element) => {
    if (disabled || location.pathname === '/courses-map') return;
    
    if (scrollElement.scrollTop <= 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
      setPullDistance(0);
    }
  };

  const handleTouchMove = (e: TouchEvent, scrollElement: Element) => {
    if (!isPulling || disabled || location.pathname === '/courses-map') return;
    
    if (scrollElement.scrollTop <= 0) {
      const currentY = e.touches[0].clientY;
      const newPullDistance = Math.sqrt(Math.max(0, currentY - startY) * 8);
      
      setPullDistance(newPullDistance);
      
      if (newPullDistance > 10) {
        e.preventDefault();
      }
      
      if (newPullDistance > refreshThreshold && !isRefreshing) {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
        
        setIsRefreshing(true);
        setTimeout(() => {
          onRefresh();
        }, 300);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    setIsPulling(false);
    setPullDistance(0);
    
    if (pullDistance < refreshThreshold) {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setIsRefreshing
  };
};
