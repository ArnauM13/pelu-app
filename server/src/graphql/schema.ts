import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date

  type Reserva {
    id: ID!            # business id (UUID)
    uid: String!       # Firebase user id
    clientName: String!
    email: String!
    data: String!
    hora: String!
    notes: String
    serviceId: String!
    status: String!
    createdAt: Date!
  }

  type Query {
    reserves(limit: Int, cursor: String): [Reserva!]!
    reserva(id: ID!): Reserva
  }

  input ReservaInput {
    clientName: String!
    email: String!
    data: String!
    hora: String!
    notes: String
    serviceId: String!
    status: String
    id: String
  }

  input ReservaUpdateInput {
    clientName: String
    email: String
    data: String
    hora: String
    notes: String
    serviceId: String
    status: String
  }

  type Mutation {
    createReserva(input: ReservaInput!): Reserva!
    updateReserva(id: ID!, input: ReservaUpdateInput!): Reserva!
    deleteReserva(id: ID!): Boolean!
    sendEmail(to: String!, subject: String!, text: String!): Boolean!
  }
`;


