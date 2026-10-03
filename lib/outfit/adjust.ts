import { MAX_ADJUSTMENT_C } from "@/lib/constants";
import { DEFAULT_ADJUSTMENT_TABLE, type AdjustmentTable } from "@/lib/outfit/rules";
import type { OutfitAdjustments } from "@/lib/outfit/types";
import type { Intensity, Sensitivity } from "@/lib/profile/types";

/** 값을 -limit ~ +limit 범위로 제한한다. */
function clampSymmetric(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

/**
 * 민감도와 운동 강도에 따른 체감온도 보정을 계산한다. 합계는 ±MAX_ADJUSTMENT_C로 제한한다.
 * @param table 테스트에서 상한 동작을 확인할 때 교체할 수 있는 보정 표
 */
export function calculateAdjustment(
  sensitivity: Sensitivity,
  intensity: Intensity,
  table: AdjustmentTable = DEFAULT_ADJUSTMENT_TABLE,
): OutfitAdjustments {
  const sensitivityC = table.sensitivity[sensitivity];
  const intensityC = table.intensity[intensity];
  const totalC = clampSymmetric(sensitivityC + intensityC, MAX_ADJUSTMENT_C);
  return { sensitivity, sensitivityC, intensity, intensityC, totalC };
}
