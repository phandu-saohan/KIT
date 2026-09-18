import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Award,
  Calendar,
  RefreshCw,
  Printer,
  ExternalLink,
  Smartphone,
  Stethoscope,
  Building2,
  MapPin,
  HelpCircle,
  QrCode,
  ShieldCheck,
  Check,
  Sparkles,
  Mail,
  Loader2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { RegistrationFormData, AttendeeBadge } from '../types';
import { useCMS } from '../context/CMSContext';
import { sendRegistrationConfirmationEmail } from '../utils/registrationEmail';
import QRCode from 'qrcode';

interface EventOption {
  id: string;
  code: 'SYM' | 'KAT';
  title: string;
  subtitle: string;
  date: string;
  venue: string;
  accentColor: string;
  iconBg: string;
}

const EVENT_OPTIONS = [
  {
    id: 'CONGRESS',
    code: 'CONGRESS' as const,
    title: 'Hội nghị Khoa học Thẩm mỹ Việt – Hàn 2026',
    subtitle: 'Đại hội Thường niên 2 Ngày • 4 Hội trường Song song',
    date: '17–18/10/2026',
    venue: 'Bệnh viện Trung ương Quân đội 108, Hà Nội',
    accentColor: 'border-t-[#c83271]',
    iconBg: 'bg-[#c83271] text-white',
  },
];

const DOCTOR_INTERESTS = [
  'Thẩm mỹ khuôn mặt',
  'Tạo hình cơ thể',
  'Tiêm chích',
  'Da & Laser',
  'Chống lão hóa',
];

const DOCTOR_GOALS = [
  'Học kỹ thuật mới',
  'Kiến thức lâm sàng',
  'Thực hành trực tiếp',
  'Kết nối chuyên gia',
  'Cơ hội kinh doanh',
];

const BUSINESS_INTERESTS = [
  'Thiết bị Y tế',
  'Thiết bị Thẩm mỹ',
  'Sản phẩm Tiêm',
  'Chăm sóc Da & Dược mỹ phẩm',
  'Vật tư Tiêu hao',
];

const BUSINESS_GOALS = [
  'Tìm nhà phân phối & đối tác',
  'Trình diễn sản phẩm',
  'Quảng bá thương hiệu',
  'Kết nối B2B',
  'Khám phá thị trường Việt Nam',
];

