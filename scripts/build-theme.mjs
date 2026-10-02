// DESIGN.md(라이트 색) + 아래 DARK_COLORS(다크 색)로 다크 모드 대응 theme.css를 생성한다.
// 실행: node scripts/build-theme.mjs
import { readFileSync, writeFileSync } from "node:fs";

const DESIGN_PATH = "DESIGN.md";
const OUTPUT_PATH = "theme.css";
const VAR_PREFIX = "ds";

/** 다크 모드 색 (DESIGN.md의 같은 이름 토큰과 짝을 이룬다). */
const DARK_COLORS = {
  primary: "oklch(0.443 0.11 240.79)",
  "on-primary": "oklch(0.977 0.013 236.62)",
  secondary: "oklch(0.274 0.006 286.033)",
  "on-secondary": "oklch(0.985 0 0)",
  muted: "oklch(0.274 0.006 286.033)",
  "on-muted": "oklch(0.705 0.015 286.067)",
  danger: "oklch(0.704 0.191 22.216)",
  "danger-subtle": "oklch(0.704 0.191 22.216 / 20%)",
  background: "oklch(0.141 0.005 285.823)",
  "on-background": "oklch(0.985 0 0)",
  surface: "oklch(0.21 0.006 285.885)",
  "on-surface": "oklch(0.985 0 0)",
  border: "oklch(1 0 0 / 10%)",
  input: "oklch(1 0 0 / 15%)",
  "focus-ring": "oklch(0.552 0.016 285.938)",
  "chart-1": "oklch(0.871 0.006 286.286)",
  "chart-2": "oklch(0.552 0.016 285.938)",
  "chart-3": "oklch(0.442 0.017 285.786)",
  "chart-4": "oklch(0.37 0.013 285.805)",
  "chart-5": "oklch(0.274 0.006 286.033)",
};

/** 실패 시 메시지를 stderr에 쓰고 종료한다. */
function fail(message) {
  process.stderr.write(`build-theme 실패: ${message}\n`);
  process.exit(1);
}

/** DESIGN.md 프론트매터의 `colors:` 블록을 { 이름: 값 } 으로 읽는다. */
function readLightColors() {
  const frontMatter = readFileSync(DESIGN_PATH, "utf8").split(/^---$/m)[1] ?? "";
  const block = frontMatter.match(/^colors:\n((?:[ \t]+.*\n?)+)/m);
  if (!block) fail(`${DESIGN_PATH}에서 colors 블록을 찾지 못했습니다.`);
  const colors = {};
  for (const match of block[1].matchAll(/^\s+([\w-]+):\s*"([^"]+)"/gm)) {
    colors[match[1]] = match[2];
  }
  return colors;
}

/** 라이트/다크 토큰 이름이 서로 일치하는지 검사한다. */
function assertSameTokens(light) {
  const lightNames = Object.keys(light).sort().join(",");
  const darkNames = Object.keys(DARK_COLORS).sort().join(",");
  if (lightNames !== darkNames) {
    fail(`라이트/다크 토큰 불일치\n  라이트: ${lightNames}\n  다크: ${darkNames}`);
  }
}

/** 역할별 CSS 변수 선언 블록을 만든다. */
function toVarBlock(selector, colors) {
  const lines = Object.entries(colors).map(
    ([role, value]) => `  --${VAR_PREFIX}-${role}: ${value};`,
  );
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** @theme inline 블록: Tailwind 색 유틸리티가 --ds-* 변수를 참조하게 한다. */
function toThemeBlock(colors) {
  const lines = Object.keys(colors).map(
    (role) => `  --color-${role}: var(--${VAR_PREFIX}-${role});`,
  );
  return `@theme inline {\n${lines.join("\n")}\n}`;
}

/** 전체 theme.css 내용을 조립한다. */
function buildThemeCss() {
  const light = readLightColors();
  assertSameTokens(light);
  const header = `/* 자동 생성 파일 — 직접 수정하지 마세요.\n   재생성: node scripts/build-theme.mjs (라이트: ${DESIGN_PATH}, 다크: scripts/build-theme.mjs의 DARK_COLORS)\n   색 토큰만 포함합니다. 라운드/폰트/간격은 app/globals.css가 담당합니다. */`;
  return [header, toVarBlock(":root", light), toVarBlock(".dark", DARK_COLORS), toThemeBlock(light)].join("\n\n") + "\n";
}

writeFileSync(OUTPUT_PATH, buildThemeCss());
process.stdout.write(`${OUTPUT_PATH} 생성 완료\n`);
