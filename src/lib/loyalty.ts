export const POINTS_PER_MNT = 1000;
export const REFERRAL_BONUS = 50;

export type MembershipTier = {
  id: string;
  name: string;
  nameMn: string;
  minPoints: number;
  maxPoints: number | null;
  discountPercent: number;
  perks: string;
  color: string;
};

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "standard",
    name: "Standard",
    nameMn: "СТАНДАРТ",
    minPoints: 0,
    maxPoints: 999,
    discountPercent: 3,
    perks: "3% урамшуулал",
    color: "#94a3b8",
  },
  {
    id: "bronze",
    name: "Bronze",
    nameMn: "ХҮРЭЛ",
    minPoints: 1000,
    maxPoints: 2999,
    discountPercent: 4,
    perks: "4% урамшуулал",
    color: "#b45309",
  },
  {
    id: "alt",
    name: "Alt",
    nameMn: "АЛТ",
    minPoints: 3000,
    maxPoints: 4999,
    discountPercent: 5,
    perks: "5% урамшуулал",
    color: "#f59e0b",
  },
  {
    id: "platinum",
    name: "Platinum",
    nameMn: "ПЛАТИНУМ",
    minPoints: 5000,
    maxPoints: 9999,
    discountPercent: 7,
    perks: "7% урамшуулал + давуу эрх",
    color: "#6366f1",
  },
  {
    id: "vip",
    name: "VIP",
    nameMn: "VIP",
    minPoints: 10000,
    maxPoints: null,
    discountPercent: 10,
    perks: "10% урамшуулал + онцгой үйлчлэл",
    color: "#00b5f5",
  },
];

export function calculatePointsFromPurchase(purchaseAmountMnt: number): number {
  return Math.floor(purchaseAmountMnt / POINTS_PER_MNT);
}

export function getTotalPoints(
  transactions: { points: number; type: string }[],
): number {
  return transactions.reduce((sum, tx) => {
    if (tx.type === "REDEEM") return sum - tx.points;
    return sum + tx.points;
  }, 0);
}

export function getMembershipTier(totalPoints: number): MembershipTier {
  for (let i = MEMBERSHIP_TIERS.length - 1; i >= 0; i -= 1) {
    if (totalPoints >= MEMBERSHIP_TIERS[i].minPoints) {
      return MEMBERSHIP_TIERS[i];
    }
  }
  return MEMBERSHIP_TIERS[0];
}

export function getNextTier(totalPoints: number): MembershipTier | null {
  const current = getMembershipTier(totalPoints);
  const idx = MEMBERSHIP_TIERS.findIndex((t) => t.id === current.id);
  return idx < MEMBERSHIP_TIERS.length - 1 ? MEMBERSHIP_TIERS[idx + 1] : null;
}

export function formatMnt(amount: number): string {
  return `₮${amount.toLocaleString("mn-MN")}`;
}

export function formatPoints(points: number): string {
  return points.toLocaleString("mn-MN");
}
