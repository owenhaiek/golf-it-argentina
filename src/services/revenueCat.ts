import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// RevenueCat API keys - replace with your actual keys from RevenueCat dashboard
const REVENUECAT_IOS_API_KEY = 'test_xRFajMPMJhScVjoVArjZnsV0tRa'; // Your iOS API key
const REVENUECAT_ANDROID_API_KEY = 'YOUR_ANDROID_API_KEY'; // Add your Android API key

export const initializeRevenueCat = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('RevenueCat: Running on web, skipping initialization');
    return;
  }

  try {
    const apiKey = Capacitor.getPlatform() === 'ios' 
      ? REVENUECAT_IOS_API_KEY 
      : REVENUECAT_ANDROID_API_KEY;

    await Purchases.configure({
      apiKey,
    });

    // Set log level for debugging (remove in production)
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
};

export const identifyUser = async (userId: string) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Purchases.logIn({ appUserID: userId });
    console.log('RevenueCat: User identified:', userId);
  } catch (error) {
    console.error('Error identifying user in RevenueCat:', error);
  }
};

export const logoutUser = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Purchases.logOut();
    console.log('RevenueCat: User logged out');
  } catch (error) {
    console.error('Error logging out user from RevenueCat:', error);
  }
};

export const getOfferings = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('RevenueCat: Running on web, returning empty offerings');
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    console.log('RevenueCat offerings:', offerings);
    return offerings;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
};

export const purchasePackage = async (packageToPurchase: any) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('RevenueCat: Running on web, cannot purchase');
    return null;
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: packageToPurchase
    });
    console.log('Purchase successful:', customerInfo);
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('User cancelled purchase');
    } else {
      console.error('Error making purchase:', error);
    }
    return null;
  }
};

export const getCustomerInfo = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('RevenueCat: Running on web, returning null');
    return null;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
  }
};

export const restorePurchases = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('RevenueCat: Running on web, cannot restore');
    return null;
  }

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    console.log('Purchases restored:', customerInfo);
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return null;
  }
};

// Check if user has active subscription
export const hasActiveSubscription = async (entitlementId: string = 'premium') => {
  const customerInfo = await getCustomerInfo();
  if (!customerInfo) return false;
  
  return customerInfo.entitlements.active[entitlementId] !== undefined;
};
