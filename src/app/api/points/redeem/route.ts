import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTotalPoints } from "@/lib/loyalty";
import { apiError, apiSuccess } from "@/lib/utils";

const schema = z.object({
  qrCode: z.string().min(5),
  points: z.number().int().positive("Хасах оноо 0-ээс их байх ёстой"),
  reason: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireRole(["EMPLOYEE", "STORE_ADMIN", "PLATFORM_ADMIN"]);
    const body = schema.parse(await request.json());

    const employee = await db.user.findUnique({ where: { id: session.userId } });

    const transaction = await db.$transaction(async (tx) => {
      const member = await tx.user.findUnique({
        where: { qrCode: body.qrCode.toUpperCase() },
        include: { transactions: true },
      });
      if (!member) throw new Error("NOT_FOUND");
      if (member.role !== "MEMBER") throw new Error("NOT_MEMBER");

      const currentPoints = getTotalPoints(member.transactions);
      if (body.points > currentPoints) throw new Error(`INSUFFICIENT:${currentPoints}`);

      return tx.pointTransaction.create({
        data: {
          userId: member.id,
          storeId: employee?.storeId ?? null,
          employeeId: session.userId,
          type: "REDEEM",
          points: body.points,
          description: body.reason
            ? `${body.points} оноо хасагдлаа — ${body.reason}`
            : `${body.points} оноо хасагдлаа`,
        },
      });
    }, { isolationLevel: "Serializable" });

    return apiSuccess({
      transaction,
      pointsRedeemed: body.points,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return apiError(error.issues[0]?.message ?? "Буруу өгөгдөл", 400);
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return apiError("Нэвтрээгүй", 401);
      if (error.message === "FORBIDDEN") return apiError("Эрх хүрэхгүй", 403);
      if (error.message === "NOT_FOUND") return apiError("QR код олдсонгүй", 404);
      if (error.message === "NOT_MEMBER") return apiError("Зөвхөн гишүүнд хамаарна", 400);
      if (error.message.startsWith("INSUFFICIENT:")) {
        const pts = error.message.split(":")[1];
        return apiError(`Оноо хүрэхгүй байна. Одоогийн оноо: ${pts}`, 400);
      }
    }
    return apiError("Оноо хасах амжилтгүй", 500);
  }
}
