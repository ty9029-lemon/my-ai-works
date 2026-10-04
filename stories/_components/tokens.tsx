import type { ReactNode } from "react";

/** DESIGN.md 색 토큰 (라이트 값은 문서 기준, 실제 색은 CSS 변수로 렌더링) */
export const COLOR_TOKENS = [
  { name: "primary", cssVar: "--ds-primary", value: "oklch(0.5 0.134 242.749)" },
  { name: "on-primary", cssVar: "--ds-on-primary", value: "oklch(0.977 0.013 236.62)" },
  { name: "secondary", cssVar: "--ds-secondary", value: "oklch(0.967 0.001 286.375)" },
  { name: "on-secondary", cssVar: "--ds-on-secondary", value: "oklch(0.21 0.006 285.885)" },
  { name: "muted", cssVar: "--ds-muted", value: "oklch(0.967 0.001 286.375)" },
  { name: "on-muted", cssVar: "--ds-on-muted", value: "oklch(0.552 0.016 285.938)" },
  { name: "danger", cssVar: "--ds-danger", value: "oklch(0.505 0.213 27.518)" },
  { name: "danger-subtle", cssVar: "--ds-danger-subtle", value: "oklch(0.975 0.015 27)" },
  { name: "background", cssVar: "--ds-background", value: "oklch(1 0 0)" },
  { name: "on-background", cssVar: "--ds-on-background", value: "oklch(0.141 0.005 285.823)" },
  { name: "surface", cssVar: "--ds-surface", value: "oklch(1 0 0)" },
  { name: "on-surface", cssVar: "--ds-on-surface", value: "oklch(0.141 0.005 285.823)" },
  { name: "border", cssVar: "--ds-border", value: "oklch(0.92 0.004 286.32)" },
  { name: "input", cssVar: "--ds-input", value: "oklch(0.92 0.004 286.32)" },
  { name: "focus-ring", cssVar: "--ds-focus-ring", value: "oklch(0.705 0.015 286.067)" },
  { name: "chart-1", cssVar: "--ds-chart-1", value: "oklch(0.871 0.006 286.286)" },
  { name: "chart-2", cssVar: "--ds-chart-2", value: "oklch(0.552 0.016 285.938)" },
  { name: "chart-3", cssVar: "--ds-chart-3", value: "oklch(0.442 0.017 285.786)" },
  { name: "chart-4", cssVar: "--ds-chart-4", value: "oklch(0.37 0.013 285.805)" },
  { name: "chart-5", cssVar: "--ds-chart-5", value: "oklch(0.274 0.006 286.033)" },
] as const;

/** DESIGN.md 타이포그래피 토큰 */
export const TYPOGRAPHY_TOKENS = [
  { name: "display", font: "Figtree", size: 30, weight: 700, lineHeight: 1.2 },
  { name: "title", font: "Figtree", size: 20, weight: 600, lineHeight: 1.3 },
  { name: "heading", font: "Figtree", size: 16, weight: 500, lineHeight: 1 },
  { name: "body-lg", font: "Figtree", size: 16, weight: 400, lineHeight: 1.5 },
  { name: "body", font: "Figtree", size: 14, weight: 400, lineHeight: 1.5 },
  { name: "label-lg", font: "Figtree", size: 16, weight: 500, lineHeight: 1 },
  { name: "label", font: "Figtree", size: 14, weight: 500, lineHeight: 1 },
  { name: "caption", font: "Figtree", size: 12, weight: 500, lineHeight: 1.3, letterSpacing: "0.05em", uppercase: true },
  { name: "numeric", font: "Geist Mono", size: 14, weight: 500, lineHeight: 1.4 },
] as const;

/** DESIGN.md 간격 토큰 (px) */
export const SPACING_TOKENS = [
  { name: "xs", px: 4 },
  { name: "sm", px: 8 },
  { name: "md", px: 12 },
  { name: "lg", px: 16 },
  { name: "xl", px: 24 },
  { name: "page-gutter", px: 16 },
  { name: "section-gap", px: 48 },
] as const;

/** DESIGN.md 라운드 토큰 (px) */
export const ROUNDED_TOKENS = [
  { name: "sm", px: 6 },
  { name: "md", px: 8 },
  { name: "lg", px: 10 },
  { name: "xl", px: 14 },
  { name: "2xl", px: 18 },
  { name: "3xl", px: 22 },
  { name: "4xl", px: 26 },
] as const;

const SWATCH_HEIGHT_CLASS = "h-14";

/**
 * 색 토큰 스와치 그리드
 */
export function ColorSwatches() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {COLOR_TOKENS.map((token) => (
        <div key={token.name} className="flex flex-col gap-1.5 text-xs">
          <div
            className={`${SWATCH_HEIGHT_CLASS} rounded-lg border border-border`}
            style={{ background: `var(${token.cssVar})` }}
          />
          <span className="font-medium">{token.name}</span>
          <span className="text-muted-foreground">{token.cssVar}</span>
          <span className="font-mono text-muted-foreground">{token.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * 타이포그래피 스케일 표
 */
export function TypographyScale() {
  return (
    <div className="flex flex-col divide-y divide-border">
      {TYPOGRAPHY_TOKENS.map((token) => (
        <div key={token.name} className="flex items-baseline gap-6 py-3">
          <div className="w-40 shrink-0 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">{token.name}</div>
            {token.size}px / {token.weight} / {token.lineHeight}
          </div>
          <div
            style={{
              fontFamily: token.font === "Geist Mono" ? "var(--font-mono)" : "var(--font-sans)",
              fontSize: token.size,
              fontWeight: token.weight,
              lineHeight: token.lineHeight,
              letterSpacing: "letterSpacing" in token ? token.letterSpacing : undefined,
              textTransform: "uppercase" in token ? "uppercase" : undefined,
            }}
          >
            오늘 러닝하기 좋은 날씨 Run Smart 18°C
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 간격 토큰 막대 표
 */
export function SpacingScale() {
  return (
    <div className="flex flex-col gap-2">
      {SPACING_TOKENS.map((token) => (
        <Row key={token.name} label={`${token.name} · ${token.px}px`}>
          <div className="h-4 rounded-sm bg-primary" style={{ width: token.px }} />
        </Row>
      ))}
    </div>
  );
}

/**
 * 라운드 토큰 샘플
 */
export function RoundedScale() {
  return (
    <div className="flex flex-wrap gap-4">
      {ROUNDED_TOKENS.map((token) => (
        <div key={token.name} className="flex flex-col items-center gap-1.5 text-xs">
          <div
            className="size-16 border border-border bg-secondary"
            style={{ borderRadius: token.px }}
          />
          <span className="font-medium">{token.name}</span>
          <span className="text-muted-foreground">{token.px}px</span>
        </div>
      ))}
    </div>
  );
}

/** 라벨 + 내용 한 줄 */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 text-xs">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
