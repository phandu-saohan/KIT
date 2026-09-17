import React, { useState } from 'react';
import { Printer, Clock, Star, MessageSquare, Calendar, MapPin } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const ScientificAgenda: React.FC = () => {
  const { cmsData } = useCMS();
  const [activeDay, setActiveDay] = useState<1 | 2>(1);

  const handlePrint = () => {
    window.print();
  };

  const allAgenda = cmsData.agenda || [];
  // Filter by activeDay if item has day property, otherwise show all
  const filteredAgenda = allAgenda.filter((item) => (item.day ? item.day === activeDay : true));

  return (
    <section className="w-full py-12 sm:py-16 bg-[#f8f9ff]" id="chuong-trinh">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-[12px] uppercase text-[#c83271] font-bold tracking-widest font-display">
              LỊCH TRÌNH CHUYÊN SÂU 2 NGÀY
            </span>
            <h2 className="text-[24px] sm:text-[34px] text-primary font-extrabold mt-1 font-display tracking-tight">
              Chương Trình Hội Nghị Khoa Học Chi Tiết
            </h2>
            <p className="text-[13px] sm:text-[14px] text-on-surface-variant mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-primary">17–18/10/2026 (Thứ Bảy &amp; Chủ Nhật)</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#c83271]" />
                {cmsData.eventDetails.venueName}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 text-on-surface-variant text-[12px] sm:text-[13px] font-semibold bg-[#e5eeff] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl">
              <Clock className="w-4 h-4 text-primary" />
              <span>{allAgenda.length} Phiên lịch trình</span>
            </span>

            <a
              href="#dang-ky-tham-du"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary text-white text-[12px] sm:text-[13px] font-bold hover:bg-primary-container transition-colors shadow-xs active:scale-95"
            >
              Đăng ký giữ chỗ
            </a>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex p-2 rounded-xl bg-white border border-[#e5eeff] hover:bg-[#eff4ff] text-on-surface-variant transition-colors cursor-pointer"
              title="In lịch trình hội nghị"
            >
              <Printer className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Day 1 / Day 2 Tab Selector */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <button
            onClick={() => setActiveDay(1)}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-display font-extrabold text-[13px] sm:text-[14.5px] transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeDay === 1
                ? 'bg-[#174ea6] text-white shadow-md scale-[1.01]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>NGÀY 1 · THỨ BẢY (17/10/2026)</span>
            <span className={`text-[10.5px] px-2 py-0.5 rounded-full ${activeDay === 1 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              Báo cáo khoa học
            </span>
          </button>

          <button
            onClick={() => setActiveDay(2)}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-display font-extrabold text-[13px] sm:text-[14.5px] transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeDay === 2
                ? 'bg-[#c83271] text-white shadow-md scale-[1.01]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>NGÀY 2 · CHỦ NHẬT (18/10/2026)</span>
            <span className={`text-[10.5px] px-2 py-0.5 rounded-full ${activeDay === 2 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              Thị phạm &amp; Mổ trực tiếp
            </span>
          </button>
        </div>

        {/* Agenda Schedule Table */}
        <div className="rounded-2xl overflow-hidden shadow-md bg-white border border-[#e5eeff]">
          {/* Table Header (Desktop Only) */}
          <div className="hidden sm:grid grid-cols-12 bg-primary text-white text-[14px] font-bold font-display px-6 py-4">
            <div className="col-span-2">Thời gian</div>
            <div className="col-span-2">Hội trường / Thời lượng</div>
            <div className="col-span-8">Nội dung báo cáo &amp; Hoạt động chuyên môn</div>
          </div>

          {/* Agenda Rows */}
          <div className="divide-y divide-[#f0f4ff]">
            {filteredAgenda.map((item, idx) => {
              const isKeynote = item.isKeynote;
              const isQA = item.isQA;
              const isBreak = item.session === 'break';
              const isPlenary = item.session === 'plenary';

              return (
                <div
                  key={item.id || idx}
                  className={`p-4 sm:px-6 sm:py-4 transition-colors ${
                    isBreak
                      ? 'bg-amber-50/50 hover:bg-amber-50/80 border-l-4 border-amber-400 sm:border-l-0'
                      : isKeynote
                      ? 'bg-[#fff5f8]/70 hover:bg-[#fff0f5] border-l-4 border-[#c83271] sm:border-l-0'
                      : isPlenary
                      ? 'bg-[#eff4ff] hover:bg-[#e5eeff] border-l-4 border-[#174ea6] sm:border-l-0'
                      : 'bg-white hover:bg-[#f8faff] border-l-4 border-slate-300 sm:border-l-0'
                  }`}
                >
                  {/* MOBILE VIEW (Screen < sm) */}
                  <div className="sm:hidden flex flex-col gap-2">
                    {/* Time + Duration + Session Badge Row */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 text-[14px] font-bold text-primary font-display">
                        <Clock className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span>{item.time}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.hall && (
                          <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#174ea6] text-[10.5px] font-extrabold border border-[#d0e1fd]">
                            {item.hall}
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold">
                          {item.duration}
                        </span>

                        {isKeynote && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#c83271] font-extrabold font-display bg-pink-100/70 px-2 py-0.5 rounded-md">
                            <Star className="w-2.5 h-2.5 fill-[#c83271]" />
                            <span>KEYNOTE</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <p className={`text-[14.5px] font-bold text-primary leading-snug ${isKeynote || isPlenary ? 'font-display text-[#002045]' : ''}`}>
                      {item.title}
                    </p>

                    {/* Description */}
                    {item.description && (
                      <div className="text-[12px] text-on-surface-variant leading-relaxed whitespace-pre-line">
                        {item.description}
                      </div>
                    )}
                  </div>

                  {/* DESKTOP VIEW (Screen >= sm) */}
                  <div className="hidden sm:grid grid-cols-12 items-start gap-3">
                    <div className="col-span-2 text-[15px] sm:text-[15.5px] text-primary font-bold font-display flex items-center gap-2 pt-0.5">
                      <span>{item.time}</span>
                    </div>

                    <div className="col-span-2 flex flex-col items-start gap-1 pt-0.5">
                      {item.hall && (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#eff4ff] text-[#174ea6] text-[11px] font-extrabold border border-[#d0e1fd] truncate max-w-full">
                          {item.hall}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11.5px] font-bold inline-block">
                        {item.duration}
                      </span>
                    </div>

                    <div className="col-span-8">
                      {/* Badge indicator */}
                      {isKeynote && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#c83271] uppercase font-bold tracking-wider mb-1 font-display bg-pink-50 px-2.5 py-0.5 rounded-md border border-pink-200">
                          <Star className="w-3 h-3 fill-[#c83271]" />
                          <span>BÁO CÁO ĐỀ DẪN TOÀN THỂ (KEYNOTE)</span>
                        </span>
                      )}

                      {isQA && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 uppercase font-bold tracking-wider mb-1 font-display bg-amber-100/70 px-2 py-0.5 rounded-md">
                          <MessageSquare className="w-3 h-3" />
                          <span>PHIÊN THẢO LUẬN &amp; HỎI ĐÁP</span>
                        </span>
                      )}

                      <p className={`text-[15px] sm:text-[15.5px] font-bold text-primary ${isKeynote || isPlenary ? 'font-display text-[#002045]' : ''}`}>
                        {item.title}
                      </p>

                      {item.description && (
                        <div className="text-[12.5px] text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                          {item.description}
                        </div>
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
