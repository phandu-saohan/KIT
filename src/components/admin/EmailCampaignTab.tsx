import React, { useState, useRef, useEffect } from 'react';
import {
  Mail,
  Send,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Copy,
  Users,
  Eye,
  Sparkles,
  Upload,
  FileSpreadsheet,
  ExternalLink,
  Settings,
  Check,
  Clock,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Layers,
  FileText,
  Key,
  Globe,
  Radio,
  HelpCircle,
  Info,
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { EmailRecipient, EmailTemplate } from '../../types';

interface EmailCampaignTabProps {
  showToast: (msg: string) => void;
}

export const EmailCampaignTab: React.FC<EmailCampaignTabProps> = ({ showToast }) => {
  const {
    cmsData,
    updateEmailCampaignConfig,
    addEmailRecipient,
    removeEmailRecipient,
    updateEmailRecipientStatus,
    bulkAddEmailRecipients,
    resetEmailRecipientsStatus,
  } = useCMS();

  const campaign = cmsData.emailCampaignConfig || {
    senderName: 'Ban Tổ Chức Hội Thảo Thẩm Mỹ Việt – Hàn 2026',
    senderEmail: 'onboarding@resend.dev',
    replyToEmail: 'support@kbitassociation.com',
    sendProvider: 'resend',
    resendApiKey: '',
    resendDomain: '',
    recipients: [],
    templates: [],
    selectedTemplateId: '',
  };

  const templates = campaign.templates || [];
  const recipients = campaign.recipients || [];
  const selectedTemplate = templates.find((t) => t.id === campaign.selectedTemplateId) || templates[0];

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'doctor' | 'business' | 'vip' | 'pending' | 'sent' | 'failed'>('all');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [previewRecipientId, setPreviewRecipientId] = useState<string>(recipients[0]?.id || '');
  const [activeTabSubView, setActiveTabSubView] = useState<'editor' | 'preview'>('editor');

  // Resend API Key verification test state
  const [isVerifyingResendKey, setIsVerifyingResendKey] = useState(false);
  const [resendVerifyResult, setResendVerifyResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    domains?: any[];
  } | null>(null);

  // Campaign Runner State
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalToSend, setTotalToSend] = useState(0);
  const [throttleMs, setThrottleMs] = useState(1000); // 1000ms safe default for Resend (standard limit is 2 req/s)
  const [campaignLogs, setCampaignLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'error'; resendId?: string }>>([]);
  const abortControllerRef = useRef<boolean>(false);

  // New recipient form state
  const [newRecipName, setNewRecipName] = useState('');
  const [newRecipEmail, setNewRecipEmail] = useState('');
  const [newRecipOrg, setNewRecipOrg] = useState('');
  const [newRecipType, setNewRecipType] = useState<'doctor' | 'business' | 'vip' | 'general'>('doctor');

  // Preview target recipient
  const previewRecipient = recipients.find((r) => r.id === previewRecipientId) || recipients[0] || {
    id: 'sample',
    name: 'TS.BS. Nguyễn Văn Hùng',
    email: 'dr.hung@benhvien108.vn',
    organization: 'Bệnh viện Trung ương Quân đội 108',
    recipientType: 'doctor',
    status: 'pending',
  };

  // Replace placeholders in text
  const replacePlaceholders = (text: string, recip: EmailRecipient) => {
    if (!text) return '';
    const eventName = cmsData.eventDetails.title || 'Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026';
    const eventDate = `${cmsData.eventDetails.startDate || '17/10/2026'} – ${cmsData.eventDetails.endDate || '18/10/2026'}`;
    const eventVenue = cmsData.eventDetails.location || 'Bệnh viện Trung ương Quân đội 108, Hà Nội';
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hoithao-thammy-viethan2026.vn';
    const invitationLink = `${siteUrl}?ref=invite&name=${encodeURIComponent(recip.name)}&email=${encodeURIComponent(recip.email)}#registration`;

    return text
      .replace(/{{name}}/g, recip.name || 'Quý Đại biểu')
      .replace(/{{organization}}/g, recip.organization || 'Quý Đơn vị')
      .replace(/{{event_name}}/g, eventName)
      .replace(/{{event_date}}/g, eventDate)
      .replace(/{{event_venue}}/g, eventVenue)
      .replace(/{{invitation_link}}/g, invitationLink);
  };

  const currentSubject = selectedTemplate ? replacePlaceholders(selectedTemplate.subject, previewRecipient) : '';
  const currentHtml = selectedTemplate ? replacePlaceholders(selectedTemplate.content, previewRecipient) : '';

  // Statistics
  const totalRecipients = recipients.length;
  const sentCount = recipients.filter((r) => r.status === 'sent').length;
  const pendingCount = recipients.filter((r) => r.status === 'pending').length;
  const failedCount = recipients.filter((r) => r.status === 'failed').length;
  const progressPercent = totalRecipients > 0 ? Math.round((sentCount / totalRecipients) * 100) : 0;

  // Filtered Recipients
  const filteredRecipients = recipients.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.organization || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'doctor') return r.recipientType === 'doctor';
    if (filterType === 'business') return r.recipientType === 'business';
    if (filterType === 'vip') return r.recipientType === 'vip';
    if (filterType === 'pending') return r.status === 'pending';
    if (filterType === 'sent') return r.status === 'sent';
    if (filterType === 'failed') return r.status === 'failed';
    return true;
  });

  // Log helper
  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info', resendId?: string) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setCampaignLogs((prev) => [{ time, text, type, resendId }, ...prev.slice(0, 199)]);
  };

  // Test Resend API Key connection
  const handleVerifyResendKey = async (keyToTest?: string) => {
    const key = keyToTest || campaign.resendApiKey;
    if (!key || !key.trim()) {
      setResendVerifyResult({
        tested: true,
        valid: false,
        message: 'Vui lòng nhập khóa Resend API Key (bắt đầu bằng re_...) để kiểm tra.',
      });
      return;
    }

    setIsVerifyingResendKey(true);
    setResendVerifyResult(null);

    try {
      const res = await fetch(`/api/send-email?action=verify&apiKey=${encodeURIComponent(key.trim())}`);
      const data = await res.json();
      setIsVerifyingResendKey(false);
      setResendVerifyResult({
        tested: true,
        valid: data.valid,
        message: data.message || (data.valid ? 'Kết nối Resend API thành công!' : 'Khóa API không hợp lệ'),
        domains: data.domains,
      });

      if (data.valid) {
        showToast('✅ Đã xác thực Resend API Key thành công!');
      } else {
        showToast('❌ Resend API Key chưa hợp lệ. Vui lòng kiểm tra lại!');
      }
    } catch (err: any) {
      setIsVerifyingResendKey(false);
      setResendVerifyResult({
        tested: true,
        valid: false,
        message: 'Không thể kết nối máy chủ để kiểm tra: ' + (err?.message || String(err)),
      });
    }
  };

  // Dispatch single email (via /api/send-email or fallback)
  const sendEmailToRecipient = async (recip: EmailRecipient, template: EmailTemplate): Promise<{ success: boolean; resendId?: string; error?: string }> => {
    const finalSubject = replacePlaceholders(template.subject, recip);
    const finalContent = replacePlaceholders(template.content, recip);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recip.email,
          toName: recip.name,
          subject: finalSubject,
          html: finalContent,
          senderName: campaign.senderName || 'Ban Tổ Chức Hội Thảo Thẩm Mỹ Việt – Hàn 2026',
          senderEmail: campaign.senderEmail || 'onboarding@resend.dev',
          replyToEmail: campaign.replyToEmail || 'support@kbitassociation.com',
          resendApiKey: campaign.resendApiKey,
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        const resendId = resData.resendId;
        updateEmailRecipientStatus(recip.id, 'sent', undefined, resendId);
        const logMsg = resendId
          ? `[Resend] Đã gửi thành công tới ${recip.name} <${recip.email}> (ID: ${resendId})`
          : `Đã gửi thành công tới ${recip.name} <${recip.email}>`;
        addLog(logMsg, 'success', resendId);
        return { success: true, resendId };
      } else {
        const errMsg = resData.message || 'Lỗi gửi email máy chủ';
        updateEmailRecipientStatus(recip.id, 'failed', errMsg);
        addLog(`[Lỗi] Không thể gửi tới ${recip.name} (${recip.email}): ${errMsg}`, 'error');
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Lỗi mạng / Không kết nối được API';
      updateEmailRecipientStatus(recip.id, 'failed', errMsg);
      addLog(`[Lỗi Ngoại Lệ] Gửi tới ${recip.email}: ${errMsg}`, 'error');
      return { success: false, error: errMsg };
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) {
      alert('Vui lòng nhập địa chỉ email nhận thư thử nghiệm hợp lệ!');
      return;
    }

    if (!selectedTemplate) {
      alert('Vui lòng chọn mẫu thư mời cần gửi!');
      return;
    }

    setIsSendingTest(true);
    addLog(`Đang gửi thư thử nghiệm tới ${testEmailAddress}...`, 'info');

    const testRecipient: EmailRecipient = {
      id: 'test-preview',
      name: 'Bác sĩ / Đại biểu Thử Nghiệm',
      email: testEmailAddress.trim(),
      organization: 'Bệnh viện / Doanh nghiệp Đối tác',
      recipientType: selectedTemplate.targetAudience === 'business' ? 'business' : 'doctor',
      status: 'pending',
    };

    const result = await sendEmailToRecipient(testRecipient, selectedTemplate);
    setIsSendingTest(false);

    if (result.success) {
      showToast(`✅ Đã gửi thư thử nghiệm thành công tới ${testEmailAddress}! Vui lòng kiểm tra hộp thư (cả mục Hộp thư đến và Spam/Quảng cáo).`);
    } else {
      showToast(`❌ Gửi thử nghiệm thất bại: ${result.error || 'Kiểm tra nhật ký bên dưới'}`);
    }
  };

  // Start Bulk Campaign
  const handleStartCampaign = async () => {
    if (!selectedTemplate) {
      alert('Vui lòng chọn mẫu thư mời cần gửi!');
      return;
    }

    const pendingList = recipients.filter((r) => r.status === 'pending');
    if (pendingList.length === 0) {
      alert('Tất cả người nhận trong danh sách đã được gửi hoặc chưa có ai ở trạng thái "Chưa gửi". Bạn có thể bấm "Đặt lại trạng thái" để gửi lại.');
      return;
    }

    const isResendActive = !!campaign.resendApiKey?.trim();
    const providerNotice = isResendActive
      ? `Hệ thống sẽ gửi THẬT qua Resend API bằng tài khoản [${campaign.senderEmail || 'onboarding@resend.dev'}].`
      : 'Hệ thống đang chạy ở chế độ MÔ PHỎNG (Sandbox) vì chưa có Resend API Key. Nhập API Key trong mục "Cấu hình Resend" để gửi email thật.';

    const confirmSend = window.confirm(
      `Xác nhận bắt đầu gửi thư mời hàng loạt tới ${pendingList.length} người nhận bằng mẫu: "${selectedTemplate.name}"?\n\n${providerNotice}\n\nKhoảng cách điều phối: ${throttleMs}ms/email.`
    );
    if (!confirmSend) return;

    abortControllerRef.current = false;
    setIsCampaignRunning(true);
    setTotalToSend(pendingList.length);
    setCurrentIndex(0);

    addLog(`🚀 Bắt đầu chiến dịch gửi thư mời hàng loạt cho ${pendingList.length} người nhận...`, 'info');

    let processed = 0;
    for (let i = 0; i < pendingList.length; i++) {
      if (abortControllerRef.current) {
        addLog('⏹️ Chiến dịch đã được dừng bởi người quản trị.', 'error');
        break;
      }

      const recip = pendingList[i];
      setCurrentIndex(i + 1);
      updateEmailRecipientStatus(recip.id, 'sending');

      await sendEmailToRecipient(recip, selectedTemplate);
      processed++;

      // Throttle delay to avoid spam flags & respect Resend rate limits
      if (i < pendingList.length - 1 && !abortControllerRef.current) {
        await new Promise((resolve) => setTimeout(resolve, throttleMs));
      }
    }

    setIsCampaignRunning(false);
    showToast(`🎉 Chiến dịch hoàn tất! Đã xử lý ${processed}/${pendingList.length} email.`);
  };

  // Stop / Cancel Campaign
  const handleStopCampaign = () => {
    abortControllerRef.current = true;
    setIsCampaignRunning(false);
    showToast('Đã dừng gửi chiến dịch.');
  };

  // Add Manual Recipient
  const handleAddManualRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipName.trim() || !newRecipEmail.trim() || !newRecipEmail.includes('@')) {
      alert('Vui lòng nhập tên và email hợp lệ!');
      return;
    }

    const existing = recipients.find((r) => r.email.toLowerCase() === newRecipEmail.trim().toLowerCase());
    if (existing) {
      alert(`Email ${newRecipEmail} đã tồn tại trong danh sách!`);
      return;
    }

    const newRec: EmailRecipient = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newRecipName.trim(),
      email: newRecipEmail.trim(),
      organization: newRecipOrg.trim() || 'Chưa cập nhật',
      recipientType: newRecipType,
      status: 'pending',
    };

    addEmailRecipient(newRec);
    setShowAddRecipientModal(false);
    setNewRecipName('');
    setNewRecipEmail('');
    setNewRecipOrg('');
    showToast(`Đã thêm ${newRec.name} vào danh sách nhận thư.`);
  };

  // Import from registrations
  const handleImportFromRegistrations = () => {
    const regList = cmsData.registrations || [];
    if (regList.length === 0) {
      alert('Hiện chưa có đại biểu nào đăng ký trên hệ thống để nhập!');
      return;
    }

    const newRecs: EmailRecipient[] = regList
      .filter((r) => r.email && r.email.includes('@'))
      .map((reg) => ({
        id: `reg-rec-${reg.id}`,
        name: reg.fullName || 'Bác sĩ / Đại biểu',
        email: reg.email,
        organization: reg.institution || 'Cơ quan Y tế / Thẩm mỹ',
        recipientType: reg.attendeeType === 'doctor' ? 'doctor' : 'business',
        status: 'pending',
      }));

    bulkAddEmailRecipients(newRecs);
    showToast(`Đã nhập đồng bộ ${newRecs.length} đại biểu từ danh sách đăng ký website!`);
  };

  // Import Sample VIP aesthetic doctors
  const handleImportSampleVIPs = () => {
    const sampleVIPs: EmailRecipient[] = [
      { id: 'vip-1', name: 'PGS.TS.BS. Lê Hành', email: 'lehanh.plastic@gmail.com', organization: 'Hội Phẫu Thuật Thẩm Mỹ Việt Nam (VSAPS)', recipientType: 'vip', status: 'pending' },
      { id: 'vip-2', name: 'TS.BS. Phạm Cao Kiêm', email: 'dr.caokiem@bv108.vn', organization: 'Bệnh viện Trung ương Quân đội 108', recipientType: 'doctor', status: 'pending' },
      { id: 'vip-3', name: 'BS.CKII. Vũ Thái Hà', email: 'drthaiha.skin@gmail.com', organization: 'Khoa Laser & Săn sóc da - BV Da liễu TƯ', recipientType: 'doctor', status: 'pending' },
      { id: 'vip-4', name: 'Bà Nguyễn Thị Lan Hương', email: 'huong.nguyen@wontechmed.vn', organization: 'Wontech Laser Vietnam', recipientType: 'business', status: 'pending' },
      { id: 'vip-5', name: 'ThS.BS. Hoàng Thanh Tuấn', email: 'thanhtuan.thammy@gmail.com', organization: 'Học viện Quân Y 103', recipientType: 'doctor', status: 'pending' },
      { id: 'vip-6', name: 'Ông Kim Min Soo', email: 'minsoo.kim@hironic.co.kr', organization: 'Hironic Korea Regional HQ', recipientType: 'business', status: 'pending' },
    ];

    bulkAddEmailRecipients(sampleVIPs);
    showToast(`Đã thêm ${sampleVIPs.length} chuyên gia & đối tác VIP vào danh sách!`);
  };

  // Process Bulk Paste Text
  const handleProcessBulkPaste = () => {
    if (!bulkPasteText.trim()) return;

    const lines = bulkPasteText.split('\n');
    const parsedRecipients: EmailRecipient[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let name = '';
      let email = '';
      let org = '';
      let type: EmailRecipient['recipientType'] = 'doctor';

      if (trimmed.includes('<') && trimmed.includes('>')) {
        const parts = trimmed.split('<');
        name = parts[0].trim();
        email = parts[1].replace('>', '').trim();
      } else if (trimmed.includes(',') || trimmed.includes('\t')) {
        const separator = trimmed.includes('\t') ? '\t' : ',';
        const parts = trimmed.split(separator).map((p) => p.trim());
        name = parts[0] || '';
        email = parts[1] || '';
        org = parts[2] || '';
        if (parts[3]) {
          const t = parts[3].toLowerCase();
          if (t.includes('doanh') || t.includes('biz') || t.includes('business')) type = 'business';
          else if (t.includes('vip')) type = 'vip';
          else type = 'doctor';
        }
      } else if (trimmed.includes('@')) {
        email = trimmed;
        name = trimmed.split('@')[0];
      }

      if (email && email.includes('@')) {
        parsedRecipients.push({
          id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: name || email.split('@')[0],
          email: email,
          organization: org || 'Chưa cập nhật',
          recipientType: type,
          status: 'pending',
        });
      }
    });

    if (parsedRecipients.length === 0) {
      alert('Không tìm thấy địa chỉ email hợp lệ nào trong văn bản vừa dán!');
      return;
    }

    bulkAddEmailRecipients(parsedRecipients);
    setShowBulkPasteModal(false);
    setBulkPasteText('');
    showToast(`Đã nhập thành công ${parsedRecipients.length} người nhận từ danh sách!`);
  };

  // Insert placeholder tag into template content
  const handleInsertTag = (tag: string) => {
    if (!selectedTemplate) return;
    const updatedContent = (selectedTemplate.content || '') + ` ${tag} `;
    const updatedTemplates = templates.map((t) =>
      t.id === selectedTemplate.id ? { ...t, content: updatedContent } : t
    );
    updateEmailCampaignConfig({ templates: updatedTemplates });
    showToast(`Đã chèn thẻ biến ${tag} vào mẫu thư!`);
  };

  // Update selected template fields
  const handleUpdateTemplate = (field: keyof EmailTemplate, val: any) => {
    if (!selectedTemplate) return;
    const updatedTemplates = templates.map((t) =>
      t.id === selectedTemplate.id ? { ...t, [field]: val } : t
    );
    updateEmailCampaignConfig({ templates: updatedTemplates });
  };

  // Export CSV of recipients and sending status
  const handleExportCampaignCsv = () => {
    const headers = ['Họ và Tên', 'Email', 'Cơ Quan / Đơn Vị', 'Đối Tượng', 'Trạng Thái', 'Resend Email ID', 'Thời Gian Gửi', 'Ghi Chú Lỗi'];
    const rows = recipients.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${(r.organization || '').replace(/"/g, '""')}"`,
      `"${r.recipientType || 'general'}"`,
      `"${r.status === 'sent' ? 'Đã gửi thành công' : r.status === 'failed' ? 'Thất bại' : r.status === 'sending' ? 'Đang gửi' : 'Chưa gửi'}"`,
      `"${r.resendEmailId || ''}"`,
      `"${r.sentAt || ''}"`,
      `"${(r.errorMessage || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Ket_qua_gui_email_thu_moi_Resend_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Đã xuất báo cáo gửi email ra file CSV thành công!');
  };

  const isResendConfigured = Boolean(campaign.resendApiKey && campaign.resendApiKey.trim().startsWith('re_'));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Resend Status Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#002045] via-[#174ea6] to-[#4f46e5] text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Chiến Dịch Gửi Email Thư Mời Hàng Loạt
                </h2>
                {/* Resend Status Badge */}
                {isResendConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-400/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Cổng Gửi Thật Resend API: Đang Bật</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-300/30">
                    <Info className="w-3.5 h-3.5" />
                    <span>Chế độ Mô phỏng (Chưa gắn Resend Key)</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
                Tích hợp nền tảng gửi email đám mây <strong>Resend</strong> với tỷ lệ vào Inbox cao, chống spam &amp; theo dõi trạng thái gửi
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons on header */}
        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${
              isResendConfigured
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white animate-pulse'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{isResendConfigured ? 'Cấu Hình Resend API' : 'Cài Đặt Resend API Key'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCampaignCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Xuất Báo Cáo CSV</span>
          </button>
        </div>
      </div>

      {/* Resend Integration Alert & Instructions */}
      {!isResendConfigured && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-black">
              R
            </div>
            <div className="space-y-0.5">
              <h4 className="font-black text-amber-950 text-sm">
                Bạn đang ở chế độ xem trước (Sandbox)!
              </h4>
              <p className="text-amber-800 leading-relaxed">
                Để gửi email <strong>thật sự đến hộp thư của các Bác sĩ &amp; Doanh nghiệp</strong> qua hạ tầng Resend, vui lòng lấy API Key miễn phí tại{' '}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1"
                >
                  resend.com/api-keys <ExternalLink className="w-3 h-3" />
                </a>{' '}
                và dán vào nút <strong>"Cài Đặt Resend API Key"</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shrink-0 cursor-pointer shadow-xs"
          >
            Cài Đặt Ngay
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1.5">
            <span>Tổng Danh Bạ</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRecipients}</div>
          <div className="text-[11px] text-slate-500 mt-1">Bác sĩ, VIP &amp; Doanh nghiệp</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold mb-1.5">
            <span>Đã Gửi Thành Công</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{sentCount}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            Đạt {progressPercent}% chiến dịch
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-semibold mb-1.5">
            <span>Đang Chờ Gửi</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="text-[11px] text-amber-700 mt-1">Sẵn sàng điều phối</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-semibold mb-1.5">
            <span>Lỗi / Cần Kiểm Tra</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{failedCount}</div>
          <div className="text-[11px] text-rose-500 mt-1">Có lý do lỗi chi tiết</div>
        </div>
      </div>

      {/* Campaign Control Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Bảng Điều Khiển Gửi Thư Resend Tự Động</span>
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span>Đang chọn mẫu: <strong className="text-indigo-700">{selectedTemplate?.name || 'Chưa chọn'}</strong></span>
              <span>•</span>
              <span>Người gửi: <strong className="font-mono text-slate-800">{campaign.senderEmail || 'onboarding@resend.dev'}</strong></span>
              <span>•</span>
              <span>Độ trễ Resend: <strong>{throttleMs}ms</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isCampaignRunning ? (
              <button
                type="button"
                onClick={handleStopCampaign}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all cursor-pointer animate-pulse"
              >
                <Pause className="w-4 h-4" />
                <span>DỪNG CHIẾN DỊCH</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartCampaign}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-[#174ea6] hover:opacity-95 text-white font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>BẮT ĐẦU GỬI QUA RESEND ({pendingCount} CHƯA GỬI)</span>
              </button>
            )}

            <button
              type="button"
              onClick={resetEmailRecipientsStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Đặt lại trạng thái tất cả người nhận về 'Chưa gửi' để gửi lại"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Đặt Lại Trạng Thái (Reset)</span>
            </button>
          </div>
        </div>

        {/* Real-time Progress Bar */}
        {(isCampaignRunning || sentCount > 0) && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-indigo-900 flex items-center gap-2">
                {isCampaignRunning ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                    <span>Đang điều phối gửi thư mời qua Resend ({currentIndex}/{totalToSend || totalRecipients})...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Chiến dịch gửi hoàn tất ({sentCount}/{totalRecipients})</span>
                  </>
                )}
              </span>
              <span className="text-indigo-700 font-mono font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-indigo-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Test Email Dispatch */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 shrink-0">Thử nghiệm Resend:</span>
            <input
              type="email"
              placeholder="Nhập email của bạn (vd: your@gmail.com)"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              className="w-full sm:w-80 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
            >
              {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Gửi Thử 1 Thư</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold">Tốc độ gửi Resend:</span>
            <select
              value={throttleMs}
              onChange={(e) => setThrottleMs(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium outline-none bg-white"
            >
              <option value={600}>Nhanh (600ms / email - ~1.6 req/s)</option>
              <option value={1000}>Tiêu chuẩn Resend (1.0s / email - Khuyên dùng)</option>
              <option value={1500}>An toàn chống spam (1.5s / email)</option>
              <option value={3000}>Chậm (3.0s / email)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Template Editor + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Selection & Content Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Nội Dung Thư Mời &amp; Mẫu Soạn Thảo</span>
              </h3>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTabSubView('editor')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTabSubView === 'editor' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Soạn thảo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabSubView('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTabSubView === 'preview' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Xem trước trực tiếp
                </button>
              </div>
            </div>

            {/* Template Selector Chips */}
            <div>
              <label className="block text-[11.5px] font-bold text-slate-700 mb-1.5">
                Chọn Mẫu Thư Mời:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {templates.map((tpl) => {
                  const isSelected = tpl.id === campaign.selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => updateEmailCampaignConfig({ selectedTemplateId: tpl.id })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-200'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700">
                          {tpl.targetAudience === 'doctor' ? 'Bác Sĩ' : tpl.targetAudience === 'business' ? 'B2B' : 'Nhắc Hẹn'}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">{tpl.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Variable Chips for 1-Click Insertion */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bấm để chèn Thẻ Cá Nhân Hóa (Dynamic Tags):</span>
                </span>
                <span className="text-[10.5px] text-slate-500">Tự động thay bằng thông tin từng đại biểu</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '{{name}}', label: 'Tên đại biểu', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                  { tag: '{{organization}}', label: 'Cơ quan / Bệnh viện', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { tag: '{{event_name}}', label: 'Tên hội nghị', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { tag: '{{event_date}}', label: 'Ngày diễn ra', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { tag: '{{event_venue}}', label: 'Địa điểm tổ chức', color: 'bg-rose-50 text-rose-700 border-rose-200' },
                  { tag: '{{invitation_link}}', label: 'Link xác nhận đăng ký', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border transition-all hover:scale-105 cursor-pointer ${item.color}`}
                    title={`Chèn ${item.tag} vào nội dung`}
                  >
                    + {item.tag} <span className="font-sans text-[10px] opacity-75">({item.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                Tiêu Đề Email (Subject Line)
              </label>
              <input
                type="text"
                value={selectedTemplate?.subject || ''}
                onChange={(e) => handleUpdateTemplate('subject', e.target.value)}
                placeholder="VD: [Thư Mời Danh Dự] Tham dự Hội nghị Thẩm mỹ Việt – Hàn 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-indigo-600"
              />
            </div>

            {/* HTML Email Content Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11.5px] font-bold text-slate-700">
                  Nội Dung Thư (Định Dạng HTML / Văn Bản)
                </label>
                <span className="text-[10.5px] text-slate-500">Hỗ trợ các thẻ &lt;p&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;div&gt;</span>
              </div>
              <textarea
                rows={12}
                value={selectedTemplate?.content || ''}
                onChange={(e) => handleUpdateTemplate('content', e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-mono outline-none focus:border-indigo-600 leading-relaxed resize-y bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Gmail / Email Client Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md overflow-hidden flex flex-col h-full min-h-[580px]">
            {/* Simulated Email Client Top Bar */}
            <div className="px-4 py-3 bg-[#f2f6fc] border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11.5px] font-bold text-slate-700 ml-2">Mô Phỏng Hộp Thư Khách Hàng (Gmail / Apple Mail)</span>
              </div>

              {/* Sample Recipient Switcher */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Xem thử:</span>
                <select
                  value={previewRecipientId}
                  onChange={(e) => setPreviewRecipientId(e.target.value)}
                  className="px-2 py-0.5 rounded-lg border border-slate-200 text-[11px] font-medium bg-white outline-none"
                >
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.organization || r.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Message Header */}
            <div className="p-4 bg-white border-b border-slate-100 space-y-2 shrink-0">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {currentSubject || '(Chưa có tiêu đề)'}
              </h4>
              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {campaign.senderName?.charAt(0) || 'B'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>{campaign.senderName}</span>
                      <span className="text-[10px] font-normal text-slate-400">&lt;{campaign.senderEmail || 'onboarding@resend.dev'}&gt;</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Gửi tới: <strong className="text-slate-800">{previewRecipient.name}</strong> &lt;{previewRecipient.email}&gt;
                    </div>
                  </div>
                </div>
                <span className="text-[10.5px] text-slate-400 shrink-0">10:25 AM</span>
              </div>
            </div>

            {/* Rendered Email HTML Content View */}
            <div className="p-5 flex-1 overflow-y-auto bg-[#fafafa]">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 text-xs sm:text-[13px] text-slate-800 leading-relaxed space-y-3 font-sans">
                {/* Simulated Header Logo */}
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[#174ea6] tracking-wider">
                    HỘI THẢO THẨM MỸ VIỆT – HÀN 2026
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                    Thư Mời Chính Thức
                  </span>
                </div>

                {/* Body Content with HTML dangerouslySetInnerHTML */}
                <div
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: currentHtml }}
                />

                {/* Footer simulation */}
                <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                  <p>Email này được gửi từ Ban Tổ Chức Hội Thảo Khoa Học Thẩm Mỹ Việt – Hàn 2026.</p>
                  <p>Địa chỉ: {cmsData.eventDetails.location || 'Bệnh viện Trung ương Quân đội 108, Hà Nội'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Management Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Quản Lý Danh Sách Người Nhận ({filteredRecipients.length}/{totalRecipients})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Thêm bác sĩ, đối tác kinh doanh hoặc nhập tự động từ các đại biểu đã đăng ký trên website
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleImportFromRegistrations}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nhập từ Đăng ký Web ({cmsData.registrations?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={handleImportSampleVIPs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Nhập VIP Mẫu</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkPasteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Dán Danh Sách Nhanh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddRecipientModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Thủ Công</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, bệnh viện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'doctor', label: 'Bác sĩ' },
              { key: 'business', label: 'Doanh nghiệp' },
              { key: 'vip', label: 'VIP' },
              { key: 'pending', label: 'Chưa gửi' },
              { key: 'sent', label: 'Đã gửi' },
              { key: 'failed', label: 'Thất bại' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterType(f.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  filterType === f.key
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipients Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4">Đại Biểu / Khách Mời</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Cơ Quan / Đơn Vị</th>
                  <th className="py-3 px-4">Đối Tượng</th>
                  <th className="py-3 px-4">Trạng Thái &amp; Resend ID</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecipients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Không tìm thấy người nhận nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredRecipients.map((recip) => (
                    <tr key={recip.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {recip.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {recip.email}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {recip.organization || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                            recip.recipientType === 'doctor'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : recip.recipientType === 'business'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : recip.recipientType === 'vip'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {recip.recipientType === 'doctor'
                            ? 'Bác Sĩ'
                            : recip.recipientType === 'business'
                            ? 'Doanh Nghiệp'
                            : recip.recipientType === 'vip'
                            ? 'VIP'
                            : 'Đại Biểu'}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-y-1">
                        <div>
                          {recip.status === 'sent' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3" />
                              <span>Đã gửi {recip.sentAt ? `(${recip.sentAt})` : ''}</span>
                            </span>
                          )}
                          {recip.status === 'sending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Đang gửi...</span>
                            </span>
                          )}
                          {recip.status === 'failed' && (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                              title={recip.errorMessage || 'Lỗi gửi'}
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>Lỗi gửi: {recip.errorMessage?.slice(0, 32)}...</span>
                            </span>
                          )}
                          {recip.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                              <span>Chưa gửi</span>
                            </span>
                          )}
                        </div>

                        {/* Display Resend Tracking Email ID if available */}
                        {recip.resendEmailId && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                            <span>Resend ID:</span>
                            <span className="text-indigo-600 font-bold">{recip.resendEmailId.slice(0, 14)}...</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(recip.resendEmailId || '');
                                showToast('Đã chép Resend Email ID!');
                              }}
                              className="p-0.5 hover:text-slate-800"
                              title="Sao chép Resend ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedTemplate) return;
                            sendEmailToRecipient(recip, selectedTemplate);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                          title="Gửi riêng email này ngay"
                        >
                          Gửi Thư
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEmailRecipient(recip.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Activity & Log Box */}
      {campaignLogs.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Nhật Ký Điều Phối Resend (Live Dispatch Logs)</span>
            </span>
            <button
              type="button"
              onClick={() => setCampaignLogs([])}
              className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              Xóa log
            </button>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-2">
            {campaignLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span
                  className={
                    log.type === 'success'
                      ? 'text-emerald-400'
                      : log.type === 'error'
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }
                >
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Thêm người nhận thủ công */}
      {showAddRecipientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>Thêm Khách Mời Vào Danh Bạ</span>
            </h3>

            <form onSubmit={handleAddManualRecipient} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và Tên (*)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: TS.BS. Trần Văn Hùng"
                  value={newRecipName}
                  onChange={(e) => setNewRecipName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ Email (*)</label>
                <input
                  type="email"
                  required
                  placeholder="VD: dr.hung@benhvien108.vn"
                  value={newRecipEmail}
                  onChange={(e) => setNewRecipEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cơ Quan / Bệnh Viện / Công Ty</label>
                <input
                  type="text"
                  placeholder="VD: Bệnh viện Trung ương Quân đội 108"
                  value={newRecipOrg}
                  onChange={(e) => setNewRecipOrg(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nhóm Khách Mời</label>
                <select
                  value={newRecipType}
                  onChange={(e) => setNewRecipType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
                >
                  <option value="doctor">Bác sĩ &amp; Chuyên gia Y khoa</option>
                  <option value="business">Doanh nghiệp Thẩm mỹ &amp; Thiết bị</option>
                  <option value="vip">Khách Mời Danh Dự (VIP)</option>
                  <option value="general">Đại biểu Tự do</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRecipientModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Lưu Khách Mời
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Dán danh sách nhanh (Bulk Paste) */}
      {showBulkPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span>Dán Danh Sách Email Hàng Loạt</span>
            </h3>

            <p className="text-xs text-slate-500">
              Hỗ trợ copy paste trực tiếp từ file Excel hoặc file text. Định dạng:
              <br />
              <code className="text-indigo-600 font-mono">Tên, Email, Bệnh viện, Nhóm (Bác sĩ/Doanh nghiệp)</code>
              <br />
              hoặc đơn giản là mỗi dòng 1 địa chỉ email.
            </p>

            <textarea
              rows={8}
              placeholder={`BS. Nguyễn Văn A, dr.a@gmail.com, BV 108, Bác sĩ\nBà Trần Thị B, b.tran@kbeauty.vn, K-Beauty Corp, Doanh nghiệp\ncustomer@example.com`}
              value={bulkPasteText}
              onChange={(e) => setBulkPasteText(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-mono outline-none focus:border-indigo-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkPasteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleProcessBulkPaste}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Bóc Tách &amp; Thêm Vào Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cấu hình Người gửi & Resend API Key */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  R
                </div>
                <span>Cấu Hình Gửi Email Bằng Resend</span>
              </h3>
              <a
                href="https://resend.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                resend.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-4">
              {/* Resend API Key Input Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Khóa Resend API Key (*)</span>
                  </label>
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
                  >
                    + Lấy API Key miễn phí <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={campaign.resendApiKey || ''}
                    onChange={(e) => updateEmailCampaignConfig({ resendApiKey: e.target.value })}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-mono outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyResendKey()}
                    disabled={isVerifyingResendKey}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isVerifyingResendKey ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>Kiểm Tra Key</span>
                  </button>
                </div>

                {/* Test Result Message */}
                {resendVerifyResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
                      resendVerifyResult.valid
                        ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100/80 text-rose-900 border border-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {resendVerifyResult.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{resendVerifyResult.message}</span>
                    </div>
                    {resendVerifyResult.domains && resendVerifyResult.domains.length > 0 && (
                      <div className="mt-1.5 text-[11px] text-emerald-800">
                        Tên miền đã xác thực: <strong>{resendVerifyResult.domains.map((d: any) => d.name).join(', ')}</strong>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  💡 Khóa Resend bắt đầu bằng <code>re_</code>. Bạn có thể tạo miễn phí trong 30 giây để gửi 3,000 email/tháng (100 email/ngày) không mất phí.
                </p>
              </div>

              {/* Sender Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Người Gửi (Sender Name)
                </label>
                <input
                  type="text"
                  value={campaign.senderName || ''}
                  onChange={(e) => updateEmailCampaignConfig({ senderName: e.target.value })}
                  placeholder="VD: Ban Tổ Chức Hội Thảo Thẩm Mỹ Việt – Hàn 2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600"
                />
              </div>

              {/* Sender Email with Resend Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Địa Chỉ Email Gửi (Sender Email)
                </label>
                <input
                  type="email"
                  value={campaign.senderEmail || ''}
                  onChange={(e) => updateEmailCampaignConfig({ senderEmail: e.target.value })}
                  placeholder="onboarding@resend.dev"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-indigo-600"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10.5px] text-slate-500">Mẫu sẵn:</span>
                  <button
                    type="button"
                    onClick={() => updateEmailCampaignConfig({ senderEmail: 'onboarding@resend.dev' })}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10.5px] font-mono font-medium text-slate-700 cursor-pointer"
                  >
                    onboarding@resend.dev (Mặc định miễn phí)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateEmailCampaignConfig({ senderEmail: 'invitation@kbitassociation.com' })}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10.5px] font-mono font-medium text-slate-700 cursor-pointer"
                  >
                    invitation@kbitassociation.com
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-500">
                  * Nếu bạn chưa cấu hình DNS tên miền riêng trên Resend, hãy dùng <code>onboarding@resend.dev</code> để gửi được ngay.
                </p>
              </div>

              {/* Reply-To Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Nhận Phản Hồi (Reply-To Email)
                </label>
                <input
                  type="email"
                  value={campaign.replyToEmail || ''}
                  onChange={(e) => updateEmailCampaignConfig({ replyToEmail: e.target.value })}
                  placeholder="support@kbitassociation.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-indigo-600"
                />
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Khi khách mời bấm "Trả lời (Reply)", email sẽ gửi trực tiếp đến địa chỉ này của Ban Thư Ký.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Tự động lưu vào cấu hình hệ thống
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  showToast('Đã lưu cấu hình Resend thành công!');
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Hoàn Tất &amp; Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
