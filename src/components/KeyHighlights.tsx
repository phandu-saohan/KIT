import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { ExpertSpeaker } from '../types';
import {
  Award,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building2,
  X,
  Calendar,
  Layers,
  FileText,
  Activity,
  Users,
  Store,
} from 'lucide-react';

interface KeyHighlightsProps {
  onOpenCmeModal?: () => void;
  onOpenLayoutModal?: () => void;
}

export const KeyHighlights: React.FC<KeyHighlightsProps> = () => {
  const { cmsData } = useCMS();
  const [selectedExpert, setSelectedExpert] = useState<ExpertSpeaker | null>(null);
  const expertsList = cmsData.experts;

  return (
    <section
      className="w-full py-16 sm:py-20 bg-gradient-to-b from-[#f8faff] via-[#fff5f8]/35 to-[#f8faff] relative border-b border-slate-200/80"
      id="diem-nhan"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            HEADER SECTION (STYLIZED ACCORDING TO OFFICIAL CONGRESS)
           ========================================================================= */}
        {cmsData.eventDetails.showHighlightsHeader !== false && (
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            {/* Official Organizing Entities Pill */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-slate-200/80 shadow-xs text-[11.5px] font-bold text-slate-600 mb-3.5">
              <span className="text-[#174ea6] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#174ea6]" />
                CHỦ TRÌ: {cmsData.eventDetails.highlightsHostsText || cmsData.eventDetails.hostsText || 'KSAPS • VSAPS • BV QUÂN Y 175'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-[#c83271] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c83271]" />
                ĐỒNG TỔ CHỨC: {cmsData.eventDetails.highlightsCoOrganizersText || cmsData.eventDetails.coOrganizersText || 'KHIDI • KBIT • SNUH'}
              </span>
            </div>

            <p className="text-[12px] sm:text-[13px] uppercase font-bold tracking-widest text-slate-500 font-display">
              {cmsData.eventDetails.highlightsSubtitle || 'K-BEAUTY MEETS 2026 · HỘI NGHỊ TRỌNG ĐIỂM'}
            </p>

            <h2 className="text-[30px] sm:text-[42px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d81b60] via-[#c83271] to-[#174ea6] mt-1.5 font-display tracking-tight uppercase leading-tight">
              {cmsData.eventDetails.highlightsTitle || cmsData.eventDetails.title || 'Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026'}
            </h2>

            <p className="text-[14px] sm:text-[15.5px] text-slate-600 mt-3 leading-relaxed max-w-2xl mx-auto font-medium">
              {cmsData.eventDetails.highlightsDescription || 'Sự kiện khoa học thẩm mỹ quy mô lớn tại Bệnh viện Trung ương Quân đội 108, quy tụ các chuyên gia và bác sĩ hàng đầu đến từ Việt Nam và Hàn Quốc.'}
            </p>
          </div>
        )}

        {/* =========================================================================
            CONGRESS OVERVIEW STATS (6 METRIC CARDS)
           ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-12 sm:mb-16">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover:shadow-md hover:border-[#174ea6]/40 transition-all">
            <span className="text-[26px] sm:text-[30px] font-black text-[#174ea6] font-display">02</span>
            <span className="text-[11px] font-bold text-slate-600 uppercase mt-0.5">Ngày tổ chức</span>
            <span className="text-[10px] text-[#c83271] font-bold mt-1">17–18/10/2026</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover:shadow-md hover:border-[#c83271]/40 transition-all">
            <span className="text-[26px] sm:text-[30px] font-black text-[#c83271] font-display">≈1.000</span>
            <span className="text-[11px] font-bold text-slate-600 uppercase mt-0.5">Đại biểu dự kiến</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Bác sĩ & Viện trưởng</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover:shadow-md hover:border-[#174ea6]/40 transition-all">
            <span className="text-[26px] sm:text-[30px] font-black text-[#174ea6] font-display">36</span>
            <span className="text-[11px] font-bold text-slate-600 uppercase mt-0.5">Báo cáo khoa học</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Ngày 1 (Thứ Bảy)</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover:shadow-md hover:border-[#c83271]/40 transition-all">
            <span className="text-[26px] sm:text-[30px] font-black text-[#c83271] font-display">15</span>
            <span className="text-[11px] font-bold text-slate-600 uppercase mt-0.5">Phiên thị phạm</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Phòng mổ & Lâm sàng</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover:shadow-md hover:border-[#174ea6]/40 transition-all">
            <span className="text-[26px] sm:text-[30px] font-black text-[#174ea6] font-display">04</span>
            <span className="text-[11px] font-bold text-slate-600 uppercase mt-0.5">Hội trường song song</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Đa tầng chuyên đề</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover:shadow-md hover:border-[#c83271]/40 transition-all">
            <span className="text-[26px] sm:text-[30px] font-black text-[#c83271] font-display">22+</span>
            <span className="text-[11px] font-bold text-slate-600 uppercase mt-0.5">Doanh nghiệp HQ</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Triển lãm & Giao thương</span>
          </div>
        </div>

        {/* =========================================================================
            4 HALLS OVERVIEW
           ========================================================================= */}
        <div className="mb-14 sm:mb-18">
          <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#c83271] font-display">
              CẤU TRÚC KHÔNG GIAN HỘI NGHỊ
            </span>
            <h3 className="text-[22px] sm:text-[28px] font-black text-[#002045] font-display mt-1">
              Khám Phá 4 Hội Trường Chuyên Đề Trong Cùng Một Sự Kiện
            </h3>
            <p className="text-[12.5px] sm:text-[13.5px] text-slate-600 mt-1.5 leading-relaxed">
              Sau phiên khai mạc toàn thể, hội nghị được triển khai đồng thời tại 4 hội trường chuyên đề, giúp đại biểu chủ động lựa chọn nội dung phù hợp với lĩnh vực quan tâm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hall 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#174ea6]/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#eff4ff] text-[#174ea6] font-mono text-[11px] font-extrabold uppercase mb-2.5">
                  Hội trường 1 · Khoa học
                </span>
                <h4 className="text-[16px] font-extrabold text-slate-900 font-display mb-2 group-hover:text-[#174ea6] transition-colors">
                  Phẫu Thuật Thẩm Mỹ
                </h4>
                <div className="text-[12px] text-slate-600 leading-relaxed space-y-1.5">
                  <p><strong className="text-slate-800">Ngày 1:</strong> Báo cáo khoa học Nâng mũi, tạo hình mí mắt, Deep Plane Facelift, phẫu thuật ngực.</p>
                  <p><strong className="text-slate-800">Ngày 2:</strong> Phẫu thuật trực tiếp từ phòng mổ BV 108 (Nâng mũi & Căng da cổ).</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-[#174ea6] flex items-center gap-1">
                <span>Lễ khai mạc và bế mạc toàn thể</span>
              </div>
            </div>

            {/* Hall 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#c83271]/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#fff1f5] text-[#c83271] font-mono text-[11px] font-extrabold uppercase mb-2.5">
                  Hội trường 2 · Khoa học
                </span>
                <h4 className="text-[16px] font-extrabold text-slate-900 font-display mb-2 group-hover:text-[#c83271] transition-colors">
                  Thẩm Mỹ Nội Khoa
                </h4>
                <div className="text-[12px] text-slate-600 leading-relaxed space-y-1.5">
                  <p><strong className="text-slate-800">Ngày 1:</strong> Báo cáo khoa học Filler, PCL collagen, Botulinum Toxin, Căng chỉ vector, Skin Booster Exosome & PDLLA Juvelook.</p>
                  <p><strong className="text-slate-800">Ngày 2:</strong> Trình diễn lâm sàng trực tiếp kỹ thuật tiêm và chỉ thẩm mỹ.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-[#c83271] flex items-center gap-1">
                <span>Trình diễn lâm sàng trực tiếp</span>
              </div>
            </div>

            {/* Hall 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#f0fdf4] text-[#15803d] font-mono text-[11px] font-extrabold uppercase mb-2.5">
                  Hội trường 3 · Khoa học
                </span>
                <h4 className="text-[16px] font-extrabold text-slate-900 font-display mb-2 group-hover:text-[#15803d] transition-colors">
                  Công Nghệ &amp; Thiết Bị EBD
                </h4>
                <div className="text-[12px] text-slate-600 leading-relaxed space-y-1.5">
                  <p><strong className="text-slate-800">Ngày 1:</strong> Báo cáo khoa học Laser & Pico, RF vi kim, HIFU đa tầng, công nghệ đông huỷ mỡ và tạo hình cơ thể.</p>
                  <p><strong className="text-slate-800">Ngày 2:</strong> Thị phạm trực tiếp trên hệ thống máy móc thiết bị tiên tiến.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-[#15803d] flex items-center gap-1">
                <span>Khu trưng bày thiết bị mở cho đại biểu</span>
              </div>
            </div>

            {/* Hall 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-mono text-[11px] font-extrabold uppercase mb-2.5">
                  Hội trường 4 · Doanh nghiệp
                </span>
                <h4 className="text-[16px] font-extrabold text-slate-900 font-display mb-2 group-hover:text-amber-800 transition-colors">
                  Giới Thiệu Doanh Nghiệp &amp; B2B
                </h4>
                <div className="text-[12px] text-slate-600 leading-relaxed space-y-1.5">
                  <p><strong className="text-slate-800">Xuyên suốt 2 ngày:</strong> Giới thiệu sản phẩm, công nghệ và giải pháp mới (20 phút / doanh nghiệp).</p>
                  <p><strong className="text-slate-800">Kết nối B2B:</strong> Giao lưu chuyên môn, tìm đối tác phân phối và ký kết thoả thuận hợp tác.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <span>Triển lãm diễn ra xuyên suốt 2 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SPEAKERS HEADER
           ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff4ff] text-[#174ea6] text-[11px] uppercase font-bold tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#174ea6]" />
            <span>ĐỘI NGŨ BÁO CÁO VIÊN &amp; CHUYÊN GIA HÀN QUỐC</span>
          </div>

          <h3 className="text-[26px] sm:text-[36px] font-black text-slate-900 font-display tracking-tight">
            Gặp Gỡ Các Chuyên Gia Thẩm Mỹ Hàng Đầu
          </h3>

          <p className="text-[13.5px] sm:text-[15px] text-slate-600 mt-2 leading-relaxed max-w-2xl mx-auto">
            Hội nghị quy tụ các giáo sư, bác sĩ giàu kinh nghiệm đến từ Hàn Quốc trực tiếp chia sẻ nghiên cứu mới, thị phạm lâm sàng và chuyển giao kỹ thuật chuyên sâu.
          </p>
        </div>

        {/* =========================================================================
            PROFESSIONAL EXPERTS GRID (HORIZONTAL CARD LAYOUT)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {expertsList.map((expert) => {
            const isKeynote =
              expert.roleTitle.toLowerCase().includes('mở màn') ||
              expert.roleTitle.toLowerCase().includes('chính') ||
              expert.roleTitle.toLowerCase().includes('ksaps');

            return (
              <div
                key={expert.id}
                onClick={() => setSelectedExpert(expert)}
                className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-[#c83271]/50 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-row overflow-hidden cursor-pointer min-h-[175px] sm:min-h-[195px]"
              >
                {/* Left Vertical Accent Line */}
                <div
                  className={`w-1.5 shrink-0 ${
                    isKeynote
                      ? 'bg-gradient-to-b from-[#d81b60] via-[#c83271] to-[#174ea6]'
                      : 'bg-gradient-to-b from-[#174ea6] via-[#0284c7] to-[#38bdf8]'
                  }`}
                />

                {/* Speaker Photo Left Column */}
                <div className="relative w-28 xs:w-32 sm:w-40 md:w-44 shrink-0 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 overflow-hidden h-full flex items-end justify-center">
                  <img
                    src={expert.avatarUrl}
                    alt={expert.name}
                    className="w-full h-full object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://kbitassociation.com/wp-content/themes/amlab/assets/images/events/heo-chan-young.png';
                    }}
                  />

                  {/* Dark subtle overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Badges on Photo */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs border border-white/80">
                      <span>🇰🇷</span>
                      <span className="text-[9px] text-slate-500 font-semibold">KR</span>
                    </span>
                  </div>

                  {/* Bottom Role tag on photo */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-bold shadow-xs truncate max-w-full ${
                        isKeynote
                          ? 'bg-gradient-to-r from-[#d81b60] to-[#c83271] text-white'
                          : 'bg-slate-900/90 text-white backdrop-blur-md'
                      }`}
                    >
                      {isKeynote ? (
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                      ) : (
                        <Award className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                      )}
                      <span className="truncate">{expert.roleTitle}</span>
                    </span>
                  </div>
                </div>

                {/* Card Content Right Column */}
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0 gap-1.5 sm:gap-2">
                  <div>
                    {/* Organization Pill */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#eff4ff] text-[#174ea6] border border-[#d0e1fd] truncate max-w-full">
                        <Building2 className="w-2.5 h-2.5 text-[#174ea6] shrink-0" />
                        <span className="truncate">{expert.badgeOrg}</span>
                      </span>
                    </div>

                    {/* Doctor Name */}
                    <h3 className="text-[14.5px] sm:text-[17px] font-black text-slate-900 font-display group-hover:text-[#c83271] transition-colors leading-tight truncate">
                      {expert.name}
                    </h3>
                  </div>

                  {/* Key Topic / Bio Preview */}
                  <div className="bg-[#f8faff] rounded-xl p-2 border border-slate-100 flex-1 flex flex-col justify-center overflow-hidden">
                    {expert.topic ? (
                      <p className="text-[11.5px] sm:text-[12px] text-slate-700 font-semibold line-clamp-2 leading-snug">
                        <span className="text-[#c83271] font-bold">Đề tài: </span>
                        {expert.topic}
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {expert.bioPoints.slice(0, 2).map((point, i) => (
                          <p key={i} className="text-[11px] text-slate-600 truncate">
                            • {point}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[10px] sm:text-[10.5px] text-slate-400 font-normal truncate">
                      {expert.bioPoints.length} thông tin chuyên môn
                    </span>

                    <span className="inline-flex items-center gap-1 text-[#174ea6] group-hover:text-[#c83271] transition-colors font-bold text-[11px] shrink-0">
                      <span>Chi tiết đề tài</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            DETAILED BIOGRAPHY POPUP MODAL
           ========================================================================= */}
        {selectedExpert && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setSelectedExpert(null)}
          >
            <div
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full p-4 sm:p-8 relative border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Gradient Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-[#d81b60] via-[#c83271] to-[#174ea6]" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedExpert(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-20"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Modal Body with smooth scrolling */}
              <div className="overflow-y-auto pr-1 space-y-4 sm:space-y-6 pt-2">
                {/* Doctor Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b border-slate-100 pb-4 sm:pb-6 text-center sm:text-left">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border-3 sm:border-4 border-white shadow-xl ring-2 ring-slate-100 flex items-end justify-center">
                      <img
                        src={selectedExpert.avatarUrl}
                        alt={selectedExpert.name}
                        className="w-full h-full object-contain object-bottom"
                      />
                    </div>
                    <span className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 text-[16px] sm:text-[18px] bg-white rounded-full p-1 shadow-md border border-slate-200">
                      🇰🇷
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-wide bg-[#eff4ff] text-[#174ea6]">
                        <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{selectedExpert.badgeOrg}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-pink-50 text-[#c83271]">
                        <Sparkles className="w-3 h-3" />
                        <span>Hàn Quốc</span>
                      </span>
                    </div>

                    <h3 className="text-[20px] sm:text-[26px] font-black text-slate-900 leading-tight font-display">
                      {selectedExpert.name}
                    </h3>

                    <p className="text-[12.5px] sm:text-[13.5px] font-bold text-[#c83271] mt-1.5 flex items-center justify-center sm:justify-start gap-1.5">
                      <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c83271]" />
                      <span>{selectedExpert.roleTitle}</span>
                    </p>
                  </div>
                </div>

                {/* Topic Banner if available */}
                {selectedExpert.topic && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#eff4ff] to-[#fff5f8] border border-[#d0e1fd]">
                    <span className="text-[10.5px] font-extrabold text-[#c83271] uppercase tracking-wider block mb-1">
                      Đề tài báo cáo / Thị phạm tại Hội nghị:
                    </span>
                    <p className="text-[13.5px] sm:text-[14.5px] font-bold text-[#002045] leading-snug">
                      "{selectedExpert.topic}"
                    </p>
                  </div>
                )}

                {/* Biography Section */}
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="text-[11px] sm:text-[12px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 sm:gap-2">
                      <GraduationCap className="w-4 h-4 text-[#174ea6]" />
                      <span>Hồ Sơ Năng Lực &amp; Quá Trình Công Tác:</span>
                    </h4>
                  </div>

                  {/* Bullet Points */}
                  <ul className="space-y-2 sm:space-y-3">
                    {selectedExpert.bioPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-[#174ea6] flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-[12.5px] sm:text-[13.5px] text-slate-700 leading-relaxed font-medium">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 pt-3 sm:pt-4 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026 · BV 108
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href="#chuong-trinh"
                    onClick={() => setSelectedExpert(null)}
                    className="flex-1 sm:flex-initial justify-center px-4 py-2.5 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#174ea6] text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Xem lịch báo cáo</span>
                  </a>

                  <button
                    onClick={() => setSelectedExpert(null)}
                    className="flex-1 sm:flex-initial justify-center px-5 py-2.5 sm:py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
