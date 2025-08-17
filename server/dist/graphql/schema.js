"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql) `
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
    reserves: [Reserva!]!
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
