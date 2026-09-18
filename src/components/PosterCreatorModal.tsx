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
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Info,
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

// Rounded Rectangle Frame coordinates on the 1024x959 canvas
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
  // Step State: 1 = Chọn đại biểu, 2 = Tải & căn ảnh, 3 = Hoàn tất & chia sẻ
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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

  // UI status state
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isProcessingShare, setIsProcessingShare] = useState<boolean>(false);
  const [templateLoaded, setTemplateLoaded] = useState<boolean>(false);

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);
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
      const rawName = (defaultAttendee.fullName || '').trim();
      let matchedHonorific = 'NONE';
      let cleanName = rawName;

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

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

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

  // 6. Draw Full Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background template
    if (templateImgRef.current && templateLoaded) {
      ctx.drawImage(templateImgRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // User Photo in Frame
    if (userImage) {
      ctx.save();
      drawRoundedRect(ctx, FRAME_X, FRAME_Y, FRAME_WIDTH, FRAME_HEIGHT, FRAME_RADIUS);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip();

      const centerX = FRAME_X + FRAME_WIDTH / 2;
      const centerY = FRAME_Y + FRAME_HEIGHT / 2;

      ctx.translate(centerX + panX, centerY + panY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const scaleCover = Math.max(FRAME_WIDTH / userImage.width, FRAME_HEIGHT / userImage.height);
      const drawWidth = userImage.width * scaleCover;
      const drawHeight = userImage.height * scaleCover;

      ctx.drawImage(userImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      // Border
      ctx.save();
      drawRoundedRect(ctx, FRAME_X, FRAME_Y, FRAME_WIDTH, FRAME_HEIGHT, FRAME_RADIUS);
      ctx.strokeStyle = '#cd7a98';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // Draw Text
    const centerX = FRAME_X + FRAME_WIDTH / 2;

    // Line 1: Tên đại biểu
    const fullLine1 = honorific && honorific !== 'NONE'
      ? `${honorific} ${fullName.trim()}`
      : fullName.trim();

    if (fullLine1) {
      ctx.save();
      ctx.fillStyle = '#004aad';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

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

  // 7. Draw Avatar-Only Focus Canvas (For Step 2 on Mobile/Desktop)
  const renderAvatarPreview = useCallback(() => {
    const canvas = avatarPreviewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayW = 240;
    const displayH = 244;
    canvas.width = displayW;
    canvas.height = displayH;

    ctx.clearRect(0, 0, displayW, displayH);

    // Background
    drawRoundedRect(ctx, 0, 0, displayW, displayH, FRAME_RADIUS);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    if (userImage) {
      ctx.save();
      drawRoundedRect(ctx, 0, 0, displayW, displayH, FRAME_RADIUS);
      ctx.clip();

      const centerX = displayW / 2;
      const centerY = displayH / 2;

      const ratio = displayW / FRAME_WIDTH;
      ctx.translate(centerX + panX * ratio, centerY + panY * ratio);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const scaleCover = Math.max(displayW / userImage.width, displayH / userImage.height);
      const drawWidth = userImage.width * scaleCover;
      const drawHeight = userImage.height * scaleCover;

      ctx.drawImage(userImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    }

    // Stroke elegant pink border
    ctx.save();
    drawRoundedRect(ctx, 1.5, 1.5, displayW - 3, displayH - 3, FRAME_RADIUS);
    ctx.strokeStyle = '#cd7a98';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }, [userImage, zoom, panX, panY, rotation]);

  useEffect(() => {
    renderCanvas();
    renderAvatarPreview();
  }, [renderCanvas, renderAvatarPreview]);

  // Touch / Mouse Dragging for Avatar in Step 2 or Full Canvas
  const handleStartDrag = (clientX: number, clientY: number) => {
    if (!userImage) return;
    setIsDragging(true);
    setDragStart({ x: clientX - panX, y: clientY - panY });
  };

  const handleMoveDrag = (clientX: number, clientY: number) => {
    if (!isDragging || !userImage) return;
    setPanX(clientX - dragStart.x);
    setPanY(clientY - dragStart.y);
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  // 8. File generation helper
  const getPosterFileAndBlob = async (): Promise<{ blob: Blob; file: File; dataUrl: string } | null> => {
    renderCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const safeName = fullName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'DaiBieu';
    const fileName = `Poster_ThuMoi_${safeName}_HoiThaoVietHan2026.png`;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], fileName, { type: 'image/png' });
        resolve({ blob, file, dataUrl });
      }, 'image/png', 1.0);
    });
  };

  // 9. Download Poster
  const handleDownload = async () => {
    setIsProcessingShare(true);
    try {
      const res = await getPosterFileAndBlob();
      if (!res) throw new Error('Render failed');

      const link = document.createElement('a');
      link.download = res.file.name;
      link.href = res.dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('🎉 Đã tải ảnh poster chuẩn HD về máy thành công!');
    } catch (e) {
      showToast('❌ Không thể tải ảnh. Quý khách vui lòng thử lại.');
    } finally {
      setIsProcessingShare(false);
    }
  };

  // 10. Copy Image to Clipboard
  const handleCopyImage = async () => {
    setIsProcessingShare(true);
    try {
      const res = await getPosterFileAndBlob();
      if (!res) throw new Error('Render failed');

      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
        // @ts-ignore
        const item = new ClipboardItem({ 'image/png': res.blob });
        await navigator.clipboard.write([item]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
        showToast('✅ Đã sao chép ảnh! Bạn có thể dán (Ctrl+V) ngay vào khung chat Zalo hoặc Facebook.');
      } else {
        handleDownload();
        showToast('ℹ️ Trình duyệt chưa hỗ trợ sao chép ảnh trực tiếp. Hệ thống đã tải ảnh về máy cho bạn!');
      }
    } catch (e) {
      handleDownload();
      showToast('ℹ️ Đã tự động tải ảnh về máy để bạn đính kèm vào tin nhắn!');
    } finally {
      setIsProcessingShare(false);
    }
  };

  // 11. Share to Zalo (Auto mix and attach image to Zalo app on mobile)
  const handleShareZalo = async () => {
    setIsProcessingShare(true);
    try {
      const res = await getPosterFileAndBlob();
      if (!res) throw new Error('Render failed');

      // Auto download to ensure photo is saved locally
      const link = document.createElement('a');
      link.download = res.file.name;
      link.href = res.dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Try Web Share API (Primary mobile mechanism to attach image to Zalo app)
      const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isMobile && navigator.canShare && navigator.canShare({ files: [res.file] })) {
        try {
          await navigator.share({
            files: [res.file],
            title: 'Poster Thư Mời Hội Nghị Thẩm Mỹ Việt – Hàn 2026',
            text: `Trân trọng kính mời quý đồng nghiệp tham dự Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026 cùng ${fullName}!`,
          });
          showToast('✅ Đang mở trình chia sẻ! Hãy chọn biểu tượng Zalo để gửi ngay kèm ảnh.');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }

      // Try copying to clipboard
      try {
        if (typeof ClipboardItem !== 'undefined') {
          // @ts-ignore
          const item = new ClipboardItem({ 'image/png': res.blob });
          await navigator.clipboard.write([item]);
        }
      } catch (_) {}

      // Open Zalo on mobile or desktop
      if (isMobile) {
        showToast('📲 Đã lưu ảnh vào máy! Đang mở ứng dụng Zalo để bạn gửi ảnh...');
        window.location.href = 'zalo://';
        setTimeout(() => {
          window.open('https://zalo.me/', '_blank');
        }, 1200);
      } else {
        showToast('💡 Đã tải ảnh poster và sao chép vào bộ nhớ tạm! Đang mở Zalo Web, bạn chỉ cần dán (Ctrl+V) để gửi ảnh.');
        window.open('https://chat.zalo.me/', '_blank');
      }
    } catch (e) {
      showToast('❌ Lỗi khi xử lý chia sẻ. Quý khách vui lòng tải ảnh về máy và gửi qua Zalo.');
    } finally {
      setIsProcessingShare(false);
    }
  };

  // 12. Share to Facebook (Auto mix and attach image to Facebook app on mobile)
  const handleShareFacebook = async () => {
    setIsProcessingShare(true);
    try {
      const res = await getPosterFileAndBlob();
      if (!res) throw new Error('Render failed');

      // Auto download
      const link = document.createElement('a');
      link.download = res.file.name;
      link.href = res.dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Try Web Share API (Mobile native share sheet attaches photo directly to Facebook/Feed/Stories)
      const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isMobile && navigator.canShare && navigator.canShare({ files: [res.file] })) {
        try {
          await navigator.share({
            files: [res.file],
            title: 'Poster Thư Mời Hội Nghị Thẩm Mỹ Việt – Hàn 2026',
            text: `Trân trọng kính mời quý đồng nghiệp tham dự Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026 cùng ${fullName}! #HoiThaoThamMyVietHan2026 #KBIT2026`,
          });
          showToast('✅ Đang mở trình chia sẻ! Hãy chọn biểu tượng Facebook để đăng bài kèm ảnh.');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }

      // Open Facebook app or sharer dialog
      if (isMobile) {
        showToast('📲 Đã lưu ảnh vào máy! Đang mở ứng dụng Facebook để bạn đính kèm ảnh đăng bài...');
        window.location.href = 'fb://feed';
        setTimeout(() => {
          const shareUrl = encodeURIComponent(window.location.origin);
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
        }, 1200);
      } else {
        const shareUrl = encodeURIComponent(window.location.origin);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank', 'width=626,height=436');
        showToast('💡 Đã tải ảnh poster về máy! Bạn có thể đính kèm ảnh vừa tải vào bài viết Facebook.');
      }
    } catch (e) {
      showToast('❌ Lỗi khi xử lý chia sẻ. Quý khách vui lòng tải ảnh về máy và đăng lên Facebook.');
    } finally {
      setIsProcessingShare(false);
    }
  };

  // 13. Native Share for iOS / Android Menu
  const handleNativeShare = async () => {
    setIsProcessingShare(true);
    try {
      const res = await getPosterFileAndBlob();
      if (!res) throw new Error('Render failed');

      if (navigator.canShare && navigator.canShare({ files: [res.file] })) {
        await navigator.share({
          files: [res.file],
          title: 'Thư Mời Tham Dự Hội Nghị Thẩm Mỹ Việt – Hàn 2026',
          text: `Trân trọng kính mời quý đồng nghiệp tham dự Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026 cùng ${fullName}!`,
          url: window.location.origin,
        });
      } else {
        handleDownload();
      }
    } catch (e) {
      handleDownload();
    } finally {
      setIsProcessingShare(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-gradient-to-r from-[#002045] via-[#102a54] to-[#c83271] text-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-9 sm:size-10 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-pink-200 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide flex items-center gap-2">
                <span>Tạo Poster Thư Mời Đại Biểu</span>
                <span className="text-[10px] bg-pink-500/30 border border-pink-400/40 text-pink-100 px-2 py-0.5 rounded-full font-bold hidden sm:inline-block">
                  HD 1024×959
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-pink-100/85 line-clamp-1">
                3 bước dễ dàng tạo poster cá nhân hóa chia sẻ Zalo &amp; Facebook
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 sm:size-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-3 sm:px-6 py-2 sm:py-2.5">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-1 sm:gap-3 text-xs">
            {/* Step 1 Tab */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-white text-[#002045] shadow-xs border border-slate-200'
                  : currentStep > 1
                  ? 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/60'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div
                className={`size-5 rounded-full flex items-center justify-center text-[10.5px] font-black ${
                  currentStep === 1
                    ? 'bg-[#002045] text-white'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
              </div>
              <span className="hidden xs:inline">1. Đại biểu</span>
              <span className="xs:hidden">Tên</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Step 2 Tab */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-white text-[#c83271] shadow-xs border border-pink-200'
                  : currentStep > 2
                  ? 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/60'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div
                className={`size-5 rounded-full flex items-center justify-center text-[10.5px] font-black ${
                  currentStep === 2
                    ? 'bg-[#c83271] text-white'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
              </div>
              <span className="hidden xs:inline">2. Tải &amp; căn ảnh</span>
              <span className="xs:hidden">Ảnh</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Step 3 Tab */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                currentStep === 3
                  ? 'bg-white text-[#0068ff] shadow-xs border border-blue-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div
                className={`size-5 rounded-full flex items-center justify-center text-[10.5px] font-black ${
                  currentStep === 3
                    ? 'bg-[#0068ff] text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </div>
              <span className="hidden xs:inline">3. Chia sẻ</span>
              <span className="xs:hidden">Gửi</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Column (Desktop Live Preview / Mobile Step 3 View) */}
          <div
            className={`lg:col-span-7 p-4 sm:p-6 bg-slate-50/80 flex flex-col items-center justify-center ${
              currentStep !== 3 ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="w-full max-w-[480px]">
              <div className="relative w-full aspect-[1024/959] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white group select-none">
                <canvas
                  ref={canvasRef}
                  onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
                  onMouseUp={handleEndDrag}
                  onMouseLeave={handleEndDrag}
                  onTouchStart={(e) => {
                    if (e.touches.length > 0) handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length > 0) handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchEnd={handleEndDrag}
                  className={`w-full h-full object-contain ${
                    userImage ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                  }`}
                />

                {/* Prompt overlay if no photo yet */}
                {!userImage && (
                  <div
                    onClick={() => {
                      setCurrentStep(2);
                      setTimeout(() => fileInputRef.current?.click(), 100);
                    }}
                    className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/35 transition-all p-4 text-center"
                  >
                    <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-lg border border-white/30 animate-bounce">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-extrabold text-xs sm:text-sm text-white drop-shadow-md">
                      Bấm vào đây để tải ảnh chân dung của bạn
                    </p>
                    <span className="text-[11px] text-pink-200 mt-1 font-semibold underline">
                      Chuyển sang Bước 2 để tải ảnh
                    </span>
                  </div>
                )}
              </div>

              {/* Step 3 Quick Action Bar (Mobile & Desktop) */}
              {currentStep === 3 && (
                <div className="mt-4 space-y-2.5 w-full animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Share Zalo Button */}
                    <button
                      type="button"
                      onClick={handleShareZalo}
                      disabled={isProcessingShare}
                      className="w-full py-3 px-3.5 rounded-xl bg-gradient-to-r from-[#0068ff] to-[#0052cc] hover:from-[#005bd9] hover:to-[#0047b3] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <Share2 className="w-4 h-4" />
                      <div className="text-left">
                        <div className="leading-tight">Chia sẻ qua Zalo</div>
                        <div className="text-[10px] text-blue-100 font-normal">Tự đính kèm ảnh &amp; mở Zalo</div>
                      </div>
                    </button>

                    {/* Share Facebook Button */}
                    <button
                      type="button"
                      onClick={handleShareFacebook}
                      disabled={isProcessingShare}
                      className="w-full py-3 px-3.5 rounded-xl bg-gradient-to-r from-[#1877f2] to-[#0d5ec4] hover:from-[#156cdb] hover:to-[#0b4fa8] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <Share2 className="w-4 h-4" />
                      <div className="text-left">
                        <div className="leading-tight">Chia sẻ lên Facebook</div>
                        <div className="text-[10px] text-blue-100 font-normal">Tự đính kèm ảnh &amp; mở Facebook</div>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Download HD Button */}
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={isProcessingShare}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#002045] to-[#c83271] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải Poster HD Về Máy</span>
                    </button>

                    {/* Copy to Clipboard */}
                    <button
                      type="button"
                      onClick={handleCopyImage}
                      disabled={isProcessingShare}
                      className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      title="Sao chép ảnh vào Clipboard"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopied ? 'Đã sao chép!' : 'Copy ảnh'}</span>
                    </button>

                    {/* Native Share on mobile */}
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Chia sẻ qua ứng dụng khác"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Khác</span>
                      </button>
                    )}
                  </div>

                  {/* Back to Step 2 */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-slate-600 hover:text-[#c83271] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Căn chỉnh lại ảnh chân dung</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Đổi đại biểu khác
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Wizard Controls: Step 1, Step 2, Step 3 Guidance) */}
          <div
            className={`p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto ${
              currentStep === 3 ? 'lg:col-span-5 hidden lg:flex' : 'lg:col-span-5 col-span-1'
            }`}
          >
            {/* ===================== STEP 1: CHỌN ĐẠI BIỂU ===================== */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="size-7 rounded-lg bg-[#002045] text-white flex items-center justify-center text-xs font-black">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#002045] uppercase tracking-wide">
                      Bước 1: Chọn Tên Đại Biểu Đã Đăng Ký
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Chọn thông tin từ danh sách hệ thống hoặc tự điền chức danh
                    </p>
                  </div>
                </div>

                {/* Dropdown list */}
                {attendees.length > 0 ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Chọn bạn trong danh sách đăng ký:
                    </label>
                    <select
                      value={selectedAttendeeId}
                      onChange={(e) => handleSelectAttendee(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#c83271] focus:ring-2 focus:ring-[#c83271]/20 transition-all cursor-pointer"
                    >
                      <option value="">-- Chọn tên đại biểu đã đăng ký --</option>
                      {attendees.map((att) => (
                        <option key={att.id} value={att.id}>
                          {att.fullName} {att.institution ? `- ${att.institution}` : ''} ({att.registrationCode})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Chưa có đại biểu trong cơ sở dữ liệu. Quý khách có thể tự nhập họ tên và chức danh ở dưới.</span>
                  </div>
                )}

                {/* Honorific Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Danh xưng / Học hàm học vị:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {HONORIFIC_PRESETS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setHonorific(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

                {/* Line 1 Input: Họ tên */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dòng 1: Họ và tên đại biểu (Chữ in hoa):
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.toUpperCase())}
                    placeholder="BS CK I LÊ THỊ GIANG"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-[#002045] outline-none focus:border-[#c83271] focus:ring-2 focus:ring-[#c83271]/20"
                  />
                </div>

                {/* Line 2 Input: Chức vụ / Phòng khám */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dòng 2: Chức vụ / Phòng khám / Bệnh viện:
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value.toUpperCase())}
                    placeholder="BÁC SĨ ĐẠI HỌC Y DƯỢC- ĐẠI HỌC QUỐC GIA HÀ NỘI"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-[#002045] outline-none focus:border-[#c83271] focus:ring-2 focus:ring-[#c83271]/20"
                  />
                </div>

                {/* Next to Step 2 CTA */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#002045] via-[#102a54] to-[#c83271] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Tiếp tục sang Bước 2: Tải &amp; Căn Chỉnh Ảnh</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ===================== STEP 2: UPLOAD & CĂN CHỈNH ẢNH ===================== */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-[#c83271] text-white flex items-center justify-center text-xs font-black">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#002045] uppercase tracking-wide">
                        Bước 2: Tải &amp; Căn Chỉnh Chân Dung
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Kéo thả ngón tay để căn giữa khuôn mặt vào khung ảnh
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Interactive Avatar Focus Studio */}
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div
                    className="relative w-[240px] h-[244px] rounded-3xl overflow-hidden shadow-md bg-white select-none cursor-grab active:cursor-grabbing touch-none group"
                    onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
                    onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
                    onMouseUp={handleEndDrag}
                    onMouseLeave={handleEndDrag}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
                    }}
                    onTouchMove={(e) => {
                      if (e.touches.length > 0) handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY);
                    }}
                    onTouchEnd={handleEndDrag}
                  >
                    <canvas
                      ref={avatarPreviewCanvasRef}
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Overlay guide when no image */}
                    {!userImage && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-slate-100/60 transition-colors"
                      >
                        <div className="size-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 shadow-xs animate-pulse">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Chạm để chọn ảnh chân dung</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Từ thư viện ảnh hoặc camera</span>
                      </div>
                    )}

                    {/* Drag Hint Tag */}
                    {userImage && (
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-medium pointer-events-none flex items-center gap-1">
                        <Move className="w-3 h-3" />
                        <span>Kéo để chỉnh mặt</span>
                      </div>
                    )}
                  </div>

                  {/* Upload / Change Photo Buttons */}
                  <div className="flex items-center gap-2 mt-3 w-full max-w-[280px]">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-purple-700" />
                      <span>{userImage ? 'Đổi Ảnh Khác' : 'Tải Ảnh Lên'}</span>
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
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title="Đặt lại vị trí mặc định"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Adjustment Sliders (When Image Uploaded) */}
                {userImage && (
                  <div className="space-y-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    {/* Zoom Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                          <span>Thu phóng (Zoom):</span>
                        </span>
                        <span className="font-mono text-purple-700">{Math.round(zoom * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
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
                          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Rotation Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
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
                          className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                          0°
                        </button>
                      </div>
                    </div>

                    {/* Reset Center button */}
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                      <span>Tọa độ lệch: ({panX}, {panY})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPanX(0);
                          setPanY(0);
                        }}
                        className="text-purple-600 hover:text-purple-800 font-bold cursor-pointer"
                      >
                        Căn giữa
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 Navigation Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#002045] to-[#0068ff] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Tiếp tục: Xem &amp; Chia sẻ FB/Zalo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ===================== STEP 3: DESKTOP SIDE GUIDE ===================== */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="size-7 rounded-lg bg-[#0068ff] text-white flex items-center justify-center text-xs font-black">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#002045] uppercase tracking-wide">
                      Bước 3: Hoàn Tất &amp; Chia Sẻ Mạng Xã Hội
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Poster đã được tự động mix hoàn chỉnh
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#002045]">
                    <Smartphone className="w-4 h-4 text-[#0068ff]" />
                    <span>Tự động đính kèm ảnh khi chia sẻ:</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>Chia sẻ qua Zalo:</strong> Hệ thống tự mix poster, tải ảnh về điện thoại và mở ứng dụng Zalo đính kèm sẵn ảnh để bạn gửi ngay cho đồng nghiệp.
                    </li>
                    <li>
                      <strong>Chia sẻ lên Facebook:</strong> Tự động mở app Facebook và đính kèm ảnh poster vào bài viết hoặc Story của bạn.
                    </li>
                    <li>
                      <strong>Tải Poster HD:</strong> Lưu file ảnh PNG chất lượng cao (1024×959 px) vào thư viện ảnh.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-700">Thông tin trên poster:</div>
                  <div className="text-slate-600">
                    • <strong>Đại biểu:</strong> {honorific !== 'NONE' ? `${honorific} ` : ''}{fullName}
                  </div>
                  <div className="text-slate-600">
                    • <strong>Đơn vị:</strong> {organization}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-slate-600 hover:text-[#c83271] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Chỉnh lại ảnh chân dung</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Đổi đại biểu khác
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
