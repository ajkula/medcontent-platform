import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @MinLength(6)
  @IsOptional()
  password?: string;

  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  role?: UserRole;
}