export const RegistrationSection: React.FC = () => {
  const { cmsData, addRegistration, incrementHostingerSentToday, incrementGmailSentToday, openPosterModal } = useCMS();
  const sectionRef = useRef<HTMLElement>(null);
  const totalSeats = cmsData.eventDetails.totalSeats || 1000;
  const currentRegistered = (cmsData.eventDetails.initialRegistered || 820) + cmsData.registrations.length - 2;
  const remainingSeats = Math.max(0, totalSeats - Math.min(totalSeats, currentRegistered));
  const capacityPct = Math.min(100, Math.round(((totalSeats - remainingSeats) / totalSeats) * 100));

  const [formData, setFormData] = useState<RegistrationFormData>({
    attendeeType: 'doctor',
    selectedEvents: ['CONGRESS'],
    fullName: '',
    phone: '',
    email: '',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    license: '',
    institution: '',
    titleRole: '',
    orgType: '',
    specialty: '',
    address: '',
    notes: '',
    wantsCme: true,
    interests: ['Thẩm mỹ khuôn mặt', 'Tiêm chích'],
    goals: ['Học kỹ thuật mới', 'Kiến thức lâm sàng'],
    consentPrivacy: true,
    consentNews: false,
    consentData: true,
    degree: 'BS',
    cmeNeed: 'yes',
    sessionPref: 'both',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredBadge, setRegisteredBadge] = useState<AttendeeBadge | null>(null);
  const [emailSendingStatus, setEmailSendingStatus] = useState<{
    status: 'idle' | 'sending' | 'sent' | 'failed';
    message?: string;
    provider?: string;
  }>({ status: 'idle' });
  const [fromMobileQr, setFromMobileQr] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Smoothly anchor view to registration section when badge is created to avoid jumping downwards
  useEffect(() => {
    if (registeredBadge && sectionRef.current) {
      const yOffset = -70;
      const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: 'smooth',
      });
    }
  }, [registeredBadge]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchPart = window.location.search;
    const hashPart = window.location.hash;
    const queryStr = searchPart || (hashPart.includes('?') ? hashPart.substring(hashPart.indexOf('?')) : '');

    if (queryStr) {
      try {
        const params = new URLSearchParams(queryStr);
        const groupParam = params.get('group');
        const cmeParam = params.get('cme');
        const eventParam = params.get('event');
        const sourceParam = params.get('utm_source');

        if (groupParam === 'business') {
          setFormData((prev) => ({ ...prev, attendeeType: 'business', wantsCme: false }));
        } else if (groupParam === 'doctor') {
          setFormData((prev) => ({ ...prev, attendeeType: 'doctor' }));
        }

        if (cmeParam === 'yes') {
          setFormData((prev) => ({ ...prev, wantsCme: true }));
        } else if (cmeParam === 'no') {
          setFormData((prev) => ({ ...prev, wantsCme: false }));
        }

        if (eventParam && ['SYM', 'KAT'].includes(eventParam.toUpperCase())) {
          setFormData((prev) => ({
            ...prev,
            selectedEvents: [eventParam.toUpperCase()],
          }));
        }

        if (sourceParam === 'mobile_qr') {
          setFromMobileQr(true);
        }
      } catch (err) {
        console.error('Error parsing registration params', err);
      }
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAttendeeTypeChange = (type: 'doctor' | 'business') => {
    setFormData((prev) => ({
      ...prev,
      attendeeType: type,
      orgType: '',
      specialty: '',
      interests: type === 'doctor' ? ['Thẩm mỹ khuôn mặt', 'Tiêm chích'] : ['Thiết bị Thẩm mỹ', 'Chăm sóc Da & Dược mỹ phẩm'],
      goals: type === 'doctor' ? ['Học kỹ thuật mới'] : ['Tìm nhà phân phối & đối tác', 'Kết nối B2B'],
      wantsCme: type === 'doctor' ? prev.wantsCme : false,
    }));
  };

  const toggleEvent = (eventId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedEvents.includes(eventId);
      let updated: string[];
      if (exists) {
        if (prev.selectedEvents.length === 1) {
          return prev;
        }
        updated = prev.selectedEvents.filter((id) => id !== eventId);
      } else {
        updated = [...prev.selectedEvents, eventId];
      }
      return { ...prev, selectedEvents: updated };
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      const updated = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => {
      const exists = prev.goals.includes(goal);
      const updated = exists
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.selectedEvents.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một sự kiện để tham dự.');
      return;
    }

    if (!formData.consentPrivacy || !formData.consentData) {
      setErrorMessage('Vui lòng đồng ý với Chính sách bảo mật và Quy định xử lý thông tin để tiếp tục.');
      return;
    }

    setIsSubmitting(true);

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const prefix = formData.attendeeType === 'doctor' ? 'DOC' : 'BIZ';
    const regCode = `KBIT-${prefix}-${randomId}`;

    let qrCodeUrl = '';
    const qrPayload = `KBIT2026|${regCode}|${formData.fullName}|${formData.selectedEvents.join(',')}|${formData.wantsCme ? 'CME' : 'NOCME'}`;

    try {
      qrCodeUrl = await QRCode.toDataURL(qrPayload, {
        width: 220,
        margin: 1,
        color: {
          dark: '#151C2C',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
    } catch {
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrPayload)}`;
    }

    const newBadge: AttendeeBadge = {
      id: `reg-${Date.now()}`,
      registrationCode: regCode,
      fullName: formData.fullName,
      attendeeType: formData.attendeeType,
      selectedEvents: formData.selectedEvents,
      degree: formData.titleRole || (formData.attendeeType === 'doctor' ? 'Bác sĩ' : 'Đại diện Doanh nghiệp'),
      institution: formData.institution,
      phone: formData.phone,
      email: formData.email,
      city: formData.city,
      country: formData.country,
      license: formData.license,
      titleRole: formData.titleRole,
      specialty: formData.specialty,
      interests: formData.interests,
      goals: formData.goals,
      notes: formData.notes,
      wantsCme: formData.wantsCme,
      cmeNeed: formData.wantsCme ? 'yes' : 'no',
      consentNews: formData.consentNews,
      sessionPref: 'both',
      registeredAt: new Date().toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      qrCodeUrl: qrCodeUrl,
    };

    setTimeout(async () => {
      setRegisteredBadge(newBadge);
      addRegistration(newBadge);
      setIsSubmitting(false);

      // Prevent window from jumping downwards when form unmounts
      if (sectionRef.current) {
        const yOffset = -70;
        const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({
          top: Math.max(0, y),
          behavior: 'smooth',
        });
      }

      // Automatically dispatch confirmation email to attendee if enabled
      const isAutoSendEnabled = cmsData.confirmEmailTemplate ? cmsData.confirmEmailTemplate.enabled : true;
      if (isAutoSendEnabled && formData.email && formData.email.includes('@')) {
        setEmailSendingStatus({ status: 'sending' });
        try {
          const res = await sendRegistrationConfirmationEmail(
            newBadge,
            cmsData.emailCampaignConfig,
            cmsData.confirmEmailTemplate
          );
          if (res.success) {
            setEmailSendingStatus({
              status: 'sent',
              message: `Đã tự động gửi thông tin xác nhận & thẻ đại biểu về hòm thư: ${newBadge.email}`,
              provider: res.provider,
            });
            if (res.provider === 'hostinger' && res.accountId) {
              incrementHostingerSentToday(res.accountId);
            } else if (res.provider === 'gmail' && res.accountId) {
              incrementGmailSentToday(res.accountId);
            }
          } else {
            setEmailSendingStatus({
              status: 'failed',
              message: res.message || 'Không thể gửi email tự động lúc này.',
            });
          }
        } catch (err: any) {
          setEmailSendingStatus({
            status: 'failed',
            message: err?.message || 'Lỗi mạng khi gửi email.',
          });
        }
      } else if (!isAutoSendEnabled) {
        setEmailSendingStatus({
          status: 'idle',
        });
      }
    }, 450);
  };

  const handleResendEmail = async () => {
    if (!registeredBadge || !registeredBadge.email) return;
    setEmailSendingStatus({ status: 'sending' });
    try {
      const res = await sendRegistrationConfirmationEmail(
        registeredBadge,
        cmsData.emailCampaignConfig,
        cmsData.confirmEmailTemplate
      );
      if (res.success) {
        setEmailSendingStatus({
          status: 'sent',
          message: `Đã gửi lại thành công thư xác nhận về ${registeredBadge.email}`,
          provider: res.provider,
        });
        if (res.provider === 'hostinger' && res.accountId) {
          incrementHostingerSentToday(res.accountId);
        } else if (res.provider === 'gmail' && res.accountId) {
          incrementGmailSentToday(res.accountId);
        }
      } else {
        setEmailSendingStatus({
          status: 'failed',
          message: res.message || 'Chưa thể gửi email.',
        });
      }
    } catch (err: any) {
      setEmailSendingStatus({
        status: 'failed',
        message: err?.message || 'Lỗi kết nối khi gửi lại email.',
      });
    }
  };

  const handleReset = () => {
    setRegisteredBadge(null);
    setEmailSendingStatus({ status: 'idle' });
    setFormData((prev) => ({
      ...prev,
      fullName: '',
      phone: '',
      email: '',
      license: '',
      institution: '',
      titleRole: '',
      address: '',
      notes: '',
    }));
    if (sectionRef.current) {
      const yOffset = -70;
      const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: 'smooth',
      });
    }
  };

  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <section ref={sectionRef} className="w-full py-12 sm:py-16 bg-[#f8faff] relative border-b border-[#e2eaf8] scroll-mt-6" id="dang-ky">
      <div id="dang-ky-tham-du" className="scroll-mt-14" />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c83271]/10 border border-[#c83271]/20 text-[#c83271] text-[11px] uppercase font-bold tracking-widest font-display mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{cmsData.eventDetails.registrationSectionTag || 'CỔNG ĐĂNG KÝ THAM DỰ CHÍNH THỨC'}</span>
          </div>
          <h2 className="text-[26px] sm:text-[34px] font-extrabold text-[#002045] font-display leading-tight tracking-tight">
            {cmsData.eventDetails.registrationSectionTitle || 'Đăng Ký Tham Dự Hội Thảo 2026'}
          </h2>
          <p className="mt-2 text-[13px] sm:text-[14.5px] text-slate-600 leading-relaxed">
            {cmsData.eventDetails.registrationSectionDescription || 'Hội thảo Khoa học Thẩm mỹ Việt – Hàn và chuỗi chương trình liên kết. Vui lòng điền thông tin để nhận thẻ đại biểu tham dự hội thảo.'}
          </p>
        </div>


        {!registeredBadge ? (
          /* FORM + SUMMARY GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-6">
              {fromMobileQr && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-bold text-[13px]">Đang mở từ Mã QR Di Động</p>
                      <p className="text-[11px] text-emerald-800">
                        Biểu mẫu đã được đồng bộ tối ưu cho điện thoại.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFromMobileQr(false)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 rounded-lg hover:bg-emerald-100 text-[11px] cursor-pointer shrink-0"
                  >
                    Đóng
                  </button>
                </div>
              )}

              {/* BƯỚC 1: NHÓM THAM DỰ */}
              <div className="rounded-2xl border border-[#e2eaf8] bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#002045] font-display flex items-center gap-2">
                    <span className="size-6 rounded-md bg-[#002045] text-white text-[12px] flex items-center justify-center font-mono">1</span>
                    <span>Nhóm tham dự</span>
                  </h3>
                  <span className="text-[11px] font-bold text-[#c83271] uppercase tracking-wider">
                    Bước 1 / 4
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 mb-3.5">
                  Vui lòng chọn nhóm phù hợp nhất với mục đích tham dự của bạn.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Bác sĩ option */}
                  <label
                    onClick={() => handleAttendeeTypeChange('doctor')}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 ${
                      formData.attendeeType === 'doctor'
                        ? 'border-[#c83271] bg-[#fff5f9] ring-1 ring-[#c83271] shadow-xs'
                        : 'border-[#e2eaf8] bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attendeeType"
                      value="doctor"
                      checked={formData.attendeeType === 'doctor'}
                      onChange={() => handleAttendeeTypeChange('doctor')}
                      className="sr-only"
                    />
                    <span
                      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        formData.attendeeType === 'doctor'
                          ? 'bg-[#c83271] text-white'
                          : 'bg-[#f0f4fc] text-[#002045]'
                      }`}
                    >
                      <Stethoscope className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="block text-[13.5px] font-extrabold text-[#002045]">
                        Bác sĩ &amp; Y tế
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-relaxed text-slate-500">
                        Bác sĩ PTTM, Da liễu, Chuyên gia y tế, Bác sĩ học viên
                      </span>
                    </div>
                  </label>

                  {/* Doanh nghiệp option */}
                  <label
                    onClick={() => handleAttendeeTypeChange('business')}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 ${
                      formData.attendeeType === 'business'
                        ? 'border-[#c83271] bg-[#fff5f9] ring-1 ring-[#c83271] shadow-xs'
                        : 'border-[#e2eaf8] bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attendeeType"
                      value="business"
                      checked={formData.attendeeType === 'business'}
                      onChange={() => handleAttendeeTypeChange('business')}
                      className="sr-only"
                    />
                    <span
                      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        formData.attendeeType === 'business'
                          ? 'bg-[#c83271] text-white'
                          : 'bg-[#f0f4fc] text-[#002045]'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="block text-[13.5px] font-extrabold text-[#002045]">
                        Doanh nghiệp &amp; Spa
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-relaxed text-slate-500">
                        Chủ cơ sở viện thẩm mỹ, Spa, NPP thiết bị &amp; dược mỹ phẩm
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* BƯỚC 2: THÔNG TIN CHI TIẾT */}
              <div className="rounded-2xl border border-[#e2eaf8] bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#002045] font-display flex items-center gap-2">
                    <span className="size-6 rounded-md bg-[#002045] text-white text-[12px] flex items-center justify-center font-mono">2</span>
                    <span>{formData.attendeeType === 'doctor' ? 'Thông Tin Bác Sĩ' : 'Thông Tin Doanh Nghiệp'}</span>
                  </h3>
                  <span className="text-[11px] font-bold text-[#c83271] uppercase tracking-wider">
                    Bước 2 / 4
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 mb-4">
                  Vui lòng cung cấp chính xác để chuẩn bị hồ sơ đại biểu và tài liệu hội thảo.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Doctor Fields */}
                  {formData.attendeeType === 'doctor' && (
                    <>
                      {/* Họ và Tên Bác sĩ (ĐẦU TIÊN) */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Họ và Tên Bác sĩ <span className="text-[#c83271]">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="Ví dụ: BS.CKII Nguyễn Văn An"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] focus:ring-1 focus:ring-[#c83271]/30 transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Số điện thoại / Zalo <span className="text-[#c83271]">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="090x xxx xxx"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] focus:ring-1 focus:ring-[#c83271]/30 transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Địa chỉ Email <span className="text-[#c83271]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="dai-bieu@email.com"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] focus:ring-1 focus:ring-[#c83271]/30 transition-all"
                        />
                      </div>

                      {/* Bệnh viện / Phòng khám */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Bệnh viện / Phòng khám <span className="text-[#c83271]">*</span>
                        </label>
                        <input
                          type="text"
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          required
                          placeholder="Khoa Phẫu thuật - BV..."
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        />
                      </div>

                      {/* Chức danh / Chức vụ */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Chức danh / Chức vụ
                        </label>
                        <input
                          type="text"
                          name="titleRole"
                          value={formData.titleRole}
                          onChange={handleInputChange}
                          placeholder="Bác sĩ chuyên khoa, Giảng viên..."
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        />
                      </div>

                      {/* Chuyên khoa */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">Chuyên khoa</label>
                        <select
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleInputChange}
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        >
                          <option value="">-- Chọn chuyên khoa --</option>
                          <option value="Tạo hình Thẩm mỹ">Tạo hình Thẩm mỹ</option>
                          <option value="Da liễu - Thẩm mỹ Da">Da liễu - Thẩm mỹ Da</option>
                          <option value="Y học Thẩm mỹ">Y học Thẩm mỹ &amp; Nội khoa</option>
                          <option value="Quản lý Y tế">Quản lý Bệnh viện / Phòng khám</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      {/* Số Giấy phép Hành nghề / Mã CME */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Số Giấy phép Hành nghề / Mã CME
                        </label>
                        <input
                          type="text"
                          name="license"
                          value={formData.license}
                          onChange={handleInputChange}
                          placeholder="Số CCHN y khoa"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        />
                      </div>

                      {/* Tỉnh / Thành phố */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">Tỉnh / Thành phố</label>
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        >
                          <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                          <option value="Cần Thơ">Cần Thơ</option>
                          <option value="Hải Phòng">Hải Phòng</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      {/* Quốc gia */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">Quốc gia</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Việt Nam"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        />
                      </div>

                      {/* CME Checkbox */}
                      <div className="md:col-span-2 pt-1">
                        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#c83271]/25 bg-[#fff5f9] cursor-pointer hover:bg-[#ffeef4] transition-colors">
                          <input
                            type="checkbox"
                            name="wantsCme"
                            checked={formData.wantsCme}
                            onChange={handleInputChange}
                            className="size-4 rounded accent-[#c83271] cursor-pointer mt-0.5 shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-[12.5px] font-bold text-[#002045]">
                              CME: 3h tín chỉ (Phí CME sẽ được thu tại Hội Thảo)
                            </span>
                            <span className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">
                              Chứng nhận đào tạo y khoa liên tục do Bệnh viện Trung ương Quân đội 108 cấp. Đại biểu xuất trình CCHN hoặc văn bằng chuyên môn theo quy chế tại bàn đón tiếp.
                            </span>
                          </div>
                        </label>
                      </div>
                    </>
                  )}

                  {/* Business Fields */}
                  {formData.attendeeType === 'business' && (
                    <>
                      {/* Họ và tên Người liên hệ (ĐẦU TIÊN) */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Họ và tên Người liên hệ <span className="text-[#c83271]">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="Ví dụ: Nguyễn Văn B"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] focus:ring-1 focus:ring-[#c83271]/30 transition-all"
                        />
                      </div>

                      {/* Tên Doanh nghiệp / Spa / Clinic */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Tên Doanh nghiệp / Spa / Clinic <span className="text-[#c83271]">*</span>
                        </label>
                        <input
                          type="text"
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          required
                          placeholder="Tên công ty hoặc phòng khám..."
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        />
                      </div>

                      {/* Chức vụ / Chức danh */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Chức vụ / Chức danh
                        </label>
                        <input
                          type="text"
                          name="titleRole"
                          value={formData.titleRole}
                          onChange={handleInputChange}
                          placeholder="Giám đốc, Quản lý..."
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Số điện thoại / Zalo <span className="text-[#c83271]">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="090x xxx xxx"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] focus:ring-1 focus:ring-[#c83271]/30 transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Địa chỉ Email <span className="text-[#c83271]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="dai-bieu@email.com"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] focus:ring-1 focus:ring-[#c83271]/30 transition-all"
                        />
                      </div>

                      {/* Ngành hàng / Lĩnh vực KD */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Ngành hàng / Lĩnh vực KD
                        </label>
                        <select
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleInputChange}
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        >
                          <option value="">-- Chọn lĩnh vực --</option>
                          <option value="Thiết bị thẩm mỹ">Thiết bị thẩm mỹ công nghệ cao</option>
                          <option value="Dược mỹ phẩm">Dược mỹ phẩm &amp; Tiêm</option>
                          <option value="Dịch vụ Spa/Clinic">Phòng khám / Thẩm mỹ viện</option>
                          <option value="Phân phối / Thương mại">Phân phối / Xuất nhập khẩu</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      {/* Mã số thuế / Giấy phép KD */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">
                          Mã số thuế / Giấy phép KD
                        </label>
                        <input
                          type="text"
                          name="license"
                          value={formData.license}
                          onChange={handleInputChange}
                          placeholder="Mã số thuế doanh nghiệp"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        />
                      </div>

                      {/* Tỉnh / Thành phố */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">Tỉnh / Thành phố</label>
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        >
                          <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                          <option value="Cần Thơ">Cần Thơ</option>
                          <option value="Hải Phòng">Hải Phòng</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      {/* Quốc gia */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-bold text-[#002045]">Quốc gia</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Việt Nam"
                          className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                        />
                      </div>
                    </>
                  )}

                  {/* Common: Note */}
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[12px] font-bold text-[#002045]">Ghi chú thêm</label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Ghi chú thêm hoặc câu hỏi gửi Ban tổ chức..."
                      className="h-11 sm:h-10 px-3.5 sm:px-3 rounded-xl border border-[#e2eaf8] bg-[#f8faff] text-[16px] sm:text-[13px] text-slate-800 focus:outline-none focus:border-[#c83271] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* BƯỚC 3: CHỦ ĐỀ QUAN TÂM */}
              <div className="rounded-2xl border border-[#e2eaf8] bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#002045] font-display flex items-center gap-2">
                    <span className="size-6 rounded-md bg-[#002045] text-white text-[12px] flex items-center justify-center font-mono">3</span>
                    <span>Chuyên Đề &amp; Mục Tiêu Quan Tâm</span>
                  </h3>
                  <span className="text-[11px] font-bold text-[#c83271] uppercase tracking-wider">
                    Bước 3 / 4
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 mb-3.5">
                  Giúp Ban Tổ Chức điều phối tài liệu và kết nối đối tác phù hợp nhất.
                </p>

                <div className="space-y-3.5">
                  {/* Interests */}
                  <div>
                    <span className="text-[12px] font-bold text-[#002045] block mb-2">
                      Lĩnh vực quan tâm:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(formData.attendeeType === 'doctor' ? DOCTOR_INTERESTS : BUSINESS_INTERESTS).map(
                        (item) => {
                          const checked = formData.interests.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleInterest(item)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11.5px] border font-medium transition-all cursor-pointer ${
                                checked
                                  ? 'bg-[#002045] text-white border-[#002045] shadow-2xs'
                                  : 'bg-[#f8faff] text-slate-600 border-[#e2eaf8] hover:border-slate-300'
                              }`}
                            >
                              {item}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Goals */}
                  <div>
                    <span className="text-[12px] font-bold text-[#002045] block mb-2">
                      Mục tiêu tham dự:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(formData.attendeeType === 'doctor' ? DOCTOR_GOALS : BUSINESS_GOALS).map(
                        (item) => {
                          const checked = formData.goals.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleGoal(item)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11.5px] border font-medium transition-all cursor-pointer ${
                                checked
                                  ? 'bg-[#c83271] text-white border-[#c83271] shadow-2xs'
                                  : 'bg-[#f8faff] text-slate-600 border-[#e2eaf8] hover:border-slate-300'
                              }`}
                            >
                              {item}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BƯỚC 4: CHÍNH SÁCH & ĐỒNG Ý */}
              <div className="rounded-2xl border border-[#e2eaf8] bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#002045] font-display flex items-center gap-2">
                    <span className="size-6 rounded-md bg-[#002045] text-white text-[12px] flex items-center justify-center font-mono">4</span>
                    <span>Chính Sách &amp; Xác Nhận</span>
                  </h3>
                  <span className="text-[11px] font-bold text-[#c83271] uppercase tracking-wider">
                    Bước 4 / 4
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 mb-3.5">
                  Vui lòng xác nhận các điều khoản để hoàn tất gửi biểu mẫu.
                </p>

                <div className="space-y-2.5 mb-4 text-[12px] text-slate-600">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentPrivacy"
                      checked={formData.consentPrivacy}
                      onChange={handleInputChange}
                      required
                      className="mt-0.5 size-4 rounded accent-[#c83271]"
                    />
                    <span>
                      Tôi đã đọc và đồng ý với{' '}
                      <strong className="text-[#002045]">Chính sách bảo mật và Quy chế sự kiện</strong>. <span className="text-[#c83271]">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentData"
                      checked={formData.consentData}
                      onChange={handleInputChange}
                      required
                      className="mt-0.5 size-4 rounded accent-[#c83271]"
                    />
                    <span>
                      {formData.attendeeType === 'doctor'
                        ? 'Tôi đồng ý cho phép sử dụng thông tin cá nhân để đăng ký đại biểu và cấp CME.'
                        : 'Tôi đồng ý cho phép sử dụng thông tin doanh nghiệp cho việc kết nối và tài trợ.'}{' '}
                      <span className="text-[#c83271]">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentNews"
                      checked={formData.consentNews}
                      onChange={handleInputChange}
                      className="mt-0.5 size-4 rounded accent-[#c83271]"
                    />
                    <span>Tôi muốn nhận cập nhật kỷ yếu khoa học và tài liệu đào tạo thẩm mỹ mới nhất.</span>
                  </label>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#002045] via-[#174ea6] to-[#c83271] text-white font-bold text-[14px] sm:text-[15px] shadow-md hover:shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-display"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tiếp nhận thông tin...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Xác Nhận &amp; Nhận Thẻ Đại Biểu</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* ASIDE / SIDEBAR SUMMARY */}
            <aside className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20">
              {/* Summary Card */}
              <div className="rounded-2xl border border-[#e2eaf8] bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2eaf8] mb-3">
                  <h4 className="text-[14px] font-bold text-[#002045] font-display">Tóm Tắt Đăng Ký</h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#002045]/10 text-[#002045] uppercase">
                    {formData.attendeeType === 'doctor' ? 'Bác sĩ' : 'Doanh nghiệp'}
                  </span>
                </div>

                <div className="space-y-3 text-[12px]">
                  <div>
                    <span className="text-slate-500 text-[11px] block mb-1 font-medium">
                      Sự kiện tham dự:
                    </span>
                    <div className="p-2.5 rounded-xl bg-[#f0f6ff] border border-[#d0e1fd] text-[#002045]">
                      <p className="font-bold text-[12.5px] leading-tight text-[#002045]">
                        Hội nghị Khoa học Thẩm mỹ Việt – Hàn 2026
                      </p>
                      <p className="text-[#c83271] font-semibold text-[11px] mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>17–18/10/2026 • 2 Ngày Toàn Thể</span>
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Bệnh viện Trung ương Quân đội 108, Hà Nội</span>
                      </p>
                    </div>
                  </div>

                  {formData.attendeeType === 'doctor' && (
                    <div className="p-2.5 rounded-lg bg-[#fff5f9] border border-[#f8d0e0] flex items-center justify-between">
                      <span className="font-medium text-[#002045]">CME (3h tín chỉ):</span>
                      <span className={`font-bold text-[12px] ${formData.wantsCme ? 'text-[#c83271]' : 'text-slate-400'}`}>
                        {formData.wantsCme ? 'Có đăng ký (Thu phí tại Hội Thảo)' : 'Không'}
                      </span>
                    </div>
                  )}

                  {/* Seat availability status */}
                  <div className="pt-2 border-t border-[#e2eaf8]">
                    <div className="flex justify-between text-[11.5px] text-slate-600 mb-1">
                      <span>Suất đại biểu còn lại:</span>
                      <span className="font-bold text-[#c83271]">
                        {remainingSeats} / {totalSeats}
                      </span>
                    </div>
                    <div className="w-full bg-[#f0f4fc] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#002045] via-[#174ea6] to-[#c83271] h-full rounded-full transition-all duration-500"
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="rounded-2xl border border-[#d0e1fd] bg-[#f0f6ff] p-4 shadow-xs text-[12px]">
                <h4 className="text-[13px] font-bold text-[#002045] font-display flex items-center gap-1.5 mb-1">
                  <HelpCircle className="w-4 h-4 text-[#c83271]" />
                  <span>Ban Thư Ký Hỗ Trợ</span>
                </h4>
                <p className="text-slate-600 text-[11.5px] leading-relaxed">
                  Hotline / Zalo: <span className="font-bold text-[#002045]">+82-10-4159-8777</span><br />
                  Email: <span className="font-semibold text-[#c83271]">secretary@kbitassociation.com</span>
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-5 animate-fade-in scroll-mt-20" id="attendee-ticket">
            {/* SUCCESS VIEW & E-BADGE */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs sm:text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-[14px]">Đăng ký tham dự thành công!</p>
                <p className="text-[12px] text-emerald-800 mt-0.5">Thẻ đại biểu của quý khách đã được tạo thành công bên dưới.</p>
              </div>
            </div>

            {/* AUTOMATED EMAIL CONFIRMATION STATUS BANNER */}
            {emailSendingStatus.status === 'sending' && (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-blue-900 text-xs">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <p className="font-medium">
                  Đang tự động gửi thư xác nhận và mã thẻ về hòm thư <span className="font-bold underline">{registeredBadge.email}</span>...
                </p>
              </div>
            )}

            {emailSendingStatus.status === 'sent' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300 flex items-center justify-between gap-3 text-emerald-900 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-bold text-[12.5px] text-emerald-900">Đã gửi email xác nhận &amp; thẻ đại biểu thành công!</p>
                    <p className="text-[11.5px] text-emerald-700 mt-0.5">
                      Thư xác nhận chi tiết đã được chuyển tới <span className="font-bold underline">{registeredBadge.email}</span>. Vui lòng kiểm tra hộp thư đến (hoặc thư rác / spam).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors shrink-0 cursor-pointer"
                >
                  Gửi lại
                </button>
              </div>
            )}

            {emailSendingStatus.status === 'failed' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-amber-900 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-bold text-[12.5px] text-amber-900">Chưa thể gửi email tự động tới {registeredBadge.email}</p>
                    <p className="text-[11.5px] text-amber-700 mt-0.5">{emailSendingStatus.message || 'Quý khách vẫn có thể lưu thẻ hoặc nhấn thử gửi lại.'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-300 transition-colors shrink-0 cursor-pointer"
                >
                  Thử gửi lại
                </button>
              </div>
            )}

            {/* PROMINENT POSTER CREATOR CALLOUT */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#002045] via-[#102a54] to-[#c83271] text-white border border-purple-400/30 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-white/20 backdrop-blur-md text-pink-200 flex items-center justify-center shadow-inner shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-pink-300">
                    Đặc Quyền Dành Cho Đại Biểu
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                    Tạo Poster Thư Mời Chính Thức Của Bạn
                  </h4>
                  <p className="text-[11.5px] text-pink-100/90 mt-0.5">
                    Tải ảnh chân dung của bạn lên để tạo poster chuẩn HD sẵn sàng chia sẻ lên Facebook &amp; Zalo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openPosterModal(registeredBadge)}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#c83271] to-pink-600 hover:from-[#b02260] hover:to-pink-700 text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tạo Poster Ngay</span>
              </button>
            </div>

            {/* E-Badge Pass */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#002045] via-[#1a365d] to-[#c83271] text-white shadow-xl relative overflow-hidden border border-white/20">
              <div className="flex items-center justify-between pb-3.5 border-b border-white/15">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#ffb0cd] font-display">
                    VIỆT – HÀN 2026 • THẺ ĐẠI BIỂU
                  </span>
                  <h3 className="text-[17px] sm:text-[19px] font-extrabold font-display text-white mt-0.5">
                    Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md text-[11px] font-bold text-white font-mono">
                  {registeredBadge.wantsCme ? 'CME 3H TÍN CHỈ' : 'KHÁCH MỜI'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 py-5 items-center">
                <div className="sm:col-span-8 flex flex-col gap-2.5">
                  <div>
                    <span className="text-[10px] uppercase text-white/60 font-medium">Đại biểu:</span>
                    <h2 className="text-[19px] sm:text-[22px] font-bold text-white font-display">
                      {registeredBadge.fullName}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div>
                      <span className="text-white/60 block text-[10px] uppercase">Vị trí</span>
                      <span className="font-semibold text-white/95">{registeredBadge.degree}</span>
                    </div>
                    <div>
                      <span className="text-white/60 block text-[10px] uppercase">Số điện thoại</span>
                      <span className="font-mono font-bold text-[#ffb0cd]">{registeredBadge.phone}</span>
                    </div>
                  </div>
                  <div className="text-[12px]">
                    <span className="text-white/60 block text-[10px] uppercase">Đơn vị</span>
                    <span className="font-medium text-white/90 truncate block">{registeredBadge.institution}</span>
                  </div>
                </div>

                <div className="sm:col-span-4 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center shadow-inner">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-2 text-[#ffb0cd]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white/70 uppercase tracking-wider font-medium">Mã Đại Biểu</span>
                  <span className="text-[18px] sm:text-[20px] text-white font-mono font-bold mt-0.5 tracking-wide">
                    {registeredBadge.registrationCode}
                  </span>
                  <span className="text-[9px] text-emerald-300 font-medium uppercase mt-1">Đã Xác Nhận Hợp Lệ</span>
                </div>
              </div>

              {registeredBadge.wantsCme && (
                <div className="mb-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[11px] text-pink-100 flex items-center gap-2">
                  <span className="font-bold">CME: 3h tín chỉ:</span>
                  <span>Chứng chỉ CME sẽ được cấp theo quy định tại Bệnh viện TWQĐ 108.</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-white/70">
                <span>Cấp lúc: {registeredBadge.registeredAt}</span>
                <span>BV Trung ương Quân đội 108, Hà Nội</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
              <button
                onClick={handlePrintBadge}
                className="px-4 py-2.5 rounded-xl bg-[#002045] text-white text-[12.5px] font-bold hover:bg-[#1a365d] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>In Thẻ / Lưu PDF</span>
              </button>

              <button
                type="button"
                onClick={() => openPosterModal(registeredBadge)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-[#c83271] text-white text-[12.5px] font-bold hover:from-purple-800 hover:to-[#b02260] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Camera className="w-4 h-4" />
                <span>Tạo Poster Thư Mời (FB / Zalo)</span>
              </button>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={emailSendingStatus.status === 'sending'}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#e2eaf8] text-slate-700 hover:text-[#002045] text-[12.5px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {emailSendingStatus.status === 'sending' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c83271]" />
                ) : (
                  <Mail className="w-3.5 h-3.5 text-[#c83271]" />
                )}
                <span>Gửi lại email xác nhận</span>
              </button>

              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                  'Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026'
                )}&dates=20261017T010000Z/20261018T100000Z&details=${encodeURIComponent(
                  `Mã thẻ đại biểu: ${registeredBadge.registrationCode} - Địa điểm: Bệnh viện Trung ương Quân đội 108, Hà Nội`
                )}&location=${encodeURIComponent('Bệnh viện Trung ương Quân đội 108, Số 1 Trần Hưng Đạo, P. Bạch Đằng, Q. Hai Bà Trưng, Hà Nội')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#f0f6ff] text-[#174ea6] border border-[#d0e1fd] text-[12.5px] font-bold hover:bg-[#e4eeff] transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4 text-[#c83271]" />
                <span>Thêm vào Google Calendar</span>
              </a>

              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#e2eaf8] text-slate-700 hover:text-[#002045] text-[12.5px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đăng ký đại biểu khác</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
