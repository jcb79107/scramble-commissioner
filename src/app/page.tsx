import { redirect } from "next/navigation";
import { PublicEventBoard } from "@/components/public-event-board";
import { AppFrame } from "@/components/scramble-shell";
import { getLegacyRedirectPath } from "@/lib/access-links";
import { getActiveEvent } from "@/lib/event-store";

type HomeProps = {
  searchParams: Promise<{
    access?: string | string[] | undefined;
    invalid?: string | string[] | undefined;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const event = await getActiveEvent();

  if (params.access) {
    redirect(getLegacyRedirectPath(event, params.access));
  }

  return (
    <AppFrame>
      <PublicEventBoard event={event} invalidAccess={Boolean(params.invalid)} />
    </AppFrame>
  );
}
