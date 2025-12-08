import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// 파일 기반 저장 플러그인
function filePersistencePlugin(env: Record<string, string>): Plugin {
  const dataFilePath = path.resolve(__dirname, 'public', 'data', 'project-data.json');
  const portfolioFilePath = path.resolve(__dirname, 'public', 'data', 'portfolio-data.json');

  return {
    name: 'file-persistence',
    configureServer(server) {
      // 데이터 로드 API
      server.middlewares.use('/api/load-data', (req, res) => {
        if (req.method === 'GET') {
          try {
            if (fs.existsSync(dataFilePath)) {
              const data = fs.readFileSync(dataFilePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.end('{}');
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to load data' }));
          }
        }
      });

      // 포트폴리오 데이터 로드 API
      server.middlewares.use('/api/load-portfolio', (req, res) => {
        if (req.method === 'GET') {
          try {
            if (fs.existsSync(portfolioFilePath)) {
              const data = fs.readFileSync(portfolioFilePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.end('[]');
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to load portfolio data' }));
          }
        }
      });

      // 데이터 저장 API
      server.middlewares.use('/api/save-data', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              // data 디렉토리 확인 및 생성
              const dataDir = path.dirname(dataFilePath);
              if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
              }

              // JSON 유효성 검사
              JSON.parse(body);

              fs.writeFileSync(dataFilePath, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
              console.log('💾 Project data saved to file');
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to save data' }));
            }
          });
        }
      });

      // 포트폴리오 데이터 저장 API
      server.middlewares.use('/api/save-portfolio', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const dataDir = path.dirname(portfolioFilePath);
              if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
              }
              JSON.parse(body); // Validate JSON
              fs.writeFileSync(portfolioFilePath, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
              console.log('💾 Portfolio data saved to file');
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to save portfolio data' }));
            }
          });
        }
      });

      // 파일 업로드 API (개발환경에서 Vercel Blob으로 직접 업로드)
      server.middlewares.use('/api/upload', async (req, res) => {
        if (req.method === 'POST') {
          // Parse query string manually for incoming message
          const url = new URL(req.url!, `http://${req.headers.host}`);
          const filename = url.searchParams.get('filename') || 'uploaded-file';

          try {
            // Use dynamic import for @vercel/blob
            const { put } = await import('@vercel/blob');

            // Stream request directly to blob
            const blob = await put(filename, req, {
              access: 'public',
              token: env.BLOB_READ_WRITE_TOKEN,
              addRandomSuffix: true,
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: blob.url }));
            console.log('📤 [Dev] Uploaded:', blob.url);
          } catch (e) {
            console.error('❌ [Dev] Upload error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Upload failed', details: String(e) }));
          }
        } else {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), filePersistencePlugin(env)],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
