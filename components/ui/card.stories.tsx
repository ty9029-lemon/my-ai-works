import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./badge";
import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  args: { className: "w-80" },
  argTypes: { size: { control: "inline-radio", options: ["default", "sm"] } },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>지금 뛰기 좋아요</CardTitle>
        <CardDescription>기온 18°C · 미세먼지 좋음</CardDescription>
      </CardHeader>
      <CardContent>선선한 바람이 불어 가볍게 달리기 좋은 날씨예요.</CardContent>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { size: "default" } };
export const Small: Story = { args: { size: "sm" } };

/** CardAction 에 배지를 두는 헤더 */
export const WithAction: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>러닝 지수</CardTitle>
        <CardDescription>오늘 오후 6시</CardDescription>
        <CardAction>
          <Badge>추천</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>지수 79점으로 달리기에 적합해요.</CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>러닝 시간대에 맞춰 알려드려요.</CardDescription>
      </CardHeader>
      <CardContent>매일 오후 6시에 날씨를 확인해요.</CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">취소</Button>
        <Button>저장</Button>
      </CardFooter>
    </Card>
  ),
};
