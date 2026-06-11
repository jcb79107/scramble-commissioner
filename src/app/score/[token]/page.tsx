import { notFound } from "next/navigation";
import { AppFrame } from "@/components/scramble-shell";
import { TeamScoreEntry } from "@/components/team-score-entry";
import { resolveAccessToken } from "@/lib/access-links";
import { getActiveEvent } from "@/lib/event-store";
import { submitTeamScoresAction } from "./actions";

type ScorePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ScorePage({ params }: ScorePageProps) {
  const { token } = await params;
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
    await submitTeamScoresAction(token, formData);
  }

  return (
    <AppFrame>
      <TeamScoreEntry event={event} team={team} action={saveScores} />
    </AppFrame>
  );
}
