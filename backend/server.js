import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import 'dotenv/config';
import { db, initDb } from './db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import memberRoutes from './routes/members.js';
import workspaceRoutes from './routes/workspace.js';
import invitationRoutes from './routes/invitations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
// The hosted preview is served through one trusted reverse proxy. This lets rate limiting
// use the forwarded client address without treating the proxy header as a configuration error.
app.set('trust proxy', 1);

// CORS configuration - must come before other middleware.
// FRONTEND_URL accepts a comma-separated list so local and hosted preview origins
// can use credentialed requests without opening the API to arbitrary origins.
const allowedOrigins = new Set(
  (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const isHostedPreviewOrigin = (origin) =>
  /^https:\/\/[0-9]+-[a-z0-9-]+\.sg1\.manus\.computer$/i.test(origin || '');
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header (such as server-side health checks) are safe to permit.
    // The hosted development preview receives a unique HTTPS origin on each run.
    if (!origin || allowedOrigins.has(origin) || (process.env.NODE_ENV !== 'production' && isHostedPreviewOrigin(origin))) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: false,
  hsts: { maxAge: 31536000 },
}));

// Authentication throttling is deliberately limited to credential-changing endpoints.
// Session restoration (`/me`) is called on page load and must never consume a sign-in attempt.
// The temporary development preview is exempt so a shared preview IP cannot lock out all testers.
const isProduction = process.env.NODE_ENV === 'production';
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => !isProduction,
  message: { error: 'Too many sign-in attempts. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

await initDb();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth/login', credentialLimiter);
app.use('/api/auth/register', credentialLimiter);
app.use('/api/', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/invitations', invitationRoutes);

// ponytail: optional static serve for a built frontend in the same deploy.
const dist = path.join(__dirname, '..', 'frontend', 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => console.log(`PM backend listening on http://localhost:${PORT}`));

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
