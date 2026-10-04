import type { Metadata } from "next";

import { SettingsScreen } from "./_components/settings-screen";

export const metadata: Metadata = { title: "설정" };

/** 설정: 프로필 수정, 질환 체크, 데이터 초기화, 출처·면책 안내 */
export default function SettingsPage() {
  return <SettingsScreen />;
}
