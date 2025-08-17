"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const reserves_1 = __importDefault(require("./routes/reserves"));
const apollo_server_express_1 = require("apollo-server-express");
const schema_1 = require("./graphql/schema");
const resolvers_1 = require("./graphql/resolvers");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Basic logger
app.use((0, morgan_1.default)('dev'));
// Body parsing
app.use(express_1.default.json());
// CORS (restrict to Angular app URL if provided)
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use((0, cors_1.default)({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: allowedOrigin !== '*'
}));
// Firebase initialized in firebase.ts
// Mongo connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    throw new Error('MONGO_URI not set');
}
mongoose_1.default.set('strictQuery', true);
mongoose_1.default
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
app.use('/reserves', reserves_1.default);
// Apollo GraphQL
async function startApollo() {
    const server = new apollo_server_express_1.ApolloServer({ typeDefs: schema_1.typeDefs, resolvers: resolvers_1.resolvers, context: ({ req }) => ({ req }) });
    await server.start();
    server.applyMiddleware({ app: app, path: '/graphql', cors: false });
}
startApollo().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start Apollo Server', err);
    process.exit(1);
});
// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled error', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
});
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
});
