import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  BookOpen,
  FileText,
  Presentation,
  GraduationCap,
  ChevronRight,
  Bookmark,
  Check,
  Copy,
  ExternalLink,
  Wallet,
} from 'lucide-react';
import { Language, ScheduleItem, StudentTask, User } from '../types';
import { translations } from '../i18n/translations';

interface StudentPortalProps {
  language: Language;
  currentUser: User | null;
  tasks?: StudentTask[];
  onToggleTask?: (id: string) => void;
  onAddTask?: (task: Omit<StudentTask, 'id'>) => void;
  onDeleteTask?: (id: string) => void;
  schedule?: ScheduleItem[];
  onOpenAIServices: (serviceId?: string, prefillTopic?: string) => void;
  onOpenMaterials?: () => void;
  onOpenBalance?: () => void;
}

interface AcademicSubject {
  id: string;
  name: string;
  code: string;
  credits: number;
  teacher: string;
  department: string;
  color: string;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  language,
  currentUser,
  onOpenAIServices,
  onOpenMaterials,
  onOpenBalance,
}) => {
  const t = translations[language];

  // Note scratchpad saved in localStorage
  const [studentNote, setStudentNote] = useState(() => {
    return (
      localStorage.getItem('studyhub_quick_note') ||
      "Sun'iy intellekt fani bo'yicha 8 slaydlik akademik taqdimot tayyorlash rejalashtirildi.\nMa'lumotlar bazasi laboratoriyasi uchun SQL so'rovlari tahlili kerak."
    );
  });
  const [noteCopied, setNoteCopied] = useState(false);

  const handleSaveNote = (val: string) => {
    setStudentNote(val);
    localStorage.setItem('studyhub_quick_note', val);
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(studentNote);
    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 2000);
  };

  // Academic Subjects for the student's program
  const academicSubjects: AcademicSubject[] = [
    {
      id: 'sub-1',
      name: 'Sun’iy intellekt va Neyron tarmoqlari',
      code: 'AI-301',
      credits: 6,
      teacher: 'Dotsent A. Rahimov',
      department: 'Intellektual axborot tizimlari',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'sub-2',
      name: 'Algoritmlar va Ma’lumotlar tuzilmasi',
      code: 'CS-204',
      credits: 5,
      teacher: 'Prof. S. Karimov',
      department: 'Dasturiy injiniring',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'sub-3',
      name: 'Relyatsion ma’lumotlar bazasi (PostgreSQL & SQL)',
      code: 'DB-302',
      credits: 5,
      teacher: 'Katta o‘qituvchi N. Yusupov',
      department: 'Axborot xavfsizligi va tizimlari',
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 'sub-4',
      name: 'Komp’yuter tarmoqlari va Protokollar',
      code: 'NET-201',
      credits: 4,
      teacher: 'Dotsent M. Qodirov',
      department: 'Telekommunikatsiya texnologiyalari',
      color: 'from-amber-600 to-orange-600',
    },
    {
      id: 'sub-5',
      name: 'Dasturiy ta’minot arxitekturasi va Dizayn patternlari',
      code: 'SWE-401',
      credits: 5,
      teacher: 'PhD O. Saidov',
      department: 'Dasturiy injiniring',
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'sub-6',
      name: 'Ilmiy tadqiqot metodologiyasi va Akademik yozuv',
      code: 'RSM-102',
      credits: 5,
      teacher: 'Prof. D. Nazarova',
      department: 'Ijtimoiy-gumanitar fanlar',
      color: 'from-rose-600 to-red-600',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome & Student Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/10">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>2025-2026 O‘quv yili • {currentUser?.course || 3}-bosqich</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-200 text-xs font-mono font-bold border border-emerald-400/30">
              ID: {currentUser?.id || '84920153'}
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Xush kelibsiz, {currentUser?.name || 'Talaba'}!
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
            {currentUser?.university || 'Toshkent Axborot Texnologiyalari Universiteti (TATU)'} •{' '}
            {currentUser?.faculty || 'Dasturiy injiniring fakulteti'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenAIServices('presentation')}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-black text-xs hover:bg-blue-50 shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center gap-2"
            >
              <Presentation className="w-4 h-4 text-blue-600" />
              <span>Slayd va Taqdimot yaratish</span>
            </button>

            <button
              onClick={() => onOpenAIServices('conspect')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>AI Konspekt tayyorlash</span>
            </button>

            {onOpenBalance && (
              <button
                onClick={onOpenBalance}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Balans: {(currentUser?.balance ?? 0).toLocaleString()} UZS</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-8 opacity-10 pointer-events-none hidden md:block">
          <GraduationCap className="w-48 h-48 text-white" />
        </div>
      </div>

      {/* Key Academic & Platform Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold mb-2">
              <span>AI Yordamchi buyurtmalari</span>
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">11</span>
              <span className="text-xs text-neutral-400">ta xizmat faol</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            Slayd, konspekt, referat va ilmiy yordamchi
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold mb-2">
              <span>O‘quv Kutubxonasi</span>
              <BookOpen className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">350+</span>
              <span className="text-xs text-neutral-400">darslik & qo‘llanma</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            Onlayn o‘qish va bepul yuklab olish
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold mb-2">
              <span>Kuzgi Semestr Fanlari</span>
              <GraduationCap className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">6</span>
              <span className="text-xs text-neutral-400">ta mutaxassislik fani</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            Dasturiy injiniring va IT yo‘nalishi
          </p>
        </div>
      </div>

      {/* Main Content Layout: Academic Subjects & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): My Academic Subjects */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 gap-2">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Mening O‘quv Fanlarim (Kuzgi semestr)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    O‘quv rejasidagi fanlar va bir bosishda AI orqali slayd yoki konspekt tayyorlash
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 self-start sm:self-auto">
                6 ta fan
              </span>
            </div>

            {/* Subject Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {academicSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 border border-neutral-200 dark:border-neutral-600">
                        {sub.code}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                      {sub.name}
                    </h4>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {sub.teacher}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-1">
                      {sub.department}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenAIServices('presentation', sub.name)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Ushbu fandan prezentatsiya yaratish"
                    >
                      <Presentation className="w-3.5 h-3.5" />
                      <span>Slayd tuzish</span>
                    </button>

                    <button
                      onClick={() => onOpenAIServices('conspect', sub.name)}
                      className="px-2.5 py-1.5 rounded-xl bg-neutral-200/70 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Ushbu fandan konspekt tayyorlash"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Konspekt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Academic AI Assistants Widget */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Tezkor Akademik AI Yordamchilari
                </h3>
              </div>
              <button
                onClick={() => onOpenAIServices()}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                <span>Barchasi (11 ta)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <button
                onClick={() => onOpenAIServices('presentation')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-900/60 text-left hover:scale-[1.02] transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md shadow-blue-500/20">
                  <Presentation className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Slayd & Taqdimot</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Strukturali slaydlar</p>
              </button>

              <button
                onClick={() => onOpenAIServices('conspect')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-900/60 text-left hover:scale-[1.02] transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-md shadow-emerald-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Dars Konspekti</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Tezis va ta’riflar</p>
              </button>

              <button
                onClick={() => onOpenAIServices('referat')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border border-purple-200/60 dark:border-purple-900/60 text-left hover:scale-[1.02] transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 shadow-md shadow-purple-500/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Akademik Referat</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Reja va adabiyotlar</p>
              </button>

              <button
                onClick={() => onOpenAIServices('essay')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/60 dark:border-amber-900/60 text-left hover:scale-[1.02] transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-2 shadow-md shadow-amber-500/20">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Insho & Esse</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Tezis va xulosalar</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Academic Scratchpad & Quick Links */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Scratchpad / Eslatmalar daftari */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Shaxsiy Akademik Qaydlar
                </h3>
              </div>
              <button
                onClick={handleCopyNote}
                className="text-[11px] font-semibold text-neutral-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                title="Nusxalash"
              >
                {noteCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{noteCopied ? 'Nusxalandi' : 'Nusxa'}</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={studentNote}
              onChange={(e) => handleSaveNote(e.target.value)}
              placeholder="Muhim eslatmalar, ilmiy manbalar, mavzular rejalari yoki topshiriq xulosalarini shu yerga yozib boring..."
              className="w-full p-3.5 text-xs rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans resize-none"
            />

            <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1">
              <span>Brauzerda avtomatik saqlanadi</span>
              <span>{studentNote.length} belgi</span>
            </div>
          </div>

          {/* Useful Academic Links Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-850 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Talabalar Foydali Manbalari
            </h4>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  HEMIS axborot tizimi
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                  OTM Portal
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  ZiyoNET kutubxonasi
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  Darsliklar
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Google Scholar & Scopus
                </span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                  Maqolalar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
