import { Logger } from '@nestjs/common';

export class CustomLogger extends Logger {
  error(message: string, trace: string) {
    super.error(message, trace);
    // 원하는 로그 형식에 따라 로그를 출력하도록 재정의
    console.log(
      `[Nest] ${
        process.pid
      } - ${new Date().toLocaleString()} ERROR: ${message}\n${trace}`,
    );
  }

  log(message: string) {
    super.log(message);
    // 원하는 로그 형식에 따라 로그를 출력하도록 재정의
    console.log(
      `[Nest] ${process.pid} - ${new Date().toLocaleString()} LOG: ${message}`,
    );
  }

  warn(message: string) {
    super.warn(message);
    // 원하는 로그 형식에 따라 로그를 출력하도록 재정의
    console.log(
      `[Nest] ${process.pid} - ${new Date().toLocaleString()} WARN: ${message}`,
    );
  }

  debug(message: string) {
    super.debug(message);
    // 원하는 로그 형식에 따라 로그를 출력하도록 재정의
    console.log(
      `[Nest] ${
        process.pid
      } - ${new Date().toLocaleString()} DEBUG: ${message}`,
    );
  }
}
