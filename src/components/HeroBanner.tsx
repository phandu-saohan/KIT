import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const HeroBanner: React.FC = () => {
  const { cmsData } = useCMS();
  const event = cmsData.eventDetails;

  const heading1 = event.heroHeadingLine1 || 'HỘI NGHỊ';
  const heading2 = event.heroHeadingLine2 || 'KHOA HỌC THẨM MỸ';
  const heading3 = event.heroHeadingLine3 || 'VIỆT - HÀN';
  const headingYear = event.heroHeadingYear || '2026';
  const venueText = event.heroVenueText || event.venueName || 'Bệnh viện Trung ương Quân đội 108, Hà Nội';
  const ctaTag = event.heroCtaTag || 'Miễn phí';
  const ctaText = event.heroCtaText || 'Đăng ký tham dự';
  const ctaLink = event.heroCtaLink || '#dang-ky-tham-du';
  const dateText = event.heroDateText || event.dateString || '17-18/10/2026';

  const vsapsLogo = event.heroVsapsLogoUrl || '/images/partners/vsaps-circle.png';
  const ksapsLogo = event.heroKsapsLogoUrl || '/images/partners/ksaps-circle.png';

  const patronLabel = event.heroPatronLabel || 'Bảo trợ';
  const patronLogo = event.heroPatronLogoUrl || '/images/partners/mohw.png';

  const orgLabel = event.heroOrgLabel || 'Đơn vị tổ chức';
  const khidiLogo = event.heroKhidiLogoUrl || '/images/partners/khidi.png';
  const bv108Logo = event.heroBv108LogoUrl || '/images/partners/bv108.png';
  const snubhLogo = event.heroSnubhLogoUrl || '/images/partners/snubh.png';
  const kbitLogo = event.heroKbitLogoUrl || '/images/partners/kbit.png';

  const rawHeight = Number(event.heroBannerHeight);
  const bannerHeight = !isNaN(rawHeight) && rawHeight >= 380 && rawHeight <= 900 ? rawHeight : 500;

  // Resolve Main Background Image:
  // 1. If explicit heroBgImageUrl is set, use it.
  // 2. Otherwise, if bannerImageUrl is set and is NOT the building-only cutout ('/images/hero-building-right.png'), use bannerImageUrl.
  // 3. Fallback to '/images/hero-bv108-clean-bg.png' (100% match with user banner).
  const isBuildingOnly = event.bannerImageUrl === '/images/hero-building-right.png';
  const mainBgImage = event.heroBgImageUrl
    ? event.heroBgImageUrl
    : (!isBuildingOnly && event.bannerImageUrl ? event.bannerImageUrl : '/images/hero-bv108-clean-bg.png');

  // Building overlay on the right (optional, active for standard hospital setup)
  const showBuilding = Boolean(event.heroShowBuilding);
  const buildingImage = event.heroBuildingImageUrl || (isBuildingOnly ? '/images/hero-building-right.png' : '');

  // Fit mode
  const bgFit = event.heroBgFit || 'cover';

  // Construct CSS backgroundImage, backgroundPosition, backgroundSize
  let bgStyleImage: string;
  let bgStylePosition: string;
  let bgStyleSize: string;

  if (showBuilding && buildingImage && buildingImage !== mainBgImage) {
    bgStyleImage = `url('${buildingImage}'), url('${mainBgImage}')`;
    bgStylePosition = 'right center, center center';
    bgStyleSize = `contain, ${bgFit}`;
  } else {
    bgStyleImage = `url('${mainBgImage}')`;
    bgStylePosition = bgFit === 'contain' ? 'center center' : 'right center';
    bgStyleSize = bgFit;
  }

  // Overlay gradient
  const overlayMode = event.heroOverlayMode || 'pink';
  let overlayGradient = 'transparent';
  if (overlayMode === 'pink') {
    overlayGradient =
      'linear-gradient(90deg, rgba(255, 240, 245, 0.94) 0%, rgba(255, 242, 246, 0.88) 42%, rgba(255, 246, 250, 0.38) 70%, rgba(255, 255, 255, 0) 100%)';
  } else if (overlayMode === 'gradient') {
    overlayGradient =
      'linear-gradient(90deg, #ffffff 0%, #ffffff 42%, rgba(255,255,255,0.95) 54%, rgba(255,255,255,0.35) 72%, rgba(255,255,255,0) 100%)';
  } else if (overlayMode === 'soft') {
    overlayGradient =
      'linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.80) 45%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0) 100%)';
  }

  return (
    <section
      id="hero-banner"
      className="relative w-full flex items-center bg-white bg-no-repeat overflow-hidden border-b border-slate-200/60"
      style={{
        minHeight: `${bannerHeight}px`,
        height: `${bannerHeight}px`,
        backgroundImage: bgStyleImage,
        backgroundPosition: bgStylePosition,
        backgroundSize: bgStyleSize,
        backgroundRepeat: 'no-repeat',
        fontFamily: "'Inter', 'Noto Sans KR', system-ui, sans-serif",
      }}
    >
      {/* Soft left-to-right white wash gradient overlay ensuring pristine contrast */}
      {overlayMode !== 'none' && (
        <div
          className={`absolute inset-0 pointer-events-none hero-overlay-${overlayMode}`}
          style={{
            background: overlayGradient,
          }}
        />
      )}

      {/* Main Content Container constrained to banner height */}
      <div 
        className="relative z-10 w-full max-w-[1360px] mx-auto px-3.5 sm:px-8 lg:px-14 py-2.5 sm:py-5 flex flex-col justify-between"
        style={{
          minHeight: `${bannerHeight}px`,
          height: '100%',
        }}
      >
        {/* TOP: Two Host Logos (VSAPS & KSAPS) - Enlarged & Zero Padding */}
        <div className="flex items-center gap-2 sm:gap-4 p-0">
          {/* Logo 1: VSAPS Circular Badge */}
          <img
            src={vsapsLogo}
            alt="Hội Phẫu thuật Tạo hình Thẩm mỹ Việt Nam (VSAPS)"
            className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain drop-shadow-xs transition-transform hover:scale-105"
          />

          {/* Logo 2: KSAPS Circular Badge */}
          <img
            src={ksapsLogo}
            alt="Hội Phẫu thuật Tạo hình Thẩm mỹ Hàn Quốc (KSAPS)"
            className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain drop-shadow-xs transition-transform hover:scale-105"
          />
        </div>

        {/* CENTER: Typography Matching 100% of User Banner */}
        <div className="max-w-[85%] xs:max-w-[80%] sm:max-w-2xl lg:max-w-3xl my-1 sm:my-auto">
          {(() => {
            const sp = event.heroHeadingSpacing || 'relaxed';
            const gapClass =
              sp === 'loose'
                ? 'gap-1.5 sm:gap-4 lg:gap-5'
                : sp === 'normal'
                ? 'gap-0.5 sm:gap-1.5 lg:gap-2'
                : 'gap-1 sm:gap-2.5 lg:gap-3.5';

            return (
              <h1 className={`text-[21px] xs:text-[25px] sm:text-[40px] md:text-[46px] lg:text-[50px] font-black uppercase tracking-tight font-display flex flex-col ${gapClass} leading-[1.08] sm:leading-[1.12]`}>
                <span className="block text-[#d52b66]">{heading1}</span>
                <span className="block text-[#d52b66]">{heading2}</span>
                <span className="block text-[#d52b66]">
                  {heading3} <span className="text-[#6c35a8]">{headingYear}</span>
                </span>
              </h1>
            );
          })()}

          <p className="text-[11.5px] xs:text-[12.5px] sm:text-[16px] text-slate-600 font-semibold mt-1.5 sm:mt-3.5 mb-2.5 sm:mb-5 line-clamp-1 sm:line-clamp-none">
            {venueText}
          </p>

          {/* ACTION BUTTONS: Register & Date Pill */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* CTA 1: Đăng ký tham dự */}
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 sm:gap-3 px-3.5 xs:px-4.5 sm:px-7 py-1.5 sm:py-2.5 rounded-full bg-[#d52b66] hover:bg-[#b81d51] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer group"
            >
              <div className="flex flex-col text-left leading-none">
                <span className="text-[7.5px] sm:text-[9.5px] font-semibold text-pink-100 uppercase tracking-wider">
                  {ctaTag}
                </span>
                <span className="text-[12px] sm:text-[15px] font-black text-white mt-0.5 tracking-tight">
                  {ctaText}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </a>

            {/* CTA 2: Ngày tổ chức Date Pill */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 xs:px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-xs border sm:border-2 border-[#d52b66] text-[#d52b66] shadow-xs">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d52b66] shrink-0" />
              <span className="text-[12px] sm:text-[15px] font-black tracking-tight">
                {dateText}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM: Sponsors & Co-Organizers Logos matching 100% of User Banner */}
        <div className="flex flex-wrap items-end gap-3 sm:gap-8 pb-0.5 sm:pb-1 pt-1.5 sm:pt-2 border-t border-slate-100/80">
          {/* Column 1: Bảo trợ (MOHW Korea) */}
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-[9px] sm:text-[11px] font-medium text-slate-500">
              {patronLabel}
            </span>
            <div className="flex items-center h-5 sm:h-7">
              <img
                src={patronLogo}
                alt="Bộ Y tế & Phúc lợi Hàn Quốc (보건복지부)"
                className="h-full object-contain"
              />
            </div>
          </div>

          {/* Column 2: Đơn vị tổ chức (KHIDI, BV 108, SNUBH, KBIT) */}
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-[9px] sm:text-[11px] font-medium text-slate-500">
              {orgLabel}
            </span>
            <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5 h-5 sm:h-7">
              {/* KHIDI */}
              <img
                src={khidiLogo}
                alt="Viện KHIDI Hàn Quốc"
                className="h-full object-contain max-w-[46px] sm:max-w-[75px]"
              />

              {/* BV 108 */}
              <img
                src={bv108Logo}
                alt="Bệnh viện Trung ương Quân đội 108"
                className="h-full object-contain max-w-[20px] sm:max-w-[32px]"
              />

              {/* SNUBH */}
              <img
                src={snubhLogo}
                alt="Bệnh viện Bundang ĐHQG Seoul (SNUBH)"
                className="h-full object-contain max-w-[50px] sm:max-w-[80px]"
              />

              {/* KBIT */}
              <img
                src={kbitLogo}
                alt="Hiệp hội KBIT"
                className="h-full object-contain max-w-[42px] sm:max-w-[70px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
