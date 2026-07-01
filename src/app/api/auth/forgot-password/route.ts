import { z } from "zod";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { apiError, apiSuccess } from "@/lib/utils";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    // Имэйл enumeration/spam-аас сэргийлж IP тутамд хязгаарлана (доорх per-user cooldown-той хамт)
    if (isRateLimited(`forgot-password:${getClientIp(request)}`, 10, 10 * 60 * 1000)) {
      return apiError("Хэт олон оролдлого. Түр хүлээгээд дахин оролдоно уу.", 429);
    }

    const { email } = schema.parse(await request.json());

    const user = await db.user.findFirst({ where: { email } });

    // Аюулгүй байдлын үүднээс хэрэглэгч олдсон эсэхийг задруулахгүй
    if (!user) return apiSuccess({ ok: true });

    // Spam/email-bombing-ээс сэргийлж, сүүлийн 60 секундэд токен үүсгэсэн бол дахин илгээхгүй
    const recent = await db.passwordResetToken.findFirst({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 60 * 1000) } },
    });
    if (recent) return apiSuccess({ ok: true });

    // Хуучин токенуудыг устга
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomUUID().replace(/-/g, "");
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 цаг
      },
    });

    await sendPasswordResetEmail(email, token);
    return apiSuccess({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return apiError("Имэйл буруу", 400);
    console.error("[forgot-password]", error);
    return apiError("Имэйл илгээх амжилтгүй", 500);
  }
}
