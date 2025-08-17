Backend (Express + Firebase Auth + MongoDB)

Requisits
- Node.js 18+
- MongoDB Atlas (o MongoDB compatible)
- Credencials de Firebase Admin (service account) o Application Default Credentials

Configuració
1. Crea un fitxer `.env` a `server/` seguint `.env.example`:
```
CORS_ORIGIN=http://localhost:4200
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# Opció A: Service account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

2. Instal·la deps i arrenca en local
```
cd server
npm i
npm run dev
```

Endpoints
- POST `/reserves`
- GET `/reserves`
- PUT `/reserves/:id`
- DELETE `/reserves/:id`

Cal Header `Authorization: Bearer <firebase-id-token>` en totes les rutes.

Desplegament
- Vercel: defineix `build` i `start` (servei tipus Serverless/Edge amb Node). Activa Node 18 i variables d'entorn a l'UI. Usa `vercel.json` si vols rutes serverless.
- Railway/Fly/Render: simplement `npm run start` amb les variables d'entorn.




