import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // For above-the-fold images
  sizes?: string; // For responsive images
}

const OptimizedImage = ({
  src,
  alt,
  className = '',
  placeholder = 'https://placehold.co/600x400?text=Loading...',
  onLoad,
  onError,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(priority ? src : placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(priority);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before coming into view
        threshold: 0.1
      }
    );

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, [priority, isInView]);

  // Load actual image when in view
  useEffect(() => {
    if (!isInView || hasError) return;

    const img = new Image();
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      setImgSrc('https://placehold.co/600x400?text=Image+Error');
      onError?.();
    };

    img.src = src;
  }, [isInView, src, onLoad, onError, hasError]);

  return (
    <div className="relative overflow-hidden">
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-70'
        } ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        draggable={false}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 bg-secondary/10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;