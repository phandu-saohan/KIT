import React, { useState, useMemo } from 'react';
import {
  Printer,
  Clock,
  Star,
  MapPin,
  LayoutGrid,
  List,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { AgendaItem } from '../types';

export const ScientificAgenda: React.FC = () => {
  const { cmsData } = useCMS();
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedHallFilter, setSelectedHallFilter] = useState<string>('all');
  const [mobileLayoutMode, setMobileLayoutMode] = useState<'cards' | 'table'>('cards');
  const [mobileHallFilter, setMobileHallFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');

  const parseTitle = (rawTitle: string) => {
    let category = '';
    let topic = rawTitle;
    if (rawTitle.includes(':')) {
      const parts = rawTitle.split(':');
      category = parts[0].trim();
      topic = parts.slice(1).join(':').trim();
    }
    return { category, topic };
  };

  const parseBullets = (desc?: string) => {
    if (!desc) return [];
    return desc
      .split(/[•\n]/)
      .map((b) => b.trim().replace(/^[·•-]\s*/, ''))
      .filter(Boolean);
  };

  const getItemForHall = (slotItems: AgendaItem[], hallNum: number): AgendaItem | undefined => {
    return (
      slotItems.find((item) => {
        const h = (item.hall || '').toLowerCase();
        return h.includes(`hội trường ${hallNum}`) || h.includes(`hall ${hallNum}`);
      }) || slotItems[hallNum - 1]
    );
  };

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

  // Hall column headers meta matching the exact screenshot colors
  const hallHeaders =
    activeDay === 1
      ? [
          {
            num: 1,
            title: 'HỘI TRƯỜNG 1',
            sub: 'PHẪU THUẬT THẨM MỸ',
            bg: '#1c234f',
          },
          {
            num: 2,
            title: 'HỘI TRƯỜNG 2',
            sub: 'THẨM MỸ NỘI KHOA',
            bg: '#4e5898',
          },
          {
            num: 3,
            title: 'HỘI TRƯỜNG 3',
            sub: 'THIẾT BỊ CÔNG NGHỆ NĂNG LƯỢNG (EBD)',
            bg: '#8d95c4',
          },
          {
            num: 4,
            title: 'HỘI TRƯỜNG 4',
            sub: 'DOANH NGHIỆP & B2B',
            bg: '#c6a4ba',
          },
        ]
      : [
          {
            num: 1,
            title: 'HỘI TRƯỜNG 1',
            sub: 'THỊ PHẠM — NGOẠI KHOA',
            bg: '#1c234f',
          },
          {
            num: 2,
            title: 'HỘI TRƯỜNG 2',
            sub: 'THỊ PHẠM — NỘI KHOA',
            bg: '#4e5898',
          },
          {
            num: 3,
            title: 'HỘI TRƯỜNG 3',
            sub: 'THỊ PHẠM — THIẾT BỊ',
            bg: '#8d95c4',
          },
          {
            num: 4,
            title: 'HỘI TRƯỜNG 4',
            sub: 'DOANH NGHIỆP & B2B',
            bg: '#c6a4ba',
          },
        ];

  return (
    <section className="w-full pt-3 sm:pt-4 pb-10 sm:pb-16 bg-[#f8faff] relative border-b border-slate-200/80" id="chuong-trinh">
      <div className="max-w-[1320px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
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
                title="Bảng biểu 4 Hội trường chuẩn"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Bảng 4 Hội trường</span>
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

        {/* Day 1 / Day 2 Tab Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-5">
          <button
            onClick={() => {
              setActiveDay(1);
              setSelectedHallFilter('all');
            }}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-display font-extrabold text-[13px] sm:text-[14.5px] transition-all flex items-center gap-2.5 cursor-pointer shadow-xs ${
              activeDay === 1
                ? 'bg-[#232a55] text-white shadow-md scale-[1.01]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
            }`}
          >
            <div className="text-left leading-tight">
              <span className="block">NGÀY 1 · THỨ 7, 17.10.2026</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeDay === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>
                Phiên báo cáo khoa học
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveDay(2);
              setSelectedHallFilter('all');
            }}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-display font-extrabold text-[13px] sm:text-[14.5px] transition-all flex items-center gap-2.5 cursor-pointer shadow-xs ${
              activeDay === 2
                ? 'bg-[#232a55] text-white shadow-md scale-[1.01]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
            }`}
          >
            <div className="text-left leading-tight">
              <span className="block">NGÀY 2 · CHỦ NHẬT, 18.10.2026</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeDay === 2 ? 'text-indigo-200' : 'text-slate-500'}`}>
                Phiên thị phạm &amp; Mổ trực tiếp
              </span>
            </div>
          </button>
        </div>

        {/* =========================================================================
            VIEW MODE 1: EXACT 100% REPLICA OF THE IMAGE LAYOUT + MOBILE CARDS
           ========================================================================= */}
        {viewMode === 'grid' && (
          <div className="space-y-4">
            {/* Mobile Controls: Layout Switcher & Hall Filter Bar */}
            <div className="md:hidden space-y-2.5">
              {/* 1. Layout Mode Switcher (Cards vs Horizontal Table) */}
              <div className="flex items-center justify-between gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMobileLayoutMode('cards')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mobileLayoutMode === 'cards'
                      ? 'bg-[#174ea6] text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Thẻ theo giờ (Dễ đọc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileLayoutMode('table')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mobileLayoutMode === 'table'
                      ? 'bg-[#174ea6] text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Bảng cuộn ngang 4 phòng</span>
                </button>
              </div>

              {/* 2. Quick Hall Filter Chips on Mobile (active in cards mode) */}
              {mobileLayoutMode === 'cards' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-0.5">
                  <button
                    type="button"
                    onClick={() => setMobileHallFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      mobileHallFilter === 'all'
                        ? 'bg-[#232a55] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Tất cả 4 phòng
                  </button>
                  {hallHeaders.map((h) => {
                    const numStr = String(h.num) as '1' | '2' | '3' | '4';
                    const isSelected = mobileHallFilter === numStr;
                    return (
                      <button
                        key={h.num}
                        type="button"
                        onClick={() => setMobileHallFilter(numStr)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'text-white shadow-xs ring-2 ring-offset-1 ring-slate-400'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                        style={{
                          backgroundColor: isSelected ? h.bg : undefined,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: isSelected ? '#ffffff' : h.bg }}
                        />
                        <span>HT {h.num}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MOBILE CARDS VIEW (Displayed on mobile when mobileLayoutMode === 'cards') */}
            {mobileLayoutMode === 'cards' && (
              <div className="md:hidden space-y-4">
                {/* Mobile Top Header Banner */}
                <div className="bg-[#232a55] text-white py-4 px-4 rounded-2xl text-center shadow-xs">
                  <h3 className="text-[17px] font-black uppercase tracking-wider font-display text-white">
                    {activeDay === 1 ? 'NGÀY 1 · THỨ 7, 17.10.2026' : 'NGÀY 2 · CHỦ NHẬT, 18.10.2026'}
                  </h3>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#b8c4f5] uppercase mt-1">
                    {activeDay === 1 ? 'PHIÊN BÁO CÁO KHOA HỌC' : 'PHIÊN THỊ PHẠM & MỔ TRỰC TIẾP'}
                  </p>
                </div>

                {timeSlots.map((slot, sIdx) => {
                  const isSinglePlenary = slot.items.length === 1 && slot.isPlenary;
                  const singleItem = slot.items[0];

                  if (isSinglePlenary) {
                    const lowerTitle = singleItem.title.toLowerCase();
                    const isPinkHighlighted =
                      lowerTitle.includes('khai mạc') ||
                      lowerTitle.includes('bài phát biểu chính') ||
                      lowerTitle.includes('tổng kết') ||
                      lowerTitle.includes('gala') ||
                      lowerTitle.includes('bế mạc');

                    return (
                      <div key={`mob-plenary-${sIdx}`} className="space-y-2">
                        {/* Time Badge */}
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-800">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-black text-[#002045]">
                            <Clock className="w-3.5 h-3.5 text-[#174ea6]" />
                            <span>{slot.time}</span>
                          </div>
                          <span className="text-[10.5px] font-semibold text-slate-500">
                            {slot.duration}
                          </span>
                        </div>

                        {/* Plenary Session Card */}
                        <div
                          className={`p-4 rounded-2xl border transition-all ${
                            isPinkHighlighted
                              ? 'bg-gradient-to-br from-[#fdf2f7] to-[#fae5ef] border-[#f0c2db] text-slate-900 shadow-xs'
                              : 'bg-gradient-to-br from-[#f0f4ff] to-[#e5edff] border-[#c2d4f5] text-slate-900 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isPinkHighlighted
                                  ? 'bg-[#d52b66]/15 text-[#b81d51]'
                                  : 'bg-blue-100 text-[#174ea6]'
                              }`}
                            >
                              {isPinkHighlighted ? '★ Phiên Toàn Thể Đặc Biệt' : 'Phiên Toàn Thể · Cả 4 Phòng'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              Tất cả đại biểu
                            </span>
                          </div>
                          <h4 className="text-[15px] font-black text-slate-900 leading-snug">
                            {singleItem.title}
                          </h4>
                          {singleItem.description && (
                            <p className="text-[12px] text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line font-normal">
                              {singleItem.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Parallel Sessions
                  const hallsToRender = [1, 2, 3, 4].filter((num) => {
                    if (mobileHallFilter === 'all') return true;
                    return mobileHallFilter === String(num);
                  });

                  const matchingItems = hallsToRender
                    .map((num) => ({
                      hallNum: num,
                      item: getItemForHall(slot.items, num),
                      meta: hallHeaders[num - 1],
                    }))
                    .filter((entry) => entry.item !== undefined);

                  if (matchingItems.length === 0) return null;

                  return (
                    <div key={`mob-slot-${sIdx}`} className="space-y-2">
                      {/* Time Badge */}
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-800">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-black text-[#002045]">
                          <Clock className="w-3.5 h-3.5 text-[#174ea6]" />
                          <span>{slot.time}</span>
                        </div>
                        <span className="text-[10.5px] font-semibold text-slate-500">
                          {slot.duration}
                        </span>
                      </div>

                      {/* Cards for Halls in this slot */}
                      <div className="space-y-2.5">
                        {matchingItems.map(({ hallNum, item, meta }) => {
                          if (!item) return null;
                          const { category, topic } = parseTitle(item.title);
                          const bullets = parseBullets(item.description);

                          return (
                            <div
                              key={`mob-item-${sIdx}-${hallNum}`}
                              className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs"
                            >
                              <div
                                className="px-3.5 py-2 text-white flex items-center justify-between text-xs"
                                style={{ backgroundColor: meta.bg }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold uppercase tracking-wider text-[11px]">
                                    {meta.title}
                                  </span>
                                  <span className="opacity-80 text-[10px] font-medium hidden xs:inline">
                                    • {meta.sub}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20">
                                  HT {hallNum}
                                </span>
                              </div>

                              <div className="p-3.5 space-y-2">
                                <div className="text-[10.5px] font-semibold text-slate-500 xs:hidden">
                                  {meta.sub}
                                </div>

                                {category && (
                                  <div>
                                    <span className="inline-block text-[10.5px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                      {category}
                                    </span>
                                  </div>
                                )}

                                <h4 className="text-[14px] font-black text-slate-900 leading-snug">
                                  {topic}
                                </h4>

                                {bullets.length > 0 && (
                                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                                    {bullets.map((b, bIdx) => (
                                      <div
                                        key={bIdx}
                                        className="text-[12px] text-slate-600 flex items-start gap-2 leading-relaxed"
                                      >
                                        <span className="text-[#174ea6] font-bold shrink-0 mt-0.5">▪</span>
                                        <span>{b}</span>
                                      </div>
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
            )}

            {/* MASTER 4-HALL TABLE (Always visible on desktop, or on mobile when 'table' is active) */}
            <div
              className={`rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg bg-white border border-[#e2d5df] ${
                mobileLayoutMode === 'cards' ? 'hidden md:block' : 'block'
              }`}
            >
              {/* Top Dark Navy Banner matching screenshot */}
              <div className="bg-[#232a55] text-white py-5 px-4 sm:py-7 text-center">
                <h3 className="text-[19px] sm:text-[23px] md:text-[25px] font-black uppercase tracking-wider font-display text-white">
                  {activeDay === 1 ? 'NGÀY 1 · THỨ 7, 17.10.2026' : 'NGÀY 2 · CHỦ NHẬT, 18.10.2026'}
                </h3>
                <p className="text-[10.5px] sm:text-[12px] font-semibold tracking-[0.22em] text-[#b8c4f5] uppercase mt-1.5">
                  {activeDay === 1 ? 'PHIÊN BÁO CÁO KHOA HỌC' : 'PHIÊN THỊ PHẠM & MỔ TRỰC TIẾP'}
                </p>
              </div>

              {/* Mobile swipe helper */}
              <div className="lg:hidden text-center text-[11px] text-slate-500 py-1.5 bg-slate-50 border-b border-[#ebd9e4]">
                👉 Vuốt ngang để xem chi tiết đầy đủ 4 hội trường (Cột thời gian được cố định bên trái)
              </div>

              {/* Master Table with Horizontal Scrolling */}
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[780px] sm:min-w-[860px] lg:min-w-full border-collapse">
                  {/* Table 5-Column Colored Headers */}
                  <thead>
                    <tr className="text-white text-center select-none font-display">
                      {/* Time Header with Sticky Left */}
                      <th className="w-[14%] min-w-[95px] sm:min-w-[110px] bg-[#546197] py-3.5 px-2 text-[12px] sm:text-[13px] font-bold border-r border-white/20 align-middle sticky left-0 z-20 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.2)]">
                        Thời gian
                      </th>

                      {/* 4 Hall Headers */}
                      {hallHeaders.map((hall, idx) => (
                        <th
                          key={hall.num}
                          className={`w-[21.5%] min-w-[165px] py-3 px-2 align-middle ${
                            idx < 3 ? 'border-r border-white/20' : ''
                          }`}
                          style={{ backgroundColor: hall.bg }}
                        >
                          <div className="text-[12px] sm:text-[13px] font-bold tracking-wide leading-tight">
                            {hall.title}
                          </div>
                          <div className="text-[9.5px] sm:text-[10.5px] font-normal uppercase text-white/90 leading-tight mt-0.5">
                            {hall.sub}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-[#ebd9e4]">
                    {timeSlots.map((slot, sIdx) => {
                      const isSinglePlenary = slot.items.length === 1 && slot.isPlenary;
                      const singleItem = slot.items[0];

                      if (isSinglePlenary) {
                        const lowerTitle = singleItem.title.toLowerCase();
                        const isPinkHighlighted =
                          lowerTitle.includes('khai mạc') ||
                          lowerTitle.includes('bài phát biểu chính') ||
                          lowerTitle.includes('tổng kết') ||
                          lowerTitle.includes('gala') ||
                          lowerTitle.includes('bế mạc');

                        const rowBgClass = isPinkHighlighted ? 'bg-[#fcf2f7]' : 'bg-white';
                        const rowHoverClass = isPinkHighlighted ? 'hover:bg-[#fae8f1]' : 'hover:bg-slate-50/70';

                        return (
                          <tr
                            key={`slot-${sIdx}`}
                            className={`${rowBgClass} ${rowHoverClass} border-b border-[#ebd9e4] transition-colors`}
                          >
                            {/* Time cell with sticky left */}
                            <td
                              className={`py-3 sm:py-3.5 px-2 text-center border-r border-[#ebd9e4] align-middle sticky left-0 z-10 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.1)] ${
                                isPinkHighlighted ? 'bg-[#fcf2f7]' : 'bg-white'
                              }`}
                            >
                              <span className="font-bold text-[11px] sm:text-[12px] text-slate-800 font-mono">
                                {slot.time}
                              </span>
                            </td>

                            {/* Merged 4-Hall Content Cell */}
                            <td colSpan={4} className="py-3 sm:py-3.5 px-4 text-center align-middle">
                              <div className="font-bold text-[13px] sm:text-[14px] text-slate-900 leading-tight">
                                {singleItem.title}
                              </div>
                              {singleItem.description && (
                                <div className="text-[11px] sm:text-[12px] text-slate-600 mt-1 leading-snug font-normal">
                                  {singleItem.description}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      }

                      // Parallel 4-Hall Session Row
                      return (
                        <tr
                          key={`slot-${sIdx}`}
                          className="bg-white hover:bg-slate-50/60 border-b border-[#ebd9e4] transition-colors"
                        >
                          {/* Time cell with sticky left */}
                          <td className="py-4 px-2 text-center border-r border-[#ebd9e4] align-middle sticky left-0 z-10 bg-white shadow-[2px_0_6px_-2px_rgba(0,0,0,0.1)]">
                            <span className="font-bold text-[11px] sm:text-[12px] text-slate-800 font-mono">
                              {slot.time}
                            </span>
                          </td>

                          {/* 4 Hall Columns */}
                          {[1, 2, 3, 4].map((hallNum) => {
                            const cellItem = getItemForHall(slot.items, hallNum);

                            if (!cellItem) {
                              return (
                                <td
                                  key={hallNum}
                                  className={`py-3.5 px-3 text-center align-middle ${
                                    hallNum < 4 ? 'border-r border-[#ebd9e4]' : ''
                                  }`}
                                >
                                  <span className="text-slate-400 text-xs italic">Nghỉ tự do</span>
                                </td>
                              );
                            }

                            const { category, topic } = parseTitle(cellItem.title);
                            const bullets = parseBullets(cellItem.description);

                            return (
                              <td
                                key={hallNum}
                                className={`py-3.5 px-2.5 sm:px-3.5 text-center align-middle ${
                                  hallNum < 4 ? 'border-r border-[#ebd9e4]' : ''
                                }`}
                              >
                                {category && (
                                  <div className="text-[11px] sm:text-[11.5px] font-medium text-[#5c6d88] mb-0.5">
                                    {category}
                                  </div>
                                )}
                                <div className="text-[13px] sm:text-[13.5px] font-black text-slate-900 leading-tight mb-1">
                                  {topic}
                                </div>
                                {bullets.length > 0 && (
                                  <div className="text-[11px] sm:text-[11.5px] text-slate-600 leading-relaxed font-normal space-y-0.5">
                                    {bullets.map((b, bIdx) => (
                                      <div key={bIdx}>
                                        {b.startsWith('·') ? b : `· ${b}`}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                    ? 'bg-[#1c234f] text-white shadow-xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-[#1c234f]'
                }`}
              >
                Hội trường 1 ({hallHeaders[0].sub})
              </button>
              <button
                onClick={() => setSelectedHallFilter('h2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHallFilter === 'h2'
                    ? 'bg-[#4e5898] text-white shadow-xs'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-[#4e5898]'
                }`}
              >
                Hội trường 2 ({hallHeaders[1].sub})
              </button>
              <button
                onClick={() => setSelectedHallFilter('h3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHallFilter === 'h3'
                    ? 'bg-[#8d95c4] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#546197]'
                }`}
              >
                Hội trường 3 ({hallHeaders[2].sub})
              </button>
              <button
                onClick={() => setSelectedHallFilter('h4')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHallFilter === 'h4'
                    ? 'bg-[#c6a4ba] text-white shadow-xs'
                    : 'bg-pink-50 hover:bg-pink-100 text-[#9c5980]'
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
