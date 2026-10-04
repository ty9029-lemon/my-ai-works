import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 페이지 공통 컨테이너. DESIGN.md Layout 규칙: 가운데 정렬된 max-w-5xl, 좌우 16px 여백,
 * 섹션 간격은 모바일 24px 이상, 넓은 화면 48px.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:gap-12 md:py-12",
        className,
      )}
    >
      {children}
    </main>
  );
}
