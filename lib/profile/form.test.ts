import { describe, expect, it } from "vitest";
import {
  EMPTY_PROFILE_FORM,
  isProfileComplete,
  toFormValue,
  toProfileInput,
} from "@/lib/profile/form";

const FULL = {
  sensitivity: "cold",
  defaultIntensity: "interval",
  defaultMode: "run",
  hasHealthCondition: true,
} as const;

describe("profile form", () => {
  it("처음에는 아무것도 고르지 않은 상태다", () => {
    expect(isProfileComplete(EMPTY_PROFILE_FORM)).toBe(false);
    expect(toProfileInput(EMPTY_PROFILE_FORM)).toBeNull();
  });

  it.each(["sensitivity", "defaultIntensity", "defaultMode"] as const)(
    "%s를 고르지 않으면 완성되지 않은 것으로 본다",
    (key) => {
      expect(isProfileComplete({ ...FULL, [key]: null })).toBe(false);
      expect(toProfileInput({ ...FULL, [key]: null })).toBeNull();
    },
  );

  it("질문 3개를 모두 고르면 저장할 값으로 바뀐다", () => {
    expect(isProfileComplete(FULL)).toBe(true);
    expect(toProfileInput(FULL)).toEqual(FULL);
  });

  it("저장된 프로필을 입력값으로 바꾼다", () => {
    expect(toFormValue({ ...FULL, updatedAt: "2026-10-03T00:00:00.000Z" })).toEqual(FULL);
    expect(toFormValue(null)).toEqual(EMPTY_PROFILE_FORM);
  });
});
