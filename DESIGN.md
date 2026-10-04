---
version: alpha
name: Run Smart
description: 러닝·외출용 개인화 날씨 모니터링 모바일 웹앱의 디자인 시스템
colors:
  primary: "oklch(0.5 0.134 242.749)"
  on-primary: "oklch(0.977 0.013 236.62)"
  secondary: "oklch(0.967 0.001 286.375)"
  on-secondary: "oklch(0.21 0.006 285.885)"
  muted: "oklch(0.967 0.001 286.375)"
  on-muted: "oklch(0.552 0.016 285.938)"
  danger: "oklch(0.577 0.245 27.325)"
  danger-subtle: "oklch(0.975 0.015 27)"
  warning: "oklch(0.555 0.163 48.4)"
  warning-subtle: "oklch(0.987 0.022 95.277)"
  background: "oklch(1 0 0)"
  on-background: "oklch(0.141 0.005 285.823)"
  surface: "oklch(1 0 0)"
  on-surface: "oklch(0.141 0.005 285.823)"
  border: "oklch(0.92 0.004 286.32)"
  input: "oklch(0.92 0.004 286.32)"
  focus-ring: "oklch(0.705 0.015 286.067)"
  chart-1: "oklch(0.871 0.006 286.286)"
  chart-2: "oklch(0.552 0.016 285.938)"
  chart-3: "oklch(0.442 0.017 285.786)"
  chart-4: "oklch(0.37 0.013 285.805)"
  chart-5: "oklch(0.274 0.006 286.033)"
typography:
  heading:
    fontFamily: Figtree
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1
  display:
    fontFamily: Figtree
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: Figtree
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: Figtree
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: Figtree
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Figtree
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
  label-lg:
    fontFamily: Figtree
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1
  caption:
    fontFamily: Figtree
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.05em
  numeric:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  2xl: 18px
  3xl: 22px
  4xl: 26px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  page-gutter: 16px
  section-gap: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.4xl}"
    height: 36px
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.4xl}"
    height: 36px
    padding: 12px
  button-danger:
    backgroundColor: "{colors.danger-subtle}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.4xl}"
    height: 36px
    padding: 12px
  button-xs:
    rounded: "{rounded.4xl}"
    height: 24px
    padding: 8px
  button-sm:
    typography: "{typography.label}"
    rounded: "{rounded.4xl}"
    height: 32px
    padding: 12px
  button-lg:
    typography: "{typography.label}"
    rounded: "{rounded.4xl}"
    height: 40px
    padding: 16px
  button-xl:
    typography: "{typography.label-lg}"
    rounded: "{rounded.4xl}"
    height: 44px
    padding: 24px
  button-icon:
    rounded: "{rounded.4xl}"
    height: 36px
  input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.on-background}"
    typography: "{typography.body}"
    rounded: "{rounded.3xl}"
    height: 36px
    padding: 12px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.4xl}"
    padding: 24px
  muted-text:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 12px
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.3xl}"
    height: 20px
    padding: 8px
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.4xl}"
    padding: 24px
---

# Run Smart 디자인 시스템

> **작업 규칙**
> - UI 작업 전에 반드시 이 DESIGN.md를 먼저 읽는다.
> - 여기 없는 색·간격·반경 값을 새로 만들지 않는다. 필요한 값이 없으면 임의로 정하지 말고 이 문서에 먼저 추가를 제안한다.
> - UI 작업 전에 storybook MCP(`docs-list`, `docs-show` 등)로 기존 컴포넌트를 먼저 확인하고, 있으면 새로 만들지 않고 재사용한다.
> - 새 컴포넌트를 만들면 stories 파일도 함께 만든다.

> 색 토큰의 라이트 값은 이 문서 YAML이, 다크 값은 `scripts/build-theme.mjs`의 `DARK_COLORS`가 정의하며, `node scripts/build-theme.mjs`로 `theme.css`(`--ds-*` 변수)를 생성한다. `app/globals.css`의 shadcn 변수(`--primary` 등)는 이 토큰을 참조만 한다. 값을 바꿀 때는 이 문서(라이트) 또는 `DARK_COLORS`(다크)를 고치고 `theme.css`를 재생성한다. 라운드·폰트·간격은 `globals.css`가 정의한다.

## Overview

"지금 뛰어도 되는가?"라는 판단을 몇 초 안에 내리게 해 주는 러닝·외출용 날씨 앱이다. 수치를 나열하기보다 **한 줄 메시지와 행동 가이드**가 먼저 보여야 하므로, UI는 조용하고 중립적인 회색조 위에 **파란 계열 primary 하나**만 강조색으로 쓴다. 모서리는 둥글고 부드럽게(pill에 가까운 버튼/입력, 큰 라운드의 카드) 해서 운동 앱다운 친근함을 주되, 색 자체는 절제한다. 주 사용 환경은 모바일 웹이며 라이트/다크 모드를 모두 지원한다.

## Colors

색 이름은 색상(blue, red)이 아니라 **역할**로 정한다. 같은 역할 이름이 라이트/다크에서 다른 값을 가진다.

