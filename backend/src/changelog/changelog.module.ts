import { Module } from '@nestjs/common';
import { ChangeLogService } from './changelog.service';
import { ChangeLogResolver } from './changelog.resolver';

@Module({
  providers: [ChangeLogService, ChangeLogResolver],
  exports: [ChangeLogService],
})
export class ChangeLogModule {}