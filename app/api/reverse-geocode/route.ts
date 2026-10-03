import { createKakaoClientFromEnv } from "@/lib/location/kakao";
import { logger } from "@/lib/logger";

const BAD_REQUEST = 400;
const MAX_ABS_LATITUDE = 90;
const MAX_ABS_LONGITUDE = 180;

/** 쿼리 값이 범위 안의 숫자이면 숫자를, 아니면 null을 돌려준다. */
function parseCoordinate(value: string | null, maxAbs: number): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= maxAbs ? parsed : null;
}

/**
 * 좌표 → 지역명(시·도, 구, 동). GET /api/reverse-geocode?lat=&lon=
 * Kakao 키가 없거나 실패하면 region은 null이다(화면은 좌표로 표시).
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const latitude = parseCoordinate(params.get("lat"), MAX_ABS_LATITUDE);
  const longitude = parseCoordinate(params.get("lon"), MAX_ABS_LONGITUDE);
  if (latitude === null || longitude === null) {
    return Response.json(
      { error: "lat, lon을 올바른 숫자로 보내 주세요." },
      { status: BAD_REQUEST },
    );
  }
  const kakao = createKakaoClientFromEnv();
  if (!kakao) return Response.json({ region: null });
  try {
    return Response.json({ region: await kakao.reverseGeocode(latitude, longitude) });
  } catch (error) {
    logger.error({ error }, "지역명 변환 실패");
    return Response.json({ region: null });
  }
}
