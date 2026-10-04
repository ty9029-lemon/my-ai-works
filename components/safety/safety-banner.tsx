import { CircleCheck, Info, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";

import { AIR_KOREA_URL, KMA_WARNING_URL } from "@/lib/links";
import {
  FEELS_LIKE_NOTE,
  LIGHTNING_NOTICE,
  MISSING_FACTOR_LABEL,
  SAFETY_LEVEL_LABEL,
  SAFETY_OK_MESSAGE,
} from "@/lib/safety/copy";
import type { SafetyFactor, SafetyLevel, SafetyResult } from "@/lib/safety/types";
import { cn } from "@/lib/utils";

/** 등급별 아이콘과 색. 색만으로 구분하지 않도록 아이콘·텍스트를 함께 쓴다. */
const LEVEL_STYLE: Record<SafetyLevel, { Icon: LucideIcon; container: string; heading: string }> = {
  ok: { Icon: CircleCheck, container: "border-border bg-card", heading: "text-foreground" },
  caution: { Icon: TriangleAlert, container: "border-transparent bg-warning-subtle", heading: "text-warning" },
  stop: { Icon: OctagonAlert, container: "border-transparent bg-danger-subtle", heading: "text-danger" },
};

const DUST_FACTORS: readonly SafetyFactor[] = ["pm25", "pm10"];
const TEMPERATURE_FACTORS: readonly SafetyFactor[] = ["heat", "cold"];

interface SafetyBannerProps {
  result: SafetyResult;
  className?: string;
}

/** 값을 받지 못해 판정에서 제외한 요소를 안내하는 문장. 없으면 null이다. */
function missingMessage(missing: SafetyFactor[]): string | null {
  const names = missing.map((factor) => MISSING_FACTOR_LABEL[factor]).filter(Boolean);
  return names.length > 0 ? `${names.join("·")} 정보를 가져오지 못해 판정에서 제외했어요.` : null;
}

/**
 * 안전 등급 배너. 복장 카드보다 위에 표시한다.
 * 걸린 사유를 모두 나열하고, 기상특보 확인 링크와 낙뢰 안내를 항상 보여 준다.
 */
export function SafetyBanner({ result, className }: SafetyBannerProps) {
  const { Icon, container, heading } = LEVEL_STYLE[result.level];
  const hasDust = result.reasons.some((r) => DUST_FACTORS.includes(r.factor));
  const missing = missingMessage(result.missingFactors);
  return (
    <section
      aria-label="안전 등급"
      className={cn("flex flex-col gap-3 rounded-4xl border p-4", container, className)}
    >
      <h2 className={cn("flex items-center gap-2 text-base font-semibold", heading)}>
        <Icon aria-hidden className="size-5 shrink-0" />
        <span>{SAFETY_LEVEL_LABEL[result.level]}</span>
      </h2>
      {result.reasons.length === 0 ? (
        <p className="text-sm text-muted-foreground">{SAFETY_OK_MESSAGE}</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm text-foreground">
          {result.reasons.map((reason) => (
            <li key={reason.factor}>
              <p>{reason.message}</p>
              {TEMPERATURE_FACTORS.includes(reason.factor) && (
                <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                  <Info aria-hidden className="mt-px size-3.5 shrink-0" />
                  {FEELS_LIKE_NOTE}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      {hasDust && (
        <a
          href={AIR_KOREA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-sm font-medium underline underline-offset-4"
        >
          에어코리아에서 실측값 확인
        </a>
      )}
      {missing && <p className="text-xs text-muted-foreground">{missing}</p>}
      <div className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <p>{LIGHTNING_NOTICE}</p>
        <a
          href={KMA_WARNING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit font-medium text-foreground underline underline-offset-4"
        >
          기상특보 확인 (기상청)
        </a>
      </div>
    </section>
  );
}
