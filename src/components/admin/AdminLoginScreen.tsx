import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

interface AdminLoginScreenProps {
  onLoginSuccess: () => void;
  onBackHome: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onLoginSuccess,
  onBackHome,
}) => {
  const { cmsData } = useCMS();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve configured admin credentials or fallback to defaults
  const expectedUsername = cmsData.adminAccount?.username || 'admin';
  const expectedPassword = cmsData.adminAccount?.password || 'kbit@2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanUser = username.trim();
      const cleanPass = password.trim();

      if (cleanUser === expectedUsername && cleanPass === expectedPassword) {
        // Save session flag
        sessionStorage.setItem('kbit_admin_auth', 'true');
        onLoginSuccess();
      } else {
        setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.');
      }
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#002045] via-[#091e3a] to-[#040d1a] flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-[#c83271]/30">
      {/* Top bar with Back button */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

        <span className="text-[11px] font-mono text-cyan-300/80 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
          SECURE PORTAL
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl p-6 sm:p-8 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Icon & Title */}
          <div className="text-center mb-6">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-[#002045] via-[#174ea6] to-[#c83271] text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <span className="inline-block px-2.5 py-0.5 rounded-full bg-pink-50 text-[#c83271] text-[10.5px] font-extrabold uppercase tracking-wider border border-pink-100 mb-1.5">
              Hội Thảo Việt – Hàn 2026
            </span>

            <h1 className="text-[20px] sm:text-[22px] font-black text-[#002045] font-display tracking-tight">
              Đăng Nhập Quản Trị CMS
            </h1>

            <p className="text-[12px] text-slate-500 mt-1">
              Vui lòng nhập tài khoản được cấp quyền để truy cập hệ thống quản lý.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-[12px] font-bold text-[#002045] mb-1.5">
                Tài khoản hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản..."
                  autoFocus
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:border-[#174ea6] focus:ring-2 focus:ring-[#174ea6]/15 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-bold text-[#002045]">
                  Mật khẩu
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:border-[#174ea6] focus:ring-2 focus:ring-[#174ea6]/15 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#002045] via-[#174ea6] to-[#c83271] text-white font-bold text-[13.5px] shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 font-display"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập CMS'}</span>
            </button>
          </form>

          {/* Default Credentials Hint Box */}
          <div className="mt-5 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-[11.5px] text-slate-600 space-y-1">
            <p className="font-bold text-[#174ea6] flex items-center gap-1.5">
              <span>💡 Tài khoản quản trị mặc định:</span>
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-700 font-mono text-[11px] gap-1">
              <span>Tài khoản: <strong className="text-[#002045]">admin</strong></span>
              <span>Mật khẩu: <strong className="text-[#c83271]">kbit@2026</strong></span>
            </div>
            <p className="text-[10.5px] text-slate-500 pt-0.5">
              *(Bạn có thể đổi tài khoản và mật khẩu này bên trong CMS sau khi đăng nhập).*
            </p>
          </div>
        </div>
      </div>

      {/* Footer copyright note */}
      <div className="text-center text-[11.5px] text-white/50 max-w-md mx-auto">
        Hội Thảo Khoa Học Thẩm Mỹ Việt – Hàn 2026 • Hệ thống bảo mật quản trị
      </div>
    </div>
  );
};
