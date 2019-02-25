const schemaDefinition = `
  schema {
    query: Query
  }
  
  type Query {
    objectConnection(argument: String, before: String, after: String, first: Int, last: Int): ObjectConnection
  }

  type ObjectConnection {
    pageInfo: PageInfo!
    edges: [ObjectEdge]
  }

  type ObjectEdge {
    node: Object
    cursor: String!
  }

  type Object implements Node {
    property: String
    id: ID!
  }

  interface Node {
    id: ID!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;

import { mockServer, mockList, mockRelayConnection } from './mockServer';

async function getResult() {
  const mocks = {
    Query: {
      objectConnection: mockRelayConnection()
    },
    Object: {
      property: () => 'Object.property'
    },
    PageInfo: {
      hasNextPage: () => {},
      hasPreviousPage: () => {}
    },
    ObjectEdge: {
      cursor: () => 'ObjectEdge.cursor'
    }
  };

  const server = mockServer(schemaDefinition, mocks);
  const result = await server(
    `
    query test {
      objectConnection(last: 1, first: 3) {
        edges {
          node {
            property
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `,
    {},
    {
      objectConnection: {
        edges: [
          {
            node: {},
            cursor: ''
          }
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false
        }
      }
    }
  );

  console.log(JSON.stringify(result, null, 4));
}

getResult().catch(err => console.log(err));
