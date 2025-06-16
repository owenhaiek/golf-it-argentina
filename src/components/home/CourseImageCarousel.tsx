
import SimpleCarousel from "./SimpleCarousel";

interface CourseImageCarouselProps {
  images: string[];
  courseName: string;
  courseId: string;
}

const CourseImageCarousel = ({ images, courseName, courseId }: CourseImageCarouselProps) => {
  return (
    <SimpleCarousel 
      images={images} 
      courseName={courseName} 
      courseId={courseId} 
    />
  );
};

export default CourseImageCarousel;
