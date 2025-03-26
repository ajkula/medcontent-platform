import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { LoginResponse } from './dto/login-response';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      const userExists = await this.usersService.findByEmail(email);

      if (userExists && (!userExists.passwordHash || !userExists.hasSetupPassword)) {
        throw new UnauthorizedException('Veuillez configurer votre mot de passe via le lien fourni par votre administrateur');
      }

      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    return user;
  }

  async login(user: User): Promise<LoginResponse> {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}