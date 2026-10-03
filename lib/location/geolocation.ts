import { GEOLOCATION_TIMEOUT_MS } from "@/lib/constants";

/** GeolocationPositionError 코드: 권한 거부 */
const CODE_PERMISSION_DENIED = 1;
/** GeolocationPositionError 코드: 시간 초과 */
const CODE_TIMEOUT = 3;

/** 위치 확인 실패 종류 */
export type GeolocationFailureKind =
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

/** 위치 확인 실패 정보. recoveryHint는 사용자가 직접 해결할 방법이다. */
export interface GeolocationFailure {
  kind: GeolocationFailureKind;
  message: string;
  recoveryHint?: string;
}

/** 위치 확인에 성공했을 때의 원본 좌표 (저장·전송 전에 반올림해야 한다) */
export interface RawPosition {
  latitude: number;
  longitude: number;
}

const IOS_RECOVERY_HINT =
  "iPhone은 설정 > 개인정보 보호 및 보안 > 위치 서비스 > Safari 웹사이트에서 '앱을 사용하는 동안'으로 바꾼 뒤 다시 시도해 주세요. (iOS 버전에 따라 경로가 다를 수 있어요.)";

const FAILURES: Record<GeolocationFailureKind, GeolocationFailure> = {
  denied: {
    kind: "denied",
    message: "위치 권한이 거부되었어요. 주소로 검색하거나 기본 위치(서울)를 사용할 수 있어요.",
    recoveryHint: IOS_RECOVERY_HINT,
  },
  unavailable: {
    kind: "unavailable",
    message: "현재 위치를 확인할 수 없어요. 잠시 후 다시 시도하거나 주소로 검색해 주세요.",
  },
  timeout: {
    kind: "timeout",
    message: "위치 확인 시간이 초과되었어요. 다시 시도하거나 주소로 검색해 주세요.",
  },
  unsupported: {
    kind: "unsupported",
    message: "이 브라우저는 위치 기능을 지원하지 않아요. 주소로 검색해 주세요.",
  },
};

/** Geolocation 에러 코드(1 권한 거부, 2 위치 불가, 3 시간 초과)를 실패 정보로 바꾼다. 2와 알 수 없는 코드는 unavailable이다. */
export function toGeolocationFailure(code: number): GeolocationFailure {
  if (code === CODE_PERMISSION_DENIED) return FAILURES.denied;
  if (code === CODE_TIMEOUT) return FAILURES.timeout;
  return FAILURES.unavailable;
}

/**
 * 현재 위치를 한 번 요청한다. 버튼 클릭 같은 사용자 동작에서만 호출한다.
 * Permissions API는 iOS Safari 대비를 위해 쓰지 않고, 에러 코드로만 분기한다.
 * 실패하면 GeolocationFailure로 reject한다.
 */
export function requestCurrentPosition(
  geolocation: Geolocation | undefined = typeof navigator === "undefined"
    ? undefined
    : navigator.geolocation,
): Promise<RawPosition> {
  return new Promise((resolve, reject) => {
    if (!geolocation) {
      reject(FAILURES.unsupported);
      return;
    }
    geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => reject(toGeolocationFailure(error.code)),
      { enableHighAccuracy: false, timeout: GEOLOCATION_TIMEOUT_MS },
    );
  });
}
