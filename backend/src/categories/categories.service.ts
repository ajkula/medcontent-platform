import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { ChangeLogService } from '../changelog/changelog.service';
import { ChangeOperation } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private changeLogService: ChangeLogService,
  ) {}

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${id} non trouvée`);
    }

    return category;
  }

  async create(data: CreateCategoryInput, userId: string) {
    // Vérifier si une catégorie avec le même nom existe déjà
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new ConflictException(`Une catégorie avec le nom "${data.name}" existe déjà`);
    }

    // Utiliser une transaction pour garantir l'atomicité
    return this.prisma.$transaction(async (prisma) => {
      // 1. Créer la catégorie
      const category = await prisma.category.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });

      // 2. Enregistrer dans le journal des modifications
      await this.changeLogService.create({
        entityType: 'Category',
        entityId: category.id,
        operation: ChangeOperation.CREATE,
        changes: {
          name: category.name,
          description: category.description,
        },
        userId,
      });

      return category;
    });
  }

  async update(id: string, data: UpdateCategoryInput, userId: string) {
    // Vérifier si la catégorie existe
    await this.findById(id);

    // Vérifier si le nouveau nom est déjà utilisé
    if (data.name) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { name: data.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(`Une catégorie avec le nom "${data.name}" existe déjà`);
      }
    }

    // Utiliser une transaction pour garantir l'atomicité
    return this.prisma.$transaction(async (prisma) => {
      // 1. Mettre à jour la catégorie
      const updatedCategory = await prisma.category.update({
        where: { id },
        data,
      });

      // 2. Enregistrer dans le journal des modifications
      await this.changeLogService.create({
        entityType: 'Category',
        entityId: id,
        operation: ChangeOperation.UPDATE,
        changes: data,
        userId,
      });

      return updatedCategory;
    });
  }

  async delete(id: string, userId: string) {
    // Vérifier si la catégorie existe
    const category = await this.findById(id);

    // Utiliser une transaction pour garantir l'atomicité
    return this.prisma.$transaction(async (prisma) => {
      // 1. Supprimer les relations avec les articles
      await prisma.articleCategory.deleteMany({
        where: { categoryId: id },
      });

      // 2. Enregistrer dans le journal des modifications
      await this.changeLogService.create({
        entityType: 'Category',
        entityId: id,
        operation: ChangeOperation.DELETE,
        changes: {
          name: category.name,
          description: category.description,
        },
        userId,
      });

      // 3. Supprimer la catégorie
      return prisma.category.delete({
        where: { id },
      });
    });
  }

  async getArticlesByCategory(categoryId: string) {
    const category = await this.findById(categoryId);

    const articleCategories = await this.prisma.articleCategory.findMany({
      where: { categoryId },
      include: {
        article: {
          include: {
            author: true,
            currentVersion: {
              include: {
                createdBy: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return articleCategories.map((ac) => ac.article);
  }
}