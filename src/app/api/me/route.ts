import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMembershipTier, getNextTier, getTotalPoints } from "@/lib/loyalty";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Нэвтрээгүй", 401);

    const now = new Date();
    const [allTransactions, recentTransactions, promotions, stores] = await Promise.all([
      db.pointTransaction.findMany({ where: { userId: user.id } }),
      db.pointTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { store: { select: { name: true } } },
      }),
      db.promotion.findMany({
        where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
        include: { store: { select: { name: true } } },
        orderBy: { multiplier: "desc" },
      }),
      db.store.findMany({
        where: { isActive: true },
        select: { id: true, name: true, address: true, phone: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const totalPoints = getTotalPoints(allTransactions);
    const tier = getMembershipTier(totalPoints);
    const nextTier = getNextTier(totalPoints);

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        qrCode: user.qrCode,
        referralCode: user.referralCode,
        role: user.role,
      },
      points: totalPoints,
      tier,
      nextTier,
      pointsToNext: nextTier ? nextTier.minPoints - totalPoints : 0,
      transactions: recentTransactions,
      promotions,
      stores,
    });
  } catch (error) {
    console.error("[/api/me]", error);
    return apiError("Серверийн алдаа", 500);
  }
}
