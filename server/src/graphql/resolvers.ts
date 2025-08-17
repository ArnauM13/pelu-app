import { GraphQLScalarType, Kind } from 'graphql';
import { Reserve } from '../models/Reserve';
import { sendEmail } from '../services/email.service';
import { firebaseAuth } from '../firebase';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

function getTokenFromAuthHeader(req: Request): string | undefined {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.substring('Bearer '.length) : undefined;
}

export const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'ISO date scalar',
    parseValue(value: any) {
      return new Date(value);
    },
    serialize(value: any) {
      return new Date(value).toISOString();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    }
  }),
  Query: {
    async reserves(_: unknown, args: { limit?: number; cursor?: string }, { req }: { req: Request }) {
      const token = getTokenFromAuthHeader(req);
      if (!token) throw new Error('Unauthorized');
      const decoded = await firebaseAuth.verifyIdToken(token);
      const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
      const cursor = args.cursor;
      const query: any = { uid: decoded.uid };
      if (cursor) query.createdAt = { $lt: new Date(cursor) };
      return Reserve.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    },
    async reserva(_: unknown, { id }: { id: string }, { req }: { req: Request }) {
      const token = getTokenFromAuthHeader(req);
      if (!token) throw new Error('Unauthorized');
      const decoded = await firebaseAuth.verifyIdToken(token);
      return Reserve.findOne({ id, uid: decoded.uid }).lean();
    }
  },
  Mutation: {
    async createReserva(
      _: unknown,
      { input }: { input: { clientName: string; email: string; data: string; hora: string; notes?: string; serviceId: string; status?: string; id?: string } },
      { req }: { req: Request }
    ) {
      const token = getTokenFromAuthHeader(req);
      if (!token) throw new Error('Unauthorized');
      const decoded = await firebaseAuth.verifyIdToken(token);
      const payload = { uid: decoded.uid, ...input } as any;
      if (!payload.id) payload.id = uuidv4();
      const created = await Reserve.create(payload);
      return created;
    },
    async updateReserva(
      _: unknown,
      { id, input }: { id: string; input: Partial<{ clientName: string; email: string; data: string; hora: string; notes: string; serviceId: string; status: string }> },
      { req }: { req: Request }
    ) {
      const token = getTokenFromAuthHeader(req);
      if (!token) throw new Error('Unauthorized');
      const decoded = await firebaseAuth.verifyIdToken(token);
      const update: any = { ...input };
      const updated = await Reserve.findOneAndUpdate({ id, uid: decoded.uid }, update, { new: true });
      if (!updated) throw new Error('Not found');
      return updated;
    },
    async deleteReserva(_: unknown, { id }: { id: string }, { req }: { req: Request }) {
      const token = getTokenFromAuthHeader(req);
      if (!token) throw new Error('Unauthorized');
      const decoded = await firebaseAuth.verifyIdToken(token);
      const deleted = await Reserve.findOneAndDelete({ id, uid: decoded.uid });
      return !!deleted;
    },
    async sendEmail(_: unknown, { to, subject, text }: { to: string; subject: string; text: string }, { req }: { req: Request }) {
      const token = getTokenFromAuthHeader(req);
      if (!token) throw new Error('Unauthorized');
      await firebaseAuth.verifyIdToken(token);
      await sendEmail(to, subject, text);
      return true;
    }
  }
};


