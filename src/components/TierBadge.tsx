import { MembershipTier } from "@/lib/loyalty";
import { cn } from "@/lib/utils";

export function TierBadge({
  tier,
  large,
}: {
  tier: MembershipTier;
  large?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold uppercase tracking-wide",
        large ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs",
      )}
      style={{
        backgroundColor: `${tier.color}22`,
        color: tier.color === "#001C3B" ? "#bfe0f3" : tier.color,
        border: `1px solid ${tier.color}55`,
      }}
    >
      {tier.nameMn}
    </span>
  );
}
