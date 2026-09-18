import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const urlPath = req.url.split('?')[0];
        let handlerModule: any = null;

        try {
          if (urlPath === '/api/cms') {
            handlerModule = await import('./api/cms');
          } else if (urlPath === '/api/registrations') {
            handlerModule = await import('./api/registrations');
          } else if (urlPath.startsWith('/api/send-email')) {
            handlerModule = await import('./api/send-email');
          }
        } catch (loadErr: any) {
          console.error('API Module Load Error:', loadErr);
          return next();
        }

        if (!handlerModule || !handlerModule.default) {
          return next();
        }

        try {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              let parsedBody: any = undefined;
              if (bodyStr) {
                try {
                  parsedBody = JSON.parse(bodyStr);
                } catch {
                  parsedBody = bodyStr;
                }
              }
              const urlObj = new URL(req.url || '', 'http://localhost');
              const customReq: any = {
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: parsedBody,
                query: Object.fromEntries(urlObj.searchParams.entries()),
              };
              const customRes: any = {
                setHeader: (k: string, v: string) => res.setHeader(k, v),
                status: (code: number) => {
                  res.statusCode = code;
                  return {
                    json: (data: any) => {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    },
                    end: () => res.end(),
                  };
                },
              };
              await handlerModule.default(customReq, customRes);
            } catch (e: any) {
              console.error('API execution error:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: e?.message }));
            }
          });
        } catch (err) {
          return next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
