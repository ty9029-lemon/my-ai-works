import type { Metadata } from "next";

import { OnboardingScreen } from "./_components/onboarding-screen";

export const metadata: Metadata = { title: "시작하기" };

/** 온보딩: 질문 3개로 프로필을 만들고 위치를 정한다. */
export default function OnboardingPage() {
  return <OnboardingScreen />;
}
