import { Section } from "../_components/section";

/** 폰트 샘플 문구 */
const FONT_SAMPLES = [
  { className: "font-heading text-3xl font-bold", text: "Run Smart 러닝 지수 82" },
  { className: "text-base font-medium", text: "The quick brown fox — 오늘은 뛰기 좋은 날씨예요." },
  { className: "text-sm text-muted-foreground", text: "0123456789 °C % 한글 가나다라마바사" },
] as const;

/**
 * Typography: --font-sans / --font-heading 적용 확인
 */
export function TypographySection() {
  return (
    <Section
      title="Typography"
      description="Figtree + Pretendard Variable (font-sans, font-heading)"
    >
      <div className="flex flex-col gap-2">
        {FONT_SAMPLES.map(({ className, text }) => (
          <p key={text} className={className}>
            {text}
          </p>
        ))}
      </div>
    </Section>
  );
}
