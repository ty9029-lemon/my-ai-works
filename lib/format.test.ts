import { describe, expect, it } from "vitest";
import {
  formatClockTime,
  formatHourLabel,
  formatMinutesAgo,
  formatSigned,
  formatTemperature,
} from "@/lib/format";

describe("format", () => {
  it("온도는 소수점 1자리와 단위로 표시한다", () => {
    expect(formatTemperature(17.1)).toBe("17.1℃");
    expect(formatTemperature(-3)).toBe("-3.0℃");
  });

  it("보정값은 부호를 붙여 표시한다", () => {
    expect(formatSigned(4)).toBe("+4");
    expect(formatSigned(-3)).toBe("-3");
    expect(formatSigned(0)).toBe("0");
  });

  it("출발 시각 칩은 첫 번째가 '지금', 나머지는 시 단위다", () => {
    expect(formatHourLabel("2026-10-03T22:00", 0)).toBe("지금");
    expect(formatHourLabel("2026-10-03T23:00", 1)).toBe("23시");
    expect(formatHourLabel("2026-10-04T05:00", 7)).toBe("05시");
  });

  it("기준 시각은 HH:mm 형식이다", () => {
    expect(formatClockTime("2026-10-03T03:07:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
  });

  it("경과 시간은 1분 미만이면 '방금 전'이다", () => {
    expect(formatMinutesAgo(0)).toBe("방금 전");
    expect(formatMinutesAgo(25)).toBe("25분 전");
  });
});
