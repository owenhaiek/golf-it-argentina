import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = 'BDaUHt3U7IUdDtUiZ-BUV47jUG6Qw1dTosxStUowFTg_sMnBjEKVOfCv4bJLJZEHJiUIt_SFrp2_B3_RfqWSbl4';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

export const useWebPush = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }).catch(() => {});
    }
  }, [user?.id]);

  const subscribe = useCallback(async () => {
    if (!user?.id) {
      toast.error('Iniciá sesión para activar las notificaciones');
      return false;
    }
    if (!isSupported) {
      toast.error('Tu navegador no soporta notificaciones push');
      return false;
    }

    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        toast.error('Permiso de notificaciones denegado');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }

      const json = sub.toJSON();
      const { error } = await supabase.from('web_push_subscriptions').upsert({
        user_id: user.id,
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh || arrayBufferToBase64(sub.getKey('p256dh')),
        auth: json.keys?.auth || arrayBufferToBase64(sub.getKey('auth')),
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'endpoint' });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Notificaciones activadas');
      return true;
    } catch (err: any) {
      console.error('Web push subscribe error:', err);
      toast.error('Error al activar notificaciones');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!user?.id) return false;
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await supabase.from('web_push_subscriptions').delete().eq('endpoint', sub.endpoint);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      toast.success('Notificaciones desactivadas');
      return true;
    } catch (err) {
      console.error('Web push unsubscribe error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe };
};
