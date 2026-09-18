import { isDbConfigured, getDb, ensureTablesExist } from './db';

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
      data: [],
    });
  }

  try {
    await ensureTablesExist();
    const sql = getDb();

    // GET /api/registrations - Retrieve all attendee registrations
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM registrations 
        ORDER BY registered_at DESC;
      `;

      const registrations = rows.map((row: any) => {
        // Prefer stored data object if available, otherwise reconstruct
        if (row.data) {
          return {
            ...row.data,
            id: row.id,
            registrationCode: row.registration_code || row.data.registrationCode,
            fullName: row.full_name || row.data.fullName,
            phone: row.phone || row.data.phone,
            email: row.email || row.data.email,
            attendeeType: row.attendee_type || row.data.attendeeType,
            workplace: row.workplace || row.data.workplace,
            title: row.title || row.data.title,
            specialty: row.specialty || row.data.specialty,
            license: row.license || row.data.license,
            wantsCme: row.wants_cme ?? row.data.wantsCme,
            selectedEvents: row.selected_events || row.data.selectedEvents || [],
            interests: row.interests || row.data.interests || [],
            goals: row.goals || row.data.goals || [],
            notes: row.notes || row.data.notes || '',
            qrCodeUrl: row.qr_code_url || row.data.qrCodeUrl || '',
            registeredAt: row.registered_at ? new Date(row.registered_at).toISOString() : row.data.registeredAt,
          };
        }
        return {
          id: row.id,
          registrationCode: row.registration_code,
          fullName: row.full_name,
          phone: row.phone,
          email: row.email,
          attendeeType: row.attendee_type,
          workplace: row.workplace,
          title: row.title,
          specialty: row.specialty,
          license: row.license,
          wantsCme: row.wants_cme,
          selectedEvents: row.selected_events || [],
          interests: row.interests || [],
          goals: row.goals || [],
          notes: row.notes || '',
          qrCodeUrl: row.qr_code_url || '',
          registeredAt: row.registered_at ? new Date(row.registered_at).toISOString() : new Date().toISOString(),
        };
      });

      return res.status(200).json({
        success: true,
        isDbConfigured: true,
        count: registrations.length,
        data: registrations,
      });
    }

    // POST /api/registrations - Create new registration
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const reg = body;

      if (!reg || !reg.fullName || !reg.phone) {
        return res.status(400).json({
          success: false,
          error: 'Thiếu thông tin bắt buộc: Họ tên và Số điện thoại.',
        });
      }

      const id = reg.id || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const regCode = reg.registrationCode || `KBIT-${Math.floor(1000 + Math.random() * 9000)}`;
      const wantsCme = Boolean(reg.wantsCme);
      const selectedEvents = JSON.stringify(reg.selectedEvents || ['SYM']);
      const interests = JSON.stringify(reg.interests || []);
      const goals = JSON.stringify(reg.goals || []);
      const dataPayload = JSON.stringify({ ...reg, id, registrationCode: regCode });

      await sql`
        INSERT INTO registrations (
          id, registration_code, full_name, phone, email,
          attendee_type, workplace, title, specialty, license,
          wants_cme, selected_events, interests, goals, notes,
          qr_code_url, data
        ) VALUES (
          ${id}, ${regCode}, ${reg.fullName}, ${reg.phone}, ${reg.email || ''},
          ${reg.attendeeType || 'Bác sĩ'}, ${reg.workplace || ''}, ${reg.title || ''}, ${reg.specialty || ''}, ${reg.license || ''},
          ${wantsCme}, ${selectedEvents}::jsonb, ${interests}::jsonb, ${goals}::jsonb, ${reg.notes || ''},
          ${reg.qrCodeUrl || ''}, ${dataPayload}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          attendee_type = EXCLUDED.attendee_type,
          workplace = EXCLUDED.workplace,
          title = EXCLUDED.title,
          specialty = EXCLUDED.specialty,
          license = EXCLUDED.license,
          wants_cme = EXCLUDED.wants_cme,
          selected_events = EXCLUDED.selected_events,
          interests = EXCLUDED.interests,
          goals = EXCLUDED.goals,
          notes = EXCLUDED.notes,
          data = EXCLUDED.data;
      `;

      return res.status(201).json({
        success: true,
        message: 'Đăng ký thành công và đã lưu vào cơ sở dữ liệu Vercel Postgres.',
        data: { ...reg, id, registrationCode: regCode },
      });
    }

    // PUT /api/registrations - Update existing registration
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const reg = body;

      if (!reg || !reg.id) {
        return res.status(400).json({ success: false, error: 'Thiếu ID đại biểu.' });
      }

      const wantsCme = Boolean(reg.wantsCme);
      const selectedEvents = JSON.stringify(reg.selectedEvents || ['SYM']);
      const interests = JSON.stringify(reg.interests || []);
      const goals = JSON.stringify(reg.goals || []);
      const dataPayload = JSON.stringify(reg);

      await sql`
        UPDATE registrations SET
          full_name = ${reg.fullName},
          phone = ${reg.phone},
          email = ${reg.email || ''},
          attendee_type = ${reg.attendeeType || 'Bác sĩ'},
          workplace = ${reg.workplace || ''},
          title = ${reg.title || ''},
          specialty = ${reg.specialty || ''},
          license = ${reg.license || ''},
          wants_cme = ${wantsCme},
          selected_events = ${selectedEvents}::jsonb,
          interests = ${interests}::jsonb,
          goals = ${goals}::jsonb,
          notes = ${reg.notes || ''},
          data = ${dataPayload}::jsonb
        WHERE id = ${reg.id};
      `;

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin đại biểu thành công.',
        data: reg,
      });
    }

    // DELETE /api/registrations - Delete registration
    if (req.method === 'DELETE') {
      const { id } = req.query || {};
      if (!id) {
        return res.status(400).json({ success: false, error: 'Thiếu ID đại biểu để xóa.' });
      }

      await sql`DELETE FROM registrations WHERE id = ${id};`;
      return res.status(200).json({
        success: true,
        message: `Đã xóa đại biểu mã ${id}.`,
      });
    }

    return res.status(405).json({ error: 'Phương thức không được hỗ trợ.' });
  } catch (error: any) {
    console.error('API /api/registrations Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xử lý cơ sở dữ liệu Vercel Postgres.',
    });
  }
}
