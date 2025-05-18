
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReviewProfile {
  username?: string;
  avatar_url?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id?: string;
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
      <div className="space-y-4">
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
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
        <p>No reviews yet for this course</p>
        <p className="text-sm">Be the first one to leave a review</p>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"} 
              />
            ))}
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      {/* All reviews */}
      <div className="space-y-4">
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
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{review.profiles.username || "Anonymous User"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"} 
                    />
                  ))}
                </div>
                <p className="text-sm mt-1">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseReviews;
