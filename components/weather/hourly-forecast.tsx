import { formatHourLabel } from "@/lib/format";
import type { HourlyPoint } from "@/lib/weather/types";

interface HourlyForecastProps {
  points: HourlyPoint[];
  className?: string;
}

/** 표의 한 행: 이름과 시간별 값 */
interface Metric {
  title: string;
  format: (point: HourlyPoint) => string;
}

const METRICS: readonly Metric[] = [
  { title: "체감(℃)", format: (p) => String(Math.round(p.apparentTemperatureC)) },
  { title: "강수(%)", format: (p) => String(Math.round(p.precipitationProbability)) },
  { title: "바람(m/s)", format: (p) => p.windSpeedMs.toFixed(1) },
];

/**
 * 시간별 예보 수치 표(현재 + 12시간). 시간별 복장은 제공하지 않고 수치만 보여 준다.
 * 칸이 많으므로 가로로 스크롤하며, 첫 열(이름)은 고정한다.
 */
export function HourlyForecast({ points, className }: HourlyForecastProps) {
  return (
    <div className={className}>
      <div
        role="region"
        aria-label="시간별 예보 표(좌우로 스크롤)"
        tabIndex={0}
        className="overflow-x-auto rounded-4xl border border-border"
      >
        <table className="w-full min-w-max border-collapse text-sm">
          <caption className="sr-only">시간별 예보</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                시각
              </th>
              {points.map((point, index) => (
                <th key={point.time} scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">
                  {formatHourLabel(point.time, index)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric) => (
              <tr key={metric.title} className="border-t border-border">
                <th scope="row" className="sticky left-0 bg-card px-4 py-3 text-left text-xs font-medium whitespace-nowrap">
                  {metric.title}
                </th>
                {points.map((point) => (
                  <td key={point.time} className="px-3 py-3 text-center font-mono tabular-nums">
                    {metric.format(point)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
