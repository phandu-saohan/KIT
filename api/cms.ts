import { isDbConfigured, getDb, ensureTablesExist } from './db.js';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!isDbConfigured()) {
    return res.status(200).json({
      success: false,
      isDbConfigured: false,
      message: 'Vercel Postgres not configured yet. Using localStorage fallback.',
      data: null,
    });
  }

  try {
    await ensureTablesExist();
    const sql = getDb();

    // GET /api/cms - Retrieve CMS settings
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT data, updated_at FROM cms_data 
        WHERE key = 'main' 
        LIMIT 1;
      `;

      if (!rows || rows.length === 0) {
        return res.status(200).json({
          success: true,
          isDbConfigured: true,
          hasCustomData: false,
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        isDbConfigured: true,
        hasCustomData: true,
        updatedAt: rows[0].updated_at,
        data: rows[0].data,
      });
    }

    // POST /api/cms - Update CMS settings
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const cmsPayload = body;

      if (!cmsPayload) {
        return res.status(400).json({ success: false, error: 'Thiếu dữ liệu CMS.' });
      }

      const jsonStr = JSON.stringify(cmsPayload);

      await sql`
        INSERT INTO cms_data (key, data, updated_at)
        VALUES ('main', ${jsonStr}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = CURRENT_TIMESTAMP;
      `;

      return res.status(200).json({
        success: true,
        message: 'Lưu cấu hình CMS vào Vercel Postgres thành công.',
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: 'Phương thức không được hỗ trợ.' });
  } catch (error: any) {
    console.error('API /api/cms Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xử lý cơ sở dữ liệu Vercel Postgres.',
    });
  }
}
