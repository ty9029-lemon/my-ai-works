import { ArrowRightIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Section, SubLabel } from "../_components/section";

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const;

const ICON_BUTTON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

/**
 * Button: variant × 상태(기본/비활성/아이콘/로딩), 사이즈별 표시
 */
export function ButtonSection() {
  return (
    <Section title="Button" description="variant별 기본·비활성·아이콘·로딩 상태">
      <div className="flex flex-col gap-4">
        {BUTTON_VARIANTS.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-3">
            <span className="w-24 text-sm text-muted-foreground">{variant}</span>
            <Button variant={variant}>기본</Button>
            <Button variant={variant} disabled>
              비활성
            </Button>
            <Button variant={variant}>
              아이콘
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button variant={variant} disabled>
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
              로딩
            </Button>
          </div>
        ))}
      </div>
      <SubLabel>Size</SubLabel>
      <div className="flex flex-wrap items-center gap-3">
        {BUTTON_SIZES.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
        {ICON_BUTTON_SIZES.map((size) => (
          <Button key={size} size={size} variant="outline" aria-label={size}>
            <ArrowRightIcon />
          </Button>
        ))}
      </div>
    </Section>
  );
}
