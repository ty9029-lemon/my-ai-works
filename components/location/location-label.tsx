import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LocationLabelProps {
  /** 표시할 지역명 (예: "서울 마포구 합정동") */
  regionName: string;
  /** 대체 위치를 쓰는 중이면 안내 문구 (예: "기본 위치: 서울") */
  fallbackNotice?: string | null;
  /** 눌렀을 때 이동할 위치 검색 경로 */
  href?: string;
  className?: string;
}

/**
 * 기준 위치 표시. 누르면 위치 검색 화면으로 이동한다.
 * 대체 위치(기본 위치 등)를 쓰는 중이면 그 사실을 함께 보여 준다.
 */
export function LocationLabel({ regionName, fallbackNotice, href = "/location", className }: LocationLabelProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Link
        href={href}
        aria-label={`기준 위치 ${regionName}, 위치 바꾸기`}
        className="flex items-center gap-1 rounded-3xl py-1 text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <MapPin aria-hidden className="size-4 shrink-0" />
        <span>{regionName}</span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </Link>
      {fallbackNotice && <Badge variant="secondary">{fallbackNotice}</Badge>}
    </div>
  );
}
