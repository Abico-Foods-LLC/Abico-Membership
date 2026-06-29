import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTotalPoints } from "@/lib/loyalty";
import { apiError, apiSuccess } from "@/lib/utils";

const schema = z.object({
  qrCode: z.string().min(5),
  points: z.number().int().positive("Хасах оноо 0-ээс их байх ёстой"),
});

export async function POST(request: Request) {
  try {
    const session = await requireRole(["EMPLOYEE", "STORE_ADMIN", "PLATFORM_ADMIN"]);
    const body = schema.parse(await request.json());

    const member = await db.user.findUnique({
      where: { qrCode: body.qrCode.toUpperCase() },
      include: { transactions: true },
    });
    if (!member) return apiError("QR код олдсонгүй", 404);
    if (member.role !== "MEMBER") return apiError("Зөвхөн гишүүнд хамаарна", 400);

    const currentPoints = getTotalPoints(member.transactions);
    if (body.points > currentPoints) {
      return apiError(`Оноо хүрэхгүй байна. Одоогийн оноо: ${currentPoints}`, 400);
    }

    const employee = await db.user.findUnique({ where: { id: session.userId } });

    const transaction = await db.pointTransaction.create({
      data: {
        userId: member.id,
        storeId: employee?.storeId ?? null,
        employeeId: session.userId,
        type: "REDEEM",
        points: body.points,
        description: `${body.points} оноо хасагдлаа`,
      },
    });

    return apiSuccess({
      transaction,
      pointsRedeemed: body.points,
      remainingPoints: currentPoints - body.points,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return apiError(error.issues[0]?.message ?? "Буруу өгөгдөл", 400);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Нэвтрээгүй", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Эрх хүрэхгүй", 403);
    return apiError("Оноо хасах амжилтгүй", 500);
  }
}
