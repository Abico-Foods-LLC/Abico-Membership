import { destroySession } from "@/lib/auth";
import { apiSuccess } from "@/lib/utils";

export async function POST() {
  await destroySession();
  return apiSuccess({ ok: true });
}
