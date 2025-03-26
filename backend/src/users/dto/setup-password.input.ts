import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, MinLength } from "class-validator";


@InputType()
export class SetupPasswordInput {
  @Field()
  @IsNotEmpty({ message: 'Le token est requis' })
  token: string;

  @Field()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}