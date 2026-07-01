import { z } from "zod";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(2, "Нэр хамгийн багадаа 2 тэмдэгт").optional(),
  email: z.string().email("Имэйл буруу").optional().or(z.literal("")),
});

const passwordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт"),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError("Нэвтрээгүй", 401);

  try {
    const body = updateSchema.parse(await request.json());
    const updated = await db.user.update({
      where: { id: user.id },
      data: { ...(body.name && { name: body.name }), ...(body.email !== undefined && { email: body.email || null }) },
    });
    return apiSuccess({ name: updated.name, email: updated.email });
  } catch (error) {
    if (error instanceof z.ZodError) return apiError(error.issues[0]?.message ?? "Буруу өгөгдөл", 400);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return apiError("Энэ имэйл хаяг өөр хэрэглэгчид бүртгэлтэй байна", 409);
    }
    return apiError("Шинэчлэх амжилтгүй", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError("Нэвтрээгүй", 401);

  try {
    const body = passwordSchema.parse(await request.json());
    const ok = await verifyPassword(body.current, user.passwordHash);
    if (!ok) return apiError("Одоогийн нууц үг буруу", 400);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(body.next) },
    });
    return apiSuccess({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return apiError(error.issues[0]?.message ?? "Буруу өгөгдөл", 400);
    return apiError("Нууц үг солих амжилтгүй", 500);
  }
}
