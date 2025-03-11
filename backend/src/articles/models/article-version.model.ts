import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { GraphQLJSON } from 'graphql-type-json';
import { Attachment } from './attachment.model';

@ObjectType()
export class ArticleVersion {
  @Field(() => ID)
  id: string;

  @Field()
  versionNumber: number;

  @Field()
  content: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field()
  createdAt: Date;

  @Field(() => User)
  createdBy: User;

  @Field(() => [Attachment!], { description: 'Pièces jointes associées à cette version' })
  attachments: Attachment[];
}