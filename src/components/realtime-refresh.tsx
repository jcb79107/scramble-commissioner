"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function RealtimeRefresh({ eventId }: { eventId: string }) {
  const router = useRouter();

  useEffect(() => {
    const client = createBrowserSupabaseClient();

    if (!client) {
      const refreshInterval = window.setInterval(() => router.refresh(), 10_000);

      return () => window.clearInterval(refreshInterval);
    }

    const refreshInterval = window.setInterval(() => router.refresh(), 30_000);

    const channel = client
      .channel(`event-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
          filter: `event_id=eq.${eventId}`,
        },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "proxy_entries",
          filter: `event_id=eq.${eventId}`,
        },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      window.clearInterval(refreshInterval);
      client.removeChannel(channel);
    };
  }, [eventId, router]);

  return null;
}
