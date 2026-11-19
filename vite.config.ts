import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function resolveApiKey(env?: Record<string, string>): string {
  let key =
    process.env.OPENROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY ||
    process.env.OPENROUTER_KEY ||
    env?.OPENROUTER_API_KEY ||
    env?.VITE_OPENROUTER_API_KEY ||
    env?.OPENROUTER_KEY ||
    '';

  // Fallback: directly parse .env or .env.local from disk to support hot edits
  if (!key) {
    const candidateFiles = ['.env', '.env.local'];
    for (const file of candidateFiles) {
      const fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split(/\r?\n/);
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) continue;
            const k = trimmed.slice(0, eqIndex).trim();
            if (
              k === 'OPENROUTER_API_KEY' ||
              k === 'VITE_OPENROUTER_API_KEY' ||
              k === 'OPENROUTER_KEY'
            ) {
              key = trimmed.slice(eqIndex + 1).trim();
              break;
            }
          }
        } catch {
          // ignore read error
        }
      }
      if (key) break;
    }
  }

  return key.trim().replace(/^['"]|['"]$/g, '');
}

function apiDevMiddleware(initialEnv: Record<string, string>, currentMode: string): Plugin {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/chat' && req.method === 'POST') {
          try {
            // Read incoming request body buffer
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const bodyStr = Buffer.concat(chunks).toString('utf-8');

            // Dynamically reload environment in case .env was modified while server was running
            const dynamicEnv = loadEnv(currentMode || 'development', process.cwd(), '');
            Object.assign(process.env, dynamicEnv);

            const resolvedKey = resolveApiKey({ ...initialEnv, ...dynamicEnv });
            if (resolvedKey) {
              process.env.OPENROUTER_API_KEY = resolvedKey;
            }

            // Load api/chat handler via Vite SSR runner
            const { default: handler } = await server.ssrLoadModule('./api/chat.ts');

            const host = req.headers.host || 'localhost:3000';
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const fullUrl = `${protocol}://${host}${req.url}`;

            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
              if (value) {
                headers.set(key, Array.isArray(value) ? value.join(', ') : value);
              }
            }

            const webReq = new Request(fullUrl, {
              method: 'POST',
              headers,
              body: bodyStr
            });

            const webRes: Response = await handler(webReq);

            res.statusCode = webRes.status;
            webRes.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });

            const resText = await webRes.text();
            res.end(resText);
            return;
          } catch (err: unknown) {
            console.error('Vite /api/chat middleware error:', err);
            const message = err instanceof Error ? err.message : 'Dev server error';
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'DEV_SERVER_ERROR', message }));
            return;
          }
        }

        if (req.url === '/api/chat' && req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end();
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  const resolvedKey = resolveApiKey(env);
  if (resolvedKey) {
    process.env.OPENROUTER_API_KEY = resolvedKey;
  }

  return {
    plugins: [react(), apiDevMiddleware(env, mode)],
    base: '/',
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      assetsDir: 'assets',
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) {
                return 'react-vendor';
              }
              if (id.includes('framer-motion')) {
                return 'animation-vendor';
              }
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              return 'vendor';
            }
          },
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || 'asset';
            let extType = name.split('.').at(1) || 'misc';
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'img';
            }
            return `assets/${extType}/[name]-[hash][extname]`;
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
