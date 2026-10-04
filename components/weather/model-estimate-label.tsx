"use client";

import { Info } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { AIR_KOREA_URL } from "@/lib/links";
import { MODEL_ESTIMATE_GUIDE, MODEL_ESTIMATE_LABEL } from "@/lib/safety/copy";

/**
 * 미세먼지·UV 수치 옆에 붙이는 "모델 추정치" 라벨.
 * 누르면 실측값과 다를 수 있다는 안내와 에어코리아 링크를 보여 준다.
 */
export function ModelEstimateLabel() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="xs" />}>
        <Info data-icon="inline-start" aria-hidden />
        {MODEL_ESTIMATE_LABEL}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>모델 추정치예요</DialogTitle>
          <DialogDescription>{MODEL_ESTIMATE_GUIDE}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <a
            href={AIR_KOREA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "secondary" })}
          >
            에어코리아 열기
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
