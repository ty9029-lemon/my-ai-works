import { formatSigned } from "@/lib/format";
import type { OutfitAdjustments } from "@/lib/outfit/types";
import { INTENSITY_SHORT_LABEL, SENSITIVITY_SHORT_LABEL } from "@/lib/profile/labels";

/**
 * 보정 내역을 문장으로 만든다. 예: "추위 -3, 인터벌 +4 (합계 +1℃)"
 * 외출 모드처럼 보정이 없으면 null이다.
 */
export function describeAdjustments(adjustments: OutfitAdjustments): string | null {
  const { sensitivity, sensitivityC, intensity, intensityC, totalC } = adjustments;
  if (sensitivityC === 0 && intensityC === 0) return null;
  const parts = [
    `${SENSITIVITY_SHORT_LABEL[sensitivity]} ${formatSigned(sensitivityC)}`,
    `${INTENSITY_SHORT_LABEL[intensity]} ${formatSigned(intensityC)}`,
  ];
  return `${parts.join(", ")} (합계 ${formatSigned(totalC)}℃)`;
}
