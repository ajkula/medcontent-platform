import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './models/category.model';
import { Article } from '../articles/models/article.model';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private categoriesService: CategoriesService) {}

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => Category)
  async category(@Args('id', { type: () => ID }) id: string): Promise<Category> {
    return this.categoriesService.findById(id);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async createCategory(
    @Args('data') data: CreateCategoryInput,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return this.categoriesService.create(data, user.id);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateCategoryInput,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return this.categoriesService.update(id, data, user.id);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return this.categoriesService.delete(id, user.id);
  }

  @ResolveField(() => [Article])
  async articles(@Parent() category: Category): Promise<any> {
    return this.categoriesService.getArticlesByCategory(category.id);
  }
}