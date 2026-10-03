/** 체감 민감도 */
export type Sensitivity = "cold" | "normal" | "hot";

/** 운동 강도 */
export type Intensity = "jog" | "long" | "interval";

/** 추천 모드 */
export type Mode = "run" | "outing";

/** 위치를 얻은 방법 */
export type LocationSource = "gps" | "search" | "default";

/** 사용자 프로필 (localStorage 저장) */
export interface UserProfile {
  sensitivity: Sensitivity;
  defaultIntensity: Intensity;
  defaultMode: Mode;
  /** 심혈관·호흡기 질환 여부. true면 안전 기준을 보수적으로 적용한다. */
  hasHealthCondition: boolean;
  /** 마지막 수정 시각 (ISO 8601) */
  updatedAt: string;
}

/** 저장된 기준 위치 (localStorage, 1개) */
export interface SavedLocation {
  /** 소수점 2자리로 반올림한 위도 */
  latRounded: number;
  /** 소수점 2자리로 반올림한 경도 */
  lonRounded: number;
  /** 화면에 표시할 지역명 */
  regionName: string;
  source: LocationSource;
  /** 저장 시각 (ISO 8601) */
  savedAt: string;
}
