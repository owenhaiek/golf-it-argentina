
import { Flag } from "lucide-react";
import { motion } from "framer-motion";

interface CourseMarkerProps {
  course: {
    id: string;
    name: string;
    holes: number;
    par?: number;
    image_url?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    website?: string;
  };
  onClick: (course: any) => void;
}

export const CourseMarker = ({ course, onClick }: CourseMarkerProps) => {
  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(course)}
    >
      <div className="w-10 h-10 rounded-full shadow-lg border-2 flex items-center justify-center bg-green-500 border-green-600 text-white hover:shadow-xl transition-all duration-200">
        <Flag className="w-5 h-5" />
      </div>
      
      {/* Status indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-green-400" />
    </motion.div>
  );
};

// Also export as default for backward compatibility
export default CourseMarker;
