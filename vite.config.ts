import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/send-email')) {
          try {
            let bodyStr = '';
            req.on('data', (chunk) => {
              bodyStr += chunk;
            });
            req.on('end', async () => {
              try {
                // Dynamically import the handler to keep Vite bundle decoupled
                const { default: sendEmailHandler } = await import('./api/send-email');
                const parsedBody = bodyStr ? JSON.parse(bodyStr) : {};
                const customReq: any = {
                  method: req.method,
                  url: req.url,
                  headers: req.headers,
                  body: parsedBody,
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
                await sendEmailHandler(customReq, customRes);
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: e?.message }));
              }
            });
            return;
          } catch (err) {
            return next();
          }
        }
        next();
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
