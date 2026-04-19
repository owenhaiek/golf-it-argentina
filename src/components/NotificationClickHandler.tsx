import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Listens for postMessage events from the service worker (sent when the user
 * taps a push notification) and navigates the SPA to the target URL without a
 * full page reload.
 */
export const NotificationClickHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "NOTIFICATION_CLICK" || !data.url) return;
      try {
        // Navigate within the SPA
        navigate(data.url);
      } catch (err) {
        console.error("Failed to navigate from notification click", err);
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [navigate]);

  return null;
};
