import type { Intensity, Mode, Sensitivity, UserProfile } from "@/lib/profile/types";

/** 온보딩·설정 화면의 프로필 입력값. 아직 고르지 않은 질문은 null이다. */
export interface ProfileFormValue {
  sensitivity: Sensitivity | null;
  defaultIntensity: Intensity | null;
  defaultMode: Mode | null;
  hasHealthCondition: boolean;
}

/** 아무것도 고르지 않은 처음 상태 */
export const EMPTY_PROFILE_FORM: ProfileFormValue = {
  sensitivity: null,
  defaultIntensity: null,
  defaultMode: null,
  hasHealthCondition: false,
};

/** 저장된 프로필을 입력값으로 바꾼다. 프로필이 없으면 빈 입력값이다. */
export function toFormValue(profile: UserProfile | null): ProfileFormValue {
  if (!profile) return EMPTY_PROFILE_FORM;
  return {
    sensitivity: profile.sensitivity,
    defaultIntensity: profile.defaultIntensity,
    defaultMode: profile.defaultMode,
    hasHealthCondition: profile.hasHealthCondition,
  };
}

/** 질문 3개를 모두 골랐는지 확인한다. */
export function isProfileComplete(value: ProfileFormValue): boolean {
  return value.sensitivity !== null && value.defaultIntensity !== null && value.defaultMode !== null;
}

/** 입력값을 저장할 프로필로 바꾼다. 질문에 빠진 것이 있으면 null이다. */
export function toProfileInput(value: ProfileFormValue): Omit<UserProfile, "updatedAt"> | null {
  const { sensitivity, defaultIntensity, defaultMode, hasHealthCondition } = value;
  if (sensitivity === null || defaultIntensity === null || defaultMode === null) return null;
  return { sensitivity, defaultIntensity, defaultMode, hasHealthCondition };
}
