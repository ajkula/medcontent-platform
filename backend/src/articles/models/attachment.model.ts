import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Attachment {
  @Field(() => ID)
  id: string;

  @Field()
  fileName: string;

  @Field()
  fileType: string;

  @Field()
  fileSize: number;

  @Field()
  url: string;

  @Field()
  uploadedAt: Date;

  @Field(() => User)
  uploadedBy: User;
}