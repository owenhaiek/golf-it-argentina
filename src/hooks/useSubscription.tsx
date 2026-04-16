import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionState {
  isPremium: boolean;
  isLoading: boolean;
  subscriptionEnd: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    isLoading: true,
    subscriptionEnd: null,
  });

  const checkSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setState({ isPremium: false, isLoading: false, subscriptionEnd: null });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      setState({
        isPremium: data?.subscribed ?? false,
        isLoading: false,
        subscriptionEnd: data?.subscription_end ?? null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscriptionStatus, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscriptionStatus]);

  const refreshSubscription = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  const startCheckout = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  }, []);

  return {
    ...state,
    refreshSubscription,
    startCheckout,
    openCustomerPortal,
  };
};
