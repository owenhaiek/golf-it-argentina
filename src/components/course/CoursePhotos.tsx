
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

interface CoursePhotosProps {
  courseId?: string;
}

export const CoursePhotos = ({ courseId }: CoursePhotosProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Photos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Image className="h-12 w-12 mb-2 opacity-20" />
        <p>No additional photos available</p>
      </CardContent>
    </Card>
  );
};

export default CoursePhotos;
