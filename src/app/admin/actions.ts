"use server";

import { redirect } from "next/navigation";
import { ADMIN_PATH } from "@/lib/access-links";
import {
  clearAdminSession,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  updateEventDetails,
  updateMoneySettings,
  updateScoreOverride,
  updateTeamDetails,
} from "@/lib/event-store";

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password)) {
    redirect(`${ADMIN_PATH}?error=1`);
  }

  await setAdminSession();
  redirect(ADMIN_PATH);
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect(ADMIN_PATH);
}

export async function updateEventDetailsAction(formData: FormData) {
  await updateEventDetails(formData);
}

export async function updateMoneySettingsAction(formData: FormData) {
  await updateMoneySettings(formData);
}

export async function updateTeamDetailsAction(formData: FormData) {
  await updateTeamDetails(formData);
}

export async function updateScoreOverrideAction(formData: FormData) {
  await updateScoreOverride(formData);
}
