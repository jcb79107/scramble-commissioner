"use server";

import { submitContestEntry } from "@/lib/event-store";

export async function submitContestEntryAction(token: string, formData: FormData) {
  const playerId = String(formData.get("playerId") ?? "");
  const measuredDistance = Number(formData.get("measuredDistance"));
  const isValid = formData.get("isValid") !== "false";

  return submitContestEntry(token, playerId, measuredDistance, isValid);
}
