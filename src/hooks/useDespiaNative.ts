import despia from 'despia-native';

// Check if running in Despia native environment
export const isDespiaNative = (): boolean => {
  return navigator.userAgent.includes('despia');
};

// Haptic feedback functions
export const hapticLight = () => {
  if (isDespiaNative()) {
    despia('lighthaptic://');
  }
};

export const hapticSuccess = () => {
  if (isDespiaNative()) {
    despia('successhaptic://');
  }
};

export const hapticError = () => {
  if (isDespiaNative()) {
    despia('errorhaptic://');
  }
};

export const hapticMedium = () => {
  if (isDespiaNative()) {
    despia('mediumhaptic://');
  }
};

// UI Controls
export const showSpinner = () => {
  if (isDespiaNative()) {
    despia('spinneron://');
  }
};

export const hideSpinner = () => {
  if (isDespiaNative()) {
    despia('spinneroff://');
  }
};

export const hideBars = (hide: boolean = true) => {
  if (isDespiaNative()) {
    despia(`hidebars://${hide ? 'on' : 'off'}`);
  }
};

export const setStatusBarColor = (r: number, g: number, b: number) => {
  if (isDespiaNative()) {
    despia(`statusbarcolor://{${r}, ${g}, ${b}}`);
  }
};

// App Info
export const getAppVersion = async (): Promise<{ versionNumber?: string; bundleNumber?: string } | null> => {
  if (!isDespiaNative()) return null;
  try {
    const info = await despia('getappversion://', ['versionNumber', 'bundleNumber']);
    return info as { versionNumber?: string; bundleNumber?: string };
  } catch {
    return null;
  }
};

export const getDeviceUUID = async (): Promise<string | null> => {
  if (!isDespiaNative()) return null;
  try {
    const result = await despia('get-uuid://', ['uuid']);
    return (result as { uuid?: string })?.uuid || null;
  } catch {
    return null;
  }
};

// Biometric Authentication
export const requestBiometricAuth = async (): Promise<boolean> => {
  if (!isDespiaNative()) return false;
  try {
    await despia('bioauth://');
    return true;
  } catch {
    return false;
  }
};

// Share functionality
export const shareApp = (message: string, url: string) => {
  if (isDespiaNative()) {
    despia(`shareapp://message?=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`);
  } else {
    // Fallback for web
    if (navigator.share) {
      navigator.share({ title: 'GolfIt', text: message, url });
    }
  }
};

// Open URL in external browser
export const openExternalURL = (url: string) => {
  if (isDespiaNative()) {
    despia(`openurl://${url}`);
  } else {
    window.open(url, '_blank');
  }
};

// Native file storage
export const saveToNativeStorage = async (key: string, value: string): Promise<boolean> => {
  if (!isDespiaNative()) {
    localStorage.setItem(key, value);
    return true;
  }
  try {
    await despia(`nativesave://${key}?value=${encodeURIComponent(value)}`);
    return true;
  } catch {
    return false;
  }
};

export const getFromNativeStorage = async (key: string): Promise<string | null> => {
  if (!isDespiaNative()) {
    return localStorage.getItem(key);
  }
  try {
    const result = await despia(`nativeget://${key}`, ['value']);
    return (result as { value?: string })?.value || null;
  } catch {
    return null;
  }
};

// Hook for React components
export const useDespiaNative = () => {
  return {
    isNative: isDespiaNative(),
    haptic: {
      light: hapticLight,
      success: hapticSuccess,
      error: hapticError,
      medium: hapticMedium,
    },
    ui: {
      showSpinner,
      hideSpinner,
      hideBars,
      setStatusBarColor,
    },
    app: {
      getVersion: getAppVersion,
      getDeviceUUID,
      share: shareApp,
      openURL: openExternalURL,
    },
    auth: {
      biometric: requestBiometricAuth,
    },
    storage: {
      save: saveToNativeStorage,
      get: getFromNativeStorage,
    },
  };
};

export default useDespiaNative;
