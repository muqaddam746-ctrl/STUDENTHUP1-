import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Bell,
  Wallet,
  User as UserIcon,
  Sun,
  Moon,
  Globe,
  LogOut,
  Shield,
  Menu,
  X,
  Plus,
  BookOpen,
  HelpCircle,
  Briefcase,
  Home,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';
import { Language, NotificationItem, User } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenBalance: () => void;
  onOpenSearch: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenAuth,
  onOpenBalance,
  onOpenSearch,
  language,
  setLanguage,
  theme,
  toggleTheme,
  notifications,
  onMarkNotificationRead,
  onLogout,
}) => {
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isUserSuperAdmin = currentUser?.role === 'superadmin' && currentUser?.email === 'shovqiddin45@gmail.com';

  const navItems = [
    { id: 'portal', label: t.nav.portal, icon: LayoutDashboard },
    { id: 'ai', label: t.nav.aiServices, icon: Sparkles, badge: 'AI' },
    { id: 'materials', label: t.nav.materials, icon: BookOpen },
    { id: 'tests', label: t.nav.tests, icon: HelpCircle },
    { id: 'jobs', label: t.nav.jobs, icon: Briefcase },
    { id: 'housing', label: t.nav.housing, icon: Home },
    {
      id: 'admin',
      label: t.nav.admin,
      icon: Shield,
      badge: isUserSuperAdmin ? 'Super' : undefined,
    },
  ];

  const langLabels: Record<Language, { label: string; flag: string }> = {
    uz: { label: "O'zbekcha", flag: '🇺🇿' },
    uz_cyrl: { label: 'Ўзбекча', flag: '🇺🇿' },
    ru: { label: 'Русский', flag: '🇷🇺' },
    en: { label: 'English', flag: '🇬🇧' },
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tag */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('portal')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
                  Study<span className="text-blue-600 dark:text-blue-400">Hub</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    UZ
                  </span>
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block font-medium">
                  {t.tagline}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 font-bold'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search button */}
            <button
              onClick={onOpenSearch}
              title={t.nav.search}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.common.search}...</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] bg-neutral-200 dark:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setNotificationsOpen(false);
                  setProfileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Tilni tanlash / Выбор языка"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{langLabels[language].flag}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {(['uz', 'uz_cyrl', 'ru', 'en'] as Language[]).map((lng) => (
                    <button
                      key={lng}
                      onClick={() => {
                        setLanguage(lng);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-blue-50 dark:hover:bg-neutral-700 ${
                        language === lng ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-neutral-700' : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{langLabels[lng].flag}</span>
                        <span>{langLabels[lng].label}</span>
                      </span>
                      {language === lng && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={theme === 'dark' ? t.common.lightMode : t.common.darkMode}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setLangMenuOpen(false);
                  setProfileMenuOpen(false);
                }}
                className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title={t.common.notifications}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {t.common.notifications}
                      </h4>
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {unreadCount} yangi
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-700 max-h-72 overflow-y-auto my-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 py-6 text-center">
                        {t.common.noNotifications}
                      </p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationRead(n.id);
                            if (n.actionTab) setCurrentTab(n.actionTab);
                            setNotificationsOpen(false);
                          }}
                          className={`p-2.5 cursor-pointer rounded-lg text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50 ${
                            !n.read ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-neutral-800 dark:text-neutral-200 mb-0.5">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-neutral-400">{n.date}</span>
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Balance & Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Balance Pill */}
                <button
                  onClick={onOpenBalance}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs hover:shadow-sm transition-all"
                  title={t.balance.topUp}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{currentUser.balance.toLocaleString()}</span>
                  <span className="text-[10px] font-normal opacity-80">{t.common.currency}</span>
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] ml-1">
                    <Plus className="w-3 h-3" />
                  </div>
                </button>

                {/* Profile Pill / Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(!profileMenuOpen);
                      setLangMenuOpen(false);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
                  >
                    <div className="text-right hidden md:block">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                        {currentUser.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                        ID: {currentUser.id}
                      </div>
                    </div>
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/20"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {currentUser.name[0]}
                      </div>
                    )}
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-3 z-50 text-xs">
                      <div className="p-2 border-b border-neutral-100 dark:border-neutral-700 mb-2">
                        <p className="font-bold text-neutral-900 dark:text-white text-sm">
                          {currentUser.name}
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                          {currentUser.email}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-[10px]">
                          <Shield className="w-3 h-3" />
                          <span>
                            {currentUser.role === 'superadmin'
                              ? 'Super Admin (shovqiddin45@gmail.com)'
                              : currentUser.role === 'admin'
                              ? 'Admin'
                              : 'Talaba (Student)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                          Unikal ID: <span className="font-bold text-neutral-700 dark:text-neutral-200">{currentUser.id}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentTab('portal');
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>{t.nav.portal}</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenBalance();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>{t.nav.balance}</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab('admin');
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-semibold text-blue-600 dark:text-blue-400"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{t.nav.admin}</span>
                      </button>

                      <button
                        onClick={() => {
                          onLogout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.auth.logout}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t.auth.login}</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 pt-2 pb-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 font-bold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
