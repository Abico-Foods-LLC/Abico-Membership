import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMembershipTier, getNextTier, getTotalPoints } from "@/lib/loyalty";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Нэвтрээгүй", 401);

    const [allTransactions, recentTransactions, stores] = await Promise.all([
      db.pointTransaction.findMany({ where: { userId: user.id } }),
      db.pointTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { store: { select: { name: true } } },
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
        email: user.email,
        qrCode: user.qrCode,
        referralCode: user.referralCode,
        role: user.role,
      },
      points: totalPoints,
      tier,
      nextTier,
      pointsToNext: nextTier ? nextTier.minPoints - totalPoints : 0,
      transactions: recentTransactions,
      stores,
    });
  } catch (error) {
    console.error("[/api/me]", error);
    return apiError("Серверийн алдаа", 500);
  }
}
