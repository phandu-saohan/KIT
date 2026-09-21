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

      const parsedData = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;

      return res.status(200).json({
        success: true,
        isDbConfigured: true,
        hasCustomData: true,
        updatedAt: rows[0].updated_at,
        data: parsedData,
      });
    }

    // POST /api/cms - Update CMS settings
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const cmsPayload = body;

      if (!cmsPayload) {
        return res.status(400).json({ success: false, error: 'Thiếu dữ liệu CMS.' });
      }

      // If specific sub-section update requested (e.g. { type: 'seo', data: seoConfig })
      if (cmsPayload.type === 'seo' && cmsPayload.data) {
        const seoJson = JSON.stringify(cmsPayload.data);
        console.log('[CMS API] Saving SEO, keys:', Object.keys(cmsPayload.data), 'size:', seoJson.length);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('seoConfig', ${seoJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{seoConfig}', ${seoJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        console.log('[CMS API] SEO saved successfully');
        return res.status(200).json({
          success: true,
          message: 'Lưu cấu hình SEO vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for eventDetails / banner
      if ((cmsPayload.type === 'eventDetails' || cmsPayload.type === 'general') && cmsPayload.data) {
        const eventJson = JSON.stringify(cmsPayload.data);
        console.log('[CMS API] Saving EventDetails, size:', eventJson.length);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('eventDetails', ${eventJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{eventDetails}', ${eventJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        console.log('[CMS API] EventDetails saved successfully');
        return res.status(200).json({
          success: true,
          message: 'Lưu cài đặt sự kiện & banner vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for emailCampaign
      if (cmsPayload.type === 'emailCampaign' && cmsPayload.data) {
        // Strip 'recipients' array before saving - it can be very large (hundreds/thousands of emails)
        // Recipients are stored only in the browser's localStorage, not in the DB
        const { recipients: _r, ...emailConfigOnly } = cmsPayload.data as any;
        const emailJson = JSON.stringify(emailConfigOnly);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('emailCampaignConfig', ${emailJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{emailCampaignConfig}', ${emailJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({
          success: true,
          message: 'Lưu cấu hình Email Thư mời vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for confirmEmailTemplate
      if (cmsPayload.type === 'confirmEmailTemplate' && cmsPayload.data) {
        const confirmJson = JSON.stringify(cmsPayload.data);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('confirmEmailTemplate', ${confirmJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{confirmEmailTemplate}', ${confirmJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({
          success: true,
          message: 'Lưu cấu hình Email Xác nhận vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for experts / speakers
      if ((cmsPayload.type === 'experts' || cmsPayload.type === 'speakers') && cmsPayload.data) {
        const expertsJson = JSON.stringify(cmsPayload.data);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('experts', ${expertsJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{experts}', ${expertsJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({
          success: true,
          message: 'Lưu danh sách Chuyên gia & Báo cáo viên vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for agenda
      if (cmsPayload.type === 'agenda' && cmsPayload.data) {
        const agendaJson = JSON.stringify(cmsPayload.data);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('agenda', ${agendaJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{agenda}', ${agendaJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({
          success: true,
          message: 'Lưu Lịch trình hội thảo vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for partners
      if (cmsPayload.type === 'partners' && cmsPayload.data) {
        const partnersJson = JSON.stringify(cmsPayload.data);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('partners', ${partnersJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{partners}', ${partnersJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({
          success: true,
          message: 'Lưu danh sách Đơn vị đồng hành & Nhà tài trợ vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for highlights
      if (cmsPayload.type === 'highlights' && cmsPayload.data) {
        const highlightsJson = JSON.stringify(cmsPayload.data);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('highlights', ${highlightsJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{highlights}', ${highlightsJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({
          success: true,
          message: 'Lưu Điểm nhấn hội thảo vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for footer
      if ((cmsPayload.type === 'footer' || cmsPayload.type === 'footerConfig') && cmsPayload.data) {
        const footerJson = JSON.stringify(cmsPayload.data);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('footerConfig', ${footerJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{footerConfig}', ${footerJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({
          success: true,
          message: 'Lưu thông tin Chân trang & Liên hệ vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for media library
      if ((cmsPayload.type === 'media' || cmsPayload.type === 'mediaLibrary') && cmsPayload.data) {
        const mediaJson = JSON.stringify(cmsPayload.data);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('mediaLibrary', ${mediaJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{mediaLibrary}', ${mediaJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({
          success: true,
          message: 'Lưu Thư viện hình ảnh vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // If specific sub-section update requested for admin account
      if ((cmsPayload.type === 'account' || cmsPayload.type === 'adminAccount') && cmsPayload.data) {
        const accountJson = JSON.stringify(cmsPayload.data);
        await sql`
          INSERT INTO cms_data (key, data, updated_at)
          VALUES ('main', jsonb_build_object('adminAccount', ${accountJson}::jsonb), CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = jsonb_set(COALESCE(cms_data.data, '{}'::jsonb), '{adminAccount}', ${accountJson}::jsonb, true),
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({
          success: true,
          message: 'Lưu Thông tin tài khoản quản trị vào Vercel Postgres thành công.',
          updatedAt: new Date().toISOString(),
        });
      }

      // Full CMS Save: Omit registrations to keep payload lightweight and prevent conflicts with the registrations table
      const cleanPayload = { ...cmsPayload };
      delete cleanPayload.registrations;
      delete cleanPayload.type;

      const jsonStr = JSON.stringify(cleanPayload);

      await sql`
        INSERT INTO cms_data (key, data, updated_at)
        VALUES ('main', ${jsonStr}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET
          data = COALESCE(cms_data.data, '{}'::jsonb) || ${jsonStr}::jsonb,
          updated_at = CURRENT_TIMESTAMP;
      `;

      return res.status(200).json({
        success: true,
        message: 'Lưu toàn bộ các module CMS vào Vercel Postgres thành công.',
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
