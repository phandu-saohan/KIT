import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Globe, ArrowRight } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const HeroBanner: React.FC = () => {
  const { cmsData } = useCMS();

  // Dynamic countdown to Congress 2026 (17/10/2026)
  const targetDate = new Date('2026-10-17T08:00:00+07:00').getTime();
  const [daysLeft, setDaysLeft] = useState<number>(30);

  useEffect(() => {
    const calc = () => {
      const diff = targetDate - Date.now();
      const d = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      setDaysLeft(d > 0 ? d : 30);
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const heroImage = cmsData.eventDetails.bannerImageUrl || '/images/hero-hospital.jpg';

  return (
    <section
      id="hero-banner"
      className="relative w-full min-h-[580px] lg:min-h-[640px] xl:min-h-[680px] flex flex-col justify-between bg-cover bg-no-repeat overflow-hidden border-b border-slate-200/60"
      style={{
        backgroundImage: `url('${heroImage}')`,
        backgroundPosition: 'right 20% center',
        fontFamily: "'Plus Jakarta Sans', 'Montserrat', sans-serif",
      }}
    >
      {/* Refined gradient overlay: solid light wash on left for crisp readability, fading to reveal hospital on right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(248,249,255,0.98) 0%, rgba(248,249,255,0.95) 36%, rgba(248,249,255,0.82) 54%, rgba(248,249,255,0.35) 72%, rgba(248,249,255,0.08) 100%)',
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 flex flex-col justify-between flex-1 gap-6 sm:gap-8">
        {/* TOP ROW: Category Pill (Left) & Countdown Card (Right) */}
        <div className="flex items-start justify-between gap-4 w-full">
          {/* Top-left Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-pink-200/90 bg-white/80 backdrop-blur-md shadow-2xs">
            <span className="text-[11px] sm:text-[12px] font-extrabold uppercase tracking-wider text-[#c83271]">
              K-BEAUTY MEETS 2026 • HỘI NGHỊ TRỌNG ĐIỂM
            </span>
          </div>

          {/* Top-right D-30 Countdown Card */}
          <div className="flex items-center gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-[#c83271] font-display tracking-tight">
              D-{daysLeft}
            </span>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[9px] sm:text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                CÒN {daysLeft} NGÀY ĐẾM NGƯỢC TỚI
              </span>
              <span className="text-[11px] sm:text-[12px] font-extrabold text-slate-800 uppercase tracking-wider">
                CONGRESS 2026
              </span>
            </div>
          </div>
        </div>

        {/* CENTER CONTENT: Bold Gradient Heading & Introductory Paragraph */}
        <div className="max-w-3xl my-auto pt-2 pb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-black tracking-tight leading-[1.12] font-display">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e11d74] via-[#c83271] to-[#a855b5]">
              Hội nghị
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e11d74] via-[#b83280] to-[#8b5cf6]">
              Khoa học Thẩm mỹ
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#c83271] via-[#9333ea] to-[#6d5cae]">
              Việt – Hàn 2026
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-[13.5px] sm:text-[14.5px] text-slate-600 leading-relaxed font-normal max-w-2xl text-justify sm:text-left">
            Sự kiện khoa học thẩm mỹ quy mô lớn được tổ chức tại Bệnh viện Trung ương Quân đội 108, quy tụ các chuyên gia và bác sĩ hàng đầu đến từ Việt Nam và Hàn Quốc. Chương trình diễn ra đồng thời tại 4 hội trường, với hơn 30 báo cáo khoa học trong ngày đầu tiên và nhiều phiên trình diễn lâm sàng trực tiếp trong ngày thứ hai. Bên cạnh chương trình chuyên môn, hội nghị còn có khu vực triển lãm doanh nghiệp và kết nối hợp tác kinh doanh.
          </p>
        </div>

        {/* BOTTOM ROW: Info Badges & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
          {/* Badge 1: Date */}
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs text-[12px] font-bold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-[#c83271] shrink-0" />
            <span>17–18/10/2026</span>
          </div>

          {/* Badge 2: Venue */}
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs text-[12px] font-bold text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-[#c83271] shrink-0" />
            <span>Bệnh viện Trung ương Quân đội 108, Hà Nội</span>
          </div>

          {/* Badge 3: Languages */}
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs text-[12px] font-bold text-slate-800">
            <Globe className="w-3.5 h-3.5 text-[#c83271] shrink-0" />
            <span>Ba ngôn ngữ: Anh – Việt – Hàn</span>
          </div>

          {/* Button 1: Primary Register */}
          <a
            href="#dang-ky-tham-du"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d946ef] via-[#c83271] to-[#7c3aed] text-white text-[13px] font-bold shadow-xs hover:shadow-md hover:opacity-95 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Đăng ký</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* Button 2: View Agenda */}
          <a
            href="#chuong-trinh-khoa-hoc"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 text-[13px] font-bold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Xem chương trình đầy đủ</span>
          </a>
        </div>
      </div>
    </section>
  );
};
