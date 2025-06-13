
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AddReviewFormProps {
  courseId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const reviewSchema = z.object({
  rating: z.number().min(1, { message: "Please select a rating" }).max(5, { message: "Rating must be between 1 and 5" }),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters" }),
});

type ReviewValues = z.infer<typeof reviewSchema>;

const AddReviewForm = ({ courseId, onSuccess, onCancel }: AddReviewFormProps) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const currentRating = form.watch("rating");

  // Check if user already has a review for this course
  const { data: existingReview, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['user-course-review', courseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user && !!courseId,
  });

  // Set form values when existing review is loaded
  useEffect(() => {
    if (existingReview && !isEditing) {
      form.setValue("rating", existingReview.rating);
      form.setValue("comment", existingReview.comment);
    }
  }, [existingReview, form, isEditing]);

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async (data: ReviewValues) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (existingReview) {
        // Update existing review
        const { data: reviewData, error } = await supabase
          .from("course_reviews")
          .update({
            rating: data.rating,
            comment: data.comment,
          })
          .eq('id', existingReview.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating review:", error);
          throw error;
        }

        return reviewData;
      } else {
        // Create new review
        const { data: reviewData, error } = await supabase
          .from("course_reviews")
          .insert({
            course_id: courseId,
            user_id: user.id,
            rating: data.rating,
            comment: data.comment,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding review:", error);
          throw error;
        }

        return reviewData;
      }
    },
    onSuccess: () => {
      toast({
        title: existingReview ? "Review Updated" : "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Review submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit review",
      });
    },
  });

  const onSubmit = (data: ReviewValues) => {
    console.log("Submitting review:", data);
    submitReview(data);
  };

  const getStarDisplay = (index: number) => {
    const displayRating = hoveredRating || currentRating;
    return index <= displayRating;
  };

  if (isLoadingExisting) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show existing review if not editing
  if (existingReview && !isEditing) {
    return (
      <div className="bg-accent/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Your Review</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit3 size={14} />
            Edit Review
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <Star
              key={index}
              className={`h-5 w-5 ${
                index <= existingReview.rating
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm font-medium">
            {existingReview.rating} out of 5 stars
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="font-medium mb-4">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Rating */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <button
                        key={index}
                        type="button"
                        className="p-1 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                        onMouseEnter={() => setHoveredRating(index)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => field.onChange(index)}
                      >
                        <Star 
                          className={`h-6 w-6 transition-all duration-200 ${
                            getStarDisplay(index)
                              ? 'text-yellow-500 fill-yellow-500 scale-110' 
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                    {currentRating > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {currentRating} out of 5 stars
                      </span>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Comment */}
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your review here..."
                    className="resize-none min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                if (existingReview) {
                  setIsEditing(false);
                  form.setValue("rating", existingReview.rating);
                  form.setValue("comment", existingReview.comment);
                } else {
                  onCancel();
                }
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || currentRating === 0}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {existingReview ? "Updating..." : "Submitting..."}
                </>
              ) : (
                existingReview ? "Update Review" : "Submit Review"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddReviewForm;
