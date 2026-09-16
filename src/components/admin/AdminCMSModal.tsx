import React, { useState, useRef } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Users,
  Calendar,
  Building,
  Sparkles,
  FileSpreadsheet,
  Check,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  HelpCircle,
  Copy,
  CheckCircle2,
  Eye,
  Award,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  MapPin,
  QrCode,
  FileText,
  Database,
  Cloud,
  LogOut,
  KeyRound,
  ShieldCheck,
  EyeOff,
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { ExpertSpeaker, AgendaItem, Partner, HighlightItem, AttendeeBadge } from '../../types';
import { PARTNER_LOGOS } from '../../data/partnerLogos';

interface AdminCMSModalProps {
  onLogout?: () => void;
}

export const AdminCMSModal: React.FC<AdminCMSModalProps> = ({ onLogout }) => {
  const {
    cmsData,
    isAdminOpen,
    setIsAdminOpen,
    closeAdmin,
    openAdmin,
    activeAdminTab,
    setActiveAdminTab,
    updateEventDetails,
    updateExpert,
    addExpert,
    deleteExpert,
    updateAgendaItem,
    addAgendaItem,
    deleteAgendaItem,
    updateHighlight,
    updatePartner,
    addPartner,
    deletePartner,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    updateFooterConfig,
    updateAdminAccount,
    resetToDefaults,
    exportDataToJson,
    importDataFromJson,
    uploadImageFile,
    addImageToLibrary,
    isCloudDbConnected,
    refreshFromCloud,
    saveCmsToCloud,
  } = useCMS();

  // Local feedback states
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(cmsData.experts[0]?.id || null);
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState<'all' | 'doctor' | 'business' | 'cme'>('all');
  const [eventFilter, setEventFilter] = useState<'all' | 'SYM' | 'KAT' | 'both'>('all');
  const [inspectingAttendee, setInspectingAttendee] = useState<AttendeeBadge | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<AttendeeBadge | null>(null);
  const [adminUsernameInput, setAdminUsernameInput] = useState(cmsData.adminAccount?.username || 'admin');
  const [adminPasswordInput, setAdminPasswordInput] = useState(cmsData.adminAccount?.password || 'kbit@2026');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [accountUpdatedMsg, setAccountUpdatedMsg] = useState(false);
  const [editForm, setEditForm] = useState<{
    fullName: string;
    attendeeType: 'doctor' | 'business';
    selectedEvents: string[];
    wantsCme: boolean;
    phone: string;
    email: string;
    institution: string;
    titleRole: string;
    specialty: string;
    license: string;
    city: string;
    country: string;
    notes: string;
  }>({
    fullName: '',
    attendeeType: 'doctor',
    selectedEvents: ['SYM'],
    wantsCme: false,
    phone: '',
    email: '',
    institution: '',
    titleRole: '',
    specialty: '',
    license: '',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    notes: '',
  });
  const [newBioPoint, setNewBioPoint] = useState('');

  // File upload refs
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const speakerPhotoRef = useRef<HTMLInputElement>(null);
  const generalMediaRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);
  const ksapsHeroFileRef = useRef<HTMLInputElement>(null);
  const vsapsHeroFileRef = useRef<HTMLInputElement>(null);
  const bv175HeroFileRef = useRef<HTMLInputElement>(null);

  const handleStartEditAttendee = (attendee: AttendeeBadge) => {
    setEditingAttendee(attendee);
    setEditForm({
      fullName: attendee.fullName || '',
      attendeeType: attendee.attendeeType || 'doctor',
      selectedEvents: attendee.selectedEvents && attendee.selectedEvents.length > 0 ? [...attendee.selectedEvents] : ['SYM'],
      wantsCme: !!(attendee.wantsCme || attendee.cmeNeed === 'yes'),
      phone: attendee.phone || '',
      email: attendee.email || '',
      institution: attendee.institution || '',
      titleRole: attendee.titleRole || attendee.degree || '',
      specialty: attendee.specialty || '',
      license: attendee.license || '',
      city: attendee.city || 'TP. Hồ Chí Minh',
      country: attendee.country || 'Việt Nam',
      notes: attendee.notes || '',
    });
    setInspectingAttendee(null);
  };

  const handleToggleEditEvent = (code: string) => {
    setEditForm((prev) => {
      const exists = prev.selectedEvents.includes(code);
      if (exists) {
        if (prev.selectedEvents.length === 1) {
          alert('Đại biểu phải đăng ký tham dự ít nhất 1 chương trình!');
          return prev;
        }
        return {
          ...prev,
          selectedEvents: prev.selectedEvents.filter((c) => c !== code),
        };
      } else {
        return {
          ...prev,
          selectedEvents: [...prev.selectedEvents, code],
        };
      }
    });
  };

  const handleSaveEditAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendee) return;
    if (editForm.selectedEvents.length === 0) {
      alert('Vui lòng chọn ít nhất 1 chương trình tham dự (SYM hoặc KAT)!');
      return;
    }
    updateRegistration(editingAttendee.id, {
      fullName: editForm.fullName,
      attendeeType: editForm.attendeeType,
      selectedEvents: editForm.selectedEvents,
      wantsCme: editForm.wantsCme,
      cmeNeed: editForm.wantsCme ? 'yes' : 'no',
      phone: editForm.phone,
      email: editForm.email,
      institution: editForm.institution,
      titleRole: editForm.titleRole,
      specialty: editForm.specialty,
      license: editForm.license,
      city: editForm.city,
      country: editForm.country,
      notes: editForm.notes,
    });
    setEditingAttendee(null);
    showToast('Đã cập nhật chương trình tham dự & hồ sơ đại biểu thành công!');
  };

  React.useEffect(() => {
    if (cmsData.adminAccount) {
      setAdminUsernameInput(cmsData.adminAccount.username || 'admin');
      setAdminPasswordInput(cmsData.adminAccount.password || 'kbit@2026');
    }
  }, [cmsData.adminAccount]);

  const handleSaveAdminAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsernameInput.trim() || !adminPasswordInput.trim()) {
      alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }
    updateAdminAccount({
      username: adminUsernameInput.trim(),
      password: adminPasswordInput.trim(),
    });
    setAccountUpdatedMsg(true);
    setTimeout(() => setAccountUpdatedMsg(false), 4000);
    showToast('Đã cập nhật thông tin tài khoản & mật khẩu quản trị thành công!');
  };

  if (!isAdminOpen) return null;

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImageFile(e.target.files[0]);
        updateEventDetails({ bannerImageUrl: url });
        showToast('Đã tải ảnh nền Hero thành công!');
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh');
      }
    }
  };

  const handleSpeakerAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, expertId: string) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImageFile(e.target.files[0]);
        updateExpert(expertId, { avatarUrl: url });
        showToast('Đã cập nhật ảnh chân dung chuyên gia!');
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh');
      }
    }
  };

  const handlePartnerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, partnerId: string) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImageFile(e.target.files[0]);
        updatePartner(partnerId, { logoUrl: url });
        if (partnerId === 'ksaps') updateEventDetails({ heroKsapsLogoUrl: url });
        if (partnerId === 'vsaps') updateEventDetails({ heroVsapsLogoUrl: url });
        if (partnerId === 'bv175') updateEventDetails({ heroBv175LogoUrl: url });
        showToast('Đã tải lên và cập nhật logo đối tác thành công!');
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh logo');
      }
    }
  };

  const handleHeroHostLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, hostId: 'ksaps' | 'vsaps' | 'bv175') => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImageFile(e.target.files[0]);
        if (hostId === 'ksaps') {
          updateEventDetails({ heroKsapsLogoUrl: url });
          updatePartner('ksaps', { logoUrl: url });
        } else if (hostId === 'vsaps') {
          updateEventDetails({ heroVsapsLogoUrl: url });
          updatePartner('vsaps', { logoUrl: url });
        } else if (hostId === 'bv175') {
          updateEventDetails({ heroBv175LogoUrl: url });
          updatePartner('bv175', { logoUrl: url });
        }
        showToast(`Đã tải lên & đồng bộ logo ${hostId.toUpperCase()} thành công!`);
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh logo');
      }
    }
  };

  const handleAddNewPartner = () => {
    const newId = `partner_${Date.now()}`;
    const newPartner: Partner = {
      id: newId,
      shortName: 'MỚI',
      name: 'Tên đơn vị đối tác mới',
      role: 'Đơn vị đồng hành',
      accent: 'secondary',
      logoUrl: '',
    };
    addPartner(newPartner);
    showToast('Đã thêm đơn vị đối tác mới!');
  };

  const handleGeneralMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImageFile(e.target.files[0]);
        showToast('Đã thêm ảnh vào kho Media Library!');
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh');
      }
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importDataFromJson(content);
          if (success) {
            showToast('Đã khôi phục toàn bộ cấu hình từ file JSON!');
          } else {
            alert('File JSON không hợp lệ hoặc cấu trúc không đúng định dạng.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Export registrations to CSV
  const handleExportRegistrationsCSV = () => {
    if (cmsData.registrations.length === 0) {
      alert('Chưa có đại biểu nào đăng ký.');
      return;
    }

    const headers = [
      'Mã Đăng Ký',
      'Nhóm Đại Biểu',
      'Họ Và Tên',
      'Chương Trình Tham Dự (Chi Tiết)',
      'Tham Dự SYM (03/10 BV 175)',
      'Tham Dự KAT (04/10 ĐH Hồng Bàng)',
      'Đơn Vị Công Tác / Doanh Nghiệp',
      'Chức Vụ / Học Vị',
      'Chuyên Khoa / Lĩnh Vực',
      'Số CCHN / MST',
      'Số Điện Thoại',
      'Email',
      'Tỉnh / Thành Phố',
      'Quốc Gia',
      'Cấp CME BV 175 (3h tín chỉ - Phí thu tại HT)',
      'Chủ Đề Quan Tâm',
      'Mục Tiêu Tham Dự',
      'Ghi Chú',
      'Thời Gian Đăng Ký',
    ];
    const rows = cmsData.registrations.map((r) => {
      const ev = r.selectedEvents && r.selectedEvents.length > 0 ? r.selectedEvents : ['SYM'];
      const detailedEvents = ev
        .map((c) => (c === 'SYM' ? 'SYM (03/10/2026 - Bệnh viện Quân Y 175)' : c === 'KAT' ? 'KAT (04/10/2026 - ĐH Quốc tế Hồng Bàng)' : c))
        .join('; ');
      const hasSym = ev.includes('SYM') ? 'Có' : 'Không';
      const hasKat = ev.includes('KAT') ? 'Có' : 'Không';

      return [
        `"${r.registrationCode || ''}"`,
        `"${r.attendeeType === 'doctor' ? 'Bác sĩ' : 'Doanh nghiệp'}"`,
        `"${r.fullName || ''}"`,
        `"${detailedEvents}"`,
        `"${hasSym}"`,
        `"${hasKat}"`,
        `"${(r.institution || '').replace(/"/g, '""')}"`,
        `"${r.titleRole || r.degree || ''}"`,
        `"${r.specialty || ''}"`,
        `"${r.license || ''}"`,
        `"${r.phone || ''}"`,
        `"${r.email || ''}"`,
        `"${r.city || ''}"`,
        `"${r.country || ''}"`,
        `"${r.wantsCme || r.cmeNeed === 'yes' ? 'Có' : 'Không'}"`,
        `"${(r.interests || []).join('; ')}"`,
        `"${(r.goals || []).join('; ')}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
        `"${r.registeredAt || ''}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Danh_sach_dai_bieu_Hoi_thao_Viet_Han_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Đã xuất file Excel/CSV thành công!');
  };

  const selectedExpert = cmsData.experts.find((e) => e.id === selectedExpertId) || cmsData.experts[0];

  return (
    <div className="min-h-screen w-full bg-[#fafbff] flex flex-col text-slate-900 font-sans selection:bg-[#174ea6]/20">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* CMS Top Header - Full Width Standalone Page Header */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 bg-white border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#002045] via-[#174ea6] to-[#c83271] text-white flex items-center justify-center shadow-sm shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[16px] sm:text-[18px] font-black text-slate-900 tracking-tight">
                HỆ THỐNG QUẢN TRỊ CMS
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-pink-100 text-[#c83271] border border-pink-200">
                Việt - Hàn 2026
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#174ea6] text-[10.5px] font-mono font-bold">
                /admin
              </span>
            </div>
            <p className="text-[12px] text-slate-500 hidden sm:block">
              Trang quản trị toàn diện: Banner, Chuyên gia, Lịch trình, Kho ảnh, Đối tác và Danh sách Đại biểu
            </p>
          </div>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-2 sm:gap-2.5 ml-auto flex-wrap">
          {/* Cloud Database Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              isCloudDbConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={
              isCloudDbConnected
                ? 'Đã kết nối Vercel Postgres - Dữ liệu đồng bộ trực tiếp toàn hệ thống'
                : 'Chế độ lưu trữ: Trình duyệt Local (Sẽ tự động chuyển sang Vercel Postgres khi deploy)'
            }
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isCloudDbConnected ? 'Vercel Postgres' : 'Local Storage'}
            </span>
            <span
              className={`size-2 rounded-full ${
                isCloudDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={async () => {
              const ok = await saveCmsToCloud();
              if (ok) {
                showToast('Đã lưu và đồng bộ toàn bộ CMS lên Vercel Postgres thành công!');
              } else {
                showToast('Đã lưu cấu hình vào bộ nhớ máy (Vercel Postgres chưa kích hoạt)');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#002045] to-[#174ea6] text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer"
            title="Lưu toàn bộ nội dung CMS lên Cloud Database"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưu lên Cloud</span>
          </button>

          <button
            onClick={exportDataToJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Tải file JSON sao lưu toàn bộ cấu hình"
          >
            <Download className="w-3.5 h-3.5 text-[#174ea6]" />
            <span className="hidden md:inline">Xuất JSON</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#c83271]" />
            <span className="hidden md:inline">Nhập JSON</span>
            <input
              type="file"
              ref={jsonImportRef}
              accept=".json"
              className="hidden"
              onChange={handleJsonImport}
            />
          </label>

          <button
            onClick={resetToDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
            title="Khôi phục nội dung về bản thiết kế gốc"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden lg:inline">Khôi phục gốc</span>
          </button>

          {/* Direct Link Badge & Copy Button */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-[11px] font-mono text-[#174ea6]">
            <span className="font-bold">Link:</span>
            <span className="text-slate-700">/admin</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/admin`);
                showToast('Đã sao chép liên kết /admin vào bộ nhớ tạm!');
              }}
              className="p-1 hover:bg-blue-100 rounded-lg text-slate-500 hover:text-[#174ea6] transition-colors cursor-pointer ml-0.5"
              title="Sao chép đường dẫn /admin"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prominent Website Return Button */}
          <button
            onClick={closeAdmin}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#002045] to-[#174ea6] hover:from-[#0b2b54] hover:to-[#1e5bb8] text-white text-xs sm:text-[13px] font-bold shadow-sm hover:shadow transition-all cursor-pointer"
            title="Quay lại giao diện website"
          >
            <ExternalLink className="w-4 h-4 text-cyan-300" />
            <span>Xem Website</span>
          </button>

          {/* Admin Logout Button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs sm:text-[13px] font-bold border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
              title="Đăng xuất khỏi tài khoản quản trị CMS"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          )}
        </div>
      </header>

        {/* CMS Body: Sidebar Tabs + Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Navigation Tabs */}
          <nav aria-label="CMS Sections Navigation" className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200/90 p-3 sm:p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
            <button
              onClick={() => setActiveAdminTab('general')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                activeAdminTab === 'general'
                  ? 'bg-[#174ea6] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building className="w-4 h-4 shrink-0" />
              <span>Cài đặt chung &amp; Banner</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('speakers')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                activeAdminTab === 'speakers'
                  ? 'bg-[#c83271] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0" />
                <span>Quản lý Chuyên gia</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10.5px] ${activeAdminTab === 'speakers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {cmsData.experts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('agenda')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                activeAdminTab === 'agenda'
                  ? 'bg-[#174ea6] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Lịch trình báo cáo</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10.5px] ${activeAdminTab === 'agenda' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {cmsData.agenda.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('media')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                activeAdminTab === 'media'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>Kho Quản lý Hình ảnh</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10.5px] ${activeAdminTab === 'media' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {cmsData.mediaLibrary.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('partners')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                activeAdminTab === 'partners'
                  ? 'bg-[#174ea6] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 shrink-0" />
                <span>Đơn vị &amp; Đối tác</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10.5px] ${activeAdminTab === 'partners' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {cmsData.partners.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('highlights')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                activeAdminTab === 'highlights'
                  ? 'bg-[#174ea6] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Điểm nhấn &amp; CME</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('registrations')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                activeAdminTab === 'registrations'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Đại biểu đăng ký</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${activeAdminTab === 'registrations' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                {cmsData.registrations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('footer')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                activeAdminTab === 'footer'
                  ? 'bg-[#174ea6] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Chân trang (Footer)</span>
              </div>
            </button>

            <div className="mt-auto hidden md:block pt-4 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11.5px] text-slate-600 leading-relaxed">
                <p className="font-bold text-[#174ea6] mb-1">Mẹo quản trị:</p>
                Mọi chỉnh sửa chữ hoặc ảnh tại đây sẽ lập tức có hiệu lực trên trang chủ ngay khi bạn đóng CMS.
              </div>
            </div>
          </nav>

          {/* Right Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {/* =========================================================================
                TAB 1: CÀI ĐẶT CHUNG & BANNER
               ========================================================================= */}
            {activeAdminTab === 'general' && (
              <div className="max-w-4xl space-y-6">
                <div>
                  <h2 className="text-[20px] font-black text-slate-900">
                    Cài Đặt Chung &amp; Hình Nền Hero
                  </h2>
                  <p className="text-[13px] text-slate-500">
                    Quản lý toàn bộ thông điệp chính, thời gian, địa điểm và hình ảnh nhận diện của sự kiện.
                  </p>
                </div>

                {/* Banner Hero Image Section */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#c83271]" />
                        <span>Hình nền Hero Banner chính (BG.png)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Hình nền phía trên cùng website (hiển thị bệnh viện, skyline và gương mặt thẩm mỹ).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={bannerFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerUpload}
                      />
                      <button
                        onClick={() => bannerFileRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-[#c83271] hover:bg-[#b0225d] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh mới từ máy tính</span>
                      </button>
                    </div>
                  </div>

                  {/* Banner Preview & URL Input */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
                    <div className="md:col-span-4 aspect-video rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 relative group shadow-2xs">
                      <img
                        src={cmsData.eventDetails.bannerImageUrl}
                        alt="Hero Banner Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // fallback preview if path is local
                          (e.target as HTMLImageElement).src = '/BG.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Đang sử dụng
                      </div>
                    </div>

                    <div className="md:col-span-8 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Đường dẫn ảnh hoặc Base64 Data URL:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.bannerImageUrl}
                          onChange={(e) => updateEventDetails({ bannerImageUrl: e.target.value })}
                          placeholder="/BG.png hoặc https://..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#174ea6] focus:ring-1 focus:ring-[#174ea6] outline-none"
                        />
                      </div>

                      {/* Quick preset selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                          Hoặc chọn nhanh từ các preset có sẵn:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['/BG.png', '/assets/BG.png'].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => {
                                updateEventDetails({ bannerImageUrl: preset });
                                showToast(`Đã áp dụng ${preset}`);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors border border-slate-200"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Host Organizations Logos on Hero Banner */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#174ea6]" />
                        <span>Logo 3 Đơn Vị Chủ Trì (Hiển Thị Trên Hero Banner &amp; Mục Đơn Vị)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tải ảnh logo từ máy tính (PNG trong suốt, SVG, WebP, JPG) hoặc dán link ảnh. Tự động đồng bộ lên thanh Header Hero Banner và mục Đơn vị đối tác.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('partners')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#174ea6] text-xs font-bold transition-all cursor-pointer w-fit"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Xem toàn bộ đối tác ({cmsData.partners.length})</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Host 1: KSAPS */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#174ea6] font-display flex items-center gap-1.5">
                          <span>KSAPS Hàn Quốc</span>
                          <span className="text-[10px] text-slate-400">🇰🇷</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-[#174ea6]">
                          Host 1
                        </span>
                      </div>

                      {/* Logo Preview & Upload */}
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          {cmsData.eventDetails.heroKsapsLogoUrl || cmsData.partners.find(p => p.id === 'ksaps')?.logoUrl ? (
                            <img
                              src={cmsData.eventDetails.heroKsapsLogoUrl || cmsData.partners.find(p => p.id === 'ksaps')?.logoUrl}
                              alt="KSAPS Logo"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Chưa có</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <input
                            type="file"
                            ref={ksapsHeroFileRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleHeroHostLogoUpload(e, 'ksaps')}
                          />
                          <button
                            type="button"
                            onClick={() => ksapsHeroFileRef.current?.click()}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#174ea6] border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Upload className="w-3 h-3 text-[#174ea6]" />
                            <span>Tải logo từ máy</span>
                          </button>

                          {PARTNER_LOGOS.ksaps && (
                            <button
                              type="button"
                              onClick={() => {
                                updateEventDetails({ heroKsapsLogoUrl: PARTNER_LOGOS.ksaps });
                                updatePartner('ksaps', { logoUrl: PARTNER_LOGOS.ksaps });
                                showToast('Đã khôi phục logo KSAPS chuẩn!');
                              }}
                              className="w-full text-center text-[10.5px] font-bold text-slate-500 hover:text-[#174ea6] transition-colors cursor-pointer"
                            >
                              Khôi phục logo chuẩn
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đường dẫn URL ảnh:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.heroKsapsLogoUrl || cmsData.partners.find(p => p.id === 'ksaps')?.logoUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateEventDetails({ heroKsapsLogoUrl: val });
                            updatePartner('ksaps', { logoUrl: val });
                          }}
                          placeholder="https://... hoặc data:image/..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono bg-white outline-none focus:border-[#174ea6]"
                        />
                      </div>
                    </div>

                    {/* Host 2: VSAPS */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#c83271] font-display flex items-center gap-1.5">
                          <span>VSAPS Việt Nam</span>
                          <span className="text-[10px] text-slate-400">🇻🇳</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-100 text-[#c83271]">
                          Host 2
                        </span>
                      </div>

                      {/* Logo Preview & Upload */}
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          {cmsData.eventDetails.heroVsapsLogoUrl || cmsData.partners.find(p => p.id === 'vsaps')?.logoUrl ? (
                            <img
                              src={cmsData.eventDetails.heroVsapsLogoUrl || cmsData.partners.find(p => p.id === 'vsaps')?.logoUrl}
                              alt="VSAPS Logo"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Chưa có</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <input
                            type="file"
                            ref={vsapsHeroFileRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleHeroHostLogoUpload(e, 'vsaps')}
                          />
                          <button
                            type="button"
                            onClick={() => vsapsHeroFileRef.current?.click()}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#c83271] border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Upload className="w-3 h-3 text-[#c83271]" />
                            <span>Tải logo từ máy</span>
                          </button>

                          {PARTNER_LOGOS.vsaps && (
                            <button
                              type="button"
                              onClick={() => {
                                updateEventDetails({ heroVsapsLogoUrl: PARTNER_LOGOS.vsaps });
                                updatePartner('vsaps', { logoUrl: PARTNER_LOGOS.vsaps });
                                showToast('Đã khôi phục logo VSAPS chuẩn!');
                              }}
                              className="w-full text-center text-[10.5px] font-bold text-slate-500 hover:text-[#c83271] transition-colors cursor-pointer"
                            >
                              Khôi phục logo chuẩn
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đường dẫn URL ảnh:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.heroVsapsLogoUrl || cmsData.partners.find(p => p.id === 'vsaps')?.logoUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateEventDetails({ heroVsapsLogoUrl: val });
                            updatePartner('vsaps', { logoUrl: val });
                          }}
                          placeholder="https://... hoặc data:image/..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono bg-white outline-none focus:border-[#c83271]"
                        />
                      </div>
                    </div>

                    {/* Host 3: BV Quân Y 175 */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#b91c1c] font-display flex items-center gap-1.5">
                          <span>Bệnh Viện Quân Y 175</span>
                          <span className="text-[10px] text-slate-400">🏥</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-[#b91c1c]">
                          Host 3
                        </span>
                      </div>

                      {/* Logo Preview & Upload */}
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          {cmsData.eventDetails.heroBv175LogoUrl || cmsData.partners.find(p => p.id === 'bv175')?.logoUrl ? (
                            <img
                              src={cmsData.eventDetails.heroBv175LogoUrl || cmsData.partners.find(p => p.id === 'bv175')?.logoUrl}
                              alt="BV 175 Logo"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Chưa có</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <input
                            type="file"
                            ref={bv175HeroFileRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleHeroHostLogoUpload(e, 'bv175')}
                          />
                          <button
                            type="button"
                            onClick={() => bv175HeroFileRef.current?.click()}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#b91c1c] border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Upload className="w-3 h-3 text-[#b91c1c]" />
                            <span>Tải logo từ máy</span>
                          </button>

                          {PARTNER_LOGOS.bv175 && (
                            <button
                              type="button"
                              onClick={() => {
                                updateEventDetails({ heroBv175LogoUrl: PARTNER_LOGOS.bv175 });
                                updatePartner('bv175', { logoUrl: PARTNER_LOGOS.bv175 });
                                showToast('Đã khôi phục logo BV 175 chuẩn!');
                              }}
                              className="w-full text-center text-[10.5px] font-bold text-slate-500 hover:text-[#b91c1c] transition-colors cursor-pointer"
                            >
                              Khôi phục logo chuẩn
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đường dẫn URL ảnh:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.heroBv175LogoUrl || cmsData.partners.find(p => p.id === 'bv175')?.logoUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateEventDetails({ heroBv175LogoUrl: val });
                            updatePartner('bv175', { logoUrl: val });
                          }}
                          placeholder="https://... hoặc data:image/..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono bg-white outline-none focus:border-[#b91c1c]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Titles Form */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Tiêu Đề &amp; Thông Điệp Hội Thảo
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dòng tiêu đề chính 1:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroHeadingLine1}
                        onChange={(e) => updateEventDetails({ heroHeadingLine1: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dòng tiêu đề chính 2:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroHeadingLine2}
                        onChange={(e) => updateEventDetails({ heroHeadingLine2: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tiêu đề phụ (Slogan):
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.subtitle}
                        onChange={(e) => updateEventDetails({ subtitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Date, Time & Venue */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Thời Gian &amp; Địa Điểm Tổ Chức
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ngày tổ chức:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.dateString}
                        onChange={(e) => updateEventDetails({ dateString: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Thời gian chi tiết:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.timeDetail}
                        onChange={(e) => updateEventDetails({ timeDetail: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên hội trường / địa điểm rút gọn:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.venueShort}
                        onChange={(e) => updateEventDetails({ venueShort: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên hội trường đầy đủ:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.venueName}
                        onChange={(e) => updateEventDetails({ venueName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Địa chỉ chính xác:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.venueAddress}
                        onChange={(e) => updateEventDetails({ venueAddress: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Link chỉ đường Google Maps:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.googleMapsUrl}
                        onChange={(e) => updateEventDetails({ googleMapsUrl: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Hosts & Patronize Entities */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Các Đơn Vị Chủ Trì &amp; Bảo Trợ
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Chủ trì (Host):
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.hostsText}
                        onChange={(e) => updateEventDetails({ hostsText: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Đồng tổ chức (Co-Organizers):
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.coOrganizersText}
                        onChange={(e) => updateEventDetails({ coOrganizersText: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bảo trợ (Patronize):
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.patronizeText}
                        onChange={(e) => updateEventDetails({ patronizeText: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Capacity */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Quy Mô Ghế Ngồi &amp; Hotline Liên Hệ
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tổng số ghế đại biểu:
                      </label>
                      <input
                        type="number"
                        value={cmsData.eventDetails.totalSeats}
                        onChange={(e) => updateEventDetails({ totalSeats: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hotline:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.hotline}
                        onChange={(e) => updateEventDetails({ hotline: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Điện thoại bàn:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.telephone}
                        onChange={(e) => updateEventDetails({ telephone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email liên hệ:
                      </label>
                      <input
                        type="email"
                        value={cmsData.eventDetails.email}
                        onChange={(e) => updateEventDetails({ email: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Account & Security Settings */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border border-blue-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-blue-100/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#002045] to-[#174ea6] text-white flex items-center justify-center shadow-xs">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-bold text-slate-900">
                            Tài Khoản &amp; Mật Khẩu Đăng Nhập Quản Trị
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 text-[#174ea6]">
                            Bảo Mật CMS
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tài khoản này dùng để đăng nhập vào trang CMS <code>/admin</code>. Bạn có thể đổi tài khoản và mật khẩu bất kỳ lúc nào.
                        </p>
                      </div>
                    </div>
                    {accountUpdatedMsg && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-pulse">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Đã lưu thành công!</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSaveAdminAccount} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tên đăng nhập (Username):
                        </label>
                        <input
                          type="text"
                          value={adminUsernameInput}
                          onChange={(e) => setAdminUsernameInput(e.target.value)}
                          placeholder="admin"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] focus:ring-1 focus:ring-[#174ea6] outline-none transition-all"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Mặc định ban đầu: <code>admin</code></p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Mật khẩu đăng nhập (Password):
                        </label>
                        <div className="relative">
                          <input
                            type={showAdminPassword ? 'text' : 'password'}
                            value={adminPasswordInput}
                            onChange={(e) => setAdminPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] focus:ring-1 focus:ring-[#174ea6] outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                            title={showAdminPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Mặc định ban đầu: <code>kbit@2026</code></p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                      <div className="text-[11px] text-slate-500">
                        {cmsData.adminAccount?.lastUpdated && (
                          <span>Cập nhật lần cuối: {new Date(cmsData.adminAccount.lastUpdated).toLocaleString('vi-VN')}</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#002045] via-[#174ea6] to-[#c83271] text-white text-xs font-bold hover:shadow-md transition-all flex items-center gap-2 cursor-pointer ml-auto"
                      >
                        <Save className="w-4 h-4" />
                        <span>Lưu Tài Khoản &amp; Mật Khẩu</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 2: QUẢN LÝ CHUYÊN GIA (SPEAKERS CMS)
               ========================================================================= */}
            {activeAdminTab === 'speakers' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[20px] font-black text-slate-900">
                      Quản Lý 6 Chuyên Gia &amp; Báo Cáo Viên
                    </h2>
                    <p className="text-[13px] text-slate-500">
                      Chỉnh sửa chân dung, họ tên, vai trò và từng gạch đầu dòng tiểu sử chính xác.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const newId = `exp-new-${Date.now()}`;
                      const newExpert: ExpertSpeaker = {
                        id: newId,
                        name: 'GS.BS. CHUYÊN GIA MỚI',
                        roleTitle: 'Báo cáo viên',
                        bioPoints: ['Giáo sư / Bác sĩ chuyên khoa Phẫu thuật Thẩm mỹ', 'Hội viên Hiệp hội Thẩm mỹ Quốc tế'],
                        country: 'KR',
                        countryName: 'Hàn Quốc',
                        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
                        badgeOrg: 'CHUYÊN GIA',
                        badgeColor: 'bg-[#174ea6] text-white',
                      };
                      addExpert(newExpert);
                      setSelectedExpertId(newId);
                      showToast('Đã thêm chuyên gia mới!');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174ea6] hover:bg-[#123e85] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm chuyên gia mới</span>
                  </button>
                </div>

                {/* Expert Selection Pills */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                  {cmsData.experts.map((exp, idx) => (
                    <button
                      key={exp.id}
                      onClick={() => setSelectedExpertId(exp.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedExpert?.id === exp.id
                          ? 'bg-[#c83271] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <img
                        src={exp.avatarUrl}
                        alt={exp.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{exp.name}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Expert Form */}
                {selectedExpert && (
                  <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
                    {/* Top Identity Block with Avatar Uploader */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
                      <div className="relative group shrink-0">
                        <img
                          src={selectedExpert.avatarUrl}
                          alt={selectedExpert.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-pink-200 shadow-md"
                        />
                        <button
                          onClick={() => speakerPhotoRef.current?.click()}
                          className="absolute inset-0 bg-slate-900/60 rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Đổi ảnh</span>
                        </button>
                        <input
                          type="file"
                          ref={speakerPhotoRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSpeakerAvatarUpload(e, selectedExpert.id)}
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Chuyên gia #{cmsData.experts.findIndex((e) => e.id === selectedExpert.id) + 1}
                          </span>
                          {cmsData.experts.length > 1 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa chuyên gia ${selectedExpert.name}?`)) {
                                  deleteExpert(selectedExpert.id);
                                  setSelectedExpertId(cmsData.experts[0]?.id || null);
                                  showToast('Đã xóa chuyên gia');
                                }
                              }}
                              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa chuyên gia này</span>
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            URL ảnh đại diện (hoặc bấm vào ảnh để tải file):
                          </label>
                          <input
                            type="text"
                            value={selectedExpert.avatarUrl}
                            onChange={(e) => updateExpert(selectedExpert.id, { avatarUrl: e.target.value })}
                            className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#174ea6] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Họ và tên bác sĩ:
                        </label>
                        <input
                          type="text"
                          value={selectedExpert.name}
                          onChange={(e) => updateExpert(selectedExpert.id, { name: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-[#174ea6] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Vai trò trong hội thảo:
                        </label>
                        <input
                          type="text"
                          value={selectedExpert.roleTitle}
                          onChange={(e) => updateExpert(selectedExpert.id, { roleTitle: e.target.value })}
                          placeholder="Diễn giả bài phát biểu mở màn HOẶC Báo cáo viên"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tổ chức / Huy hiệu viết tắt (Badge):
                        </label>
                        <input
                          type="text"
                          value={selectedExpert.badgeOrg}
                          onChange={(e) => updateExpert(selectedExpert.id, { badgeOrg: e.target.value })}
                          placeholder="CHỦ TỊCH KSAPS / SNUBH / THE PLUS..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:border-[#174ea6] outline-none"
                        />
                      </div>
                    </div>

                    {/* Bio Points Manager */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <span>Các dòng Tiểu sử &amp; Quá trình công tác ({selectedExpert.bioPoints.length} dòng):</span>
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Hiển thị trọn vẹn trong Popup chi tiết
                        </span>
                      </div>

                      <div className="space-y-2">
                        {selectedExpert.bioPoints.map((point, pIndex) => (
                          <div key={pIndex} className="flex items-center gap-2">
                            <span className="w-5 text-center text-xs font-bold text-slate-400">
                              {pIndex + 1}.
                            </span>
                            <input
                              type="text"
                              value={point}
                              onChange={(e) => {
                                const newPoints = [...selectedExpert.bioPoints];
                                newPoints[pIndex] = e.target.value;
                                updateExpert(selectedExpert.id, { bioPoints: newPoints });
                              }}
                              className="flex-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#174ea6] outline-none"
                            />
                            <button
                              onClick={() => {
                                const newPoints = selectedExpert.bioPoints.filter((_, idx) => idx !== pIndex);
                                updateExpert(selectedExpert.id, { bioPoints: newPoints });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Xóa dòng này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new bio point */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={newBioPoint}
                          onChange={(e) => setNewBioPoint(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newBioPoint.trim()) {
                              updateExpert(selectedExpert.id, {
                                bioPoints: [...selectedExpert.bioPoints, newBioPoint.trim()],
                              });
                              setNewBioPoint('');
                              showToast('Đã thêm dòng tiểu sử!');
                            }
                          }}
                          placeholder="Nhập nội dung tiểu sử mới rồi nhấn Enter hoặc nút Thêm..."
                          className="flex-1 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 text-xs focus:border-[#174ea6] outline-none"
                        />
                        <button
                          onClick={() => {
                            if (newBioPoint.trim()) {
                              updateExpert(selectedExpert.id, {
                                bioPoints: [...selectedExpert.bioPoints, newBioPoint.trim()],
                              });
                              setNewBioPoint('');
                              showToast('Đã thêm dòng tiểu sử!');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          Thêm dòng
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                TAB 3: QUẢN LÝ LỊCH TRÌNH (AGENDA CMS)
               ========================================================================= */}
            {activeAdminTab === 'agenda' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[20px] font-black text-slate-900">
                      Quản Lý Lịch Trình Hội Thảo Khoa Học
                    </h2>
                    <p className="text-[13px] text-slate-500">
                      Điều chỉnh các phiên báo cáo, thời gian bắt đầu, thời lượng và tóm tắt học thuật.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const newAgenda: AgendaItem = {
                        id: `item-${Date.now()}`,
                        time: '16:50 – 17:00',
                        duration: "10'",
                        title: 'PHIÊN BÁO CÁO MỚI',
                        description: 'Nội dung tóm tắt chuyên đề khoa học.',
                        session: 'session2',
                      };
                      addAgendaItem(newAgenda);
                      setEditingAgendaId(newAgenda.id);
                      showToast('Đã thêm phiên báo cáo mới!');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174ea6] hover:bg-[#123e85] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm mục lịch trình</span>
                  </button>
                </div>

                {/* Agenda List */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {cmsData.agenda.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#174ea6] font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {item.time} ({item.duration})
                            </span>
                            {item.isKeynote && (
                              <span className="px-2 py-0.5 rounded-md bg-pink-100 text-[#c83271] font-bold text-[10.5px]">
                                ⭐ BÁO CÁO ĐỀ DẪN
                              </span>
                            )}
                            {item.isQA && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10.5px]">
                                💬 HỎI ĐÁP Q&amp;A
                              </span>
                            )}
                          </div>

                          <h3 className="text-[14.5px] font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => setEditingAgendaId(editingAgendaId === item.id ? null : item.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#174ea6]" />
                          <span>{editingAgendaId === item.id ? 'Đóng' : 'Sửa'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Xóa mục: ${item.title}?`)) {
                              deleteAgendaItem(item.id);
                              showToast('Đã xóa mục lịch trình');
                            }
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa mục này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Expanded Edit Form */}
                      {editingAgendaId === item.id && (
                        <div className="w-full mt-4 pt-4 border-t border-slate-200/80 bg-slate-50 p-4 rounded-2xl space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Khung giờ:
                              </label>
                              <input
                                type="text"
                                value={item.time}
                                onChange={(e) => updateAgendaItem(item.id, { time: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Thời lượng:
                              </label>
                              <input
                                type="text"
                                value={item.duration}
                                onChange={(e) => updateAgendaItem(item.id, { duration: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Phân loại phiên:
                              </label>
                              <select
                                value={item.session || 'session1'}
                                onChange={(e) => updateAgendaItem(item.id, { session: e.target.value as any })}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                              >
                                <option value="plenary">Khai mạc / Toàn thể</option>
                                <option value="session1">Phiên 1: Phẫu thuật thẩm mỹ</option>
                                <option value="break">Nghỉ giải lao / Tea break</option>
                                <option value="session2">Phiên 2: Thẩm mỹ nội khoa</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Tiêu đề bài báo cáo:
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateAgendaItem(item.id, { title: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Tóm tắt nội dung khoa học:
                            </label>
                            <textarea
                              rows={2}
                              value={item.description}
                              onChange={(e) => updateAgendaItem(item.id, { description: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 4: KHO QUẢN LÝ HÌNH ẢNH (MEDIA LIBRARY)
               ========================================================================= */}
            {activeAdminTab === 'media' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[20px] font-black text-slate-900">
                      Kho Quản Lý Hình Ảnh &amp; Media
                    </h2>
                    <p className="text-[13px] text-slate-500">
                      Tập hợp toàn bộ các hình ảnh banner, chân dung bác sĩ, bản đồ hội thảo.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={generalMediaRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleGeneralMediaUpload}
                    />
                    <button
                      onClick={() => generalMediaRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Tải ảnh mới từ máy</span>
                    </button>
                  </div>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {cmsData.mediaLibrary.map((imgUrl, index) => {
                    const isCurrentBanner = cmsData.eventDetails.bannerImageUrl === imgUrl;

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative mb-2">
                          <img
                            src={imgUrl}
                            alt={`Media ${index}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/BG.png';
                            }}
                          />
                          {isCurrentBanner && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#c83271] text-white text-[10px] font-bold shadow-xs">
                              Ảnh nền Hero
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <button
                              onClick={() => {
                                updateEventDetails({ bannerImageUrl: imgUrl });
                                showToast('Đã chọn làm ảnh nền Hero!');
                              }}
                              className="text-[11px] font-bold text-[#174ea6] hover:underline cursor-pointer"
                            >
                              Đặt làm Banner
                            </button>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(imgUrl);
                                showToast('Đã copy đường dẫn ảnh!');
                              }}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 cursor-pointer"
                              title="Sao chép link ảnh"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 5: ĐƠN VỊ & ĐỐI TÁC (PARTNERS & LOGOS)
               ========================================================================= */}
            {activeAdminTab === 'partners' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[20px] font-black text-slate-900">
                      Đơn Vị Chủ Trì, Bảo Trợ &amp; Đối Tác Đồng Hành
                    </h2>
                    <p className="text-[13px] text-slate-500">
                      Quản lý logo, tên viết tắt, vai trò và phân loại màu cho từng đơn vị hợp tác.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddNewPartner}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174ea6] hover:bg-[#133e85] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm đơn vị đối tác</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {cmsData.partners.map((partner) => {
                    const defaultLogo = PARTNER_LOGOS[partner.id];

                    return (
                      <div
                        key={partner.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                      >
                        {/* Header of Partner Card */}
                        <div className="flex flex-col gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#174ea6] font-black text-xs">
                                {partner.shortName || 'LOGO'}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400">
                                ID: {partner.id}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <select
                                value={partner.accent}
                                onChange={(e) => updatePartner(partner.id, { accent: e.target.value as any })}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold bg-slate-50 text-slate-700 cursor-pointer"
                                title="Chọn gam màu đại diện"
                              >
                                <option value="primary">Màu Xanh (Primary)</option>
                                <option value="secondary">Màu Hồng (Secondary)</option>
                                <option value="tertiary">Màu Xanh lá (Tertiary)</option>
                              </select>

                              {cmsData.partners.length > 1 && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Xóa đối tác: ${partner.name}?`)) {
                                      deletePartner(partner.id);
                                      showToast('Đã xóa đối tác thành công');
                                    }
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Xóa đối tác"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {['ksaps', 'vsaps', 'bv175'].includes(partner.id) && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-[10.5px] font-bold">
                              <span>⭐</span>
                              <span>ĐƠN VỊ CHỦ TRÌ • TỰ ĐỘNG ĐỒNG BỘ LÊN HERO BANNER</span>
                            </div>
                          )}
                        </div>

                        {/* Logo Preview & Upload Box */}
                        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3.5">
                          <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                            {partner.logoUrl ? (
                              <img
                                src={partner.logoUrl}
                                alt={partner.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                Chưa có
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs">
                                <Upload className="w-3 h-3 text-[#174ea6]" />
                                <span>Tải logo từ máy</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePartnerLogoUpload(e, partner.id)}
                                />
                              </label>

                              {defaultLogo && partner.logoUrl !== defaultLogo && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updatePartner(partner.id, { logoUrl: defaultLogo });
                                    if (partner.id === 'ksaps') updateEventDetails({ heroKsapsLogoUrl: defaultLogo });
                                    if (partner.id === 'vsaps') updateEventDetails({ heroVsapsLogoUrl: defaultLogo });
                                    if (partner.id === 'bv175') updateEventDetails({ heroBv175LogoUrl: defaultLogo });
                                    showToast('Đã áp dụng logo vector chuẩn!');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#174ea6] text-[10.5px] font-bold transition-colors cursor-pointer"
                                  title="Khôi phục logo SVG chuẩn sắc nét"
                                >
                                  Dùng logo chuẩn
                                </button>
                              )}

                              {partner.logoUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updatePartner(partner.id, { logoUrl: '' });
                                    if (partner.id === 'ksaps') updateEventDetails({ heroKsapsLogoUrl: '' });
                                    if (partner.id === 'vsaps') updateEventDetails({ heroVsapsLogoUrl: '' });
                                    if (partner.id === 'bv175') updateEventDetails({ heroBv175LogoUrl: '' });
                                    showToast('Đã gỡ logo đối tác!');
                                  }}
                                  className="px-2 py-1 rounded-lg hover:bg-rose-50 text-rose-500 text-[10.5px] font-bold transition-colors cursor-pointer"
                                  title="Gỡ bỏ logo"
                                >
                                  Gỡ logo
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Hỗ trợ SVG, PNG trong suốt, JPG, WebP.
                            </p>
                          </div>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Đường dẫn Logo (URL hoặc Data URI):
                            </label>
                            <input
                              type="text"
                              value={partner.logoUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                updatePartner(partner.id, { logoUrl: val });
                                if (partner.id === 'ksaps') updateEventDetails({ heroKsapsLogoUrl: val });
                                if (partner.id === 'vsaps') updateEventDetails({ heroVsapsLogoUrl: val });
                                if (partner.id === 'bv175') updateEventDetails({ heroBv175LogoUrl: val });
                              }}
                              placeholder="https://... hoặc data:image/..."
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono bg-white text-slate-800"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                Tên viết tắt (Badge):
                              </label>
                              <input
                                type="text"
                                value={partner.shortName}
                                onChange={(e) => updatePartner(partner.id, { shortName: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                Vai trò đại diện:
                              </label>
                              <input
                                type="text"
                                value={partner.role}
                                onChange={(e) => updatePartner(partner.id, { role: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Tên tổ chức đầy đủ:
                            </label>
                            <input
                              type="text"
                              value={partner.name}
                              onChange={(e) => updatePartner(partner.id, { name: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 6: ĐIỂM NHẤN & CME (HIGHLIGHTS)
               ========================================================================= */}
            {activeAdminTab === 'highlights' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[20px] font-black text-slate-900">
                    Điểm Nhấn Sự Kiện &amp; Chứng Nhận CME
                  </h2>
                  <p className="text-[13px] text-slate-500">
                    Quản lý 4 cột mốc quan trọng về quy mô, khu triển lãm, ngôn ngữ và CME.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cmsData.highlights.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-[#174ea6]">
                          {item.label}
                        </span>
                        <span className="material-symbols-outlined text-[20px] text-pink-600">
                          {item.icon}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Chỉ số nổi bật (Metric):
                        </label>
                        <input
                          type="text"
                          value={item.metric}
                          onChange={(e) => updateHighlight(item.id, { metric: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-black text-[#174ea6]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Nhãn (Label):
                        </label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateHighlight(item.id, { label: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Mô tả chi tiết:
                        </label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => updateHighlight(item.id, { description: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 7: QUẢN LÝ ĐẠI BIỂU ĐĂNG KÝ (REGISTRATIONS)
               ========================================================================= */}
            {activeAdminTab === 'registrations' && (
              <div className="space-y-6">
                {/* Header & Export button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[20px] font-black text-slate-900 flex items-center gap-2">
                      <span>Danh Sách Đại Biểu Đã Đăng Ký</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                        {cmsData.registrations.length} Đại biểu
                      </span>
                    </h2>
                    <p className="text-[13px] text-slate-500">
                      Theo dõi số lượng đăng ký tham dự, thông tin bác sĩ &amp; doanh nghiệp, nhu cầu cấp chứng nhận CME và xuất dữ liệu báo cáo.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={async () => {
                        await refreshFromCloud();
                        showToast('Đã cập nhật danh sách đại biểu từ Vercel Postgres!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-[#174ea6] hover:bg-blue-100 text-xs font-bold transition-all border border-blue-200 cursor-pointer shadow-2xs"
                      title="Tải lại danh sách đại biểu mới nhất từ cơ sở dữ liệu Vercel Postgres"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Đồng bộ từ Database</span>
                    </button>

                    <button
                      onClick={handleExportRegistrationsCSV}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Xuất File Excel Đầy Đủ (CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Summary Metric Cards with Attended Programs Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tổng đăng ký
                    </span>
                    <span className="text-[22px] font-black text-[#002045]">
                      {cmsData.registrations.length}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#eff4ff] border border-[#d0e1fd] shadow-2xs">
                    <span className="text-[11px] font-bold text-[#174ea6] uppercase tracking-wider block mb-1">
                      Bác sĩ &amp; Y tế
                    </span>
                    <span className="text-[22px] font-black text-[#174ea6]">
                      {cmsData.registrations.filter((r) => r.attendeeType === 'doctor' || !r.attendeeType).length}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#fff0f5] border border-[#f8d0e0] shadow-2xs">
                    <span className="text-[11px] font-bold text-[#c83271] uppercase tracking-wider block mb-1">
                      Doanh nghiệp &amp; Spa
                    </span>
                    <span className="text-[22px] font-black text-[#c83271]">
                      {cmsData.registrations.filter((r) => r.attendeeType === 'business').length}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-[#174ea6] uppercase tracking-wider block mb-1">
                      Hội thảo BV 175 (SYM)
                    </span>
                    <span className="text-[22px] font-black text-[#174ea6]">
                      {cmsData.registrations.filter((r) => (r.selectedEvents || ['SYM']).includes('SYM')).length}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pink-50/80 border border-pink-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-[#c83271] uppercase tracking-wider block mb-1">
                      K-Beauty HIU (KAT)
                    </span>
                    <span className="text-[22px] font-black text-[#c83271]">
                      {cmsData.registrations.filter((r) => (r.selectedEvents || []).includes('KAT')).length}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      Cần cấp CME BV 175
                    </span>
                    <span className="text-[22px] font-black text-emerald-800">
                      {cmsData.registrations.filter((r) => r.wantsCme || r.cmeNeed === 'yes').length}
                    </span>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 overflow-x-auto no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setRegistrationFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          registrationFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Tất cả ({cmsData.registrations.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegistrationFilter('doctor')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          registrationFilter === 'doctor'
                            ? 'bg-white text-[#174ea6] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Bác sĩ ({cmsData.registrations.filter((r) => r.attendeeType === 'doctor' || !r.attendeeType).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegistrationFilter('business')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          registrationFilter === 'business'
                            ? 'bg-white text-[#c83271] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Doanh nghiệp ({cmsData.registrations.filter((r) => r.attendeeType === 'business').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegistrationFilter('cme')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          registrationFilter === 'cme'
                            ? 'bg-white text-emerald-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Cần CME ({cmsData.registrations.filter((r) => r.wantsCme || r.cmeNeed === 'yes').length})
                      </button>
                    </div>

                    {/* Program / Event Filter Pills */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-blue-50/70 border border-blue-200/80 overflow-x-auto no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setEventFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer ${
                          eventFilter === 'all'
                            ? 'bg-[#002045] text-white shadow-xs'
                            : 'text-slate-700 hover:text-[#002045]'
                        }`}
                      >
                        Mọi sự kiện
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventFilter('SYM')}
                        className={`px-2.5 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer ${
                          eventFilter === 'SYM'
                            ? 'bg-[#174ea6] text-white shadow-xs'
                            : 'text-blue-900 hover:text-[#174ea6]'
                        }`}
                      >
                        SYM (03/10)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventFilter('KAT')}
                        className={`px-2.5 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer ${
                          eventFilter === 'KAT'
                            ? 'bg-[#c83271] text-white shadow-xs'
                            : 'text-pink-900 hover:text-[#c83271]'
                        }`}
                      >
                        KAT (04/10)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventFilter('both')}
                        className={`px-2.5 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer ${
                          eventFilter === 'both'
                            ? 'bg-gradient-to-r from-[#174ea6] to-[#c83271] text-white shadow-xs'
                            : 'text-slate-700 hover:text-[#002045]'
                        }`}
                      >
                        Cả 2 ngày
                      </button>
                    </div>
                  </div>

                  {/* Quick Search */}
                  <div className="relative w-full lg:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={registrationSearch}
                      onChange={(e) => setRegistrationSearch(e.target.value)}
                      placeholder="Tìm tên, SĐT, email, viện, sự kiện..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-[#174ea6] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Attendees Table */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10.5px]">
                        <tr>
                          <th className="px-3.5 py-3">Mã ĐK &amp; Nhóm</th>
                          <th className="px-3.5 py-3">Họ và tên &amp; Liên hệ</th>
                          <th className="px-3.5 py-3">Chương Trình Tham Dự</th>
                          <th className="px-3.5 py-3">Đơn vị &amp; Chức danh</th>
                          <th className="px-3.5 py-3">Chuyên khoa / CCHN</th>
                          <th className="px-3.5 py-3 text-center">CME</th>
                          <th className="px-3.5 py-3">Thời gian</th>
                          <th className="px-3.5 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {cmsData.registrations
                          .filter((r) => {
                            if (registrationFilter === 'doctor' && r.attendeeType === 'business') return false;
                            if (registrationFilter === 'business' && r.attendeeType !== 'business') return false;
                            if (registrationFilter === 'cme' && !r.wantsCme && r.cmeNeed !== 'yes') return false;

                            const ev = r.selectedEvents && r.selectedEvents.length > 0 ? r.selectedEvents : ['SYM'];
                            if (eventFilter === 'SYM' && !ev.includes('SYM')) return false;
                            if (eventFilter === 'KAT' && !ev.includes('KAT')) return false;
                            if (eventFilter === 'both' && (!ev.includes('SYM') || !ev.includes('KAT'))) return false;

                            if (!registrationSearch) return true;
                            const q = registrationSearch.toLowerCase();
                            return (
                              r.fullName.toLowerCase().includes(q) ||
                              r.phone.toLowerCase().includes(q) ||
                              r.institution.toLowerCase().includes(q) ||
                              r.email.toLowerCase().includes(q) ||
                              (r.registrationCode && r.registrationCode.toLowerCase().includes(q)) ||
                              (r.specialty && r.specialty.toLowerCase().includes(q)) ||
                              (r.license && r.license.toLowerCase().includes(q)) ||
                              ev.some((e) => e.toLowerCase().includes(q))
                            );
                          })
                          .map((attendee) => {
                            const isDoctor = attendee.attendeeType === 'doctor' || !attendee.attendeeType;
                            const hasCme = attendee.wantsCme || attendee.cmeNeed === 'yes';
                            const events = attendee.selectedEvents && attendee.selectedEvents.length > 0
                              ? attendee.selectedEvents
                              : ['SYM'];

                            return (
                              <tr key={attendee.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-3.5 py-3">
                                  <div className="font-mono font-bold text-[#174ea6] text-[12px]">
                                    {attendee.registrationCode}
                                  </div>
                                  <span
                                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 uppercase ${
                                      isDoctor
                                        ? 'bg-[#eff4ff] text-[#174ea6] border border-[#d0e1fd]'
                                        : 'bg-[#fff0f5] text-[#c83271] border border-[#f8d0e0]'
                                    }`}
                                  >
                                    {isDoctor ? 'Bác sĩ' : 'Doanh nghiệp'}
                                  </span>
                                </td>

                                <td className="px-3.5 py-3">
                                  <div className="font-bold text-slate-900 text-[13px]">
                                    {attendee.fullName}
                                  </div>
                                  <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{attendee.phone}</span>
                                  </div>
                                  <div className="text-[10.5px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span className="truncate max-w-[140px]">{attendee.email}</span>
                                  </div>
                                </td>

                                <td className="px-3.5 py-3">
                                  <div className="flex flex-col gap-1 min-w-[170px]">
                                    {events.includes('SYM') && (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#174ea6] border border-[#d0e1fd] font-bold text-[10.5px] whitespace-nowrap">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#174ea6] shrink-0"></span>
                                        <span>SYM: Hội thảo (03/10 BV175)</span>
                                      </span>
                                    )}
                                    {events.includes('KAT') && (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#fff0f5] text-[#c83271] border border-[#f8d0e0] font-bold text-[10.5px] whitespace-nowrap">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#c83271] shrink-0"></span>
                                        <span>KAT: K-Beauty (04/10 HIU)</span>
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="px-3.5 py-3">
                                  <div className="font-semibold text-slate-800 line-clamp-1" title={attendee.institution}>
                                    {attendee.institution}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {attendee.titleRole || attendee.degree || 'Đại biểu'}
                                  </div>
                                </td>

                                <td className="px-3.5 py-3">
                                  <div className="text-[11.5px] text-slate-700 font-medium">
                                    {attendee.specialty || 'Chung'}
                                  </div>
                                  {attendee.license && (
                                    <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                                      {attendee.license}
                                    </div>
                                  )}
                                </td>

                                <td className="px-3.5 py-3 text-center">
                                  {hasCme ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10.5px]">
                                      Có CME
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10.5px]">
                                      Không
                                    </span>
                                  )}
                                </td>

                                <td className="px-3.5 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                                  {attendee.registeredAt}
                                </td>

                                <td className="px-3.5 py-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setInspectingAttendee(attendee)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#174ea6] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                                      title="Xem chi tiết hồ sơ đại biểu"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditAttendee(attendee)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                      title="Chỉnh sửa chương trình tham dự &amp; hồ sơ đại biểu"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Xóa đại biểu ${attendee.fullName}?`)) {
                                          deleteRegistration(attendee.id);
                                          showToast('Đã xóa đại biểu thành công');
                                        }
                                      }}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Xóa đại biểu"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                        {cmsData.registrations.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-xs">
                              Chưa có đại biểu nào đăng ký.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inspecting Attendee Detail Modal */}
                {inspectingAttendee && (
                  <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
                      {/* Modal Header */}
                      <div className="px-6 py-4 bg-gradient-to-r from-[#002045] to-[#174ea6] text-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-white/15 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold font-display">Chi Tiết Hồ Sơ Đại Biểu</h3>
                            <span className="text-[11px] font-mono text-pink-200">{inspectingAttendee.registrationCode}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setInspectingAttendee(null)}
                          className="size-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6 overflow-y-auto space-y-4 text-xs">
                        {/* Attendee Category & Events Banner */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div>
                            <span className="text-[10.5px] uppercase font-bold text-slate-400 block mb-0.5">Nhóm Đại Biểu</span>
                            <span className="text-[13px] font-extrabold text-[#002045]">
                              {inspectingAttendee.attendeeType === 'doctor' ? 'Bác sĩ & Y tế' : 'Doanh nghiệp & Spa'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10.5px] uppercase font-bold text-slate-400 block mb-0.5">Chương trình tham gia</span>
                            <div className="flex gap-1 justify-end">
                              {(inspectingAttendee.selectedEvents || ['SYM']).map((code) => (
                                <span key={code} className="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-100 text-[#174ea6]">
                                  {code === 'SYM' ? 'SYM (03/10)' : 'KAT (04/10)'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                          <h4 className="text-[12px] font-bold text-[#002045] uppercase tracking-wider mb-2">
                            1. Thông tin liên hệ
                          </h4>
                          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border border-slate-100 bg-[#f8faff]">
                            <div>
                              <span className="text-[10.5px] text-slate-400 block">Họ và Tên</span>
                              <span className="font-bold text-slate-800 text-[13px]">{inspectingAttendee.fullName}</span>
                            </div>
                            <div>
                              <span className="text-[10.5px] text-slate-400 block">Số điện thoại / Zalo</span>
                              <span className="font-bold text-slate-800">{inspectingAttendee.phone}</span>
                            </div>
                            <div>
                              <span className="text-[10.5px] text-slate-400 block">Email</span>
                              <span className="font-semibold text-slate-700">{inspectingAttendee.email}</span>
                            </div>
                            <div>
                              <span className="text-[10.5px] text-slate-400 block">Địa phương</span>
                              <span className="font-semibold text-slate-700">
                                {inspectingAttendee.city || 'TP. Hồ Chí Minh'}, {inspectingAttendee.country || 'Việt Nam'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Professional Information */}
                        <div>
                          <h4 className="text-[12px] font-bold text-[#002045] uppercase tracking-wider mb-2">
                            2. Thông tin chuyên môn / đơn vị
                          </h4>
                          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border border-slate-100 bg-[#f8faff]">
                            <div className="col-span-2">
                              <span className="text-[10.5px] text-slate-400 block">Bệnh viện / Cơ sở / Doanh nghiệp</span>
                              <span className="font-bold text-slate-800 text-[12.5px]">{inspectingAttendee.institution}</span>
                            </div>
                            <div>
                              <span className="text-[10.5px] text-slate-400 block">Chức vụ / Chức danh</span>
                              <span className="font-semibold text-slate-700">
                                {inspectingAttendee.titleRole || inspectingAttendee.degree || 'Chưa cập nhật'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10.5px] text-slate-400 block">Chuyên khoa / Ngành hàng</span>
                              <span className="font-semibold text-slate-700">{inspectingAttendee.specialty || 'Chung'}</span>
                            </div>
                            <div>
                              <span className="text-[10.5px] text-slate-400 block">Số CCHN / Mã số thuế</span>
                              <span className="font-mono font-semibold text-slate-700">
                                {inspectingAttendee.license || 'Không có'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10.5px] text-slate-400 block">Chứng nhận CME BV 175</span>
                              <span className={`font-bold ${inspectingAttendee.wantsCme || inspectingAttendee.cmeNeed === 'yes' ? 'text-[#c83271]' : 'text-slate-500'}`}>
                                {inspectingAttendee.wantsCme || inspectingAttendee.cmeNeed === 'yes' ? 'Có yêu cầu cấp' : 'Không'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interests & Goals */}
                        {((inspectingAttendee.interests && inspectingAttendee.interests.length > 0) ||
                          (inspectingAttendee.goals && inspectingAttendee.goals.length > 0)) && (
                          <div>
                            <h4 className="text-[12px] font-bold text-[#002045] uppercase tracking-wider mb-2">
                              3. Lĩnh vực quan tâm &amp; Mục tiêu
                            </h4>
                            <div className="p-3 rounded-xl border border-slate-100 bg-[#f8faff] space-y-2">
                              {inspectingAttendee.interests && inspectingAttendee.interests.length > 0 && (
                                <div>
                                  <span className="text-[10.5px] text-slate-400 block mb-1">Chuyên đề quan tâm:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {inspectingAttendee.interests.map((it) => (
                                      <span key={it} className="px-2 py-0.5 rounded-md bg-[#002045]/10 text-[#002045] text-[11px] font-medium">
                                        {it}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {inspectingAttendee.goals && inspectingAttendee.goals.length > 0 && (
                                <div>
                                  <span className="text-[10.5px] text-slate-400 block mb-1">Mục tiêu tham dự:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {inspectingAttendee.goals.map((g) => (
                                      <span key={g} className="px-2 py-0.5 rounded-md bg-[#c83271]/10 text-[#c83271] text-[11px] font-medium">
                                        {g}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {inspectingAttendee.notes && (
                          <div>
                            <h4 className="text-[12px] font-bold text-[#002045] uppercase tracking-wider mb-1">
                              4. Ghi chú từ đại biểu
                            </h4>
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11.5px] italic">
                              "{inspectingAttendee.notes}"
                            </div>
                          </div>
                        )}

                        {/* Meta info */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Thời gian gửi form: {inspectingAttendee.registeredAt}</span>
                          {inspectingAttendee.qrCodeUrl && (
                            <a
                              href={inspectingAttendee.qrCodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#174ea6] font-bold hover:underline flex items-center gap-1"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Xem mã QR</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditAttendee(inspectingAttendee)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#174ea6] to-[#c83271] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa chương trình &amp; hồ sơ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInspectingAttendee(null)}
                          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    MODAL CẬP NHẬT CHƯƠNG TRÌNH THAM DỰ & THÔNG TIN ĐẠI BIỂU (EDIT)
                   ========================================================================= */}
                {editingAttendee && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
                      {/* Modal Header */}
                      <div className="px-6 py-4 bg-gradient-to-r from-[#002045] via-[#174ea6] to-[#c83271] text-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <Edit2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-black leading-tight">
                              Cập Nhật Chương Trình Tham Dự &amp; Đại Biểu
                            </h3>
                            <p className="text-[11px] text-white/80 font-mono">
                              Mã: {editingAttendee.registrationCode} • {editingAttendee.fullName}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingAttendee(null)}
                          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modal Form */}
                      <form onSubmit={handleSaveEditAttendee} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                        {/* Section 1: Chương trình sự kiện tham dự (Trọng tâm) */}
                        <div className="p-4 rounded-2xl bg-[#eff4ff]/60 border-2 border-[#174ea6]/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[13px] font-black text-[#002045] uppercase tracking-wide flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#174ea6]" />
                              <span>1. Chương Trình Sự Kiện Tham Dự *</span>
                            </label>
                            <span className="text-[11px] text-slate-500 font-medium">
                              (Có thể chọn 1 hoặc cả 2 sự kiện)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* SYM Event Card */}
                            <div
                              onClick={() => handleToggleEditEvent('SYM')}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                editForm.selectedEvents.includes('SYM')
                                  ? 'border-[#174ea6] bg-white shadow-sm'
                                  : 'border-slate-200 bg-slate-50/70 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-[#174ea6]">
                                      SYM
                                    </span>
                                    <span className="text-[11px] font-bold text-[#174ea6]">03/10/2026</span>
                                  </div>
                                  <h4 className="text-[12.5px] font-black text-[#002045] leading-snug">
                                    Hội thảo Khoa học Thẩm mỹ Việt–Hàn 2026
                                  </h4>
                                  <p className="text-[10.5px] text-slate-500 mt-1">
                                    Bệnh viện Quân Y 175 • CME: 3h tín chỉ (Phí thu tại Hội Thảo)
                                  </p>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                                    editForm.selectedEvents.includes('SYM')
                                      ? 'bg-[#174ea6] border-[#174ea6] text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {editForm.selectedEvents.includes('SYM') && <Check className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                            </div>

                            {/* KAT Event Card */}
                            <div
                              onClick={() => handleToggleEditEvent('KAT')}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                editForm.selectedEvents.includes('KAT')
                                  ? 'border-[#c83271] bg-white shadow-sm'
                                  : 'border-slate-200 bg-slate-50/70 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-pink-100 text-[#c83271]">
                                      KAT
                                    </span>
                                    <span className="text-[11px] font-bold text-[#c83271]">04/10/2026</span>
                                  </div>
                                  <h4 className="text-[12.5px] font-black text-[#002045] leading-snug">
                                    Hội thảo Kỹ năng Nâng cao K-Beauty
                                  </h4>
                                  <p className="text-[10.5px] text-slate-500 mt-1">
                                    ĐH Quốc tế Hồng Bàng (HIU) • Kỹ thuật cao
                                  </p>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                                    editForm.selectedEvents.includes('KAT')
                                      ? 'bg-[#c83271] border-[#c83271] text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {editForm.selectedEvents.includes('KAT') && <Check className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* CME Checkbox */}
                          <label className="flex items-center gap-2.5 pt-2 border-t border-blue-100 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.wantsCme}
                              onChange={(e) => setEditForm({ ...editForm, wantsCme: e.target.checked })}
                              className="w-4 h-4 rounded text-[#174ea6] focus:ring-[#174ea6]"
                            />
                            <span className="text-[12px] font-bold text-slate-800">
                              Yêu cầu cấp Chứng chỉ Đào tạo Y khoa liên tục (CME: 3h tín chỉ BV 175 - Phí thu tại Hội Thảo)
                            </span>
                          </label>
                        </div>

                        {/* Section 2: Nhóm & Thông tin đại biểu */}
                        <div className="space-y-3">
                          <label className="text-[12px] font-black text-[#002045] uppercase tracking-wide block">
                            2. Thông Tin Đại Biểu
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Họ và Tên *
                              </label>
                              <input
                                type="text"
                                required
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Nhóm Tham Dự *
                              </label>
                              <select
                                value={editForm.attendeeType}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    attendeeType: e.target.value as 'doctor' | 'business',
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                              >
                                <option value="doctor">Bác sĩ / Nhân viên y tế</option>
                                <option value="business">Doanh nghiệp / Thẩm mỹ viện / Spa</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Số Điện Thoại / Zalo *
                              </label>
                              <input
                                type="text"
                                required
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Email *
                              </label>
                              <input
                                type="email"
                                required
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Bệnh Viện / Cơ Sở / Doanh Nghiệp *
                              </label>
                              <input
                                type="text"
                                required
                                value={editForm.institution}
                                onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Chức Danh / Học Vị
                              </label>
                              <input
                                type="text"
                                value={editForm.titleRole}
                                onChange={(e) => setEditForm({ ...editForm, titleRole: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                                placeholder="Bác sĩ CKII, ThS, CEO, Giám đốc..."
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Chuyên Khoa / Ngành Hàng
                              </label>
                              <input
                                type="text"
                                value={editForm.specialty}
                                onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Số CCHN Y Khoa / MST Doanh Nghiệp
                              </label>
                              <input
                                type="text"
                                value={editForm.license}
                                onChange={(e) => setEditForm({ ...editForm, license: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-[#174ea6]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Tỉnh / Thành Phố
                              </label>
                              <input
                                type="text"
                                value={editForm.city}
                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Quốc Gia
                              </label>
                              <input
                                type="text"
                                value={editForm.country}
                                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Ghi Chú Ban Tổ Chức
                            </label>
                            <textarea
                              rows={2}
                              value={editForm.notes}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                              placeholder="Ghi chú thêm về xếp chỗ, thanh toán phí CME..."
                            />
                          </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setEditingAttendee(null)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#174ea6] to-[#c83271] hover:opacity-95 text-white font-bold text-xs shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <Save className="w-4 h-4" />
                            <span>Lưu Thay Đổi</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                TAB 8: QUẢN TRỊ CHÂN TRANG (FOOTER)
               ========================================================================= */}
            {activeAdminTab === 'footer' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[20px] font-black text-slate-900 flex items-center gap-2">
                      <span>Quản Trị Nội Dung Chân Trang (Footer)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#174ea6] text-xs font-extrabold">
                        4 Cột &amp; Bản Quyền
                      </span>
                    </h2>
                    <p className="text-[13px] text-slate-500">
                      Tùy chỉnh thông tin thương hiệu, đơn vị chủ trì, hiệp hội đồng hành, hotline liên hệ và bản quyền chân trang.
                    </p>
                  </div>
                </div>

                {/* Khối 1: Thương hiệu & Thông điệp */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#174ea6]" />
                    <span>Cột 1: Thương Hiệu &amp; Giới Thiệu Sự Kiện</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                        Tiêu Đề Thương Hiệu
                      </label>
                      <input
                        type="text"
                        value={cmsData.footerConfig?.brandTitle || ''}
                        onChange={(e) => updateFooterConfig({ brandTitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                        Đoạn Giới Thiệu Chân Trang
                      </label>
                      <textarea
                        rows={3}
                        value={cmsData.footerConfig?.brandDescription || ''}
                        onChange={(e) => updateFooterConfig({ brandDescription: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:border-[#174ea6]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                          Tag Nổi Bật 1
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.tag1 || ''}
                          onChange={(e) => updateFooterConfig({ tag1: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#174ea6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                          Tag Nổi Bật 2
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.tag2 || ''}
                          onChange={(e) => updateFooterConfig({ tag2: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#174ea6]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Khối 2: Đơn vị chủ trì & Tổ chức */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#174ea6]" />
                    <span>Cột 2: Đơn Vị Chủ Trì &amp; Tổ Chức</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                        Tiêu Đề Cột
                      </label>
                      <input
                        type="text"
                        value={cmsData.footerConfig?.organizersTitle || ''}
                        onChange={(e) => updateFooterConfig({ organizersTitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                      />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#f8faff] border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đơn Vị 1 - Tên Chính
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.organizer1Name || ''}
                          onChange={(e) => updateFooterConfig({ organizer1Name: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đơn Vị 1 - Cơ Quan Trực Thuộc
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.organizer1Sub || ''}
                          onChange={(e) => updateFooterConfig({ organizer1Sub: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                        />
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#f8faff] border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đơn Vị 2 - Tên Chính
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.organizer2Name || ''}
                          onChange={(e) => updateFooterConfig({ organizer2Name: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đơn Vị 2 - Cơ Quan Trực Thuộc
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.organizer2Sub || ''}
                          onChange={(e) => updateFooterConfig({ organizer2Sub: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Khối 3: Hiệp hội chuyên môn đồng hành */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#c83271]" />
                    <span>Cột 3: Hiệp Hội Chuyên Môn Đồng Hành</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                        Tiêu Đề Cột
                      </label>
                      <input
                        type="text"
                        value={cmsData.footerConfig?.partnersTitle || ''}
                        onChange={(e) => updateFooterConfig({ partnersTitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                      />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#fff5f9] border border-pink-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Hiệp Hội 1 - Tên Viết Tắt
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.partner1Name || ''}
                          onChange={(e) => updateFooterConfig({ partner1Name: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#c83271]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Hiệp Hội 1 - Tên Đầy Đủ
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.partner1Sub || ''}
                          onChange={(e) => updateFooterConfig({ partner1Sub: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#c83271]"
                        />
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#fff5f9] border border-pink-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Hiệp Hội 2 - Tên Viết Tắt
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.partner2Name || ''}
                          onChange={(e) => updateFooterConfig({ partner2Name: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#c83271]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Hiệp Hội 2 - Tên Đầy Đủ
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.partner2Sub || ''}
                          onChange={(e) => updateFooterConfig({ partner2Sub: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#c83271]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Khối 4: Thông tin liên hệ & Hotline */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Cột 4: Thông Tin Liên Hệ &amp; Địa Điểm</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                        Tiêu Đề Cột
                      </label>
                      <input
                        type="text"
                        value={cmsData.footerConfig?.contactTitle || ''}
                        onChange={(e) => updateFooterConfig({ contactTitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                          Số Điện Thoại Hotline Ban Thư Ký
                        </label>
                        <input
                          type="text"
                          value={cmsData.footerConfig?.hotline || ''}
                          onChange={(e) => updateFooterConfig({ hotline: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                          Email Tiếp Nhận Hồ Sơ
                        </label>
                        <input
                          type="email"
                          value={cmsData.footerConfig?.email || ''}
                          onChange={(e) => updateFooterConfig({ email: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#174ea6]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                        Địa Điểm Tổ Chức / Tên Cơ Sở
                      </label>
                      <input
                        type="text"
                        value={cmsData.footerConfig?.venueName || ''}
                        onChange={(e) => updateFooterConfig({ venueName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                      />
                    </div>
                  </div>
                </div>

                {/* Khối 5: Bản Quyền Chân Trang (Copyright) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>Dòng Bản Quyền Dưới Cùng (Copyright)</span>
                  </h3>
                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      Nội Dung Bản Quyền
                    </label>
                    <input
                      type="text"
                      value={cmsData.footerConfig?.copyrightText || ''}
                      onChange={(e) => updateFooterConfig({ copyrightText: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#174ea6]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Mọi thay đổi chân trang được tự động lưu tức thì và hiển thị ngay trên website!
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast('Đã lưu cấu hình chân trang thành công!')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Lưu Cấu Hình
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* CMS Bottom Status Footer */}
        <footer className="px-6 py-3 bg-white border-t border-slate-200/90 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Dữ liệu được lưu trữ tự động trong bộ nhớ trình duyệt</span>
          </div>

          <button
            onClick={() => closeAdmin()}
            className="px-4 py-1.5 rounded-xl bg-[#174ea6] hover:bg-[#123e85] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>Về Website (/)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </footer>
    </div>
  );
};
