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
  EyeOff,
  Zap,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Server,
  Phone,
  FileDown,
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { EmailRecipient, EmailTemplate, GmailSenderAccount, HostingerSenderAccount } from '../../types';
import { DEFAULT_HOSTINGER_POOL } from '../../data/symposiumData';

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
    updateGmailSenderAccount,
    addGmailSenderAccount,
    removeGmailSenderAccount,
    incrementGmailSentToday,
    resetGmailDailyQuotas,
    updateHostingerSenderAccount,
    addHostingerSenderAccount,
    removeHostingerSenderAccount,
    incrementHostingerSentToday,
    resetHostingerDailyQuotas,
  } = useCMS();

  const campaign = cmsData.emailCampaignConfig || {
    senderName: 'Ban Tổ Chức Hội Thảo Thẩm Mỹ Việt – Hàn 2026',
    senderEmail: 'bantin@kbit-symposium.com',
    replyToEmail: 'support@kbitassociation.com',
    sendProvider: 'hostinger',
    resendApiKey: '',
    resendDomain: '',
    gmailPool: [],
    hostingerPool: DEFAULT_HOSTINGER_POOL,
    recipients: [],
    templates: [],
    selectedTemplateId: '',
  };

  const templates = campaign.templates || [];
  const recipients = campaign.recipients || [];
  const selectedTemplate = templates.find((t) => t.id === campaign.selectedTemplateId) || templates[0];
  const gmailPool = campaign.gmailPool || [];
  const hostingerPool = campaign.hostingerPool && campaign.hostingerPool.length > 0 ? campaign.hostingerPool : DEFAULT_HOSTINGER_POOL;

  // Provider mode: 'hostinger' | 'gmail_pool' | 'resend' | 'simulation'
  const sendProvider = campaign.sendProvider || 'hostinger';

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'doctor' | 'business' | 'vip' | 'pending' | 'sent' | 'failed'>('all');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showGmailHelpModal, setShowGmailHelpModal] = useState(false);
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [previewRecipientId, setPreviewRecipientId] = useState<string>(recipients[0]?.id || '');
  const [activeTabSubView, setActiveTabSubView] = useState<'editor' | 'preview'>('editor');

  // CSV 3-Column Upload & Preview States
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [showCsvPreviewModal, setShowCsvPreviewModal] = useState(false);
  const [parsedCsvData, setParsedCsvData] = useState<Array<{ name: string; email: string; phone: string }>>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvDuplicateCount, setCsvDuplicateCount] = useState(0);
  const [csvDefaultAudience, setCsvDefaultAudience] = useState<'doctor' | 'business' | 'vip' | 'general'>('doctor');

  // Show/Hide App Passwords
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Gmail testing states
  const [testingGmailId, setTestingGmailId] = useState<string | null>(null);
  const [testingAllGmail, setTestingAllGmail] = useState(false);
  const [gmailTestResults, setGmailTestResults] = useState<Record<string, { valid: boolean; message: string }>>({});

  // Hostinger testing states
  const [testingHostingerId, setTestingHostingerId] = useState<string | null>(null);
  const [testingAllHostinger, setTestingAllHostinger] = useState(false);
  const [hostingerTestResults, setHostingerTestResults] = useState<Record<string, { valid: boolean; message: string }>>({});
  const [showHostingerPasswordMap, setShowHostingerPasswordMap] = useState<Record<string, boolean>>({});
  const [showHostingerHelpModal, setShowHostingerHelpModal] = useState(false);
  const toggleShowHostingerPassword = (id: string) => {
    setShowHostingerPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
  const [throttleMs, setThrottleMs] = useState(1200); // 1.2s delay between emails for safety
  const [campaignLogs, setCampaignLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'error'; account?: string }>>([]);
  const abortControllerRef = useRef<boolean>(false);

  // New recipient form state
  const [newRecipName, setNewRecipName] = useState('');
  const [newRecipEmail, setNewRecipEmail] = useState('');
  const [newRecipPhone, setNewRecipPhone] = useState('');
  const [newRecipOrg, setNewRecipOrg] = useState('');
  const [newRecipType, setNewRecipType] = useState<'doctor' | 'business' | 'vip' | 'general'>('doctor');

  // Preview target recipient
  const previewRecipient = recipients.find((r) => r.id === previewRecipientId) || recipients[0] || {
    id: 'sample',
    name: 'TS.BS. Nguyễn Văn Hùng',
    email: 'dr.hung@benhvien108.vn',
    phone: '0908 123 456',
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
      .replace(/{{phone}}/g, recip.phone || '')
      .replace(/{{email}}/g, recip.email || '')
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

  // Gmail Pool Statistics
  const totalPoolCapacity = gmailPool.reduce((acc, g) => acc + (g.dailyQuota || 500), 0);
  const totalPoolSentToday = gmailPool.reduce((acc, g) => acc + (g.sentToday || 0), 0);
  const activeGmailAccounts = gmailPool.filter((g) => g.isActive && g.email && g.appPassword);
  const readyGmailAccounts = activeGmailAccounts.filter((g) => (g.sentToday || 0) < (g.dailyQuota || 500));
  const poolUsagePercent = totalPoolCapacity > 0 ? Math.round((totalPoolSentToday / totalPoolCapacity) * 100) : 0;

  // Hostinger Pool Statistics
  const totalHostingerCapacity = hostingerPool.reduce((acc, h) => acc + (h.isActive ? (h.dailyQuota || 1000) : 0), 0);
  const totalHostingerSentToday = hostingerPool.reduce((acc, h) => acc + (h.sentToday || 0), 0);
  const activeHostingerAccounts = hostingerPool.filter((h) => h.isActive && h.email && h.password);
  const readyHostingerAccounts = activeHostingerAccounts.filter((h) => (h.sentToday || 0) < (h.dailyQuota || 1000));
  const hostingerUsagePercent = totalHostingerCapacity > 0 ? Math.round((totalHostingerSentToday / totalHostingerCapacity) * 100) : 0;

  // Filtered Recipients
  const filteredRecipients = recipients.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone || '').includes(searchTerm) ||
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
  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info', account?: string) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setCampaignLogs((prev) => [{ time, text, type, account }, ...prev.slice(0, 199)]);
  };

  // Split CSV line respecting quotes
  const parseCsvLine = (text: string, delimiter: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Handle CSV file upload (3 Columns: Tên, Email, Số điện thoại)
  const handleFileUploadCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let content = (event.target?.result as string) || '';
        // Strip UTF-8 BOM
        if (content.charCodeAt(0) === 0xfeff) {
          content = content.slice(1);
        }

        const lines = content.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) {
          alert('File CSV rỗng, không có dữ liệu!');
          return;
        }

        // Detect delimiter: comma, semicolon, or tab
        const sampleLine = lines[0];
        let delimiter = ',';
        if (sampleLine.includes(';') && !sampleLine.includes(',')) delimiter = ';';
        else if (sampleLine.includes('\t')) delimiter = '\t';

        let startIndex = 0;
        let nameCol = 0;
        let emailCol = 1;
        let phoneCol = 2;

        // Check if header row exists
        const firstRowCells = parseCsvLine(sampleLine, delimiter).map((c) => c.toLowerCase());
        const isHeader = firstRowCells.some(
          (c) =>
            c.includes('tên') ||
            c.includes('ten') ||
            c.includes('name') ||
            c.includes('họ') ||
            c.includes('email') ||
            c.includes('sđt') ||
            c.includes('sdt') ||
            c.includes('phone') ||
            c.includes('thoại') ||
            c.includes('thoai')
        );

        if (isHeader) {
          startIndex = 1;
          firstRowCells.forEach((c, idx) => {
            if (c.includes('email') || c.includes('mail')) {
              emailCol = idx;
            } else if (
              c.includes('phone') ||
              c.includes('sđt') ||
              c.includes('sdt') ||
              c.includes('thoại') ||
              c.includes('thoai') ||
              c.includes('tel') ||
              c.includes('mobile')
            ) {
              phoneCol = idx;
            } else if (c.includes('tên') || c.includes('ten') || c.includes('name') || c.includes('họ') || c.includes('ho')) {
              nameCol = idx;
            }
          });
        }

        const existingEmails = new Set(recipients.map((r) => r.email.toLowerCase().trim()));
        const seenInFile = new Set<string>();
        const validRecords: Array<{ name: string; email: string; phone: string }> = [];
        let duplicateCount = 0;

        for (let i = startIndex; i < lines.length; i++) {
          const cells = parseCsvLine(lines[i], delimiter);
          if (cells.length < 2 && !cells[0]?.includes('@')) continue;

          let rawName = cells[nameCol] || '';
          let rawEmail = cells[emailCol] || '';
          let rawPhone = cells[phoneCol] || '';

          // Fallback if columns are shifted: locate cell containing @
          if (!rawEmail.includes('@')) {
            const emailCandidate = cells.find((c) => c.includes('@'));
            if (emailCandidate) {
              rawEmail = emailCandidate;
              const remaining = cells.filter((c) => c !== rawEmail);
              rawName = remaining[0] || rawName;
              rawPhone = remaining[1] || rawPhone;
            }
          }

          const cleanEmail = rawEmail.replace(/["']/g, '').trim().toLowerCase();
          const cleanName = rawName.replace(/["']/g, '').trim();
          let cleanPhone = rawPhone.replace(/["']/g, '').trim();

          if (!cleanEmail || !cleanEmail.includes('@')) continue;

          if (existingEmails.has(cleanEmail) || seenInFile.has(cleanEmail)) {
            duplicateCount++;
            continue;
          }

          seenInFile.add(cleanEmail);
          validRecords.push({
            name: cleanName || cleanEmail.split('@')[0],
            email: cleanEmail,
            phone: cleanPhone,
          });
        }

        if (validRecords.length === 0) {
          alert('Không tìm thấy bản ghi email hợp lệ nào trong file CSV!');
          return;
        }

        setParsedCsvData(validRecords);
        setCsvFileName(file.name);
        setCsvDuplicateCount(duplicateCount);
        setShowCsvPreviewModal(true);
      } catch (err: any) {
        alert('Lỗi đọc file CSV: ' + (err?.message || String(err)));
      } finally {
        if (csvFileInputRef.current) csvFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Confirm Import CSV
  const handleConfirmImportCsv = () => {
    if (parsedCsvData.length === 0) return;

    const newRecipients: EmailRecipient[] = parsedCsvData.map((item, idx) => ({
      id: `csv-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      email: item.email,
      phone: item.phone,
      organization: 'Chưa cập nhật',
      recipientType: csvDefaultAudience,
      status: 'pending',
    }));

    bulkAddEmailRecipients(newRecipients);
    setShowCsvPreviewModal(false);
    setParsedCsvData([]);
    showToast(`✅ Đã nạp thành công ${newRecipients.length} khách mời vào danh bạ!`);
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const sampleRows = [
      ['Họ và tên', 'Email', 'Số điện thoại'],
      ['TS.BS. Nguyễn Văn An', 'nguyenvanan@gmail.com', '0901234567'],
      ['ThS.BS. Trần Thị Mai', 'tranthimai@bv108.vn', '0912345678'],
      ['BS.CKII. Lê Hoàng Nam', 'hoangnam@vinmec.com', '0988776655'],
      ['Ông Phạm Minh Đức', 'duc.pham@kbeautycorp.vn', '0934567890'],
      ['Bà Hoàng Kim Oanh', 'kimoanh@aestheticgroup.vn', '0918999111'],
    ];

    const csvContent = '\uFEFF' + sampleRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mau_danh_ba_3_cot_Ten_Email_SDT.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Đã tải file CSV mẫu (3 cột) thành công!');
  };

  // Test single Gmail SMTP connection
  const testGmailAccount = async (account: GmailSenderAccount): Promise<boolean> => {
    if (!account.email || !account.appPassword) {
      setGmailTestResults((prev) => ({
        ...prev,
        [account.id]: { valid: false, message: 'Chưa điền email hoặc Mật khẩu ứng dụng (App Password).' },
      }));
      return false;
    }

    setTestingGmailId(account.id);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_gmail',
          gmailAuth: {
            user: account.email.trim(),
            pass: account.appPassword.trim(),
          },
        }),
      });

      const data = await res.json();
      setTestingGmailId(null);
      setGmailTestResults((prev) => ({
        ...prev,
        [account.id]: { valid: data.valid, message: data.message },
      }));

      if (data.valid) {
        updateGmailSenderAccount(account.id, { status: (account.sentToday || 0) >= (account.dailyQuota || 500) ? 'quota_reached' : 'ready', lastError: undefined });
        showToast(`✅ [${account.email}] Kết nối Gmail SMTP thành công!`);
        return true;
      } else {
        updateGmailSenderAccount(account.id, { status: 'error', lastError: data.message });
        showToast(`❌ [${account.email}] Lỗi kết nối: ${data.message}`);
        return false;
      }
    } catch (e: any) {
      setTestingGmailId(null);
      setGmailTestResults((prev) => ({
        ...prev,
        [account.id]: { valid: false, message: 'Lỗi mạng: ' + (e?.message || String(e)) },
      }));
      return false;
    }
  };

  // Test all 5 Gmail accounts
  const testAllGmailAccounts = async () => {
    setTestingAllGmail(true);
    addLog('🔍 Đang kiểm tra kết nối toàn bộ cụm tài khoản Gmail...', 'info');

    let successCount = 0;
    for (const acc of gmailPool) {
      if (acc.isActive && acc.email && acc.appPassword) {
        const ok = await testGmailAccount(acc);
        if (ok) successCount++;
      }
    }

    setTestingAllGmail(false);
    showToast(`Đã kiểm tra xong: ${successCount}/${activeGmailAccounts.length} tài khoản Gmail hoạt động tốt!`);
  };

  // Test Hostinger account
  const testHostingerAccount = async (account: HostingerSenderAccount): Promise<boolean> => {
    if (!account.email || !account.password) {
      setHostingerTestResults((prev) => ({
        ...prev,
        [account.id]: { valid: false, message: 'Chưa điền email hoặc mật khẩu hòm thư Hostinger.' },
      }));
      return false;
    }

    setTestingHostingerId(account.id);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_hostinger',
          hostingerAuth: {
            user: account.email.trim(),
            pass: account.password.trim(),
            host: account.smtpHost?.trim() || 'smtp.hostinger.com',
            port: account.smtpPort || 465,
          },
        }),
      });

      const data = await res.json();
      setTestingHostingerId(null);
      setHostingerTestResults((prev) => ({
        ...prev,
        [account.id]: { valid: data.valid, message: data.message },
      }));

      if (data.valid) {
        updateHostingerSenderAccount(account.id, {
          status: (account.sentToday || 0) >= (account.dailyQuota || 1000) ? 'quota_reached' : 'ready',
          lastError: undefined,
        });
        showToast(`✅ [${account.email}] Kết nối Hostinger SMTP thành công!`);
        return true;
      } else {
        updateHostingerSenderAccount(account.id, { status: 'error', lastError: data.message });
        showToast(`❌ [${account.email}] Lỗi kết nối: ${data.message}`);
        return false;
      }
    } catch (e: any) {
      setTestingHostingerId(null);
      setHostingerTestResults((prev) => ({
        ...prev,
        [account.id]: { valid: false, message: 'Lỗi mạng: ' + (e?.message || String(e)) },
      }));
      return false;
    }
  };

  // Test all Hostinger accounts
  const testAllHostingerAccounts = async () => {
    setTestingAllHostinger(true);
    addLog('🔍 Đang kiểm tra kết nối các hòm thư Hostinger SMTP...', 'info');

    let successCount = 0;
    for (const acc of hostingerPool) {
      if (acc.isActive && acc.email && acc.password) {
        const ok = await testHostingerAccount(acc);
        if (ok) successCount++;
      }
    }

    setTestingAllHostinger(false);
    showToast(`Đã kiểm tra xong: ${successCount}/${activeHostingerAccounts.length} tài khoản Hostinger sẵn sàng!`);
  };

  // Add Hostinger account
  const handleAddHostingerAccount = () => {
    const newId = `hostinger-${Date.now()}`;
    const newAccount: HostingerSenderAccount = {
      id: newId,
      email: '',
      password: '',
      smtpHost: 'smtp.hostinger.com',
      smtpPort: 465,
      secure: true,
      senderDisplayName: campaign.senderName || 'Ban Tổ Chức Hội Thảo Thẩm Mỹ Việt – Hàn',
      dailyQuota: 1000,
      sentToday: 0,
      isActive: true,
      status: 'ready',
    };
    addHostingerSenderAccount(newAccount);
    showToast('Đã thêm hòm thư Hostinger mới. Vui lòng nhập email và mật khẩu!');
  };

  // Dispatch single email with specific account or method
  const sendEmailToRecipient = async (
    recip: EmailRecipient,
    template: EmailTemplate,
    chosenGmail?: GmailSenderAccount,
    chosenHostinger?: HostingerSenderAccount
  ): Promise<{ success: boolean; sentBy?: string; error?: string }> => {
    const finalSubject = replacePlaceholders(template.subject, recip);
    const finalContent = replacePlaceholders(template.content, recip);

    let providerToUse = sendProvider;
    if (sendProvider === 'hostinger' && chosenHostinger) {
      providerToUse = 'hostinger';
    } else if (sendProvider === 'gmail_pool' && chosenGmail) {
      providerToUse = 'gmail';
    }

    try {
      const payload: Record<string, any> = {
        provider: providerToUse,
        to: recip.email,
        toName: recip.name,
        subject: finalSubject,
        html: finalContent,
        senderName: chosenHostinger?.senderDisplayName || chosenGmail?.senderDisplayName || campaign.senderName || 'Ban Tổ Chức Hội Thảo Thẩm Mỹ Việt – Hàn 2026',
        replyToEmail: campaign.replyToEmail || 'support@kbitassociation.com',
      };

      if (providerToUse === 'hostinger' && chosenHostinger) {
        payload.hostingerAuth = {
          user: chosenHostinger.email.trim(),
          pass: chosenHostinger.password.trim(),
          host: chosenHostinger.smtpHost?.trim() || 'smtp.hostinger.com',
          port: chosenHostinger.smtpPort || 465,
        };
      } else if (providerToUse === 'gmail' && chosenGmail) {
        payload.gmailAuth = {
          user: chosenGmail.email.trim(),
          pass: chosenGmail.appPassword.trim(),
        };
      } else if (providerToUse === 'resend') {
        payload.resendApiKey = campaign.resendApiKey;
        payload.senderEmail = campaign.senderEmail || 'onboarding@resend.dev';
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        const sentBy = resData.sentBy || (providerToUse === 'hostinger' ? chosenHostinger?.email : (providerToUse === 'gmail' ? chosenGmail?.email : 'Resend'));
        updateEmailRecipientStatus(recip.id, 'sent', undefined, resData.resendId);
        
        if (providerToUse === 'hostinger' && chosenHostinger) {
          incrementHostingerSentToday(chosenHostinger.id);
        } else if (providerToUse === 'gmail' && chosenGmail) {
          incrementGmailSentToday(chosenGmail.id);
        }

        const logMsg = providerToUse === 'hostinger'
          ? `[Hostinger: ${sentBy}] Đã gửi thành công tới ${recip.name} <${recip.email}>`
          : providerToUse === 'gmail'
          ? `[Gmail: ${sentBy}] Đã gửi thành công tới ${recip.name} <${recip.email}>`
          : `[Resend] Đã gửi thành công tới ${recip.name} <${recip.email}> (ID: ${resData.resendId || 'OK'})`;

        addLog(logMsg, 'success', sentBy);
        return { success: true, sentBy };
      } else {
        const errMsg = resData.message || 'Lỗi gửi email máy chủ';
        updateEmailRecipientStatus(recip.id, 'failed', errMsg);
        addLog(`[Lỗi] Không thể gửi tới ${recip.name} (${recip.email}): ${errMsg}`, 'error', (chosenHostinger?.email || chosenGmail?.email));
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
      phone: '0901234567',
      organization: 'Bệnh viện / Doanh nghiệp Đối tác',
      recipientType: selectedTemplate.targetAudience === 'business' ? 'business' : 'doctor',
      status: 'pending',
    };

    const testGmail = sendProvider === 'gmail_pool' ? (readyGmailAccounts[0] || gmailPool[0]) : undefined;
    const testHostinger = sendProvider === 'hostinger' ? (readyHostingerAccounts[0] || hostingerPool[0]) : undefined;
    const result = await sendEmailToRecipient(testRecipient, selectedTemplate, testGmail, testHostinger);
    setIsSendingTest(false);

    if (result.success) {
      showToast(`✅ Đã gửi thư thử nghiệm thành công tới ${testEmailAddress}! Vui lòng kiểm tra hộp thư.`);
    } else {
      showToast(`❌ Gửi thử nghiệm thất bại: ${result.error || 'Kiểm tra nhật ký bên dưới'}`);
    }
  };

  // Start Bulk Campaign with Round-Robin Rotation
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

    if (sendProvider === 'hostinger') {
      if (readyHostingerAccounts.length === 0) {
        alert(
          'Không có tài khoản Hostinger nào sẵn sàng! Vui lòng kiểm tra:\n1. Đã điền email và mật khẩu hòm thư Hostinger\n2. Tài khoản đã bật hoạt động (Active)\n3. Chưa vượt quá hạn mức gửi hôm nay (1.000 email/ngày).'
        );
        return;
      }
    } else if (sendProvider === 'gmail_pool') {
      if (readyGmailAccounts.length === 0) {
        alert(
          'Không có tài khoản Gmail nào sẵn sàng trong cụm! Vui lòng kiểm tra:\n1. Đã điền email và App Password (Mật khẩu ứng dụng)\n2. Tài khoản đã bật hoạt động (Active)\n3. Tài khoản chưa vượt quá hạn ngạch 500 email hôm nay.'
        );
        return;
      }
    }

    const providerTitle =
      sendProvider === 'hostinger'
        ? `HOSTINGER SMTP (${readyHostingerAccounts.length} hòm thư tên miền riêng, tối đa 1.000 email/hòm thư/ngày)`
        : sendProvider === 'gmail_pool'
        ? `CỤM XOAY VÒNG ${readyGmailAccounts.length} TÀI KHOẢN GMAIL (Tối đa 500 email/tài khoản/ngày)`
        : 'Resend API';

    const confirmSend = window.confirm(
      `Xác nhận bắt đầu gửi hàng loạt tới ${pendingList.length} người nhận?\n\nCơ chế: ${providerTitle}.\nKhoảng cách điều phối an toàn: ${throttleMs}ms/email.`
    );
    if (!confirmSend) return;

    abortControllerRef.current = false;
    setIsCampaignRunning(true);
    setTotalToSend(pendingList.length);
    setCurrentIndex(0);

    const logProviderName =
      sendProvider === 'hostinger'
        ? `Hostinger SMTP (${readyHostingerAccounts.length} hòm thư)`
        : sendProvider === 'gmail_pool'
        ? `Cụm ${readyGmailAccounts.length} Gmail`
        : 'Resend';

    addLog(`🚀 Bắt đầu chiến dịch gửi hàng loạt cho ${pendingList.length} người nhận qua ${logProviderName}...`, 'info');

    let processed = 0;
    let roundRobinPointer = 0;

    for (let i = 0; i < pendingList.length; i++) {
      if (abortControllerRef.current) {
        addLog('⏹️ Chiến dịch đã được dừng bởi người quản trị.', 'error');
        break;
      }

      const recip = pendingList[i];
      setCurrentIndex(i + 1);
      updateEmailRecipientStatus(recip.id, 'sending');

      let chosenGmail: GmailSenderAccount | undefined = undefined;
      let chosenHostinger: HostingerSenderAccount | undefined = undefined;

      if (sendProvider === 'hostinger') {
        const currentPool = cmsData.emailCampaignConfig?.hostingerPool || hostingerPool;
        const availableAccounts = currentPool.filter((h) => h.isActive && h.email && h.password && (h.sentToday || 0) < (h.dailyQuota || 1000));

        if (availableAccounts.length === 0) {
          addLog('⚠️ Toàn bộ tài khoản Hostinger đã đạt hạn mức hôm nay! Tạm dừng chiến dịch.', 'error');
          alert('Tất cả các tài khoản Hostinger đã đạt giới hạn gửi hôm nay. Hệ thống tạm dừng để bảo vệ tài khoản.');
          break;
        }

        chosenHostinger = availableAccounts[roundRobinPointer % availableAccounts.length];
        roundRobinPointer++;
      } else if (sendProvider === 'gmail_pool') {
        const currentPool = cmsData.emailCampaignConfig?.gmailPool || gmailPool;
        const availableAccounts = currentPool.filter((g) => g.isActive && g.email && g.appPassword && (g.sentToday || 0) < (g.dailyQuota || 500));

        if (availableAccounts.length === 0) {
          addLog('⚠️ Toàn bộ tài khoản Gmail đã đạt hạn ngạch 500 email hôm nay! Tạm dừng chiến dịch.', 'error');
          alert('Tất cả các tài khoản Gmail trong cụm đã đạt giới hạn 500 email hôm nay (Tổng cộng tối đa 2,500 email/ngày). Hệ thống tạm dừng để bảo vệ tài khoản.');
          break;
        }

        chosenGmail = availableAccounts[roundRobinPointer % availableAccounts.length];
        roundRobinPointer++;
      }

      await sendEmailToRecipient(recip, selectedTemplate, chosenGmail, chosenHostinger);
      processed++;

      // Throttle delay between emails
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
      phone: newRecipPhone.trim() || '',
      organization: newRecipOrg.trim() || 'Chưa cập nhật',
      recipientType: newRecipType,
      status: 'pending',
    };

    addEmailRecipient(newRec);
    setShowAddRecipientModal(false);
    setNewRecipName('');
    setNewRecipEmail('');
    setNewRecipPhone('');
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
        phone: reg.phone || '',
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
      { id: 'vip-1', name: 'PGS.TS.BS. Lê Hành', email: 'lehanh.plastic@gmail.com', phone: '0903 111 222', organization: 'Hội Phẫu Thuật Thẩm Mỹ Việt Nam (VSAPS)', recipientType: 'vip', status: 'pending' },
      { id: 'vip-2', name: 'TS.BS. Phạm Cao Kiêm', email: 'dr.caokiem@bv108.vn', phone: '0912 333 444', organization: 'Bệnh viện Trung ương Quân đội 108', recipientType: 'doctor', status: 'pending' },
      { id: 'vip-3', name: 'BS.CKII. Vũ Thái Hà', email: 'drthaiha.skin@gmail.com', phone: '0988 555 666', organization: 'Khoa Laser & Săn sóc da - BV Da liễu TƯ', recipientType: 'doctor', status: 'pending' },
      { id: 'vip-4', name: 'Bà Nguyễn Thị Lan Hương', email: 'huong.nguyen@wontechmed.vn', phone: '0934 777 888', organization: 'Wontech Laser Vietnam', recipientType: 'business', status: 'pending' },
      { id: 'vip-5', name: 'ThS.BS. Hoàng Thanh Tuấn', email: 'thanhtuan.thammy@gmail.com', phone: '0977 999 000', organization: 'Học viện Quân Y 103', recipientType: 'doctor', status: 'pending' },
      { id: 'vip-6', name: 'Ông Kim Min Soo', email: 'minsoo.kim@hironic.co.kr', phone: '+82 10 4159 8777', organization: 'Hironic Korea Regional HQ', recipientType: 'business', status: 'pending' },
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
      let phone = '';
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
        phone = parts[2] || '';
        org = parts[3] || '';
        if (parts[4]) {
          const t = parts[4].toLowerCase();
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
          phone: phone,
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
    const headers = ['Họ và Tên', 'Email', 'Số Điện Thoại', 'Cơ Quan / Đơn Vị', 'Đối Tượng', 'Trạng Thái', 'Tài Khoản Gửi', 'Thời Gian Gửi', 'Ghi Chú Lỗi'];
    const rows = recipients.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone || ''}"`,
      `"${(r.organization || '').replace(/"/g, '""')}"`,
      `"${r.recipientType || 'general'}"`,
      `"${r.status === 'sent' ? 'Đã gửi thành công' : r.status === 'failed' ? 'Thất bại' : r.status === 'sending' ? 'Đang gửi' : 'Chưa gửi'}"`,
      `"${r.sentByAccount || (r.resendEmailId ? `Resend ID: ${r.resendEmailId}` : '')}"`,
      `"${r.sentAt || ''}"`,
      `"${(r.errorMessage || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bao_cao_gui_email_thu_moi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Đã xuất báo cáo gửi email ra file CSV thành công!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hidden File Input for CSV upload */}
      <input
        type="file"
        ref={csvFileInputRef}
        onChange={handleFileUploadCsv}
        accept=".csv, text/csv, .txt"
        className="hidden"
      />

      {/* Top Banner & Provider Status Header */}
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
                  Chiến Dịch Gửi Thư Mời Hàng Loạt
                </h2>
                {sendProvider === 'hostinger' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/40">
                    <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
                    <span>Hostinger SMTP (Tên Miền Riêng)</span>
                  </span>
                ) : sendProvider === 'gmail_pool' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-400/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Cụm 5 Gmail Xoay Vòng: 2,500 email/ngày</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-400/25 text-indigo-200 text-xs font-bold border border-indigo-300/30">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Cổng Resend API Cloud</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
                Hỗ trợ tải file CSV 3 cột (Tên, Email, SĐT), gửi qua Email Hostinger tên miền riêng, Cụm 5 Gmail hoặc Resend
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons on header */}
        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          {sendProvider === 'hostinger' ? (
            <button
              type="button"
              onClick={() => setShowHostingerHelpModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 text-white text-xs font-bold border border-purple-300/30 transition-all cursor-pointer shadow-xs"
            >
              <HelpCircle className="w-4 h-4 text-purple-200" />
              <span>Hướng Dẫn Hostinger</span>
            </button>
          ) : sendProvider === 'gmail_pool' ? (
            <button
              type="button"
              onClick={() => setShowGmailHelpModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer shadow-xs"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Cách Lấy Mật Khẩu Gmail</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer shadow-xs"
          >
            <Settings className="w-4 h-4 text-cyan-300" />
            <span>Cài Đặt Cổng Gửi</span>
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

      {/* Provider Selector Switcher Bar */}
      <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col xl:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full xl:w-auto flex-wrap sm:flex-nowrap">
          <span className="text-xs font-bold text-slate-700 px-3 shrink-0">Cổng gửi email:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl w-full xl:w-auto">
            <button
              type="button"
              onClick={() => updateEmailCampaignConfig({ sendProvider: 'hostinger' })}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                sendProvider === 'hostinger'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-purple-600" />
              <span>Email Hostinger (Tên Miền Riêng)</span>
            </button>
            <button
              type="button"
              onClick={() => updateEmailCampaignConfig({ sendProvider: 'gmail_pool' })}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                sendProvider === 'gmail_pool'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cụm 5 Gmail (2,500/ngày)</span>
            </button>
            <button
              type="button"
              onClick={() => updateEmailCampaignConfig({ sendProvider: 'resend' })}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                sendProvider === 'resend'
                  ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>Resend API (Cloud)</span>
            </button>
          </div>
        </div>

        {sendProvider === 'hostinger' && (
          <div className="flex items-center gap-2 px-3 text-xs text-slate-600 flex-wrap">
            <span>Hôm nay đã gửi: <strong className="text-purple-700 font-mono">{totalHostingerSentToday}</strong> / {totalHostingerCapacity}</span>
            <span>•</span>
            <span>Sẵn sàng: <strong className="text-emerald-700 font-bold">{readyHostingerAccounts.length}/{hostingerPool.length}</strong> hòm thư</span>
          </div>
        )}

        {sendProvider === 'gmail_pool' && (
          <div className="flex items-center gap-2 px-3 text-xs text-slate-600 flex-wrap">
            <span>Hôm nay đã gửi: <strong className="text-emerald-700 font-mono">{totalPoolSentToday}</strong> / {totalPoolCapacity}</span>
            <span>•</span>
            <span>Sẵn sàng: <strong className="text-indigo-700">{readyGmailAccounts.length}/{gmailPool.length}</strong> tài khoản</span>
          </div>
        )}
      </div>

      {/* SECTION: QUẢN LÝ TÀI KHOẢN EMAIL HOSTINGER (TÊN MIỀN RIÊNG) */}
      {sendProvider === 'hostinger' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-purple-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-black uppercase tracking-wider">
                  Khuyên Dùng
                </span>
                <h3 className="text-[16px] font-black text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-600" />
                  <span>Hòm Thư Doanh Nghiệp Hostinger (Tên Miền Riêng)</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Gửi qua máy chủ <strong>Hostinger SMTP</strong> (ví dụ: <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono">bantin@kbit-symposium.com</code>). Hạn mức cao (<strong>1.000 email/ngày</strong> mỗi hòm thư), tỷ lệ vào Hộp thư đến (Inbox) cao nhất nhờ có tên miền hội thảo.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={testAllHostingerAccounts}
                disabled={testingAllHostinger}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-colors cursor-pointer shadow-2xs"
              >
                {testingAllHostinger ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Kiểm Tra Tất Cả Hòm Thư</span>
              </button>

              <button
                type="button"
                onClick={handleAddHostingerAccount}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Hòm Thư Mới</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const conf = window.confirm('Đặt lại số lượng đã gửi hôm nay về 0 cho tất cả hòm thư Hostinger?');
                  if (conf) {
                    resetHostingerDailyQuotas();
                    showToast('Đã đặt lại hạn mức gửi hôm nay của Hostinger về 0!');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Đặt lại bộ đếm gửi hôm nay về 0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đặt Lại Hạn Ngạch</span>
              </button>
            </div>
          </div>

          {/* Hostinger Account Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {hostingerPool.map((account, index) => {
              const isPasswordVisible = !!showHostingerPasswordMap[account.id];
              const isTesting = testingHostingerId === account.id;
              const testRes = hostingerTestResults[account.id];
              const isQuotaReached = (account.sentToday || 0) >= (account.dailyQuota || 1000);
              const percent = Math.min(100, Math.round(((account.sentToday || 0) / (account.dailyQuota || 1000)) * 100));

              return (
                <div
                  key={account.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    !account.isActive
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : isQuotaReached
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                      : account.status === 'error'
                      ? 'bg-rose-50/70 border-rose-300'
                      : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-700 text-white font-black text-xs flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        value={account.senderDisplayName || `Hòm Thư Hostinger ${index + 1}`}
                        onChange={(e) => updateHostingerSenderAccount(account.id, { senderDisplayName: e.target.value })}
                        className="text-xs font-black text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-600 outline-none px-1"
                        placeholder="Tên hiển thị người gửi..."
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateHostingerSenderAccount(account.id, { isActive: !account.isActive })}
                        className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {account.isActive ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10.5px]">Đang bật</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10.5px]">Đã tắt</span>
                        )}
                      </button>
                      {hostingerPool.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Xóa hòm thư Hostinger #${index + 1}?`)) {
                              removeHostingerSenderAccount(account.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Xóa hòm thư này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                        Địa chỉ Email Hostinger (Tên miền riêng):
                      </label>
                      <input
                        type="email"
                        placeholder="info@tenmiencuaban.com"
                        value={account.email || ''}
                        onChange={(e) => updateHostingerSenderAccount(account.id, { email: e.target.value.trim() })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-purple-600 bg-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-bold text-slate-600">
                          Mật khẩu hòm thư Hostinger:
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleShowHostingerPassword(account.id)}
                          className="text-[10.5px] text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
                        >
                          {isPasswordVisible ? 'Ẩn' : 'Hiện'}
                        </button>
                      </div>
                      <input
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="Mật khẩu bạn tạo trên Hostinger..."
                        value={account.password || ''}
                        onChange={(e) => updateHostingerSenderAccount(account.id, { password: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-purple-600 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-500 mb-0.5">
                          Máy chủ SMTP:
                        </label>
                        <input
                          type="text"
                          value={account.smtpHost || 'smtp.hostinger.com'}
                          onChange={(e) => updateHostingerSenderAccount(account.id, { smtpHost: e.target.value.trim() })}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-mono outline-none focus:border-purple-600 bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-500 mb-0.5">
                          Cổng (Port):
                        </label>
                        <select
                          value={account.smtpPort || 465}
                          onChange={(e) => updateHostingerSenderAccount(account.id, { smtpPort: Number(e.target.value), secure: Number(e.target.value) === 465 })}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-mono outline-none focus:border-purple-600 bg-white"
                        >
                          <option value={465}>465 (SSL - Khuyên dùng)</option>
                          <option value={587}>587 (TLS / STARTTLS)</option>
                        </select>
                      </div>
                    </div>

                    {/* Quota tracker */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                        <span>Hạn mức hôm nay:</span>
                        <span className="font-mono font-bold">
                          <strong className={isQuotaReached ? 'text-amber-700' : 'text-purple-700'}>
                            {account.sentToday || 0}
                          </strong>{' '}
                          / {account.dailyQuota || 1000} thư
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isQuotaReached ? 'bg-amber-500' : percent > 80 ? 'bg-rose-500' : 'bg-purple-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test Result Message */}
                  {testRes && (
                    <div
                      className={`p-2 rounded-xl text-[11px] font-medium leading-relaxed ${
                        testRes.valid
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}
                    >
                      {testRes.valid ? '🟢 ' : '🔴 '}
                      {testRes.message}
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
                    <span className="text-[10.5px] text-slate-400">
                      {account.lastUsedAt ? `Gửi lúc: ${account.lastUsedAt}` : 'Chưa gửi hôm nay'}
                    </span>

                    <button
                      type="button"
                      onClick={() => testHostingerAccount(account)}
                      disabled={isTesting}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold border border-purple-200 transition-colors cursor-pointer"
                    >
                      {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                      <span>{isTesting ? 'Đang thử...' : 'Kiểm tra'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Hostinger Configuration Reference */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-950">Thông số SMTP Hostinger chuẩn: </span>
                <span className="text-slate-700">
                  Outgoing Server: <strong className="font-mono text-purple-800">smtp.hostinger.com</strong> • Port:{' '}
                  <strong className="font-mono text-purple-800">465 (SSL)</strong> • Username: Email Hostinger của bạn • Password: Mật khẩu email đó.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHostingerHelpModal(true)}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 underline shrink-0 cursor-pointer"
            >
              Xem hướng dẫn chi tiết &raquo;
            </button>
          </div>
        </div>
      )}

      {/* SECTION: QUẢN LÝ CỤM 5 TÀI KHOẢN GMAIL */}
      {sendProvider === 'gmail_pool' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-[16px] font-black text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-600" />
                <span>Cụm 5 Tài Khoản Gmail Tự Động Xoay Vòng (Load Balancing)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Mỗi tài khoản gửi tối đa <strong>500 email/ngày</strong>. Hệ thống xoay vòng đều qua 5 tài khoản, tự ngắt tài khoản khi đủ 500 và chuyển sang tài khoản tiếp theo.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={testAllGmailAccounts}
                disabled={testingAllGmail}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
              >
                {testingAllGmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Kiểm Tra Toàn Bộ 5 Tài Khoản</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const conf = window.confirm('Đặt lại số lượng đã gửi hôm nay về 0 cho toàn bộ 5 tài khoản Gmail?');
                  if (conf) {
                    resetGmailDailyQuotas();
                    showToast('Đã đặt lại hạn ngạch gửi 500 email hôm nay về 0!');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Đặt lại bộ đếm gửi hôm nay về 0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đặt Lại Hạn Ngạch Ngày</span>
              </button>
            </div>
          </div>

          {/* 5 Gmail Account Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {gmailPool.map((account, index) => {
              const isPasswordVisible = !!showPasswordMap[account.id];
              const isTesting = testingGmailId === account.id;
              const testRes = gmailTestResults[account.id];
              const isQuotaReached = (account.sentToday || 0) >= (account.dailyQuota || 500);
              const percent = Math.min(100, Math.round(((account.sentToday || 0) / (account.dailyQuota || 500)) * 100));

              return (
                <div
                  key={account.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    !account.isActive
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : isQuotaReached
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                      : account.status === 'error'
                      ? 'bg-rose-50/70 border-rose-300'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#174ea6] text-white font-black text-xs flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        {account.senderDisplayName || `Tài khoản Gmail ${index + 1}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateGmailSenderAccount(account.id, { isActive: !account.isActive })}
                      className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {account.isActive ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10.5px]">Đang bật</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10.5px]">Đã tắt</span>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                        Địa chỉ Gmail:
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={account.email || ''}
                        onChange={(e) => updateGmailSenderAccount(account.id, { email: e.target.value.trim() })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-indigo-600 bg-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-bold text-slate-600">
                          Mật khẩu ứng dụng (16 ký tự):
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(account.id)}
                          className="text-[10.5px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                        >
                          {isPasswordVisible ? 'Ẩn' : 'Hiện'}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={isPasswordVisible ? 'text' : 'password'}
                          placeholder="abcd efgh ijkl mnop"
                          value={account.appPassword || ''}
                          onChange={(e) => updateGmailSenderAccount(account.id, { appPassword: e.target.value })}
                          className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-indigo-600 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(account.id)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold">Đã gửi hôm nay:</span>
                      <span className="font-mono font-bold text-slate-900">
                        <span className={isQuotaReached ? 'text-amber-600 font-black' : 'text-emerald-700'}>
                          {account.sentToday || 0}
                        </span>
                        /{account.dailyQuota || 500} email
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isQuotaReached ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {isQuotaReached && (
                      <p className="text-[10px] text-amber-800 font-bold">
                        ⚠️ Đã gửi đủ 500 email hôm nay. Hệ thống tự động chuyển sang các tài khoản còn lại.
                      </p>
                    )}
                  </div>

                  {testRes && (
                    <div
                      className={`p-2 rounded-lg text-[10.5px] font-medium leading-relaxed ${
                        testRes.valid ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {testRes.valid ? '🟢 ' : '🔴 '}
                      {testRes.message}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => testGmailAccount(account)}
                      disabled={isTesting}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>Kiểm tra kết nối</span>
                    </button>

                    <span className="text-[10.5px] text-slate-400">
                      {account.lastUsedAt ? `Dùng lúc ${account.lastUsedAt}` : 'Chưa gửi'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
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
              <span>Bảng Điều Khiển Gửi Thư Tự Động</span>
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span>Đang chọn mẫu: <strong className="text-indigo-700">{selectedTemplate?.name || 'Chưa chọn'}</strong></span>
              <span>•</span>
              <span>Cổng: <strong className="text-purple-700 font-bold">{sendProvider === 'hostinger' ? `Hostinger (${readyHostingerAccounts.length} hòm thư)` : sendProvider === 'gmail_pool' ? `Cụm ${readyGmailAccounts.length} Gmail` : 'Resend'}</strong></span>
              <span>•</span>
              <span>Khoảng cách: <strong>{throttleMs}ms/email</strong></span>
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
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#174ea6] hover:opacity-95 text-white font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>BẮT ĐẦU GỬI ({pendingCount} CHƯA GỬI)</span>
              </button>
            )}

            <button
              type="button"
              onClick={resetEmailRecipientsStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Đặt lại trạng thái tất cả người nhận về 'Chưa gửi' để gửi lại"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Đặt Lại Trạng Thái Thư</span>
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
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                    <span>Đang điều phối gửi thư ({currentIndex}/{totalToSend || totalRecipients})...</span>
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
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Test Email Dispatch */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 shrink-0">Thử nghiệm trước:</span>
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
            <span className="font-semibold">Khoảng cách gửi:</span>
            <select
              value={throttleMs}
              onChange={(e) => setThrottleMs(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium outline-none bg-white"
            >
              <option value={800}>800ms / email (Nhanh)</option>
              <option value={1200}>1.2s / email (Tiêu chuẩn Gmail - Khuyên dùng)</option>
              <option value={2000}>2.0s / email (An toàn cao)</option>
              <option value={3500}>3.5s / email (Rất chậm)</option>
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
                  { tag: '{{phone}}', label: 'Số điện thoại', color: 'bg-teal-50 text-teal-700 border-teal-200' },
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
            <div className="px-4 py-3 bg-[#f2f6fc] border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11.5px] font-bold text-slate-700 ml-2">Mô Phỏng Hộp Thư Khách Hàng (Gmail)</span>
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
                      {r.name} ({r.phone ? `${r.phone} • ` : ''}{r.email})
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
                      <span className="text-[10px] font-normal text-slate-400">
                        &lt;{
                          sendProvider === 'hostinger' && readyHostingerAccounts[0]?.email
                            ? readyHostingerAccounts[0].email
                            : sendProvider === 'gmail_pool' && readyGmailAccounts[0]?.email
                            ? readyGmailAccounts[0].email
                            : (campaign.senderEmail || 'bantin@kbit-symposium.com')
                        }&gt;
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Gửi tới: <strong className="text-slate-800">{previewRecipient.name}</strong> &lt;{previewRecipient.email}&gt;
                      {previewRecipient.phone && <span className="ml-1 text-slate-400">({previewRecipient.phone})</span>}
                    </div>
                  </div>
                </div>
                <span className="text-[10.5px] text-slate-400 shrink-0">10:25 AM</span>
              </div>
            </div>

            {/* Rendered Email HTML Content View */}
            <div className="p-5 flex-1 overflow-y-auto bg-[#fafafa]">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 text-xs sm:text-[13px] text-slate-800 leading-relaxed space-y-3 font-sans">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[#174ea6] tracking-wider">
                    HỘI THẢO THẨM MỸ VIỆT – HÀN 2026
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                    Thư Mời Chính Thức
                  </span>
                </div>

                <div
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: currentHtml }}
                />

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
              Tải lên file CSV 3 cột (Tên, Email, SĐT), nhập từ đại biểu đăng ký web hoặc dán danh sách nhanh
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* PRIMARY: Upload CSV 3 Columns */}
            <button
              type="button"
              onClick={() => csvFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
              title="Tải lên file CSV có 3 cột: Tên, Email, Số điện thoại"
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Tải Lên File CSV (3 Cột)</span>
            </button>

            {/* Download Sample CSV template */}
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Tải file CSV mẫu (3 cột) để điền thông tin"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Tải File Mẫu (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleImportFromRegistrations}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Từ Web ({cmsData.registrations?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={handleImportSampleVIPs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>VIP Mẫu</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkPasteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Dán Nhanh</span>
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
              placeholder="Tìm theo tên, email, SĐT, bệnh viện..."
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
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4">Cơ Quan / Đơn Vị</th>
                  <th className="py-3 px-4">Đối Tượng</th>
                  <th className="py-3 px-4">Trạng Thái &amp; Tài Khoản Gửi</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecipients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
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
                      <td className="py-3 px-4 font-mono">
                        {recip.phone ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[11px]">
                            {recip.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
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
                              <span>Lỗi gửi: {recip.errorMessage?.slice(0, 28)}...</span>
                            </span>
                          )}
                          {recip.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                              <span>Chưa gửi</span>
                            </span>
                          )}
                        </div>

                        {recip.sentByAccount && (
                          <div className="text-[10px] font-mono text-slate-500">
                            Gửi qua: <span className="text-emerald-700 font-bold">{recip.sentByAccount}</span>
                          </div>
                        )}
                        {recip.resendEmailId && (
                          <div className="text-[10px] font-mono text-slate-500">
                            Resend: <span className="text-indigo-600 font-bold">{recip.resendEmailId.slice(0, 12)}...</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedTemplate) return;
                            const testGmail = sendProvider === 'gmail_pool' ? (readyGmailAccounts[0] || gmailPool[0]) : undefined;
                            sendEmailToRecipient(recip, selectedTemplate, testGmail);
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
              <span>Nhật Ký Điều Phối Email (Live Dispatch Logs)</span>
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

      {/* POPUP MODAL: XÁC NHẬN IMPORT FILE CSV (3 CỘT: TÊN, EMAIL, SĐT) */}
      {showCsvPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Xác Nhận Nhập Danh Bạ Từ File CSV</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCsvPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* File Info Bar */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-emerald-950 font-bold">Tên file: </span>
                <span className="font-mono text-emerald-800 font-bold">{csvFileName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-[11px]">
                  {parsedCsvData.length} liên hệ hợp lệ
                </span>
                {csvDuplicateCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[11px]">
                    Đã lọc {csvDuplicateCount} email trùng lặp
                  </span>
                )}
              </div>
            </div>

            {/* Audience selection for imported rows */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Gán nhóm đối tượng cho danh sách này:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'doctor', label: 'Bác Sĩ & Chuyên Gia' },
                  { key: 'business', label: 'Doanh Nghiệp B2B' },
                  { key: 'vip', label: 'Khách Mời VIP' },
                  { key: 'general', label: 'Đại Biểu Tự Do' },
                ].map((aud) => (
                  <button
                    key={aud.key}
                    type="button"
                    onClick={() => setCsvDefaultAudience(aud.key as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      csvDefaultAudience === aud.key
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {aud.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Table of first 6 rows */}
            <div className="space-y-1.5">
              <span className="text-[11.5px] font-bold text-slate-700">
                Xem trước các dòng dữ liệu đọc được (3 cột chuẩn):
              </span>
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Họ và Tên</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Số Điện Thoại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedCsvData.slice(0, 6).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 font-mono">#{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{item.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-700">{item.email}</td>
                        <td className="py-2 px-3 font-mono text-emerald-700 font-bold">{item.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedCsvData.length > 6 && (
                <p className="text-[10.5px] text-slate-500 text-right">
                  ... và {parsedCsvData.length - 6} liên hệ khác
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCsvPreviewModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmImportCsv}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-md active:scale-95"
              >
                Xác Nhận Nạp {parsedCsvData.length} Khách Mời
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Hướng dẫn tạo Mật khẩu ứng dụng (App Password) cho Gmail */}
      {showGmailHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  G
                </span>
                <span>Cách Tạo Mật Khẩu Ứng Dụng (App Password) Cho Gmail</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowGmailHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Google yêu cầu sử dụng <strong>Mật khẩu ứng dụng (16 chữ cái)</strong> thay cho mật khẩu đăng nhập thông thường để gửi email qua SMTP an toàn. Mỗi tài khoản Gmail chỉ mất 1 phút cài đặt:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#174ea6] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Bật Xác Minh 2 Bước (2-Step Verification)</h4>
                  <p className="text-slate-600 mt-0.5">
                    Đăng nhập tài khoản Gmail tại{' '}
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 font-bold underline"
                    >
                      myaccount.google.com/security
                    </a>
                    , đảm bảo mục <strong>"Xác minh 2 bước"</strong> đang ở trạng thái <strong>BẬT</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#174ea6] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Truy cập Trang Mật Khẩu Ứng Dụng</h4>
                  <p className="text-slate-600 mt-0.5">
                    Truy cập trực tiếp liên kết:{' '}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 font-bold underline inline-flex items-center gap-1"
                    >
                      myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#174ea6] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Đặt tên &amp; Tạo Mật Khẩu</h4>
                  <p className="text-slate-600 mt-0.5">
                    Nhập tên ứng dụng (VD: <code>KBIT Email Sender</code>) rồi bấm nút <strong>Tạo (Create)</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <h4 className="font-bold text-emerald-900">Sao Chép &amp; Dán Vào CMS</h4>
                  <p className="text-emerald-800 mt-0.5">
                    Google sẽ hiển thị mã 16 chữ cái (ví dụ: <code>abcd efgh ijkl mnop</code>). Sao chép và dán vào ô Mật khẩu ứng dụng của tài khoản tương ứng trong cụm 5 Gmail.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Hiệu quả 5 tài khoản Gmail = 2,500 email / ngày:</span>
              </p>
              <p className="text-[11.5px] leading-relaxed text-amber-800">
                Khi cấu hình xong cả 5 tài khoản, hệ thống sẽ tự động xoay vòng gửi lần lượt qua từng tài khoản. Mỗi tài khoản dừng lại khi đạt đúng 500 email, tổng cộng cả ngày bạn có thể gửi tới <strong>2,500 thư mời hoàn toàn miễn phí</strong>!
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowGmailHelpModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Đã Hiểu &amp; Đóng Hướng Dẫn
              </button>
            </div>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="tel"
                  placeholder="VD: 0908 123 456"
                  value={newRecipPhone}
                  onChange={(e) => setNewRecipPhone(e.target.value)}
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
              <code className="text-indigo-600 font-mono">Tên, Email, Số điện thoại, Bệnh viện</code>
              <br />
              hoặc đơn giản là mỗi dòng 1 địa chỉ email.
            </p>

            <textarea
              rows={8}
              placeholder={`BS. Nguyễn Văn A, dr.a@gmail.com, 0901234567, BV 108\nBà Trần Thị B, b.tran@kbeauty.vn, 0912345678, K-Beauty Corp\ncustomer@example.com`}
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

      {/* MODAL: Hướng dẫn cấu hình Hostinger SMTP */}
      {showHostingerHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                <Server className="w-5 h-5 text-purple-600" />
                <span>Hướng Dẫn Cấu Hình Email Doanh Nghiệp Hostinger</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHostingerHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-900 font-bold block mb-0.5">Ưu điểm tuyệt đối của Email Hostinger:</strong>
                  Email gửi đi mang đuôi tên miền hội thảo (ví dụ: <span className="font-mono font-bold text-purple-800">contact@kbit2026.vn</span>), tạo sự chuyên nghiệp và uy tín cao nhất cho khách mời bác sĩ & đối tác. Hạn mức gửi cao (1.000 email/ngày/tài khoản).
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h5 className="font-black text-slate-900 mb-0.5">Đăng nhập tài khoản Hostinger</h5>
                    <p className="text-slate-600">
                      Truy cập bảng điều khiển <strong className="text-purple-700">Hostinger hPanel</strong> (<a href="https://hpanel.hostinger.com" target="_blank" rel="noreferrer" className="underline font-bold">hpanel.hostinger.com</a>) và chọn mục <strong>Emails</strong> trên thanh menu.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h5 className="font-black text-slate-900 mb-0.5">Tạo hoặc kiểm tra hòm thư email tên miền</h5>
                    <p className="text-slate-600">
                      Chọn tên miền của bạn (ví dụ: <span className="font-mono">kbit2026.vn</span>) &gt; Nhấn nút <strong>Create email account</strong> (hoặc chọn tài khoản email đã tạo sẵn).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h5 className="font-black text-slate-900 mb-0.5">Lấy thông số SMTP chuẩn của Hostinger</h5>
                    <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11.5px] space-y-1">
                      <div>• <strong>SMTP Outgoing Host:</strong> <span className="text-purple-700 font-bold">smtp.hostinger.com</span></div>
                      <div>• <strong>Port (Cổng bảo mật):</strong> <span className="text-purple-700 font-bold">465 (SSL)</span> hoặc 587 (TLS)</div>
                      <div>• <strong>Username (Tài khoản):</strong> Địa chỉ email đầy đủ (VD: <span className="text-slate-900 font-bold">bantin@kbit-symposium.com</span>)</div>
                      <div>• <strong>Password (Mật khẩu):</strong> Mật khẩu hòm thư bạn đã đặt ở Bước 2.</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <h5 className="font-black text-slate-900 mb-0.5">Nhập vào CMS &amp; Bấm "Kiểm Tra"</h5>
                    <p className="text-slate-600">
                      Điền email và mật khẩu vào thẻ tài khoản Hostinger bên trên &gt; Bấm nút <strong>Kiểm tra</strong>. Hệ thống sẽ kết nối trực tiếp đến máy chủ Hostinger để kiểm tra đăng nhập. Nếu hiện dấu tích xanh 🟢 là đã sẵn sàng gửi thư!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowHostingerHelpModal(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Đã Hiểu &amp; Đóng
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
                <Settings className="w-5 h-5 text-indigo-600" />
                <span>Cấu Hình Thông Tin Người Gửi &amp; Resend API</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Người Gửi Hiển Thị (Sender Name)
                </label>
                <input
                  type="text"
                  value={campaign.senderName || ''}
                  onChange={(e) => updateEmailCampaignConfig({ senderName: e.target.value })}
                  placeholder="VD: Ban Tổ Chức Hội Thảo Thẩm Mỹ Việt – Hàn 2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600"
                />
              </div>

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
                  Khi khách mời bấm "Trả lời (Reply)", thư sẽ gửi trực tiếp đến địa chỉ này của Ban Thư Ký.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Khóa Resend API Key (Tùy chọn)</span>
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
                    onClick={async () => {
                      if (!campaign.resendApiKey) {
                        alert('Vui lòng nhập Resend API Key');
                        return;
                      }
                      setIsVerifyingResendKey(true);
                      try {
                        const res = await fetch(`/api/send-email?action=verify&apiKey=${encodeURIComponent(campaign.resendApiKey)}`);
                        const d = await res.json();
                        setIsVerifyingResendKey(false);
                        setResendVerifyResult({ tested: true, valid: d.valid, message: d.message, domains: d.domains });
                      } catch (e: any) {
                        setIsVerifyingResendKey(false);
                        setResendVerifyResult({ tested: true, valid: false, message: e.message });
                      }
                    }}
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

                {resendVerifyResult && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-medium ${
                      resendVerifyResult.valid
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {resendVerifyResult.valid ? '🟢 ' : '🔴 '}
                    {resendVerifyResult.message}
                  </div>
                )}
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
                  showToast('Đã lưu cấu hình thành công!');
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
