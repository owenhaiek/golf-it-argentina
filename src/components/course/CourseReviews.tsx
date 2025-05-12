
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";

interface ReviewProfile {
  username?: string;
  avatar_url?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: ReviewProfile;
}

interface CourseReviewsProps {
  courseId?: string;
  reviews: Review[];
  isLoading: boolean;
}

export const CourseReviews = ({ courseId, reviews, isLoading }: CourseReviewsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 bg-muted animate-pulse rounded mb-1" />
                  <div className="h-3 bg-muted animate-pulse rounded mb-1 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Reviews</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
          <p>No reviews yet for this course</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {review.profiles.avatar_url ? (
                    <img 
                      src={review.profiles.avatar_url} 
                      alt={review.profiles.username || "User"} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-primary font-bold">
                      {(review.profiles.username || "User")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.profiles.username || "Anonymous User"}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mt-1">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseReviews;
