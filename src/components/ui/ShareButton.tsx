
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ShareButtonProps {
  course: any;
  size?: "sm" | "lg" | "default";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export const ShareButton = ({ 
  course, 
  size = "default", 
  variant = "outline",
  className 
}: ShareButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: course.name,
      text: `Check out ${course.name} golf course!`,
      url: window.location.origin + `/course/${course.id}`
    };

    // Check if Web Share API is supported (mainly mobile devices)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copied!",
          description: "Golf course link has been copied to your clipboard.",
        });
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareData.url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast({
          title: "Link copied!",
          description: "Golf course link has been copied to your clipboard.",
        });
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn(className)}
    >
      <Share className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
};

export default ShareButton;
