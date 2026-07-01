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

    const [stores, totalMembers, transactions, employees] = await Promise.all([
      session.role === "PLATFORM_ADMIN"
        ? db.store.findMany({ orderBy: { name: "asc" } })
        : admin?.store
          ? [admin.store]
          : [],
      // Гишүүд ямар нэг дэлгүүрт "харьяалагддаггүй" (нэг карт олон дэлгүүрт систем) тул
      // STORE_ADMIN-ий хувьд тухайн дэлгүүрт худалдан авалт хийж байсан гишүүдийг тоолно.
      db.user.count({
        where: {
          role: "MEMBER",
          ...(storeFilter.storeId ? { transactions: { some: { storeId: storeFilter.storeId } } } : {}),
        },
      }),
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
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          store: { select: { name: true } },
        },
      }),
    ]);

    // Ажилтан тус бүрийн хэдэн оноо нэмсэн/хассан, сүүлд хэзээ ажилласан талаарх статистик
    const employeeStatRows = await db.pointTransaction.groupBy({
      by: ["employeeId", "type"],
      where: {
        employeeId: { in: employees.map((e) => e.id) },
        ...(storeFilter.storeId ? { storeId: storeFilter.storeId } : {}),
      },
      _sum: { points: true },
      _count: { _all: true },
      _max: { createdAt: true },
    });

    type EmployeeStat = {
      pointsEarned: number;
      earnCount: number;
      pointsRedeemed: number;
      redeemCount: number;
      lastActivity: Date | null;
    };
    const employeeStatMap = new Map<string, EmployeeStat>();
    for (const row of employeeStatRows) {
      if (!row.employeeId) continue;
      const cur = employeeStatMap.get(row.employeeId) ?? {
        pointsEarned: 0, earnCount: 0, pointsRedeemed: 0, redeemCount: 0, lastActivity: null,
      };
      if (row.type === "EARN") {
        cur.pointsEarned += row._sum.points ?? 0;
        cur.earnCount += row._count._all;
      } else if (row.type === "REDEEM") {
        cur.pointsRedeemed += row._sum.points ?? 0;
        cur.redeemCount += row._count._all;
      }
      if (row._max.createdAt && (!cur.lastActivity || row._max.createdAt > cur.lastActivity)) {
        cur.lastActivity = row._max.createdAt;
      }
      employeeStatMap.set(row.employeeId, cur);
    }

    const employeesWithStats = employees.map((emp) => ({
      ...emp,
      stats: employeeStatMap.get(emp.id) ?? {
        pointsEarned: 0, earnCount: 0, pointsRedeemed: 0, redeemCount: 0, lastActivity: null,
      },
    }));

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
      employees: employeesWithStats,
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
