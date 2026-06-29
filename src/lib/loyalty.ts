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
    id: "mongol",
    name: "Mongol",
    nameMn: "МӨНГӨ",
    minPoints: 0,
    maxPoints: 999,
    discountPercent: 2,
    perks: "2% хөнгөлөлт",
    color: "#94a3b8",
  },
  {
    id: "alt",
    name: "Alt",
    nameMn: "АЛТ",
    minPoints: 1000,
    maxPoints: 4999,
    discountPercent: 5,
    perks: "5% хөнгөлөлт",
    color: "#f59e0b",
  },
  {
    id: "platinum",
    name: "Platinum",
    nameMn: "ПЛАТИНУМ",
    minPoints: 5000,
    maxPoints: 14999,
    discountPercent: 8,
    perks: "8% хөнгөлөлт + давуу эрх",
    color: "#6366f1",
  },
  {
    id: "vip",
    name: "VIP",
    nameMn: "VIP",
    minPoints: 15000,
    maxPoints: null,
    discountPercent: 12,
    perks: "12% хөнгөлөлт + онцгой үйлчлэл",
    color: "#001C3B",
  },
];

export function calculatePointsFromPurchase(
  purchaseAmountMnt: number,
  multiplier = 1,
): number {
  const base = Math.floor(purchaseAmountMnt / POINTS_PER_MNT);
  return Math.floor(base * multiplier);
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
