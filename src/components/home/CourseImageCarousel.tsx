
import TouchCarousel from "./TouchCarousel";

interface CourseImageCarouselProps {
  images: string[];
  courseName: string;
  courseId: string;
}

const CourseImageCarousel = ({ images, courseName, courseId }: CourseImageCarouselProps) => {
  return (
    <TouchCarousel 
      images={images} 
      courseName={courseName} 
      courseId={courseId} 
    />
  );
};

export default CourseImageCarousel;
