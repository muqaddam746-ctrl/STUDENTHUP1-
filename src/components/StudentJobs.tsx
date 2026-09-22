import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Plus,
  Send,
  ExternalLink,
  CheckCircle,
  X,
  Building,
} from 'lucide-react';
import { JobListing, Language, User } from '../types';
import { translations } from '../i18n/translations';

interface StudentJobsProps {
  language: Language;
  currentUser: User | null;
  jobs: JobListing[];
  onAddJob: (job: Omit<JobListing, 'id' | 'createdAt'>) => void;
  onOpenAuth: () => void;
}

export const StudentJobs: React.FC<StudentJobsProps> = ({
  language,
  currentUser,
  jobs,
  onAddJob,
  onOpenAuth,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [activeApplyJob, setActiveApplyJob] = useState<JobListing | null>(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [applySent, setApplySent] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  // New Job state
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCity, setNewCity] = useState('Toshkent');
  const [newType, setNewType] = useState<JobListing['type']>('part-time');
  const [newSalary, setNewSalary] = useState('3,000,000 - 5,000,000 UZS');
  const [newDesc, setNewDesc] = useState('');
  const [newTelegram, setNewTelegram] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchSearch =
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === 'all' || j.type === selectedType;
      const matchCity = selectedCity === 'all' || j.city === selectedCity;

      return matchSearch && matchType && matchCity;
    });
  }, [jobs, searchQuery, selectedType, selectedCity]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplySent(true);
    setTimeout(() => {
      setApplySent(false);
      setActiveApplyJob(null);
      setApplyNotes('');
    }, 2000);
  };

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    onAddJob({
      title: newTitle,
      company: newCompany,
      type: newType,
      city: newCity,
      salary: newSalary,
      description: newDesc,
      requirements: ['O‘qish bilan birga olib ketish imkoniyati', 'Mas’uliyat'],
      contactTelegram: newTelegram || '@hr_contact',
      contactPhone: newPhone || '+998 90 000 00 00',
      postedBy: currentUser.name,
    });
    setNewTitle('');
    setNewCompany('');
    setShowAddJobModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t.jobs.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.jobs.subtitle}
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setShowAddJobModal(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.jobs.postJob}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kasb, kompaniya yoki ko‘nikma bo‘yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {[
            { id: 'all', label: 'Barcha turlar' },
            { id: 'part-time', label: t.jobs.partTime },
            { id: 'internship', label: t.jobs.internship },
            { id: 'remote', label: t.jobs.remote },
            { id: 'freelance', label: t.jobs.freelance },
            { id: 'junior', label: t.jobs.junior },
          ].map((tp) => (
            <button
              key={tp.id}
              onClick={() => setSelectedType(tp.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedType === tp.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {tp.label}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-700 hidden sm:block mx-1" />

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border-none focus:outline-none cursor-pointer"
          >
            <option value="all">Barcha shaharlar</option>
            <option value="Toshkent">Toshkent</option>
            <option value="Samarqand">Samarqand</option>
            <option value="Buxoro">Buxoro</option>
            <option value="Namangan">Namangan</option>
            <option value="Masofaviy (Remote)">Masofaviy (Remote)</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            Kriteriyalarga mos vakansiyalar topilmadi.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 capitalize">
                    {job.type}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black">
                    {job.salary}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-neutral-500 font-semibold flex items-center gap-1.5 mt-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>{job.company}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.city}</span>
                </p>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2.5 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Requirements tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {job.requirements.map((req, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">
                  Aloqa: {job.contactTelegram || job.contactPhone}
                </span>

                <button
                  onClick={() => {
                    if (!currentUser) onOpenAuth();
                    else setActiveApplyJob(job);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Send className="w-3 h-3" />
                  <span>{t.jobs.apply}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Apply Modal */}
      {activeApplyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex items-start justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Ariza yuborish
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {activeApplyJob.title} ({activeApplyJob.company})
                </h3>
              </div>
              <button
                onClick={() => setActiveApplyJob(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySent ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Arizangiz muvaffaqiyatli jo‘natildi!
                </h4>
                <p className="text-xs text-neutral-400">
                  Ish beruvchi tez orada siz bilan Telegram yoki telefon orqali bog‘lanadi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-xs space-y-1">
                  <p>
                    <strong>Nomzod:</strong> {currentUser?.name}
                  </p>
                  <p>
                    <strong>ID:</strong> {currentUser?.id}
                  </p>
                  <p>
                    <strong>Universitet:</strong> {currentUser?.university}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    O‘zingiz haqingizda / Qisqacha xat (Cover letter)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={applyNotes}
                    onChange={(e) => setApplyNotes(e.target.value)}
                    placeholder="Nega aynan siz bu lavozimga mos ekanligingizni va bo'sh vaqtlaringizni yozing..."
                    className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                  >
                    Arizani yuborish
                  </button>
                  {activeApplyJob.contactTelegram && (
                    <a
                      href={`https://t.me/${activeApplyJob.contactTelegram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </a>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>{t.jobs.postJob}</span>
              </h3>
              <button
                onClick={() => setShowAddJobModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Lavozim nomi *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masalan: Grafik dizayner (Part-time)"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kompaniya / Loyiha
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Kompaniya nomi"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ish turi
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="part-time">Part-time</option>
                    <option value="internship">Amaliyot</option>
                    <option value="remote">Masofaviy</option>
                    <option value="freelance">Freelance</option>
                    <option value="junior">Junior</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Maosh
                  </label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="3,000,000 UZS"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Shahar
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Toshkent"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Telegram aloqa (@username)
                </label>
                <input
                  type="text"
                  value={newTelegram}
                  onChange={(e) => setNewTelegram(e.target.value)}
                  placeholder="@hr_manager"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Batafsil talablar
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ish vazifalari va talablar..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Vakansiyani e’lon qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
