import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const registerToken = useCallback(async (token: string, platform: string) => {
    if (!user?.id) return;

    try {
      // Upsert the token (insert or update if exists)
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: user.id,
            token,
            platform,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id,token'
          }
        );

      if (error) {
        console.error('Error registering push token:', error);
      } else {
        console.log('Push token registered successfully');
      }
    } catch (err) {
      console.error('Error in registerToken:', err);
    }
  }, [user?.id]);

  const removeToken = useCallback(async (token: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('token', token);

      if (error) {
        console.error('Error removing push token:', error);
      }
    } catch (err) {
      console.error('Error in removeToken:', err);
    }
  }, [user?.id]);

  const requestPermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web');
      return false;
    }

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        toast({
          title: 'Permisos denegados',
          description: 'Las notificaciones push no están habilitadas',
          variant: 'destructive'
        });
        return false;
      }

      await PushNotifications.register();
      return true;
    } catch (err) {
      console.error('Error requesting push permission:', err);
      return false;
    }
  }, [toast]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user?.id) return;

    // Request permission and register
    requestPermission();

    // Listen for registration success
    const registrationListener = PushNotifications.addListener(
      'registration',
      (token: Token) => {
        console.log('Push registration success, token:', token.value);
        const platform = Capacitor.getPlatform();
        registerToken(token.value, platform);
      }
    );

    // Listen for registration errors
    const errorListener = PushNotifications.addListener(
      'registrationError',
      (error: any) => {
        console.error('Push registration error:', error);
      }
    );

    // Listen for push notifications received
    const notificationListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        toast({
          title: notification.title || 'Notificación',
          description: notification.body || ''
        });
      }
    );

    // Listen for notification actions (when user taps notification)
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push notification action:', notification);
        const data = notification.notification.data;

        // Navigate based on notification type
        if (data?.type === 'match_reminder' && data?.match_id) {
          navigate(`/profile`);
        } else if (data?.type === 'tournament_reminder' && data?.tournament_id) {
          navigate(`/profile`);
        } else {
          navigate('/notifications');
        }
      }
    );

    return () => {
      registrationListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      notificationListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [user?.id, registerToken, navigate, toast, requestPermission]);

  return {
    requestPermission,
    removeToken
  };
};
