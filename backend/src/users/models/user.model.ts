import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

// Enregistre l'énumération pour GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Rôles disponibles pour les utilisateurs',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  hasSetupPassword: boolean;

  // Ne pas exposer le hash du mot de passe via GraphQL
}