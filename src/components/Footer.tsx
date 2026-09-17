import React from 'react';
import { Phone, Mail, MapPin, Verified, ShieldCheck, Award, Map } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

interface FooterProps {
  onOpenModal: (type: 'cme' | 'layout' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  const { cmsData, openAdmin } = useCMS();
  const eventDetails = cmsData.eventDetails;
  const footer = cmsData.footerConfig || {
    brandTitle: 'VIỆT – HÀN 2026',
    brandDescription:
      'Đại hội Khoa học Thẩm mỹ Việt – Hàn thường niên quy tụ 1.000+ đại biểu, 11 chuyên gia đầu ngành Hàn Quốc, 4 hội trường khoa học song song và phẫu thuật thị phạm trực tiếp.',
    tag1: '1.000+ Đại biểu',
    tag2: '4 Hội trường Khoa học',
    organizersTitle: 'ĐƠN VỊ CHỦ TRÌ & ĐỒNG TỔ CHỨC',
    organizer1Name: 'Bệnh viện Trung ương Quân đội 108',
    organizer1Sub: 'Hà Nội, Việt Nam',
    organizer2Name: 'KSAPS • VSAPS',
    organizer2Sub: 'BV 108 • KHIDI • SNUBH • KBIT • MOHW',
    partnersTitle: 'HIỆP HỘI CHUYÊN MÔN ĐỒNG HÀNH',
    partner1Name: 'KSAPS',
    partner1Sub: 'Hội Phẫu thuật Tạo hình Thẩm mỹ Hàn Quốc',
    partner2Name: 'VSAPS',
    partner2Sub: 'Hội Phẫu thuật Tạo hình Thẩm mỹ Việt Nam',
    contactTitle: 'THÔNG TIN LIÊN HỆ & HOTLINE',
    hotline: '+82-10-4159-8777',
    email: 'secretary@kbitassociation.com',
    venueName: 'Bệnh viện Trung ương Quân đội 108, Hà Nội',
    copyrightText: '© 2026 Hội nghị Khoa học Thẩm mỹ Việt – Hàn 2026. Bản quyền thuộc về Ban Tổ Chức Congress 2026 & BV TWQĐ 108.',
  };

  return (
    <footer className="w-full bg-[#eff4ff] mt-2 sm:mt-4 border-t border-[#e5eeff] shadow-[0_-1px_12px_rgba(0,0,0,0.02)] pb-24 md:pb-0">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Intro */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <span className="text-[17px] font-extrabold text-primary font-display tracking-tight">
                {footer.brandTitle}
              </span>
            </div>

            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              {footer.brandDescription}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {footer.tag1 && (
                <span className="px-3 py-1 rounded-lg bg-[#dce9ff] text-primary text-[11.5px] font-bold font-display">
                  {footer.tag1}
                </span>
              )}
              {footer.tag2 && (
                <span className="px-3 py-1 rounded-lg bg-secondary/15 text-secondary text-[11.5px] font-bold font-display">
                  {footer.tag2}
                </span>
              )}
            </div>
          </div>

          {/* Column 2: Organizers */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-primary font-bold font-display mb-1">
              {footer.organizersTitle}
            </span>
            <div className="flex flex-col gap-1.5 text-on-surface-variant text-[13px]">
              <p className="font-bold text-primary">{footer.organizer1Name}</p>
              <p className="text-[12px]">{footer.organizer1Sub}</p>
              <p className="mt-2 font-bold text-primary">{footer.organizer2Name}</p>
              <p className="text-[12px]">{footer.organizer2Sub}</p>
            </div>
          </div>

          {/* Column 3: Partner Associations */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-primary font-bold font-display mb-1">
              {footer.partnersTitle}
            </span>
            <div className="flex flex-col gap-1.5 text-on-surface-variant text-[13px]">
              <p className="font-bold text-primary">{footer.partner1Name}</p>
              <p className="text-[12px]">{footer.partner1Sub}</p>
              <p className="mt-2 font-bold text-primary">{footer.partner2Name}</p>
              <p className="text-[12px]">{footer.partner2Sub}</p>
            </div>
          </div>

          {/* Column 4: Contact & Secretariat */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-primary font-bold font-display mb-1">
              {footer.contactTitle}
            </span>
            <div className="flex flex-col gap-3 text-on-surface-variant text-[13px]">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5 shrink-0">
                  call
                </span>
                <div>
                  <p className="font-bold text-primary">Hotline Ban Thư Ký:</p>
                  <p className="text-[12px] font-medium">{footer.hotline || eventDetails.hotline}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5 shrink-0">
                  mail
                </span>
                <div>
                  <p className="font-bold text-primary">Email Tiếp Nhận:</p>
                  <p className="text-[12px]">{footer.email || eventDetails.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5 shrink-0">
                  location_on
                </span>
                <div>
                  <p className="font-bold text-primary">Địa Điểm Tổ Chức:</p>
                  <p className="text-[12px] leading-snug">
                    {footer.venueName || eventDetails.venueName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal modal triggers */}
        <div className="pt-6 border-t border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant text-[12px]">
          <p className="text-center sm:text-left">
            {footer.copyrightText || `© 2026 ${eventDetails.title}. Bản quyền thuộc về ${eventDetails.venueShort} & Ban Tổ Chức Hội Thảo.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-5 font-semibold">
            <button
              onClick={() => onOpenModal('privacy')}
              className="px-2 py-1 rounded-lg hover:bg-white text-slate-600 hover:text-primary transition-colors cursor-pointer"
            >
              Bảo mật Y khoa
            </button>
            <button
              onClick={() => onOpenModal('cme')}
              className="px-2 py-1 rounded-lg hover:bg-white text-slate-600 hover:text-primary transition-colors cursor-pointer"
            >
              Điều khoản CME
            </button>
            <button
              onClick={() => onOpenModal('layout')}
              className="px-2 py-1 rounded-lg hover:bg-white text-slate-600 hover:text-primary transition-colors cursor-pointer"
            >
              Sơ đồ hội trường
            </button>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                openAdmin();
              }}
              className="px-2 py-1 rounded-lg hover:bg-white text-slate-400 hover:text-primary transition-colors cursor-pointer text-[11.5px]"
              title="Mở trang Quản trị CMS"
            >
              Quản trị CMS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
