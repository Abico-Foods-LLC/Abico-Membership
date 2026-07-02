import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculatePointsFromPurchase, getMembershipTier, getTotalPoints } from "@/lib/loyalty";
import { apiError, apiSuccess } from "@/lib/utils";

const addPointsSchema = z.object({
  qrCode: z.string().min(5),
  purchaseAmount: z.number().int().positive("Худалдан авалтын дүн 0-ээс их байх ёстой"),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireRole(["EMPLOYEE", "STORE_ADMIN", "PLATFORM_ADMIN"]);
    const employee = await db.user.findUnique({ where: { id: session.userId } });
    if (!employee?.storeId) return apiError("Дэлгүүрт холбогдоогүй ажилтан", 403);

    const body = addPointsSchema.parse(await request.json());
    const member = await db.user.findUnique({ where: { qrCode: body.qrCode.toUpperCase() } });
    if (!member) return apiError("QR код олдсонгүй", 404);
    if (member.role !== "MEMBER") return apiError("Зөвхөн гишүүнд оноо нэмнэ", 400);

    const basePoints = calculatePointsFromPurchase(body.purchaseAmount);
    if (basePoints <= 0) {
      return apiError(`Хамгийн багадаа ₮1,000 худалдан авалт шаардлагатай`, 400);
    }

    const now = new Date();
    const activePromotions = await db.promotion.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
        OR: [{ storeId: employee.storeId }, { storeId: null }],
      },
    });
    const promotion = activePromotions.reduce<typeof activePromotions[number] | null>(
      (best, p) => (!best || p.multiplier > best.multiplier ? p : best),
      null,
    );
    const multiplier = promotion?.multiplier ?? 1;
    const points = Math.floor(basePoints * multiplier);

    const priorTransactions = await db.pointTransaction.findMany({
      where: { userId: member.id },
      select: { type: true, points: true },
    });
    const beforeTier = getMembershipTier(getTotalPoints(priorTransactions));

    const transaction = await db.pointTransaction.create({
      data: {
        userId: member.id,
        storeId: employee.storeId,
        employeeId: employee.id,
        type: "EARN",
        points,
        purchaseAmount: body.purchaseAmount,
        multiplier,
        description: body.description ?? (promotion ? `Худалдан авалтын оноо (${promotion.title}, ${multiplier}x)` : "Худалдан авалтын оноо"),
      },
      include: {
        store: { select: { name: true } },
        user: { select: { name: true, phone: true } },
      },
    });

    const afterTier = getMembershipTier(getTotalPoints([...priorTransactions, { type: "EARN", points }]));
    if (afterTier.id !== beforeTier.id) {
      await db.notification.create({
        data: {
          userId: member.id,
          title: `Та ${afterTier.nameMn} шатланд шилжлээ!`,
          body: `Одооноос ${afterTier.discountPercent}% урамшуулал эдэлнэ.`,
        },
      });
    }

    return apiSuccess({ transaction, pointsAdded: points });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(error.issues[0]?.message ?? "Буруу өгөгдөл", 400);
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Нэвтрээгүй", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return apiError("Эрх хүрэхгүй", 403);
    }
    console.error(error);
    return apiError("Оноо нэмэх амжилтгүй", 500);
  }
}

export async function GET(request: Request) {
  try {
    await requireRole(["EMPLOYEE", "STORE_ADMIN", "PLATFORM_ADMIN"]);
    const { searchParams } = new URL(request.url);
    const qr = searchParams.get("qr");
    const phone = searchParams.get("phone");

    if (!qr && !phone) return apiError("QR код эсвэл утасны дугаар шаардлагатай", 400);

    const member = await db.user.findFirst({
      where: qr ? { qrCode: qr.toUpperCase() } : { phone: phone! },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!member) return apiError("Гишүүн олдсонгүй", 404);
    if (member.role !== "MEMBER") return apiError("Энэ дугаар гишүүн биш байна", 400);

    const totalPoints = member.transactions.reduce((sum, tx) => {
      if (tx.type === "REDEEM") return sum - tx.points;
      return sum + tx.points;
    }, 0);

    return apiSuccess({
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        qrCode: member.qrCode,
        totalPoints,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Нэвтрээгүй", 401);
    }
    return apiError("Хайлт амжилтгүй", 500);
  }
}
