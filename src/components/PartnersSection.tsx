import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { ShieldCheck } from 'lucide-react';
import { Partner } from '../types';

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
            <span>Uy Tín Chuyên Môn Quốc Tế</span>
          </div>

          <h2 className="text-[28px] sm:text-[34px] font-extrabold text-[#174ea6] font-display tracking-tight uppercase">
            Đơn Vị Chủ Trì &amp; Hiệp Hội Đồng Hành
          </h2>

          <p className="text-[14px] text-slate-600 mt-2 leading-relaxed font-medium">
            Sự phối hợp chặt chẽ giữa cơ quan quản lý y tế chính phủ, các bệnh viện đầu ngành và hiệp hội phẫu thuật tạo hình thẩm mỹ uy tín nhất của hai nước Việt Nam – Hàn Quốc.
          </p>
        </div>

        {/* 6 Partners Grid with Official Logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
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
                className="p-3.5 sm:p-5 rounded-2xl bg-white hover:bg-[#fafbff] transition-all duration-300 flex flex-col items-center text-center justify-between gap-2.5 sm:gap-3 shadow-xs hover:shadow-lg border border-slate-200/90 hover:border-[#174ea6]/40 min-h-[190px] sm:min-h-[220px] group relative overflow-hidden"
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
                <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-xl sm:rounded-2xl bg-white p-1 sm:p-1.5 flex items-center justify-center shadow-xs border border-slate-100 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 shrink-0">
                  {hasLogo ? (
                    <img
                      src={partner.logoUrl}
                      alt={`Logo ${partner.name}`}
                      className="w-full h-full object-contain max-h-full"
                      onError={() => handleImageError(partner.id)}
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-lg sm:rounded-xl flex items-center justify-center font-extrabold text-[13px] sm:text-[15px] font-display ${badgeStyle}`}
                    >
                      {partner.shortName}
                    </div>
                  )}
                </div>

                {/* Organization Details */}
                <div className="flex flex-col items-center gap-1 sm:gap-1.5 flex-1 justify-center w-full">
                  {/* Short badge */}
                  <span
                    className={`inline-block px-2 sm:px-2.5 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider border ${badgeStyle}`}
                  >
                    {partner.shortName}
                  </span>

                  {/* Full Name */}
                  <h3 className="text-[13px] sm:text-[15px] font-extrabold text-slate-800 font-display leading-tight group-hover:text-[#174ea6] transition-colors line-clamp-2">
                    {partner.name}
                  </h3>

                  {/* Role in Symposium */}
                  <span className={`text-[10.5px] sm:text-[11px] font-bold leading-tight ${roleColor}`}>
                    {partner.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
