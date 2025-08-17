"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const graphql_1 = require("graphql");
const Reserve_1 = require("../models/Reserve");
const email_service_1 = require("../services/email.service");
const firebase_1 = require("../firebase");
const uuid_1 = require("uuid");
function getTokenFromAuthHeader(req) {
    const authHeader = req.headers.authorization || '';
    return authHeader.startsWith('Bearer ') ? authHeader.substring('Bearer '.length) : undefined;
}
exports.resolvers = {
    Date: new graphql_1.GraphQLScalarType({
        name: 'Date',
        description: 'ISO date scalar',
        parseValue(value) {
            return new Date(value);
        },
        serialize(value) {
            return new Date(value).toISOString();
        },
        parseLiteral(ast) {
            if (ast.kind === graphql_1.Kind.STRING) {
                return new Date(ast.value);
            }
            return null;
        }
    }),
    Query: {
        async reserves(_, __, { req }) {
            const token = getTokenFromAuthHeader(req);
            if (!token)
                throw new Error('Unauthorized');
            const decoded = await firebase_1.firebaseAuth.verifyIdToken(token);
            return Reserve_1.Reserve.find({ uid: decoded.uid }).sort({ createdAt: -1 });
        }
    },
    Mutation: {
        async createReserva(_, { input }, { req }) {
            const token = getTokenFromAuthHeader(req);
            if (!token)
                throw new Error('Unauthorized');
            const decoded = await firebase_1.firebaseAuth.verifyIdToken(token);
            const payload = { uid: decoded.uid, ...input };
            if (!payload.id)
                payload.id = (0, uuid_1.v4)();
            const created = await Reserve_1.Reserve.create(payload);
            return created;
        },
        async updateReserva(_, { id, input }, { req }) {
            const token = getTokenFromAuthHeader(req);
            if (!token)
                throw new Error('Unauthorized');
            const decoded = await firebase_1.firebaseAuth.verifyIdToken(token);
            const update = { ...input };
            const updated = await Reserve_1.Reserve.findOneAndUpdate({ id, uid: decoded.uid }, update, { new: true });
            if (!updated)
                throw new Error('Not found');
            return updated;
        },
        async deleteReserva(_, { id }, { req }) {
            const token = getTokenFromAuthHeader(req);
            if (!token)
                throw new Error('Unauthorized');
            const decoded = await firebase_1.firebaseAuth.verifyIdToken(token);
            const deleted = await Reserve_1.Reserve.findOneAndDelete({ id, uid: decoded.uid });
            return !!deleted;
        },
        async sendEmail(_, { to, subject, text }, { req }) {
            const token = getTokenFromAuthHeader(req);
            if (!token)
                throw new Error('Unauthorized');
            await firebase_1.firebaseAuth.verifyIdToken(token);
            await (0, email_service_1.sendEmail)(to, subject, text);
            return true;
        }
    }
};
