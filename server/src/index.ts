import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { firebaseAuth } from './firebase';
import reservesRouter from './routes/reserves';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

dotenv.config();

const app: express.Application = express();

// Basic logger
app.use(morgan('dev'));

// Body parsing
app.use(express.json());

// CORS (restrict to Angular app URL if provided)
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: allowedOrigin !== '*'
  })
);

// Firebase initialized in firebase.ts

// Mongo connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error('MONGO_URI not set');
}

mongoose.set('strictQuery', true);
mongoose
  .connect(mongoUri)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

// Routes
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/reserves', reservesRouter);

// Apollo GraphQL
async function startApollo() {
  const server = new ApolloServer({ typeDefs, resolvers, context: ({ req }) => ({ req }) });
  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql', cors: false });
}

startApollo().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start Apollo Server', err);
  process.exit(1);
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});


