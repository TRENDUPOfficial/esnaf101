"use server";

import { redirect } from "next/navigation";
import { clearAdminToken } from "../lib/session";

export async function logout() {
  await clearAdminToken();
  redirect("/login");
}
