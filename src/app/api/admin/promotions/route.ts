import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2),
  storeId: z.string().optional(),
  multiplier: z.number().min(1.1).max(10),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export async function GET() {
  try {
    const session = await requireRole(["PLATFORM_ADMIN", "STORE_ADMIN"]);
    const admin = session.role === "STORE_ADMIN"
      ? await db.user.findUnique({ where: { id: session.userId } })
      : null;

    const promotions = await db.promotion.findMany({
      where: session.role === "PLATFORM_ADMIN"
        ? {}
        : { OR: [{ storeId: admin?.storeId ?? "" }, { storeId: null }] },
      include: { store: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ promotions });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Нэвтрээгүй", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Эрх хүрэхгүй", 403);
    return apiError("Урамшуулал ачаалах амжилтгүй", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["PLATFORM_ADMIN", "STORE_ADMIN"]);
    const body = schema.parse(await request.json());

    // Дэлгүүрийн админ зөвхөн өөрийн дэлгүүрт зориулсан урамшуулал үүсгэнэ —
    // "Бүх дэлгүүр" (компанийн хэмжээний) урамшуулал зөвхөн Platform Admin-д хамаарна.
    let storeId = body.storeId || null;
    if (session.role === "STORE_ADMIN") {
      const admin = await db.user.findUnique({ where: { id: session.userId } });
      if (!admin?.storeId) return apiError("Дэлгүүрт холбогдоогүй админ", 403);
      storeId = admin.storeId;
    }

    const promotion = await db.promotion.create({
      data: {
        title: body.title,
        storeId,
        multiplier: body.multiplier,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
        isActive: true,
      },
    });

    return apiSuccess({ promotion }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return apiError(error.issues[0]?.message ?? "Буруу өгөгдөл", 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Эрх хүрэхгүй", 403);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Нэвтрээгүй", 401);
    return apiError("Урамшуулал нэмэх амжилтгүй", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole(["PLATFORM_ADMIN"]);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID шаардлагатай", 400);

    await db.promotion.update({ where: { id }, data: { isActive: false } });
    return apiSuccess({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Эрх хүрэхгүй", 403);
    return apiError("Устгах амжилтгүй", 500);
  }
}
