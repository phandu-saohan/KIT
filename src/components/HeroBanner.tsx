import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const HeroBanner: React.FC = () => {
  const { cmsData } = useCMS();

  return (
    <section
      id="hero-banner"
      className="relative w-full min-h-[460px] md:min-h-[500px] lg:min-h-[540px] flex items-center bg-white bg-no-repeat overflow-hidden border-b border-slate-200/60"
      style={{
        backgroundImage: "url('/images/hero-building-right.png'), url('/images/hero-hospital.jpg')",
        backgroundPosition: 'right center, right center',
        backgroundSize: 'contain, cover',
        fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Soft left-to-right white wash gradient overlay ensuring pristine contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, #ffffff 0%, #ffffff 40%, rgba(255,255,255,0.95) 52%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-14 py-6 sm:py-8 lg:py-10 flex flex-col justify-between h-full">
        {/* TOP: Two Host Logos (VSAPS & KSAPS) */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Logo 1: VSAPS Circular Badge */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-2xs border border-slate-100 bg-white flex items-center justify-center">
            <img
              src="/images/partners/vsaps-circle.png"
              alt="Hội Phẫu thuật Tạo hình Thẩm mỹ Việt Nam (VSAPS)"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Logo 2: KSAPS Circular Badge */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-2xs border border-slate-100 bg-white flex items-center justify-center">
            <img
              src="/images/partners/ksaps-circle.png"
              alt="Hội Phẫu thuật Tạo hình Thẩm mỹ Hàn Quốc (KSAPS)"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* CENTER: Typography Matching 100% of the User Banner */}
        <div className="max-w-2xl lg:max-w-3xl">
          <h1 className="text-[32px] xs:text-[38px] sm:text-[46px] md:text-[52px] lg:text-[56px] font-black uppercase tracking-tight leading-[1.08] font-display">
            <span className="block text-[#d7417b]">HỘI NGHỊ</span>
            <span className="block text-[#d7417b]">KHOA HỌC THẨM MỸ</span>
            <span className="block text-[#d7417b]">
              VIỆT - HÀN <span className="text-[#8b46c2]">2026</span>
            </span>
          </h1>

          <p className="text-[15px] sm:text-[17px] lg:text-[18px] text-slate-600 font-semibold mt-2.5 sm:mt-3 mb-5 sm:mb-6">
            Bệnh viện Trung ương Quân đội 108, Hà Nội
          </p>

          {/* ACTION BUTTONS: Register & Date Pill */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* CTA 1: Đăng ký tham dự (Crimson/Pink Pill with 'Miễn phí' badge) */}
            <a
              href="#dang-ky-tham-du"
              className="inline-flex items-center gap-3 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#d53774] hover:bg-[#c02663] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer group"
            >
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9.5px] sm:text-[10px] font-semibold text-pink-100 uppercase tracking-wider">
                  Miễn phí
                </span>
                <span className="text-[14px] sm:text-[15.5px] font-black text-white mt-0.5 tracking-tight">
                  Đăng ký tham dự
                </span>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </a>

            {/* CTA 2: Ngày tổ chức Date Pill */}
            <div className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white border-2 border-[#d53774] text-[#d53774] shadow-xs">
              <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#d53774] shrink-0" />
              <span className="text-[14px] sm:text-[15.5px] font-black tracking-tight">
                17-18/10/2026
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM: Sponsors & Co-Organizers Logos matching 100% of User Banner */}
        <div className="flex flex-wrap items-end gap-6 sm:gap-8 pt-2 sm:pt-4 border-t border-slate-100/80">
          {/* Column 1: Bảo trợ (MOHW Korea) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] sm:text-[12px] font-medium text-slate-500">
              Bảo trợ
            </span>
            <div className="flex items-center h-7 sm:h-8">
              <img
                src="/images/partners/mohw.png"
                alt="Bộ Y tế & Phúc lợi Hàn Quốc (보건복지부)"
                className="h-full object-contain"
              />
            </div>
          </div>

          {/* Column 2: Đơn vị tổ chức (KHIDI, BV 108, SNUBH, KBIT) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] sm:text-[12px] font-medium text-slate-500">
              Đơn vị tổ chức
            </span>
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 h-7 sm:h-8">
              {/* KHIDI */}
              <img
                src="/images/partners/khidi.png"
                alt="Viện KHIDI Hàn Quốc"
                className="h-full object-contain max-w-[70px] sm:max-w-[85px]"
              />

              {/* BV 108 */}
              <img
                src="/images/partners/bv108.png"
                alt="Bệnh viện Trung ương Quân đội 108"
                className="h-full object-contain max-w-[30px] sm:max-w-[36px]"
              />

              {/* SNUBH */}
              <img
                src="/images/partners/snubh.png"
                alt="Bệnh viện Bundang ĐHQG Seoul (SNUBH)"
                className="h-full object-contain max-w-[75px] sm:max-w-[90px]"
              />

              {/* KBIT */}
              <img
                src="/images/partners/kbit.png"
                alt="Hiệp hội KBIT"
                className="h-full object-contain max-w-[65px] sm:max-w-[80px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