- **primary / on-primary:** 화면의 핵심 행동(저장, 시작, 확인)에만 쓰는 강조색. 짙은 청색 계열이다. 다크 모드에서는 눈부심을 줄이려고 오히려 더 어둡게(`oklch(0.443 0.11 240.79)`) 쓰며, on-primary는 동일하다.
- **secondary / on-secondary:** 보조 행동용의 옅은 회색 면. primary와 시각적 경쟁을 하지 않는다.
- **muted / on-muted:** 비활성·부가 설명 영역. `on-muted`는 설명 텍스트, 플레이스홀더에 쓴다.
- **danger:** 삭제·초기화 같은 파괴적 동작과 오류 상태 전용. 이 프로젝트의 destructive 스타일은 채워진 붉은 버튼이 아니라 **옅은 배경(`danger-subtle`, 실제 CSS는 danger 10% 투명도) + 붉은 글자** 방식이라 `on-danger` 토큰이 따로 없다. 다크 모드에서는 더 밝은 `oklch(0.704 0.191 22.216)`을 쓴다.
- **warning:** 주의가 필요한 상태 전용(안전 등급 "주의", 경고 배지). 짙은 주황 계열이며 danger와 같은 방식으로 **옅은 배경(`warning-subtle`) + 주황 글자·아이콘**을 쓴다. 그래서 `on-warning` 토큰이 따로 없다. 다크 모드에서는 밝은 노랑 계열(`oklch(0.879 0.169 91.605)`)에 12% 투명도 배경을 쓴다. 글자·배경 대비는 라이트 4.88:1, 다크 5.21:1(WCAG AA 4.5:1 이상)로 확인했다. 색만으로 상태를 구분하지 말고 아이콘과 텍스트를 함께 쓴다.
- **background / surface:** 페이지 바탕과 카드·팝오버 면. 다크에서는 각각 `oklch(0.141 0.005 285.823)`, `oklch(0.21 0.006 285.885)`로 단계를 나눠 깊이를 표현한다.
- **border / input / focus-ring:** 경계선, 입력창 바탕, 포커스 링. 다크에서는 흰색 투명도(10%/15%)로 처리한다.
- **chart-1 ~ chart-5:** 차트 전용 회색 단계. 데이터 계열을 구분할 때 이 순서대로 쓰고, 차트 외 UI에는 쓰지 않는다.

## Typography

본문과 제목은 **Figtree**, 한글은 **Pretendard Variable**로 대체(fallback)된다(`--font-sans`). 숫자·수치 표기(기온, 러닝 지수, 차트 툴팁)는 **Geist Mono**와 `tabular-nums`로 자릿수를 맞춘다.

> **Figma 표기:** Figma 텍스트 스타일은 한 스타일에 폰트를 하나만 지정할 수 있어 fallback을 표현할 수 없다. 그래서 Figma의 텍스트 스타일(`numeric` 제외)은 영문·한글 모두 **Pretendard Variable**로 지정한다. 코드는 위 토큰대로 Figtree + Pretendard fallback이므로 영문 글자 모양이 Figma와 약간 다를 수 있다. 크기·굵기·줄 높이는 Figma와 코드가 같다.

- **display (30px/700):** 화면의 최상위 제목, 러닝 지수 같은 핵심 수치.
- **title (20px/600):** 섹션 제목.
- **heading (16px/500):** 카드·다이얼로그 제목.
- **body (14px/400):** 기본 본문. 입력창은 모바일 줌 방지를 위해 모바일에서 16px을 쓰고 `md` 이상에서 14px로 내린다.
- **body-lg (16px/400):** body와 같은 굵기·줄 높이에 크기만 16px. 강조가 필요한 본문에 쓴다.
- **label (14px/500):** 버튼, 폼 라벨.
- **label-lg (16px/500):** label과 같은 굵기에 크기만 16px. 터치 타깃이 큰 `xl` 버튼 글자에 쓴다.
- **caption (12px/500, 대문자 + 넓은 자간):** 소제목, 배지, 메타 정보.
- 한 화면에서 쓰는 글자 굵기는 최대 3종(400/500/600~700)으로 제한한다.

## Layout

기본 간격은 4px 단위다. 페이지는 가운데 정렬된 `max-w-5xl` 컨테이너에 좌우 `16px` 여백, 섹션 간 `48px`(`section-gap`)을 둔다. 좁은 화면에서도 섹션 간격은 `spacing.xl`(24px) 아래로 줄이지 않는다. 카드 내부 여백은 기본 `24px`, 촘촘한 목록용 `sm` 크기는 `16px`이다. 모바일 우선으로 설계하고 `sm`/`md` 브레이크포인트에서 2열 그리드로 넓힌다.

## Elevation & Depth

그림자보다 **면의 명도 차이와 얇은 테두리**로 위계를 나타낸다. 카드는 그림자 없이 `border` 토큰의 **1px 테두리**로 구분한다(다크 모드에서는 흰색 10% 투명도의 `border`). 화면 위에 떠 있는 다이얼로그만 예외로 `shadow-xl` + 뒤쪽 `bg-black/30` 블러 오버레이를 쓴다.

