import nodemailer from 'nodemailer';

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

  // Handle verify via GET
  if (req.method === 'GET') {
    const url = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`);
    const action = url.searchParams.get('action');

    // 1. Verify Gmail SMTP credentials
    if (action === 'verify_gmail') {
      const user = url.searchParams.get('user');
      const pass = url.searchParams.get('pass');

      if (!user || !pass) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: 'Vui lòng cung cấp đầy đủ email Gmail và Mật khẩu ứng dụng (App Password).',
        });
      }

      try {
        const cleanPass = pass.replace(/\s+/g, '');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: user.trim(),
            pass: cleanPass,
          },
        });

        await transporter.verify();
        return res.status(200).json({
          success: true,
          valid: true,
          message: `Xác thực thành công! Tài khoản Gmail [${user}] đã sẵn sàng gửi thư.`,
        });
      } catch (err: any) {
        let msg = err?.message || 'Lỗi xác thực Gmail';
        if (msg.includes('Invalid login') || msg.includes('BadCredentials') || msg.includes('Username and Password not accepted')) {
          msg = 'Mật khẩu ứng dụng (App Password) không chính xác hoặc chưa bật Xác minh 2 bước trong tài khoản Google.';
        }
        return res.status(200).json({
          success: false,
          valid: false,
          message: msg,
          rawError: err?.message,
        });
      }
    }

    // 2. Verify Hostinger SMTP credentials
    if (action === 'verify_hostinger') {
      const user = url.searchParams.get('user');
      const pass = url.searchParams.get('pass');
      const host = url.searchParams.get('host') || 'smtp.hostinger.com';
      const port = Number(url.searchParams.get('port') || 465);
      const secure = port === 465;

      if (!user || !pass) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: 'Vui lòng cung cấp đầy đủ Email Hostinger và Mật khẩu.',
        });
      }

      try {
        const transporter = nodemailer.createTransport({
          host: host.trim(),
          port: port,
          secure: secure,
          auth: {
            user: user.trim(),
            pass: pass.trim(),
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        await transporter.verify();
        return res.status(200).json({
          success: true,
          valid: true,
          message: `Xác thực thành công! Máy chủ Hostinger [${host}:${port}] với tài khoản [${user}] đã sẵn sàng gửi thư.`,
        });
      } catch (err: any) {
        let msg = err?.message || 'Lỗi xác thực Hostinger';
        if (msg.includes('Invalid login') || msg.includes('BadCredentials') || msg.includes('Username and Password not accepted') || msg.includes('535 5.7.8')) {
          msg = 'Mật khẩu hòm thư Hostinger hoặc địa chỉ email không chính xác.';
        } else if (msg.includes('ETIMEDOUT') || msg.includes('ENOTFOUND')) {
          msg = `Không thể kết nối tới máy chủ SMTP Hostinger (${host}:${port}). Hãy kiểm tra lại thông tin máy chủ và cổng kết nối.`;
        }
        return res.status(200).json({
          success: false,
          valid: false,
          message: msg,
          rawError: err?.message,
        });
      }
    }

    // 3. Verify Resend API Key
    if (action === 'verify') {
      const apiKey = url.searchParams.get('apiKey') || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
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
      service: 'KBIT Symposium 2026 - Hybrid Email Dispatcher (Gmail Pool & Resend)',
      status: 'online',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      action,
      provider = 'hostinger', // 'hostinger' | 'gmail' | 'resend' | 'simulation'
      gmailAuth, // { user, pass }
      hostingerAuth, // { user, pass, host, port, secure }
      resendApiKey,
      to,
      toName,
      subject,
      html,
      senderName = 'Hội Thảo Thẩm Mỹ Việt - Hàn 2026',
      senderEmail,
      replyToEmail,
    } = body;

    // 1. Verify Gmail action via POST
    if (action === 'verify_gmail') {
      const user = gmailAuth?.user;
      const pass = gmailAuth?.pass;

      if (!user || !pass) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: 'Vui lòng cung cấp đầy đủ email Gmail và Mật khẩu ứng dụng (App Password).',
        });
      }

      try {
        const cleanPass = pass.replace(/\s+/g, '');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: user.trim(),
            pass: cleanPass,
          },
        });

        await transporter.verify();
        return res.status(200).json({
          success: true,
          valid: true,
          message: `Xác thực thành công! Tài khoản Gmail [${user}] đã sẵn sàng gửi thư.`,
        });
      } catch (err: any) {
        let msg = err?.message || 'Lỗi xác thực Gmail';
        if (msg.includes('Invalid login') || msg.includes('BadCredentials') || msg.includes('Username and Password not accepted')) {
          msg = 'Mật khẩu ứng dụng (App Password) không chính xác hoặc chưa bật Xác minh 2 bước trên tài khoản Google.';
        }
        return res.status(200).json({
          success: false,
          valid: false,
          message: msg,
          rawError: err?.message,
        });
      }
    }

    // 2. Verify Hostinger action via POST
    if (action === 'verify_hostinger') {
      const user = hostingerAuth?.user;
      const pass = hostingerAuth?.pass;
      const host = hostingerAuth?.host || 'smtp.hostinger.com';
      const port = Number(hostingerAuth?.port || 465);
      const secure = port === 465;

      if (!user || !pass) {
        return res.status(200).json({
          success: false,
          valid: false,
          message: 'Vui lòng cung cấp đầy đủ Email Hostinger và Mật khẩu.',
        });
      }

      try {
        const transporter = nodemailer.createTransport({
          host: host.trim(),
          port: port,
          secure: secure,
          auth: {
            user: user.trim(),
            pass: pass.trim(),
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        await transporter.verify();
        return res.status(200).json({
          success: true,
          valid: true,
          message: `Xác thực thành công! Máy chủ Hostinger [${host}:${port}] với hòm thư [${user}] đã sẵn sàng.`,
        });
      } catch (err: any) {
        let msg = err?.message || 'Lỗi xác thực Hostinger';
        if (msg.includes('Invalid login') || msg.includes('BadCredentials') || msg.includes('Username and Password not accepted') || msg.includes('535 5.7.8')) {
          msg = 'Mật khẩu hòm thư Hostinger hoặc địa chỉ email không chính xác.';
        } else if (msg.includes('ETIMEDOUT') || msg.includes('ENOTFOUND')) {
          msg = `Không thể kết nối tới máy chủ SMTP Hostinger (${host}:${port}). Vui lòng kiểm tra lại cấu hình cổng (465 SSL hoặc 587 TLS).`;
        }
        return res.status(200).json({
          success: false,
          valid: false,
          message: msg,
          rawError: err?.message,
        });
      }
    }

    // 2. Verify Resend action via POST
    if (action === 'verify') {
      const apiKey = resendApiKey || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
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

    // Validate email dispatch parameters
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người nhận (to), tiêu đề (subject) hoặc nội dung (html).',
      });
    }

    // DISPATCH METHOD 1: GMAIL SMTP POOL (NodeMailer)
    if (provider === 'gmail' && gmailAuth?.user && gmailAuth?.pass) {
      try {
        const cleanPass = gmailAuth.pass.replace(/\s+/g, '');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailAuth.user.trim(),
            pass: cleanPass,
          },
        });

        const fromAddress = `"${senderName}" <${gmailAuth.user.trim()}>`;

        const mailOptions: Record<string, any> = {
          from: fromAddress,
          to: to.trim(),
          subject: subject.trim(),
          html: html,
        };

        if (replyToEmail) {
          mailOptions.replyTo = replyToEmail.trim();
        }

        const info = await transporter.sendMail(mailOptions);

        return res.status(200).json({
          success: true,
          provider: 'gmail',
          sentBy: gmailAuth.user.trim(),
          messageId: info.messageId,
          message: `Đã gửi thành công qua Gmail [${gmailAuth.user.trim()}] tới ${to}`,
          sentAt: new Date().toISOString(),
        });
      } catch (gmailErr: any) {
        let msg = gmailErr?.message || 'Lỗi gửi qua Gmail SMTP';
        if (msg.includes('Daily user sending quota exceeded') || msg.includes('550-5.4.5')) {
          msg = `Tài khoản Gmail [${gmailAuth.user}] đã đạt giới hạn 500 email/ngày của Google.`;
        } else if (msg.includes('Invalid login') || msg.includes('Username and Password not accepted')) {
          msg = `Lỗi đăng nhập Gmail [${gmailAuth.user}]. Hãy kiểm tra lại App Password 16 chữ cái.`;
        }

        return res.status(200).json({
          success: false,
          provider: 'gmail',
          sentBy: gmailAuth.user,
          message: msg,
          rawError: gmailErr?.message,
        });
      }
    }

    // DISPATCH METHOD 2: HOSTINGER SMTP (NodeMailer)
    if (provider === 'hostinger' && hostingerAuth?.user && hostingerAuth?.pass) {
      try {
        const host = hostingerAuth.host || 'smtp.hostinger.com';
        const port = Number(hostingerAuth.port || 465);
        const secure = port === 465;

        const transporter = nodemailer.createTransport({
          host: host.trim(),
          port: port,
          secure: secure,
          auth: {
            user: hostingerAuth.user.trim(),
            pass: hostingerAuth.pass.trim(),
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const fromAddress = `"${senderName}" <${hostingerAuth.user.trim()}>`;

        const mailOptions: Record<string, any> = {
          from: fromAddress,
          to: to.trim(),
          subject: subject.trim(),
          html: html,
        };

        if (replyToEmail) {
          mailOptions.replyTo = replyToEmail.trim();
        }

        const info = await transporter.sendMail(mailOptions);

        return res.status(200).json({
          success: true,
          provider: 'hostinger',
          sentBy: hostingerAuth.user.trim(),
          messageId: info.messageId,
          message: `Đã gửi thành công qua Hostinger [${hostingerAuth.user.trim()}] tới ${to}`,
          sentAt: new Date().toISOString(),
        });
      } catch (hostingerErr: any) {
        let msg = hostingerErr?.message || 'Lỗi gửi qua Hostinger SMTP';
        if (msg.includes('535 5.7.8') || msg.includes('Invalid login') || msg.includes('Username and Password not accepted')) {
          msg = `Lỗi xác thực hòm thư Hostinger [${hostingerAuth.user}]. Hãy kiểm tra lại mật khẩu hòm thư.`;
        } else if (msg.includes('quota') || msg.includes('limit exceeded')) {
          msg = `Hòm thư Hostinger [${hostingerAuth.user}] đã đạt giới hạn gửi trong ngày.`;
        }

        return res.status(200).json({
          success: false,
          provider: 'hostinger',
          sentBy: hostingerAuth.user,
          message: msg,
          rawError: hostingerErr?.message,
        });
      }
    }

    // DISPATCH METHOD 3: RESEND API
    const apiKey = resendApiKey || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    if (provider === 'resend' && apiKey) {
      try {
        let cleanSenderEmail = (senderEmail || '').trim();
        const isFreeWebmail =
          cleanSenderEmail.includes('@gmail.com') ||
          cleanSenderEmail.includes('@yahoo.com') ||
          cleanSenderEmail.includes('@hotmail.com') ||
          cleanSenderEmail.includes('@outlook.com');

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
          let vietnameseHint = resendData?.message || 'Lỗi gửi từ Resend';
          if (resendData?.name === 'validation_error') {
            if (resendData?.message?.includes('domain is not verified')) {
              vietnameseHint = 'Tên miền người gửi chưa được xác thực trên Resend. Hãy dùng "onboarding@resend.dev".';
            }
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

    // DISPATCH METHOD 3: SIMULATION FALLBACK
    await new Promise((resolve) => setTimeout(resolve, 350));
    return res.status(200).json({
      success: true,
      provider: 'simulation',
      message: `[Mô phỏng] Đã xử lý gửi thư cho ${toName || to} (${to}).`,
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
