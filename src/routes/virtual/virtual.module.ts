import { Module } from '@nestjs/common';
import { VirtualService } from './virtual.service';
import { VirtualController } from './virtual.controller';

@Module({
  providers: [VirtualService],
  controllers: [VirtualController],
})
export class VirtualModule {}
