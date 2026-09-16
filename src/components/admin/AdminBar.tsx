import React, { useState } from 'react';
import { Settings, Users, Image as ImageIcon, Calendar, FileText, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

export const AdminBar: React.FC = () => {
  const { cmsData, openAdmin, setActiveAdminTab } = useCMS();
  const [copied, setCopied] = useState(false);

  const copyAdminLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const adminUrl = `${window.location.origin}/admin`;
    navigator.clipboard.writeText(adminUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Floating Admin Toggle Button (Always accessible at bottom-left, responsive on mobile) */}
      <div className="fixed bottom-20 sm:bottom-5 left-3 sm:left-5 z-40 flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => openAdmin()}
          className="group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-[#174ea6] to-[#c83271] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-white/20 cursor-pointer font-sans backdrop-blur-md"
          title="Mở hệ thống CMS quản trị (Đường dẫn trực tiếp: /admin)"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-45 transition-transform shrink-0">
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] sm:text-[12.5px] font-black tracking-wide flex items-center gap-1 sm:gap-1.5">
              <span className="hidden xs:inline">CMS QUẢN TRỊ</span>
              <span className="xs:hidden">CMS</span>
              <span className="px-1 py-0.2 rounded bg-white/20 text-[9px] sm:text-[10px] font-mono text-cyan-200">
                /admin
              </span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-[9px] sm:text-[10px] text-white/80 font-medium hidden sm:inline">
              Sửa chữ, ảnh, logo &amp; {cmsData.registrations.length} đại biểu
            </span>
          </div>
        </button>

        {/* Quick Copy Link Button */}
        <button
          onClick={copyAdminLink}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-white/20 cursor-pointer transition-transform hover:scale-105 shrink-0"
          title="Sao chép đường dẫn trực tiếp /admin"
        >
          {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />}
        </button>
      </div>

      {/* Top Thin Admin Notification Strip (Hidden on mobile) */}
      <aside aria-label="CMS Management Bar" className="hidden md:flex bg-slate-900 text-white text-[11px] px-3 sm:px-4 py-1.5 border-b border-slate-800 items-center justify-between gap-2 sm:gap-4 shadow-inner overflow-x-auto no-scrollbar whitespace-nowrap">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#174ea6] text-[10px] font-extrabold uppercase tracking-wider shrink-0">
            CMS VIỆT - HÀN 2026
          </span>
          <span className="text-slate-300 hidden md:inline">
            Hệ thống quản trị thời gian thực tích hợp trực tiếp tại liên kết
          </span>

          {/* Direct link badge */}
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              openAdmin();
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-cyan-300 hover:text-white font-mono text-[10.5px] transition-colors cursor-pointer border border-cyan-500/30"
            title="Nhấn để mở CMS quản trị tại /admin"
          >
            <LinkIcon className="w-3 h-3 text-cyan-400" />
            <span>/admin</span>
          </a>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={() => {
              setActiveAdminTab('speakers');
              openAdmin('speakers');
            }}
            className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Quản lý 6 chuyên gia"
          >
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>{cmsData.experts.length} Chuyên gia</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={() => {
              setActiveAdminTab('agenda');
              openAdmin('agenda');
            }}
            className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Quản lý lịch trình"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{cmsData.agenda.length} Phiên</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={() => {
              setActiveAdminTab('media');
              openAdmin('media');
            }}
            className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Quản lý hình ảnh và banner"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Kho ảnh</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={() => {
              setActiveAdminTab('registrations');
              openAdmin('registrations');
            }}
            className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer transition-colors font-bold"
            title="Xem danh sách đại biểu"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-extrabold">{cmsData.registrations.length} Đại biểu</span>
          </button>

          <button
            onClick={() => openAdmin()}
            className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[10.5px] transition-all ml-1 cursor-pointer flex items-center gap-1"
          >
            <Settings className="w-3 h-3 text-pink-400" />
            <span>Mở Bảng Điều Khiển</span>
          </button>
        </div>
      </aside>
    </>
  );
};
