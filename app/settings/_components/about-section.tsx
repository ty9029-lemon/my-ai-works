import { DataSourceNote } from "@/components/weather/data-source-note";
import { AIR_KOREA_URL, KMA_WARNING_URL } from "@/lib/links";
import {
  FEELS_LIKE_NOTE,
  GENERAL_DISCLAIMER,
  LIGHTNING_NOTICE,
  MEDICAL_DISCLAIMER,
  MODEL_ESTIMATE_GUIDE,
  MODEL_ESTIMATE_LABEL,
} from "@/lib/safety/copy";

const LINK_CLASS = "font-medium text-foreground underline underline-offset-4";

/** 데이터 출처, 모델 추정치 설명, 면책 문구 전문을 모아 보여 준다. */
export function AboutSection() {
  return (
    <section aria-labelledby="settings-about" className="flex flex-col gap-4">
      <h2 id="settings-about" className="text-base font-medium">출처와 안내</h2>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <DataSourceNote />
        <p>
          <span className="font-medium text-foreground">{MODEL_ESTIMATE_LABEL}:</span> 미세먼지와 UV 수치는
          기상 모델이 계산한 값이에요. {MODEL_ESTIMATE_GUIDE}{" "}
          <a href={AIR_KOREA_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            에어코리아
          </a>
        </p>
        <p>{FEELS_LIKE_NOTE}</p>
      </div>
      <div className="flex flex-col gap-2 rounded-4xl border border-border p-4 text-sm">
        <p>{MEDICAL_DISCLAIMER}</p>
        <p className="text-muted-foreground">{GENERAL_DISCLAIMER}</p>
        <p className="text-muted-foreground">{LIGHTNING_NOTICE}</p>
        <a href={KMA_WARNING_URL} target="_blank" rel="noopener noreferrer" className={`w-fit ${LINK_CLASS}`}>
          기상특보 확인 (기상청)
        </a>
      </div>
    </section>
  );
}
