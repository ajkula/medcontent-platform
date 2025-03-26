import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      createdAt
      updatedAt
    }
  }
`;

export const VALIDATE_PASSWORD_TOKEN = gql`
  query ValidatePasswordToken($token: String!) {
    validatePasswordToken(token: $token)
  }
`;