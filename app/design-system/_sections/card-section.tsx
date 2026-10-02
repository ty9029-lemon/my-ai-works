import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Section } from "../_components/section";

const CARD_SIZES = ["default", "sm"] as const;

interface DemoCardProps {
  size: (typeof CARD_SIZES)[number];
  withFooter?: boolean;
}

/**
 * 카드 데모 (헤더 + 액션 + 본문 + 선택적 푸터)
 */
function DemoCard({ size, withFooter = false }: DemoCardProps) {
  return (
    <Card size={size}>
      <CardHeader>
        <CardTitle>오늘의 러닝 지수</CardTitle>
        <CardDescription>size: {size}</CardDescription>
        <CardAction>
          <Badge>좋음</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>퇴근 후 19시가 달리기 좋은 시간대예요.</CardContent>
      {withFooter && (
        <CardFooter className="gap-2">
          <Button size="sm">자세히</Button>
          <Button size="sm" variant="outline">
            닫기
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Card: 사이즈별, 푸터 유무별 표시
 */
export function CardSection() {
  return (
    <Section title="Card" description="사이즈(default/sm)와 푸터 유무">
      <div className="grid gap-4 md:grid-cols-2">
        {CARD_SIZES.map((size) => (
          <DemoCard key={size} size={size} />
        ))}
        {CARD_SIZES.map((size) => (
          <DemoCard key={`${size}-footer`} size={size} withFooter />
        ))}
      </div>
    </Section>
  );
}
