import { notFound, redirect } from "next/navigation";
import { AppFrame } from "@/components/scramble-shell";
import { TeamScoreEntry } from "@/components/team-score-entry";
import { resolveAccessToken } from "@/lib/access-links";
import { getActiveEvent } from "@/lib/event-store";
import { submitTeamScoresAction } from "./actions";

type ScorePageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    saved?: string | string[] | undefined;
    error?: string | string[] | undefined;
  }>;
};

export default async function ScorePage({ params, searchParams }: ScorePageProps) {
  const { token } = await params;
  const query = await searchParams;
  const event = await getActiveEvent();
  const access = resolveAccessToken(event, token);

  if (!access.isValid || access.role !== "team_scorer" || !access.teamId) {
    notFound();
  }

  const team = event.teams.find((item) => item.id === access.teamId);

  if (!team) {
    notFound();
  }

  async function saveScores(formData: FormData) {
    "use server";
    const result = await submitTeamScoresAction(token, formData);
    const target = result.ok
      ? `/score/${encodeURIComponent(token)}?saved=${encodeURIComponent(result.message)}`
      : `/score/${encodeURIComponent(token)}?error=${encodeURIComponent(result.message)}`;

    redirect(target);
  }

  return (
    <AppFrame>
      <TeamScoreEntry
        event={event}
        team={team}
        action={saveScores}
        feedback={getFeedback(query)}
      />
    </AppFrame>
  );
}

function getFeedback(query: Awaited<ScorePageProps["searchParams"]>) {
  const saved = getQueryValue(query.saved);
  const error = getQueryValue(query.error);

  if (error) {
    return { tone: "error" as const, message: error };
  }

  if (saved) {
    return { tone: "success" as const, message: saved };
  }

  return null;
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
