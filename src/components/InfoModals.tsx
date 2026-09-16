import React from 'react';
import { X, Award, Map, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';

interface InfoModalsProps {
  modalType: 'cme' | 'layout' | 'privacy' | null;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({ modalType, onClose }) => {
  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e5eeff] p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-on-surface-variant hover:bg-[#eff4ff] hover:text-primary transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODAL 1: CME REGULATIONS */}
        {modalType === 'cme' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-secondary tracking-widest font-display">
                  ĐÀO TẠO Y KHOA LIÊN TỤC
                </span>
                <h3 className="text-[20px] font-bold text-primary font-display">
                  Quy Chuẩn &amp; Tiêu Chuẩn Cấp Chứng Chỉ CME
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] text-[13px] text-primary space-y-2.5">
              <p className="font-semibold">
                Đơn vị cấp: Trung tâm Đào tạo &amp; Chỉ đạo tuyến — Bệnh viện Quân y 175 (Bộ Quốc phòng)
              </p>
              <p className="text-on-surface-variant">
                Chương trình đào tạo cập nhật kiến thức y khoa liên tục trong phẫu thuật tạo hình và da liễu thẩm mỹ kỹ thuật cao song phương Việt Nam – Hàn Quốc (<strong>CME: 3h tín chỉ</strong>).
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[12.5px] font-medium flex items-center gap-2">
                <span className="font-bold text-amber-800 shrink-0">Lệ phí CME:</span>
                <span><strong>Phí CME sẽ được thu tại Hội Thảo</strong> (thu trực tiếp tại bàn đón tiếp của Bệnh viện Quân Y 175).</span>
              </div>
            </div>

            <div className="space-y-3 text-[13px] text-on-surface-variant">
              <h4 className="font-bold text-primary text-[14px]">Điều kiện nhận chứng chỉ CME (3h tín chỉ):</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>
                    <strong>Đối tượng:</strong> Bác sĩ chuyên khoa Phẫu thuật tạo hình, Bác sĩ Da liễu, Bác sĩ Đa khoa có CCHN hoặc văn bằng tốt nghiệp chuyên ngành liên quan.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>
                    <strong>Điểm danh &amp; Tham dự:</strong> Check-in quét mã QR trước 13:30 và tham dự ít nhất 80% thời lượng toàn bộ hai phiên khoa học.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>
                    <strong>Hồ sơ nộp kèm &amp; Lệ phí:</strong> 01 Bản sao công chứng bằng Bác sĩ / CCHN + 01 ảnh thẻ 3x4 và hoàn tất lệ phí CME tại bàn đón tiếp hội thảo.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}

        {/* MODAL 2: AUDITORIUM & EXHIBITION BOOTHS LAYOUT */}
        {modalType === 'layout' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-secondary tracking-widest font-display">
                  SƠ ĐỒ KHÔNG GIAN
                </span>
                <h3 className="text-[20px] font-bold text-primary font-display">
                  Sơ Đồ Hội Trường &amp; 10 Gian Hàng Triển Lãm
                </h3>
              </div>
            </div>

            <p className="text-[13px] text-on-surface-variant">
              Tầng 2, Viện Chấn thương Chỉnh hình (CTCH) — Bệnh viện Quân y 175. Bố trí tối ưu cho đại biểu trải nghiệm thực tế công nghệ trước hội thảo và trong giờ giải lao Teabreak.
            </p>

            {/* Visual floor map mock representation */}
            <div className="p-5 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-3">
              <div className="w-full py-3 bg-primary text-white text-center rounded-xl font-bold text-sm tracking-wider uppercase font-display">
                SÂN KHẤU CHÍNH &amp; BÀN CHỦ TỌA ĐOÀN VIỆT – HÀN
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#e5eeff] text-center text-xs text-primary font-semibold">
                KHU VỰC 250 CHỖ NGỒI ĐẠI BIỂU (BÁC SĨ &amp; CHUYÊN GIA)
                <br />
                <span className="text-secondary font-normal">
                  (Mỗi ghế trang bị tai nghe phiên dịch AI thời gian thực song song)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {[
                  'Gian 1: Thiết bị HIFU',
                  'Gian 2: Skin Booster',
                  'Gian 3: Silicone 3D',
                  'Gian 4: Acellular ADM',
                  'Gian 5: Laser thẩm mỹ',
                  'Gian 6: Chỉ nâng cơ',
                  'Gian 7: Máy nâng cơ RF',
                  'Gian 8: Dược mỹ phẩm',
                  'Gian 9: Giải pháp SNUBH',
                  'Gian 10: Gian KSAPS HQ',
                ].map((booth, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white border border-[#e5eeff] text-center text-[11px] font-bold text-on-surface hover:border-secondary transition-colors"
                  >
                    {booth}
                  </div>
                ))}
              </div>

              <div className="w-full py-2 bg-purple-100 text-tertiary text-center rounded-xl font-semibold text-xs">
                KHU VỰC TIỆC TRÀ TEABREAK &amp; BÀN ĐÓN TIẾP CHECK-IN ĐẠI BIỂU
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Đóng sơ đồ
              </button>
            </div>
          </div>
        )}

        {/* MODAL 3: PRIVACY POLICY */}
        {modalType === 'privacy' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-secondary tracking-widest font-display">
                  TIÊU CHUẨN BẢO MẬT
                </span>
                <h3 className="text-[20px] font-bold text-primary font-display">
                  Quy Chế Bảo Mật Hồ Sơ Y Khoa Đại Biểu
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-[13px] text-on-surface-variant leading-relaxed">
              <p>
                Ban Tổ chức Hội thảo Khoa học Thẩm mỹ Việt – Hàn 2026 cam kết tôn trọng và bảo vệ tối đa dữ liệu thông tin cá nhân, học hàm, đơn vị công tác và hồ sơ chứng chỉ hành nghề của tất cả đại biểu tham dự.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Thông tin học vị và đơn vị công tác chỉ sử dụng duy nhất cho mục đích thẩm định đủ điều kiện tham dự hội nghị khoa học và cấp chứng chỉ CME theo quy chế của Bệnh viện Quân y 175.
                </li>
                <li>
                  Mã số định danh QR Code của từng đại biểu là duy nhất, không chia sẻ cho bên thứ ba cho mục đích thương mại ngoài khuôn khổ hội thảo.
                </li>
                <li>
                  Các câu hỏi lâm sàng và ca bệnh trao đổi cùng Ban chủ tọa được bảo mật danh tính bệnh nhân theo đúng Luật Khám bệnh, chữa bệnh Việt Nam.
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Đồng ý
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
