import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 rounded-2xl p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-full bg-zinc-800 rounded mb-1" />
                <div className="h-3 w-2/3 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <MessageCircle className="h-14 w-14 text-zinc-600 mb-4" />
          <p className="text-lg font-medium text-white mb-2">{t("course", "noReviewsYet")}</p>
          <p className="text-sm text-zinc-400">{t("course", "firstToAddReview")}</p>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</p>
            <div className="flex items-center justify-center gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-zinc-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500">{reviews.length} reseñas</p>
          </div>
          
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(r => Math.round(r.rating) === rating).length;
              const percentage = (count / reviews.length) * 100;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-3">{rating}</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((review) => {
          const userProfile = review.profiles;
          const username = userProfile?.username || userProfile?.full_name || "Anónimo";
          const avatarUrl = userProfile?.avatar_url;
          
          return (
            <div key={review.id} className="bg-zinc-900 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-zinc-800">
                  <AvatarImage src={avatarUrl || ""} alt={username} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300 font-medium">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium text-white truncate">{username}</h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-300 leading-relaxed mb-2">
                    {review.comment}
                  </p>
                  
                  <p className="text-xs text-zinc-500">
                    {format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseReviews;