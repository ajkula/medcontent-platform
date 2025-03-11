import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Méthode d'aide pour nettoyer la base de données en test
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'production') {
      // Supprime les données dans l'ordre inverse des dépendances
      const models = Reflect.ownKeys(this).filter(
        (key) => key[0] !== '_' && key[0] !== '$',
      );
      
      await Promise.all(
        models.map((modelKey) => this[modelKey as string].deleteMany()),
      );
    }
  }
}