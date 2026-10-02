import type { Metadata } from "next";

import { BadgeSection } from "./_sections/badge-section";
import { ButtonSection } from "./_sections/button-section";
import { CardSection } from "./_sections/card-section";
import { ChartSection } from "./_sections/chart-section";
import { DialogSection } from "./_sections/dialog-section";
import { InputSection } from "./_sections/input-section";
import { TypographySection } from "./_sections/typography-section";

export const metadata: Metadata = {
  title: "Design System",
  description: "shadcn/ui 컴포넌트 variant·상태 모음",
};

/**
 * 디자인 시스템 페이지: 추가한 shadcn/ui 컴포넌트를 한 화면에 모아 보여준다.
 */
export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10">
      <h1 className="font-heading text-3xl font-bold">Design System</h1>
      <TypographySection />
      <ButtonSection />
      <InputSection />
      <BadgeSection />
      <CardSection />
      <DialogSection />
      <ChartSection />
    </main>
  );
}
