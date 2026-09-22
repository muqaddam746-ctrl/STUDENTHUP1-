import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, CheckCircle2, User as UserIcon, AlertTriangle } from 'lucide-react';
import { Language, User } from '../types';
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

    const cleanEmail = emailInput.trim().toLowerCase();
    if (cleanEmail !== 'shovqiddin45@gmail.com') {
      setError("Faqat 'shovqiddin45@gmail.com' Super Admin hisobiga ruxsat berilgan.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onLoginAsSuperAdmin(superAdminUser);
      setLoading(false);
    }, 400);
  };

  const handleInstantSuperAdminLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLoginAsSuperAdmin(superAdminUser);
      setLoading(false);
    }, 300);
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

          {/* Quick 1-click super admin login for easy verification */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleInstantSuperAdminLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>shovqiddin45@gmail.com orqali to‘g‘ridan-to‘g‘ri kirish</span>
            </button>
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
