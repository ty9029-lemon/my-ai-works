# ROADMAP: 러닝·외출 복장 추천 날씨 웹앱 (MVP)

| 항목 | 내용 |
|---|---|
| 기준 문서 | `PRD-outfit-weather-mvp.md` (v0.2) |
| 작성일 | 2026-10-03 |
| 진행 방식 | 한 작업을 끝낼 때마다 체크하고, 작업 단위로 커밋합니다. |

## 원칙
- 기능·수용 기준·수치는 `PRD-outfit-weather-mvp.md`가 기준입니다. 이 문서는 **작업 순서와 진행 상태**만 관리하며, 기능을 새로 정의하지 않습니다.
- Next.js 16은 기존 지식과 다를 수 있으므로, 해당 작업 전에 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 읽습니다(`AGENTS.md`).
- 색상·간격은 `DESIGN.md` 토큰만 씁니다. 복장 구간·안전 기준 수치는 `lib/` 아래 상수 파일에만 두고 컴포넌트에 직접 쓰지 않습니다.
- PRD의 "(초안)"·"(확인 필요)" 수치는 4단계에서 검증합니다.

## 현재 상태
- 있음: Next.js 앱 뼈대(`app/`), 디자인 시스템 페이지(`app/design-system`), `components/ui`, `lib/utils.ts`, Storybook(`stories/`), `theme.css`
- 없음: 도메인 코드(`lib/weather`, `lib/outfit`, `lib/safety`), 서비스 화면, 테스트 실행 환경(`package.json`에 test 스크립트 없음)

## 0단계: 기반
- [x] Next.js 가이드 확인: 라우팅, 서버·클라이언트 컴포넌트, 외부 API 호출 방식, 환경변수 (`node_modules/next/dist/docs/`)
- [x] 테스트 환경 구성: Vitest 5.0.3, `npm run test` 추가 (`@types/node`를 24로 올림, jsdom은 3단계에서 추가)
- [x] 로깅: pino 10.4.0, `lib/logger.ts`
- [x] 상수 파일 작성(`lib/constants.ts`): 위치 타임아웃(`GEOLOCATION_TIMEOUT_MS`), 좌표 반올림 자릿수, 기본 위치(서울시청), 출발 시각 범위(12시간)
- [x] 도메인 타입 정의(`lib/*/types.ts`): `NormalizedWeather`, `HourlyPoint`, `WeatherProvider`, `UserProfile`, `SavedLocation`, `OutfitRecommendation`, `SafetyResult` (PRD 8번 필드 기준)

## 1단계: 데이터 (F001, F002, F003)
- [x] **F002** Open-Meteo 변수명·`wind_speed_unit` 공식 문서 재확인 후 Forecast·Air Quality 어댑터 작성, m/s 변환 테스트
- [x] **F002** 조회 실패 시 직전 데이터 + "N분 전 데이터", 직전 데이터도 없으면 "다시 시도" 상태 처리
- [x] **F001** Geolocation 로직(`lib/location/geolocation.ts`, 훅 `useCurrentPosition`): 버튼 클릭 시에만 요청, 에러 코드 1·2·3별 문구, Permissions API 미사용
- [x] **F001** 위치 대체 순서(마지막 저장 위치 → 주소 검색 → 서울시청), 반올림 좌표 저장, 구·동 단위 표시 규칙
- [x] **F001** 주소 검색: Kakao 로컬 → 0건·한국 밖은 Open-Meteo Geocoding (`/api/geocode`, `/api/reverse-geocode`). **Kakao 키 경로는 목 테스트만 통과, 실제 키로는 미검증.** 키 없이는 한국어 지명 검색 품질이 낮음("서울"·"마포구" 0건). Kakao 결과는 캐시·저장하지 않으며 약관 확인은 남음(PRD 미결 질문)
- [x] **F003** `localStorage` 기반 프로필·위치 저장(`lib/profile/storage.ts`)과 훅(`useProfile`, `useSavedLocation`, `useCurrentPosition`), 초기화 기능. 저장 로직은 단위 테스트, **훅은 lint·build만 통과하고 브라우저 동작은 3단계 화면에서 확인**

## 2단계: 규칙 (F004, F005)
- [x] **F004** `lib/outfit/rules.ts`: 러닝 8개 구간·외출 6개 구간 상수 테이블, 보정 함수, 상한 `MAX_ADJUSTMENT_C`
- [x] **F004** 추가 문구·아이템 규칙(러닝: 인터벌·비·눈·고온·야간·공통 팁, 외출: 우산·마스크·선크림·일교차)
- [x] **F004** 단위 테스트: 구간 경계값(4.9/5.0, -10.1/-10.0), 상한 ±7 주입 테스트, 보정 조합 9가지 고정
- [x] **F005** `lib/safety/` 안전 판정: 요소별 주의·중단 권고, 최고 등급 산출, 사유 목록, 빙판·야간 규칙
- [x] **F005** 질환 체크 시 미세먼지·폭염·한파 보수 판정, 단위 테스트(경계값 포함)

## 3단계: 화면 (PRD 7-2 순서)
- [x] 공통: 위치 라벨, 모델 추정치 라벨, 출처(Open-Meteo CC BY 4.0) 표시 컴포넌트 + Storybook 스토리
- [x] **온보딩** `/onboarding` (F001, F003): 질문 3개, 미선택 시 "시작하기" 비활성화, 위치 사용 버튼
- [ ] **홈** `/` (F001~F005): 안전 배너, 모드·강도·출발 시각 칩, 실제/보정 체감온도와 내역, 복장 카드, 12시간 미니 예보, 면책·특보 링크·낙뢰 문구
- [ ] **위치 검색** `/location` (F001): 주소 검색, 현재 위치 다시 받기, 기본 위치 선택
- [ ] **설정** `/settings` (F002, F003, F005): 프로필 수정, 질환 체크, 데이터 초기화, 출처·면책 안내
- [x] 스토리: 복장 카드 8개 구간, 안전 배너 3개 등급

## 4단계: 마무리
- [ ] 로딩·에러·직전 데이터 상태 UI, 다크 모드 확인
- [ ] 접근성 점검: 등급을 색상만으로 구분하지 않음, Storybook a11y 확인
- [ ] 모바일 실기기(iOS Safari, Android Chrome)에서 위치 권한 거부·복구 흐름 확인
- [ ] 출시 전 수치 검증: PRD의 "(확인 필요)" 항목(장거리 보정, 고온 31℃, PM2.5 56~75, Kakao 쿼터 등)을 공신력 있는 출처로 확인
- [ ] `npm run lint`, `npm run build`, `npm run test` 통과

## MVP 이후 (2단계 로드맵)
`PRD.md`의 아래 항목은 MVP 완료 후 별도 PRD로 정리합니다.
- [ ] 최적 러닝 시간대 추천·알림(PWA·Web Push)
- [ ] 야외작업 모드, 크루 일정 공유
- [ ] 에어코리아 실측 대기질, 기상청 폴백·특보 연동
- [ ] 작업 관리 도구(Task Manager/Shrimp 등) 도입 검토: 작업이 수십 개로 늘어나는 시점
