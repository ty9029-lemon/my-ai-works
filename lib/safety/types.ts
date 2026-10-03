/** 안전 등급: 정상 / 주의 / 중단 권고 */
export type SafetyLevel = "ok" | "caution" | "stop";

/** 판정 요소. 화면이 요소별로 링크·안내 아이콘을 붙일 때 구분하는 데 쓴다. */
export const SAFETY_FACTORS = [
  "wind",
  "uv",
  "heat",
  "cold",
  "ice",
  "pm25",
  "pm10",
  "night",
] as const;
export type SafetyFactor = (typeof SAFETY_FACTORS)[number];

/** 등급에 걸린 사유 한 건 */
export interface SafetyReason {
  factor: SafetyFactor;
  /** 이 요소의 등급 (정상인 요소는 사유가 되지 않는다) */
  level: Exclude<SafetyLevel, "ok">;
  /** 화면에 표시할 안내 문구 */
  message: string;
}

/** 안전 판정 결과 (저장하지 않는다) */
export interface SafetyResult {
  /** 요소별 판정 중 가장 높은 등급 */
  level: SafetyLevel;
  /** 등급에 걸린 사유 전체 (등급이 높은 순) */
  reasons: SafetyReason[];
  /** 값이 없어 판정하지 못한 요소. 화면이 "정보 없음"을 알릴 때 쓴다. */
  missingFactors: SafetyFactor[];
  /** 판정 기준 출발 시각 (ISO 8601) */
  targetTime: string;
}
