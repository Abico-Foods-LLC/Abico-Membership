import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт"),
});

export async function POST(request: Request) {
  try {
    const { token, password } = schema.parse(await request.json());

    const record = await db.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      return apiError("Линк хүчингүй эсвэл хугацаа дууссан", 400);
    }

    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: {
          passwordHash: await hashPassword(password),
          loginAttempts: 0,
          lockedUntil: null,
        },
      }),
      db.passwordResetToken.delete({ where: { token } }),
    ]);

    return apiSuccess({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return apiError(error.issues[0]?.message ?? "Буруу өгөгдөл", 400);
    return apiError("Нууц үг сэргээх амжилтгүй", 500);
  }
}
