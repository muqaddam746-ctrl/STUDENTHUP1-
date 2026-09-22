import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  Presentation,
  Search,
  Filter,
  Download,
  Eye,
  Star,
  Bookmark,
  BookmarkCheck,
  Plus,
  X,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Language, StudyMaterial, User } from '../types';
import { translations } from '../i18n/translations';

interface StudyMaterialsProps {
  language: Language;
  currentUser: User | null;
  materials: StudyMaterial[];
  onUploadMaterial: (material: Omit<StudyMaterial, 'id' | 'views' | 'downloads' | 'rating' | 'createdAt'>) => void;
  onOpenAuth: () => void;
}

export const StudyMaterials: React.FC<StudyMaterialsProps> = ({
  language,
  currentUser,
  materials,
  onUploadMaterial,
  onOpenAuth,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['mat-1']);
  const [activePreviewMaterial, setActivePreviewMaterial] = useState<StudyMaterial | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Dasturlash');
  const [newUniversity, setNewUniversity] = useState('TATU');
  const [newType, setNewType] = useState<'book' | 'pdf' | 'conspect' | 'presentation' | 'video'>('pdf');
  const [newDesc, setNewDesc] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  const typeIcons: Record<string, any> = {
    book: BookOpen,
    pdf: FileText,
    conspect: FileText,
    presentation: Presentation,
    video: Video,
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Extract unique subjects and universities for filters
  const subjects = useMemo(() => {
    const list = Array.from(new Set(materials.map((m) => m.subject)));
    return ['all', ...list];
  }, [materials]);

  const universities = useMemo(() => {
    const list = Array.from(new Set(materials.map((m) => m.university)));
    return ['all', ...list];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || m.type === selectedType;
      const matchesSubject = selectedSubject === 'all' || m.subject === selectedSubject;
      const matchesUniversity = selectedUniversity === 'all' || m.university === selectedUniversity;

      return matchesSearch && matchesType && matchesSubject && matchesUniversity;
    });
  }, [materials, searchQuery, selectedType, selectedSubject, selectedUniversity]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    onUploadMaterial({
      title: newTitle,
      type: newType,
      subject: newSubject,
      university: newUniversity,
      author: currentUser.name,
      authorId: currentUser.id,
      fileSize: '4.2 MB',
      description: newDesc,
      downloadUrl: newFileUrl || 'https://studyhub.uz/files/sample.pdf',
    });
    setNewTitle('');
    setNewDesc('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t.materials.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.materials.subtitle}
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setShowUploadModal(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.materials.uploadMaterial}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Darslik, konspekt, fan yoki muallif nomi bilan qidirish..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent((searchQuery ? searchQuery + ' ' : '') + 'kitoblar darsliklar talabalar uchun')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-200 text-xs font-semibold shrink-0 transition-colors border border-neutral-200 dark:border-neutral-700"
            title="Google qidiruv tizimidan kitoblar va darsliklarni qidirish"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>Google Qidiruv</span>
          </a>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Types */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'book', label: t.materials.books },
              { id: 'pdf', label: t.materials.pdfFiles },
              { id: 'conspect', label: t.materials.conspects },
              { id: 'presentation', label: t.materials.presentations },
              { id: 'video', label: t.materials.videoLessons },
            ].map((tp) => (
              <button
                key={tp.id}
                onClick={() => setSelectedType(tp.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
                  selectedType === tp.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-700 hidden sm:block mx-1" />

          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border-none focus:outline-none cursor-pointer"
          >
            <option value="all">Barcha fanlar</option>
            {subjects
              .filter((s) => s !== 'all')
              .map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
          </select>

          {/* University Dropdown */}
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border-none focus:outline-none cursor-pointer"
          >
            <option value="all">Barcha OTMlar</option>
            {universities
              .filter((u) => u !== 'all')
              .map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            Tanlangan filtrlarga mos materiallar topilmadi.
          </div>
        ) : (
          filteredMaterials.map((mat) => {
            const Icon = typeIcons[mat.type] || FileText;
            const isBookmarked = bookmarkedIds.includes(mat.id);
            return (
              <div
                key={mat.id}
                onClick={() => setActivePreviewMaterial(mat)}
                className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <button
                      onClick={(e) => toggleBookmark(mat.id, e)}
                      className="p-1.5 rounded-xl text-neutral-400 hover:text-blue-600 transition-colors"
                      title={isBookmarked ? 'Saqlanganlardan o‘chirish' : 'Saqlab qo‘yish'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 mb-1.5">
                    {mat.subject}
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {mat.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {mat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="truncate max-w-[120px]">{mat.university}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{mat.rating}</span>
                    </div>
                  </div>

                  {/* Google Search Connected Badge & Link */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-50 dark:border-neutral-800/60 text-[10px]">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Google'ga ulangan</span>
                    </span>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(mat.title + ' ' + mat.author + ' kitob darslik pdf')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold"
                      title="Google qidiruv tizimidan tekshirish"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                      <span>Google</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      {activePreviewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                  {React.createElement(typeIcons[activePreviewMaterial.type] || FileText, {
                    className: 'w-6 h-6',
                  })}
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {activePreviewMaterial.type.toUpperCase()} • {activePreviewMaterial.fileSize}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                    {activePreviewMaterial.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActivePreviewMaterial(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Fan:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{activePreviewMaterial.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Universitet:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{activePreviewMaterial.university}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Muallif:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{activePreviewMaterial.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Ko‘rishlar:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{activePreviewMaterial.views} marta</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {activePreviewMaterial.description}
            </p>

            {/* Google Search Connected Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">Google Qidiruv Tizimi</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  ✓ Qidiruvga ulangan
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Ushbu kitob Schema.org Book va Google Indexing API orqali Google qidiruv tarmog'iga to'liq bog'langan.
              </p>
              <div className="flex gap-2 pt-1">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(activePreviewMaterial.title + ' ' + activePreviewMaterial.author + ' kitob pdf darslik')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-blue-500 text-xs font-semibold text-neutral-700 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google'da qidirish</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
                <a
                  href={`https://scholar.google.com/scholar?q=${encodeURIComponent(activePreviewMaterial.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-blue-500 text-xs font-semibold text-neutral-700 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Google Scholar</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  alert(`"${activePreviewMaterial.title}" faylini yuklab olish boshlandi!`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Download className="w-4 h-4" />
                <span>{t.materials.download} ({activePreviewMaterial.fileSize})</span>
              </button>

              <button
                onClick={() => {
                  alert("Onlayn ko'rish rejimi faollashdi!");
                }}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 text-neutral-700 dark:text-neutral-200 text-xs font-bold flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>{t.materials.preview}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>{t.materials.uploadMaterial}</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Material nomi *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masalan: Ma’lumotlar tuzilmasi konspekti"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Fan
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Dasturlash"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Turi
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="pdf">PDF</option>
                    <option value="book">Darslik</option>
                    <option value="conspect">Konspekt</option>
                    <option value="presentation">Prezentatsiya</option>
                    <option value="video">Video dars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  OTM / Universitet
                </label>
                <input
                  type="text"
                  value={newUniversity}
                  onChange={(e) => setNewUniversity(e.target.value)}
                  placeholder="TATU, O‘zMU yoki boshqa"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qisqacha tavsif
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Material haqida ma’lumot..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Yuklash va Bo‘lishish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
