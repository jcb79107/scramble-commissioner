import { notFound, redirect } from "next/navigation";
import { ContestEntry } from "@/components/contest-entry";
import { AppFrame } from "@/components/scramble-shell";
import { resolveAccessToken } from "@/lib/access-links";
import { getActiveEvent } from "@/lib/event-store";
import { submitContestEntryAction } from "./actions";

type ContestPageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    saved?: string | string[] | undefined;
    error?: string | string[] | undefined;
  }>;
};

export default async function ContestPage({ params, searchParams }: ContestPageProps) {
  const { token } = await params;
  const query = await searchParams;
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
    const result = await submitContestEntryAction(token, formData);
    const target = result.ok
      ? `/contest/${encodeURIComponent(token)}?saved=${encodeURIComponent(result.message)}`
      : `/contest/${encodeURIComponent(token)}?error=${encodeURIComponent(result.message)}`;

    redirect(target);
  }

  return (
    <AppFrame>
      <ContestEntry
        event={event}
        hole={hole}
        sideGame={access.sideGame}
        action={saveEntry}
        feedback={getFeedback(query)}
      />
    </AppFrame>
  );
}

function getFeedback(query: Awaited<ContestPageProps["searchParams"]>) {
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
