import type { Metadata } from "next";

import { LocationScreen } from "./_components/location-screen";

export const metadata: Metadata = { title: "위치 바꾸기" };

/** 위치 검색: 주소·지명 검색, 현재 위치 다시 받기, 기본 위치 선택 */
export default function LocationPage() {
  return <LocationScreen />;
}
