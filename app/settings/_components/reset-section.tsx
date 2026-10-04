"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResetSectionProps {
  onConfirm: () => void;
}

/**
 * 데이터 초기화. 되돌릴 수 없으므로 확인 다이얼로그를 거친다.
 * 초기화는 파괴적 동작이라 danger 스타일을 쓴다(primary는 쓰지 않는다).
 */
export function ResetSection({ onConfirm }: ResetSectionProps) {
  return (
    <section aria-labelledby="settings-reset" className="flex flex-col gap-3">
      <h2 id="settings-reset" className="text-base font-medium">데이터</h2>
      <p className="text-sm text-muted-foreground">
        저장한 프로필, 기준 위치, 마지막 날씨 데이터를 모두 지우고 처음부터 다시 시작해요.
      </p>
      <Dialog>
        <DialogTrigger render={<Button variant="destructive" className="w-fit" />}>데이터 초기화</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>저장한 데이터를 모두 지울까요?</DialogTitle>
            <DialogDescription>
              프로필, 기준 위치, 저장된 날씨 데이터가 삭제되고 온보딩부터 다시 시작해요. 되돌릴 수 없어요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
            <Button variant="destructive" onClick={onConfirm}>초기화</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
