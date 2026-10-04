import { formatClockTime } from "@/lib/format";
import { CC_BY_URL, OPEN_METEO_URL } from "@/lib/links";

interface DataSourceNoteProps {
  /** 데이터를 받아 온 시각 (ISO 8601). 아직 없으면 생략한다. */
  fetchedAt?: string | null;
  className?: string;
}

const LINK_CLASS = "underline underline-offset-4 hover:text-foreground";

/**
 * 데이터 기준 시각과 출처 표기. Open-Meteo 이용 조건(CC BY 4.0)에 따라 출처를 항상 밝힌다.
 */
export function DataSourceNote({ fetchedAt, className }: DataSourceNoteProps) {
  return (
    <p className={className}>
      {fetchedAt && <span>데이터 기준 {formatClockTime(fetchedAt)} · </span>}
      <span>Weather data by </span>
      <a href={OPEN_METEO_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        Open-Meteo.com
      </a>{" "}
      (
      <a href={CC_BY_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        CC BY 4.0
      </a>
      )
    </p>
  );
}
