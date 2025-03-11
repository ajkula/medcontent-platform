import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ArticleStatus } from '@prisma/client';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class UpdateArticleInput {
  @Field({ nullable: true })
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsOptional()
  content?: string;

  @Field(() => ArticleStatus, { nullable: true })
  @IsOptional()
  status?: ArticleStatus;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  reason?: string;
}