import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMinutesAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

interface StaleNoticeProps {
  /** stale: 직전 데이터를 대신 보여 주는 중 / error: 보여 줄 데이터가 없음 */
  status: "stale" | "error";
  /** stale일 때 데이터를 받은 지 몇 분 지났는지 */
  minutesAgo?: number;
  onRetry: () => void;
  className?: string;
}

/**
 * 새 날씨를 받지 못했을 때의 안내. 직전 데이터가 있으면 "N분 전 데이터"로 표시하고,
 * 없으면 "다시 시도" 버튼을 보여 준다.
 */
export function StaleNotice({ status, minutesAgo = 0, onRetry, className }: StaleNoticeProps) {
  const isError = status === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-center justify-between gap-3 rounded-4xl border border-border bg-card px-4 py-3 text-sm",
        className,
      )}
    >
      <p>
        {isError
          ? "날씨를 불러오지 못했어요."
          : `${formatMinutesAgo(minutesAgo)} 데이터예요. 새 데이터를 받지 못했어요.`}
      </p>
      <Button size="sm" variant={isError ? "default" : "secondary"} onClick={onRetry}>
        <RefreshCw data-icon="inline-start" aria-hidden />
        다시 시도
      </Button>
    </div>
  );
}
