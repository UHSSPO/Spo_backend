import { Module } from '@nestjs/common';
import { CustomLogger } from './customLoggger';

@Module({
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class CustomLoggerModule {}
