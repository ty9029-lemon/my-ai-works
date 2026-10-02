import type { ReactNode } from "react";

interface SectionProps {
  /** 섹션 제목 */
  title: string;
  /** 섹션 설명 */
  description?: string;
  children: ReactNode;
}

/**
 * 디자인 시스템 페이지의 섹션 래퍼 (제목 + 설명 + 본문)
 */
export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}

interface SubLabelProps {
  children: ReactNode;
}

/**
 * 섹션 안의 소제목 (variant/상태 구분용 라벨)
 */
export function SubLabel({ children }: SubLabelProps) {
  return (
    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  );
}
