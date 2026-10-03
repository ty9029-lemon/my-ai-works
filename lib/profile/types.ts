/** 체감 민감도 허용 값: 추위 많이 탐 / 보통 / 더위 많이 탐 */
export const SENSITIVITIES = ["cold", "normal", "hot"] as const;
export type Sensitivity = (typeof SENSITIVITIES)[number];

/** 운동 강도 허용 값: 조깅 / 장거리 / 인터벌·템포 */
export const INTENSITIES = ["jog", "long", "interval"] as const;
export type Intensity = (typeof INTENSITIES)[number];

/** 추천 모드 허용 값: 러닝 / 외출 */
export const MODES = ["run", "outing"] as const;
export type Mode = (typeof MODES)[number];

/** 위치를 얻은 방법 허용 값 */
export const LOCATION_SOURCES = ["gps", "search", "default"] as const;
export type LocationSource = (typeof LOCATION_SOURCES)[number];

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
