import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  BookOpen,
  HelpCircle,
  Sparkles,
  Briefcase,
  Home,
  ArrowRight,
} from 'lucide-react';
import { AIServiceConfig, HousingListing, JobListing, Language, QuizTest, StudyMaterial } from '../types';
import { translations } from '../i18n/translations';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  materials: StudyMaterial[];
  tests: QuizTest[];
  aiServices: AIServiceConfig[];
  jobs: JobListing[];
  housing: HousingListing[];
  onSelectResult: (tab: string, itemId?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  language,
  materials,
  tests,
  aiServices,
  jobs,
  housing,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const t = translations[language];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      tab: string;
      icon: any;
      badge?: string;
    }> = [];

    // Search AI services
    aiServices.forEach((s) => {
      if (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      ) {
        items.push({
          id: s.id,
          title: s.name,
          subtitle: s.description,
          category: t.nav.aiServices,
          tab: 'ai',
          icon: Sparkles,
          badge: `${s.price.toLocaleString()} UZS`,
        });
      }
    });

    // Search Materials
    materials.forEach((m) => {
      if (
        m.title.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.university.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q)
      ) {
        items.push({
          id: m.id,
          title: m.title,
          subtitle: `${m.subject} • ${m.university}`,
          category: t.nav.materials,
          tab: 'materials',
          icon: BookOpen,
          badge: m.type.toUpperCase(),
        });
      }
    });

    // Search Tests
    tests.forEach((test) => {
      if (
        test.title.toLowerCase().includes(q) ||
        test.subject.toLowerCase().includes(q) ||
        test.topic.toLowerCase().includes(q)
      ) {
        items.push({
          id: test.id,
          title: test.title,
          subtitle: `${test.subject} • ${test.topic} (${test.timeLimitMinutes} min)`,
          category: t.nav.tests,
          tab: 'tests',
          icon: HelpCircle,
          badge: `${test.questions.length} savol`,
        });
      }
    });

    // Search Jobs
    jobs.forEach((j) => {
      if (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.city.toLowerCase().includes(q)
      ) {
        items.push({
          id: j.id,
          title: j.title,
          subtitle: `${j.company} • ${j.city} • ${j.salary}`,
          category: t.nav.jobs,
          tab: 'jobs',
          icon: Briefcase,
          badge: j.type,
        });
      }
    });

    // Search Housing
    housing.forEach((h) => {
      if (
        h.title.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q)
      ) {
        items.push({
          id: h.id,
          title: h.title,
          subtitle: `${h.district} • ${h.price.toLocaleString()} UZS`,
          category: t.nav.housing,
          tab: 'housing',
          icon: Home,
          badge: h.type,
        });
      }
    });

    return items;
  }, [query, aiServices, materials, tests, jobs, housing, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Material, test, AI xizmati, ish yoki ijara qidirish..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 font-semibold"
          >
            ESC
          </button>
        </div>

        {/* Quick Category Suggestion Tags */}
        {!query && (
          <div className="p-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
              Tavsiya etiladigan qidiruvlar:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Python dasturlash', 'Matematika', 'Slayd yaratish', 'Junior dasturchi', 'Olmazor ijara'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 transition-colors"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Results List */}
        {query && (
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {results.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                "{query}" bo‘yicha hech qanday natija topilmadi.
              </div>
            ) : (
              results.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={`${item.tab}-${item.id}`}
                    onClick={() => {
                      onSelectResult(item.tab, item.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
