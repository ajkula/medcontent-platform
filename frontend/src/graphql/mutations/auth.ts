import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($signupInput: CreateUserInput!) {
    signup(signupInput: $signupInput) {
      id
      name
      email
      role
      createdAt
    }
  }
`;
