import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
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

  async create(data: {
    email: string;
    name: string;
    password: string;
    role?: UserRole;
  }): Promise<User> {
    // Verifier si user existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException(`User ${data.email} exists already`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: hashedPassword,
        role: data.role || UserRole.READER,
      },
    });
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
      const passwordValid = await bcrypt.compare(password, user.passwordHash);

      if (passwordValid) {
        return user;
      }

      return null;
    } catch (err) {
      return null;
    }
  }
}