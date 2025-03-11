import { InputType, Field } from '@nestjs/graphql';
import { ArticleStatus } from '@prisma/client';
import { IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateArticleInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  content: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @Field(() => ArticleStatus, { nullable: true, defaultValue: ArticleStatus.DRAFT })
  status?: ArticleStatus;

  @Field({ nullable: true })
  @IsOptional()
  reason?: string;
}