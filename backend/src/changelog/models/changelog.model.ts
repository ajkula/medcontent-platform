import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { ChangeOperation } from '@prisma/client';
import { User } from '../../users/models/user.model';
import { GraphQLJSON } from 'graphql-type-json';

// Enregistre l'énumération pour GraphQL
registerEnumType(ChangeOperation, {
  name: 'ChangeOperation',
  description: 'Types d\'opérations de modification',
});

@ObjectType()
export class ChangeLog {
  @Field(() => ID)
  id: string;

  @Field()
  entityType: string;

  @Field()
  entityId: string;

  @Field(() => ChangeOperation)
  operation: ChangeOperation;

  @Field(() => GraphQLJSON)
  changes: any;

  @Field({ nullable: true })
  reason: string;

  @Field()
  createdAt: Date;

  @Field(() => User)
  user: User;
}