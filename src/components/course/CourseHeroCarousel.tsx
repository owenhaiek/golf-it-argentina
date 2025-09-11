import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseHeroCarouselProps {
  images: string[];
  courseName: string;
  children?: React.ReactNode;
}

const CourseHeroCarousel = ({ images, courseName, children }: CourseHeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(images.length).fill(false));
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [initialTranslateX, setInitialTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Preload images
  useEffect(() => {
    const loadedStates = new Array(images.length).fill(false);
    
    images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        loadedStates[index] = true;
        setImagesLoaded([...loadedStates]);
      };
      img.onerror = () => {
        loadedStates[index] = true;
        setImagesLoaded([...loadedStates]);
      };
      img.src = src;
    });
  }, [images]);

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, images.length - 1)));
    setTranslateX(0);
  };

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    goToSlide(currentIndex - 1);
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    goToSlide(currentIndex + 1);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setInitialTranslateX(translateX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(initialTranslateX + diff);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const threshold = 80;
    const diff = translateX - initialTranslateX;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else if (diff < 0 && currentIndex < images.length - 1) {
        goToSlide(currentIndex + 1);
      } else {
        setTranslateX(0);
      }
    } else {
      setTranslateX(0);
    }
    
    setIsDragging(false);
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setInitialTranslateX(translateX);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const diff = e.clientX - startX;
    setTranslateX(initialTranslateX + diff);
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    if (!isDragging) return;
    
    const threshold = 50;
    const diff = translateX - initialTranslateX;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else if (diff < 0 && currentIndex < images.length - 1) {
        goToSlide(currentIndex + 1);
      } else {
        setTranslateX(0);
      }
    } else {
      setTranslateX(0);
    }
    
    setIsDragging(false);
  };

  // Add mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const diff = e.clientX - startX;
      setTranslateX(initialTranslateX + diff);
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX, initialTranslateX, currentIndex, images.length]);

  if (images.length === 0) {
    return (
      <div className="relative w-full h-80 sm:h-96 md:h-[28rem] bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
        {children}
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="relative w-full h-80 sm:h-96 md:h-[28rem]">
        <img 
          src={images[0]} 
          alt={courseName} 
          className="w-full h-full object-cover" 
          onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Golf+Course'} 
        />
        {children}
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 sm:h-96 md:h-[28rem] overflow-hidden">
      {/* Image container with touch handlers */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-300 ease-out h-full select-none cursor-grab active:cursor-grabbing transform-gpu"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
            willChange: 'transform',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {images.map((image, index) => (
            <div key={index} className="flex-shrink-0 w-full h-full">
              <img
                src={image}
                alt={`${courseName} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Golf+Course'}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows - only on desktop */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex bg-black/20 hover:bg-black/40 text-white border-0 h-10 w-10 p-0 z-40"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex bg-black/20 hover:bg-black/40 text-white border-0 h-10 w-10 p-0 z-40"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-40 pointer-events-auto">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Fixed overlay content */}
      <div className="absolute inset-0 z-30 pointer-events-none transform-gpu">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CourseHeroCarousel;