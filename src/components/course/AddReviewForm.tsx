
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Loader2 } from "lucide-react";
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

  const { mutate: addReview, isPending } = useMutation({
    mutationFn: async (data: ReviewValues) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

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
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      form.reset();
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
    addReview(data);
  };

  const getStarDisplay = (index: number) => {
    const displayRating = hoveredRating || currentRating;
    return index <= displayRating;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        className={`h-8 w-8 transition-all duration-200 ${
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
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || currentRating === 0}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddReviewForm;
