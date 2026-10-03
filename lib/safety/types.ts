/** 안전 등급: 정상 / 주의 / 중단 권고 */
export type SafetyLevel = "ok" | "caution" | "stop";

/** 안전 판정 결과 (저장하지 않는다) */
export interface SafetyResult {
  /** 요소별 판정 중 가장 높은 등급 */
  level: SafetyLevel;
  /** 등급에 걸린 사유 목록 */
  reasons: string[];
  /** 판정 기준 출발 시각 (ISO 8601) */
  targetTime: string;
}
