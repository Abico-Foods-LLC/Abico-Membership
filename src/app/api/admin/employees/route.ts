import { z } from "zod";
import { requireRole, hashPassword, generateQrCode, generateReferralCode } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  password: z.string().min(6),
  role: z.enum(["EMPLOYEE", "STORE_ADMIN"]),
  storeId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await requireRole(["PLATFORM_ADMIN"]);
    const body = schema.parse(await request.json());

    const existing = await db.user.findUnique({ where: { phone: body.phone } });
    if (existing) return apiError("Энэ утасны дугаар бүртгэлтэй байна", 409);

    const store = await db.store.findUnique({ where: { id: body.storeId } });
    if (!store) return apiError("Дэлгүүр олдсонгүй", 404);

    const user = await db.user.create({
      data: {
        name: body.name,
        phone: body.phone,
        passwordHash: await hashPassword(body.password),
        qrCode: generateQrCode(),
        referralCode: generateReferralCode(),
        role: body.role,
        storeId: body.storeId,
      },
    });

    return apiSuccess({ user: { id: user.id, name: user.name, role: user.role } }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return apiError(error.issues[0]?.message ?? "Буруу өгөгдөл", 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Эрх хүрэхгүй", 403);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Нэвтрээгүй", 401);
    return apiError("Ажилтан нэмэх амжилтгүй", 500);
  }
}
