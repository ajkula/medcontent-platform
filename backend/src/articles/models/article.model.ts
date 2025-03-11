import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { ArticleStatus } from '@prisma/client';
import { User } from '../../users/models/user.model';
import { ArticleVersion } from './article-version.model';
import { Category } from '../../categories/models/category.model';

// Enregistre l'énumération pour GraphQL
registerEnumType(ArticleStatus, {
  name: 'ArticleStatus',
  description: 'Statut d\'un article',
});

@ObjectType()
export class Article {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => ArticleStatus)
  status: ArticleStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field(() => User)
  author: User;

  @Field(() => ArticleVersion, { nullable: true })
  currentVersion?: ArticleVersion;

  @Field(() => [ArticleVersion])
  versions: ArticleVersion[];

  @Field(() => [Category])
  categories: Category[];
}