const TEMPERATURE_DECIMALS = 1;
const HOUR_START_INDEX = 11;
const HOUR_END_INDEX = 13;

/** 온도를 소수점 1자리와 단위로 표시한다. 예: 17.1 → "17.1℃" */
export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(TEMPERATURE_DECIMALS)}℃`;
}

/** 부호를 붙여 표시한다. 예: 4 → "+4", -3 → "-3", 0 → "0" */
export function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

/** 출발 시각 칩 이름. 첫 번째는 "지금", 나머지는 "15시"처럼 시 단위로 표시한다. */
export function formatHourLabel(time: string, index: number): string {
  if (index === 0) return "지금";
  return `${time.slice(HOUR_START_INDEX, HOUR_END_INDEX)}시`;
}

/** ISO 시각을 사용자 기기 시간대의 "HH:mm"으로 표시한다. */
export function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** 경과 분을 "방금 전" 또는 "N분 전"으로 표시한다. */
export function formatMinutesAgo(minutes: number): string {
  return minutes < 1 ? "방금 전" : `${minutes}분 전`;
}
