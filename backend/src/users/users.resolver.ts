import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Prisma, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserCreationResponse } from './models/user-creation-response.model';
import { SetupPasswordInput } from './dto/setup-password.input';
import { LoginResponse } from './models/login-response.model';

@Resolver(() => User)
export class UsersResolver {
  constructor(private userService: UsersService) {}

  @Query(() => [User])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async users(
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
    @Args('searchTerm', { nullable: true }) searchTerm?: string,
    @Args('role', { nullable: true }) role?: UserRole,
  ): Promise<User[]> {
    const where: Prisma.UserWhereInput = {
      ...(searchTerm ? {
        OR: [
          { name: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
        ],
      } : {}),
      ...(role ? {role} : {}),
    }

    return this.userService.findAll(skip, take, where);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.userService.findById(user.id);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.userService.findById(id);
  }

  // valider un token
  @Query(() => Boolean)
  async validatePasswordToken(@Args('token') token: string): Promise<boolean> {
    return this.userService.validatePasswordToken(token);
  }

  // Query pour obtenir le lien de configuration pour un utilisateur spécifique
  @Query(() => String, { nullable: true })
  @UseGuards(GqlAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSetupLink(@Args('userId', { type: () => ID }) userId: string): Promise<string | null> {
    return this.userService.getSetupLinkForUser(userId);
  }

  // regenerer le token de configuration
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async regenerateSetupToken(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<string> {
    return this.userService.regenerateSetupToken(userId);
  }

  // Mutation pour config le password
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async setupPassword(@Args('data') data: SetupPasswordInput): Promise<LoginResponse> {
    return this.userService.setupPassword(data);
  }

  @Mutation(() => UserCreationResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Args('data') data: CreateUserInput): Promise<UserCreationResponse> {
    const result = await this.userService.create(data);
    return {
      user: result.user,
      setupLink: result.setupLink,
    };
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateUserInput,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // Only ADMIN can update other users
    if (id !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized user edition');
    }

    return this.userService.update(id, data);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.userService.delete(id);
  }
}