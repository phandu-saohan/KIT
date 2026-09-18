export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle verify API key action (GET or POST)
  if (req.method === 'GET') {
    const url = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`);
    const action = url.searchParams.get('action');
    const apiKey = url.searchParams.get('apiKey') || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

    if (action === 'verify') {
      if (!apiKey) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: 'Chưa có Resend API Key. Vui lòng nhập khóa API bắt đầu bằng re_...',
        });
      }

      try {
        const checkRes = await fetch('https://api.resend.com/domains', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (checkRes.ok) {
          const domainsData = await checkRes.json();
          return res.status(200).json({
            success: true,
            valid: true,
            message: 'Kết nối Resend API thành công!',
            domains: domainsData?.data || [],
          });
        } else {
          const errData = await checkRes.json().catch(() => ({}));
          return res.status(200).json({
            success: false,
            valid: false,
            message: errData?.message || 'Khóa Resend API Key không hợp lệ hoặc đã hết hạn.',
            error: errData,
          });
        }
      } catch (e: any) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: 'Lỗi kiểm tra API Key: ' + (e?.message || String(e)),
        });
      }
    }

    return res.status(200).json({
      service: 'KBIT Symposium 2026 - Resend Email Dispatcher',
      status: 'online',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      to,
      toName,
      subject,
      html,
      senderName = 'Hội Thảo Thẩm Mỹ Việt - Hàn 2026',
      senderEmail,
      replyToEmail,
      resendApiKey,
      action,
    } = body;

    const apiKey = resendApiKey || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

    // Verify Action via POST
    if (action === 'verify') {
      if (!apiKey) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: 'Chưa có Resend API Key. Vui lòng nhập khóa API bắt đầu bằng re_...',
        });
      }

      try {
        const checkRes = await fetch('https://api.resend.com/domains', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (checkRes.ok) {
          const domainsData = await checkRes.json();
          return res.status(200).json({
            success: true,
            valid: true,
            message: 'Kết nối Resend API thành công!',
            domains: domainsData?.data || [],
          });
        } else {
          const errData = await checkRes.json().catch(() => ({}));
          return res.status(200).json({
            success: false,
            valid: false,
            message: errData?.message || 'Khóa Resend API Key không hợp lệ.',
            error: errData,
          });
        }
      } catch (e: any) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: 'Lỗi kiểm tra API Key: ' + (e?.message || String(e)),
        });
      }
    }

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người nhận (to), tiêu đề (subject) hoặc nội dung (html).',
      });
    }

    // 1. If Resend API Key is provided, send real email via Resend API
    if (apiKey) {
      try {
        // Determine legitimate From email address for Resend
        let cleanSenderEmail = (senderEmail || '').trim();
        const isFreeWebmail =
          cleanSenderEmail.includes('@gmail.com') ||
          cleanSenderEmail.includes('@yahoo.com') ||
          cleanSenderEmail.includes('@hotmail.com') ||
          cleanSenderEmail.includes('@outlook.com');

        // If email is webmail or empty, use onboarding@resend.dev to avoid domain rejection
        if (!cleanSenderEmail || isFreeWebmail) {
          cleanSenderEmail = 'onboarding@resend.dev';
        }

        const fromField = `${senderName} <${cleanSenderEmail}>`;
        const replyToField = replyToEmail || (isFreeWebmail ? senderEmail : undefined);

        const resendPayload: Record<string, any> = {
          from: fromField,
          to: [to.trim()],
          subject: subject.trim(),
          html: html,
        };

        if (replyToField) {
          resendPayload.reply_to = replyToField.trim();
        }

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resendPayload),
        });

        const resendData = await resendResponse.json().catch(() => ({}));

        if (resendResponse.ok && resendData?.id) {
          return res.status(200).json({
            success: true,
            provider: 'resend',
            resendId: resendData.id,
            from: fromField,
            message: `Đã gửi email thật thành công qua Resend tới ${to}`,
            sentAt: new Date().toISOString(),
          });
        } else {
          // Format helpful error explanation in Vietnamese
          let vietnameseHint = resendData?.message || 'Lỗi gửi từ Resend';
          if (resendData?.name === 'validation_error') {
            if (resendData?.message?.includes('domain is not verified')) {
              vietnameseHint =
                'Tên miền người gửi chưa được xác thực trên Resend. Hãy đổi email gửi thành "onboarding@resend.dev" hoặc xác thực tên miền tại resend.com/domains.';
            } else if (resendData?.message?.includes('can only send testing emails to your own email')) {
              vietnameseHint =
                'Tài khoản Resend miễn phí chỉ cho phép gửi thư thử nghiệm đến email đăng ký tài khoản Resend của bạn. Để gửi cho danh sách khác, bạn cần add domain tại resend.com/domains.';
            }
          } else if (resendData?.name === 'rate_limit_exceeded') {
            vietnameseHint = 'Vượt quá giới hạn tần suất gửi của Resend (2 email/giây). Hệ thống sẽ tự động giãn thời gian.';
          } else if (resendData?.name === 'invalid_api_key') {
            vietnameseHint = 'Khóa Resend API Key không đúng. Vui lòng kiểm tra lại trong phần Cấu hình.';
          }

          return res.status(200).json({
            success: false,
            provider: 'resend',
            message: vietnameseHint,
            rawError: resendData,
          });
        }
      } catch (resendError: any) {
        return res.status(200).json({
          success: false,
          provider: 'resend',
          message: 'Lỗi mạng khi kết nối tới Resend API: ' + (resendError?.message || String(resendError)),
        });
      }
    }

    // 2. Default: Simulation fallback if API Key not yet supplied
    await new Promise((resolve) => setTimeout(resolve, 350));

    return res.status(200).json({
      success: true,
      provider: 'simulation',
      message: `[Mô phỏng] Đã xử lý gửi email cho ${toName || to} (${to}). Để gửi email thật, vui lòng nhập Resend API Key.`,
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Send email handler error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Lỗi hệ thống khi xử lý email',
    });
  }
}
