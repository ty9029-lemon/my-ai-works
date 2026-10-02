import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 열린 상태로 고정해 스토리에서 바로 보이게 한다 */
export const Default: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>알림을 켤까요?</DialogTitle>
          <DialogDescription>러닝하기 좋은 시간대가 되면 알려드려요.</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>임계치 수정</DialogTitle>
          <DialogDescription>덥다고 느끼는 기온을 입력하세요.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="story-dialog-temp">기온 (°C)</Label>
          <Input id="story-dialog-temp" type="number" defaultValue="26" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button type="submit">저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** 닫기(X) 버튼이 없는 파괴적 확인 다이얼로그 */
export const NoCloseButton: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>설정을 초기화할까요?</DialogTitle>
          <DialogDescription>이 작업은 되돌릴 수 없어요.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <DialogClose render={<Button variant="destructive" />}>초기화</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** 트리거 버튼으로 여는 닫힌 상태 (render prop 사용) */
export const Closed: Story = {
  parameters: { layout: "centered" },
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>열기</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>제목</DialogTitle>
          <DialogDescription>트리거로 열린 다이얼로그예요.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
