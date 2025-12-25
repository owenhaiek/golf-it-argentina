interface NotificationData {
  sender_id?: string;
  match_id?: string;
  [key: string]: any;
}

interface Notification {
  type: string;
  title: string;
  message: string;
  data?: NotificationData;
  sender_profile?: {
    full_name?: string | null;
    username?: string | null;
  };
}

interface TranslationFunction {
  (section: string, key: string): string;
}

export const getTranslatedNotification = (
  notification: Notification, 
  t: TranslationFunction
): { title: string; message: string } => {
  const senderName = notification.sender_profile?.full_name || 
                     notification.sender_profile?.username || 
                     t("notifications", "unknownUser");

  switch (notification.type) {
    case 'friend_request':
      return {
        title: t("notifications", "friendRequestTitle"),
        message: `${senderName} ${t("notifications", "friendRequestMessage")}`
      };
    
    case 'match_challenge':
      return {
        title: t("notifications", "matchChallengeTitle"),
        message: `${senderName} ${t("notifications", "matchChallengeMessage")}`
      };
    
    case 'match_accepted':
      return {
        title: t("notifications", "matchAcceptedTitle"),
        message: `${senderName} ${t("notifications", "matchAcceptedMessage")}`
      };
    
    case 'match_declined':
      return {
        title: t("notifications", "matchDeclinedTitle"),
        message: `${senderName} ${t("notifications", "matchDeclinedMessage")}`
      };

    case 'match_reminder':
      return {
        title: t("notifications", "matchReminderTitle") || '⛳ Partido próximo',
        message: notification.message
      };

    case 'tournament_reminder':
      return {
        title: t("notifications", "tournamentReminderTitle") || '🏆 Torneo próximo',
        message: notification.message
      };
    
    default:
      // Return original title and message for unknown types
      return {
        title: notification.title,
        message: notification.message
      };
  }
};
