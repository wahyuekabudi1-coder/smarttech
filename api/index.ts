import app from '../server.ts';

// Vercel Serverless Function entry point
export default function handler(req: any, res: any) {
  // Normalize req.url to ensure /api prefix is present when routed via Vercel rewrites
  const rawUrl = req.url || req.originalUrl || '/';
  if (!rawUrl.startsWith('/api') && !rawUrl.startsWith('/_')) {
    req.url = '/api' + (rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl);
  }
  return app(req, res);
}
