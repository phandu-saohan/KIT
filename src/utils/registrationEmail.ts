import { AttendeeBadge, EmailCampaignConfig } from '../types';

export function generateRegistrationConfirmationHtml(badge: AttendeeBadge): string {
  const isDoctor = badge.attendeeType === 'doctor';
  const cmeText = badge.wantsCme
    ? 'Có đăng ký (3 giờ tín chỉ CME do Bệnh viện TWQĐ 108 cấp)'
    : 'Không đăng ký';

  const attendeeGroupText = isDoctor ? 'Bác sĩ & Chuyên gia Y tế' : 'Doanh nghiệp & Spa';

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đăng ký tham dự Hội Nghị Thẩm Mỹ Việt – Hàn 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7fb; padding: 25px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,32,69,0.08); border: 1px solid #e2eaf8;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #002045 0%, #102a54 60%, #c83271 100%); padding: 32px 28px; text-align: center;">
              <div style="display: inline-block; padding: 4px 14px; background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; color: #ffb5d2; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
                XÁC NHẬN ĐĂNG KÝ CHÍNH THỨC
              </div>
              <h1 style="color: #ffffff; font-size: 21px; line-height: 1.35; margin: 0 0 8px 0; font-weight: 800; letter-spacing: -0.3px;">
                HỘI NGHỊ KHOA HỌC THẨM MỸ VIỆT – HÀN 2026
              </h1>
              <p style="color: #cbdcf7; font-size: 13px; margin: 0; font-weight: 400; line-height: 1.4;">
                The 2026 Vietnam - Korea Aesthetic Surgery & Medicine Scientific Symposium
              </p>
            </td>
          </tr>

          <!-- Success Alert -->
          <tr>
            <td style="padding: 24px 28px 12px 28px;">
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 18px; text-align: left;">
                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 700;">
                  ✓ Đăng ký tham dự thành công!
                </p>
                <p style="margin: 4px 0 0 0; color: #047857; font-size: 12.5px; line-height: 1.5;">
                  Ban Tổ Chức trân trọng cảm ơn Quý Đại biểu đã hoàn tất thủ tục đăng ký. Dưới đây là thông tin vé & thẻ đại biểu chính thức của Quý vị.
                </p>
              </div>
            </td>
          </tr>

          <!-- Greeting & Badge Info Box -->
          <tr>
            <td style="padding: 10px 28px 24px 28px;">
              <p style="font-size: 15px; color: #0f172a; margin: 0 0 16px 0; line-height: 1.6;">
                Kính gửi Quý Đại biểu: <strong style="color: #002045; font-size: 16px;">${badge.fullName}</strong>,
              </p>

              <!-- E-Badge Visual Card -->
              <div style="background: linear-gradient(135deg, #002045 0%, #15325b 70%, #c83271 100%); border-radius: 16px; padding: 22px; color: #ffffff; box-shadow: 0 8px 20px rgba(0,32,69,0.15); margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td valign="top" style="padding-right: 12px;">
                      <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #ffb5d2; font-weight: 700; display: block; margin-bottom: 4px;">
                        THẺ ĐẠI BIỂU ĐIỆN TỬ (E-BADGE)
                      </span>
                      <h2 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                        ${badge.fullName}
                      </h2>
                      <p style="margin: 0 0 3px 0; font-size: 13px; color: #e2eaf8;">
                        ${badge.degree || (isDoctor ? 'Bác sĩ' : 'Đại diện Doanh nghiệp')}
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #cbdcf7;">
                        ${badge.institution || 'Cơ sở thẩm mỹ / Y tế'}
                      </p>
                    </td>
                    <td width="150" align="right" valign="top">
                      <div style="background-color: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 12px; padding: 10px 12px; text-align: center;">
                        <span style="display: block; font-size: 10px; color: #cbdcf7; text-transform: uppercase; font-weight: 600;">
                          MÃ ĐẠI BIỂU
                        </span>
                        <span style="display: block; font-size: 16px; font-weight: 800; color: #ffffff; font-family: monospace; letter-spacing: 1px; margin-top: 2px;">
                          ${badge.registrationCode}
                        </span>
                        <span style="display: inline-block; margin-top: 5px; font-size: 9.5px; background-color: #10b981; color: #ffffff; padding: 2px 6px; border-radius: 6px; font-weight: 700;">
                          ĐÃ XÁC NHẬN
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Registration Details Table -->
              <h3 style="font-size: 14px; font-weight: 700; color: #002045; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2eaf8; padding-bottom: 6px;">
                Chi Tiết Thông Tin Đăng Ký
              </h3>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b; width: 38%;">Mã số tham dự:</td>
                  <td style="padding: 8px 0; color: #c83271; font-weight: 700; font-family: monospace;">${badge.registrationCode}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Họ và tên:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${badge.fullName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Số điện thoại:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${badge.phone}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Email liên hệ:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${badge.email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Nhóm đại biểu:</td>
                  <td style="padding: 8px 0; color: #002045; font-weight: 600;">${attendeeGroupText}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Đơn vị công tác:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${badge.institution || 'Chưa cập nhật'}</td>
                </tr>
                ${badge.license ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Số chứng chỉ hành nghề:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${badge.license}</td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Cấp chứng chỉ CME:</td>
                  <td style="padding: 8px 0; color: ${badge.wantsCme ? '#c83271' : '#64748b'}; font-weight: 600;">
                    ${cmeText}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b;">Thời gian diễn ra:</td>
                  <td style="padding: 8px 0; color: #002045; font-weight: 700;">
                    17 – 18 Tháng 10, 2026 (08:00 – 17:30)
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Địa điểm tổ chức:</td>
                  <td style="padding: 8px 0; color: #002045; font-weight: 600; line-height: 1.4;">
                    Bệnh viện Trung ương Quân đội 108<br/>
                    <span style="font-size: 12px; color: #64748b; font-weight: 400;">Số 1 Trần Hưng Đạo, P. Bạch Đằng, Q. Hai Bà Trưng, TP. Hà Nội</span>
                  </td>
                </tr>
              </table>

              <!-- Notice Box / Check-in guide -->
              <div style="margin-top: 22px; background-color: #f8faff; border: 1px dashed #cbdcf7; border-radius: 12px; padding: 14px 16px;">
                <h4 style="margin: 0 0 6px 0; color: #002045; font-size: 12.5px; font-weight: 700;">
                  📌 Hướng dẫn khi đến tham dự:
                </h4>
                <ul style="margin: 0; padding-left: 18px; color: #475569; font-size: 12px; line-height: 1.6;">
                  <li>Quý đại biểu vui lòng lưu lại email này hoặc chụp ảnh màn hình <strong>Mã đại biểu (${badge.registrationCode})</strong> để xuất trình tại Bàn Đón Tiếp (Tầng 2).</li>
                  <li>Nếu quý vị đăng ký nhận <strong>CME</strong>, vui lòng mang theo bản sao CCCD và Chứng chỉ hành nghề để đối chiếu hồ sơ cấp chứng chỉ.</li>
                  <li>Ban Tổ Chức sẽ cung cấp tài liệu hội thảo và thẻ đeo chính thức tại bàn check-in từ 07:30 sáng ngày 17/10/2026.</li>
                </ul>
              </div>

            </td>
          </tr>

          <!-- Support & Secretary Info -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2eaf8; padding: 20px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; color: #002045; font-size: 12.5px; font-weight: 700;">
                      BAN THƯ KÝ HỘI NGHỊ KHOA HỌC THẨM MỸ VIỆT – HÀN 2026
                    </p>
                    <p style="margin: 0; color: #64748b; font-size: 11.5px; line-height: 1.5;">
                      Hotline / Zalo: <strong style="color: #002045;">+82-10-4159-8777</strong> | Email: <a href="mailto:secretary@kbitassociation.com" style="color: #c83271; text-decoration: none; font-weight: 600;">secretary@kbitassociation.com</a><br/>
                      Địa điểm: Bệnh viện Trung ương Quân đội 108, Hà Nội
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Legal -->
          <tr>
            <td style="padding: 16px 28px; text-align: center; background-color: #002045; color: #94a3b8; font-size: 11px;">
              <p style="margin: 0 0 4px 0;">
                © 2026 Vietnam - Korea Aesthetic Surgery & Medicine Scientific Symposium. All rights reserved.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 10px;">
                Email này được gửi tự động để xác nhận thông tin đăng ký của đại biểu. Vui lòng không trả lời trực tiếp email tự động này.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export interface SendEmailResult {
  success: boolean;
  message?: string;
  provider?: string;
  sentBy?: string;
  accountId?: string;
}

/**
 * Automatically send a confirmation email with registration details
 * using the configured email provider (Hostinger, Gmail pool, Resend, or simulation).
 */
export async function sendRegistrationConfirmationEmail(
  badge: AttendeeBadge,
  campaignConfig?: EmailCampaignConfig
): Promise<SendEmailResult> {
  if (!badge.email || !badge.email.includes('@')) {
    return {
      success: false,
      message: 'Địa chỉ email của đại biểu không hợp lệ.',
    };
  }

  const htmlContent = generateRegistrationConfirmationHtml(badge);
  const subject = `[Xác nhận đăng ký] Hội Nghị Thẩm Mỹ Việt – Hàn 2026 - Mã thẻ: ${badge.registrationCode}`;
  const senderName = campaignConfig?.senderName || 'Ban Tổ Chức Hội Thảo Thẩm Mỹ Việt – Hàn 2026';
  const replyToEmail = campaignConfig?.replyToEmail || 'secretary@kbitassociation.com';

  const sendProvider = campaignConfig?.sendProvider || 'hostinger';

  // Find active accounts
  const hostingerPool = campaignConfig?.hostingerPool || [];
  const activeHostinger = hostingerPool.find((h) => h.isActive && h.email && h.password) || hostingerPool[0];

  const gmailPool = campaignConfig?.gmailPool || [];
  const activeGmail = gmailPool.find((g) => g.isActive && g.email && g.appPassword && (g.sentToday < (g.dailyQuota || 500))) || gmailPool[0];

  let providerToUse: string = sendProvider;
  if (sendProvider === 'hostinger') {
    providerToUse = activeHostinger?.password ? 'hostinger' : (activeGmail?.appPassword ? 'gmail' : 'hostinger');
  } else if (sendProvider === 'gmail_pool') {
    providerToUse = activeGmail?.appPassword ? 'gmail' : (activeHostinger?.password ? 'hostinger' : 'gmail');
  }

  const payload: Record<string, any> = {
    provider: providerToUse,
    to: badge.email.trim(),
    toName: badge.fullName,
    subject,
    html: htmlContent,
    senderName: activeHostinger?.senderDisplayName || activeGmail?.senderDisplayName || senderName,
    replyToEmail,
  };

  let chosenAccountId: string | undefined;

  if (providerToUse === 'hostinger' && activeHostinger) {
    chosenAccountId = activeHostinger.id;
    payload.hostingerAuth = {
      user: activeHostinger.email.trim(),
      pass: activeHostinger.password.trim(),
      host: activeHostinger.smtpHost?.trim() || 'smtp.hostinger.com',
      port: activeHostinger.smtpPort || 465,
    };
  } else if (providerToUse === 'gmail' && activeGmail) {
    chosenAccountId = activeGmail.id;
    payload.gmailAuth = {
      user: activeGmail.email.trim(),
      pass: activeGmail.appPassword.trim(),
    };
  } else if (providerToUse === 'resend' && campaignConfig?.resendApiKey) {
    payload.resendApiKey = campaignConfig.resendApiKey;
    payload.senderEmail = campaignConfig.senderEmail || 'onboarding@resend.dev';
  }

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || `Đã gửi thư xác nhận tới ${badge.email}`,
        provider: data.provider || providerToUse,
        sentBy: data.sentBy,
        accountId: chosenAccountId,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Máy chủ không thể gửi email xác nhận.',
        provider: data.provider || providerToUse,
        accountId: chosenAccountId,
      };
    }
  } catch (err: any) {
    console.error('Error sending registration confirmation email:', err);
    return {
      success: false,
      message: err?.message || 'Lỗi mạng khi gửi email xác nhận.',
    };
  }
}
