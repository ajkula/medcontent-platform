import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChangeLogService } from './changelog.service';
import { ChangeLog } from './models/changelog.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Resolver(() => ChangeLog)
export class ChangeLogResolver {
  constructor(private changeLogService: ChangeLogService) {}

  @Query(() => [ChangeLog])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async changeLogs(
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
    @Args('entityType', { nullable: true }) entityType?: string,
    @Args('userId', { nullable: true, type: () => ID }) userId?: string,
  ): Promise<ChangeLog[]> {
    return this.changeLogService.findAll(skip, take, entityType, userId);
  }

  @Query(() => [ChangeLog])
  @UseGuards(GqlAuthGuard)
  async entityChangeLogs(
    @Args('entityType') entityType: string,
    @Args('entityId', { type: () => ID }) entityId: string,
  ): Promise<ChangeLog[]> {
    return this.changeLogService.findByEntityId(entityType, entityId);
  }
}