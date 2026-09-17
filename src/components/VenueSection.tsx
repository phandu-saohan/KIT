import React from 'react';
import { MapPin, Phone, Car, Plane, Navigation, ExternalLink } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const VenueSection: React.FC = () => {
  const { cmsData } = useCMS();
  const eventDetails = cmsData.eventDetails;

  return (
    <section className="w-full pt-10 sm:pt-14 pb-5 sm:pb-8 bg-white" id="dia-diem">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[12px] uppercase text-secondary font-bold tracking-widest font-display">
            ĐỊA ĐIỂM TỔ CHỨC CHÍNH THỨC
          </span>
          <h2 className="text-[26px] sm:text-[34px] text-primary font-extrabold mt-1 font-display tracking-tight">
            Hướng Dẫn Đến Bệnh Viện TWQĐ 108, Hà Nội
          </h2>
          <p className="text-[13.5px] text-on-surface-variant mt-2 leading-relaxed">
            Hội nghị diễn ra tại {eventDetails.venueName} — Cơ sở y tế tuyến cuối đặc biệt hàng đầu cả nước với cơ sở vật chất hiện đại bậc nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Venue Meta Details */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-6 rounded-3xl bg-[#f8f9ff] border border-[#e5eeff] shadow-xs flex flex-col gap-5">
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">location_on</span>
                </div>
                <div>
                  <h4 className="text-[15px] text-primary font-bold font-display">
                    Địa chỉ chính xác:
                  </h4>
                  <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
                    {eventDetails.venueName}
                    <br />
                    <span className="font-semibold text-primary">
                      {eventDetails.venueAddress}
                    </span>
                  </p>
                </div>
              </div>

              {/* Parking */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">local_parking</span>
                </div>
                <div>
                  <h4 className="text-[15px] text-primary font-bold font-display">
                    Bãi đỗ xe ô tô &amp; đón tiếp đại biểu:
                  </h4>
                  <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
                    Khuôn viên Bệnh viện Trung ương Quân đội 108 (Số 1 Trần Hưng Đạo) có khu vực đón tiếp và bãi đỗ xe ưu tiên dành riêng cho Đại biểu Hội nghị Thẩm mỹ Việt – Hàn 2026.
                  </p>
                </div>
              </div>

              {/* Airport Distance */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-tertiary-container text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">flight_land</span>
                </div>
                <div>
                  <h4 className="text-[15px] text-primary font-bold font-display">
                    Từ Sân bay Quốc tế Nội Bài:
                  </h4>
                  <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
                    Cách sân bay Nội Bài khoảng 30–35 km (khoảng 35–45 phút di chuyển taxi/ô tô qua cầu Nhật Tân), thuận tiện cho các đoàn chuyên gia Hàn Quốc và đại biểu bay từ TP.HCM, Đà Nẵng.
                  </p>
                </div>
              </div>
            </div>

            {/* Hotline banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px]">support_agent</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] sm:text-[13px] text-primary font-bold font-display truncate">
                    Ban Thư Ký KBIT Hỗ Trợ
                  </p>
                  <p className="text-[11.5px] sm:text-[12px] text-on-surface-variant font-medium truncate">
                    {eventDetails.hotline} • {eventDetails.email}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${eventDetails.hotline.replace(/\s+/g, '')}`}
                className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-primary text-white text-[12px] font-bold hover:bg-primary-container transition-colors shadow-xs shrink-0 active:scale-95"
              >
                Liên Hệ
              </a>
            </div>
          </div>

          {/* Map Preview Image & Route CTA */}
          <div className="lg:col-span-7">
            <div
              className="w-full h-[320px] sm:h-[420px] bg-cover bg-center rounded-3xl shadow-lg relative overflow-hidden flex items-end p-3 sm:p-6 group border border-[#e5eeff]"
              style={{
                backgroundImage: `url('${eventDetails.mapImageUrl}')`,
              }}
            >
              {/* Glass Info Pill at bottom of map */}
              <div className="bg-white/95 backdrop-blur-md p-3 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 sm:gap-3 border border-white/60">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px] sm:text-[26px]">domain</span>
                  </div>
                  <div>
                    <p className="text-[14px] sm:text-[16px] text-primary font-bold font-display leading-tight">
                      {eventDetails.venueShort}
                    </p>
                    <p className="text-[11px] sm:text-[12px] text-on-surface-variant line-clamp-1">
                      {eventDetails.venueAddress}
                    </p>
                  </div>
                </div>

                <a
                  href={eventDetails.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl bg-secondary text-white text-[12.5px] sm:text-[13px] font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap active:scale-[0.98]"
                >
                  <span>Mở Bản Đồ Chỉ Đường</span>
                  <span className="material-symbols-outlined text-[15px] sm:text-[16px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
