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
  Navigation,
  Car,
  Plane,
} from 'lucide-react';
import { useCMS, STORAGE_KEY } from '../../context/CMSContext';
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
    setAgendaList,
    syncDefaultAgenda,
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
    clearAllCacheAndReload,
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
  const [agendaDayFilter, setAgendaDayFilter] = useState<'all' | 1 | 2>('all');
  const [agendaSearch, setAgendaSearch] = useState('');
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState<'all' | 'doctor' | 'business' | 'cme'>('all');
  const [eventFilter, setEventFilter] = useState<'all' | 'SYM' | 'KAT' | 'both'>('all');
  const [inspectingAttendee, setInspectingAttendee] = useState<AttendeeBadge | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<AttendeeBadge | null>(null);
  const [adminUsernameInput, setAdminUsernameInput] = useState(cmsData.adminAccount?.username || 'admin');
  const [adminPasswordInput, setAdminPasswordInput] = useState(cmsData.adminAccount?.password || 'kbit@2026');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [accountUpdatedMsg, setAccountUpdatedMsg] = useState(false);
  const [showMediaPickerForExpert, setShowMediaPickerForExpert] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
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
  const mohwPatronFileRef = useRef<HTMLInputElement>(null);
  const khidiHeroFileRef = useRef<HTMLInputElement>(null);
  const snubhHeroFileRef = useRef<HTMLInputElement>(null);
  const kbitHeroFileRef = useRef<HTMLInputElement>(null);
  const mapImageFileRef = useRef<HTMLInputElement>(null);

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

  const isEditingAdminAccountRef = useRef(false);

  React.useEffect(() => {
    if (cmsData.adminAccount && !isEditingAdminAccountRef.current) {
      setAdminUsernameInput(cmsData.adminAccount.username || 'admin');
      setAdminPasswordInput(cmsData.adminAccount.password || 'kbit@2026');
    }
  }, [cmsData.adminAccount?.username, cmsData.adminAccount?.password]);

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

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessTick, setSaveSuccessTick] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Vừa xong');

  if (!isAdminOpen) return null;

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleManualSave = async (showFeedback = true): Promise<boolean> => {
    setIsSaving(true);
    try {
      // 1. Force save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cmsData));
      } catch (e) {
        console.warn('LocalStorage manual save warning:', e);
      }

      // 2. Trigger cloud sync if connected
      let cloudSuccess = false;
      try {
        cloudSuccess = await saveCmsToCloud();
      } catch {}

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      setLastSavedTime(timeStr);

      setIsSaving(false);
      setSaveSuccessTick(true);
      setTimeout(() => setSaveSuccessTick(false), 3500);

      if (showFeedback) {
        if (cloudSuccess) {
          showToast('✅ Đã lưu toàn bộ thay đổi và đồng bộ Vercel Postgres thành công!');
        } else {
          showToast('✅ Đã lưu toàn bộ thay đổi thành công! Dữ liệu đã cập nhật ngay trên website.');
        }
      }
      return true;
    } catch (err: any) {
      setIsSaving(false);
      showToast('❌ Có lỗi khi lưu: ' + (err?.message || 'Thử lại'));
      return false;
    }
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

  const handleMapImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImageFile(e.target.files[0]);
        updateEventDetails({ mapImageUrl: url });
        showToast('Đã tải ảnh sơ đồ / bản đồ địa điểm thành công!');
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh bản đồ');
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleSpeakerAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, expertId: string) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const url = await uploadImageFile(file);
        updateExpert(expertId, { avatarUrl: url });
        showToast('Đã tải lên và cập nhật ảnh chân dung chuyên gia thành công!');
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh');
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleSpeakerAvatarDrop = async (e: React.DragEvent<HTMLDivElement>, expertId: string) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      try {
        const file = e.dataTransfer.files[0];
        const url = await uploadImageFile(file);
        updateExpert(expertId, { avatarUrl: url });
        showToast('Đã thả ảnh và cập nhật chân dung chuyên gia thành công!');
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
        if (partnerId === 'bv175' || partnerId === 'bv108') { updateEventDetails({ heroBv108LogoUrl: url, heroBv175LogoUrl: url }); }
        showToast('Đã tải lên và cập nhật logo đối tác thành công!');
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh logo');
      }
    }
  };

  const handleHeroSponsorUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: keyof typeof cmsData.eventDetails) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImageFile(e.target.files[0]);
        updateEventDetails({ [fieldKey]: url });
        showToast('Đã tải lên & áp dụng logo mới cho Hero Banner!');
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh logo');
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleHeroHostLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, hostId: 'ksaps' | 'vsaps' | 'bv175' | 'bv108') => {
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
      'Tham Dự Hội nghị BV 108 (17–18/10)',
      'Tham Dự Live Surgery & B2B (18/10)',
      'Đơn Vị Công Tác / Doanh Nghiệp',
      'Chức Vụ / Học Vị',
      'Chuyên Khoa / Lĩnh Vực',
      'Số CCHN / MST',
      'Số Điện Thoại',
      'Email',
      'Tỉnh / Thành Phố',
      'Quốc Gia',
      'Cấp CME BV 108 (Đào tạo liên tục)',
      'Chủ Đề Quan Tâm',
      'Mục Tiêu Tham Dự',
      'Ghi Chú',
      'Thời Gian Đăng Ký',
    ];
    const rows = cmsData.registrations.map((r) => {
      const ev = r.selectedEvents && r.selectedEvents.length > 0 ? r.selectedEvents : ['SYM'];
      const detailedEvents = ev
        .map((c) => (c === 'CONGRESS' || c === 'SYM' ? 'Hội nghị (17–18/10/2026 - Bệnh viện Trung ương Quân đội 108, Hà Nội)' : c))
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
          {/* PRIMARY PROMINENT SAVE BUTTON */}
          <button
            type="button"
            onClick={() => handleManualSave(true)}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 ${
              saveSuccessTick
                ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-300'
                : 'bg-gradient-to-r from-[#d53774] via-[#b0225d] to-[#174ea6] hover:opacity-95 ring-2 ring-pink-300/50'
            }`}
            title="Lưu toàn bộ thay đổi CMS và áp dụng ra frontend ngay lập tức"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : saveSuccessTick ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>ĐÃ LƯU THÀNH CÔNG!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>LƯU THAY ĐỔI</span>
              </>
            )}
          </button>

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

          {/* XÓA TOÀN BỘ CACHE & LÀM MỚI 100% */}
          <button
            type="button"
            onClick={clearAllCacheAndReload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer border border-amber-200"
            title="Xóa toàn bộ Cache, LocalStorage và tải lại mới 100% trang web"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Xóa Cache Cũ</span>
          </button>

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-[20px] font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#d53774]" />
                      <span>Cài Đặt Toàn Diện Hero Banner &amp; Nhận Diện Sự Kiện</span>
                    </h2>
                    <p className="text-[13px] text-slate-500">
                      Tùy chỉnh toàn bộ nội dung, chiều cao, hình ảnh, các logo và nút bấm của Hero Banner ngay tại đây với xem trước trực quan.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-600">Chiều cao Banner:</span>

                    {/* Presets */}
                    <div className="flex items-center gap-1">
                      {[450, 500, 550, 600].map((h) => {
                        const current = Number(cmsData.eventDetails.heroBannerHeight) || 500;
                        const isAct = current === h;
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => updateEventDetails({ heroBannerHeight: h })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isAct
                                ? 'bg-[#d53774] text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {h}px{h === 500 ? ' ⭐' : ''}
                          </button>
                        );
                      })}
                    </div>

                    {/* Range Slider */}
                    <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      <input
                        type="range"
                        min="380"
                        max="800"
                        step="10"
                        value={Number(cmsData.eventDetails.heroBannerHeight) || 500}
                        onChange={(e) => updateEventDetails({ heroBannerHeight: Number(e.target.value) })}
                        className="w-20 lg:w-28 accent-[#d53774] cursor-pointer"
                        title="Kéo trượt để thay đổi chiều cao banner"
                      />
                    </div>

                    {/* Number input */}
                    <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                      <input
                        type="number"
                        min="380"
                        max="850"
                        step="10"
                        value={cmsData.eventDetails.heroBannerHeight ?? 500}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            updateEventDetails({ heroBannerHeight: undefined });
                            return;
                          }
                          const n = parseInt(val, 10);
                          if (!isNaN(n)) {
                            updateEventDetails({ heroBannerHeight: n });
                          }
                        }}
                        onBlur={(e) => {
                          const n = parseInt(e.target.value, 10);
                          const safe = isNaN(n) ? 500 : Math.max(380, Math.min(850, n));
                          updateEventDetails({ heroBannerHeight: safe });
                        }}
                        className="w-14 text-center font-bold text-[#d53774] text-xs bg-transparent outline-none"
                      />
                      <span className="text-[11px] font-bold text-slate-400">px</span>
                    </div>
                  </div>
                </div>

                {/* 1. INTERACTIVE LIVE PREVIEW BOX */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-md border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="font-bold text-pink-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Xem trước trực tiếp (Live Preview Hero Banner)
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Chiều cao thực tế: {cmsData.eventDetails.heroBannerHeight || 500}px (Tỉ lệ co giãn trực quan)
                    </span>
                  </div>

                  {/* Mini Canvas Simulation */}
                  {(() => {
                    const ev = cmsData.eventDetails;
                    const isBuildingOnly = ev.bannerImageUrl === '/images/hero-building-right.png';
                    const mainBg = ev.heroBgImageUrl
                      ? ev.heroBgImageUrl
                      : (!isBuildingOnly && ev.bannerImageUrl ? ev.bannerImageUrl : '/images/hero-bv108-clean-bg.png');
                    const showBld = Boolean(ev.heroShowBuilding);
                    const bldImg = ev.heroBuildingImageUrl || (isBuildingOnly ? '/images/hero-building-right.png' : '');
                    const bgFit = ev.heroBgFit || 'cover';

                    let bgStyleImage: string;
                    let bgStylePosition: string;
                    let bgStyleSize: string;

                    if (showBld && bldImg && bldImg !== mainBg) {
                      bgStyleImage = `url('${bldImg}'), url('${mainBg}')`;
                      bgStylePosition = 'right center, center center';
                      bgStyleSize = `contain, ${bgFit}`;
                    } else {
                      bgStyleImage = `url('${mainBg}')`;
                      bgStylePosition = bgFit === 'contain' ? 'center center' : 'right center';
                      bgStyleSize = bgFit;
                    }

                    const overlayMode = ev.heroOverlayMode || 'pink';
                    let overlayGradient = 'transparent';
                    if (overlayMode === 'pink') {
                      overlayGradient =
                        'linear-gradient(90deg, rgba(255, 240, 245, 0.94) 0%, rgba(255, 242, 246, 0.88) 42%, rgba(255, 246, 250, 0.38) 70%, rgba(255, 255, 255, 0) 100%)';
                    } else if (overlayMode === 'gradient') {
                      overlayGradient =
                        'linear-gradient(90deg, #ffffff 0%, #ffffff 42%, rgba(255,255,255,0.95) 54%, rgba(255,255,255,0.35) 75%, rgba(255,255,255,0) 100%)';
                    } else if (overlayMode === 'soft') {
                      overlayGradient =
                        'linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.80) 45%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0) 100%)';
                    }

                    const currentHeight = Number(ev.heroBannerHeight) || 500;
                    const previewHeight = Math.max(250, Math.min(420, Math.round(currentHeight * 0.58)));

                    return (
                      <div 
                        className="relative w-full rounded-2xl overflow-hidden bg-white text-slate-900 border border-slate-700/60 flex flex-col justify-between p-4 sm:p-6 transition-all duration-300"
                        style={{
                          height: `${previewHeight}px`,
                          minHeight: `${previewHeight}px`,
                          backgroundImage: bgStyleImage,
                          backgroundPosition: bgStylePosition,
                          backgroundSize: bgStyleSize,
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {overlayMode !== 'none' && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: overlayGradient,
                            }}
                          />
                        )}

                    {/* Top Logos Preview */}
                    <div className="relative z-10 flex items-center gap-2.5">
                      <img
                        src={cmsData.eventDetails.heroVsapsLogoUrl || '/images/partners/vsaps-circle.png'}
                        alt="VSAPS"
                        className="w-10 h-10 object-contain drop-shadow-xs"
                      />
                      <img
                        src={cmsData.eventDetails.heroKsapsLogoUrl || '/images/partners/ksaps-circle.png'}
                        alt="KSAPS"
                        className="w-10 h-10 object-contain drop-shadow-xs"
                      />
                    </div>

                    {/* Center Typography Preview */}
                    <div className="relative z-10 max-w-md my-2">
                      <h4 className={`text-base sm:text-lg font-black uppercase tracking-tight flex flex-col text-[#d52b66] ${
                        (cmsData.eventDetails.heroHeadingSpacing || 'relaxed') === 'loose'
                          ? 'gap-1.5 sm:gap-2'
                          : (cmsData.eventDetails.heroHeadingSpacing || 'relaxed') === 'normal'
                          ? 'gap-0.5'
                          : 'gap-1 sm:gap-1.5'
                      } leading-tight`}>
                        <span>{cmsData.eventDetails.heroHeadingLine1 || 'HỘI NGHỊ'}</span>
                        <span>{cmsData.eventDetails.heroHeadingLine2 || 'KHOA HỌC THẨM MỸ'}</span>
                        <span>
                          {cmsData.eventDetails.heroHeadingLine3 || 'VIỆT - HÀN'}{' '}
                          <span className="text-[#6c35a8]">{cmsData.eventDetails.heroHeadingYear || '2026'}</span>
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 font-semibold mt-1.5">
                        {cmsData.eventDetails.heroVenueText || cmsData.eventDetails.venueName || 'Bệnh viện Trung ương Quân đội 108, Hà Nội'}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#d53774] text-white text-[10px] font-black shadow-xs">
                          {cmsData.eventDetails.heroCtaTag || 'Miễn phí'} • {cmsData.eventDetails.heroCtaText || 'Đăng ký tham dự'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#d53774] text-[#d53774] text-[10px] font-bold">
                          {cmsData.eventDetails.heroDateText || cmsData.eventDetails.dateString || '17-18/10/2026'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Logos Preview */}
                    <div className="relative z-10 flex items-center gap-4 pt-2 border-t border-slate-200/80">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 font-medium">{cmsData.eventDetails.heroPatronLabel || 'Bảo trợ'}</span>
                        <img
                          src={cmsData.eventDetails.heroPatronLogoUrl || '/images/partners/mohw.png'}
                          alt="Patron"
                          className="h-4 object-contain mt-0.5"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 font-medium">{cmsData.eventDetails.heroOrgLabel || 'Đơn vị tổ chức'}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <img src={cmsData.eventDetails.heroKhidiLogoUrl || '/images/partners/khidi.png'} alt="KHIDI" className="h-4 object-contain" />
                          <img src={cmsData.eventDetails.heroBv108LogoUrl || '/images/partners/bv108.png'} alt="BV 108" className="h-4 object-contain" />
                          <img src={cmsData.eventDetails.heroSnubhLogoUrl || '/images/partners/snubh.png'} alt="SNUBH" className="h-4 object-contain" />
                          <img src={cmsData.eventDetails.heroKbitLogoUrl || '/images/partners/kbit.png'} alt="KBIT" className="h-4 object-contain" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

                {/* 2. CHỈNH SỬA TIÊU ĐỀ, SLOGAN & NÚT BẤM (TYPOGRAPHY & CTAS) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d53774]" />
                    <span>Nội Dung Tiêu Đề 3 Dòng, Năm &amp; Nút Hành Động Hero</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dòng 1 (HỒNG ĐẬM):
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroHeadingLine1 || ''}
                        onChange={(e) => updateEventDetails({ heroHeadingLine1: e.target.value })}
                        placeholder="HỘI NGHỊ"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#d53774] focus:border-[#d53774] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dòng 2 (HỒNG ĐẬM):
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroHeadingLine2 || ''}
                        onChange={(e) => updateEventDetails({ heroHeadingLine2: e.target.value })}
                        placeholder="KHOA HỌC THẨM MỸ"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#d53774] focus:border-[#d53774] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dòng 3 (HỒNG) &amp; Năm (TÍM):
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={cmsData.eventDetails.heroHeadingLine3 || ''}
                          onChange={(e) => updateEventDetails({ heroHeadingLine3: e.target.value })}
                          placeholder="VIỆT - HÀN"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#d53774] focus:border-[#d53774] outline-none"
                        />
                        <input
                          type="text"
                          value={cmsData.eventDetails.heroHeadingYear || ''}
                          onChange={(e) => updateEventDetails({ heroHeadingYear: e.target.value })}
                          placeholder="2026"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#8b46c2] focus:border-[#8b46c2] outline-none"
                        />
                      </div>
                    </div>

                    {/* Spacing Selector for 3 Heading lines */}
                    <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">
                          Khoảng cách giữa 3 dòng chữ tiêu đề:
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Tùy chỉnh độ giãn dòng giữa HỘI NGHỊ - KHOA HỌC THẨM MỸ - VIỆT - HÀN 2026
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[
                          { id: 'normal', label: 'Gọn gàng' },
                          { id: 'relaxed', label: 'Rộng rãi (Mặc định ⭐)' },
                          { id: 'loose', label: 'Rất thoáng' },
                        ].map((sp) => {
                          const active = (cmsData.eventDetails.heroHeadingSpacing || 'relaxed') === sp.id;
                          return (
                            <button
                              key={sp.id}
                              type="button"
                              onClick={() => updateEventDetails({ heroHeadingSpacing: sp.id as any })}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#d53774] text-white shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {sp.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dòng địa điểm / Bệnh viện dưới tiêu đề:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroVenueText || ''}
                        onChange={(e) => updateEventDetails({ heroVenueText: e.target.value })}
                        placeholder="Bệnh viện Trung ương Quân đội 108, Hà Nội"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    {/* Action buttons controls */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Thẻ nhỏ trên nút CTA (VD: Miễn phí):
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroCtaTag || ''}
                        onChange={(e) => updateEventDetails({ heroCtaTag: e.target.value })}
                        placeholder="Miễn phí"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Chữ nút Đăng ký tham dự:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroCtaText || ''}
                        onChange={(e) => updateEventDetails({ heroCtaText: e.target.value })}
                        placeholder="Đăng ký tham dự"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Liên kết nút CTA (Anchor / URL):
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroCtaLink || ''}
                        onChange={(e) => updateEventDetails({ heroCtaLink: e.target.value })}
                        placeholder="#dang-ky-tham-du"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Chữ hiển thị ô Ngày tháng (Pill Date):
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroDateText || ''}
                        onChange={(e) => updateEventDetails({ heroDateText: e.target.value })}
                        placeholder="17-18/10/2026"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#d53774] focus:border-[#d53774] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. HÌNH NỀN HERO BANNER (BACKGROUND TOÀN PHẦN & TÒA NHÀ) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#c83271]" />
                        <span>Ảnh Nền Hero Banner (Toàn Phần)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Thay đổi ảnh nền chính cho Hero Banner trên trang chủ. Ảnh tải lên từ máy sẽ được tự động nén tối ưu (nhẹ &lt; 250KB) để lưu trữ vĩnh viễn và hiển thị tức thì.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="file"
                        ref={bannerFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            try {
                              const url = await uploadImageFile(e.target.files[0]);
                              updateEventDetails({
                                bannerImageUrl: url,
                                heroBgImageUrl: url,
                              });
                              showToast('Đã tải và áp dụng ảnh nền Hero Banner mới thành công!');
                            } catch (err: any) {
                              showToast(err.message || 'Lỗi khi tải ảnh');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => bannerFileRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d53774] to-[#c02663] hover:from-[#c02663] hover:to-[#a81a51] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh mới từ máy tính</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Background Image Selector & Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                    <div className="md:col-span-4 aspect-video rounded-xl border border-slate-200 overflow-hidden bg-white relative group shadow-2xs flex items-center justify-center p-1">
                      <img
                        src={
                          cmsData.eventDetails.heroBgImageUrl ||
                          (cmsData.eventDetails.bannerImageUrl !== '/images/hero-building-right.png' && cmsData.eventDetails.bannerImageUrl
                            ? cmsData.eventDetails.bannerImageUrl
                            : '/images/hero-bv108-clean-bg.png')
                        }
                        alt="Hero Banner Background Preview"
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/hero-bv108-clean-bg.png';
                        }}
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono">
                        Xem trước ảnh nền
                      </span>
                    </div>

                    <div className="md:col-span-8 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Đường dẫn ảnh nền chính (URL hoặc Base64 Data):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cmsData.eventDetails.heroBgImageUrl || cmsData.eventDetails.bannerImageUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateEventDetails({
                                bannerImageUrl: val,
                                heroBgImageUrl: val,
                              });
                            }}
                            placeholder="/images/hero-bv108-clean-bg.png hoặc https://..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#d53774] outline-none bg-white"
                          />
                          {(cmsData.eventDetails.heroBgImageUrl || cmsData.eventDetails.bannerImageUrl) && (
                            <button
                              type="button"
                              onClick={() => {
                                updateEventDetails({
                                  bannerImageUrl: '/images/hero-bv108-clean-bg.png',
                                  heroBgImageUrl: '/images/hero-bv108-clean-bg.png',
                                  heroOverlayMode: 'none',
                                  heroShowBuilding: false,
                                });
                                showToast('Đã đặt lại ảnh nền Chuẩn Bệnh viện 108');
                              }}
                              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                              title="Khôi phục ảnh nền mặc định"
                            >
                              Mặc định
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                          Preset ảnh nền sẵn có (Một chạm để áp dụng):
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            {
                              name: '⭐ Chuẩn 100% hình mẫu BV 108',
                              url: '/images/hero-bv108-clean-bg.png',
                              overlay: 'none',
                              building: false,
                            },
                            {
                              name: 'Bệnh viện TWQĐ 108 (Thực tế)',
                              url: '/images/hero-hospital.jpg',
                              overlay: 'gradient',
                              building: true,
                            },
                            {
                              name: 'Banner cũ Hội nghị',
                              url: '/BG.png',
                              overlay: 'none',
                              building: false,
                            },
                            {
                              name: 'Phòng mổ thẩm mỹ',
                              url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&auto=format&fit=crop&q=80',
                              overlay: 'gradient',
                              building: false,
                            },
                            {
                              name: 'Hội trường quốc tế',
                              url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&auto=format&fit=crop&q=80',
                              overlay: 'gradient',
                              building: false,
                            },
                          ].map((item) => (
                            <button
                              key={item.url}
                              type="button"
                              onClick={() => {
                                updateEventDetails({
                                  bannerImageUrl: item.url,
                                  heroBgImageUrl: item.url,
                                  heroOverlayMode: item.overlay as any,
                                  heroShowBuilding: item.building,
                                });
                                showToast(`Đã áp dụng ảnh nền: ${item.name}`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors border border-slate-200 shadow-2xs hover:border-[#d53774]"
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Mode, Overlay & Height Customization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {/* Mode 1: Kiểu hiển thị ảnh nền */}
                    <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Kiểu hiển thị ảnh nền:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'cover', label: 'Phủ kín' },
                          { id: 'contain', label: 'Vừa vặn' },
                          { id: 'right', label: 'Lệch phải' },
                        ].map((m) => {
                          const active = (cmsData.eventDetails.heroBgFit || 'cover') === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => updateEventDetails({ heroBgFit: m.id as any })}
                              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                                active
                                  ? 'bg-[#d53774] text-white border-[#d53774] shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mode 2: Lớp phủ mờ Gradient Overlay */}
                    <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Lớp phủ mờ chữ (Overlay):
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'pink', label: 'Hồng nhạt ⭐' },
                          { id: 'none', label: 'Trong suốt' },
                          { id: 'soft', label: 'Mờ nhẹ' },
                          { id: 'gradient', label: 'Trắng phủ' },
                        ].map((m) => {
                          const active = (cmsData.eventDetails.heroOverlayMode || 'pink') === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => updateEventDetails({ heroOverlayMode: m.id as any })}
                              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                                active
                                  ? 'bg-[#d53774] text-white border-[#d53774] shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mode 3: Họa tiết Tòa nhà BV 108 bên phải */}
                    <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-2 flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Họa tiết Tòa nhà bên phải:
                        </label>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Hiển thị hình khối tòa nhà BV 108 đè nhẹ lên ảnh nền.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateEventDetails({
                            heroShowBuilding: cmsData.eventDetails.heroShowBuilding === false ? true : false,
                          })
                        }
                        className={`w-full py-1.5 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          cmsData.eventDetails.heroShowBuilding !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cmsData.eventDetails.heroShowBuilding !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{cmsData.eventDetails.heroShowBuilding !== false ? 'Đang bật họa tiết' : 'Đã ẩn họa tiết'}</span>
                      </button>
                    </div>

                    {/* Mode 4: Chiều cao Hero Banner */}
                    <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            Chiều cao Banner:
                          </label>
                          <span className="text-xs font-mono font-bold text-[#d53774]">
                            {cmsData.eventDetails.heroBannerHeight || 500}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="400"
                          max="750"
                          step="10"
                          value={Number(cmsData.eventDetails.heroBannerHeight) || 500}
                          onChange={(e) => updateEventDetails({ heroBannerHeight: Number(e.target.value) })}
                          className="w-full accent-[#d53774] cursor-pointer my-1"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[450, 500, 550, 600].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => updateEventDetails({ heroBannerHeight: h })}
                            className={`py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer text-center ${
                              (cmsData.eventDetails.heroBannerHeight || 500) === h
                                ? 'bg-[#d53774] text-white border-[#d53774]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {h}px
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Action Save Bar for Hero Banner */}
                  <div className="pt-3.5 mt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Các thiết lập ảnh nền và hiệu ứng sẽ được áp dụng ngay vào frontend.</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleManualSave(true)}
                      disabled={isSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d53774] to-[#b0225d] hover:from-[#c02663] hover:to-[#961a4c] text-white text-xs font-black shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Đang lưu...' : 'LƯU THAY ĐỔI HERO BANNER'}</span>
                    </button>
                  </div>
                </div>

                {/* 4. LOGO 2 ĐƠN VỊ TRÒN PHÍA TRÊN (VSAPS & KSAPS) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#174ea6]" />
                      <span>Logo Tròn Phía Trên (VSAPS &amp; KSAPS) - Lớn &amp; Sát Viền</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hai huy hiệu tròn đặt phía trên cùng bên trái của Hero Banner. Tải ảnh từ máy tính hoặc dán link ảnh trực tiếp.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Logo 1: VSAPS */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#c83271] font-display">
                          VSAPS Việt Nam 🇻🇳
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-100 text-[#c83271]">
                          Huy hiệu 1
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          <img
                            src={cmsData.eventDetails.heroVsapsLogoUrl || '/images/partners/vsaps-circle.png'}
                            alt="VSAPS"
                            className="w-full h-full object-contain"
                          />
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
                            <span>Tải ảnh mới từ máy</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateEventDetails({ heroVsapsLogoUrl: '/images/partners/vsaps-circle.png' });
                              showToast('Đã khôi phục logo tròn VSAPS chuẩn!');
                            }}
                            className="w-full text-center text-[10.5px] font-bold text-slate-500 hover:text-[#c83271] transition-colors cursor-pointer"
                          >
                            Khôi phục logo chuẩn
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đường dẫn URL ảnh:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.heroVsapsLogoUrl || ''}
                          onChange={(e) => updateEventDetails({ heroVsapsLogoUrl: e.target.value })}
                          placeholder="/images/partners/vsaps-circle.png"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono bg-white outline-none focus:border-[#c83271]"
                        />
                      </div>
                    </div>

                    {/* Logo 2: KSAPS */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#174ea6] font-display">
                          KSAPS Hàn Quốc 🇰🇷
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-[#174ea6]">
                          Huy hiệu 2
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          <img
                            src={cmsData.eventDetails.heroKsapsLogoUrl || '/images/partners/ksaps-circle.png'}
                            alt="KSAPS"
                            className="w-full h-full object-contain"
                          />
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
                            <span>Tải ảnh mới từ máy</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateEventDetails({ heroKsapsLogoUrl: '/images/partners/ksaps-circle.png' });
                              showToast('Đã khôi phục logo tròn KSAPS chuẩn!');
                            }}
                            className="w-full text-center text-[10.5px] font-bold text-slate-500 hover:text-[#174ea6] transition-colors cursor-pointer"
                          >
                            Khôi phục logo chuẩn
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đường dẫn URL ảnh:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.heroKsapsLogoUrl || ''}
                          onChange={(e) => updateEventDetails({ heroKsapsLogoUrl: e.target.value })}
                          placeholder="/images/partners/ksaps-circle.png"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono bg-white outline-none focus:border-[#174ea6]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. CÁC LOGO DƯỚI CÙNG (BẢO TRỢ & ĐƠN VỊ TỔ CHỨC) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>Các Logo Dưới Cùng (Bảo Trợ &amp; Đơn Vị Tổ Chức)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chỉnh sửa nhãn và thay đổi logo của Bộ Y tế Hàn Quốc (MOHW), KHIDI, BV 108, SNUBH và KBIT.
                    </p>
                  </div>

                  {/* Nhãn hiển thị */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nhãn Bảo Trợ:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroPatronLabel || ''}
                        onChange={(e) => updateEventDetails({ heroPatronLabel: e.target.value })}
                        placeholder="Bảo trợ"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nhãn Đơn Vị Tổ Chức:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroOrgLabel || ''}
                        onChange={(e) => updateEventDetails({ heroOrgLabel: e.target.value })}
                        placeholder="Đơn vị tổ chức"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                      />
                    </div>
                  </div>

                  {/* 5 Logo Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Logo MOHW */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">1. MOHW Hàn Quốc</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">Bảo trợ</span>
                      </div>
                      <div className="h-10 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                        <img src={cmsData.eventDetails.heroPatronLogoUrl || '/images/partners/mohw.png'} alt="MOHW" className="max-h-full object-contain" />
                      </div>
                      <input
                        type="file"
                        ref={mohwPatronFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleHeroSponsorUpload(e, 'heroPatronLogoUrl')}
                      />
                      <button
                        type="button"
                        onClick={() => mohwPatronFileRef.current?.click()}
                        className="w-full py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700"
                      >
                        Tải ảnh mới
                      </button>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroPatronLogoUrl || ''}
                        onChange={(e) => updateEventDetails({ heroPatronLogoUrl: e.target.value })}
                        placeholder="/images/partners/mohw.png"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-mono"
                      />
                    </div>

                    {/* Logo KHIDI */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">2. KHIDI</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">Tổ chức</span>
                      </div>
                      <div className="h-10 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                        <img src={cmsData.eventDetails.heroKhidiLogoUrl || '/images/partners/khidi.png'} alt="KHIDI" className="max-h-full object-contain" />
                      </div>
                      <input
                        type="file"
                        ref={khidiHeroFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleHeroSponsorUpload(e, 'heroKhidiLogoUrl')}
                      />
                      <button
                        type="button"
                        onClick={() => khidiHeroFileRef.current?.click()}
                        className="w-full py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700"
                      >
                        Tải ảnh mới
                      </button>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroKhidiLogoUrl || ''}
                        onChange={(e) => updateEventDetails({ heroKhidiLogoUrl: e.target.value })}
                        placeholder="/images/partners/khidi.png"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-mono"
                      />
                    </div>

                    {/* Logo BV 108 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-700">3. BV TƯ QĐ 108</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-800 rounded">Tổ chức</span>
                      </div>
                      <div className="h-10 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                        <img src={cmsData.eventDetails.heroBv108LogoUrl || '/images/partners/bv108.png'} alt="BV 108" className="max-h-full object-contain" />
                      </div>
                      <input
                        type="file"
                        ref={bv175HeroFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleHeroSponsorUpload(e, 'heroBv108LogoUrl')}
                      />
                      <button
                        type="button"
                        onClick={() => bv175HeroFileRef.current?.click()}
                        className="w-full py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-red-700"
                      >
                        Tải ảnh mới
                      </button>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroBv108LogoUrl || ''}
                        onChange={(e) => updateEventDetails({ heroBv108LogoUrl: e.target.value, heroBv175LogoUrl: e.target.value })}
                        placeholder="/images/partners/bv108.png"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-mono"
                      />
                    </div>

                    {/* Logo SNUBH */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">4. SNUBH Seoul</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">Tổ chức</span>
                      </div>
                      <div className="h-10 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                        <img src={cmsData.eventDetails.heroSnubhLogoUrl || '/images/partners/snubh.png'} alt="SNUBH" className="max-h-full object-contain" />
                      </div>
                      <input
                        type="file"
                        ref={snubhHeroFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleHeroSponsorUpload(e, 'heroSnubhLogoUrl')}
                      />
                      <button
                        type="button"
                        onClick={() => snubhHeroFileRef.current?.click()}
                        className="w-full py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700"
                      >
                        Tải ảnh mới
                      </button>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroSnubhLogoUrl || ''}
                        onChange={(e) => updateEventDetails({ heroSnubhLogoUrl: e.target.value })}
                        placeholder="/images/partners/snubh.png"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-mono"
                      />
                    </div>

                    {/* Logo KBIT */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">5. KBIT Association</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">Tổ chức</span>
                      </div>
                      <div className="h-10 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                        <img src={cmsData.eventDetails.heroKbitLogoUrl || '/images/partners/kbit.png'} alt="KBIT" className="max-h-full object-contain" />
                      </div>
                      <input
                        type="file"
                        ref={kbitHeroFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleHeroSponsorUpload(e, 'heroKbitLogoUrl')}
                      />
                      <button
                        type="button"
                        onClick={() => kbitHeroFileRef.current?.click()}
                        className="w-full py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700"
                      >
                        Tải ảnh mới
                      </button>
                      <input
                        type="text"
                        value={cmsData.eventDetails.heroKbitLogoUrl || ''}
                        onChange={(e) => updateEventDetails({ heroKbitLogoUrl: e.target.value })}
                        placeholder="/images/partners/kbit.png"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#174ea6] flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900">
                        Thời Gian Tổ Chức Sự Kiện
                      </h3>
                      <p className="text-xs text-slate-500">Cấu hình ngày và khung giờ tổ chức hội nghị</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ngày tổ chức hiển thị:
                      </label>
                      <input
                        type="text"
                        value={cmsData.eventDetails.dateString}
                        onChange={(e) => updateEventDetails({ dateString: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                        placeholder="27 - 28 Tháng 03, 2026"
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
                        placeholder="08:00 - 17:30 (Cả ngày)"
                      />
                    </div>
                  </div>
                </div>

                {/* Comprehensive Venue & Map Section Configuration */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-blue-200/80 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-bold text-slate-900">
                            Địa Điểm Tổ Chức &amp; Sơ Đồ Chỉ Đường (BV TWQĐ 108)
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                            Venue &amp; Map
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Tùy chỉnh toàn bộ nội dung hiển thị, hình ảnh bản đồ, bãi đỗ xe, sân bay và thông tin ban thư ký
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateEventDetails({
                          venueSectionTag: 'ĐỊA ĐIỂM TỔ CHỨC CHÍNH THỨC',
                          venueSectionTitle: 'Hướng Dẫn Đến Bệnh Viện TWQĐ 108, Hà Nội',
                          venueSectionDescription: 'Hội trường lớn Tầng 2 - Cụm công trình trung tâm. Vị trí đắc địa tại trung tâm Thủ đô, thuận tiện di chuyển cho các chuyên gia và đại biểu cả nước.',
                          venueShort: 'Bệnh Viện TWQĐ 108, Hà Nội',
                          venueName: 'Hội trường Trung tâm - Bệnh viện Trung ương Quân đội 108',
                          venueAddressTitle: 'Hội trường Trung tâm - BV TWQĐ 108',
                          venueAddress: 'Số 1 Trần Hưng Đạo, P. Bạch Đằng, Q. Hai Bà Trưng, Hà Nội',
                          googleMapsUrl: 'https://maps.google.com/?q=B%E1%BB%87nh+vi%E1%BB%87t+Trung+%C6%B0%C6%A1ng+Qu%C3%A2n+%C4%91%E1%BB%99i+108',
                          mapImageUrl: '/images/map-bv108-hanoi.png',
                          mapButtonText: 'Mở Google Maps chỉ đường',
                          venueParkingTitle: 'Bãi Đỗ Xe Ô Tô & Xe Máy',
                          venueParkingDesc: 'Hầm giữ xe tầng B1 & B2 của Cụm công trình trung tâm BV 108 rộng rãi, có bảo vệ trực 24/7 và hệ thống hướng dẫn đỗ xe thông minh cho đại biểu tham dự.',
                          venueAirportTitle: 'Từ Sân Bay Quốc Tế Nội Bài',
                          venueAirportDesc: 'Khoảng cách ~28km (35-45 phút di chuyển bằng taxi/xe công nghệ). Tuyến đường thuận tiện nhất qua Cầu Nhật Tân - Đường Võ Chí Công - Đường vành đai 1 hoặc Cầu Long Biên/Chương Dương.',
                          venueSupportTitle: 'Cần Hỗ Trợ Đón Tiếp Hoặc Khách Sạn Gần BV 108?',
                          venueSupportHotline: '090 123 4567',
                          venueSupportEmail: 'support@kbitassociation.com',
                          venueSupportButtonText: 'Liên Hệ Ban Thư Ký',
                        });
                        showToast('Đã khôi phục toàn bộ nội dung chuẩn của Địa điểm BV 108!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
                      title="Khôi phục toàn bộ thông tin chuẩn về Bệnh viện TWQĐ 108"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Khôi phục chuẩn BV 108
                    </button>
                  </div>

                  {/* 1. Tiêu đề & Giới thiệu Section */}
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      1. Tiêu Đề &amp; Giới Thiệu Khối Địa Điểm
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Nhãn nhỏ phía trên (Tagline):
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.venueSectionTag ?? 'ĐỊA ĐIỂM TỔ CHỨC CHÍNH THỨC'}
                          onChange={(e) => updateEventDetails({ venueSectionTag: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                          placeholder="ĐỊA ĐIỂM TỔ CHỨC CHÍNH THỨC"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tiêu đề lớn khu vực Địa điểm:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.venueSectionTitle ?? 'Hướng Dẫn Đến Bệnh Viện TWQĐ 108, Hà Nội'}
                          onChange={(e) => updateEventDetails({ venueSectionTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                          placeholder="Hướng Dẫn Đến Bệnh Viện TWQĐ 108, Hà Nội"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đoạn mô tả / giới thiệu chung:
                        </label>
                        <textarea
                          rows={2}
                          value={cmsData.eventDetails.venueSectionDescription ?? 'Hội trường lớn Tầng 2 - Cụm công trình trung tâm. Vị trí đắc địa tại trung tâm Thủ đô, thuận tiện di chuyển cho các chuyên gia và đại biểu cả nước.'}
                          onChange={(e) => updateEventDetails({ venueSectionDescription: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                          placeholder="Hội trường lớn Tầng 2 - Cụm công trình trung tâm. Vị trí đắc địa tại trung tâm Thủ đô..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Quản lý Hình Ảnh Bản Đồ / Sơ Đồ Chỉ Đường */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-blue-200/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        2. Hình Ảnh Sơ Đồ / Bản Đồ Vị Trí (Hà Nội - BV 108)
                      </span>
                      <span className="text-[11px] text-blue-700 font-semibold">
                        Tải ảnh lên hoặc dán link URL
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Thumbnail preview */}
                      <div className="md:col-span-4 flex flex-col items-center">
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 group">
                          <img
                            src={cmsData.eventDetails.mapImageUrl || '/images/map-bv108-hanoi.png'}
                            alt="Bản đồ BV 108 Hà Nội"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/map-bv108-hanoi.png';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => mapImageFileRef.current?.click()}
                              className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-bold rounded-lg shadow-md hover:bg-slate-100"
                            >
                              Đổi ảnh
                            </button>
                            <a
                              href={cmsData.eventDetails.mapImageUrl || '/images/map-bv108-hanoi.png'}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 bg-white/90 text-slate-800 rounded-lg shadow-md hover:bg-white"
                              title="Xem ảnh gốc"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1">Ảnh hiển thị trên website</span>
                      </div>

                      {/* Upload controls & URL */}
                      <div className="md:col-span-8 space-y-3">
                        <input
                          type="file"
                          ref={mapImageFileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleMapImageUpload}
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => mapImageFileRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#174ea6] hover:bg-[#133e85] text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Tải ảnh bản đồ từ máy tính
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateEventDetails({ mapImageUrl: '/images/map-bv108-hanoi.png' });
                              showToast('Đã chuyển về bản đồ chuẩn BV 108 Hà Nội!');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                            Bản đồ Hà Nội gốc
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Hoặc nhập URL hình ảnh trực tiếp:
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cmsData.eventDetails.mapImageUrl ?? '/images/map-bv108-hanoi.png'}
                              onChange={(e) => updateEventDetails({ mapImageUrl: e.target.value })}
                              className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:border-[#174ea6] outline-none"
                              placeholder="/images/map-bv108-hanoi.png hoặc https://..."
                            />
                            {cmsData.eventDetails.mapImageUrl && (
                              <a
                                href={cmsData.eventDetails.mapImageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                                title="Mở ảnh"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Tên nút mở bản đồ Google Maps:
                            </label>
                            <input
                              type="text"
                              value={cmsData.eventDetails.mapButtonText ?? 'Mở Google Maps chỉ đường'}
                              onChange={(e) => updateEventDetails({ mapButtonText: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                              placeholder="Mở Google Maps chỉ đường"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Link chỉ đường Google Maps:
                            </label>
                            <input
                              type="text"
                              value={cmsData.eventDetails.googleMapsUrl}
                              onChange={(e) => updateEventDetails({ googleMapsUrl: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:border-[#174ea6] outline-none"
                              placeholder="https://maps.google.com/?q=..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Tên hội trường & Địa chỉ chi tiết */}
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      3. Tên Hội Trường &amp; Địa Chỉ Chi Tiết
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tên hội trường / địa điểm rút gọn:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.venueShort}
                          onChange={(e) => updateEventDetails({ venueShort: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                          placeholder="Bệnh Viện TWQĐ 108, Hà Nội"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tên hội trường đầy đủ:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.venueName}
                          onChange={(e) => updateEventDetails({ venueName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                          placeholder="Hội trường Trung tâm - Bệnh viện Trung ương Quân đội 108"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tiêu đề khối địa chỉ:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.venueAddressTitle ?? 'Hội trường Trung tâm - BV TWQĐ 108'}
                          onChange={(e) => updateEventDetails({ venueAddressTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                          placeholder="Hội trường Trung tâm - BV TWQĐ 108"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Địa chỉ chính xác (Số nhà, Phường, Quận, Thành phố):
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.venueAddress}
                          onChange={(e) => updateEventDetails({ venueAddress: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                          placeholder="Số 1 Trần Hưng Đạo, P. Bạch Đằng, Q. Hai Bà Trưng, Hà Nội"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Hướng dẫn Bãi Xe & Sân Bay */}
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-600" />
                      4. Hướng Dẫn Bãi Đỗ Xe &amp; Di Chuyển Từ Sân Bay
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Bãi đỗ xe */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Car className="w-4 h-4 text-emerald-600" />
                          <span>Khối Bãi Đỗ Xe</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Tiêu đề:</label>
                          <input
                            type="text"
                            value={cmsData.eventDetails.venueParkingTitle ?? 'Bãi Đỗ Xe Ô Tô & Xe Máy'}
                            onChange={(e) => updateEventDetails({ venueParkingTitle: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                            placeholder="Bãi Đỗ Xe Ô Tô & Xe Máy"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Nội dung hướng dẫn:</label>
                          <textarea
                            rows={3}
                            value={cmsData.eventDetails.venueParkingDesc ?? 'Hầm giữ xe tầng B1 & B2 của Cụm công trình trung tâm BV 108 rộng rãi, có bảo vệ trực 24/7 và hệ thống hướng dẫn đỗ xe thông minh cho đại biểu tham dự.'}
                            onChange={(e) => updateEventDetails({ venueParkingDesc: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-normal focus:border-[#174ea6] outline-none"
                            placeholder="Hướng dẫn gửi xe ô tô, xe máy chi tiết..."
                          />
                        </div>
                      </div>

                      {/* Sân bay */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Plane className="w-4 h-4 text-blue-600" />
                          <span>Khối Sân Bay</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Tiêu đề:</label>
                          <input
                            type="text"
                            value={cmsData.eventDetails.venueAirportTitle ?? 'Từ Sân Bay Quốc Tế Nội Bài'}
                            onChange={(e) => updateEventDetails({ venueAirportTitle: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                            placeholder="Từ Sân Bay Quốc Tế Nội Bài"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Nội dung hướng dẫn:</label>
                          <textarea
                            rows={3}
                            value={cmsData.eventDetails.venueAirportDesc ?? 'Khoảng cách ~28km (35-45 phút di chuyển bằng taxi/xe công nghệ). Tuyến đường thuận tiện nhất qua Cầu Nhật Tân - Đường Võ Chí Công - Đường vành đai 1 hoặc Cầu Long Biên/Chương Dương.'}
                            onChange={(e) => updateEventDetails({ venueAirportDesc: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-normal focus:border-[#174ea6] outline-none"
                            placeholder="Khoảng cách, thời gian và hướng di chuyển từ sân bay..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Khối Hỗ Trợ Đón Tiếp & Ban Thư Ký */}
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      5. Khối Hỗ Trợ Đón Tiếp, Khách Sạn &amp; Ban Thư Ký
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="sm:col-span-2 md:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tiêu đề khối hỗ trợ:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.venueSupportTitle ?? 'Cần Hỗ Trợ Đón Tiếp Hoặc Khách Sạn Gần BV 108?'}
                          onChange={(e) => updateEventDetails({ venueSupportTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                          placeholder="Cần Hỗ Trợ Đón Tiếp Hoặc Khách Sạn Gần BV 108?"
                        />
                      </div>

                      <div className="sm:col-span-1 md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Số điện thoại Hotline:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cmsData.eventDetails.venueSupportHotline ?? '090 123 4567'}
                            onChange={(e) => updateEventDetails({ venueSupportHotline: e.target.value })}
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-emerald-700 focus:border-[#174ea6] outline-none"
                            placeholder="090 123 4567"
                          />
                          <Phone className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="sm:col-span-1 md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Email tiếp nhận hỗ trợ:
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={cmsData.eventDetails.venueSupportEmail ?? 'support@kbitassociation.com'}
                            onChange={(e) => updateEventDetails({ venueSupportEmail: e.target.value })}
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-blue-700 focus:border-[#174ea6] outline-none"
                            placeholder="support@kbitassociation.com"
                          />
                          <Mail className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="sm:col-span-2 md:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tên nút liên hệ ban thư ký:
                        </label>
                        <input
                          type="text"
                          value={cmsData.eventDetails.venueSupportButtonText ?? 'Liên Hệ Ban Thư Ký'}
                          onChange={(e) => updateEventDetails({ venueSupportButtonText: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#174ea6] outline-none"
                          placeholder="Liên Hệ Ban Thư Ký"
                        />
                      </div>
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
                          onFocus={() => { isEditingAdminAccountRef.current = true; }}
                          onBlur={() => { isEditingAdminAccountRef.current = false; }}
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
                            onFocus={() => { isEditingAdminAccountRef.current = true; }}
                            onBlur={() => { isEditingAdminAccountRef.current = false; }}
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
                    {/* Top Identity & Photo Uploader Section */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border border-slate-200/80 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#c83271]" />
                          <h4 className="text-[14px] font-bold text-slate-900">
                            Ảnh Chân Dung Đại Diện — {selectedExpert.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-[#c83271]">
                            Chuyên gia #{cmsData.experts.findIndex((e) => e.id === selectedExpert.id) + 1}
                          </span>
                        </div>

                        {cmsData.experts.length > 1 && (
                          <button
                            type="button"
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

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                        {/* Photo Preview & Drop Area */}
                        <div className="sm:col-span-4 lg:col-span-3 flex flex-col items-center gap-2">
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingPhoto(true);
                            }}
                            onDragLeave={() => setIsDraggingPhoto(false)}
                            onDrop={(e) => {
                              setIsDraggingPhoto(false);
                              handleSpeakerAvatarDrop(e, selectedExpert.id);
                            }}
                            className={`relative group w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center text-center shadow-md bg-white ${
                              isDraggingPhoto
                                ? 'border-[#c83271] scale-105 shadow-xl bg-pink-50/50'
                                : 'border-slate-200 hover:border-[#174ea6]'
                            }`}
                          >
                            <img
                              src={selectedExpert.avatarUrl}
                              alt={selectedExpert.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80';
                              }}
                            />

                            {/* Quick overlay click */}
                            <div
                              onClick={() => speakerPhotoRef.current?.click()}
                              className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white p-2 cursor-pointer"
                            >
                              <Upload className="w-5 h-5 text-pink-400" />
                              <span className="text-[11px] font-bold">Bấm để đổi ảnh</span>
                              <span className="text-[9.5px] text-slate-300">hoặc kéo thả file vào</span>
                            </div>
                          </div>

                          <span className="text-[11px] text-slate-400 text-center">
                            Tỉ lệ 3:4 hoặc 1:1
                          </span>
                        </div>

                        {/* Controls & Options */}
                        <div className="sm:col-span-8 lg:col-span-9 space-y-3">
                          {/* Main Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Hidden file input with ref */}
                            <input
                              type="file"
                              ref={speakerPhotoRef}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSpeakerAvatarUpload(e, selectedExpert.id)}
                            />

                            {/* Prominent Upload Button */}
                            <button
                              type="button"
                              onClick={() => speakerPhotoRef.current?.click()}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c83271] to-[#e11d48] hover:from-[#b0225d] hover:to-[#be123c] text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Tải ảnh từ máy tính (PNG, JPG, WebP)</span>
                            </button>

                            {/* Choose from Media Library Button */}
                            <button
                              type="button"
                              onClick={() => setShowMediaPickerForExpert(!showMediaPickerForExpert)}
                              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#174ea6] border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                            >
                              <ImageIcon className="w-4 h-4 text-[#174ea6]" />
                              <span>{showMediaPickerForExpert ? 'Đóng thư viện' : 'Chọn từ thư viện ảnh'}</span>
                            </button>
                          </div>

                          {/* URL Input */}
                          <div>
                            <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                              Đường dẫn URL ảnh hoặc mã Base64:
                            </label>
                            <input
                              type="text"
                              value={selectedExpert.avatarUrl}
                              onChange={(e) => updateExpert(selectedExpert.id, { avatarUrl: e.target.value })}
                              placeholder="https://... hoặc /assets/..."
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:border-[#174ea6] focus:ring-1 focus:ring-[#174ea6] outline-none transition-all"
                            />
                          </div>

                          {/* Quick Media Library Picker Grid (Collapsible) */}
                          {showMediaPickerForExpert && (
                            <div className="p-3.5 rounded-2xl bg-white border border-blue-200 space-y-2 animate-in fade-in duration-150 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-[11.5px] font-bold text-[#174ea6]">
                                  Bấm vào ảnh bất kỳ để áp dụng ngay:
                                </span>
                                <span className="text-[10.5px] text-slate-400">
                                  {cmsData.mediaLibrary.length} ảnh trong kho
                                </span>
                              </div>

                              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
                                {cmsData.mediaLibrary.map((imgUrl, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      updateExpert(selectedExpert.id, { avatarUrl: imgUrl });
                                      showToast('Đã áp dụng ảnh từ thư viện!');
                                    }}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                                      selectedExpert.avatarUrl === imgUrl
                                        ? 'border-[#c83271] ring-2 ring-[#c83271]/20 scale-95'
                                        : 'border-slate-200 hover:border-[#174ea6]'
                                    }`}
                                  >
                                    <img src={imgUrl} alt={`media-${i}`} className="w-full h-full object-cover" />
                                    {selectedExpert.avatarUrl === imgUrl && (
                                      <div className="absolute inset-0 bg-[#c83271]/40 flex items-center justify-center text-white">
                                        <Check className="w-4 h-4 stroke-[3]" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
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

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Đơn vị công tác / Bệnh viện (Hiển thị chân thẻ):
                        </label>
                        <input
                          type="text"
                          value={selectedExpert.affiliation || ''}
                          onChange={(e) => updateExpert(selectedExpert.id, { affiliation: e.target.value })}
                          placeholder="SNUBH Plastic Surgery - KSAPS / Navi Plastic Surgery..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Đề tài báo cáo khoa học (Hiển thị trên thẻ):
                        </label>
                        <input
                          type="text"
                          value={selectedExpert.topic || ''}
                          onChange={(e) => updateExpert(selectedExpert.id, { topic: e.target.value })}
                          placeholder="Nhập tên đề tài báo cáo..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#174ea6] outline-none"
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
                      Điều chỉnh các phiên báo cáo, thời gian bắt đầu, thời lượng, hội trường và tóm tắt học thuật theo chuẩn KBIT.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        if (window.confirm('Khôi phục và đồng bộ toàn bộ 39 mục chương trình chuẩn (2 ngày, 4 hội trường) từ hệ thống vào CMS?')) {
                          syncDefaultAgenda();
                          showToast('✅ Đã đồng bộ toàn bộ 39 mục chương trình khoa học chuẩn vào CMS!');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      title="Đồng bộ toàn bộ lịch trình chuẩn từ bảng mẫu"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#174ea6]" />
                      <span>Đồng bộ 39 mục chuẩn</span>
                    </button>

                    <button
                      onClick={async () => {
                        await handleManualSave(true);
                        showToast('✅ Đã lưu toàn bộ lịch trình hội thảo vào CMS thành công!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      title="Lưu toàn bộ lịch trình vào bộ nhớ CMS & Cloud"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu vào CMS</span>
                    </button>

                    <button
                      onClick={() => {
                        const newAgenda: AgendaItem = {
                          id: `item-${Date.now()}`,
                          time: '16:30 – 17:00',
                          duration: "30'",
                          title: 'PHIÊN BÁO CÁO MỚI',
                          description: 'Nội dung tóm tắt chuyên đề khoa học.',
                          session: 'session2',
                          day: agendaDayFilter === 2 ? 2 : 1,
                          hall: 'Hội trường 1',
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
                </div>

                {/* Day Filter & Search Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/90">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setAgendaDayFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        agendaDayFilter === 'all'
                          ? 'bg-[#002045] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                      }`}
                    >
                      Tất cả ({cmsData.agenda.length})
                    </button>
                    <button
                      onClick={() => setAgendaDayFilter(1)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        agendaDayFilter === 1
                          ? 'bg-[#174ea6] text-white shadow-xs'
                          : 'bg-white hover:bg-blue-50 text-[#174ea6] border border-slate-200'
                      }`}
                    >
                      Ngày 1 · 17/10 ({cmsData.agenda.filter((a) => a.day === 1).length})
                    </button>
                    <button
                      onClick={() => setAgendaDayFilter(2)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        agendaDayFilter === 2
                          ? 'bg-[#c83271] text-white shadow-xs'
                          : 'bg-white hover:bg-pink-50 text-[#c83271] border border-slate-200'
                      }`}
                    >
                      Ngày 2 · 18/10 ({cmsData.agenda.filter((a) => a.day === 2).length})
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên phiên, hội trường..."
                      value={agendaSearch}
                      onChange={(e) => setAgendaSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#174ea6]/20"
                    />
                  </div>
                </div>

                {/* Agenda List */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {cmsData.agenda
                    .filter((item) => {
                      if (agendaDayFilter !== 'all' && item.day !== agendaDayFilter) return false;
                      if (!agendaSearch.trim()) return true;
                      const q = agendaSearch.toLowerCase();
                      return (
                        item.title.toLowerCase().includes(q) ||
                        (item.description && item.description.toLowerCase().includes(q)) ||
                        (item.hall && item.hall.toLowerCase().includes(q)) ||
                        item.time.toLowerCase().includes(q)
                      );
                    })
                    .map((item, index) => (
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
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10.5px] ${
                              item.day === 2
                                ? 'bg-pink-100 text-[#c83271]'
                                : 'bg-blue-100 text-[#174ea6]'
                            }`}>
                              {item.day === 2 ? 'Ngày 2' : 'Ngày 1'}
                            </span>

                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] font-mono">
                              {item.time} ({item.duration})
                            </span>

                            {item.hall && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10.5px] border border-slate-200">
                                {item.hall}
                              </span>
                            )}

                            {item.isKeynote && (
                              <span className="px-2 py-0.5 rounded-md bg-pink-100 text-[#c83271] font-bold text-[10.5px]">
                                ⭐ KEYNOTE
                              </span>
                            )}
                          </div>

                          <h3 className="text-[14.5px] font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
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
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                                Ngày tổ chức:
                              </label>
                              <select
                                value={item.day || 1}
                                onChange={(e) => updateAgendaItem(item.id, { day: Number(e.target.value) as 1 | 2 })}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-bold"
                              >
                                <option value={1}>Ngày 1 (17/10/2026)</option>
                                <option value={2}>Ngày 2 (18/10/2026)</option>
                              </select>
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
                                <option value="session1">Phiên sáng (Khoa học / Thị phạm)</option>
                                <option value="break">Nghỉ giải lao / Trà / Ăn trưa</option>
                                <option value="session2">Phiên chiều (Khoa học / Thị phạm)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Hội trường / Địa điểm:
                              </label>
                              <input
                                type="text"
                                value={item.hall || ''}
                                onChange={(e) => updateAgendaItem(item.id, { hall: e.target.value })}
                                placeholder="Hội trường 1, Hội trường 2, Sảnh chính..."
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                                <input
                                  type="checkbox"
                                  checked={Boolean(item.isKeynote)}
                                  onChange={(e) => updateAgendaItem(item.id, { isKeynote: e.target.checked })}
                                  className="w-4 h-4 rounded text-[#d52b66] border-slate-300"
                                />
                                <span className="text-xs font-bold text-slate-800">⭐ Đề dẫn Keynote</span>
                              </label>
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
                              Tóm tắt nội dung khoa học (dùng • để ngắt dòng gạch đầu dòng):
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
                    const isCurrentBanner =
                      cmsData.eventDetails.heroBgImageUrl === imgUrl ||
                      cmsData.eventDetails.bannerImageUrl === imgUrl;

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
                                updateEventDetails({
                                  bannerImageUrl: imgUrl,
                                  heroBgImageUrl: imgUrl,
                                });
                                showToast('Đã chọn làm ảnh nền Hero Banner thành công!');
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
                    Quản lý khối tiêu đề giới thiệu và 4 cột mốc quan trọng về quy mô, khu triển lãm, ngôn ngữ và CME.
                  </p>
                </div>

                {/* KHỐI GIỚI THIỆU TỔNG QUAN (THAY THẾ PHẦN KHOANH ĐỎ CŨ) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-[14.5px] font-black text-slate-800">
                        Đoạn văn giới thiệu tổng quan sự kiện
                      </h3>
                      <p className="text-[11.5px] text-slate-500">
                        Hiển thị ngay dưới Hero Banner, mở đầu cho các chỉ số nổi bật
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-[12px] font-bold text-slate-700">
                        {cmsData.eventDetails.showHighlightsHeader !== false ? 'Đang bật' : 'Đã ẩn'}
                      </span>
                      <input
                        type="checkbox"
                        checked={cmsData.eventDetails.showHighlightsHeader !== false}
                        onChange={(e) => updateEventDetails({ showHighlightsHeader: e.target.checked })}
                        className="w-4 h-4 text-pink-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>

                  {cmsData.eventDetails.showHighlightsHeader !== false && (
                    <div className="pt-1">
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-1.5">
                        Nội dung đoạn văn giới thiệu:
                      </label>
                      <textarea
                        rows={4}
                        value={
                          cmsData.eventDetails.highlightsDescription ??
                          'Hội nghị khoa học thẩm mỹ Việt – Hàn nổi bật năm 2026 là sự kiện khoa học quy mô lớn do KSAPS và VSAPS chủ trì, dưới sự bảo trợ của Bộ Y tế và Phúc lợi Hàn Quốc, quy tụ các tổ chức chuyên môn, bệnh viện và chuyên gia hàng đầu trong lĩnh vực thẩm mỹ đến từ Việt Nam và Hàn Quốc. Hội nghị được đồng tổ chức bởi KHIDI, Bệnh viện Đại học Quốc gia Seoul, Bệnh viện Trung ương Quân đội 108 và KBIT, hướng đến thúc đẩy trao đổi học thuật, cập nhật kỹ thuật chuyên môn và tăng cường hợp tác y khoa giữa hai quốc gia.'
                        }
                        onChange={(e) => updateEventDetails({ highlightsDescription: e.target.value })}
                        placeholder="Nhập nội dung giới thiệu tổng quan..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  )}
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
                      Hội nghị BV 108 (Congress)
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
                      Cần cấp CME BV 108
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
                                        <span>Hội nghị BV 108 (17–18/10)</span>
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
                              <span className="text-[10.5px] text-slate-400 block">Chứng nhận CME BV 108</span>
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
                                    <span className="text-[11px] font-bold text-[#174ea6]">17/10/2026</span>
                                  </div>
                                  <h4 className="text-[12.5px] font-black text-[#002045] leading-snug">
                                    Hội thảo Khoa học Thẩm mỹ Việt–Hàn 2026
                                  </h4>
                                  <p className="text-[10.5px] text-slate-500 mt-1">
                                    Bệnh viện Trung ương Quân đội 108, Hà Nội • CME Đào tạo Y khoa liên tục
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
                                    <span className="text-[11px] font-bold text-[#c83271]">18/10/2026</span>
                                  </div>
                                  <h4 className="text-[12.5px] font-black text-[#002045] leading-snug">
                                    Hội thảo Kỹ năng Nâng cao K-Beauty
                                  </h4>
                                  <p className="text-[10.5px] text-slate-500 mt-1">
                                    Bệnh viện TWQĐ 108 • Phẫu thuật thị phạm & B2B
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
                              Yêu cầu cấp Chứng chỉ Đào tạo Y khoa liên tục (CME Bệnh viện Trung ương Quân đội 108, Hà Nội)
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

        {/* CMS Bottom Status Footer - Sticky Action Bar */}
        <footer className="sticky bottom-0 z-30 px-4 sm:px-8 py-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0 shadow-lg">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`w-2.5 h-2.5 rounded-full ${saveSuccessTick ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="font-semibold text-slate-700">
              Trạng thái: <span className="text-emerald-700 font-bold">Tự động đồng bộ</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-500 hidden sm:inline">
              Lần lưu gần nhất: <span className="font-mono font-bold text-slate-800">{lastSavedTime}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            {/* 1. NÚT LƯU THAY ĐỔI CHÍNH */}
            <button
              type="button"
              onClick={() => handleManualSave(true)}
              disabled={isSaving}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 ${
                saveSuccessTick
                  ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-300'
                  : 'bg-gradient-to-r from-[#d53774] via-[#b0225d] to-[#174ea6] hover:opacity-95 ring-2 ring-pink-300/40'
              }`}
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : saveSuccessTick ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>ĐÃ LƯU THÀNH CÔNG!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>LƯU THAY ĐỔI</span>
                </>
              )}
            </button>

            {/* 2. NÚT LƯU & VỀ TRANG CHỦ */}
            <button
              type="button"
              onClick={async () => {
                await handleManualSave(false);
                closeAdmin();
              }}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#002045] hover:bg-[#001733] text-white font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
              title="Lưu tất cả thay đổi và chuyển ngay ra trang chủ"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Lưu &amp; Về Trang Chủ</span>
              <span className="xs:hidden">Lưu &amp; Xem</span>
            </button>

            {/* 3. NÚT ĐÓNG */}
            <button
              type="button"
              onClick={() => closeAdmin()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </footer>
    </div>
  );
};
