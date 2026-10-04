"use client";

import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { INTENSITY_OPTIONS, MODE_OPTIONS } from "@/lib/profile/labels";
import type { Intensity, Mode } from "@/lib/profile/types";

interface ConditionChipsProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  intensity: Intensity;
  onIntensityChange: (intensity: Intensity) => void;
  /** 출발 시각 선택지. value는 시간별 값의 인덱스 문자열이다. */
  hourOptions: readonly ChipOption<string>[];
  hourIndex: number;
  onHourChange: (index: number) => void;
}

/** 칩 묶음 위에 붙는 작은 제목 */
function Caption({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground">{children}</p>;
}

/**
 * 홈 화면의 조건 칩: 모드, 운동 강도, 출발 시각.
 * 바꾸면 저장된 날씨로 추천을 다시 계산할 뿐 날씨를 다시 조회하지 않는다.
 */
export function ConditionChips(props: ConditionChipsProps) {
  const { mode, intensity, hourOptions, hourIndex } = props;
  return (
    <section aria-label="추천 조건" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Caption>모드</Caption>
        <ChipGroup label="모드" options={MODE_OPTIONS} value={mode} onChange={props.onModeChange} />
      </div>
      <div className="flex flex-col gap-2">
        <Caption>운동 강도</Caption>
        <ChipGroup
          label="운동 강도"
          options={INTENSITY_OPTIONS}
          value={intensity}
          onChange={props.onIntensityChange}
        />
        {mode === "outing" && (
          <p className="text-xs text-muted-foreground">외출 모드에서는 강도를 보정하지 않아요.</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Caption>출발 시각</Caption>
        <ChipGroup
          label="출발 시각"
          options={hourOptions}
          value={String(hourIndex)}
          onChange={(value) => props.onHourChange(Number(value))}
          scrollable
        />
      </div>
    </section>
  );
}
