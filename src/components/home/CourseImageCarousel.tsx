
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CourseImageCarouselProps {
  images: string[];
  courseName: string;
  courseId: string;
}

const CourseImageCarousel = ({ images, courseName, courseId }: CourseImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative">
      <img
        src={images[currentImageIndex]}
        alt={courseName}
        className="w-full h-48 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
        }}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <div className="flex gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseImageCarousel;
