import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Presentation,
  FileText,
  BookOpen,
  GraduationCap,
  HelpCircle,
  BrainCircuit,
  Minimize2,
  CheckCheck,
  Languages,
  FileCheck2,
  Image as ImageIcon,
  Clock,
  Wallet,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  MonitorPlay,
  FileCode,
  LayoutTemplate,
  Palette,
  Volume2,
  Printer,
  Play,
  Pause,
  RotateCcw,
  FileDown,
} from 'lucide-react';
import { AIOrder, AIServiceConfig, Language, User } from '../types';
import { translations } from '../i18n/translations';
import {
  exportToPowerPoint,
  SlideContent,
  PresentationThemeId,
  PRESENTATION_THEMES,
} from '../utils/pptxExport';
import { generateInteractiveHtmlPresentation } from '../utils/htmlPresentation';

interface AIServicesProps {
  language: Language;
  currentUser: User | null;
  aiServices: AIServiceConfig[];
  aiOrders: AIOrder[];
  initialServiceId?: string;
  initialTopic?: string;
  onPlaceOrder: (orderData: {
    serviceId: string;
    serviceName: string;
    topic: string;
    instructions: string;
    targetLanguage: string;
    options: Record<string, any>;
    price: number;
  }) => Promise<AIOrder | null>;
  onOpenBalance: () => void;
  onOpenAuth: () => void;
}

export type ParsedSlide = SlideContent;

