import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { ShieldCheck, Building2, Store, Handshake } from 'lucide-react';
import { KOREAN_BUSINESSES } from '../data/symposiumData';

export const PartnersSection: React.FC = () => {
  const { cmsData } = useCMS();
  const partnersList = cmsData.partners;
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-white border-t border-[#f0f4ff]" id="don-vi-dong-hanh">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff4ff] text-[#174ea6] text-[11px] font-bold uppercase tracking-wider mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#174ea6]" />
            <span>UY TÍN HỌC THUẬT &amp; BẢO TRỢ CHÍNH PHỦ</span>
          </div>

          <h2 className="text-[26px] sm:text-[34px] font-extrabold text-[#174ea6] font-display tracking-tight uppercase">
            Đơn Vị Bảo Trợ, Chủ Trì &amp; Đồng Tổ Chức
          </h2>

          <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 mt-2 leading-relaxed font-medium">
            Sự phối hợp chặt chẽ giữa Bộ Y tế &amp; Phúc lợi Hàn Quốc, Bệnh viện Trung ương Quân đội 108, Viện KHIDI, Bệnh viện ĐH Quốc gia Seoul (SNUBH), Hiệp hội KSAPS, VSAPS và KBIT.
          </p>
        </div>

        {/* Partners Grid with Official Logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mb-14">
          {partnersList.map((partner) => {
            const hasError = imageErrorMap[partner.id];
            const hasLogo = Boolean(partner.logoUrl) && !hasError;

            let badgeStyle = 'bg-[#eff4ff] text-[#174ea6] border-[#dbeafe]';
            let roleColor = 'text-[#174ea6]';

            if (partner.accent === 'secondary') {
              badgeStyle = 'bg-[#fff1f5] text-[#c83271] border-[#fce7f3]';
              roleColor = 'text-[#c83271]';
            } else if (partner.accent === 'tertiary') {
              badgeStyle = 'bg-[#f0fdf4] text-[#15803d] border-[#dcfce7]';
              roleColor = 'text-[#15803d]';
            }

            return (
              <div
                key={partner.id}
                className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-[#fafbff] transition-all duration-300 flex flex-col items-center text-center justify-between gap-2 shadow-xs hover:shadow-lg border border-slate-200/90 hover:border-[#174ea6]/40 min-h-[190px] sm:min-h-[210px] group relative overflow-hidden"
              >
                {/* Top subtle accent stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    partner.accent === 'secondary'
                      ? 'bg-gradient-to-r from-[#c83271] to-[#e11d48]'
                      : partner.accent === 'tertiary'
                      ? 'bg-gradient-to-r from-[#10b981] to-[#0284c7]'
                      : 'bg-gradient-to-r from-[#174ea6] to-[#3b82f6]'
                  }`}
                />

                {/* Official Logo Container */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white p-1 sm:p-1.5 flex items-center justify-center shadow-xs border border-slate-100 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 shrink-0">
                  {hasLogo ? (
                    <img
                      src={partner.logoUrl}
                      alt={`Logo ${partner.name}`}
                      className="w-full h-full object-contain max-h-full"
                      onError={() => handleImageError(partner.id)}
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-lg sm:rounded-xl flex items-center justify-center font-extrabold text-[12px] sm:text-[13px] font-display ${badgeStyle}`}
                    >
                      {partner.shortName}
                    </div>
                  )}
                </div>

                {/* Organization Details */}
                <div className="flex flex-col items-center gap-1 flex-1 justify-center w-full">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[9px] sm:text-[9.5px] font-extrabold uppercase tracking-wider border ${badgeStyle}`}
                  >
                    {partner.shortName}
                  </span>

                  <h3 className="text-[12.5px] sm:text-[13.5px] font-extrabold text-slate-800 font-display leading-tight group-hover:text-[#174ea6] transition-colors line-clamp-2">
                    {partner.name}
                  </h3>

                  <span className={`text-[10px] sm:text-[10.5px] font-bold leading-tight ${roleColor}`}>
                    {partner.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 22+ Korean Businesses Exhibition & B2B Section */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0b1c30] via-[#152e4d] to-[#002045] p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-white/15">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-widest text-[#ffb0cd] font-display">
                  HỘI TRƯỜNG 4 &amp; SẢNH CHÍNH TRIỂN LÃM
                </span>
                <h3 className="text-[22px] sm:text-[30px] font-extrabold font-display text-white mt-1">
                  Không Gian Kết Nối Doanh Nghiệp &amp; Giao Thương B2B
                </h3>
                <p className="text-[12.5px] sm:text-[14px] text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                  Mở rộng cơ hội hợp tác chiến lược, phân phối độc quyền và chuyển giao giải pháp cùng các doanh nghiệp y tế thẩm mỹ hàng đầu Hàn Quốc tại Hội nghị.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-[12px] font-bold text-white flex items-center gap-1.5 font-mono">
                  <Handshake className="w-4 h-4 text-[#ffb0cd]" />
                  <span>22+ THƯƠNG HIỆU HÀN QUỐC</span>
                </span>
              </div>
            </div>

            {/* Businesses Pills Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
              {KOREAN_BUSINESSES.map((brand, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-center transition-all duration-200 flex items-center justify-center group"
                >
                  <span className="text-[12px] sm:text-[13px] font-bold text-white/95 group-hover:text-[#ffb0cd] transition-colors truncate">
                    {brand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
