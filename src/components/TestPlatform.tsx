import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  BarChart3,
  RotateCcw,
  Trophy,
  ArrowRight,
  BookOpen,
  Check,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { Language, QuizResult, QuizTest, User } from '../types';
import { translations } from '../i18n/translations';

interface TestPlatformProps {
  language: Language;
  currentUser: User | null;
  tests: QuizTest[];
  resultsHistory: QuizResult[];
  onCompleteQuiz: (result: Omit<QuizResult, 'id' | 'completedAt'>) => void;
  onOpenAuth: () => void;
}

export const TestPlatform: React.FC<TestPlatformProps> = ({
  language,
  currentUser,
  tests,
  resultsHistory,
  onCompleteQuiz,
  onOpenAuth,
}) => {
  const t = translations[language];

  const [activeTest, setActiveTest] = useState<QuizTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [testFinished, setTestFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'history' | 'rating'>('tests');

  // Test Timer
  useEffect(() => {
    if (!activeTest || testFinished) return;

    if (timeLeftSeconds <= 0) {
      handleFinishTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTest, testFinished, timeLeftSeconds]);

  const handleStartTest = (test: QuizTest) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeftSeconds(test.timeLimitMinutes * 60);
    setTestFinished(false);
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (testFinished) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleFinishTest = () => {
    if (!activeTest) return;
    setTestFinished(true);

    let correct = 0;
    activeTest.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const total = activeTest.questions.length;
    const score = Math.round((correct / total) * 100);

    onCompleteQuiz({
      testId: activeTest.id,
      testTitle: activeTest.title,
      userId: currentUser?.id || 'guest',
      score,
      totalQuestions: total,
      correctAnswers: correct,
    });
  };

  // Mock Leaderboard for students
  const leaderboard = [
    { rank: 1, name: 'Shahzodbek Rahimov', university: 'TATU', score: '98%', tests: 24, badge: '🥇' },
    { rank: 2, name: 'Madina Umarova', university: 'O‘zMU', score: '95%', tests: 19, badge: '🥈' },
    { rank: 3, name: 'Azizbek Karimov', university: 'INHA', score: '92%', tests: 22, badge: '🥉' },
    { rank: 4, name: 'Diyorbek Yusupov', university: 'ToshDTU', score: '89%', tests: 15 },
    { rank: 5, name: 'Temur Aliyev (Siz)', university: 'TATU', score: '88%', tests: 12 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t.tests.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.tests.subtitle}
          </p>
        </div>

        {/* View mode switcher */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('tests');
              setActiveTest(null);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'tests'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {t.tests.allTests}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {t.tests.myResults}
          </button>
          <button
            onClick={() => setActiveTab('rating')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'rating'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {t.tests.leaderboard}
          </button>
        </div>
      </div>

      {/* When Active Test is running */}
      {activeTest ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          {/* Quiz Top bar */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {activeTest.subject} • {activeTest.topic}
              </span>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {activeTest.title}
              </h3>
            </div>

            {/* Timer countdown */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-black shadow-sm ${
                timeLeftSeconds < 120
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 animate-pulse'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {Math.floor(timeLeftSeconds / 60)}:
                {(timeLeftSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* If test is not yet finished */}
          {!testFinished ? (
            <div className="space-y-6">
              {/* Question Navigation Bubbles */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activeTest.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      currentQuestionIndex === i
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : selectedAnswers[i] !== undefined
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Current Question */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                <span className="text-xs font-bold text-neutral-400 block mb-1">
                  Savol {currentQuestionIndex + 1} / {activeTest.questions.length}:
                </span>
                <p className="text-sm font-bold text-neutral-900 dark:text-white leading-relaxed">
                  {activeTest.questions[currentQuestionIndex].question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {activeTest.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                      className={`w-full p-3.5 rounded-2xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-blue-100 shadow-sm'
                          : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer controls */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 disabled:opacity-30"
                >
                  Oldingi
                </button>

                {currentQuestionIndex < activeTest.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5"
                  >
                    <span>Keyingisi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinishTest}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
                  >
                    Testni yakunlash
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results & Detailed Explanations */
            <div className="space-y-6">
              {/* Scorecard */}
              {(() => {
                let correct = 0;
                activeTest.questions.forEach((q, idx) => {
                  if (selectedAnswers[idx] === q.correctAnswer) correct++;
                });
                const total = activeTest.questions.length;
                const score = Math.round((correct / total) * 100);

                return (
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        Sinov natijasi
                      </span>
                      <h4 className="text-2xl font-black text-blue-950 dark:text-blue-100 mt-1">
                        Sizning natijangiz: {score}%
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
                        {correct} ta to‘g‘ri javob / {total} ta savoldan
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartTest(activeTest)}
                      className="px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Qaytadan topshirish</span>
                    </button>
                  </div>
                );
              })()}

              {/* Explanations List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Xatolar va to‘g‘ri javoblar tahlili:
                </h4>
                {activeTest.questions.map((q, idx) => {
                  const userAns = selectedAnswers[idx];
                  const isCorrect = userAns === q.correctAnswer;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {idx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-bold text-[11px]">
                            <CheckCircle2 className="w-4 h-4" /> To‘g‘ri
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1 font-bold text-[11px]">
                            <XCircle className="w-4 h-4" /> Xato
                          </span>
                        )}
                      </div>

                      <p className="text-neutral-600 dark:text-neutral-400">
                        To‘g‘ri javob: <strong className="text-neutral-900 dark:text-white">{q.options[q.correctAnswer]}</strong>
                      </p>

                      {q.explanation && (
                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300">
                          <strong>Izoh:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTest(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold"
                >
                  Barcha testlarga qaytish
                </button>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'tests' ? (
        /* Test list cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {test.subject}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{test.timeLimitMinutes} daqiqa</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-2 group-hover:text-blue-600 transition-colors">
                  {test.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {test.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-semibold">
                  {test.questions.length} ta savol
                </span>

                <button
                  onClick={() => handleStartTest(test)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Boshlash</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'history' ? (
        /* Results History Table */
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Topshirilgan testlar statistikasi
          </h3>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {resultsHistory.map((res) => (
              <div key={res.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">{res.testTitle}</h4>
                  <p className="text-[10px] text-neutral-400">{res.completedAt}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500">
                    {res.correctAnswers} / {res.totalQuestions}
                  </span>
                  <span
                    className={`font-black px-2.5 py-1 rounded-xl ${
                      res.score >= 80
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}
                  >
                    {res.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Leaderboard table */
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Talabalar umumiy reytingi (Top studentlar)
            </h3>
          </div>
          <div className="space-y-2">
            {leaderboard.map((student) => (
              <div
                key={student.rank}
                className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-sm text-neutral-500">
                    {student.badge || student.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">{student.name}</h4>
                    <p className="text-[10px] text-neutral-400">
                      {student.university} • {student.tests} ta test topshirgan
                    </p>
                  </div>
                </div>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {student.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
