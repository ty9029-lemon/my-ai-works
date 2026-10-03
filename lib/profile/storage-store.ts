import { getBrowserStorage, readRawItem } from "@/lib/profile/storage";

/** 같은 탭에서 저장소가 바뀌었음을 알릴 구독자들 (storage 이벤트는 다른 탭에서만 발생한다) */
const listeners = new Set<() => void>();

/** useSyncExternalStore용 구독 함수. 같은 탭과 다른 탭의 변경을 모두 알린다. */
export function subscribeToStorage(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

/** 같은 탭의 구독자에게 저장소 변경을 알린다. 저장·삭제 직후에 호출한다. */
export function notifyStorageChange(): void {
  listeners.forEach((listener) => listener());
}

/** 클라이언트에서 원본 문자열을 읽는다. 저장소를 쓸 수 없으면 null이다. */
export function readRawSnapshot(key: string): string | null {
  const storage = getBrowserStorage();
  return storage ? readRawItem(storage, key) : null;
}
