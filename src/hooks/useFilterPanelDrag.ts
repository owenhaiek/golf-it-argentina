
import { useState, useEffect } from "react";

interface UseFilterPanelDragProps {
  onClose: () => void;
}

export const useFilterPanelDrag = ({ onClose }: UseFilterPanelDragProps) => {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientY);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    
    const currentY = e.touches[0].clientY;
    const offset = Math.max(0, currentY - dragStart);
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (dragOffset > 100) {
      onClose();
    }
    setDragStart(null);
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientY);
    setDragOffset(0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragStart === null) return;
    
    const offset = Math.max(0, e.clientY - dragStart);
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (dragOffset > 100) {
      onClose();
    }
    setDragStart(null);
    setDragOffset(0);
  };

  useEffect(() => {
    if (dragStart !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragStart, dragOffset]);

  return {
    dragOffset,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown
  };
};
