import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/constants";
import { createKakaoClientFromEnv } from "@/lib/location/kakao";
import { logger } from "@/lib/logger";
import { searchLocations } from "@/lib/location/search-locations";

const BAD_REQUEST = 400;
const BAD_GATEWAY = 502;

/** 주소·지명 검색. GET /api/geocode?q=검색어 */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length > MAX_SEARCH_QUERY_LENGTH) {
    return Response.json(
      { error: "검색어를 1자 이상 입력해 주세요." },
      { status: BAD_REQUEST },
    );
  }
  try {
    const results = await searchLocations(query, createKakaoClientFromEnv());
    return Response.json({ results });
  } catch (error) {
    logger.error({ error }, "주소 검색 실패");
    return Response.json(
      { error: "주소 검색에 실패했어요. 잠시 후 다시 시도해 주세요." },
      { status: BAD_GATEWAY },
    );
  }
}
