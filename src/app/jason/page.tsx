import { headers } from "next/headers";
import { AdminHQ, AdminLogin } from "@/components/admin-hq";
import { AppFrame } from "@/components/scramble-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/event-store";
import { getRequestOrigin } from "@/lib/request-origin";
import {
  loginAdmin,
  logoutAdmin,
  updateEventDetailsAction,
  updateMoneySettingsAction,
  updateScoreOverrideAction,
  updateTeamDetailsAction,
} from "../admin/actions";

type JasonPageProps = {
  searchParams: Promise<{
    error?: string | string[] | undefined;
    section?: string | string[] | undefined;
  }>;
};

export default async function JasonPage({ searchParams }: JasonPageProps) {
  const params = await searchParams;
  const authenticated = await isAdminAuthenticated();
  const event = await getActiveEvent();
  const requestHeaders = await headers();

  return (
    <AppFrame>
      {authenticated ? (
        <AdminHQ
          event={event}
          origin={getRequestOrigin(requestHeaders)}
          activeSection={getAdminSection(params.section)}
          logoutAction={logoutAdmin}
          updateEventAction={updateEventDetailsAction}
          updateMoneyAction={updateMoneySettingsAction}
          updateTeamAction={updateTeamDetailsAction}
          updateScoreAction={updateScoreOverrideAction}
        />
      ) : (
        <AdminLogin error={Boolean(params.error)} action={loginAdmin} />
      )}
    </AppFrame>
  );
}

function getAdminSection(value: string | string[] | undefined) {
  const section = Array.isArray(value) ? value[0] : value;

  return section === "links" ||
    section === "teams" ||
    section === "scores" ||
    section === "money"
    ? section
    : "overview";
}
