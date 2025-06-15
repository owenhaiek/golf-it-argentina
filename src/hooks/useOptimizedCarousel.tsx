
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseOptimizedCarouselProps {
  totalSlides: number;
  autoPlayDelay?: number;
  enableAutoPlay?: boolean;
}

export const useOptimizedCarousel = ({
  totalSlides,
  autoPlayDelay = 5000,
  enableAutoPlay = true
}: UseOptimizedCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index);
    
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentSlide, isTransitioning]);

  const goToNext = useCallback(() => {
    const nextSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
    goToSlide(nextSlide);
  }, [currentSlide, totalSlides, goToSlide]);

  const goToPrevious = useCallback(() => {
    const prevSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    goToSlide(prevSlide);
  }, [currentSlide, totalSlides, goToSlide]);

  // Touch handlers for smooth mobile swiping
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  }, [goToNext, goToPrevious]);

  // Auto-play functionality
  useEffect(() => {
    if (!enableAutoPlay || totalSlides <= 1) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(goToNext, autoPlayDelay);
    };

    const stopAutoPlay = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };

    startAutoPlay();

    return stopAutoPlay;
  }, [goToNext, autoPlayDelay, enableAutoPlay, totalSlides]);

  // Pause auto-play on user interaction
  const pauseAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  const resumeAutoPlay = useCallback(() => {
    if (enableAutoPlay && totalSlides > 1) {
      autoPlayRef.current = setInterval(goToNext, autoPlayDelay);
    }
  }, [goToNext, autoPlayDelay, enableAutoPlay, totalSlides]);

  return {
    currentSlide,
    isTransitioning,
    goToSlide,
    goToNext,
    goToPrevious,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    pauseAutoPlay,
    resumeAutoPlay
  };
};
