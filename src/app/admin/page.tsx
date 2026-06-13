import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_PATH } from "@/lib/access-links";
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
} from "./actions";

type AdminPageProps = {
  searchParams: Promise<{
    error?: string | string[] | undefined;
    saved?: string | string[] | undefined;
    section?: string | string[] | undefined;
  }>;
};

type AdminSection = "overview" | "links" | "teams" | "scores" | "money";

export default async function AdminPage({ searchParams }: AdminPageProps) {
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
          feedback={getFeedback(params)}
          updateEventAction={buildAdminAction({
            action: updateEventDetailsAction,
            section: "money",
          })}
          updateMoneyAction={buildAdminAction({
            action: updateMoneySettingsAction,
            section: "money",
          })}
          updateTeamAction={buildAdminAction({
            action: updateTeamDetailsAction,
            section: "teams",
          })}
          updateScoreAction={buildAdminAction({
            action: updateScoreOverrideAction,
            section: "scores",
          })}
        />
      ) : (
        <AdminLogin error={Boolean(params.error)} action={loginAdmin} />
      )}
    </AppFrame>
  );
}

function buildAdminAction({
  action,
  section,
}: {
  action: (formData: FormData) => Promise<{ ok: boolean; message: string }>;
  section: AdminSection;
}) {
  return async (formData: FormData) => {
    "use server";

    const result = await action(formData);
    const target = result.ok
      ? `${ADMIN_PATH}?section=${section}&saved=${encodeURIComponent(result.message)}`
      : `${ADMIN_PATH}?section=${section}&error=${encodeURIComponent(result.message)}`;

    redirect(target);
  };
}

function getFeedback(query: Awaited<AdminPageProps["searchParams"]>) {
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

function getAdminSection(value: string | string[] | undefined) {
  const section = Array.isArray(value) ? value[0] : value;

  return section === "links" ||
    section === "teams" ||
    section === "scores" ||
    section === "money"
    ? section
    : "overview";
}
