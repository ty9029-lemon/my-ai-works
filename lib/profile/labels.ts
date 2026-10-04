import type { Intensity, Mode, Sensitivity } from "@/lib/profile/types";

/** 화면에 표시할 선택지 한 개 */
export interface Option<T extends string> {
  value: T;
  label: string;
}

export const SENSITIVITY_OPTIONS: readonly Option<Sensitivity>[] = [
  { value: "cold", label: "추위 많이 탐" },
  { value: "normal", label: "보통" },
  { value: "hot", label: "더위 많이 탐" },
];

export const INTENSITY_OPTIONS: readonly Option<Intensity>[] = [
  { value: "jog", label: "조깅" },
  { value: "long", label: "장거리" },
  { value: "interval", label: "인터벌·템포" },
];

export const MODE_OPTIONS: readonly Option<Mode>[] = [
  { value: "run", label: "러닝" },
  { value: "outing", label: "외출" },
];

/** 보정 내역 문구용 짧은 이름 (예: "추위 -3, 인터벌 +4") */
export const SENSITIVITY_SHORT_LABEL: Record<Sensitivity, string> = {
  cold: "추위",
  normal: "보통",
  hot: "더위",
};

export const INTENSITY_SHORT_LABEL: Record<Intensity, string> = {
  jog: "조깅",
  long: "장거리",
  interval: "인터벌",
};

export const MODE_LABEL: Record<Mode, string> = {
  run: "러닝",
  outing: "외출",
};
