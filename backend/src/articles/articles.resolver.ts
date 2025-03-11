import { Resolver, Query, Mutation, Args, ID, Parent, ResolveField } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './models/article.model';
import { Category } from '../categories/models/category.model';
import { ArticleVersion } from './models/article-version.model';
import { CreateArticleInput } from './dto/create-article.input';
import { UpdateArticleInput } from './dto/update-article.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ArticleStatus, Prisma } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { AddAttachmentInput } from './dto/add-attachment.input';
import { Attachment } from './models/attachment.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => Article)
export class ArticlesResolver {
  constructor(
    private articlesService: ArticlesService,
    private prisma: PrismaService,
  ) { }

  @Query(() => [Article])
  async articles(
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
    @Args('searchTerm', { nullable: true }) searchTerm?: string,
    @Args('status', { nullable: true }) status?: ArticleStatus,
  ): Promise<any[]> {
    const where: Prisma.ArticleWhereInput = {
      ...(searchTerm ? {
        OR: [
          { title: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
          { currentVersion: { content: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } } },
        ],
      } : {}),
      ...(status ? { status } : {}),
    };

    return this.articlesService.findAll(skip, take, where);
  }

  @Query(() => Article)
  async article(@Args('id', { type: () => ID }) id: string): Promise<any> {
    return this.articlesService.findById(id);
  }

  @Mutation(() => Article)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async createArticle(
    @Args('data') data: CreateArticleInput,
    @CurrentUser() user: User,
  ): Promise<any> {
    return this.articlesService.create(data, user.id);
  }

  @Mutation(() => Article)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async updateArticle(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateArticleInput,
    @CurrentUser() user: User,
  ): Promise<any> {
    return this.articlesService.update(id, data, user.id);
  }

  @Mutation(() => Article)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteArticle(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { nullable: true }) reason: string | undefined,
    @CurrentUser() user: User,
  ): Promise<any> {
    return this.articlesService.delete(id, user.id, reason);
  }

  @Query(() => [ArticleVersion])
  async articleVersions(
    @Args('articleId', { type: () => ID }) articleId: string,
  ): Promise<any[]> {
    return this.articlesService.getArticleVersions(articleId);
  }

  @Mutation(() => Article)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async restoreArticleVersion(
    @Args('articleId', { type: () => ID }) articleId: string,
    @Args('versionId', { type: () => ID }) versionId: string,
    @CurrentUser() user: User,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<any> {
    return this.articlesService.restoreVersion(articleId, versionId, user.id, reason);
  }

  @Mutation(() => Attachment)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async addAttachment(
    @Args('data') data: AddAttachmentInput,
    @CurrentUser() user: User
  ) {
    return this.articlesService.addAttachment(
      data.articleVersionId,
      {
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        url: data.url,
      },
      user.id
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async removeAttachment(
    @Args('id') id: string,
    @CurrentUser() user: User
  ) {
    return this.articlesService.removeAttachment(id, user.id);
  }

  @Query(() => [Attachment])
  async articleVersionAttachments(
    @Args('articleVersionId') articleVersionId: string
  ) {
    return this.articlesService.getAttachments(articleVersionId);
  }

  @ResolveField('categories', returns => [Category])
  async getCategories(@Parent() article: any) {
    if (!article.id) {
      return [];
    }

    try {
      const articleWithCategories = await this.prisma.article.findUnique({
        where: { id: article.id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!articleWithCategories?.categories) return [];

      return articleWithCategories.categories
        .filter(ac => ac.category && ac.category.name)
        .map(ac => ac.category);
    } catch (error) {
      console.error(`Erreur lors de la récupération des catégories pour l'article ${article.id}:`, error);
      return []; // En cas d'erreur, retourner un tableau vide
    }
  }
}