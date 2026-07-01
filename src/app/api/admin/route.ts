import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireRole(["STORE_ADMIN", "PLATFORM_ADMIN"]);

    const admin = await db.user.findUnique({
      where: { id: session.userId },
      include: { store: true },
    });

    const storeFilter =
      session.role === "PLATFORM_ADMIN" ? {} : { storeId: admin?.storeId ?? "" };

    const [stores, members, transactions, employees] = await Promise.all([
      session.role === "PLATFORM_ADMIN"
        ? db.store.findMany({ orderBy: { name: "asc" } })
        : admin?.store
          ? [admin.store]
          : [],
      db.user.count({ where: { role: "MEMBER", ...storeFilter } }),
      db.pointTransaction.findMany({
        where: storeFilter.storeId ? { storeId: storeFilter.storeId } : {},
        include: {
          user: { select: { name: true } },
          store: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.user.findMany({
        where: {
          role: { in: ["EMPLOYEE", "STORE_ADMIN"] },
          ...(storeFilter.storeId ? { storeId: storeFilter.storeId } : {}),
        },
        include: { store: { select: { name: true } } },
      }),
    ]);

    const activePoints = transactions.reduce((sum, tx) => {
      if (tx.type === "REDEEM") return sum - tx.points;
      return sum + tx.points;
    }, 0);

    const monthlyEarned = transactions
      .filter((tx) => {
        const d = new Date(tx.createdAt);
        const now = new Date();
        return (
          tx.type === "EARN" &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, tx) => sum + tx.points, 0);

    const totalMembers =
      session.role === "PLATFORM_ADMIN"
        ? await db.user.count({ where: { role: "MEMBER" } })
        : members;

    return apiSuccess({
      me: { name: session.name, role: session.role },
      stats: {
        totalMembers,
        activePoints,
        monthlyEarned,
        storeCount: stores.length,
        employeeCount: employees.length,
      },
      stores,
      employees,
      recentTransactions: transactions.slice(0, 15),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Нэвтрээгүй", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return apiError("Эрх хүрэхгүй", 403);
    }
    return apiError("Тайлан ачаалах амжилтгүй", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["PLATFORM_ADMIN"]);
    const body = await request.json();

    const store = await db.store.create({
      data: {
        name: body.name,
        slug: body.slug.toLowerCase().replace(/\s+/g, "-"),
        address: body.address,
        phone: body.phone,
        description: body.description,
      },
    });

    return apiSuccess({ store }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return apiError("Эрх хүрэхгүй", 403);
    }
    return apiError("Дэлгүүр нэмэх амжилтгүй", 500);
  }
}
