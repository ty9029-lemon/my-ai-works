import { describe, expect, it } from "vitest";
import {
  COORDINATE_DECIMAL_PLACES,
  DEFAULT_LOCATION,
  FORECAST_HOURS,
  GEOLOCATION_TIMEOUT_MS,
  MAX_ADJUSTMENT_C,
} from "@/lib/constants";

describe("constants", () => {
  it("좌표 반올림 자릿수는 소수점 2자리다", () => {
    expect(COORDINATE_DECIMAL_PLACES).toBe(2);
  });

  it("출발 시각 범위는 12시간이다", () => {
    expect(FORECAST_HOURS).toBe(12);
  });

  it("기본 위치 좌표는 서울 범위 안에 있다", () => {
    expect(DEFAULT_LOCATION.latitude).toBeGreaterThan(37);
    expect(DEFAULT_LOCATION.latitude).toBeLessThan(38);
    expect(DEFAULT_LOCATION.longitude).toBeGreaterThan(126);
    expect(DEFAULT_LOCATION.longitude).toBeLessThan(127);
  });

  it("타임아웃과 보정 상한은 양수다", () => {
    expect(GEOLOCATION_TIMEOUT_MS).toBeGreaterThan(0);
    expect(MAX_ADJUSTMENT_C).toBeGreaterThan(0);
  });
});
