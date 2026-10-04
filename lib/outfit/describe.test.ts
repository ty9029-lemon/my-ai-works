import { describe, expect, it } from "vitest";
import { calculateAdjustment } from "@/lib/outfit/adjust";
import { describeAdjustments } from "@/lib/outfit/describe";

describe("describeAdjustments", () => {
  it("민감도와 강도 보정을 부호와 함께 문장으로 만든다", () => {
    expect(describeAdjustments(calculateAdjustment("cold", "interval"))).toBe(
      "추위 -3, 인터벌 +4 (합계 +1℃)",
    );
    expect(describeAdjustments(calculateAdjustment("hot", "long"))).toBe(
      "더위 +3, 장거리 +1 (합계 +4℃)",
    );
  });

  it("보정이 모두 0이면 null이다", () => {
    expect(describeAdjustments(calculateAdjustment("normal", "jog"))).toBeNull();
    expect(
      describeAdjustments({ sensitivity: "cold", sensitivityC: 0, intensity: "interval", intensityC: 0, totalC: 0 }),
    ).toBeNull();
  });
});
