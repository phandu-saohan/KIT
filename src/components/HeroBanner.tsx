import React from 'react';
import { useCMS } from '../context/CMSContext';

export const HeroBanner: React.FC = () => {
  const { cmsData } = useCMS();

  const bgImage = cmsData.eventDetails.bannerImageUrl || '/BG.png';

  const ksapsPartner = cmsData.partners.find((p) => p.id === 'ksaps');
  const vsapsPartner = cmsData.partners.find((p) => p.id === 'vsaps');
  const bv108Partner = cmsData.partners.find((p) => p.id === 'bv108') || cmsData.partners.find((p) => p.id === 'bv175');

  const ksapsLogo = cmsData.eventDetails.heroKsapsLogoUrl || ksapsPartner?.logoUrl;
  const vsapsLogo = cmsData.eventDetails.heroVsapsLogoUrl || vsapsPartner?.logoUrl;
  const bv108Logo = cmsData.eventDetails.heroBv108LogoUrl || bv108Partner?.logoUrl || cmsData.eventDetails.heroBv175LogoUrl;

  return (
    <section
      id="hero-banner"
      className="relative w-full min-h-0 sm:min-h-screen flex flex-col justify-start sm:justify-between bg-cover bg-center sm:bg-bottom bg-no-repeat overflow-hidden transition-all duration-300"
      style={{
        backgroundImage: `url('${bgImage}')`,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >



      {/* Delicate gradient overlay ensuring maximum visibility of hospital, skyline, and face while keeping text crisp */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-white/50 pointer-events-none" />

      {/* Subtle soft center spotlight glow for typography readability */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] h-[550px] bg-white/45 rounded-full blur-3xl pointer-events-none" />

      {/* Inner Full Screen Content Wrapper */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-8 pt-7 pb-12 sm:py-10 flex flex-col justify-start sm:justify-between flex-1 gap-4 sm:gap-0">
        {/* TOP: Header Sponsors & Hosts - Designed neatly for mobile & desktop */}
        <header className="flex flex-col md:flex-row justify-between items-center md:items-start text-[11px] font-bold tracking-[0.5px] uppercase text-[#7a869a] gap-2 sm:gap-4 md:gap-0">

          {/* Left Sponsor Group (Desktop) */}
          <div className="hidden md:flex flex-col gap-2 items-start text-left">
            <span className="tracking-wider text-[#5f6d82]">ĐỒNG TỔ CHỨC | CO-ORGANIZERS</span>
            <div className="flex items-center gap-2.5 h-7">
              <span className="text-[13px] font-extrabold text-[#2b3a4a] px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md shadow-xs border border-white/80">
                {cmsData.eventDetails.coOrganizersText || 'BV 108 • KHIDI • SNUBH • KBIT'}
              </span>
            </div>
          </div>

          {/* Center Host Group (KSAPS, VSAPS, BV 108 - Connected to CMS) */}
          <div className="flex flex-col gap-1.5 sm:gap-2.5 items-center text-center w-full md:w-auto">
            <span className="tracking-wider text-[#5f6d82] text-[10px] sm:text-[11px] font-bold">
              CHỦ TRÌ &amp; ĐĂNG CAI | HOST ORGANIZATIONS
            </span>
            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full overflow-x-auto no-scrollbar py-0.5">
              {/* Logo 1: KSAPS */}
              <div
                className="h-11 sm:h-13 w-20 sm:w-26 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/90 flex items-center justify-center p-0.5 sm:p-1 overflow-hidden"
              >
                {ksapsLogo ? (
                  <img
                    src={ksapsLogo}
                    alt="KSAPS Logo"
                    className="w-full h-full object-contain max-h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-1">
                    <span className="text-xs sm:text-sm font-black text-[#174ea6] tracking-tight">KSAPS</span>
                  </div>
                )}
              </div>

              {/* Logo 2: VSAPS */}
              <div
                className="h-11 sm:h-13 w-20 sm:w-26 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/90 flex items-center justify-center p-0.5 sm:p-1 overflow-hidden"
              >
                {vsapsLogo ? (
                  <img
                    src={vsapsLogo}
                    alt="VSAPS Logo"
                    className="w-full h-full object-contain max-h-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-pink-50 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-[#c83271] tracking-tight">VSAPS</span>
                  </div>
                )}
              </div>

              {/* Logo 3: BV 108 */}
              <div
                className="h-11 sm:h-13 w-20 sm:w-26 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/90 flex items-center justify-center p-0.5 sm:p-1 overflow-hidden"
              >
                {bv108Logo ? (
                  <img
                    src={bv108Logo}
                    alt="BV 108 Logo"
                    className="w-full h-full object-contain max-h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-1">
                    <span className="text-xs sm:text-sm font-black text-[#991b1b] tracking-tight">BV 108</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Patronize Group (Desktop) */}
          <div className="hidden md:flex flex-col gap-2 items-end text-right">
            <span className="tracking-wider text-[#5f6d82]">BẢO TRỢ | PATRONIZE</span>
            <div className="flex items-center gap-2.5 h-7">
              <span className="text-[12px] font-extrabold text-[#2b3a4a] px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md shadow-xs border border-white/80">
                {cmsData.eventDetails.patronizeText || 'BỘ Y TẾ & PHÚC LỢI HÀN QUỐC'}
              </span>
            </div>
          </div>
        </header>

        {/* CENTER: Main Heading & Subtitles */}
        <div className="text-center my-1 sm:my-8 lg:my-9 pt-0 pb-0">
          <h1 className="font-[900] uppercase text-[#174ea6] tracking-tight drop-shadow-2xs flex flex-col items-center gap-1 sm:gap-2">
            <span className="text-[21px] xs:text-[24px] sm:text-[30px] md:text-[36px] lg:text-[42px] font-[800] leading-tight text-[#174ea6] tracking-normal">
              {cmsData.eventDetails.heroHeadingLine1 || 'HỘI THẢO KHOA HỌC THẨM MỸ'}
            </span>
            <span className="text-[26px] xs:text-[30px] sm:text-[38px] md:text-[46px] lg:text-[52px] font-[900] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#174ea6] via-[#1a56b2] to-[#c83271] tracking-tight">
              {cmsData.eventDetails.heroHeadingLine2 || 'VIỆT - HÀN 2026'}
            </span>
          </h1>

          {/* Subtitle */}
          <div className="text-[13.5px] sm:text-[18px] md:text-[20px] font-[600] text-[#202124] mt-1.5 sm:mt-4 tracking-tight max-w-2xl mx-auto px-2 leading-snug">
            {cmsData.eventDetails.subtitle || 'Tiên phong Công nghệ và Giải pháp Thẩm mỹ Hàn Quốc'}
          </div>
        </div>

        {/* 3 Blocks in 1 Row (Refined for Mobile Touch & Ergonomics) */}
        <div className="w-full max-w-[980px] mx-auto mt-1 sm:mt-6 mb-3 sm:mb-auto pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 lg:gap-3.5">
            {/* Block 1: Đăng ký tham dự (High-contrast CTA on mobile) */}
            <a
              href="#dang-ky-tham-du"
              className="group relative flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl bg-gradient-to-r from-[#c83271] via-[#b4136d] to-[#174ea6] text-white shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-200 overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-white/30 transition-colors">
                <span className="material-symbols-outlined text-[22px] text-white">how_to_reg</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-100">Cổng tiếp nhận</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/25 text-white">
                    {cmsData.eventDetails.totalSeats || 250} Ghế
                  </span>
                </div>
                <div className="text-[14px] sm:text-[15px] font-[800] text-white leading-tight mt-1 truncate">
                  Đăng ký tham dự
                </div>
                <div className="text-[11px] text-pink-100/90 truncate mt-0.5 font-medium">
                  Nhận E-Badge &amp; Giữ chỗ miễn phí
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-white/90 group-hover:translate-x-1 transition-transform shrink-0">
                arrow_forward
              </span>
            </a>

            {/* Block 2: Ngày tổ chức */}
            <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/80 hover:border-blue-300/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#174ea6] flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[22px]">calendar_month</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a869a] block leading-none">
                  Ngày tổ chức
                </span>
                <div className="text-[14px] sm:text-[15px] font-[800] text-[#174ea6] leading-tight mt-1">
                  {cmsData.eventDetails.dateString || '03 / 10 / 2026'}
                </div>
                <div className="text-[11px] font-medium text-[#5f6d82] truncate mt-0.5">
                  {cmsData.eventDetails.timeDetail || '13:00 – 17:00 (Thứ Bảy)'}
                </div>
              </div>
            </div>

            {/* Block 3: Địa điểm tổ chức */}
            <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/80 hover:border-rose-300/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#fdf2f4] text-[#c83271] flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[22px]">location_on</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a869a] block leading-none">
                  Địa điểm tổ chức
                </span>
                <div className="text-[14px] sm:text-[15px] font-[800] text-[#202124] leading-tight mt-1 truncate">
                  {cmsData.eventDetails.venueShort || 'Bệnh viện Quân Y 175'}
                </div>
                <div className="text-[11px] font-medium text-[#5f6d82] truncate mt-0.5" title={cmsData.eventDetails.venueAddress}>
                  {cmsData.eventDetails.venueAddress || '786 Nguyễn Kiệm, Gò Vấp, TP.HCM'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
