import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTranslatedNotification } from "@/utils/notificationTranslations";
import { motion, AnimatePresence } from "framer-motion";

const Notifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading, 
    unreadCount,
    markAsRead, 
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead
  } = useNotifications();

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    const senderId = notification.data?.sender_id || notification.sender_profile?.id;
    
    if (notification.type === 'friend_request' && senderId) {
      navigate(`/user/${senderId}`);
    } else if (notification.type === 'match_challenge' || notification.type === 'match_accepted' || notification.type === 'match_declined') {
      if (senderId) {
        navigate(`/user/${senderId}`);
      } else {
        navigate('/profile');
      }
    } else if (senderId) {
      navigate(`/user/${senderId}`);
    } else {
      navigate('/profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-zinc-950" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 px-4 py-4 bg-zinc-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-700/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {t("common", "notifications") || "Notificaciones"}
                </h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} sin leer
                  </p>
                )}
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas
              </Button>
            )}
          </div>
        </motion.header>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2 pb-28">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <div className="relative bg-zinc-900/80 backdrop-blur-xl p-6 rounded-full">
                      <Bell className="h-12 w-12 text-primary/60" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t("notifications", "noNotifications") || "Sin notificaciones"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("notifications", "allCaughtUp") || "¡Estás al día!"}
                  </p>
                </motion.div>
              ) : (
                notifications.map((notification, index) => {
                  const translatedNotification = getTranslatedNotification(notification, t);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        relative cursor-pointer rounded-xl p-4 transition-all duration-300
                        ${!notification.is_read 
                          ? 'bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5' 
                          : 'bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50'
                        }
                      `}
                    >
                      {/* Unread indicator glow */}
                      {!notification.is_read && (
                        <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl pointer-events-none" />
                      )}
                      
                      <div className="relative flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-2 ring-white/10">
                            <AvatarImage 
                              src={notification.sender_profile?.avatar_url || undefined} 
                              alt={notification.sender_profile?.full_name || notification.sender_profile?.username || 'User'} 
                            />
                            <AvatarFallback className="bg-primary/20 text-primary font-medium">
                              {(notification.sender_profile?.full_name?.[0] || notification.sender_profile?.username?.[0] || 'U').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {!notification.is_read && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full ring-2 ring-zinc-950 animate-pulse" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium truncate ${!notification.is_read ? 'text-foreground' : 'text-foreground/80'}`}>
                              {translatedNotification.title}
                            </h4>
                          </div>
                          <p className={`text-sm mb-2 line-clamp-2 ${!notification.is_read ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                            {translatedNotification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            disabled={isMarkingAsRead}
                            className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
                          >
                            <Check size={14} />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;