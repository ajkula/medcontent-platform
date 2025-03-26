import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "./user.model";


@ObjectType()
export class UserCreationResponse {
  @Field(() => User)
  user: User;

  @Field({ nullable: true })
  setupLink?: string;
}
