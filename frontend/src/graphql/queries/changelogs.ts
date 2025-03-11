import { gql } from '@apollo/client';

export const ENTITY_CHANGELOGS_QUERY = gql`
  query EntityChangeLogs($entityId: ID!, $entityType: String!) {
    entityChangeLogs(entityId: $entityId, entityType: $entityType) {
      id
      entityType
      entityId
      operation
      changes
      reason
      createdAt
      user {
        id
        name
      }
    }
  }
`;

export const CHANGELOGS_QUERY = gql`
  query ChangeLogs($entityType: String, $userId: ID, $skip: Float, $take: Float) {
    changeLogs(entityType: $entityType, userId: $userId, skip: $skip, take: $take) {
      id
      entityType
      entityId
      operation
      changes
      reason
      createdAt
      user {
        id
        name
      }
    }
  }
`;
