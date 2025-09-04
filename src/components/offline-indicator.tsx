"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <Badge
        variant="destructive"
        className="flex items-center gap-2 px-3 py-2"
      >
        <WifiOff className="h-4 w-4" />
        <span>You&apos;re offline</span>
      </Badge>
    </div>
  );
}
