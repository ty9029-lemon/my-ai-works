import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTemperature } from "@/lib/format";
import { describeAdjustments } from "@/lib/outfit/describe";
import type { OutfitRecommendation } from "@/lib/outfit/types";
import { MODE_LABEL } from "@/lib/profile/labels";

interface OutfitCardProps {
  recommendation: OutfitRecommendation;
  className?: string;
}

/** 이름과 값을 한 줄로 보여 주는 항목. 값이 없으면 그리지 않는다. */
function Row({ term, value }: { term: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <dt className="w-14 shrink-0 text-muted-foreground">{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/**
 * 복장 추천 카드. 실제 체감온도와 보정 체감온도(러닝)를 함께 보여 주고,
 * 보정 내역과 상의·하의·레이어·액세서리·추가 문구를 나열한다.
 */
export function OutfitCard({ recommendation, className }: OutfitCardProps) {
  const { mode, apparentC, adjustedApparentC, adjustments, items } = recommendation;
  const adjustment = describeAdjustments(adjustments);
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{MODE_LABEL[mode]} 복장</CardTitle>
        <CardDescription className="font-mono tabular-nums">
          체감 {formatTemperature(apparentC)}
          {adjustment && ` → 보정 ${formatTemperature(adjustedApparentC)}`}
        </CardDescription>
        {adjustment && <p className="text-xs text-muted-foreground">{adjustment}</p>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="flex flex-col gap-2 text-sm">
          <Row term="상의" value={items.top} />
          <Row term="하의" value={items.bottom} />
          <Row term="레이어" value={items.layers} />
        </dl>
        {items.accessories.length > 0 && (
          <ul aria-label="액세서리" className="flex flex-wrap gap-1.5">
            {items.accessories.map((accessory) => (
              <li key={accessory}>
                <Badge variant="secondary">{accessory}</Badge>
              </li>
            ))}
          </ul>
        )}
        {items.extraNotes.length > 0 && (
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
            {items.extraNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
