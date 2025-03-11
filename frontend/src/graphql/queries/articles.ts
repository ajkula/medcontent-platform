import { gql } from '@apollo/client';

export const ARTICLES_QUERY = gql`
  query Articles($status: String, $searchTerm: String, $skip: Float, $take: Float) {
    articles(status: $status, searchTerm: $searchTerm, skip: $skip, take: $take) {
      id
      title
      status
      createdAt
      updatedAt
      publishedAt
      author {
        id
        name
      }
      categories {
        id
        name
      }
    }
  }
`;

export const ARTICLE_QUERY = gql`
  query Article($id: ID!) {
    article(id: $id) {
      id
      title
      status
      createdAt
      updatedAt
      publishedAt
      author {
        id
        name
      }
      categories {
        id
        name
      }
      currentVersion {
        id
        versionNumber
        content
        createdAt
        createdBy {
          id
          name
        }
        metadata
        attachments {
          id
          fileName
          fileType
          fileSize
          url
          uploadedAt
        }
      }
    }
  }
`;

export const ARTICLE_VERSIONS_QUERY = gql`
  query ArticleVersions($articleId: ID!) {
    articleVersions(articleId: $articleId) {
      id
      versionNumber
      content
      createdAt
      createdBy {
        id
        name
      }
      metadata
      attachments {
        id
        fileName
        fileType
        fileSize
        url
        uploadedAt
      }
    }
  }
`;

export const GET_ATTACHMENTS_QUERY = gql`
  query ArticleVersionAttachments($articleVersionId: ID!) {
    articleVersionAttachments(articleVersionId: $articleVersionId) {
      id
      fileName
      fileType
      fileSize
      url
      uploadedAt
      uploadedBy {
        id
        name
      }
    }
  }
`;
