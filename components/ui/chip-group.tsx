"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "cn"

/** 칩 선택지 한 개 */
export interface ChipOption<T extends string> {
  value: T
  label: string
}

interface ChipGroupProps<T extends string> {
  /** 접근성 이름. 보이는 제목이 따로 있으면 그 문구와 같게 쓴다. */
  label: string
  options: readonly ChipOption<T>[]
  /** 선택된 값. 아직 고르지 않았으면 null */
  value: T | null
  onChange: (value: T) => void
  /** true이면 줄바꿈 없이 가로로 스크롤한다 (출발 시각 칩처럼 개수가 많을 때) */
  scrollable?: boolean
  className?: string
}

/**
 * 하나만 고르는 칩 묶음. 필수 선택이므로 선택된 칩을 다시 눌러도 해제되지 않는다.
 */
function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  scrollable = false,
  className,
}: ChipGroupProps<T>) {
  return (
    <ToggleGroup
      aria-label={label}
      variant="outline"
      size="lg"
      value={value === null ? [] : [value]}
      onValueChange={(next) => {
        const picked = options.find((option) => option.value === next[0])
        if (picked) onChange(picked.value)
      }}
      className={cn(
        "w-full",
        scrollable ? "flex-nowrap overflow-x-auto pb-1" : "flex-wrap",
        className
      )}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { ChipGroup }
