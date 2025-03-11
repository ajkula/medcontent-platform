import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response';
import { LoginInput } from './dto/login.input';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { CreateUserInput } from '../users/dto/create-user.input';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      loginInput.email,
      loginInput.password,
    );
    return this.authService.login(user);
  }

  @Mutation(() => User)
  async signup(@Args('signupInput') signupInput: CreateUserInput): Promise<User> {
    return this.usersService.create(signupInput);
  }
}