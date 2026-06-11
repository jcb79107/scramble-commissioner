import { notFound } from "next/navigation";
import { ContestEntry } from "@/components/contest-entry";
import { AppFrame } from "@/components/scramble-shell";
import { resolveAccessToken } from "@/lib/access-links";
import { getActiveEvent } from "@/lib/event-store";
import { submitContestEntryAction } from "./actions";

type ContestPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ContestPage({ params }: ContestPageProps) {
  const { token } = await params;
  const event = await getActiveEvent();
  const access = resolveAccessToken(event, token);

  if (
    !access.isValid ||
    access.role !== "contest_marker" ||
    !access.holeNumber ||
    !access.sideGame
  ) {
    notFound();
  }

  const hole = event.holes.find((item) => item.number === access.holeNumber);

  if (!hole) {
    notFound();
  }

  async function saveEntry(formData: FormData) {
    "use server";
    await submitContestEntryAction(token, formData);
  }

  return (
    <AppFrame>
      <ContestEntry event={event} hole={hole} sideGame={access.sideGame} action={saveEntry} />
    </AppFrame>
  );
}
