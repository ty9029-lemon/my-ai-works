import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  /** 제목 아래 설명 */
  description?: string;
  /** 있으면 제목 위에 "뒤로" 링크를 보여 준다 */
  backHref?: string;
}

/** 페이지 제목 영역. 제목은 화면의 최상위 제목(display 30px/700)이다. */
export function PageHeader({ title, description, backHref }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      {backHref && (
        <Link
          href={backHref}
          className="flex w-fit items-center gap-1 rounded-3xl py-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <ChevronLeft aria-hidden className="size-4" />
          홈으로
        </Link>
      )}
      <h1 className="text-3xl leading-tight font-bold">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </header>
  );
}
