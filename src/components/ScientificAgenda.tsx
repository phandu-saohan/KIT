import React, { useState, useMemo } from 'react';
import {
  Printer,
  Clock,
  Star,
  MessageSquare,
  Calendar,
  MapPin,
  LayoutGrid,
  List,
  Video,
  Sparkles,
  Building2,
  Filter,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { AgendaItem } from '../types';

export const ScientificAgenda: React.FC = () => {
  const { cmsData } = useCMS();
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedHallFilter, setSelectedHallFilter] = useState<string>('all');

  const handlePrint = () => {
    window.print();
  };

  const allAgenda = cmsData.agenda || [];
  const dayAgenda = allAgenda.filter((item) => (item.day ? item.day === activeDay : true));

  // Filter for list mode
  const filteredListAgenda = useMemo(() => {
    if (selectedHallFilter === 'all') return dayAgenda;
    return dayAgenda.filter((item) => {
      const h = (item.hall || '').toLowerCase();
      if (selectedHallFilter === 'h1') return h.includes('hội trường 1') || h.includes('hall 1');
      if (selectedHallFilter === 'h2') return h.includes('hội trường 2') || h.includes('hall 2');
      if (selectedHallFilter === 'h3') return h.includes('hội trường 3') || h.includes('hall 3');
      if (selectedHallFilter === 'h4') return h.includes('hội trường 4') || h.includes('hall 4');
      return true;
    });
  }, [dayAgenda, selectedHallFilter]);

  // Group agenda by unique time slots for 4-Hall Grid Mode
  const timeSlots = useMemo(() => {
    const slots: { time: string; duration: string; items: AgendaItem[]; isPlenary: boolean }[] = [];
    dayAgenda.forEach((item) => {
      const existing = slots.find((s) => s.time === item.time);
      if (existing) {
        existing.items.push(item);
        if (item.session !== 'plenary' && item.session !== 'break') {
          existing.isPlenary = false;
        }
      } else {
        const isPlenary =
          item.session === 'plenary' ||
          item.session === 'break' ||
          (item.hall && !item.hall.includes('(') && !item.hall.includes('·'));
        slots.push({
          time: item.time,
          duration: item.duration,
          items: [item],
          isPlenary: Boolean(isPlenary),
        });
      }
    });
    return slots;
  }, [dayAgenda]);

  // Hall metadata per day
  const hallColumns =
    activeDay === 1
      ? [
          { id: 'h1', num: '1', title: 'Hội trường 1', sub: 'Phẫu thuật thẩm mỹ', color: '#174ea6' },
          { id: 'h2', num: '2', title: 'Hội trường 2', sub: 'Thẩm mỹ nội khoa', color: '#c83271' },
          { id: 'h3', num: '3', title: 'Hội trường 3', sub: 'Thiết bị công nghệ năng lượng (EBD)', color: '#0d9488' },
          { id: 'h4', num: '4', title: 'Hội trường 4', sub: 'Doanh nghiệp & B2B', color: '#6c35a8' },
        ]
      : [
          { id: 'h1', num: '1', title: 'Hội trường 1', sub: 'Thị phạm — Ngoại khoa', color: '#174ea6' },
          { id: 'h2', num: '2', title: 'Hội trường 2', sub: 'Thị phạm — Nội khoa', color: '#c83271' },
          { id: 'h3', num: '3', title: 'Hội trường 3', sub: 'Thị phạm — Thiết bị', color: '#0d9488' },
          { id: 'h4', num: '4', title: 'Hội trường 4', sub: 'Doanh nghiệp & B2B', color: '#6c35a8' },
        ];

  return (
    <section className="w-full py-12 sm:py-18 bg-[#f8faff] relative border-b border-slate-200/80" id="chuong-trinh">
      <div className="max-w-[1320px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7 sm:mb-9">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200/70 text-[#d52b66] text-[11px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LỊCH TRÌNH CHÍNH THỨC 2 NGÀY</span>
            </div>
            <h2 className="text-[24px] sm:text-[34px] font-black text-[#002045] font-display tracking-tight leading-tight">
              Chương Trình Hội Nghị Khoa Học Chi Tiết
            </h2>
            <p className="text-[13px] sm:text-[14.5px] text-slate-600 mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#174ea6]">17–18/10/2026 (Thứ Bảy &amp; Chủ Nhật)</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-[#d52b66]" />
                {cmsData.eventDetails.venueName || 'Bệnh viện Trung ương Quân đội 108, Hà Nội'}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* View Mode Toggle Button */}
            <div className="inline-flex items-center p-1 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#174ea6] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Bảng 4 Hội trường song song chuẩn KBIT"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Lưới 4 Hội trường</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#174ea6] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Danh sách dòng thời gian chi tiết"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Dòng thời gian</span>
              </button>
            </div>

            <span className="inline-flex items-center gap-1.5 text-slate-700 text-[12px] sm:text-[13px] font-semibold bg-white border border-slate-200/80 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl shadow-2xs">
              <Clock className="w-4 h-4 text-[#174ea6]" />
              <span>{allAgenda.length} Mục</span>
            </span>

            <a
              href="#dang-ky-tham-du"
              className="px-4 py-2 rounded-2xl bg-[#d52b66] hover:bg-[#b81d51] text-white text-[12px] sm:text-[13px] font-black transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Đăng ký tham dự
            </a>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex p-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="In lịch trình hội nghị"
            >
              <Printer className="w-4 h-4 text-[#174ea6]" />
            </button>
          </div>
        </div>

        {/* Day 1 / Day 2 Tab Selector */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-6">
          <button
            onClick={() => {
              setActiveDay(1);
              setSelectedHallFilter('all');
            }}
            className={`px-4 sm:px-6 py-3 rounded-2xl font-display font-extrabold text-[13px] sm:text-[15px] transition-all flex items-center gap-2.5 cursor-pointer shadow-xs ${
              activeDay === 1
                ? 'bg-[#174ea6] text-white shadow-md scale-[1.01]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <div className="text-left leading-tight">
              <span className="block">NGÀY 1 · THỨ 7, 17.10.2026</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeDay === 1 ? 'text-blue-100' : 'text-slate-500'}`}>
                Phiên báo cáo khoa học (36 bài)
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveDay(2);
              setSelectedHallFilter('all');
            }}
            className={`px-4 sm:px-6 py-3 rounded-2xl font-display font-extrabold text-[13px] sm:text-[15px] transition-all flex items-center gap-2.5 cursor-pointer shadow-xs ${
              activeDay === 2
                ? 'bg-[#c83271] text-white shadow-md scale-[1.01]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <div className="text-left leading-tight">
              <span className="block">NGÀY 2 · CHỦ NHẬT, 18.10.2026</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeDay === 2 ? 'text-pink-100' : 'text-slate-500'}`}>
                Thị phạm &amp; Mổ trực tiếp (15 phiên)
              </span>
            </div>
          </button>
        </div>

        {/* =========================================================================
            VIEW MODE 1: 4-HALL GRID VIEW (100% REPLICA OF KBIT ASSOCIATION WEBSITE)
           ========================================================================= */}
        {viewMode === 'grid' && (
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-white border border-slate-200/90">
            {/* Table Column Headers (Desktop/Tablet) */}
            <div className="hidden lg:grid grid-cols-12 bg-gradient-to-r from-[#002045] via-[#0d2a54] to-[#002045] text-white divide-x divide-white/10">
              <div className="col-span-2 px-4 py-4 text-center flex flex-col justify-center">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-200">Khung giờ</span>
                <span className="text-[14px] font-black font-display mt-0.5">Thời gian</span>
              </div>
              <div className="col-span-2.5 p-3 text-center flex flex-col justify-center bg-[#174ea6]/25">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">Hội trường 1</span>
                <span className="text-[13.5px] font-extrabold font-display leading-tight">{hallColumns[0].sub}</span>
              </div>
              <div className="col-span-2.5 p-3 text-center flex flex-col justify-center bg-[#c83271]/25">
                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-200">Hội trường 2</span>
                <span className="text-[13.5px] font-extrabold font-display leading-tight">{hallColumns[1].sub}</span>
              </div>
              <div className="col-span-2.5 p-3 text-center flex flex-col justify-center bg-[#0d9488]/25">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200">Hội trường 3</span>
                <span className="text-[13.5px] font-extrabold font-display leading-tight">{hallColumns[2].sub}</span>
              </div>
              <div className="col-span-2.5 p-3 text-center flex flex-col justify-center bg-[#6c35a8]/25">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200">Hội trường 4</span>
                <span className="text-[13.5px] font-extrabold font-display leading-tight">{hallColumns[3].sub}</span>
              </div>
            </div>

            {/* Grid Body Rows */}
            <div className="divide-y divide-slate-100">
              {timeSlots.map((slot, sIdx) => {
                const isSinglePlenary = slot.items.length === 1 && slot.isPlenary;
                const singleItem = slot.items[0];

                if (isSinglePlenary) {
                  const isKeynote = singleItem.isKeynote;
                  const isOpeningOrClosing =
                    singleItem.title.toLowerCase().includes('khai mạc') ||
                    singleItem.title.toLowerCase().includes('bế mạc');
                  const isGala = singleItem.title.toLowerCase().includes('gala');
                  const isBreak = singleItem.session === 'break';

                  return (
                    <div
                      key={`slot-${sIdx}`}
                      className={`p-3.5 sm:px-6 sm:py-3.5 transition-colors ${
                        isKeynote
                          ? 'bg-[#fff1f5] border-l-4 border-[#d52b66]'
                          : isOpeningOrClosing
                          ? 'bg-[#eff4ff] border-l-4 border-[#174ea6]'
                          : isGala
                          ? 'bg-purple-50/70 border-l-4 border-[#6c35a8]'
                          : isBreak
                          ? 'bg-amber-50/40 hover:bg-amber-50/60'
                          : 'bg-slate-50/60 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 font-mono text-[12.5px] sm:text-[13px] font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                            <Clock className="w-3 h-3 text-[#174ea6]" />
                            {slot.time}
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-400">({slot.duration})</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isKeynote && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[#d52b66] font-black uppercase tracking-wider bg-pink-100 px-2 py-0.5 rounded-md">
                                <Star className="w-3 h-3 fill-[#d52b66]" />
                                Báo cáo đề dẫn (Keynote)
                              </span>
                            )}
                            {isOpeningOrClosing && (
                              <span className="text-[10px] text-[#174ea6] font-black uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-md">
                                Phiên toàn thể
                              </span>
                            )}
                            <strong className="text-[13.5px] sm:text-[14.5px] text-slate-900 font-extrabold leading-snug">
                              {singleItem.title}
                            </strong>
                          </div>
                          {singleItem.description && (
                            <p className="text-[11.5px] sm:text-[12px] text-slate-600 mt-0.5 leading-relaxed">
                              {singleItem.description}
                            </p>
                          )}
                        </div>

                        {singleItem.hall && (
                          <span className="self-start sm:self-auto text-[10.5px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/80 shrink-0">
                            {singleItem.hall}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                // Multi-Hall Concurrent Row
                return (
                  <div key={`slot-${sIdx}`} className="p-3 sm:p-4 bg-white hover:bg-slate-50/40 transition-colors">
                    {/* Time Indicator on Mobile & Tablet */}
                    <div className="lg:hidden flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 font-mono text-[12.5px] font-bold text-[#174ea6] bg-[#eff4ff] px-2.5 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-[#174ea6]" />
                          {slot.time}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">({slot.duration})</span>
                      </div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                        4 Hội trường song song
                      </span>
                    </div>

                    {/* 4 Columns (Desktop) / Cards Grid (Mobile) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 lg:gap-2">
                      {/* Left Time Column (Desktop Only) */}
                      <div className="hidden lg:flex col-span-2 flex-col justify-center items-center text-center pr-2 border-r border-slate-100">
                        <span className="font-mono text-[13px] font-extrabold text-[#002045]">{slot.time}</span>
                        <span className="text-[10.5px] text-slate-400 font-bold mt-0.5">({slot.duration})</span>
                      </div>

                      {/* 4 Hall Cards */}
                      {hallColumns.map((col, cIdx) => {
                        const cellItem = slot.items.find((item) => {
                          const h = (item.hall || '').toLowerCase();
                          return h.includes(`hội trường ${col.num}`) || h.includes(`hall ${col.num}`);
                        }) || slot.items[cIdx];

                        if (!cellItem) {
                          return (
                            <div
                              key={col.id}
                              className="lg:col-span-2.5 p-3 rounded-xl bg-slate-50/50 border border-dashed border-slate-200 text-center flex items-center justify-center text-[11px] text-slate-400"
                            >
                              Giao lưu tự do
                            </div>
                          );
                        }

                        const hasSurgery =
                          cellItem.description.toLowerCase().includes('phòng mổ') ||
                          cellItem.description.toLowerCase().includes('trực tiếp');

                        return (
                          <div
                            key={col.id}
                            className="lg:col-span-2.5 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-150 bg-white hover:border-[#174ea6]/40 hover:shadow-sm transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span
                                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                                  style={{
                                    backgroundColor: `${col.color}15`,
                                    color: col.color,
                                  }}
                                >
                                  Hội trường {col.num}
                                </span>

                                {hasSurgery && (
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                                    <Video className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
                                    Live Surgery
                                  </span>
                                )}
                              </div>

                              <h4 className="text-[12.5px] sm:text-[13px] font-black text-slate-900 leading-snug mb-1.5 line-clamp-2">
                                {cellItem.title}
                              </h4>

                              {cellItem.description && (
                                <div className="text-[11px] sm:text-[11.5px] text-slate-600 leading-relaxed space-y-0.5">
                                  {cellItem.description
                                    .split('•')
                                    .map((bullet, bIdx) => (
                                      <p key={bIdx} className="line-clamp-2">
                                        {bullet.trim().startsWith('·') ? bullet.trim() : `• ${bullet.trim()}`}
                                      </p>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW MODE 2: DETAILED TIMELINE LIST (WITH HALL FILTER CHIPS)
           ========================================================================= */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* Hall Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#174ea6]" />
                Lọc theo:
              </span>
              <button
                onClick={() => setSelectedHallFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHallFilter === 'all'
                    ? 'bg-[#002045] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Tất cả hội trường ({dayAgenda.length})
              </button>
              <button
                onClick={() => setSelectedHallFilter('h1')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHallFilter === 'h1'
                    ? 'bg-[#174ea6] text-white shadow-xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-[#174ea6]'
                }`}
              >
                Hội trường 1 ({hallColumns[0].sub})
              </button>
              <button
                onClick={() => setSelectedHallFilter('h2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHallFilter === 'h2'
                    ? 'bg-[#c83271] text-white shadow-xs'
                    : 'bg-pink-50 hover:bg-pink-100 text-[#c83271]'
                }`}
              >
                Hội trường 2 ({hallColumns[1].sub})
              </button>
              <button
                onClick={() => setSelectedHallFilter('h3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHallFilter === 'h3'
                    ? 'bg-[#0d9488] text-white shadow-xs'
                    : 'bg-teal-50 hover:bg-teal-100 text-[#0d9488]'
                }`}
              >
                Hội trường 3 ({hallColumns[2].sub})
              </button>
              <button
                onClick={() => setSelectedHallFilter('h4')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHallFilter === 'h4'
                    ? 'bg-[#6c35a8] text-white shadow-xs'
                    : 'bg-purple-50 hover:bg-purple-100 text-[#6c35a8]'
                }`}
              >
                Hội trường 4 (Doanh nghiệp &amp; B2B)
              </button>
            </div>

            {/* List Table */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-white border border-slate-200/90 divide-y divide-slate-100">
              {filteredListAgenda.map((item) => {
                const isKeynote = item.isKeynote;
                const isBreak = item.session === 'break';
                const isPlenary = item.session === 'plenary';

                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 transition-colors ${
                      isKeynote
                        ? 'bg-[#fff5f8]/80 hover:bg-[#fff0f5] border-l-4 border-[#c83271]'
                        : isPlenary
                        ? 'bg-[#eff4ff]/70 hover:bg-[#e5eeff] border-l-4 border-[#174ea6]'
                        : isBreak
                        ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-amber-400'
                        : 'bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="w-full sm:w-44 shrink-0 flex items-center sm:flex-col sm:items-start gap-2">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[14px] font-black text-[#002045]">
                          <Clock className="w-3.5 h-3.5 text-[#174ea6]" />
                          {item.time}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">({item.duration})</span>
                        {item.hall && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-extrabold truncate max-w-full">
                            {item.hall}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {isKeynote && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#c83271] font-black uppercase tracking-wider bg-pink-100 px-2 py-0.5 rounded-md mb-1">
                            <Star className="w-3 h-3 fill-[#c83271]" />
                            Báo cáo đề dẫn toàn thể (Keynote)
                          </span>
                        )}
                        <h4 className="text-[14.5px] sm:text-[15.5px] font-black text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[12px] sm:text-[12.5px] text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
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
        )}
      </div>
    </section>
  );
};

