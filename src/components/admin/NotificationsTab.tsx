import React, { useState } from "react";
import {
  Bell,
  BellOff,
  Mail,
  Eye,
  Edit3,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  FileText,
} from "lucide-react";
import { useCMS } from "../../context/CMSContext";
import { ConfirmEmailTemplate } from "../../types";
import { DEFAULT_CONFIRM_EMAIL_TEMPLATE } from "../../data/symposiumData";

interface NotificationsTabProps {
  showToast: (msg: string) => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ showToast }) => {
  const { cmsData, updateConfirmEmailTemplate, saveConfirmEmailTemplateToCloud, saveCmsToCloud } = useCMS();

  const tpl: ConfirmEmailTemplate =
    cmsData.confirmEmailTemplate || DEFAULT_CONFIRM_EMAIL_TEMPLATE;

  const campaign = cmsData.emailCampaignConfig;

  const [draft, setDraft] = useState<ConfirmEmailTemplate>({ ...tpl });
  const [activeSubTab, setActiveSubTab] = useState<"editor" | "preview">("editor");
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sampleName = "TS.BS. Nguyễn Văn Hùng";
  const sampleCode = "KBIT-DOC-8899";

  const replacePlaceholders = (text: string, name: string, code: string) =>
    text
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{code\}\}/g, code)
      .replace(/\{\{institution\}\}/g, "Bệnh viện Trung ương Quân đội 108");

  const handleSave = async () => {
    setIsSaving(true);
    updateConfirmEmailTemplate(draft);
    try {
      localStorage.setItem('kbit_confirm_email_template', JSON.stringify(draft));
    } catch {}

    try {
      const okCloud = await saveConfirmEmailTemplateToCloud(draft);
      const okFull = await saveCmsToCloud({ ...cmsData, confirmEmailTemplate: draft });
      setIsSaving(false);
      if (okCloud || okFull) {
        showToast("✅ Đã lưu cấu hình email xác nhận và đồng bộ Vercel Postgres thành công!");
      } else {
        showToast("✅ Đã lưu cấu hình email xác nhận vào trình duyệt!");
      }
    } catch (err: any) {
      setIsSaving(false);
      showToast("❌ Lỗi khi lưu vào cơ sở dữ liệu: " + (err?.message || "Thử lại"));
    }
  };

  const buildPreviewHtml = (name: string, code: string) => {
    const greeting = replacePlaceholders(draft.greetingLine, name, code);
    const intro = replacePlaceholders(draft.customIntroText, name, code);
    const sig = draft.footerSignature.replace(/\n/g, "<br/>");
    return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',sans-serif;color:#1e293b;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:25px 10px;"><tr><td align="center"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 10px 25px rgba(0,32,69,.08);border:1px solid #e2eaf8;"><tr><td style="background:linear-gradient(135deg,#002045 0%,#102a54 60%,#c83271 100%);padding:32px 28px;text-align:center;"><div style="display:inline-block;padding:4px 14px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:20px;color:#ffb5d2;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">XÁC NHẬN ĐĂNG KÝ CHÍNH THỨC</div><h1 style="color:#fff;font-size:21px;line-height:1.35;margin:0 0 8px;font-weight:800;">HỘI NGHỊ KHOA HỌC THẨM MỸ VIỆT – HÀN 2026</h1><p style="color:#cbdcf7;font-size:13px;margin:0;">The 2026 Vietnam - Korea Aesthetic Surgery &amp; Medicine Scientific Symposium</p></td></tr><tr><td style="padding:24px 28px 12px;"><div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:14px 18px;"><p style="margin:0;color:#065f46;font-size:14px;font-weight:700;">✓ Đăng ký tham dự thành công!</p><p style="margin:4px 0 0;color:#047857;font-size:12.5px;line-height:1.5;">${intro}</p></div></td></tr><tr><td style="padding:10px 28px 24px;"><p style="font-size:15px;color:#0f172a;margin:0 0 16px;line-height:1.6;">${greeting}</p>${draft.showBadgeCard ? `<div style="background:linear-gradient(135deg,#002045 0%,#15325b 70%,#c83271 100%);border-radius:16px;padding:22px;color:#fff;margin-bottom:24px;"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td valign="top"><span style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#ffb5d2;font-weight:700;display:block;margin-bottom:4px;">THẺ ĐẠI BIỂU ĐIỆN TỬ (E-BADGE)</span><h2 style="margin:0 0 6px;font-size:20px;font-weight:800;">${name}</h2><p style="margin:0;font-size:13px;color:#e2eaf8;">Bác sĩ CKII Phẫu thuật Tạo hình Thẩm mỹ</p></td><td width="140" align="right" valign="top"><div style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:10px 12px;text-align:center;"><span style="display:block;font-size:10px;color:#cbdcf7;text-transform:uppercase;font-weight:600;">MÃ ĐẠI BIỂU</span><span style="display:block;font-size:16px;font-weight:800;color:#fff;font-family:monospace;letter-spacing:1px;margin-top:2px;">${code}</span><span style="display:inline-block;margin-top:5px;font-size:9.5px;background:#10b981;color:#fff;padding:2px 6px;border-radius:6px;font-weight:700;">ĐÃ XÁC NHẬN</span></div></td></tr></table></div>` : ""}<h3 style="font-size:14px;font-weight:700;color:#002045;margin:0 0 10px;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e2eaf8;padding-bottom:6px;">Chi Tiết Thông Tin Đăng Ký</h3><table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:13px;border-collapse:collapse;"><tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;width:38%;">Mã số tham dự:</td><td style="padding:8px 0;color:#c83271;font-weight:700;font-family:monospace;">${code}</td></tr><tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;">Họ và tên:</td><td style="padding:8px 0;color:#0f172a;font-weight:700;">${name}</td></tr><tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;">Thời gian diễn ra:</td><td style="padding:8px 0;color:#002045;font-weight:700;">17 – 18 Tháng 10, 2026 (08:00 – 17:30)</td></tr><tr><td style="padding:8px 0;color:#64748b;vertical-align:top;">Địa điểm:</td><td style="padding:8px 0;color:#002045;font-weight:600;line-height:1.4;">Bệnh viện Trung ương Quân đội 108<br/><span style="font-size:12px;color:#64748b;font-weight:400;">Số 1 Trần Hưng Đạo, Q. Hai Bà Trưng, Hà Nội</span></td></tr></table>${draft.showCheckinGuide ? `<div style="margin-top:22px;background:#f8faff;border:1px dashed #cbdcf7;border-radius:12px;padding:14px 16px;"><h4 style="margin:0 0 6px;color:#002045;font-size:12.5px;font-weight:700;">📌 Hướng dẫn khi đến tham dự:</h4><ul style="margin:0;padding-left:18px;color:#475569;font-size:12px;line-height:1.6;"><li>Vui lòng lưu lại email này hoặc chụp ảnh màn hình <strong>Mã đại biểu (${code})</strong> để xuất trình tại Bàn Đón Tiếp (Tầng 2).</li><li>Nếu đăng ký nhận <strong>CME</strong>, vui lòng mang theo CCCD và Chứng chỉ hành nghề.</li><li>Ban Tổ Chức cung cấp tài liệu và thẻ đeo chính thức từ 07:30 ngày 17/10/2026.</li></ul></div>` : ""}</td></tr><tr><td style="background:#f8fafc;border-top:1px solid #e2eaf8;padding:20px 28px;"><p style="margin:0 0 4px;color:#002045;font-size:12.5px;font-weight:700;">${sig}</p></td></tr><tr><td style="padding:16px 28px;text-align:center;background:#002045;color:#94a3b8;font-size:11px;"><p style="margin:0 0 4px;">© 2026 Vietnam - Korea Aesthetic Surgery &amp; Medicine Scientific Symposium. All rights reserved.</p><p style="margin:0;font-size:10px;">Email này được gửi tự động để xác nhận thông tin đăng ký. Vui lòng không trả lời trực tiếp email này.</p></td></tr></table></td></tr></table></body></html>`;
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setTestResult({ ok: false, msg: "Vui lòng nhập địa chỉ email hợp lệ." });
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    const hostingerPool = campaign?.hostingerPool || [];
    const activeHostinger = hostingerPool.find((h) => h.isActive && h.email && h.password) || hostingerPool[0];
    const gmailPool = campaign?.gmailPool || [];
    const activeGmail = gmailPool.find((g) => g.isActive && g.email && g.appPassword) || gmailPool[0];
    const sendProvider = campaign?.sendProvider || "hostinger";
    const htmlContent = buildPreviewHtml(sampleName, sampleCode);
    const subject = replacePlaceholders(draft.subject, sampleName, sampleCode);
    const senderName = draft.senderName || DEFAULT_CONFIRM_EMAIL_TEMPLATE.senderName;
    const replyToEmail = draft.replyTo || DEFAULT_CONFIRM_EMAIL_TEMPLATE.replyTo;
    const providerToUse =
      sendProvider === "hostinger"
        ? activeHostinger?.password
          ? "hostinger"
          : activeGmail?.appPassword
          ? "gmail"
          : "simulation"
        : sendProvider === "gmail_pool"
        ? activeGmail?.appPassword
          ? "gmail"
          : "simulation"
        : sendProvider;
    const payload: Record<string, any> = {
      provider: providerToUse,
      to: testEmail.trim(),
      toName: "Test Admin",
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      senderName,
      replyToEmail,
    };
    if (providerToUse === "hostinger" && activeHostinger) {
      payload.hostingerAuth = {
        user: activeHostinger.email.trim(),
        pass: activeHostinger.password.trim(),
        host: activeHostinger.smtpHost?.trim() || "smtp.hostinger.com",
        port: activeHostinger.smtpPort || 465,
      };
    } else if (providerToUse === "gmail" && activeGmail) {
      payload.gmailAuth = { user: activeGmail.email.trim(), pass: activeGmail.appPassword.trim() };
    } else if (providerToUse === "resend" && campaign?.resendApiKey) {
      payload.resendApiKey = campaign.resendApiKey;
      payload.senderEmail = campaign.senderEmail || "onboarding@resend.dev";
    }
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setTestResult({ ok: true, msg: `✅ Đã gửi test thành công tới ${testEmail}` });
        showToast(`✅ Test email gửi thành công tới ${testEmail}`);
      } else {
        setTestResult({ ok: false, msg: data.message || "Lỗi khi gửi test email." });
      }
    } catch (err: any) {
      setTestResult({ ok: false, msg: err?.message || "Lỗi kết nối máy chủ." });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#c83271]" />
            <span>Thông Báo &amp; Email Xác Nhận Tự Động</span>
          </h2>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Soạn thảo và quản lý email xác nhận gửi tự động khi đại biểu đăng ký thành công.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c83271] to-[#002045] text-white text-[13px] font-bold shadow-md hover:opacity-95 transition-all cursor-pointer disabled:opacity-60"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Lưu cấu hình</span>
        </button>
      </div>

      {/* ON/OFF Toggle */}
      <div
        className="rounded-2xl border-2 border-dashed p-5 flex items-center justify-between gap-4"
        style={{ borderColor: draft.enabled ? "#10b981" : "#e2eaf8", background: draft.enabled ? "#f0fdf4" : "#fafbff" }}
      >
        <div className="flex items-center gap-3">
          {draft.enabled ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <BellOff className="w-6 h-6 text-slate-400 shrink-0" />
          )}
          <div>
            <p className={`font-extrabold text-[14px] ${draft.enabled ? "text-emerald-800" : "text-slate-600"}`}>
              {draft.enabled ? "✅ Gửi email xác nhận tự động: BẬT" : "⏸ Gửi email xác nhận tự động: TẮT"}
            </p>
            <p className={`text-[12px] ${draft.enabled ? "text-emerald-700" : "text-slate-500"}`}>
              {draft.enabled
                ? "Hệ thống sẽ tự động gửi email xác nhận tới đại biểu sau mỗi lần đăng ký thành công."
                : "Tính năng đang tắt. Bật để hệ thống tự gửi email xác nhận khi có đăng ký mới."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDraft((p) => ({ ...p, enabled: !p.enabled }))}
          className="shrink-0 cursor-pointer"
          title={draft.enabled ? "Tắt email xác nhận tự động" : "Bật email xác nhận tự động"}
        >
          {draft.enabled ? (
            <ToggleRight className="w-10 h-10 text-emerald-600" />
          ) : (
            <ToggleLeft className="w-10 h-10 text-slate-400" />
          )}
        </button>
      </div>

      {/* Provider info */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#174ea6] mt-0.5 shrink-0" />
        <div className="text-[12.5px] text-slate-600 leading-relaxed">
          <span className="font-bold text-[#174ea6]">Provider gửi email: </span>
          Email xác nhận dùng cấu hình provider từ tab{" "}
          <span className="font-bold">Gửi Email Thư Mời</span> (Hostinger / Gmail / Resend). Đảm bảo đã cấu hình SMTP
          trước khi bật tính năng này. Provider hiện tại:{" "}
          <strong className="text-[#174ea6]">{campaign?.sendProvider || "hostinger"}</strong>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="rounded-2xl border border-[#e2eaf8] bg-white overflow-hidden">
        <div className="flex border-b border-[#e2eaf8]">
          <button
            type="button"
            onClick={() => setActiveSubTab("editor")}
            className={`flex items-center gap-2 px-5 py-3 text-[13px] font-bold transition-all cursor-pointer ${
              activeSubTab === "editor" ? "bg-[#002045] text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Soạn thảo nội dung
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("preview")}
            className={`flex items-center gap-2 px-5 py-3 text-[13px] font-bold transition-all cursor-pointer ${
              activeSubTab === "preview" ? "bg-[#c83271] text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Eye className="w-4 h-4" />
            Xem trước email
          </button>
        </div>

        {/* EDITOR */}
        {activeSubTab === "editor" && (
          <div className="p-5 space-y-5">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#002045]">Tên hiển thị người gửi</label>
              <input
                type="text"
                value={draft.senderName}
                onChange={(e) => setDraft((p) => ({ ...p, senderName: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#002045]">Reply-To Email</label>
              <input
                type="email"
                value={draft.replyTo}
                onChange={(e) => setDraft((p) => ({ ...p, replyTo: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#002045]">
                Tiêu đề email{" "}
                <span className="text-slate-400 font-normal">— Hỗ trợ biến: {"{{"} name {"}}"}  {"{{"} code {"}}"}</span>
              </label>
              <input
                type="text"
                value={draft.subject}
                onChange={(e) => setDraft((p) => ({ ...p, subject: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#002045]">
                Lời chào đầu{" "}
                <span className="text-slate-400 font-normal">— Hỗ trợ: {"{{"} name {"}}"}  </span>
              </label>
              <input
                type="text"
                value={draft.greetingLine}
                onChange={(e) => setDraft((p) => ({ ...p, greetingLine: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#002045]">Đoạn văn mở đầu tùy chỉnh</label>
              <textarea
                rows={3}
                value={draft.customIntroText}
                onChange={(e) => setDraft((p) => ({ ...p, customIntroText: e.target.value }))}
                className="px-3 py-2.5 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all resize-none"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "showBadgeCard" as keyof ConfirmEmailTemplate, label: "Hiển thị Thẻ Đại biểu điện tử (E-Badge)", desc: "Thêm card thẻ đại biểu màu gradient đậm vào email" },
                { key: "showCheckinGuide" as keyof ConfirmEmailTemplate, label: "Hiển thị Hướng dẫn check-in", desc: "Thêm mục hướng dẫn đến tham dự và check-in" },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  onClick={() => setDraft((p) => ({ ...p, [key]: !p[key] }))}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    draft[key] ? "border-emerald-300 bg-emerald-50" : "border-[#e2eaf8] bg-[#fafbff] hover:border-slate-300"
                  }`}
                >
                  <div>
                    <p className={`text-[12.5px] font-bold ${draft[key] ? "text-emerald-800" : "text-slate-700"}`}>{label}</p>
                    <p className="text-[11.5px] text-slate-500">{desc}</p>
                  </div>
                  {draft[key] ? <ToggleRight className="w-7 h-7 text-emerald-600 shrink-0" /> : <ToggleLeft className="w-7 h-7 text-slate-400 shrink-0" />}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#002045]">Chữ ký cuối email (Footer Signature)</label>
              <textarea
                rows={3}
                value={draft.footerSignature}
                onChange={(e) => setDraft((p) => ({ ...p, footerSignature: e.target.value }))}
                className="px-3 py-2.5 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all resize-none font-mono"
              />
            </div>

            {/* Variables reference */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-[12px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c83271]" />
                Biến động được hỗ trợ:
              </p>
              <div className="flex flex-wrap gap-2">
                {["{{name}}", "{{code}}", "{{institution}}"].map((v) => (
                  <span key={v} className="px-2.5 py-1 rounded-lg bg-[#002045] text-white text-[11.5px] font-mono font-bold">{v}</span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Các biến được thay thế tự động bằng thông tin thực tế của đại biểu khi gửi email.
              </p>
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {activeSubTab === "preview" && (
          <div className="p-0">
            <div className="px-5 py-3 bg-slate-50 border-b border-[#e2eaf8] flex items-center gap-2 text-[12px] text-slate-600">
              <FileText className="w-3.5 h-3.5 text-[#c83271]" />
              <span>
                Xem trước với dữ liệu mẫu: <strong className="text-slate-800">{sampleName}</strong> — Mã:{" "}
                <strong className="text-[#c83271] font-mono">{sampleCode}</strong>
              </span>
            </div>
            <iframe
              srcDoc={buildPreviewHtml(sampleName, sampleCode)}
              title="Email Preview"
              className="w-full border-0"
              style={{ height: "600px", minHeight: "600px" }}
            />
          </div>
        )}
      </div>

      {/* Test Send */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5">
        <h3 className="text-[14px] font-black text-[#002045] mb-1 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-600" />
          Gửi Email Test
        </h3>
        <p className="text-[12.5px] text-slate-500 mb-4">
          Gửi 1 email test tới hộp thư của bạn để kiểm tra nội dung và giao diện trước khi bật chính thức.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="flex-1 h-10 px-3 rounded-xl border border-indigo-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-60 shrink-0"
          >
            {isSendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Gửi test</span>
          </button>
        </div>
        {testResult && (
          <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-bold ${testResult.ok ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-700"}`}>
            {testResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{testResult.msg}</span>
          </div>
        )}
      </div>

      {draft.lastUpdated && (
        <p className="text-[11.5px] text-slate-400 text-right">
          Cập nhật lần cuối: {new Date(draft.lastUpdated).toLocaleString("vi-VN")}
        </p>
      )}
    </div>
  );
};
