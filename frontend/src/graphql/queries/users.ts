import { gql } from '@apollo/client';

export const USERS_QUERY = gql`
  query Users{
    users {
      id
      email
      name
      role
      createdAt
      updatedAt
    }
  }
`;