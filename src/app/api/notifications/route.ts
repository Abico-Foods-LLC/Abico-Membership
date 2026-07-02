import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireSession();

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.notification.count({ where: { userId: session.userId, readAt: null } }),
    ]);

    return apiSuccess({ notifications, unreadCount });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Нэвтрээгүй", 401);
    return apiError("Мэдэгдэл ачаалах амжилтгүй", 500);
  }
}

const readSchema = z.object({ id: z.string().optional(), all: z.boolean().optional() });

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body = readSchema.parse(await request.json());

    if (body.all) {
      await db.notification.updateMany({
        where: { userId: session.userId, readAt: null },
        data: { readAt: new Date() },
      });
      return apiSuccess({ ok: true });
    }

    if (body.id) {
      await db.notification.updateMany({
        where: { id: body.id, userId: session.userId },
        data: { readAt: new Date() },
      });
      return apiSuccess({ ok: true });
    }

    return apiError("id эсвэл all шаардлагатай", 400);
  } catch (error) {
    if (error instanceof z.ZodError) return apiError("Буруу өгөгдөл", 400);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Нэвтрээгүй", 401);
    return apiError("Шинэчлэх амжилтгүй", 500);
  }
}
