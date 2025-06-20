
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
  profiles?: {
    id?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

interface CourseReviewsProps {
  courseId?: string;
  reviews: Review[];
  isLoading: boolean;
}

const CourseReviews = ({ courseId, reviews, isLoading }: CourseReviewsProps) => {
  console.log("CourseReviews rendering with:", { courseId, reviewsCount: reviews?.length, isLoading });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No reviews yet</p>
        <p className="text-sm">Be the first to add a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const userProfile = review.profiles;
        const username = userProfile?.username || userProfile?.full_name || "Anonymous";
        const avatarUrl = userProfile?.avatar_url;
        
        return (
          <Card key={review.id} className="bg-card transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl || ""} alt={username} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{username}</h4>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium text-foreground">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    <span>
                      {format(new Date(review.created_at), "MMM dd, yyyy 'at' HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CourseReviews;
