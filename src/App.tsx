import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentPortal } from './components/StudentPortal';
import { AIServices } from './components/AIServices';
import { StudyMaterials } from './components/StudyMaterials';
import { TestPlatform } from './components/TestPlatform';
import { StudentJobs } from './components/StudentJobs';
import { StudentHousing } from './components/StudentHousing';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginGate } from './components/AdminLoginGate';
import { AuthModal } from './components/AuthModal';
import { BalanceModal } from './components/BalanceModal';
import { SearchModal } from './components/SearchModal';

import {
  AIOrder,
  AIServiceConfig,
  HousingListing,
  JobListing,
  Language,
  NotificationItem,
  PlatformStats,
  QuizResult,
  QuizTest,
  ScheduleItem,
  StudentTask,
  StudyMaterial,
  Transaction,
  User,
} from './types';

import {
  initialAIServices,
  initialHousing,
  initialJobs,
  initialMaterials,
  initialNotifications,
  initialSchedule,
  initialStats,
  initialTasks,
  initialTests,
  initialTransactions,
  initialUsers,
  superAdminUser,
} from './data/initialData';
import { translations } from './i18n/translations';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('studyhub_theme') as 'light' | 'dark') || 'light';
  });

  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('studyhub_lang') as Language) || 'uz';
  });

  // Current tab
  const [currentTab, setCurrentTab] = useState<string>('portal');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // User State: default to student user, Super Admin is restricted exclusively to shovqiddin45@gmail.com
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('studyhub_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Xavfsizlik: Super Admin maqomi faqat shovqiddin45@gmail.com uchun ruxsat etiladi
        if (parsed.role === 'superadmin' && parsed.email !== 'shovqiddin45@gmail.com') {
          parsed.role = 'student';
        }
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    return initialUsers[0]; // Student "Temur Aliyev"
  });

  // Platform Data states
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tasks, setTasks] = useState<StudentTask[]>(initialTasks);
  const [schedule] = useState<ScheduleItem[]>(initialSchedule);
  const [materials, setMaterials] = useState<StudyMaterial[]>(initialMaterials);
  const [tests, setTests] = useState<QuizTest[]>(initialTests);
  const [resultsHistory, setResultsHistory] = useState<QuizResult[]>([
    {
      id: 'res-1',
      testId: 'test-1',
      testTitle: 'Python asoslari: 1-oraliq nazorat testi',
      userId: '84920153',
      score: 85,
      totalQuestions: 10,
      correctAnswers: 8,
      completedAt: '2025-09-12 16:30',
    },
  ]);
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [housingListings, setHousingListings] = useState<HousingListing[]>(initialHousing);
  const [aiServices, setAiServices] = useState<AIServiceConfig[]>(initialAIServices);
  const [aiOrders, setAiOrders] = useState<AIOrder[]>([
    {
      id: 'ord-ai-1',
      userId: '84920153',
      serviceId: 'presentation',
      serviceName: 'Prezentatsiya / Slayd yaratish',
      topic: 'Sun’iy intellektning tibbiyotdagi o‘rni',
      instructions: '8 ta slayd, zamonaviy tahlillar bilan',
      targetLanguage: "O'zbekcha",
      options: { slideCount: 8 },
      price: 15000,
      status: 'completed',
      result: `# Slayd 1: Sun’iy intellektning tibbiyotdagi o‘rni\nMuallif: StudyHub AI Akademik generatori\n\n# Slayd 2: Kirish va dolzarblik\n- Tibbiy ma'lumotlar hajmining ortishi\n- Tashxis qo'yishda yuqori aniqlik zarurati\n\n# Slayd 3: Tibbiy tasvirlarni tahlil qilish (Medical Imaging)\n- MRT, KT va rentgen suratlarini o'qishda kompyuter ko'rish\n- Erta bosqichdagi patologiyalarni aniqlash samaradorligi 96% dan yuqori\n\n# Slayd 4: Virtual assistentlar va bemorlar triaji\n- Bemorlarning dastlabki shikoyatlarini qabul qilish\n- 24/7 rejimda tezkor maslahat berish\n\n# Slayd 5: Xulosa\n- AI shifokor o'rnini egallamaydi, balki uning eng kuchli yordamchisiga aylanadi.`,
      createdAt: '2025-09-13 14:15',
    },
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [stats, setStats] = useState<PlatformStats>(initialStats);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [telegramPaymentAddress, setTelegramPaymentAddress] = useState('@studyhub_billing');
  const [aiPreselectedService, setAiPreselectedService] = useState<string | undefined>('presentation');
  const [aiPreselectedTopic, setAiPreselectedTopic] = useState<string | undefined>('');

  // Keyboard shortcut for Cmd+K / Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studyhub_theme', theme);
  }, [theme]);

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('studyhub_lang', language);
  }, [language]);

  // Sync user with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('studyhub_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('studyhub_user');
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleLogoutAllDevices = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, activeDevicesCount: 1 });
      alert('Barcha boshqa sessiyalar va qurilmalardan muvaffaqiyatli chiqildi!');
    }
  };

  // Student Task Handlers
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (taskData: Omit<StudentTask, 'id'>) => {
    const newTask: StudentTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Deposit Request via Telegram / Payment
  const handleRequestDeposit = (
    amount: number,
    paymentMethod: 'telegram' | 'payme' | 'click',
    notes: string
  ) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount,
      currency: 'UZS',
      type: 'deposit',
      serviceName: "Balans to'ldirish (Telegram orqali)",
      status: 'pending',
      paymentMethod,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: notes || `Telegram orqali to'lov yuborildi: ${telegramPaymentAddress}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Notify Super Admin / Admins
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: '84920153',
      title: "Yangi to'lov so'rovi",
      message: `${currentUser.name} (ID: ${currentUser.id}) tomonidan ${amount.toLocaleString()} UZS to'lov qilindi. Tasdiqlash kutilmoqda.`,
      date: 'Hozirgina',
      read: false,
      type: 'payment',
      actionTab: 'admin',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Super Admin: Approve Transaction
  const handleApproveTransaction = (txId: string) => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx) return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'completed' } : t))
    );

    // Automatically increase user's balance
    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetTx.userId ? { ...u, balance: u.balance + targetTx.amount } : u
      )
    );

    if (currentUser && currentUser.id === targetTx.userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, balance: prev.balance + targetTx.amount } : prev
      );
    }

    // Add user notification
    const userNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: targetTx.userId,
      title: "To'lov tasdiqlandi!",
      message: `Sizning ${targetTx.orderNumber} raqamli to'lovingiz admin tomonidan tasdiqlandi. Balansingizga ${targetTx.amount.toLocaleString()} UZS qo'shildi.`,
      date: 'Hozirgina',
      read: false,
      type: 'payment',
      actionTab: 'portal',
    };
    setNotifications((prev) => [userNotif, ...prev]);

    setStats((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + targetTx.amount,
    }));
  };

  // Super Admin: Reject Transaction
  const handleRejectTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected' } : t))
    );
  };

  // Super Admin: User block / unblock
  const handleToggleUserBlock = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, isBlocked: !prev.isBlocked } : prev));
    }
  };

  // Super Admin: Adjust user balance
  const handleAdjustUserBalance = (userId: string, deltaAmount: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, balance: Math.max(0, u.balance + deltaAmount) } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, balance: Math.max(0, prev.balance + deltaAmount) } : prev
      );
    }
  };

  // Super Admin: Direct Deposit or Withdrawal for any user
  const handleAdminDirectDeposit = (
    userId: string,
    amount: number,
    isDeposit: boolean,
    paymentMethod: 'payme' | 'click' | 'telegram' | 'admin_bonus' | 'internal_balance',
    note: string
  ) => {
    const delta = isDeposit ? Math.abs(amount) : -Math.abs(amount);
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    // 1. Update user's balance
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, balance: Math.max(0, u.balance + delta) } : u
      )
    );

    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, balance: Math.max(0, prev.balance + delta) } : prev
      );
    }

    // 2. Create completed transaction record
    const newTx: Transaction = {
      id: `TX-ADM-${Date.now()}`,
      orderNumber: `ORD-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: targetUser.id,
      userName: targetUser.name,
      type: isDeposit ? 'deposit' : 'expense',
      serviceName: isDeposit
        ? `Admin tomonidan hisob to‘ldirildi (${note || "To'lov qabul qilindi"})`
        : `Admin tomonidan hisobdan yechildi (${note || 'Tuzatish'})`,
      amount: Math.abs(amount),
      status: 'completed',
      paymentMethod,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: note,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // 3. Add notification for target user
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: targetUser.id,
      title: isDeposit ? "Hisobingiz to‘ldirildi!" : "Hisobingizdan mablag‘ yechildi",
      message: isDeposit
        ? `Admin (shovqiddin45@gmail.com) tomonidan balansingizga ${Math.abs(amount).toLocaleString()} UZS qo‘shildi. ${note ? `Izoh: ${note}` : ''}`
        : `Admin tomonidan balansingizdan ${Math.abs(amount).toLocaleString()} UZS yechildi. ${note ? `Izoh: ${note}` : ''}`,
      date: 'Hozirgina',
      read: false,
      type: 'payment',
      actionTab: 'portal',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // 4. Update total revenue stat if deposit
    if (isDeposit) {
      setStats((prev) => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.abs(amount),
      }));
    }
  };

  // Super Admin: Assign admin role
  const handleAssignAdminRole = (
    userId: string,
    role: 'admin' | 'student',
    department?: any
  ) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role, adminDepartment: department } : u
      )
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, role, adminDepartment: department } : prev
      );
    }
  };

  // Super Admin: Update AI Service Price
  const handleUpdateAIServicePrice = (serviceId: string, newPrice: number) => {
    setAiServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, price: newPrice } : s))
    );
  };

  // AI Order Placement
  const handlePlaceAIOrder = async (orderData: {
    serviceId: string;
    serviceName: string;
    topic: string;
    instructions: string;
    targetLanguage: string;
    options: Record<string, any>;
    price: number;
  }): Promise<AIOrder | null> => {
    if (!currentUser) return null;

    // Deduct user balance
    const newBalance = currentUser.balance - orderData.price;
    setCurrentUser((prev) => (prev ? { ...prev, balance: newBalance } : prev));
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, balance: newBalance } : u))
    );

    // Add transaction record
    const newTx: Transaction = {
      id: `tx-ai-${Date.now()}`,
      userId: currentUser.id,
      orderNumber: `ORD-AI-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: orderData.price,
      currency: 'UZS',
      type: 'expense',
      serviceName: `AI: ${orderData.serviceName}`,
      paymentMethod: 'internal_balance',
      status: 'completed',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: orderData.topic,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Construct prompt for Gemini
    const prompt = `Siz StudyHub platformasining O'zbekiston talabalari uchun ixtisoslashgan yuqori darajadagi AI ta'lim yordamchisisiz.
Xizmat turi: ${orderData.serviceName}
Mavzu / Topshiriq: ${orderData.topic}
Qo'shimcha ko'rsatma: ${orderData.instructions || "Batafsil, akademik va to'liq yoritilsin"}
Til: ${orderData.targetLanguage}
Parametrlar: ${JSON.stringify(orderData.options)}

Iltimos, ushbu topshiriqni talaba darajasida, aniq sarlavhalar, bo'limlar, tahliliy fikrlar va kerakli manbalar bilan mukammal qilib yozib bering.`;

    let generatedResult = '';

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          serviceType: orderData.serviceId,
          topic: orderData.topic,
          instructions: orderData.instructions,
          language: orderData.targetLanguage,
          options: orderData.options,
        }),
      });

      const data = await response.json();
      generatedResult = data.result || 'Generatsiya yakunlandi.';
    } catch (e) {
      generatedResult = `Mavzu: ${orderData.topic}\n\n1. Kirish\nUshbu mavzu zamonaviy ta'lim va amaliyotda katta ahamiyatga ega bo'lib, o'quv dasturining muhim qismini tashkil etadi.\n\n2. Asosiy mazmun va tahlil\n- Nazariy asoslar va tushunchalar\n- Amaliy misollar va tahliliy yondashuv\n- Natijalar va solishtirish\n\n3. Xulosa va tavsiyalar\nO'rganilgan ma'lumotlar shuni ko'rsatadiki, qo'yilgan maqsad to'liq yoritildi.\n\nFoydalanilgan adabiyotlar:\n1. O'quv qo'llanma, Toshkent, 2024.\n2. Zamonaviy akademik maqolalar to'plami.`;
    }

    const createdOrder: AIOrder = {
      id: `ord-ai-${Date.now()}`,
      userId: currentUser.id,
      serviceId: orderData.serviceId,
      serviceName: orderData.serviceName,
      topic: orderData.topic,
      instructions: orderData.instructions,
      targetLanguage: orderData.targetLanguage,
      options: orderData.options,
      price: orderData.price,
      status: 'completed',
      result: generatedResult,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setAiOrders((prev) => [createdOrder, ...prev]);
    setStats((prev) => ({
      ...prev,
      aiOrdersCount: prev.aiOrdersCount + 1,
    }));

    return createdOrder;
  };

  // Study Materials Upload
  const handleUploadMaterial = (
    matData: Omit<StudyMaterial, 'id' | 'views' | 'downloads' | 'rating' | 'createdAt'>
  ) => {
    const newMat: StudyMaterial = {
      ...matData,
      id: `mat-${Date.now()}`,
      views: 1,
      downloads: 0,
      rating: 5.0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMaterials((prev) => [newMat, ...prev]);
    setStats((prev) => ({ ...prev, materialsCount: prev.materialsCount + 1 }));
  };

  // Quiz Test Completed
  const handleCompleteQuiz = (result: Omit<QuizResult, 'id' | 'completedAt'>) => {
    const newRes: QuizResult = {
      ...result,
      id: `res-${Date.now()}`,
      completedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setResultsHistory((prev) => [newRes, ...prev]);
    setStats((prev) => ({ ...prev, testsTakenCount: prev.testsTakenCount + 1 }));
  };

  // Post new job
  const handleAddJob = (jobData: Omit<JobListing, 'id' | 'createdAt'>) => {
    const newJob: JobListing = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setJobs((prev) => [newJob, ...prev]);
  };

  // Post new housing
  const handleAddHousing = (hData: Omit<HousingListing, 'id' | 'createdAt'>) => {
    const newHouse: HousingListing = {
      ...hData,
      id: `house-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setHousingListings((prev) => [newHouse, ...prev]);
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Universal Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenBalance={() => setBalanceModalOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'portal' && (
          <StudentPortal
            language={language}
            currentUser={currentUser}
            onOpenAIServices={(serviceId, prefillTopic) => {
              if (serviceId) setAiPreselectedService(serviceId);
              if (prefillTopic) setAiPreselectedTopic(prefillTopic);
              setCurrentTab('ai');
            }}
            onOpenMaterials={() => setCurrentTab('materials')}
            onOpenBalance={() => setBalanceModalOpen(true)}
          />
        )}

        {currentTab === 'ai' && (
          <AIServices
            language={language}
            currentUser={currentUser}
            aiServices={aiServices}
            aiOrders={aiOrders}
            initialServiceId={aiPreselectedService}
            initialTopic={aiPreselectedTopic}
            onPlaceOrder={handlePlaceAIOrder}
            onOpenBalance={() => setBalanceModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'materials' && (
          <StudyMaterials
            language={language}
            currentUser={currentUser}
            materials={materials}
            onUploadMaterial={handleUploadMaterial}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'tests' && (
          <TestPlatform
            language={language}
            currentUser={currentUser}
            tests={tests}
            resultsHistory={resultsHistory}
            onCompleteQuiz={handleCompleteQuiz}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'jobs' && (
          <StudentJobs
            language={language}
            currentUser={currentUser}
            jobs={jobs}
            onAddJob={handleAddJob}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'housing' && (
          <StudentHousing
            language={language}
            currentUser={currentUser}
            housingListings={housingListings}
            onAddHousing={handleAddHousing}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'admin' && (
          currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'admin') ? (
            <AdminPanel
              language={language}
              currentUser={currentUser}
              stats={stats}
              users={users}
              transactions={transactions}
              aiServices={aiServices}
              aiOrders={aiOrders}
              telegramPaymentAddress={telegramPaymentAddress}
              onUpdateTelegramAddress={(newAddr) => setTelegramPaymentAddress(newAddr)}
              onApproveTransaction={handleApproveTransaction}
              onRejectTransaction={handleRejectTransaction}
              onToggleUserBlock={handleToggleUserBlock}
              onAdjustUserBalance={handleAdjustUserBalance}
              onAdminDirectDeposit={handleAdminDirectDeposit}
              onUpdateAIServicePrice={handleUpdateAIServicePrice}
              onAssignAdminRole={handleAssignAdminRole}
            />
          ) : (
            <AdminLoginGate
              language={language}
              currentUser={currentUser}
              onLoginAsSuperAdmin={(u) => setCurrentUser(u)}
              onBackToPortal={() => setCurrentTab('portal')}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-white">StudyHub</span>
            <span>• O‘zbekiston talabalari uchun yagona ekotizim</span>
          </div>
          <div className="flex items-center gap-4">
            <span>To‘lovlar va aloqa: {telegramPaymentAddress}</span>
            <span>Super Admin: shovqiddin45@gmail.com</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        language={language}
        currentUser={currentUser}
        onLoginSuccess={(u) => setCurrentUser(u)}
        onLogoutAllDevices={handleLogoutAllDevices}
      />

      <BalanceModal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        language={language}
        currentUser={currentUser}
        transactions={transactions}
        telegramPaymentAddress={telegramPaymentAddress}
        onRequestDeposit={handleRequestDeposit}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        language={language}
        materials={materials}
        tests={tests}
        aiServices={aiServices}
        jobs={jobs}
        housing={housingListings}
        onSelectResult={(tab) => {
          setCurrentTab(tab);
        }}
      />
    </div>
  );
}
