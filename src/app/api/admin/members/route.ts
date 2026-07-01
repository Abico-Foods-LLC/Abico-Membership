import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMembershipTier, getTotalPoints } from "@/lib/loyalty";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await requireRole(["STORE_ADMIN", "PLATFORM_ADMIN"]);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";

    // Гишүүд ямар нэг дэлгүүрт "харьяалагддаггүй" (нэг карт олон дэлгүүрт систем) тул
    // STORE_ADMIN-д зөвхөн тухайн дэлгүүрт худалдан авалт хийж байсан гишүүдийг харуулна.
    const admin = session.role === "STORE_ADMIN"
      ? await db.user.findUnique({ where: { id: session.userId } })
      : null;

    const members = await db.user.findMany({
      where: {
        role: "MEMBER",
        isActive: true,
        ...(admin ? { transactions: { some: { storeId: admin.storeId ?? "" } } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { phone: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        transactions: { select: { type: true, points: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return apiSuccess(
      members.map((m) => {
        const points = getTotalPoints(m.transactions);
        return {
          id: m.id,
          name: m.name,
          phone: m.phone,
          qrCode: m.qrCode,
          referralCode: m.referralCode,
          createdAt: m.createdAt,
          points,
          tier: getMembershipTier(points).nameMn,
        };
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Нэвтрээгүй", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Эрх хүрэхгүй", 403);
    return apiError("Гишүүд ачаалах амжилтгүй", 500);
  }
}
