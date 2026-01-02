import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostRoundReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  courseImage?: string;
}

const PostRoundReviewDialog = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  courseImage
}: PostRoundReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user already has a review
  const { data: existingReview } = useQuery({
    queryKey: ['user-course-review', courseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') return null;
      return data;
    },
    enabled: !!user && !!courseId && isOpen,
  });

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      if (existingReview) {
        const { error } = await supabase
          .from("course_reviews")
          .update({ rating, comment })
          .eq('id', existingReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("course_reviews")
          .insert({
            course_id: courseId,
            user_id: user.id,
            rating,
            comment,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo enviar la reseña",
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Selecciona una calificación",
      });
      return;
    }
    if (comment.length < 10) {
      toast({
        variant: "destructive",
        title: "El comentario debe tener al menos 10 caracteres",
      });
      return;
    }
    submitReview();
  };

  const displayRating = hoveredRating || rating;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-zinc-900/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 flex flex-col items-center justify-center min-h-[300px]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-white"
                >
                  ¡Gracias por tu reseña!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-center mt-2"
                >
                  Tu opinión ayuda a otros golfistas
                </motion.p>
              </motion.div>
            ) : (
              <>
                {/* Header image */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={courseImage || '/placeholder.svg'}
                    alt={courseName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                  
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs text-primary font-medium">¡Ronda guardada!</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white">
                      ¿Cómo estuvo {courseName}?
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comparte tu experiencia con otros golfistas
                    </p>
                  </div>

                  {/* Star rating */}
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <motion.button
                        key={index}
                        type="button"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={() => setHoveredRating(index)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(index)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-9 h-9 transition-all duration-200 ${
                            index <= displayRating
                              ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                              : 'text-zinc-600'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {/* Rating label */}
                  <AnimatePresence mode="wait">
                    {displayRating > 0 && (
                      <motion.p
                        key={displayRating}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="text-center text-sm text-muted-foreground"
                      >
                        {displayRating === 1 && "Malo"}
                        {displayRating === 2 && "Regular"}
                        {displayRating === 3 && "Bueno"}
                        {displayRating === 4 && "Muy bueno"}
                        {displayRating === 5 && "Excelente"}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Comment */}
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia en el campo..."
                    className="bg-zinc-800/50 border-zinc-700 focus:border-primary resize-none min-h-[100px] rounded-xl"
                  />

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 rounded-xl border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50"
                    >
                      Omitir
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isPending || rating === 0}
                      className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      {isPending ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        "Enviar reseña"
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostRoundReviewDialog;
