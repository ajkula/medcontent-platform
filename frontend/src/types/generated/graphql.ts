export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  REVIEWER = 'REVIEWER',
  READER = 'READER'
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum ChangeOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: string;
  title: string;
  status: ArticleStatus;
  author: User;
  categories: Category[];
  currentVersion?: ArticleVersion;
  versions: ArticleVersion[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ArticleVersion {
  id: string;
  versionNumber: number;
  content: string;
  createdBy: User;
  createdAt: Date;
  attachments?: Attachment[];
  metadata?: any;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: User;
  uploadedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  articles: Article[];
}

export interface ChangeLog {
  id: string;
  entityType: string;
  entityId: string;
  operation: ChangeOperation;
  changes: any;
  reason?: string;
  user: User;
  createdAt: Date;
}

// Inputs pour les mutations
export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  categoryIds?: string[];
  metadata?: any;
  reason?: string;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  categoryIds?: string[];
  status?: ArticleStatus;
  metadata?: any;
  reason?: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}