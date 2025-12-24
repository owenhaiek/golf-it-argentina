import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import { 
  getCustomerInfo, 
  hasActiveSubscription as checkSubscription,
  identifyUser,
  getOfferings
} from '@/services/revenueCat';

export interface SubscriptionState {
  isPremium: boolean;
  isLoading: boolean;
  offerings: any | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    isLoading: true,
    offerings: null
  });

  const checkSubscriptionStatus = useCallback(async () => {
    // On web, check localStorage for demo purposes (in production, check against backend)
    if (!Capacitor.isNativePlatform()) {
      const webPremiumStatus = localStorage.getItem('golf_premium_status');
      setState({
        isPremium: webPremiumStatus === 'true',
        isLoading: false,
        offerings: null
      });
      return;
    }

    try {
      // Identify user in RevenueCat
      if (user?.id) {
        await identifyUser(user.id);
      }

      // Check for active subscription
      const hasPremium = await checkSubscription('premium');
      const offerings = await getOfferings();

      setState({
        isPremium: hasPremium,
        isLoading: false,
        offerings
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.id]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  const refreshSubscription = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // For web demo/testing purposes
  const setWebPremiumStatus = useCallback((isPremium: boolean) => {
    if (!Capacitor.isNativePlatform()) {
      localStorage.setItem('golf_premium_status', isPremium.toString());
      setState(prev => ({ ...prev, isPremium }));
    }
  }, []);

  return {
    ...state,
    refreshSubscription,
    setWebPremiumStatus
  };
};
