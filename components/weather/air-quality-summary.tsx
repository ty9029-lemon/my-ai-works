import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelEstimateLabel } from "@/components/weather/model-estimate-label";
import type { HourlyPoint } from "@/lib/weather/types";

interface AirQualitySummaryProps {
  point: HourlyPoint;
  className?: string;
}

const NO_VALUE = "정보 없음";

/** 값이 없으면(null) "정보 없음", 있으면 단위와 함께 표시한다. */
function show(value: number | null, unit: string): string {
  return value === null ? NO_VALUE : `${Math.round(value)} ${unit}`;
}

/** 이름과 수치를 한 줄로 보여 준다. 수치는 고정폭·자릿수 정렬(numeric 토큰)로 쓴다. */
function Item({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="font-mono text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * 선택한 시각의 초미세먼지·미세먼지·UV 수치. 모두 모델 추정치라서 "모델 추정치" 라벨을 함께 둔다.
 */
export function AirQualitySummary({ point, className }: AirQualitySummaryProps) {
  return (
    <Card size="sm" className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>대기질·자외선</CardTitle>
        <ModelEstimateLabel />
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-3 gap-3">
          <Item term="초미세먼지 PM2.5" value={show(point.pm25, "㎍/㎥")} />
          <Item term="미세먼지 PM10" value={show(point.pm10, "㎍/㎥")} />
          <Item term="UV 지수" value={show(point.uvIndex, "")} />
        </dl>
      </CardContent>
    </Card>
  );
}
