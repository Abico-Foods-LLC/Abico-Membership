import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const loginSchema = z.object({
  phone: z.string().min(8),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await db.user.findUnique({ where: { phone: body.phone } });

    if (!user) return apiError("Утас эсвэл нууц үг буруу", 401);

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return apiError(`Хэт олон оролдлого. ${mins} минутын дараа дахин оролдоно уу.`, 429);
    }

    const valid = await verifyPassword(body.password, user.passwordHash);

    if (!valid) {
      const attempts = user.loginAttempts + 1;
      const lockedUntil = attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
        : null;
      await db.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts, ...(lockedUntil ? { lockedUntil } : {}) },
      });
      const remaining = MAX_ATTEMPTS - attempts;
      return apiError(
        remaining > 0
          ? `Утас эсвэл нууц үг буруу. ${remaining} оролдлого үлдлээ.`
          : `Бүртгэл ${LOCK_MINUTES} минутаар түгжигдлээ.`,
        401,
      );
    }

    if (!user.isActive) return apiError("Бүртгэл идэвхгүй байна", 403);

    await db.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });

    await createSession(user);
    return apiSuccess({ user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) return apiError("Буруу өгөгдөл", 400);
    return apiError("Нэвтрэх амжилтгүй", 500);
  }
}
