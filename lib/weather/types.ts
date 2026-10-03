/** 시간별 날씨·대기질 값. 풍속은 m/s, 온도는 ℃ 기준이다. */
export interface HourlyPoint {
  /** 해당 시각 (ISO 8601) */
  time: string;
  temperatureC: number;
  apparentTemperatureC: number;
  /** 강수확률(%) */
  precipitationProbability: number;
  /** 강수량(mm) */
  precipitationMm: number;
  windSpeedMs: number;
  /** UV 지수 (모델 추정치). 값이 없으면 null */
  uvIndex: number | null;
  /** PM2.5(㎍/㎥, 모델 추정치). 값이 없으면 null */
  pm25: number | null;
  /** PM10(㎍/㎥, 모델 추정치). 값이 없으면 null */
  pm10: number | null;
  isDaytime: boolean;
}

/** 공급자와 무관한 공통 날씨 응답. 화면 코드는 이 타입만 사용한다. */
export interface NormalizedWeather {
  /** 데이터 공급자 이름 (예: "open-meteo") */
  provider: string;
  /** 데이터를 받아 온 시각 (ISO 8601) */
  fetchedAt: string;
  /** 현재 시각부터의 시간별 값 */
  hourly: HourlyPoint[];
  dailyMaxC: number;
  dailyMinC: number;
  /** 오늘 일출 시각 (ISO 8601) */
  sunrise: string;
  /** 오늘 일몰 시각 (ISO 8601) */
  sunset: string;
  /** 다음 날 일출 시각 (ISO 8601). 12시간 안에 자정을 넘길 때 야간 판정에 쓴다. */
  nextSunrise: string;
}

/** 날씨 조회에 쓰는 좌표 */
export interface WeatherQuery {
  latitude: number;
  longitude: number;
}

/** 날씨 공급자 인터페이스. 구현체를 바꿔도 화면 코드는 수정하지 않는다. */
export interface WeatherProvider {
  /** 공급자 이름 */
  readonly name: string;
  /** 좌표 기준의 정규화된 날씨를 조회한다. */
  getWeather(query: WeatherQuery): Promise<NormalizedWeather>;
}
