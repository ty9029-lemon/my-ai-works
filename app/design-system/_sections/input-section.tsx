import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "../_components/section";

/** 인풋 상태 목록 (라벨, id, 추가 props) */
const INPUT_STATES = [
  { id: "ds-default", label: "기본", props: { placeholder: "이메일 입력" } },
  { id: "ds-filled", label: "값 입력됨", props: { defaultValue: "runner@example.com" } },
  { id: "ds-disabled", label: "비활성", props: { placeholder: "수정 불가", disabled: true } },
  { id: "ds-invalid", label: "오류 (aria-invalid)", props: { defaultValue: "잘못된 값", "aria-invalid": true } },
  { id: "ds-password", label: "비밀번호", props: { type: "password", defaultValue: "secret" } },
  { id: "ds-file", label: "파일", props: { type: "file" } },
] as const;

/**
 * Input: 라벨과 함께 상태별(기본/입력됨/비활성/오류/파일) 표시
 */
export function InputSection() {
  return (
    <Section title="Input" description="상태별 입력 필드">
      <div className="grid gap-4 sm:grid-cols-2">
        {INPUT_STATES.map(({ id, label, props }) => (
          <div key={id} className="flex flex-col gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} {...props} />
          </div>
        ))}
      </div>
    </Section>
  );
}
