import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MapPin, Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

// This component is now deprecated since matches are created as active directly
// Keeping the shell for potential future use with tournament invitations
export const InvitationDrawer = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  // No pending invitations since matches are now created as active
  const invitations: any[] = [];

  const handleClose = () => {
    setIsVisible(false);
  };

  // Never show since there are no pending invitations
  if (!isVisible || invitations.length === 0) {
    return null;
  }

  return null;
};
