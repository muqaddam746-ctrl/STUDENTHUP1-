import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Smartphone,
  KeyRound,
  CheckCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Language, User, isSuperAdminEmail } from '../types';
import { translations } from '../i18n/translations';
import { initialSuperAdmin } from '../data/initialData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLoginSuccess: (user: User) => void;
  currentUser: User | null;
  onLogoutAllDevices: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
  currentUser,
  onLogoutAllDevices,
}) => {
  const t = translations[language];
  const [mode, setMode] = useState<'login' | 'register' | 'changeCredentials' | 'resetPassword'>('login');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('Toshkent Axborot Texnologiyalari Universiteti (TATU)');
  const [faculty, setFaculty] = useState('Dasturiy injiniring');
  const [course, setCourse] = useState(2);
  const [studentIdInput, setStudentIdInput] = useState('');

  // Auto generated credentials banner
  const [generatedCredentials, setGeneratedCredentials] = useState<{ id: string; pass: string } | null>(null);

  // Google Account Picker State
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // CAPTCHA: Simple math security check
  const [captchaNum1, setCaptchaNum1] = useState(Math.floor(Math.random() * 8) + 2);
  const [captchaNum2, setCaptchaNum2] = useState(Math.floor(Math.random() * 7) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const refreshCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 8) + 2);
    setCaptchaNum2(Math.floor(Math.random() * 7) + 1);
    setCaptchaAnswer('');
    setCaptchaError(false);
  };

  // Generate 8-digit unique ID
  const generate8DigitId = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  // Generate random strong password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 9; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaAnswer, 10) !== captchaNum1 + captchaNum2) {
      setCaptchaError(true);
      return;
    }

    const autoId = generate8DigitId();
    const autoPass = password.trim() || generatePassword();
    const userEmail = email.trim() || `student_${autoId}@studyhub.uz`;
    const isSuperAdmin = isSuperAdminEmail(userEmail);

    setGeneratedCredentials({ id: autoId, pass: autoPass });

    const newUser: User = {
      id: isSuperAdmin ? '84920153' : autoId,
      name: fullName.trim() || (isSuperAdmin ? 'Shovqiddin (Super Admin)' : `Talaba #${autoId.slice(-4)}`),
      email: isSuperAdmin ? 'shovqiddin45@gmail.com' : userEmail,
      role: isSuperAdmin ? 'superadmin' : 'student',
      adminDepartment: isSuperAdmin ? 'all' : undefined,
      balance: isSuperAdmin ? 250000 : 50000,
      university,
      faculty,
      course,
      phone: '+998 90 000 00 00',
      telegram: isSuperAdmin ? '@shovqiddin_admin' : '@student_' + autoId.slice(-4),
      isBlocked: false,
      createdAt: new Date().toISOString().split('T')[0],
      activeDevicesCount: 1,
    };

    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 1500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = studentIdInput.trim();
    // Super Admin Google akkaunti: shovqiddin45@gmail.com
    const isSuperAdmin = isSuperAdminEmail(entered);

    const loggedUser: User = {
      id: isSuperAdmin ? '84920153' : (studentIdInput.trim() || '71492051'),
      name: isSuperAdmin ? 'Shovqiddin (Super Admin)' : (fullName.trim() || 'Temur Aliyev'),
      email: isSuperAdmin ? 'shovqiddin45@gmail.com' : (entered.includes('@') ? entered : 'temur.student@gmail.com'),
      role: isSuperAdmin ? 'superadmin' : 'student',
      adminDepartment: isSuperAdmin ? 'all' : undefined,
      balance: isSuperAdmin ? 250000 : 65000,
      university: 'TATU',
      faculty: 'Dasturiy injiniring',
      course: isSuperAdmin ? 4 : 3,
      phone: '+998 90 123 45 67',
      telegram: isSuperAdmin ? '@shovqiddin_admin' : '@temur_student',
      isBlocked: false,
      createdAt: '2025-01-10',
      activeDevicesCount: 2,
    };

    onLoginSuccess(loggedUser);
    onClose();
  };

  const handleLoginAsGoogleSuperAdmin = () => {
    onLoginSuccess(initialSuperAdmin);
    setShowGooglePicker(false);
    onClose();
  };

  const handleCustomGoogleLogin = (emailAddress?: string) => {
    const targetEmail = (emailAddress || customGoogleEmail || '').trim();
    if (isSuperAdminEmail(targetEmail)) {
      handleLoginAsGoogleSuperAdmin();
      return;
    }

    const mockId = generate8DigitId();
    const oauthUser: User = {
      id: mockId,
      name: targetEmail ? targetEmail.split('@')[0] : 'Google Foydalanuvchi',
      email: targetEmail || `google_student_${mockId.slice(-4)}@gmail.com`,
      role: 'student',
      balance: 50000,
      university: 'TATU',
      faculty: 'Dasturiy injiniring',
      course: 2,
      phone: '+998 90 555 44 33',
      telegram: `@google_student`,
      isBlocked: false,
      createdAt: new Date().toISOString().split('T')[0],
      activeDevicesCount: 1,
    };
    onLoginSuccess(oauthUser);
    setShowGooglePicker(false);
    onClose();
  };

  const handleOneClickOAuth = (provider: 'google' | 'apple') => {
    if (provider === 'google') {
      setShowGooglePicker(true);
      return;
    }

    const mockId = generate8DigitId();
    const oauthUser: User = {
      id: mockId,
      name: 'Apple Foydalanuvchi',
      email: `apple_user_${mockId.slice(-4)}@icloud.com`,
      role: 'student',
      balance: 50000,
      university: 'TATU',
      faculty: 'Dasturiy injiniring',
      course: 2,
      phone: '+998 90 555 44 33',
      telegram: `@apple_student`,
      isBlocked: false,
      createdAt: new Date().toISOString().split('T')[0],
      activeDevicesCount: 1,
    };
    onLoginSuccess(oauthUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>
                {mode === 'login'
                  ? t.auth.login
                  : mode === 'register'
                  ? t.auth.quickRegister
                  : mode === 'changeCredentials'
                  ? t.auth.changePassword
                  : t.auth.resetPassword}
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              StudyHub yagona xavfsiz avtorizatsiya tizimi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Google Account Picker View */}
          {showGooglePicker ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Google orqali kirish</h4>
                  <p className="text-[11px] text-neutral-500">Hisobingizni tanlang yoki Google email kiriting</p>
                </div>
              </div>

              {/* Super Admin Google Account Option */}
              <div
                onClick={handleLoginAsGoogleSuperAdmin}
                className="p-3.5 rounded-2xl border-2 border-blue-500/40 bg-blue-50/60 dark:bg-blue-950/40 hover:border-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/50 cursor-pointer transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-md">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">Shovqiddin</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-[9px] font-black text-white uppercase tracking-wider">
                        Super Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">shovqiddin45@gmail.com</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      ✓ Barcha ma‘lumotlarni to‘liq boshqarish huquqi
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Other Google Account */}
              <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Boshqa Google email:</span>
                  <button
                    type="button"
                    onClick={() => handleCustomGoogleLogin('temur.student@gmail.com')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Talaba sifatida kirish
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="shovqiddin45@gmail.com yoki student@gmail.com"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleCustomGoogleLogin()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Kirish
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Agar shovqiddin45@gmail.com kiritilsa, tizim avtomatik Super Admin vakolatini taqdim etadi.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowGooglePicker(false)}
                className="w-full py-2 text-center text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium"
              >
                ← Orqaga (ID va parol bilan kirish)
              </button>
            </div>
          ) : (
            <>
              {/* Generated credentials display */}
              {generatedCredentials && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Akkauntingiz yaratildi!</span>
                  </div>
                  <p>
                    Sizning unikal 8 xonali ID: <strong>{generatedCredentials.id}</strong>
                  </p>
                  <p>
                    Parolingiz: <strong>{generatedCredentials.pass}</strong>
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    Tizimga kirish avtomatik amalga oshirilmoqda...
                  </p>
                </div>
              )}

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleOneClickOAuth('google')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-200 text-xs font-semibold shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  onClick={() => handleOneClickOAuth('apple')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold shadow-sm transition-all"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.77-12-14.18-6.19-9.14-11.1-19.68-14.73-31.63-3.64-11.95-5.46-23.4-5.46-34.35 0-14.68 3.73-27.02 11.19-37.03 7.46-10.01 16.9-15.11 28.33-15.31 4.58 0 9.87 1.27 15.86 3.82 5.99 2.54 9.89 3.91 11.69 4.1 2.34-.41 6.51-1.89 12.52-4.43 6.01-2.54 11.12-3.71 15.33-3.52 11.75.52 21.2 4.79 28.35 12.82-10.23 6.21-15.24 14.86-15.04 25.96.2 8.7 3.52 15.99 9.97 21.87 6.45 5.88 14.15 9.2 23.09 9.97-2.35 7.15-5.15 14.28-8.41 21.39zM119.22 33.54c0-6.9 2.47-13.43 7.42-19.59 4.95-6.16 11.08-10.13 18.39-11.91 0 .82.04 1.54.12 2.15 0 6.69-2.52 13.25-7.56 19.67-5.04 6.42-11.19 10.36-18.45 11.82.08-.72.08-1.43.08-2.14z" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
                <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                  yoki ID / Parol bilan
                </span>
              </div>

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.auth.studentId} yoki Email
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    placeholder="84920153 yoki shovqiddin45@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {t.auth.password}
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('resetPassword')}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    {t.auth.resetPassword}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
              >
                {t.auth.login}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Akkauntingiz yo‘qmi? Tezkor ro‘yxatdan o‘tish →
                </button>
              </div>
            </form>
          ) : mode === 'register' ? (
            <form onSubmit={handleQuickRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.auth.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ism va familiyangizni kiriting"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email (Ixtiyoriy)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="talaba@gmail.com"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.auth.course}
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1-kurs</option>
                    <option value={2}>2-kurs</option>
                    <option value={3}>3-kurs</option>
                    <option value={4}>4-kurs</option>
                    <option value={5}>Magistratura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Parol
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Avtomatik yaratish mumkin"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* CAPTCHA / Robot emasligini tasdiqlash */}
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Xavfsizlik tekshiruvi (Robot emasman):</span>
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    title="Yangi savol"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-white dark:bg-neutral-700 rounded-lg text-sm font-black text-blue-600 font-mono tracking-wider border border-neutral-200 dark:border-neutral-600">
                    {captchaNum1} + {captchaNum2} = ?
                  </div>
                  <input
                    type="number"
                    required
                    value={captchaAnswer}
                    onChange={(e) => {
                      setCaptchaAnswer(e.target.value);
                      setCaptchaError(false);
                    }}
                    placeholder="Javobni yozing"
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                {captchaError && (
                  <p className="text-[11px] text-red-500 font-semibold">
                    Hisob noto‘g‘ri kiritildi! Iltimos qaytadan tekshiring.
                  </p>
                )}
              </div>

              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-[11px] text-blue-700 dark:text-blue-300">
                {t.auth.autoGeneratedNotice}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
              >
                {t.auth.quickRegister}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Hisobingiz bormi? Kirish →
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Parolingizni tiklash yoki xavfsizlik sozlamalarini boshqarish:
              </p>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  8 xonali ID yoki Bog‘langan Email
                </label>
                <input
                  type="text"
                  placeholder="ID yoki email kiriting"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  alert("Parolni tiklash yo'riqnomasi Telegram yoki emailingizga jo'natildi!");
                  setMode('login');
                }}
                className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Tiklash havolasini yuborish
              </button>
              <button
                onClick={() => setMode('login')}
                className="w-full py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Orqaga qaytish
              </button>
            </div>
          )}
          </>
        )}

          {/* Active Devices & Logout all */}
          {currentUser && (
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-500 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                Faol qurilmalar: {currentUser.activeDevicesCount} ta
              </span>
              <button
                onClick={onLogoutAllDevices}
                className="text-red-600 dark:text-red-400 hover:underline font-semibold text-[11px]"
              >
                {t.auth.logoutAll}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
