import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesResolver } from './articles.resolver';
import { ChangeLogModule } from '../changelog/changelog.module';

@Module({
  imports: [ChangeLogModule],
  providers: [ArticlesResolver, ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}