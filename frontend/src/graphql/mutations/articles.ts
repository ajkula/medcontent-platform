import { gql } from '@apollo/client';

export const CREATE_ARTICLE_MUTATION = gql`
  mutation CreateArticle($data: CreateArticleInput!) {
    createArticle(data: $data) {
      id
      title
      status
      createdAt
    }
  }
`;

export const UPDATE_ARTICLE_MUTATION = gql`
  mutation UpdateArticle($id: ID!, $data: UpdateArticleInput!) {
    updateArticle(id: $id, data: $data) {
      id
      title
      status
      updatedAt
    }
  }
`;

export const DELETE_ARTICLE_MUTATION = gql`
  mutation DeleteArticle($id: ID!, $reason: String) {
    deleteArticle(id: $id, reason: $reason) {
      id
      title
    }
  }
`;

export const RESTORE_ARTICLE_VERSION_MUTATION = gql`
  mutation RestoreArticleVersion($articleId: ID!, $versionId: ID!, $reason: String) {
    restoreArticleVersion(articleId: $articleId, versionId: $versionId, reason: $reason) {
      id
      title
      updatedAt
    }
  }
`;

export const ADD_ATTACHMENT_MUTATION = gql`
  mutation AddAttachment($data: AddAttachmentInput!) {
    addAttachment(data: $data) {
      id
      fileName
      url
    }
  }
`;

export const REMOVE_ATTACHMENT_QUERY = gql`
  mutation removeAttachment($id: ID!) {
    removeAttachment(id: $id)
  }
`;
