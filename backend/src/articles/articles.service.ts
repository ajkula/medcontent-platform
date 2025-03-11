import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleStatus, ChangeOperation, Prisma } from '@prisma/client';
import { CreateArticleInput } from './dto/create-article.input';
import { UpdateArticleInput } from './dto/update-article.input';
import { ChangeLogService } from '../changelog/changelog.service';

@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private changeLogService: ChangeLogService,
  ) { }

  // Relations à inclure dans les req
  private readonly defaultIncludes = {
    author: true,
    currentVersion: {
      include: {
        createdBy: true,
        attachments: {
          include: {
            uploadedBy: true,
          },
        },
      },
    },
    versions: {
      include: {
        createdBy: true,
        attachments: {
          include: {
            uploadedBy: true,
          },
        },
      },
      orderBy: {
        versionNumber: Prisma.SortOrder.desc,
      },
    },
    categories: {
      include: {
        category: true,
      },
    },
  };

  async findAll(
    skip?: number,
    take?: number,
    where?: Prisma.ArticleWhereInput,
    orderBy?: Prisma.ArticleOrderByWithRelationInput,
  ) {
    return this.prisma.article.findMany({
      skip,
      take,
      where,
      orderBy,
      include: this.defaultIncludes,
    });
  }

  async findById(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: this.defaultIncludes,
    });

    if (!article) {
      throw new NotFoundException(`Article ID ${id} not found`);
    }

    return article;
  }

  async create(data: CreateArticleInput, userId: string) {
    // Utiliser transaction pour garantir l'atomicité
    return this.prisma.$transaction(async (prisma) => {
      // 1. créer l'article
      const article = await prisma.article.create({
        data: {
          title: data.title,
          status: data.status || ArticleStatus.DRAFT,
          author: {
            connect: { id: userId },
          }
        },
        include: { author: true },
      });

      // 2. créer la première version
      const articleVersion = await prisma.articleVersion.create({
        data: {
          versionNumber: 1,
          content: data.content,
          metadata: data.metadata || {},
          article: {
            connect: { id: article.id },
          },
          createdBy: {
            connect: { id: userId },
          },
          attachments: {
            create: [],
          },
        },
        include: {
          createdBy: true,
          attachments: true,
        }
      });

      // 3. Mettre à jour l'article avec la version courante
      await prisma.article.update({
        where: { id: article.id },
        data: {
          currentVersion: {
            connect: { id: articleVersion.id },
          },
        },
        include: this.defaultIncludes,
      });

      let categoryRelations = [];

      // 4. Ajouter les catégories si spécifiées
      if (data.categoryIds && data.categoryIds.length > 0) {
        const cp = data.categoryIds.map(async (categoryId) => {
          const relations = await prisma.articleCategory.create({
            data: {
              article: { connect: { id: article.id } },
              category: { connect: { id: categoryId } },
            }
          })
          return relations;
        });
        categoryRelations = await Promise.all(cp);
      }

      // 5. Enregistrer dans le journal des modifications
      await this.changeLogService.create({
        entityType: 'Article',
        entityId: article.id,
        operation: ChangeOperation.CREATE,
        changes: {
          title: article.title,
          content: data.content,
          metadata: data.metadata,
          categoryIds: data.categoryIds,
        },
        reason: data.reason || 'Création initiale',
        userId,
      });

      const updateArticle = {
        ...article,
        currentVersion: {
          ...articleVersion,
          attachments: articleVersion.attachments.map(a => ({
            ...a,
            uploadedBy: articleVersion.createdBy,
          }))
        },
        versions: [
          {
            ...articleVersion,
            attachments: articleVersion.attachments.map(a => ({
              ...a,
              uploadedBy: articleVersion.createdBy,
            }))
          }
        ],
        categories: categoryRelations.map(relation => ({
          ...relation,
          category: relation.category
        }))
      }

      return updateArticle;
    });
  }

  async update(id: string, data: UpdateArticleInput, userId: string) {
    // vérifier si l'article existe
    const article = await this.findById(id);

    // préparer les modifs pour l'audit
    const changes: Record<string, any> = {};
    let createNewVersion = false;

    // Si le contenu ou les métadonnées changent, créer une nouvelle version
    if (data.content !== undefined || data.metadata !== undefined) {
      createNewVersion = true;
      changes.content = data.content;
      changes.metadata = data.metadata;
    }

    // Si le titre change, mettre à jour uniquement le titre de l'article
    if (data.title !== undefined) {
      changes.title = data.title;
    }

    // Si le statut change, mettre à jour uniquement le statut
    if (data.status !== undefined) {
      changes.status = data.status;

      // Si l'article est publié, définir publishedAt
      if (data.status === ArticleStatus.PUBLISHED && !article.publishedAt) {
        changes.publishedAt = new Date();
      }
    }

    // Utiliser une transaction pour garantir l'atomicité
    return this.prisma.$transaction(async prisma => {
      let updatedArticle = article;

      // 1. Créer une nouvelle version si nécessaire
      if (createNewVersion) {
        const lastVersion = article.versions[0];
        const newVersionNumber = lastVersion.versionNumber + 1;

        const newVersion = await prisma.articleVersion.create({
          data: {
            versionNumber: newVersionNumber,
            content: data.content ?? lastVersion.content,
            metadata: data.metadata ?? lastVersion.metadata,
            article: {
              connect: { id: article.id },
            },
            createdBy: {
              connect: { id: userId },
            },
            attachments: {
              create: [],
            },
          },
        });

        // Récupérer les attachementsde la version précédente
        const previousAttachments = await prisma.attachment.findMany({
          where: { articleVersionId: lastVersion.id },
        });

        // Copier chaque attachement vers la nouvelle version
        if (previousAttachments.length > 0) {
          await Promise.all(
            previousAttachments.map(attachment =>
              prisma.attachment.create({
                data: {
                  fileName: attachment.fileName,
                  fileType: attachment.fileType,
                  fileSize: attachment.fileSize,
                  url: attachment.url,
                  articleVersion: { connect: { id: newVersion.id } },
                  uploadedBy: { connect: { id: attachment.uploadedById } },
                },
              })
            )
          )
        }

        // Mettre à jour l'article avec la nouvelle version courante
        updatedArticle = await prisma.article.update({
          where: { id: article.id },
          data: {
            currentVersion: {
              connect: { id: newVersion.id },
            },
            title: data.title,
            status: data.status,
            publishedAt: changes.publishedAt,
          },
          include: this.defaultIncludes,
        });
      } else {
        // Mettre à jour uniquement les métadonnées de l'article
        updatedArticle = await prisma.article.update({
          where: { id: article.id },
          data: {
            title: data.title,
            status: data.status,
            publishedAt: changes.publishedAt,
          },
          include: this.defaultIncludes,
        });
      }

      // 2. Mettre à jour les catégories si spécifiées
      if (data.categoryIds) {
        // supprimer les associations existantes
        await prisma.articleCategory.deleteMany({
          where: { articleId: article.id }
        });

        // Créer les nouvelles associations
        if (data.categoryIds.length > 0) {
          await Promise.all(
            data.categoryIds.map(categoryId =>
              prisma.articleCategory.create({
                data: {
                  article: { connect: { id: article.id } },
                  category: { connect: { id: categoryId } },
                },
              }),
            ),
          );
        }

        changes.categoryIds = data.categoryIds;
      }

      // 3. Enregistrer dans le journal des modifications
      await this.changeLogService.create({
        entityType: 'Article',
        entityId: article.id,
        operation: ChangeOperation.UPDATE,
        changes,
        reason: data.reason || 'Updated',
        userId,
      });

      return updatedArticle;
    });
  }

  async delete(id: string, userId: string, reason?: string) {
    // Vérifier si l'article existe
    const article = await this.findById(id);

    // Utiliser une transaction pour garantir l'atomicité
    return this.prisma.$transaction(async prisma => {
      // 1. Enregistrer dans le journal des modifications
      await this.changeLogService.create({
        entityType: 'Article',
        entityId: article.id,
        operation: ChangeOperation.DELETE,
        changes: {
          title: article.title,
          status: article.status,
        },
        reason: reason || 'Suppression',
        userId,
      });

      // 2. Supprimer l'article (cascade delete)
      const deletedArticle = await prisma.article.delete({
        where: { id: article.id },
        include: {
          author: true,
        },
      });

      return deletedArticle;
    });
  }

  async getArticleVersions(articleId: string) {
    const article = await this.findById(articleId);
    return article.versions;
  }

  async restoreVersion(articleId: string, versionId: string, userId: string, reason?: string) {
    // Vérifier si l'article existe
    const article = await this.findById(articleId);

    // Vérifier si la version existe
    const version = article.versions.find(v => v.id === versionId);
    if (!version) {
      throw new NotFoundException(`Version avec l'ID ${versionId} non trouvée`);
    }

    // Utiliser une transaction pour garantir l'atomicité
    return this.prisma.$transaction(async (prisma) => {
      // Mettre à jour l'article avec la version spécifiée comme version courante
      const updatedArticle = await prisma.article.update({
        where: { id: articleId },
        data: {
          currentVersionId: versionId,
        },
        include: this.defaultIncludes,
      });

      // Enregistrer dans le journal des modifications
      await this.changeLogService.create({
        entityType: 'Article',
        entityId: articleId,
        operation: ChangeOperation.UPDATE,
        changes: {
          restoredVersionId: versionId,
          restoredVersionNumber: version.versionNumber,
        },
        reason: reason || `Restauration à la version ${version.versionNumber}`,
        userId,
      });

      return updatedArticle;
    });
  }

  async addAttachment(
    articleVersionId: string,
    attachmentData: { fileName: string, fileType: string, fileSize: number, url: string },
    userId: string,
  ) {
    // Vérifiersi la version d'article existe
    const articleVersion = await this.prisma.articleVersion.findUnique({
      where: { id: articleVersionId },
      include: { article: true },
    });

    if (!articleVersion) {
      throw new NotFoundException(`Article ID ${articleVersionId} version not found`);
    }

    // Créer l'attachement
    const attachment = await this.prisma.attachment.create({
      data: {
        ...attachmentData,
        articleVersion: { connect: { id: articleVersionId } },
        uploadedBy: { connect: { id: userId } },
      },
    });

    // Enregistrer dans le journal des modifs
    await this.changeLogService.create({
      entityType: 'Attachment',
      entityId: attachment.id,
      operation: ChangeOperation.CREATE,
      changes: {
        fileName: attachmentData.fileName,
        articleVersionId,
      },
      reason: 'Pièce jointe ajoutée',
      userId,
    });

    return attachment;
  }

  async removeAttachment(attachementId: string, userId: string) {
    // Vérifier si l'attachement existe
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachementId },
      include: { articleVersion: true },
    });

    if (!attachment) {
      throw new NotFoundException(`AttachmentID ${attachementId} not found`);
    }

    // Enregistrer dans le journal des modifs
    await this.changeLogService.create({
      entityType: 'Attachment',
      entityId: attachementId,
      operation: ChangeOperation.DELETE,
      changes: {
        fileName: attachment.fileName,
        ArticleVersionId: attachment.articleVersionId,
      },
      reason: 'Pièce jointe supprimée',
      userId,
    });

    await this.prisma.attachment.delete({
      where: { id: attachementId },
    });

    return true;
  }

  async getAttachments(articleVersionId: string) {
    return this.prisma.attachment.findMany({
      where: { articleVersionId },
      include: { uploadedBy: true },
    });
  }
}