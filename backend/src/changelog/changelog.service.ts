import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChangeOperation } from '@prisma/client';

interface CreateChangeLogInput {
  entityType: string;
  entityId: string;
  operation: ChangeOperation;
  changes: any;
  reason?: string;
  userId: string;
}

@Injectable()
export class ChangeLogService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateChangeLogInput) {
    return this.prisma.changeLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        operation: data.operation,
        changes: data.changes,
        reason: data.reason,
        user: {
          connect: { id: data.userId },
        },
      },
      include: {
        user: true,
      },
    });
  }

  async findByEntityId(entityType: string, entityId: string) {
    return this.prisma.changeLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAll(
    skip?: number,
    take?: number,
    entityType?: string,
    userId?: string,
  ) {
    return this.prisma.changeLog.findMany({
      skip,
      take,
      where: {
        ...(entityType ? { entityType } : {}),
        ...(userId ? { userId } : {}),
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}