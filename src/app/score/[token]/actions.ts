"use server";

import { submitTeamScores } from "@/lib/event-store";

export async function submitTeamScoresAction(token: string, formData: FormData) {
  const scoresByHole: Record<number, number | null> = {};

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("hole-")) {
      continue;
    }

    const hole = Number(key.replace("hole-", ""));
    const rawValue = String(value);
    const strokes = rawValue ? Number(rawValue) : null;

    if (Number.isInteger(hole)) {
      scoresByHole[hole] = strokes;
    }
  }

  return submitTeamScores(token, scoresByHole);
}
