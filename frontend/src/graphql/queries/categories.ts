import { gql } from '@apollo/client';

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      description
    }
  }
`;

export const CATEGORY_QUERY = gql`
  query Category($id: ID!) {
    category(id: $id) {
      id
      name
      description
      articles {
        id
        title
        status
        createdAt
      }
    }
  }
`;
