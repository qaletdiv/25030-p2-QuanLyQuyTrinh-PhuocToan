import { redirect } from "next/navigation";
import { getMeApi } from "@/services/auth.api";

export default async function AdminIndexPage() {
  const user = await getMeApi();
  if (user?.role === "admin") {
    redirect("/admin/request-types");
  } else if (user?.role === "approver") {
    redirect("/approvals");
  } else {
    redirect("/dashboard");
  }
}

