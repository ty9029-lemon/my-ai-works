import { CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Section, SubLabel } from "../_components/section";

const BADGE_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

/**
 * Badge: variant별, 아이콘 포함, 링크(render) 형태
 */
export function BadgeSection() {
  return (
    <Section title="Badge" description="variant별 표시">
      <div className="flex flex-wrap items-center gap-3">
        {BADGE_VARIANTS.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>
      <SubLabel>With icon / as link</SubLabel>
      <div className="flex flex-wrap items-center gap-3">
        <Badge>
          <CheckIcon data-icon="inline-start" />
          좋음
        </Badge>
        <Badge variant="outline" render={<a href="#badge" />}>
          링크 배지
        </Badge>
      </div>
    </Section>
  );
}
