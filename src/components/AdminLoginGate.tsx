import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, CheckCircle2, User as UserIcon, AlertTriangle } from 'lucide-react';
import { Language, User, isSuperAdminEmail } from '../types';
import { superAdminUser } from '../data/initialData';

interface AdminLoginGateProps {
  language: Language;
  currentUser: User | null;
  onLoginAsSuperAdmin: (user: User) => void;
  onBackToPortal: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  language,
  currentUser,
  onLoginAsSuperAdmin,
  onBackToPortal,
}) => {
  const [emailInput, setEmailInput] = useState('shovqiddin45@gmail.com');
  const [passwordInput, setPasswordInput] = useState('admin2025');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = emailInput.trim();
    if (!isSuperAdminEmail(cleanEmail)) {
      setError("Faqat Super Admin Google akkaunti ('shovqiddin45@gmail.com') hisobiga ruxsat berilgan.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onLoginAsSuperAdmin({
        ...superAdminUser,
        email: cleanEmail.includes('@') ? cleanEmail : 'shovqiddin45@gmail.com',
      });
      setLoading(false);
    }, 400);
  };

  const handleGoogleSuperAdminLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLoginAsSuperAdmin(superAdminUser);
      setLoading(false);
    }, 350);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        {/* Top decorative header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-8 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-inner">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Admin Boshqaruv Markazi</h2>
          <p className="text-xs text-blue-100/80 mt-1 max-w-md mx-auto">
            StudyHub yagona boshqaruv tizimi va foydalanuvchilar hisobini to‘ldirish xizmati
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold backdrop-blur-sm">
            <span>Himoyalangan bo‘lim: shovqiddin45@gmail.com</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Current user status notification if logged in as normal student */}
          {currentUser && currentUser.email !== 'shovqiddin45@gmail.com' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Siz talaba profilidasiz:</p>
                <p>
                  Hozirda <strong>{currentUser.name}</strong> ({currentUser.email || currentUser.id}) hisobidasiz. Admin panelini ochish va boshqalarning hisobiga pul to‘ldirish uchun Super Admin sifatida tizimga kiring.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Super Admin Emaili
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="shovqiddin45@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Admin Paroli
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{loading ? 'Tekshirilmoqda...' : 'Super Admin Sifatida Kirish'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-click super admin Google login */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <button
              type="button"
              onClick={handleGoogleSuperAdminLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-100 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28A7.17 7.17 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.57H1.25A11.93 11.93 0 0 0 0 12c0 1.92.45 3.74 1.25 5.43l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.57l4.03 3.15c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
              <span>Google akkaunt bilan kirish (shovqiddin45@gmail.com)</span>
            </button>
            <p className="text-[11px] text-center text-neutral-500 dark:text-neutral-400">
              Super Admin butun platforma, foydalanuvchilar, to‘lovlar va kitoblarni to‘liq boshqara oladi.
            </p>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onBackToPortal}
              className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium"
            >
              ← Talabalar portaliga qaytish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
