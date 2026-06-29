import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

const loginSchema = z.object({
  phone: z.string().min(8),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await db.user.findUnique({ where: { phone: body.phone } });

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return apiError("Утас эсвэл нууц үг буруу", 401);
    }

    if (!user.isActive) return apiError("Бүртгэл идэвхгүй байна", 403);

    await createSession(user);
    return apiSuccess({
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Буруу өгөгдөл", 400);
    }
    return apiError("Нэвтрэх амжилтгүй", 500);
  }
}
