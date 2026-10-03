import { COORDINATE_DECIMAL_PLACES } from "@/lib/constants";

const DECIMAL_BASE = 10;

/**
 * 좌표를 `COORDINATE_DECIMAL_PLACES` 자리로 반올림한다.
 * 서버 요청과 저장에는 반올림한 좌표만 쓴다.
 */
export function roundCoordinate(value: number): number {
  const factor = DECIMAL_BASE ** COORDINATE_DECIMAL_PLACES;
  return Math.round(value * factor) / factor;
}
