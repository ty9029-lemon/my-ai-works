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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "../_components/section";

/**
 * 기본 확인 다이얼로그 (닫기 버튼 포함)
 */
function BasicDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>기본</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>알림을 켤까요?</DialogTitle>
          <DialogDescription>
            러닝하기 좋은 시간대가 되면 알려드려요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

/**
 * 폼 다이얼로그 (인풋 + 취소/저장)
 */
function FormDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>폼</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>임계치 수정</DialogTitle>
          <DialogDescription>덥다고 느끼는 기온을 입력하세요.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ds-dialog-temp">기온 (°C)</Label>
          <Input id="ds-dialog-temp" type="number" defaultValue="26" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button type="submit">저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 닫기(X) 버튼이 없는 다이얼로그 (파괴적 확인용)
 */
function NoCloseButtonDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>
        파괴적 확인
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>설정을 초기화할까요?</DialogTitle>
          <DialogDescription>이 작업은 되돌릴 수 없어요.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <DialogClose render={<Button variant="destructive" />}>
            초기화
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Dialog: 기본 / 폼 / 닫기 버튼 없는 형태
 */
export function DialogSection() {
  return (
    <Section title="Dialog" description="버튼을 눌러 열어보세요">
      <div className="flex flex-wrap items-center gap-3">
        <BasicDialog />
        <FormDialog />
        <NoCloseButtonDialog />
      </div>
    </Section>
  );
}
