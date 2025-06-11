import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle } from "lucide-react";
import { format } from "date-fns";

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

interface CourseReviewsProps {
  courseId?: string;
  reviews: Review[];
  isLoading: boolean;
}

const CourseReviews = ({ courseId, reviews, isLoading }: CourseReviewsProps) => {
  if (isLoading) {
    return (
      <CardContent className="py-6 flex items-center justify-center">
        Loading reviews...
      </CardContent>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <CardContent className="py-6 text-center text-muted-foreground">
        No reviews yet. Be the first to add a review!
      </CardContent>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={review.avatar_url || ""} alt={review.username || "User"} />
                <AvatarFallback>{review.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{review.username || "Anonymous"}</div>
                  <div className="flex items-center space-x-1 text-xs text-yellow-500">
                    <Star className="h-4 w-4" />
                    <span>{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <div className="text-xs text-muted-foreground">
                  <MessageCircle className="h-3 w-3 inline-block mr-1" />
                  Posted on {format(new Date(review.created_at), "MMM dd, yyyy")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CourseReviews;
