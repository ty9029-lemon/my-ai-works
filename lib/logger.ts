import pino from "pino";

/** 개발 환경에서는 debug, 그 외에는 info 이상만 기록한다. */
const LOG_LEVEL = process.env.NODE_ENV === "development" ? "debug" : "info";

/**
 * 앱 전역 로거. 서버(Node)와 브라우저 양쪽에서 동작하며,
 * `console.log` 대신 이 로거를 사용한다.
 */
export const logger = pino({
  level: LOG_LEVEL,
  browser: { asObject: true },
});
