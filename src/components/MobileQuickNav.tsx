import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  BookOpen,
  Headphones,
  PhoneCall,
  MessageCircle,
  Mail,
  MapPin,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const MobileQuickNav: React.FC = () => {
  const { openPosterModal } = useCMS();
  const [activeTab, setActiveTab] = useState<'dang-ky' | 'noi-dung' | 'ho-tro' | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 280;

      const regEl = document.getElementById('dang-ky') || document.getElementById('dang-ky-tham-du');
      const agendaEl = document.getElementById('chuong-trinh') || document.getElementById('diem-nhan');

      if (regEl) {
        const top = regEl.offsetTop;
        const height = regEl.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          setActiveTab('dang-ky');
          return;
        }
      }

      if (agendaEl) {
        const top = agendaEl.offsetTop;
        const height = agendaEl.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          setActiveTab('noi-dung');
          return;
        }
      }

      setActiveTab(null);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsSupportOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 20;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {/* =========================================================================
          BOTTOM NAVIGATION BAR (3 TABS: ĐĂNG KÝ, NỘI DUNG, HỖ TRỢ 24/7)
          Visible on mobile and small screens (<768px)
         ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-[#e2eaf8] shadow-[0_-4px_25px_rgba(0,32,69,0.12)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-all duration-300"
      >
        <div className="grid grid-cols-4 items-center px-2 py-1 gap-1 max-w-md mx-auto">
          {/* TAB 1: ĐĂNG KÝ */}
          <button
            type="button"
            onClick={() => scrollToSection('dang-ky')}
            className={`group flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'dang-ky' && !isSupportOpen
                ? 'text-[#c83271]'
                : 'text-slate-600 hover:text-[#002045]'
            }`}
          >
            {activeTab === 'dang-ky' && !isSupportOpen && (
              <span className="absolute -top-1 w-8 h-1 rounded-full bg-gradient-to-r from-[#002045] to-[#c83271]" />
            )}
            <div
              className={`p-1 rounded-xl transition-transform ${
                activeTab === 'dang-ky' && !isSupportOpen
                  ? 'bg-[#fff0f5] scale-105'
                  : 'group-hover:scale-105'
              }`}
            >
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span
              className={`text-[10.5px] leading-tight mt-0.5 tracking-tight ${
                activeTab === 'dang-ky' && !isSupportOpen
                  ? 'font-bold text-[#c83271]'
                  : 'font-semibold'
              }`}
            >
              Đăng ký
            </span>
          </button>

          {/* TAB 2: NỘI DUNG */}
          <button
            type="button"
            onClick={() => scrollToSection('chuong-trinh')}
            className={`group flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'noi-dung' && !isSupportOpen
                ? 'text-[#174ea6]'
                : 'text-slate-600 hover:text-[#002045]'
            }`}
          >
            {activeTab === 'noi-dung' && !isSupportOpen && (
              <span className="absolute -top-1 w-8 h-1 rounded-full bg-[#174ea6]" />
            )}
            <div
              className={`p-1 rounded-xl transition-transform ${
                activeTab === 'noi-dung' && !isSupportOpen
                  ? 'bg-[#eff4ff] scale-105'
                  : 'group-hover:scale-105'
              }`}
            >
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span
              className={`text-[10.5px] leading-tight mt-0.5 tracking-tight ${
                activeTab === 'noi-dung' && !isSupportOpen
                  ? 'font-bold text-[#174ea6]'
                  : 'font-semibold'
              }`}
            >
              Nội dung
            </span>
          </button>

          {/* TAB 3: TẠO POSTER */}
          <button
            type="button"
            onClick={() => openPosterModal()}
            className="group flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative text-purple-700 hover:text-purple-900"
          >
            <div className="p-1 rounded-xl group-hover:scale-105 transition-transform bg-gradient-to-tr from-purple-100 to-pink-100 text-[#c83271]">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10.5px] leading-tight mt-0.5 tracking-tight font-black text-[#c83271]">
              Tạo Poster
            </span>
          </button>

          {/* TAB 4: HỖ TRỢ 24/7 */}
          <button
            type="button"
            onClick={() => setIsSupportOpen((prev) => !prev)}
            className={`group flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
              isSupportOpen
                ? 'text-[#002045]'
                : 'text-slate-600 hover:text-[#002045]'
            }`}
          >
            {isSupportOpen && (
              <span className="absolute -top-1 w-8 h-1 rounded-full bg-[#002045]" />
            )}
            <div className="relative p-1 rounded-xl group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5 stroke-[2.2]" />
              {/* Online pulse indicator */}
              <span className="absolute top-1 right-1 flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
            </div>
            <span
              className={`text-[11px] leading-tight mt-0.5 tracking-tight flex items-center gap-1 ${
                isSupportOpen ? 'font-bold text-[#002045]' : 'font-semibold'
              }`}
            >
              <span>Hỗ trợ 24/7</span>
            </span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          SUPPORT 24/7 BOTTOM SHEET (SLIDE-UP MODAL ON MOBILE)
         ========================================================================= */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex flex-col justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSupportOpen(false)}
          />

          {/* Bottom Sheet Modal Content */}
          <div className="relative z-10 w-full bg-white rounded-t-3xl border-t border-[#e2eaf8] shadow-2xl p-5 max-h-[85vh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-in slide-in-from-bottom duration-300">
            {/* Drag Handle Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3.5" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e2eaf8] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#002045] to-[#c83271] text-white flex items-center justify-center shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#002045] font-display">
                    Hỗ Trợ Đại Biểu 24/7
                  </h3>
                  <p className="text-[11.5px] text-slate-500 font-medium">
                    Ban Thư ký Hội thảo &amp; Đội ngũ KBIT
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSupportOpen(false)}
                className="size-8 rounded-full bg-[#f0f4fc] text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[12px] text-slate-600 mb-3.5 leading-relaxed">
              Quý Bác sĩ và Doanh nghiệp cần tư vấn thủ tục đăng ký, cấp chứng chỉ CME hoặc kết nối tài trợ, vui lòng liên hệ qua các kênh dưới đây:
            </p>

            {/* Quick Action List */}
            <div className="space-y-2.5">
              {/* Option 1: Hotline Direct Call */}
              <a
                href="tel:+821041598777"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#002045] to-[#174ea6] text-white shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-pink-200 tracking-wider block">
                      Hotline Trực Tiếp (24/7)
                    </span>
                    <span className="text-[15px] font-black tracking-wide block">
                      +82-10-4159-8777
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white/20 text-[11px] font-bold text-white">
                  Gọi ngay
                </span>
              </a>

              {/* Option 2: Zalo Chat */}
              <a
                href="https://zalo.me/0903000108"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0068ff]/10 border border-[#0068ff]/25 text-[#0052cc] hover:bg-[#0068ff]/15 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#0068ff] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-[14px]">
                    Zalo
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#0052cc] tracking-wider block">
                      Tư vấn qua Zalo
                    </span>
                    <span className="text-[13.5px] font-extrabold text-[#002045] block">
                      Chat với Ban Thư Ký
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>

              {/* Option 3: Email */}
              <a
                href="mailto:secretary@kbitassociation.com"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8faff] border border-[#e2eaf8] text-slate-700 hover:bg-[#eff4ff] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#c83271]/10 text-[#c83271] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Hộp thư điện tử
                    </span>
                    <span className="text-[13px] font-bold text-[#002045] block">
                      secretary@kbitassociation.com
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>

              {/* Option 4: Venue Directions */}
              <button
                type="button"
                onClick={() => scrollToSection('dia-diem')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#f8faff] border border-[#e2eaf8] text-slate-700 hover:bg-[#eff4ff] active:scale-[0.98] transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#174ea6]/10 text-[#174ea6] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Địa điểm tổ chức
                    </span>
                    <span className="text-[13px] font-bold text-[#002045] block">
                      Bệnh viện Trung ương Quân đội 108, Hà Nội
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#174ea6] px-2 py-0.5 rounded bg-[#174ea6]/10">
                  Xem bản đồ
                </span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsSupportOpen(false)}
              className="mt-4 w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};
