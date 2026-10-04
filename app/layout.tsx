import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

/** 고정폭 폰트 (코드 표시용) */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Figtree 웹폰트 스타일시트 (영문/숫자) */
const FIGTREE_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&display=swap";

/** Pretendard Variable 웹폰트 스타일시트 (한글) */
const PRETENDARD_STYLESHEET =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

/** 서비스명이 아직 정해지지 않아 기능을 설명하는 이름을 임시로 쓴다. */
const APP_TITLE = "러닝·외출 복장 추천";

export const metadata: Metadata = {
  title: { default: APP_TITLE, template: `%s | ${APP_TITLE}` },
  description: "현재 위치의 날씨에 내 체감과 운동 강도를 더해 러닝·외출 복장과 안전 경고를 알려 드려요.",
};

/**
 * 앱 전체 레이아웃. 폰트 스택(--font-sans)은 globals.css에서 정의한다.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans")}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={FIGTREE_STYLESHEET} />
        <link rel="stylesheet" href={PRETENDARD_STYLESHEET} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
