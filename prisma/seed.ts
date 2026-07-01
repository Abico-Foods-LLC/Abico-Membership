import "dotenv/config";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/db";

const db = createPrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("abico2026", 12);

  const stores = await Promise.all([
    db.store.upsert({
      where: { slug: "abico-central" },
      update: {},
      create: {
        name: "ABICO Central",
        slug: "abico-central",
        address: "Улаанбаатар, СБД",
        phone: "70112233",
        description: "ABICO төв дэлгүүр",
      },
    }),
    db.store.upsert({
      where: { slug: "mama-kids" },
      update: {},
      create: {
        name: "Mama & Kids",
        slug: "mama-kids",
        address: "Улаанбаатар, ХУД",
        phone: "77112233",
        description: "Хүүхдийн бүтээгдэхүүн",
      },
    }),
    db.store.upsert({
      where: { slug: "green-market" },
      update: {},
      create: {
        name: "Green Market",
        slug: "green-market",
        address: "Улаанбаатар, БЗД",
        phone: "88112233",
        description: "Эрүүл хоол",
      },
    }),
  ]);

  await db.user.upsert({
    where: { phone: "99000001" },
    update: {},
    create: {
      name: "Platform Admin",
      phone: "99000001",
      passwordHash,
      qrCode: "ABICO-ADMIN000001",
      referralCode: "ADMIN001",
      role: "PLATFORM_ADMIN",
    },
  });

  await db.user.upsert({
    where: { phone: "99000002" },
    update: {},
    create: {
      name: "Store Admin",
      phone: "99000002",
      passwordHash,
      qrCode: "ABICO-STORE00001",
      referralCode: "STORE001",
      role: "STORE_ADMIN",
      storeId: stores[0].id,
    },
  });

  const employee = await db.user.upsert({
    where: { phone: "99000003" },
    update: {},
    create: {
      name: "Кассчин Болд",
      phone: "99000003",
      passwordHash,
      qrCode: "ABICO-EMP0000001",
      referralCode: "EMP00001",
      role: "EMPLOYEE",
      storeId: stores[0].id,
      pin: "1234",
    },
  });

  const member1 = await db.user.upsert({
    where: { phone: "99112233" },
    update: {},
    create: {
      name: "Батбаяр",
      phone: "99112233",
      passwordHash,
      qrCode: "ABICO-MEMBER0001",
      referralCode: "BAT001",
      role: "MEMBER",
    },
  });

  const member2 = await db.user.upsert({
    where: { phone: "99223344" },
    update: {},
    create: {
      name: "Сараа",
      phone: "99223344",
      passwordHash,
      qrCode: "ABICO-MEMBER0002",
      referralCode: "SAR002",
      role: "MEMBER",
      referredById: member1.id,
    },
  });

  await db.pointTransaction.deleteMany({});
  await db.promotion.deleteMany({});

  await db.pointTransaction.createMany({
    data: [
      {
        userId: member1.id,
        storeId: stores[0].id,
        employeeId: employee.id,
        type: "EARN",
        points: 120,
        purchaseAmount: 120000,
        multiplier: 1,
        description: "Худалдан авалтын оноо",
      },
      {
        userId: member1.id,
        storeId: stores[1].id,
        employeeId: employee.id,
        type: "EARN",
        points: 85,
        purchaseAmount: 85000,
        multiplier: 1,
        description: "Mama & Kids",
      },
      {
        userId: member2.id,
        storeId: stores[0].id,
        employeeId: employee.id,
        type: "EARN",
        points: 2450,
        purchaseAmount: 1225000,
        multiplier: 2,
        description: "2x урамшуулал",
      },
      {
        userId: member1.id,
        type: "REFERRAL",
        points: 50,
        description: "Сараа урилгаар бүртгүүлсэн",
      },
      {
        userId: member2.id,
        type: "BONUS",
        points: 50,
        description: "Урилгаар бүртгүүлсэн бонус",
      },
    ],
  });

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await db.promotion.create({
    data: {
      storeId: stores[0].id,
      title: "ABICO Central 2x Weekend",
      multiplier: 2,
      startsAt: now,
      endsAt: nextMonth,
      isActive: true,
    },
  });

  console.log("Seed completed.");
  console.log("Demo accounts (password: abico2026):");
  console.log("- Platform Admin: 99000001");
  console.log("- Store Admin:    99000002");
  console.log("- Employee:       99000003");
  console.log("- Member:         99112233 (QR: ABICO-MEMBER0001)");
  console.log("- Member (ALT):   99223344 (QR: ABICO-MEMBER0002)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
