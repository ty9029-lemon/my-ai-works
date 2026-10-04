"use client";

import { ChipGroup } from "@/components/ui/chip-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ProfileFormValue } from "@/lib/profile/form";
import { INTENSITY_OPTIONS, MODE_OPTIONS, SENSITIVITY_OPTIONS } from "@/lib/profile/labels";

interface ProfileFieldsProps {
  value: ProfileFormValue;
  /** 바뀐 항목만 전달한다 */
  onChange: (patch: Partial<ProfileFormValue>) => void;
  /** 질환 체크 표시 여부. 온보딩에서는 숨기고 설정에서만 보여 준다. */
  showHealthCondition?: boolean;
}

/** 질문 제목과 칩 묶음을 한 쌍으로 그린다. */
function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{title}</p>
      {children}
    </div>
  );
}

/**
 * 프로필 입력 필드: 체감 민감도, 기본 운동 강도, 기본 모드(+ 선택적으로 질환 여부).
 * 온보딩과 설정 화면이 함께 쓴다.
 */
export function ProfileFields({ value, onChange, showHealthCondition = false }: ProfileFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      <Question title="체감 민감도">
        <ChipGroup
          label="체감 민감도"
          options={SENSITIVITY_OPTIONS}
          value={value.sensitivity}
          onChange={(sensitivity) => onChange({ sensitivity })}
        />
      </Question>
      <Question title="기본 운동 강도">
        <ChipGroup
          label="기본 운동 강도"
          options={INTENSITY_OPTIONS}
          value={value.defaultIntensity}
          onChange={(defaultIntensity) => onChange({ defaultIntensity })}
        />
      </Question>
      <Question title="기본 모드">
        <ChipGroup
          label="기본 모드"
          options={MODE_OPTIONS}
          value={value.defaultMode}
          onChange={(defaultMode) => onChange({ defaultMode })}
        />
      </Question>
      {showHealthCondition && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">
            <Checkbox
              checked={value.hasHealthCondition}
              onCheckedChange={(checked) => onChange({ hasHealthCondition: checked })}
            />
            심혈관·호흡기 질환 있음
          </Label>
          <p className="pl-6 text-xs text-muted-foreground">
            체크하면 미세먼지·폭염·한파 기준을 더 보수적으로 적용해요.
          </p>
        </div>
      )}
    </div>
  );
}
