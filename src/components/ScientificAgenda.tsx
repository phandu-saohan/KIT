import React from 'react';
import { Printer, Calendar, Clock, Star, MessageSquare } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const ScientificAgenda: React.FC = () => {
  const { cmsData } = useCMS();

  const handlePrint = () => {
    window.print();
  };

  const agendaList = cmsData.agenda;

  return (
    <section className="w-full py-12 sm:py-16 bg-[#f8f9ff]" id="chuong-trinh">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-[12px] uppercase text-secondary font-bold tracking-widest font-display">
              LỊCH TRÌNH CHUYÊN SÂU
            </span>
            <h2 className="text-[24px] sm:text-[34px] text-primary font-extrabold mt-1 font-display tracking-tight">
              Chương Trình Hội Thảo Khoa Học Chi Tiết
            </h2>
            <p className="text-[13px] sm:text-[14px] text-on-surface-variant mt-1">
              {cmsData.eventDetails.dateString || '03/10/2026'} ({cmsData.eventDetails.timeDetail?.split('(')[1]?.replace(')', '') || 'Thứ Bảy'}) • {cmsData.eventDetails.venueName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 text-on-surface-variant text-[12px] sm:text-[13px] font-semibold bg-[#e5eeff] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl">
              <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-primary">schedule</span>
              <span>{agendaList.length} Phiên báo cáo</span>
            </span>

            <a
              href="#dang-ky-tham-du"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary text-white text-[12px] sm:text-[13px] font-bold hover:bg-primary-container transition-colors shadow-xs"
            >
              Giữ chỗ
            </a>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex p-2 rounded-xl bg-white border border-[#e5eeff] hover:bg-[#eff4ff] text-on-surface-variant transition-colors cursor-pointer"
              title="In lịch trình hội thảo"
            >
              <Printer className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Agenda Schedule Table */}
        <div className="rounded-2xl overflow-hidden shadow-md bg-white border border-[#e5eeff]">
          {/* Table Header (Desktop Only) */}
          <div className="hidden sm:grid grid-cols-12 bg-primary text-white text-[14px] font-bold font-display px-6 py-4">
            <div className="col-span-2">Thời gian</div>
            <div className="col-span-1 text-center">Thời lượng</div>
            <div className="col-span-9">Nội dung báo cáo &amp; Hoạt động khoa học</div>
          </div>

          {/* Agenda Rows */}
          <div className="divide-y divide-[#f0f4ff]">
            {agendaList.map((item, idx) => {
              const isKeynote = item.isKeynote;
              const isQA = item.isQA;
              const isBreak = item.session === 'break';
              const isPlenary = item.session === 'plenary';

              return (
                <div
                  key={item.id || idx}
                  className={`p-4 sm:px-6 sm:py-4 transition-colors ${
                    isBreak
                      ? 'bg-amber-50/60 hover:bg-amber-50 border-l-4 border-amber-400 sm:border-l-0'
                      : isKeynote
                      ? 'bg-[#fff5f8]/70 hover:bg-[#fff0f5] border-l-4 border-[#c83271] sm:border-l-0'
                      : isPlenary
                      ? 'bg-[#eff4ff] hover:bg-[#e5eeff] border-l-4 border-[#174ea6] sm:border-l-0'
                      : 'bg-white hover:bg-[#eff4ff] border-l-4 border-slate-300 sm:border-l-0'
                  }`}
                >
                  {/* MOBILE VIEW (Screen < sm) */}
                  <div className="sm:hidden flex flex-col gap-1.5">
                    {/* Time + Duration + Session Badge Row */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 text-[14px] font-bold text-primary font-display">
                        <Clock className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span>{item.time}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold">
                          {item.duration}
                        </span>

                        {isKeynote && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#c83271] font-extrabold font-display bg-pink-100/70 px-2 py-0.5 rounded-md">
                            <Star className="w-2.5 h-2.5 fill-[#c83271]" />
                            <span>ĐỀ DẪN</span>
                          </span>
                        )}

                        {isQA && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 font-extrabold font-display bg-amber-100 px-2 py-0.5 rounded-md">
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>HỎI ĐÁP</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <p className={`text-[15px] font-bold text-primary leading-snug ${isKeynote || isPlenary ? 'font-display' : ''}`}>
                      {item.title}
                    </p>

                    {/* Description */}
                    {item.description && (
                      <p className="text-[12.5px] text-on-surface-variant leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* DESKTOP VIEW (Screen >= sm) */}
                  <div className="hidden sm:grid grid-cols-12 items-center gap-0">
                    <div className="col-span-2 text-[15px] sm:text-[16px] text-primary font-bold font-display flex items-center gap-2">
                      <span>{item.time}</span>
                    </div>

                    <div className="col-span-1 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[12px] font-bold inline-block">
                        {item.duration}
                      </span>
                    </div>

                    <div className="col-span-9">
                      {/* Badge indicator */}
                      {isKeynote && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#c83271] uppercase font-bold tracking-wider mb-1 font-display bg-pink-50 px-2 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-[#c83271]" />
                          <span>BÁO CÁO ĐỀ DẪN TOÀN THỂ</span>
                        </span>
                      )}

                      {isQA && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 uppercase font-bold tracking-wider mb-1 font-display bg-amber-100/70 px-2 py-0.5 rounded-md">
                          <MessageSquare className="w-3 h-3" />
                          <span>PHIÊN THẢO LUẬN &amp; HỎI ĐÁP</span>
                        </span>
                      )}

                      <p className={`text-[15.5px] sm:text-[16px] font-bold text-primary ${isKeynote || isPlenary ? 'font-display' : ''}`}>
                        {item.title}
                      </p>

                      {item.description && (
                        <p className="text-[13px] text-on-surface-variant mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
