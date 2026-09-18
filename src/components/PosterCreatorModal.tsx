import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Check,
  Copy,
  Sparkles,
  RefreshCw,
  UserCheck,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { AttendeeBadge } from '../types';

interface PosterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAttendee?: Partial<AttendeeBadge> | null;
  attendees?: AttendeeBadge[];
  showToast?: (msg: string) => void;
}

const TEMPLATE_URL = '/images/poster-template.png';
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 959;

// Rounded Rectangle Frame on Right Side (1024 x 959 coordinate system)
const FRAME_X = 725;
const FRAME_Y = 106;
const FRAME_WIDTH = 216;
const FRAME_HEIGHT = 220;
const FRAME_RADIUS = 24;

const HONORIFIC_PRESETS = [
  'MRS.',
  'MR.',
  'BS.',
  'BS.CKII',
  'TS.BS.',
  'PGS.TS.',
  'THS.BS.',
  'CHUYÊN GIA',
  'NONE',
];

export const PosterCreatorModal: React.FC<PosterCreatorModalProps> = ({
  isOpen,
  onClose,
  defaultAttendee,
  attendees = [],
  showToast = (msg) => alert(msg),
}) => {
  // Selection and text state
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string>('');
  const [honorific, setHonorific] = useState<string>('MRS.');
  const [fullName, setFullName] = useState<string>('HƯƠNG GIANG');
  const [organization, setOrganization] = useState<string>('CEO PHÒNG KHÁM G2CLINIC');

  // Photo adjustment state
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);

  // UI interaction state
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [templateLoaded, setTemplateLoaded] = useState<boolean>(false);

  // Dragging state for canvas
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Preload Template Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = TEMPLATE_URL;
    img.onload = () => {
      templateImgRef.current = img;
      setTemplateLoaded(true);
    };
    img.onerror = () => {
      console.warn('Could not load poster template image from:', TEMPLATE_URL);
    };
  }, []);

  // 2. Initialize or Update with Default Attendee
  useEffect(() => {
    if (defaultAttendee) {
      if (defaultAttendee.id) {
        setSelectedAttendeeId(defaultAttendee.id);
      }
      // Parse Honorific & Name
      const rawName = (defaultAttendee.fullName || '').trim();
      let matchedHonorific = 'NONE';
      let cleanName = rawName;

      // Check if degree or honorific exists
      const rawDegree = (defaultAttendee.degree || '').toUpperCase();
      if (rawDegree.includes('TS') || rawDegree.includes('TIẾN SĨ')) {
        matchedHonorific = 'TS.BS.';
      } else if (rawDegree.includes('CKII') || rawDegree.includes('CK2')) {
        matchedHonorific = 'BS.CKII';
      } else if (rawDegree.includes('THS') || rawDegree.includes('THẠC SĨ')) {
        matchedHonorific = 'THS.BS.';
      } else if (rawDegree.includes('BÁC SĨ') || rawDegree.includes('BS')) {
        matchedHonorific = 'BS.';
      } else if (rawDegree.includes('CEO') || rawDegree.includes('GIÁM ĐỐC')) {
        matchedHonorific = 'NONE';
      }

      setHonorific(matchedHonorific);
      setFullName(cleanName.toUpperCase());

      // Line 2: Role + Institution
      const role = (defaultAttendee.titleRole || defaultAttendee.degree || '').trim();
      const inst = (defaultAttendee.institution || '').trim();
      let line2 = '';
      if (role && inst) {
        line2 = `${role} ${inst}`;
      } else if (inst) {
        line2 = inst;
      } else if (role) {
        line2 = role;
      } else {
        line2 = 'ĐẠI BIỂU HỘI NGHỊ THẨM MỸ VIỆT – HÀN';
      }
      setOrganization(line2.toUpperCase());
    }
  }, [defaultAttendee]);

  // 3. Attendee Dropdown Selection Handler
  const handleSelectAttendee = (id: string) => {
    setSelectedAttendeeId(id);
    if (!id) return;

    const found = attendees.find((a) => a.id === id || a.registrationCode === id);
    if (found) {
      const rawDegree = (found.degree || '').toUpperCase();
      let matchedHonorific = 'NONE';
      if (rawDegree.includes('TS') || rawDegree.includes('TIẾN SĨ')) {
        matchedHonorific = 'TS.BS.';
      } else if (rawDegree.includes('CKII') || rawDegree.includes('CK2')) {
        matchedHonorific = 'BS.CKII';
      } else if (rawDegree.includes('THS') || rawDegree.includes('THẠC SĨ')) {
        matchedHonorific = 'THS.BS.';
      } else if (rawDegree.includes('BÁC SĨ') || rawDegree.includes('BS')) {
        matchedHonorific = 'BS.';
      }

      setHonorific(matchedHonorific);
      setFullName(found.fullName.toUpperCase());

      const role = (found.titleRole || found.degree || '').trim();
      const inst = (found.institution || '').trim();
      const line2 = role && inst ? `${role} ${inst}` : inst || role || 'ĐẠI BIỂU THAM DỰ HỘI NGHỊ';
      setOrganization(line2.toUpperCase());
    }
  };

  // 4. File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        // Reset transform to center
        setZoom(1.0);
        setPanX(0);
        setPanY(0);
        setRotation(0);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 5. Helper function: draw rounded rectangle
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // 6. Draw Canvas whenever state changes
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Step A: Draw background template
    if (templateImgRef.current && templateLoaded) {
      ctx.drawImage(templateImgRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      // Fallback background while template loads
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Step B: Draw User Photo in the Frame
    if (userImage) {
      ctx.save();

      // Mask with rounded rectangle
      drawRoundedRect(ctx, FRAME_X, FRAME_Y, FRAME_WIDTH, FRAME_HEIGHT, FRAME_RADIUS);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip();

      // Center of the frame
      const centerX = FRAME_X + FRAME_WIDTH / 2;
      const centerY = FRAME_Y + FRAME_HEIGHT / 2;

      ctx.translate(centerX + panX, centerY + panY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Scale to cover the frame area
      const scaleCover = Math.max(FRAME_WIDTH / userImage.width, FRAME_HEIGHT / userImage.height);
      const drawWidth = userImage.width * scaleCover;
      const drawHeight = userImage.height * scaleCover;

      ctx.drawImage(userImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      ctx.restore();

      // Stroke elegant border around photo
      ctx.save();
      drawRoundedRect(ctx, FRAME_X, FRAME_Y, FRAME_WIDTH, FRAME_HEIGHT, FRAME_RADIUS);
      ctx.strokeStyle = '#cd7a98';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // Step C: Draw Text (Line 1: Name, Line 2: Position/Clinic)
    const centerX = FRAME_X + FRAME_WIDTH / 2; // ~833px

    // Line 1: Tên đại biểu
    const fullLine1 = honorific && honorific !== 'NONE'
      ? `${honorific} ${fullName.trim()}`
      : fullName.trim();

    if (fullLine1) {
      ctx.save();
      ctx.fillStyle = '#004aad'; // Vibrant royal blue from sample
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Smart dynamic font scaling
      let fontSize = 21;
      ctx.font = `bold ${fontSize}px 'Montserrat', 'Inter', 'Segoe UI', sans-serif`;
      while (ctx.measureText(fullLine1).width > 295 && fontSize > 13) {
        fontSize -= 1;
        ctx.font = `bold ${fontSize}px 'Montserrat', 'Inter', 'Segoe UI', sans-serif`;
      }

      ctx.fillText(fullLine1, centerX, 372);
      ctx.restore();
    }

    // Line 2: Chức vụ / Phòng khám
    const fullLine2 = organization.trim();
    if (fullLine2) {
      ctx.save();
      ctx.fillStyle = '#004aad';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let fontSize = 17;
      ctx.font = `bold ${fontSize}px 'Montserrat', 'Inter', 'Segoe UI', sans-serif`;
      while (ctx.measureText(fullLine2).width > 310 && fontSize > 11) {
        fontSize -= 1;
        ctx.font = `bold ${fontSize}px 'Montserrat', 'Inter', 'Segoe UI', sans-serif`;
      }

      ctx.fillText(fullLine2, centerX, 400);
      ctx.restore();
    }
  }, [
    templateLoaded,
    userImage,
    zoom,
    panX,
    panY,
    rotation,
    honorific,
    fullName,
    organization,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Touch / Mouse Drag Pan Handler directly on Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!userImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !userImage) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!userImage || e.touches.length === 0) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - panX, y: touch.clientY - panY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !userImage || e.touches.length === 0) return;
    const touch = e.touches[0];
    setPanX(touch.clientX - dragStart.x);
    setPanY(touch.clientY - dragStart.y);
  };

  // 7. Download Poster (PNG HD)
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeName = fullName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      link.download = `Poster_ThuMoi_${safeName || 'DaiBieu'}_HoiThaoVietHan2026.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('🎉 Đã tải ảnh poster về máy thành công!');
    } catch (err) {
      showToast('❌ Không thể tải ảnh về máy. Quý khách vui lòng chụp màn hình hoặc thử lại.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 8. Copy to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('❌ Không thể sao chép ảnh.');
          return;
        }
        try {
          // Modern Clipboard API for images
          // @ts-ignore
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
          showToast('✅ Đã sao chép poster! Bạn có thể dán (Paste) ngay vào tin nhắn Zalo hoặc Facebook.');
        } catch (e) {
          // Fallback to download
          handleDownload();
          showToast('ℹ️ Trình duyệt chưa hỗ trợ sao chép ảnh trực tiếp. Hệ thống đã tự động tải ảnh về máy cho bạn!');
        }
      });
    } catch (e) {
      showToast('❌ Lỗi khi sao chép ảnh.');
    }
  };

  // 9. Share to Facebook
  const handleShareFacebook = () => {
    handleDownload();
    const shareUrl = encodeURIComponent(window.location.origin);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    window.open(fbUrl, '_blank', 'width=626,height=436');
    showToast('💡 Đã tải ảnh poster! Bạn có thể đính kèm ảnh vừa tải vào bài viết Facebook của mình.');
  };

  // 10. Share to Zalo
  const handleShareZalo = () => {
    handleDownload();
    const shareUrl = encodeURIComponent(window.location.origin);
    const zaloUrl = `https://sp.zalo.me/share_inline?url=${shareUrl}`;
    window.open(zaloUrl, '_blank', 'width=626,height=500');
    showToast('💡 Đã tải ảnh poster! Bạn hãy mở Zalo và gửi hoặc đăng nhật ký ảnh vừa tải nhé.');
  };

  // 11. Native Web Share API (For iOS / Android)
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownload();
          return;
        }
        const file = new File([blob], 'Poster_HoiThao_VietHan_2026.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Thư Mời Tham Dự Hội Nghị Thẩm Mỹ Việt – Hàn 2026',
            text: `Trân trọng kính mời quý đồng nghiệp tham dự Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026 cùng ${fullName}!`,
            url: window.location.origin,
          });
        } else {
          handleDownload();
        }
      });
    } catch (e) {
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#002045] via-[#102a54] to-[#c83271] text-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-pink-200 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                <span>Tạo Poster Thư Mời Đại Biểu</span>
                <span className="text-[10px] bg-pink-500/30 border border-pink-400/40 text-pink-100 px-2 py-0.5 rounded-full font-bold">
                  HD 1024×959
                </span>
              </h2>
              <p className="text-[12px] text-pink-100/80">
                Tự tạo poster chính thức có ảnh chân dung và chức danh để chia sẻ Facebook &amp; Zalo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Column: Live Interactive Preview */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-slate-50/80 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[480px] aspect-[1024/959] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white group select-none">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className={`w-full h-full object-contain ${
                  userImage ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                }`}
              />

              {/* Guide Overlay if no image uploaded yet */}
              {!userImage && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/35 transition-all p-4 text-center"
                >
                  <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg border border-white/30 animate-bounce">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-extrabold text-sm sm:text-base text-white drop-shadow-md">
                    Bấm vào đây để tải ảnh chân dung của bạn
                  </p>
                  <p className="text-xs text-white/90 mt-1 drop-shadow-sm max-w-xs">
                    Ảnh sẽ được tự động gắn vào khung bo góc sang trọng bên phải poster
                  </p>
                </div>
              )}

              {/* Drag Hint Pill */}
              {userImage && (
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10.5px] font-medium pointer-events-none flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Move className="w-3 h-3" />
                  <span>Kéo chuột / ngón tay để căn giữa mặt</span>
                </div>
              )}
            </div>

            {/* Quick action buttons under preview */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 w-full max-w-[480px]">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#002045] to-[#c83271] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Đang xuất ảnh...' : 'Tải Poster Về Máy'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#002045] hover:border-slate-300 text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                title="Sao chép ảnh vào Clipboard để dán trực tiếp vào Zalo/Facebook"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Đã sao chép!' : 'Sao chép ảnh'}</span>
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center justify-center gap-2 mt-2.5 w-full max-w-[480px]">
              <button
                type="button"
                onClick={handleShareZalo}
                className="flex-1 py-2 px-3 rounded-xl bg-[#0068ff] hover:bg-[#0057d6] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ qua Zalo</span>
              </button>

              <button
                type="button"
                onClick={handleShareFacebook}
                className="flex-1 py-2 px-3 rounded-xl bg-[#1877f2] hover:bg-[#1565c0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ Facebook</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Mở menu chia sẻ của điện thoại"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Khác</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto">
            {/* Step 1: Attendee Dropdown & Identification */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#002045] uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#c83271]" />
                  <span>Bước 1: Chọn Tên Đại Biểu Đã Đăng Ký</span>
                </span>
              </div>

              {/* Dropdown list of registered attendees */}
              {attendees.length > 0 ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Danh sách đại biểu trong hệ thống:
                  </label>
                  <select
                    value={selectedAttendeeId}
                    onChange={(e) => handleSelectAttendee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#c83271] focus:ring-1 focus:ring-[#c83271]/20 transition-all cursor-pointer"
                  >
                    <option value="">-- Chọn tên bạn từ danh sách đăng ký --</option>
                    {attendees.map((att) => (
                      <option key={att.id} value={att.id}>
                        {att.fullName} {att.institution ? `- ${att.institution}` : ''} ({att.registrationCode})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200">
                  💡 Chưa có danh sách đại biểu nào trong cơ sở dữ liệu. Quý khách có thể tự nhập tên và chức danh ở bên dưới.
                </div>
              )}

              {/* Honorific Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Danh xưng / Học hàm học vị:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HONORIFIC_PRESETS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setHonorific(item)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        honorific === item
                          ? 'bg-[#002045] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item === 'NONE' ? 'Không' : item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line 1 Input: Tên */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Dòng 1: Họ và tên đại biểu (Chữ in hoa):
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.toUpperCase())}
                  placeholder="HƯƠNG GIANG"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#002045] outline-none focus:border-[#c83271] focus:ring-1 focus:ring-[#c83271]/20"
                />
              </div>

              {/* Line 2 Input: Chức vụ / Phòng khám / Đơn vị */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Dòng 2: Chức vụ / Phòng khám / Bệnh viện:
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value.toUpperCase())}
                  placeholder="CEO PHÒNG KHÁM G2CLINIC"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#002045] outline-none focus:border-[#c83271] focus:ring-1 focus:ring-[#c83271]/20"
                />
              </div>
            </div>

            {/* Step 2: Photo Upload & Adjustment */}
            <div className="space-y-3.5">
              <span className="text-xs font-black text-[#002045] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#c83271]" />
                <span>Bước 2: Tải Ảnh Chân Dung &amp; Căn Chỉnh</span>
              </span>

              {/* Upload button & Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100/70 text-purple-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-purple-700" />
                  <span>{userImage ? 'Thay Đổi Ảnh Khác' : 'Tải Ảnh Chân Dung Lên'}</span>
                </button>

                {userImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1.0);
                      setPanX(0);
                      setPanY(0);
                      setRotation(0);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Đặt lại vị trí mặc định"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sliders if image uploaded */}
              {userImage ? (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  {/* Zoom Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                        <span>Kích thước ảnh (Zoom):</span>
                      </span>
                      <span className="font-mono text-purple-700">{Math.round(zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                        className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1 accent-[#c83271] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(1))))}
                        className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Rotation Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Xoay góc (Nghiêng):</span>
                      </span>
                      <span className="font-mono text-purple-700">{rotation}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        step="1"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                        className="flex-1 accent-[#c83271] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setRotation(0)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        0°
                      </button>
                    </div>
                  </div>

                  {/* Pan Adjustment hint */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60">
                    <span>Vị trí hiện tại: ({panX}, {panY})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPanX(0);
                        setPanY(0);
                      }}
                      className="text-purple-600 hover:text-purple-800 font-bold text-[10.5px] cursor-pointer"
                    >
                      Căn giữa
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                  💡 Sau khi tải ảnh lên, bạn có thể phóng to, thu nhỏ và dùng ngón tay / chuột di chuyển để khuôn mặt nằm đúng trọng tâm khung hình đẹp nhất.
                </p>
              )}
            </div>

            {/* Step 3: Instructions & Quick Sharing Guide */}
            <div className="mt-auto pt-3 border-t border-slate-100 bg-slate-50/60 -mx-5 -mb-5 p-4 rounded-b-3xl">
              <p className="text-[11px] font-bold text-[#002045] flex items-center gap-1 mb-1">
                <span>📱 Hướng dẫn chia sẻ mạng xã hội:</span>
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                <li>Bấm <strong>"Tải Poster Về Máy"</strong> để lưu ảnh chuẩn HD vào thư viện điện thoại / máy tính.</li>
                <li>Hoặc bấm <strong>"Sao chép ảnh"</strong> rồi dán trực tiếp vào khung chat Zalo / Messenger.</li>
                <li>Đăng lên Facebook hoặc Story kèm hashtag: <code>#HoiThaoThamMyVietHan2026 #KBIT2026</code>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
