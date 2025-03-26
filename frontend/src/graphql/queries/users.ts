import { gql } from '@apollo/client';

export const USERS_QUERY = gql`
  query Users($role: String, $searchTerm: String, $skip: Float, $take: Float) {
    users(role: $role, searchTerm: $searchTerm, skip: $skip, take: $take) {
      id
      email
      name
      role
      createdAt
      updatedAt
    }
  }
`;
