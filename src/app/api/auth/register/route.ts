import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  generateQrCode,
  generateReferralCode,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { REFERRAL_BONUS } from "@/lib/loyalty";
import { apiError, apiSuccess } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Нэр хамгийн багадаа 2 тэмдэгт"),
  phone: z.string().min(8, "Утасны дугаар буруу"),
  password: z.string().min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт"),
  referralCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());

    const existing = await db.user.findUnique({
      where: { phone: body.phone },
    });
    if (existing) return apiError("Энэ утасны дугаар бүртгэлтэй байна", 409);

    let referredById: string | undefined;
    if (body.referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode: body.referralCode.toUpperCase() },
      });
      if (referrer) referredById = referrer.id;
    }

    const passwordHash = await hashPassword(body.password);
    const user = await db.user.create({
      data: {
        name: body.name,
        phone: body.phone,
        passwordHash,
        qrCode: generateQrCode(),
        referralCode: generateReferralCode(),
        referredById,
      },
    });

    if (referredById) {
      await db.$transaction([
        db.pointTransaction.create({
          data: {
            userId: referredById,
            type: "REFERRAL",
            points: REFERRAL_BONUS,
            description: `${user.name} урилгаар бүртгүүлсэн`,
          },
        }),
        db.pointTransaction.create({
          data: {
            userId: user.id,
            type: "BONUS",
            points: REFERRAL_BONUS,
            description: "Урилгаар бүртгүүлсэн бонус",
          },
        }),
      ]);
    }

    await createSession(user);
    return apiSuccess({ user: { id: user.id, name: user.name, role: user.role } }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(error.issues[0]?.message ?? "Буруу өгөгдөл", 400);
    }
    console.error(error);
    return apiError("Бүртгэл амжилтгүй", 500);
  }
}
