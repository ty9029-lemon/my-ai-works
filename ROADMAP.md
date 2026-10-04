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
- 함수 길이: 로직이 있는 함수는 30줄 이하로 유지합니다. 마크업(JSX)이 대부분이라 30줄을 넘는 컴포넌트 6개는 쪼개도 읽기 쉬워지지 않아 예외로 둡니다(`OutfitCard`, `SearchSection`, `HourlyForecast`, `OnboardingScreen`, `SettingsScreen`, `ConditionChips`). 새 컴포넌트가 이 목록에 없이 30줄을 넘으면 분리를 먼저 검토합니다.

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
- [x] **F001** 주소 검색: Kakao 로컬 → 0건·한국 밖은 Open-Meteo Geocoding (`/api/geocode`, `/api/reverse-geocode`). **Kakao 키 경로는 실제 키로 검증 완료(2026-10-04: 서울시청·합정동 주민센터·마포구 검색, 좌표→"서울특별시 마포구 합정동").** 카카오맵 사용 설정이 꺼져 있으면 403이므로 앱 설정에서 켜야 함. 키 없이는 한국어 지명 검색 품질이 낮음("서울"·"마포구" 0건). 한국 밖 지명(Open-Meteo, 한국 제외, 최대 3개)은 Kakao가 상호·시설만 찾았을 때(도쿄·파리 등) 맨 앞에, 주소·행정구역을 찾았을 때(대구·광주 등)는 Kakao 결과 뒤에 둠. Kakao 결과는 캐시·저장하지 않으며 약관 확인은 남음(PRD 미결 질문)
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
- [x] **홈** `/` (F001~F005): 안전 배너, 모드·강도·출발 시각 칩, 실제/보정 체감온도와 내역, 복장 카드, 12시간 미니 예보, 면책·특보 링크·낙뢰 문구
- [x] **위치 검색** `/location` (F001): 주소 검색, 현재 위치 다시 받기, 기본 위치 선택
- [x] **설정** `/settings` (F002, F003, F005): 프로필 수정, 질환 체크, 데이터 초기화, 출처·면책 안내
- [x] 스토리: 복장 카드 8개 구간, 안전 배너 3개 등급

> 3단계 메모: 실제 브라우저(Chrome, 모바일 폭)에서 온보딩 → 위치 권한 거부/허용 → 홈 → 칩 변경 → 위치 검색 → 설정 → 초기화 흐름을 확인했고 콘솔 오류는 없었음. 다크 모드는 홈 화면만 눈으로 확인했으므로 4단계에서 나머지 화면도 확인할 것. 미확인: 실기기 iOS Safari 권한 흐름. (Kakao 키 경로는 2026-10-04에 검증함.)

## 4단계: 마무리
- [x] 다크 모드: 홈·온보딩·위치·설정 4개 화면 라이트/다크 캡처 확인 (로딩·에러·직전 데이터 UI는 3단계 테스트로 검증)
- [x] 접근성 점검: axe-core(wcag2a/aa·best-practice)를 실제 Chrome 모바일 폭에서 4개 화면×라이트/다크로 실행해 위반 0건. 수정: 홈 h1 추가, 시간별 표 스크롤 영역 키보드 접근(`tabIndex`·region), `danger` 색을 어둡게(`oklch(0.505 0.213 27.518)`)해 AA 충족. 등급은 아이콘+문구로 구분. Storybook a11y 애드온 패널은 미실행
- [ ] 모바일 실기기(iOS Safari, Android Chrome)에서 위치 권한 거부·복구 흐름 확인 (사용자 직접). 체크: ① 홈 화면 "현재 위치 사용" → 권한 거부 → 안내 문구와 iOS 설정 경로 표시 ② 설정에서 권한 허용 후 재시도 → 위치 저장 ③ 주소 검색으로 대체 가능 ④ HTTPS 배포 주소에서 확인
- [x] 출시 전 수치 검증(2026-10-04, 서브에이전트 조사): 장거리 +1은 근거 없는 경험칙이라 유지하되 한파에서 키우지 않음, 31/35℃·PM2.5 단계는 기상청·에어코리아와 모순 없어 유지, Kakao 쿼터 일 100,000건 대체 확인. **남은 문제: Kakao 약관상 응답 데이터 저장 불가라 지역명 localStorage 저장이 회색지대 — 결정 필요**
- [ ] `npm run lint`, `npm run build`, `npm run test` 통과

## MVP 이후 (2단계 로드맵)
`PRD.md`의 아래 항목은 MVP 완료 후 별도 PRD로 정리합니다.
- [ ] 최적 러닝 시간대 추천·알림(PWA·Web Push)
- [ ] 야외작업 모드, 크루 일정 공유
- [ ] 에어코리아 실측 대기질, 기상청 폴백·특보 연동
- [ ] 작업 관리 도구(Task Manager/Shrimp 등) 도입 검토: 작업이 수십 개로 늘어나는 시점
