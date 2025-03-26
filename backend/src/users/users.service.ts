import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SetupPasswordInput } from './dto/setup-password.input';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async findAll(
    skip?: number,
    take?: number,
    where?: Prisma.UserWhereInput,
    orderBy?: Prisma.UserOrderByWithRelationInput,
  ): Promise<User[]> {
    return await this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User email ${email} not found`);
    }

    return user;
  }

  async findByName(name: string): Promise<User[]> {
    const users = this.prisma.user.findMany({
      where: { name: { contains: name } },
    })

    if (!users) {
      throw new NotFoundException(`User ${name} was not found`);
    }

    return users;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const users = this.prisma.user.findMany({
      where: { role },
    })

    if (!users) {
      throw new NotFoundException(`User ${role} was not found`);
    }

    return users;
  }

  async create(data: {
    email: string;
    name: string;
    password?: string;
    role?: UserRole;
  }): Promise<{ user: User; setupLink?: string }> {
    // Verifier si user existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException(`User ${data.email} exists already`);
    }

    let passwordHash = null;
    let hasSetupPassword = false;
    let setupLink = null;

    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
      hasSetupPassword = true;
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        hasSetupPassword,
        role: data.role || UserRole.READER,
      },
    });

    // lien si pas de password
    if (!data.password) {
      const token = await this.generatePasswordSetupToken(user.id);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      setupLink = `${frontendUrl}/auth/setup-password?token=${token}`;
    }

    return {
      user,
      setupLink,
    };
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    await await this.findById(id);

    if (typeof data.passwordHash === 'string') {
      data.passwordHash = await bcrypt.hash(data.passwordHash as string, 10);
    }

    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    await this.findById(id);

    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.findByEmail(email);

      // check si l'user a configuré son password
      if (!user.hasSetupPassword || !user.passwordHash) {
        return null; // gestion speciale dans le service d'auth
      }

      const passwordValid = await bcrypt.compare(password, user.passwordHash);

      if (passwordValid) {
        return user;
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  async generatePasswordSetupToken(userId: string): Promise<string> {
    // verifier si l'user existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // supprimer tout token existant
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId },
    });

    //créer un nouveau token
    const token = uuidv4();
    const expiresAt = add(new Date(), { hours: 72 });

    // enregistrer le token
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId,
      },
    });

    return token;
  }

  async getSetupLinkForUser(userId: string): Promise<string | null> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { userId },
    });

    if (!resetToken || new Date() > resetToken.expiresAt) {
      return null;
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return `${frontendUrl}/auth/setup-password?token=${resetToken.token}`;
  }

  async validatePasswordToken(token: string): Promise<boolean> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return false;
    }

    if (new Date() > resetToken.expiresAt) {
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return false;
    }

    return true;
  }

  async setupPassword(data: SetupPasswordInput): Promise<{ accessToken: string, user: User }> {
    const { token, password } = data;

    // recup le token
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new NotFoundException('Token invalide ou expiré');
    }

    // check si token expiré
    if (new Date() > resetToken.expiresAt) {
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      throw new NotFoundException('Token expiré');
    }

    // Hash le nouveau password
    const passwordHash = await bcrypt.hash(password, 10);

    // update le nouveau password
    const user = await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        hasSetupPassword: true,
        updatedAt: new Date()
      },
    });

    // supprimer le token
    await this.prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // generer un JWT pour la redirection
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async regenerateSetupToken(userId: string): Promise<string> {
    const token = await this.generatePasswordSetupToken(userId);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return `${frontendUrl}/auth/setup-password?token=${token}`;
  }
}