## Shapes

`--radius`는 `0.625rem(10px)`이고 나머지 단계는 여기에 배수를 곱해 만든다(sm 0.6, md 0.8, lg 1, xl 1.4, 2xl 1.8, 3xl 2.2, 4xl 2.6). 버튼은 `4xl`(pill형), 입력창과 배지는 `3xl`, 카드와 다이얼로그는 `4xl`을 쓴다. 한 화면 안에서 각진 모서리와 둥근 모서리를 섞지 않는다.

## Components

`components/ui/`의 shadcn(base-luma, `@base-ui/react` 기반) 컴포넌트를 그대로 쓰고, 새 컴포넌트는 여기에 먼저 추가한다.

- **Button:** variant는 `default`(primary), `secondary`, `outline`, `ghost`, `destructive`(danger), `link`. size는 `xs`/`sm`/`default`/`lg`/`xl`와 아이콘 전용 `icon-*`. 아이콘은 `data-icon="inline-start|inline-end"`를 붙여야 패딩이 보정된다(아이콘 쪽 패딩: `xs` 6px, `sm` 8px, `default` 10px, `lg` 12px, `xl` 20px).
  - size 값(색은 variant가 정하고, size는 높이·패딩·간격만 정한다. 반경은 모두 `rounded.4xl`):

    | size | 높이 | 좌우 패딩 | 아이콘-글자 간격 | 글자 |
    |---|---|---|---|---|
    | `xs` | 24px | 8px (`spacing.sm`) | 4px | 12px (`label`과 같은 굵기 500, 크기만 12px. 전용 토큰 없음) |
    | `sm` | 32px | 12px | 4px | `label` |
    | `default` | 36px | 12px | 6px | `label` |
    | `lg` | 40px | 16px | 6px | `label` |
    | `xl` | 44px | 24px (`spacing.xl`) | 6px | `label-lg` (16px/500, 터치 타깃용) |
    | `icon` / `icon-xs` / `icon-sm` / `icon-lg` | 36 / 24 / 32 / 40px | 정사각형 | - | - |

  - 모든 size의 패딩은 `spacing` 토큰(`sm`/`md`/`lg`/`xl`)을 쓴다. 이 값은 `components/ui/button.tsx`의 `buttonVariants.size`와 같다. size를 바꿀 때는 두 곳을 함께 수정한다.
- **Badge:** 상태 표시용. primary(기본), secondary, destructive, warning, outline.
- **Input + Label:** 항상 `Label htmlFor`와 `Input id`를 짝지어 쓴다. 오류는 `aria-invalid`로 표시하면 danger 테두리/링이 자동 적용된다.
- **Card:** `size="sm" | "default"`. 정보 덩어리 단위이며 그림자 없이 1px `border` 테두리로 구분한다. `CardAction`에 배지나 보조 버튼을 둔다.
- **Dialog:** 트리거와 닫기 버튼은 `asChild`가 아니라 `render` prop을 쓴다. 예: `<DialogTrigger render={<Button variant="outline" />}>`.
- **Toggle Group:** 하나를 고르는 칩 묶음(모드, 운동 강도, 체감 민감도, 출발 시각). `variant="outline"`을 쓰고 선택된 칩은 `foreground` 테두리 + `secondary` 면으로 구분한다(primary는 CTA에만 쓰므로 칩에 쓰지 않는다). 터치 타깃을 위해 `size="lg"`(40px)를 쓰고, 값은 배열로 오므로 필수 선택이면 빈 배열을 무시한다.
- **Checkbox:** 예/아니오 설정(질환 여부). 접근 가능한 이름을 위해 항상 `Label`로 감싼다.
- **Chart:** recharts 래퍼. 색은 `ChartConfig`에서 `var(--chart-N)`으로만 지정한다.

## Do's and Don'ts

- Do: primary 버튼은 화면당 CTA **하나에만** 쓴다(다이얼로그 포함). 나머지 버튼은 secondary로 둔다.
- Don't: `#hex`, `zinc-*` 같은 색을 하드코딩하거나 `globals.css` 밖에서 새 토큰을 정의하지 않는다. 항상 `bg-primary`, `text-muted-foreground` 같은 역할 토큰을 쓴다.
- Do: warning은 "주의" 등급처럼 위험 직전의 경고 상태에만 쓴다. 중단·삭제·오류 같은 위험 상태에는 danger를 쓴다.
- Do: danger는 삭제·초기화·오류 같은 파괴적/위험 상황에만 쓴다. 대비는 WCAG AA(본문 4.5:1) 이상을 유지하고, 아이콘만 있는 버튼에는 `aria-label`을 단다.
- Do: 카드는 그림자 대신 1px `border` 테두리로 구분한다.
- Don't: 섹션 사이 간격을 `spacing.xl`(24px) 아래로 줄이지 않는다.