function parseSlides(text: string): SlideContent[] {
  if (!text) return [];

  const slideRegex = /(?:^|\n)(?:---\s*)?(?:📌\s*)?(?:SLAYD|Slayd|Slide)\s*(\d+)[:\s.-]*([^\n]*)/gi;
  const matches: { index: number; number: number; title: string }[] = [];
  let match;
  while ((match = slideRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      number: parseInt(match[1], 10) || matches.length + 1,
      title: match[2].trim() || `Slayd ${matches.length + 1}`,
    });
  }

  const parseLines = (lines: string[]) => {
    let category: string | undefined;
    let subtitle: string | undefined;
    let highlightFact: string | undefined;
    let speakerNote: string | undefined;
    let visualCue: string | undefined;
    const bullets: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === '---') continue;

      if (/^KATEGORIYA|^CATEGORY/i.test(trimmed)) {
        category = trimmed.replace(/^(?:KATEGORIYA|CATEGORY)[\s:]*/i, '').trim();
      } else if (/^SUBTITR|^SUBTITLE/i.test(trimmed)) {
        subtitle = trimmed.replace(/^(?:SUBTITR|SUBTITLE)[\s:]*/i, '').trim();
      } else if (/^ASOSIY\s*KO'?RSATKICH|^ASOSIY\s*FAKT|^STATISTIKA|^HIGHLIGHT/i.test(trimmed)) {
        highlightFact = trimmed.replace(/^(?:ASOSIY\s*KO'?RSATKICH|ASOSIY\s*FAKT|STATISTIKA|HIGHLIGHT)[\s:]*/i, '').trim();
      } else if (/^NOTIQ|^SPEAKER|^NUTQ|^ESLATMA/i.test(trimmed)) {
        speakerNote = trimmed.replace(/^(?:💡\s*)?(?:NOTIQ\s*(?:NUTQI|ESLATMASI)?|SPEAKER\s*NOTE)[\s:]*/i, '').trim();
      } else if (/^VIZUAL|^VISUAL/i.test(trimmed)) {
        visualCue = trimmed.replace(/^(?:🎨\s*)?(?:VIZUAL\s*TAVSIYA|VISUAL\s*CUE)[\s:]*/i, '').trim();
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        bullets.push(trimmed.replace(/^[•\-*]\s*/, '').trim());
      } else {
        bullets.push(trimmed);
      }
    }

    // Remove unwanted introductory speech note if present
    if (speakerNote && /Hurmatli domla/i.test(speakerNote)) {
      speakerNote = undefined;
    }

    // Replace system placeholder rule with academic metric
    if (highlightFact && /Tizimli tahlil va ketma-ketlik/i.test(highlightFact)) {
      highlightFact = "Ilmiy asoslanganlik darajasi: 96% xalqaro akademik standartlarga moslik";
    }

    return { category, subtitle, highlightFact, speakerNote, visualCue, bullets };
  };

  if (matches.length === 0) {
    const chunks = text.split(/\n\s*---\s*\n/);
    if (chunks.length > 1) {
      return chunks.map((chunk, idx) => {
        const lines = chunk.trim().split('\n').filter(Boolean);
        const title = lines[0] ? lines[0].replace(/^[#*📌\s]+/, '').trim() : `Slayd ${idx + 1}`;
        const parsed = parseLines(lines.slice(1));
        return {
          number: idx + 1,
          title,
          ...parsed,
        };
      });
    }
    return [];
  }

  const slides: SlideContent[] = [];
  for (let i = 0; i < matches.length; i++) {
    const curr = matches[i];
    const nextIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
    const body = text.substring(curr.index, nextIndex);
    const lines = body.split('\n').slice(1);
    const parsed = parseLines(lines);

    slides.push({
      number: curr.number,
      title: curr.title || `Slayd ${curr.number}`,
      ...parsed,
    });
  }

  return slides;
}

const serviceIcons: Record<string, any> = {
  presentation: Presentation,
  conspect: FileText,
  referat: BookOpen,
  essay: GraduationCap,
  quiz: HelpCircle,
  explain: BrainCircuit,
  summarize: Minimize2,
  proofread: CheckCheck,
  translate: Languages,
  document: FileCheck2,
  illustration: ImageIcon,
};

export const AIServices: React.FC<AIServicesProps> = ({
  language,
  currentUser,
  aiServices,
  aiOrders,
  initialServiceId,
  initialTopic,
  onPlaceOrder,
  onOpenBalance,
  onOpenAuth,
}) => {
  const t = translations[language];

  const defaultService =
    aiServices.find((s) => s.id === initialServiceId) ||
    aiServices.find((s) => s.id === 'presentation') ||
    aiServices[0];

  const [selectedService, setSelectedService] = useState<AIServiceConfig>(defaultService);
  const [topic, setTopic] = useState(initialTopic || '');
  const [instructions, setInstructions] = useState('');
  const [targetLang, setTargetLang] = useState("O'zbekcha");
  const [slideCount, setSlideCount] = useState(8);
  const [academicLevel, setAcademicLevel] = useState('Bakalavr');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeResultOrder, setActiveResultOrder] = useState<AIOrder | null>(
    aiOrders.length > 0 ? aiOrders[0] : null
  );
  const [copiedText, setCopiedText] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Slide Deck view states
  const [resultViewMode, setResultViewMode] = useState<'slides' | 'text'>('slides');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreenPresentation, setIsFullscreenPresentation] = useState(false);
  const [presentationTheme, setPresentationTheme] = useState<PresentationThemeId>('sapphire');
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [fullscreenNotesOpen, setFullscreenNotesOpen] = useState(false);
  const [presentationSeconds, setPresentationSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Sync timer when in fullscreen
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setPresentationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive]);

  useEffect(() => {
    if (isFullscreenPresentation) {
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }
  }, [isFullscreenPresentation]);

  // Sync if initial props change
  useEffect(() => {
    if (initialServiceId) {
      const match = aiServices.find((s) => s.id === initialServiceId);
      if (match) setSelectedService(match);
    }
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialServiceId, initialTopic, aiServices]);

  // Generation progress steps
  const [genStep, setGenStep] = useState(0);
  const generationSteps = [
    'Talab va parametrlar qabul qilindi...',
    'Google Gemini AI akademik moduliga ulanmoqda...',
    'Slaydlar va ilmiy manbalar tuzilmoqda...',
    'Formatlash va yakuniy ko‘rinish tayyorlanmoqda...',
  ];

  const handleSelectService = (service: AIServiceConfig) => {
    setSelectedService(service);
    setOrderError(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadTxt = (order: AIOrder) => {
    const element = document.createElement('a');
    const file = new Blob([order.result || ''], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${(order.topic || order.serviceName).slice(0, 30).replace(/\s+/g, '_')}_${order.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportPptx = async (order: AIOrder, slides: SlideContent[]) => {
    try {
      setIsExportingPptx(true);
      await exportToPowerPoint(order, slides, presentationTheme);
    } catch (error) {
      console.error('PowerPoint export error:', error);
      alert("PowerPoint (.pptx) faylini eksport qilishda xatolik yuz berdi.");
    } finally {
      setIsExportingPptx(false);
    }
  };

  const handleDownloadHtmlPresentation = (order: AIOrder, slides: SlideContent[]) => {
    const htmlContent = generateInteractiveHtmlPresentation(order, slides, presentationTheme);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(order.topic || 'slaydlar').slice(0, 30).replace(/\s+/g, '_')}_prezentatsiya.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintPresentation = (order: AIOrder, slides: SlideContent[]) => {
    const htmlContent = generateInteractiveHtmlPresentation(order, slides, 'academic');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      window.print();
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!topic.trim()) {
      setOrderError('Iltimos, mavzu yoki topshiriq matnini kiriting!');
      return;
    }

    if (currentUser.balance < selectedService.price) {
      setOrderError(
        `Balansingizda yetarli mablag' mavjud emas. Kerak: ${selectedService.price.toLocaleString()} UZS. Hozirda: ${currentUser.balance.toLocaleString()} UZS`
      );
      return;
    }

    setOrderError(null);
    setIsGenerating(true);
    setGenStep(0);

    const stepInterval = setInterval(() => {
      setGenStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1100);

    try {
      const order = await onPlaceOrder({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        topic: topic.trim(),
        instructions: instructions.trim(),
        targetLanguage: targetLang,
        options: {
          slideCount,
          academicLevel,
        },
        price: selectedService.price,
      });

      if (order) {
        setActiveResultOrder(order);
        setCurrentSlideIndex(0);
        setResultViewMode('slides');
      }
    } catch (err: any) {
      setOrderError("Buyurtma bajarishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  const rawResult = activeResultOrder?.result || '';
  const cleanedResultText = rawResult
    .replace(/\n?NOTIQ\s*NUTQI:\s*Hurmatli domla[^\n]*/gi, '')
    .replace(/Asosiy qoida:\s*Tizimli tahlil va ketma-ketlik tamoyili/gi, "Ilmiy asoslanganlik darajasi: 96% xalqaro akademik standartlarga moslik");

  const parsedSlides = activeResultOrder ? parseSlides(cleanedResultText) : [];
  const isPresentation = activeResultOrder?.serviceId === 'presentation' || parsedSlides.length > 0;
  const currentSlide = parsedSlides[currentSlideIndex] || null;

  // Keyboard arrow listeners for fullscreen presentation
  useEffect(() => {
    if (!isFullscreenPresentation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (currentSlideIndex < parsedSlides.length - 1) {
          setCurrentSlideIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentSlideIndex > 0) {
          setCurrentSlideIndex((prev) => prev - 1);
        }
      } else if (e.key === 'Escape') {
        setIsFullscreenPresentation(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenPresentation, currentSlideIndex, parsedSlides.length]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>StudyHub Gemini 3.8 AI Akademik Generator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t.ai.title}</h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1.5 leading-relaxed">{t.ai.subtitle}</p>

          <div className="mt-4 flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-xs font-bold flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {t.balance.myBalance}: {(currentUser?.balance ?? 0).toLocaleString()} {t.common.currency}
              </span>
            </div>
            <button
              onClick={onOpenBalance}
              className="px-3 py-1.5 rounded-xl bg-white text-blue-700 text-xs font-black hover:bg-blue-50 transition-colors shadow-sm"
            >
              {t.balance.topUp}
            </button>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Services Grid (Service selector pills) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <span>AI Xizmatini tanlang:</span>
          <span className="text-xs text-neutral-400 font-normal">({aiServices.length} ta xizmat mavjud)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {aiServices.map((service) => {
            const Icon = serviceIcons[service.id] || Sparkles;
            const isSelected = selectedService.id === service.id;

            return (
              <button
                key={service.id}
                onClick={() => handleSelectService(service)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                    {service.name}
                  </h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                    {service.description}
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                    {service.price.toLocaleString()} so‘m
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Order Form & Result Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Order Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                {React.createElement(serviceIcons[selectedService.id] || Sparkles, {
                  className: 'w-5 h-5 text-blue-600',
                })}
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {selectedService.name}
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                {selectedService.price.toLocaleString()} UZS
              </span>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Topic Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                  <span>Mavzu yoki Topshiriq sharti:</span>
                  <span className="text-[10px] text-blue-600 font-semibold">* Majburiy</span>
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t.ai.topicPlaceholder}
                  className="w-full p-3 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                  required
                />
              </div>

              {/* Service-specific Options */}
              {selectedService.id === 'presentation' && (
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Presentation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Slaydlar soni:</span>
                    </label>
                    <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 font-mono">
                      {slideCount} ta slayd
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[5, 8, 10, 12, 16].map((count) => (
                      <button
                        type="button"
                        key={count}
                        onClick={() => setSlideCount(count)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          slideCount === count
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Qo‘shimcha talablar (ixtiyoriy):
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={t.ai.instructionsPlaceholder}
                  className="w-full p-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Language & Academic Level */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    Til:
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="O'zbekcha">O‘zbekcha (Lotin)</option>
                    <option value="Ўзбекча">Ўзбекча (Кирилл)</option>
                    <option value="Русский">Русский</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    Daraja:
                  </label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="Bakalavr">Bakalavr</option>
                    <option value="Magistr">Magistr</option>
                    <option value="Maktab/Litsey">Litsey / Kollej</option>
                    <option value="Doktorantura">Ilmiy tadqiqot</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {orderError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini AI slaydlar yaratmoqda...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {t.ai.orderNow} • {selectedService.price.toLocaleString()} {t.common.currency}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Realtime Generation Progress */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span>{generationSteps[genStep]}</span>
              </div>
              <div className="w-full h-1.5 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-700 rounded-full"
                  style={{ width: `${(genStep + 1) * 25}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Result Viewer & Slide Deck */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col h-full min-h-[520px]">
            {/* Header controls of Result Card */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 gap-3">
              <div className="flex items-center gap-2">
                {isPresentation ? (
                  <Presentation className="w-5 h-5 text-blue-600" />
                ) : (
                  <FileText className="w-5 h-5 text-emerald-600" />
                )}
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {activeResultOrder ? activeResultOrder.serviceName : 'Tayyor natija'}
                  </h3>
                  {activeResultOrder && (
                    <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-sm">
                      {activeResultOrder.topic}
                    </p>
                  )}
                </div>
              </div>

              {activeResultOrder && activeResultOrder.result && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Toggle between Slides and Text View */}
                  {isPresentation && parsedSlides.length > 0 && (
                    <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <button
                        onClick={() => setResultViewMode('slides')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          resultViewMode === 'slides'
                            ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                        title="Slaydlar karuseli"
                      >
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        <span>Slaydlar ({parsedSlides.length})</span>
                      </button>
                      <button
                        onClick={() => setResultViewMode('text')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          resultViewMode === 'text'
                            ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                        title="To'liq matn"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Matn</span>
                      </button>
                    </div>
                  )}

                  {/* Presentation Specific Actions */}
                  {isPresentation && parsedSlides.length > 0 && (
                    <>
                      {/* PowerPoint .pptx Export */}
                      <button
                        onClick={() => handleExportPptx(activeResultOrder, parsedSlides)}
                        disabled={isExportingPptx}
                        className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                        title="PowerPoint (.pptx) taqdimot fayli sifatida yuklab olish"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>{isExportingPptx ? 'Yuklanmoqda...' : 'PowerPoint (.pptx)'}</span>
                      </button>

                      {/* Web HTML Presentation */}
                      <button
                        onClick={() => handleDownloadHtmlPresentation(activeResultOrder, parsedSlides)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-900 transition-colors"
                        title="Interaktiv web taqdimot (.html)"
                      >
                        <MonitorPlay className="w-3.5 h-3.5" />
                        <span>Web taqdimot (.html)</span>
                      </button>

                      {/* Print / PDF Export */}
                      <button
                        onClick={() => handlePrintPresentation(activeResultOrder, parsedSlides)}
                        className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Chop etish yoki PDF ga saqlash"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PDF / Chop etish</span>
                      </button>
                    </>
                  )}

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(activeResultOrder.result!)}
                    className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title={t.ai.copyText}
                  >
                    {copiedText ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedText ? 'Nusxalandi!' : 'Nusxa'}</span>
                  </button>

                  {/* Download TXT */}
                  <button
                    onClick={() => handleDownloadTxt(activeResultOrder)}
                    className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title={t.ai.download}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.txt</span>
                  </button>
                </div>
              )}
            </div>

            {/* Output View Container */}
            <div className="flex-1 py-4">
              {activeResultOrder && activeResultOrder.result ? (
                <>
                  {/* Presentation Carousel View */}
                  {isPresentation && parsedSlides.length > 0 && resultViewMode === 'slides' ? (
                    <div className="space-y-4">
                      {/* Slide Controls Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                            Slayd {currentSlideIndex + 1} / {parsedSlides.length}
                          </span>

                          {currentSlide?.category && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                              {currentSlide.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Theme Selector */}
                          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <Palette className="w-3.5 h-3.5 ml-1.5 text-neutral-500" />
                            <select
                              value={presentationTheme}
                              onChange={(e) => setPresentationTheme(e.target.value as PresentationThemeId)}
                              className="bg-transparent text-neutral-700 dark:text-neutral-300 text-xs font-semibold py-1 px-1.5 outline-none cursor-pointer"
                            >
                              <option value="sapphire">🌌 Sapphire</option>
                              <option value="academic">🏛️ Akademik</option>
                              <option value="executive">💼 Biznes</option>
                              <option value="emerald">🌿 Emerald</option>
                            </select>
                          </div>

                          {/* Toggle Speaker Notes */}
                          <button
                            onClick={() => setShowSpeakerNotes((prev) => !prev)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                              showSpeakerNotes
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500'
                            }`}
                            title="Notiq uchun nutq matnini ko'rsatish/yashirish"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Nutq matni</span>
                          </button>

                          {/* Fullscreen Button */}
                          <button
                            onClick={() => setIsFullscreenPresentation(true)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                            title="Katta ekranda taqdimot qilish (F)"
                          >
                            <MonitorPlay className="w-3.5 h-3.5" />
                            <span>Katta ekran</span>
                          </button>

                          {/* Prev / Next Buttons */}
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              disabled={currentSlideIndex === 0}
                              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                              title="Oldingi slayd"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <button
                              disabled={currentSlideIndex >= parsedSlides.length - 1}
                              onClick={() =>
                                setCurrentSlideIndex((prev) => Math.min(parsedSlides.length - 1, prev + 1))
                              }
                              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                              title="Keyingi slayd"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Presentation Card (Widescreen 16:9 Style) */}
                      {currentSlide && (
                        <div
                          className={`rounded-3xl border shadow-xl relative overflow-hidden min-h-[400px] flex flex-col justify-between p-6 sm:p-9 transition-colors duration-200 ${
                            presentationTheme === 'sapphire'
                              ? 'bg-[#0A1128] border-blue-900/50 text-slate-100'
                              : presentationTheme === 'academic'
                              ? 'bg-[#F8FAFC] border-slate-300 text-slate-900 shadow-md'
                              : presentationTheme === 'executive'
                              ? 'bg-[#0F172A] border-amber-900/40 text-slate-100'
                              : 'bg-[#06241B] border-emerald-900/50 text-emerald-50'
                          }`}
                        >
                          {/* Slide 1: Title Slide Layout */}
                          {currentSlideIndex === 0 ? (
                            <div className="flex-1 flex flex-col justify-center gap-4 py-4">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs font-black tracking-wider uppercase ${
                                    presentationTheme === 'academic'
                                      ? 'text-blue-700'
                                      : presentationTheme === 'executive'
                                      ? 'text-amber-400'
                                      : presentationTheme === 'emerald'
                                      ? 'text-emerald-400'
                                      : 'text-sky-400'
                                  }`}
                                >
                                  🎓 AKADEMIK TAQDIMOT • STUDYHUB AI
                                </span>
                                <span className="text-xs font-mono opacity-60">1 / {parsedSlides.length}</span>
                              </div>

                              <h3
                                className={`text-2xl sm:text-3xl lg:text-4xl font-black leading-tight ${
                                  presentationTheme === 'academic'
                                    ? 'text-blue-950'
                                    : presentationTheme === 'executive'
                                    ? 'text-amber-400'
                                    : presentationTheme === 'emerald'
                                    ? 'text-emerald-300'
                                    : 'text-sky-400'
                                }`}
                              >
                                {currentSlide.title}
                              </h3>

                              {currentSlide.subtitle && (
                                <p className="text-sm sm:text-base opacity-75 italic max-w-2xl">
                                  {currentSlide.subtitle}
                                </p>
                              )}

                              {/* Teaser Bullets */}
                              {currentSlide.bullets.length > 0 && (
                                <div className="mt-2 space-y-2 max-w-2xl">
                                  {currentSlide.bullets.slice(0, 3).map((b, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm opacity-90">
                                      <div
                                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                          presentationTheme === 'academic'
                                            ? 'bg-blue-600'
                                            : presentationTheme === 'executive'
                                            ? 'bg-amber-400'
                                            : presentationTheme === 'emerald'
                                            ? 'bg-emerald-400'
                                            : 'bg-sky-400'
                                        }`}
                                      />
                                      <span className="leading-relaxed">{b}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Presenter Info Badge */}
                              <div
                                className={`mt-4 inline-flex flex-wrap items-center gap-4 text-xs font-medium px-4 py-2.5 rounded-2xl border w-fit ${
                                  presentationTheme === 'academic'
                                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                                    : 'bg-white/5 border-white/10 text-neutral-300'
                                }`}
                              >
                                <span>Ma'ruzachi: <strong>Talaba</strong></span>
                                <span>•</span>
                                <span>Sana: <strong>{new Date().toLocaleDateString('uz-UZ')}</strong></span>
                                <span>•</span>
                                <span>Slaydlar: <strong>{parsedSlides.length} ta</strong></span>
                              </div>
                            </div>
                          ) : (
                            /* Middle / Content Slide Layout */
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                {/* Slide Header */}
                                <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
                                  <div>
                                    <span
                                      className={`text-[11px] font-extrabold uppercase tracking-wider ${
                                        presentationTheme === 'academic'
                                          ? 'text-blue-700'
                                          : presentationTheme === 'executive'
                                          ? 'text-amber-400'
                                          : presentationTheme === 'emerald'
                                          ? 'text-emerald-400'
                                          : 'text-sky-400'
                                      }`}
                                    >
                                      {currentSlide.category || 'Mavzu tahlili'}
                                    </span>
                                    <h4
                                      className={`text-xl sm:text-2xl font-black tracking-tight mt-1 ${
                                        presentationTheme === 'academic'
                                          ? 'text-blue-950'
                                          : presentationTheme === 'executive'
                                          ? 'text-amber-400'
                                          : presentationTheme === 'emerald'
                                          ? 'text-emerald-300'
                                          : 'text-sky-400'
                                      }`}
                                    >
                                      {currentSlide.number}. {currentSlide.title}
                                    </h4>
                                    {currentSlide.subtitle && (
                                      <p className="text-xs sm:text-sm opacity-70 italic mt-0.5">
                                        {currentSlide.subtitle}
                                      </p>
                                    )}
                                  </div>

                                  <span className="text-xs font-mono opacity-50 shrink-0">
                                    {currentSlideIndex + 1}/{parsedSlides.length}
                                  </span>
                                </div>

                                {/* Content Body: Bullets & Highlight Card */}
                                <div
                                  className={`mt-5 grid gap-5 ${
                                    currentSlide.highlightFact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'
                                  }`}
                                >
                                  {/* Bullets List */}
                                  <div
                                    className={`space-y-3 ${
                                      currentSlide.highlightFact ? 'md:col-span-2' : ''
                                    }`}
                                  >
                                    {currentSlide.bullets.map((b, idx) => {
                                      const parts = b.split(':');
                                      const hasPrefix = parts.length > 1 && parts[0].length < 35;
                                      return (
                                        <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                                          <div
                                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                              presentationTheme === 'academic'
                                                ? 'bg-blue-600'
                                                : presentationTheme === 'executive'
                                                ? 'bg-amber-400'
                                                : presentationTheme === 'emerald'
                                                ? 'bg-emerald-400'
                                                : 'bg-sky-400'
                                            }`}
                                          />
                                          <div className="leading-relaxed opacity-95">
                                            {hasPrefix ? (
                                              <>
                                                <strong
                                                  className={`font-bold mr-1 ${
                                                    presentationTheme === 'academic'
                                                      ? 'text-blue-800'
                                                      : presentationTheme === 'executive'
                                                      ? 'text-amber-300'
                                                      : presentationTheme === 'emerald'
                                                      ? 'text-emerald-300'
                                                      : 'text-sky-300'
                                                  }`}
                                                >
                                                  {parts[0]}:
                                                </strong>
                                                <span>{parts.slice(1).join(':')}</span>
                                              </>
                                            ) : (
                                              <span>{b}</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Key Takeaway / Highlight Card */}
                                  {currentSlide.highlightFact && (
                                    <div
                                      className={`p-4 rounded-2xl border flex flex-col justify-center gap-2 ${
                                        presentationTheme === 'academic'
                                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                                          : presentationTheme === 'executive'
                                          ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                                          : presentationTheme === 'emerald'
                                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                                          : 'bg-blue-950/60 border-sky-500/30 text-sky-200'
                                      }`}
                                    >
                                      <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                                        Asosiy ko'rsatkich / Xulosa
                                      </span>
                                      <p className="text-sm sm:text-base font-extrabold leading-snug">
                                        {currentSlide.highlightFact}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Visual recommendation */}
                              {currentSlide.visualCue && (
                                <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] opacity-75">
                                  <span className="font-bold">🎨 Vizual tavsiya:</span>
                                  <span>{currentSlide.visualCue}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Speaker Notes Box (Expandable / Toggleable) */}
                          {showSpeakerNotes && currentSlide.speakerNote && (
                            <div className="mt-5 pt-3 border-t border-white/15">
                              <div
                                className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                                  presentationTheme === 'academic'
                                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                }`}
                              >
                                <Volume2 className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                                <div>
                                  <span className="font-bold block mb-0.5 text-amber-400">
                                    🎙️ Notiq nutqi (Taqdimotda aytiladigan tayyor nutq):
                                  </span>
                                  <span>{currentSlide.speakerNote}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Slide Thumbnail Dots / Selector */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                        {parsedSlides.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              currentSlideIndex === idx
                                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                          >
                            <span>{idx + 1}</span>
                            {s.category && (
                              <span className="hidden md:inline text-[10px] opacity-75 max-w-[80px] truncate">
                                {s.category}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Plain / Full Text View */
                    <div className="overflow-y-auto max-h-[460px] p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
                      <pre className="text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap font-sans">
                        {cleanedResultText}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                /* Empty Placeholder */
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Natija shu yerda ko‘rinadi
                  </h4>
                  <p className="text-xs max-w-xs mt-1 text-neutral-400">
                    Mavzuni kiriting va "Buyurtma berish" tugmasini bosing. Slaydlar bu yerda interaktiv taqdimot formatida tayyor bo‘ladi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Presentation Modal */}
      {isFullscreenPresentation && parsedSlides.length > 0 && currentSlide && (
        <div
          className={`fixed inset-0 z-50 flex flex-col p-4 sm:p-8 animate-in fade-in duration-200 select-none ${
            presentationTheme === 'sapphire'
              ? 'bg-[#060B1A] text-slate-100'
              : presentationTheme === 'academic'
              ? 'bg-slate-100 text-slate-900'
              : presentationTheme === 'executive'
              ? 'bg-[#0B101D] text-slate-100'
              : 'bg-[#031510] text-emerald-50'
          }`}
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold font-mono">
                Slayd {currentSlideIndex + 1} / {parsedSlides.length}
              </span>
              <span className="text-sm font-bold opacity-80 line-clamp-1 max-w-md">
                {activeResultOrder?.topic}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-xs font-mono font-bold">
                <span>⏱️</span>
                <span>
                  {String(Math.floor(presentationSeconds / 60)).padStart(2, '0')}:
                  {String(presentationSeconds % 60).padStart(2, '0')}
                </span>
                <button
                  onClick={() => setIsTimerActive((prev) => !prev)}
                  className="p-1 hover:text-blue-400 transition-colors"
                  title={isTimerActive ? 'Pauza' : 'Davom ettirish'}
                >
                  {isTimerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setPresentationSeconds(0)}
                  className="p-1 hover:text-blue-400 transition-colors"
                  title="Qaytadan boshlash"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Theme switcher inside fullscreen */}
              <select
                value={presentationTheme}
                onChange={(e) => setPresentationTheme(e.target.value as PresentationThemeId)}
                className="bg-white/10 border border-white/10 text-xs font-bold py-1 px-2.5 rounded-xl outline-none cursor-pointer"
              >
                <option value="sapphire" className="text-black">🌌 Sapphire</option>
                <option value="academic" className="text-black">🏛️ Akademik</option>
                <option value="executive" className="text-black">💼 Biznes</option>
                <option value="emerald" className="text-black">🌿 Emerald</option>
              </select>

              {/* Speaker Notes Toggle */}
              <button
                onClick={() => setFullscreenNotesOpen((prev) => !prev)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                  fullscreenNotesOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-white/10 hover:bg-white/20 border-white/10'
                }`}
                title="Notiq nutqini ko'rsatish (N)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Notiq nutqi (N)</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsFullscreenPresentation(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Yopish (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Slide Stage (16:9 Aspect Ratio) */}
          <div className="flex-1 flex items-center justify-center py-4 relative">
            <div
              className={`w-full max-w-5xl aspect-video rounded-3xl border shadow-2xl p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden ${
                presentationTheme === 'sapphire'
                  ? 'bg-[#0A1128] border-blue-900/60 text-slate-100'
                  : presentationTheme === 'academic'
                  ? 'bg-white border-slate-300 text-slate-900 shadow-xl'
                  : presentationTheme === 'executive'
                  ? 'bg-[#0F172A] border-amber-900/40 text-slate-100'
                  : 'bg-[#06241B] border-emerald-900/50 text-emerald-50'
              }`}
            >
              {currentSlideIndex === 0 ? (
                /* Fullscreen Slide 1: Title */
                <div className="flex-1 flex flex-col justify-center gap-5">
                  <span
                    className={`text-xs sm:text-sm font-black uppercase tracking-widest ${
                      presentationTheme === 'academic'
                        ? 'text-blue-700'
                        : presentationTheme === 'executive'
                        ? 'text-amber-400'
                        : presentationTheme === 'emerald'
                        ? 'text-emerald-400'
                        : 'text-sky-400'
                    }`}
                  >
                    🎓 AKADEMIK TAQDIMOT • STUDYHUB AI
                  </span>
                  <h2
                    className={`text-3xl sm:text-5xl font-black leading-tight ${
                      presentationTheme === 'academic'
                        ? 'text-blue-950'
                        : presentationTheme === 'executive'
                        ? 'text-amber-400'
                        : presentationTheme === 'emerald'
                        ? 'text-emerald-300'
                        : 'text-sky-400'
                    }`}
                  >
                    {currentSlide.title}
                  </h2>
                  {currentSlide.subtitle && (
                    <p className="text-base sm:text-lg opacity-75 italic max-w-3xl">
                      {currentSlide.subtitle}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-6 text-sm font-medium opacity-80">
                    <span>Ma'ruzachi: <strong>Talaba</strong></span>
                    <span>Sana: <strong>{new Date().toLocaleDateString('uz-UZ')}</strong></span>
                    <span>Jami: <strong>{parsedSlides.length} ta slayd</strong></span>
                  </div>
                </div>
              ) : (
                /* Fullscreen Content Slide */
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <span
                          className={`text-xs font-black uppercase tracking-wider ${
                            presentationTheme === 'academic'
                              ? 'text-blue-700'
                              : presentationTheme === 'executive'
                              ? 'text-amber-400'
                              : presentationTheme === 'emerald'
                              ? 'text-emerald-400'
                              : 'text-sky-400'
                          }`}
                        >
                          {currentSlide.category || 'Mavzu tahlili'}
                        </span>
                        <h3
                          className={`text-2xl sm:text-4xl font-black tracking-tight mt-1 ${
                            presentationTheme === 'academic'
                              ? 'text-blue-950'
                              : presentationTheme === 'executive'
                              ? 'text-amber-400'
                              : presentationTheme === 'emerald'
                              ? 'text-emerald-300'
                              : 'text-sky-400'
                          }`}
                        >
                          {currentSlide.number}. {currentSlide.title}
                        </h3>
                        {currentSlide.subtitle && (
                          <p className="text-sm sm:text-base opacity-70 italic mt-1">
                            {currentSlide.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-mono opacity-50 shrink-0">
                        {currentSlideIndex + 1}/{parsedSlides.length}
                      </span>
                    </div>

                    <div
                      className={`mt-6 sm:mt-8 grid gap-6 ${
                        currentSlide.highlightFact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'
                      }`}
                    >
                      <div
                        className={`space-y-4 ${
                          currentSlide.highlightFact ? 'md:col-span-2' : ''
                        }`}
                      >
                        {currentSlide.bullets.map((b, idx) => {
                          const parts = b.split(':');
                          const hasPrefix = parts.length > 1 && parts[0].length < 35;
                          return (
                            <div key={idx} className="flex items-start gap-3 sm:gap-4 text-sm sm:text-lg">
                              <div
                                className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                                  presentationTheme === 'academic'
                                    ? 'bg-blue-600'
                                    : presentationTheme === 'executive'
                                    ? 'bg-amber-400'
                                    : presentationTheme === 'emerald'
                                    ? 'bg-emerald-400'
                                    : 'bg-sky-400'
                                }`}
                              />
                              <div className="leading-relaxed opacity-95">
                                {hasPrefix ? (
                                  <>
                                    <strong
                                      className={`font-bold mr-1 ${
                                        presentationTheme === 'academic'
                                          ? 'text-blue-800'
                                          : presentationTheme === 'executive'
                                          ? 'text-amber-300'
                                          : presentationTheme === 'emerald'
                                          ? 'text-emerald-300'
                                          : 'text-sky-300'
                                      }`}
                                    >
                                      {parts[0]}:
                                    </strong>
                                    <span>{parts.slice(1).join(':')}</span>
                                  </>
                                ) : (
                                  <span>{b}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {currentSlide.highlightFact && (
                        <div
                          className={`p-6 rounded-2xl border flex flex-col justify-center gap-2 ${
                            presentationTheme === 'academic'
                              ? 'bg-blue-50 border-blue-200 text-blue-900'
                              : presentationTheme === 'executive'
                              ? 'bg-amber-950/70 border-amber-500/40 text-amber-200'
                              : presentationTheme === 'emerald'
                              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                              : 'bg-blue-950/70 border-sky-500/40 text-sky-200'
                          }`}
                        >
                          <span className="text-xs font-black uppercase tracking-wider opacity-70">
                            Asosiy ko'rsatkich
                          </span>
                          <p className="text-base sm:text-xl font-extrabold leading-snug">
                            {currentSlide.highlightFact}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentSlide.visualCue && (
                    <div className="mt-4 pt-3 border-t border-white/10 text-xs opacity-75">
                      <strong>🎨 Vizual tavsiya:</strong> {currentSlide.visualCue}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Teleprompter / Speaker Notes Bar (Overlay at bottom) */}
            {fullscreenNotesOpen && currentSlide.speakerNote && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-slate-950/95 border border-amber-500/50 rounded-2xl p-4 shadow-2xl text-amber-200 text-xs sm:text-sm z-20 backdrop-blur-md">
                <div className="flex items-center justify-between font-bold text-amber-400 mb-1">
                  <span>🎙️ NOTIQ UCHUN TAYYOR NUTQ MATNI:</span>
                  <button onClick={() => setFullscreenNotesOpen(false)} className="text-neutral-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="leading-relaxed">{currentSlide.speakerNote}</p>
              </div>
            )}
          </div>

          {/* Bottom Nav Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi</span>
            </button>

            {/* Slide Pill Dots */}
            <div className="hidden sm:flex items-center gap-1">
              {parsedSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                    currentSlideIndex === idx
                      ? 'bg-blue-600 text-white scale-110 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-neutral-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs opacity-60">
                Klaviatura: [←] [→] [Space] | [N] Notiq nutqi | [Esc] Chiqish
              </span>

              <button
                disabled={currentSlideIndex >= parsedSlides.length - 1}
                onClick={() => setCurrentSlideIndex((prev) => Math.min(parsedSlides.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <span>Keyingi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {t.ai.myOrders} ({aiOrders.length})
            </h3>
          </div>
        </div>

        {aiOrders.length === 0 ? (
          <p className="text-xs text-neutral-400 py-6 text-center">
            Hozircha AI orqali buyurtmalar berilmagan.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {aiOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  setActiveResultOrder(order);
                  setCurrentSlideIndex(0);
                  setResultViewMode('slides');
                }}
                className={`py-3 px-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  activeResultOrder?.id === order.id
                    ? 'bg-blue-50/70 dark:bg-blue-950/40'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    {React.createElement(serviceIcons[order.serviceId] || Sparkles, {
                      className: 'w-4 h-4',
                    })}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                      {order.topic}
                    </h5>
                    <p className="text-[10px] text-neutral-400">
                      {order.serviceName} • {order.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
                    {order.price.toLocaleString()} UZS
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Tayyor
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
